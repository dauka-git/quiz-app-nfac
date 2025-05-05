// server/routes/QuizRoutes.js
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Quiz, User, Log } = require('../models/QuizModel');
const authMiddleware = require('./authMiddleware');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Mount LiveQuizRoutes
const liveQuizRouter = require('./LiveQuizRoutes');
router.use('/live', liveQuizRouter);

// Generate quiz using Gemini
router.post('/generate-quiz', authMiddleware, async (req, res) => {
  console.log('Received /generate-quiz request:', req.body);
  const { topic } = req.body;
  const userId = req.user._id;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  try {
    console.log('Initializing Gemini API with key:', process.env.GEMINI_API_KEY ? '****' : 'MISSING');
    const quizContent = await generateQuizWithGemini(topic);
    console.log('Parsed Gemini response:', quizContent);
    const parsedQuiz = parseGeminiResponse(quizContent, userId, topic);
    console.log('Saving quiz to MongoDB:', parsedQuiz);
    const newQuiz = new Quiz(parsedQuiz);
    await newQuiz.save();
    console.log('Quiz saved successfully:', newQuiz._id);

    await Log.create({
      userId,
      action: 'quiz_created',
      details: { quizId: newQuiz._id, topic },
    });

    res.status(201).json({ quiz: parsedQuiz, quizId: newQuiz._id });
  } catch (error) {
    console.error('Generate quiz error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to generate quiz', details: error.message });
  }
});

// Create a quiz
router.post('/quizzes', authMiddleware, async (req, res) => {
  try {
    const { title, questions, createdBy } = req.body;
    if (!title || !Array.isArray(questions) || questions.length === 0 || !createdBy) {
      return res.status(400).json({ error: 'Title, questions, and createdBy are required' });
    }

    if (createdBy !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized: createdBy must match authenticated user' });
    }

    const quiz = new Quiz({ title, questions, createdBy });
    await quiz.save();
    await Log.create({ userId: createdBy, action: 'quiz_created', details: { quizId: quiz._id } });
    res.status(201).json(quiz);
  } catch (err) {
    console.error('Quiz creation error:', err);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});

// Get a quiz by ID
router.get('/quizzes/:id', authMiddleware, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('createdBy', 'username');
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    res.json(quiz);
  } catch (err) {
    console.error('Quiz fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

// Submit quiz answers
router.post('/submit', authMiddleware, async (req, res) => {
  try {
    const { quizId, answers } = req.body;
    const userId = req.user._id;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    let score = 0;
    if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
      return res.status(400).json({ error: 'Invalid answers format' });
    }

    quiz.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      switch (question.type) {
        case 'multiple_choice':
          if (question.subtype === 'single') {
            if (userAnswer === question.correctAnswer) score++;
          } else if (question.subtype === 'multiple') {
            if (Array.isArray(userAnswer) && JSON.stringify(userAnswer.sort()) === JSON.stringify(question.correctAnswer.sort())) score++;
          }
          break;
        case 'true_false':
          if (userAnswer === question.correctAnswer) score++;
          break;
        
        case 'short_answer':
          const normalizedUserAnswer = question.caseSensitive ? userAnswer : userAnswer.toLowerCase();
          const normalizedCorrectAnswer = question.caseSensitive ? question.correctAnswer : question.correctAnswer.toLowerCase();
          if (normalizedUserAnswer === normalizedCorrectAnswer) score++;
          break;
      }
    });

    quiz.userScores.push({ userId, score, total: quiz.questions.length, timestamp: new Date().toISOString() });
    await quiz.save();
    await User.findByIdAndUpdate(userId, {
      $inc: { 'statistics.totalQuizzesTaken': 1, 'statistics.totalScore': score },
      $push: { 'statistics.topicsLacking': { topic: 'General', weaknessScore: 100 - (score / quiz.questions.length * 100) } },
    });
    await Log.create({ userId, action: 'score_submitted', details: { quizId, score } });
    res.json({ score, total: quiz.questions.length });
  } catch (err) {
    console.error('Submit error:', err);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

// Get user profile
router.get('/profile/:userId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const quizzesTaken = await Quiz.find({ 'userScores.userId': req.params.userId }).countDocuments();
    const quizzes = await Quiz.find({ createdBy: req.params.userId }).select('_id title createdAt').lean();
    const totalScore = user.statistics.totalScore;
    const averageScore = quizzesTaken ? totalScore / quizzesTaken : 0;
    const topicsLacking = user.statistics.topicsLacking;

    res.json({ username: user.username, quizzesTaken, quizzes, totalScore, averageScore, topicsLacking });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.get('/leaderboard', authMiddleware, async (req, res) => {
  try {
    const topUsers = await User.aggregate([
      { $project: { username: 1, totalScore: '$statistics.totalScore' } },
      { $sort: { totalScore: -1 } },
      { $limit: 10 },
    ]);
    res.json(topUsers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

router.delete('/quizzes/:quizId', authMiddleware, async (req, res) => {
  try {
    const quiz = await Quiz.findOneAndDelete({ _id: req.params.quizId, createdBy: req.user._id });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found or unauthorized' });
    res.json({ message: 'Quiz deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
});

async function generateQuizWithGemini(topic) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: { temperature: 0.9 },
  });

  const prompt = createQuizPrompt(topic);
  console.log('Sending prompt to Gemini:', prompt);
  const result = await model.generateContent(prompt);
  const response = await result.response.text();
  console.log('Received response from Gemini:', response);
  return response;
}

function createQuizPrompt(topic) {
  return `
    Create a quiz with exactly 8 questions on the topic: "${topic}". 
    The quiz must include a variety of question types distributed as follows:
    - 4 multiple choice questions (2 single correct answer, 2 multiple correct answers)
    - 2 true/false questions
    - 2 short answer questions
    
    Format each question as JSON with the following structure:
    {
      "type": "question_type",
      "subtype": "single" or "multiple" (only for multiple_choice, required),
      "text": "question text",
      "options": ["array", "of", "strings"] (for multiple_choice, required, exactly 4 options),
      "matches": [{"left": "item1", "right": "match1"}] (for matching, required, exactly 3 pairs),
      "correctAnswer": "answer" (string for short_answer, boolean for true_false, number for multiple_choice single, number[] for multiple_choice multiple, number[] for matching),
      "caseSensitive": false (for short_answer, required)
    }
    
    Return only the JSON array of questions, nothing else. Ensure:
    - Exactly 8 questions.
    - For multiple_choice, options is an array of 4 strings, correctAnswer is a number (0-3) for single, or number[] (e.g., [0,2]) for multiple.
   
    - For true_false, correctAnswer is true or false.
    - For short_answer, correctAnswer is a string, caseSensitive is false.
    
    Example:
    [
      {
        "type": "multiple_choice",
        "subtype": "single",
        "text": "What is the capital of France?",
        "options": ["London", "Paris", "Berlin", "Madrid"],
        "correctAnswer": 1
      },
  ]
    
    Now create the full quiz about ${topic} with exactly 8 questions following these requirements.
  `;
}

function parseGeminiResponse(responseText, userId, topic) {
  try {
    const cleanedText = responseText.replace(/```json|```/g, '').trim();
    const questions = JSON.parse(cleanedText);

    if (!Array.isArray(questions) || questions.length !== 8) {
      throw new Error('Invalid response: Expected array of 8 questions');
    }

    const cleanedQuestions = questions.map((q, i) => {
      if (!q.type || !q.text) {
        throw new Error(`Invalid question ${i}: Missing type or text`);
      }
      if (q.type === 'multiple_choice') {
        if (!q.subtype || !['single', 'multiple'].includes(q.subtype)) {
          throw new Error(`Invalid multiple_choice question ${i}: Missing or invalid subtype`);
        }
        if (!Array.isArray(q.options) || q.options.length !== 4 || !q.options.every(o => typeof o === 'string')) {
          throw new Error(`Invalid multiple_choice question ${i}: Options must be array of 4 strings`);
        }
        if (q.subtype === 'single' && (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3)) {
          throw new Error(`Invalid multiple_choice single question ${i}: CorrectAnswer must be number 0-3`);
        }
        if (q.subtype === 'multiple' && (!Array.isArray(q.correctAnswer) || !q.correctAnswer.every(a => typeof a === 'number' && a >= 0 && a <= 3))) {
          throw new Error(`Invalid multiple_choice multiple question ${i}: CorrectAnswer must be array of numbers 0-3`);
        }
        return { ...q, caseSensitive: undefined, matches: undefined };
      }
      
      if (q.type === 'true_false') {
        if (typeof q.correctAnswer !== 'boolean') {
          throw new Error(`Invalid true_false question ${i}: CorrectAnswer must be boolean`);
        }
        return { ...q, options: undefined, subtype: undefined, matches: undefined, caseSensitive: undefined };
      }
      if (q.type === 'short_answer') {
        if (typeof q.correctAnswer !== 'string' || q.caseSensitive === undefined) {
          throw new Error(`Invalid short_answer question ${i}: CorrectAnswer must be string, caseSensitive required`);
        }
        return { ...q, options: undefined, subtype: undefined, matches: undefined };
      }
      throw new Error(`Invalid question ${i}: Unknown type ${q.type}`);
    });

    return {
      title: `Generated Quiz: ${topic}`,
      questions: cleanedQuestions,
      createdBy: userId,
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('Parse Gemini response error:', error.message, responseText);
    throw new Error('Failed to parse Gemini response: ' + error.message);
  }
}

module.exports = router;