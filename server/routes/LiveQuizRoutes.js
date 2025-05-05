// server/routes/LiveQuizRoutes.js
const express = require('express');
const router = express.Router();
const { Quiz, User, LiveQuizSession } = require('../models/QuizModel');
const authMiddleware = require('./authMiddleware');

router.post('/live/create', authMiddleware, async (req, res) => {
  try {
    const { quizId, timePerQuestion } = req.body;
    const userId = req.user._id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    const session = new LiveQuizSession({
      quizId,
      hostId: userId,
      settings: {
        timePerQuestion: timePerQuestion || 30,
      },
    });

    await session.save();
    res.status(201).json(session);
  } catch (err) {
    console.error('Create live session error:', err);
    res.status(500).json({ error: 'Failed to create live session' });
  }
});

router.post('/live/join/:sessionId', authMiddleware, async (req, res) => {
  try {
    const session = await LiveQuizSession.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.status !== 'waiting') return res.status(400).json({ error: 'Session already started' });

    const existingParticipant = session.participants.find((p) => p.userId.equals(req.user._id));
    if (existingParticipant) return res.status(400).json({ error: 'Already joined' });

    session.participants.push({
      userId: req.user._id,
      socketId: req.body.socketId,
    });

    await session.save();

    // Emit update to all participants
    const io = req.app.get('io');
    io.to(`session_${session._id}`).emit('sessionUpdate', session);

    res.json(session);
  } catch (err) {
    console.error('Join live session error:', err);
    res.status(500).json({ error: 'Failed to join session' });
  }
});

router.post('/live/start/:sessionId', authMiddleware, async (req, res) => {
  try {
    const session = await LiveQuizSession.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (!session.hostId.equals(req.user._id)) return res.status(403).json({ error: 'Only host can start' });
    if (session.status !== 'waiting') return res.status(400).json({ error: 'Session already started' });

    session.status = 'in_progress';
    session.currentQuestion = 0;
    session.questionStartTime = new Date();
    await session.save();

    // Emit update to all participants
    const io = req.app.get('io');
    io.to(`session_${session._id}`).emit('sessionUpdate', session);

    res.json(session);
  } catch (err) {
    console.error('Start live session error:', err);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

router.post('/live/answer/:sessionId', authMiddleware, async (req, res) => {
  try {
    const { questionIndex, answer } = req.body;
    const session = await LiveQuizSession.findById(req.params.sessionId);

    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.status !== 'in_progress') return res.status(400).json({ error: 'Session not in progress' });
    if (session.currentQuestion !== questionIndex) return res.status(400).json({ error: 'Not the current question' });

    const participant = session.participants.find((p) => p.userId.equals(req.user._id));
    if (!participant) return res.status(403).json({ error: 'Not a participant' });

    const timeTaken = (new Date() - session.questionStartTime) / 1000;
    if (timeTaken > session.settings.timePerQuestion) return res.status(400).json({ error: 'Time expired' });

    participant.answers.push({
      questionIndex,
      answer,
      timeTaken,
    });

    await session.save();

    // Emit update to all participants
    const io = req.app.get('io');
    io.to(`session_${session._id}`).emit('sessionUpdate', session);

    res.json({ success: true });
  } catch (err) {
    console.error('Submit live answer error:', err);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

router.get('/live/status/:sessionId', authMiddleware, async (req, res) => {
  try {
    const session = await LiveQuizSession.findById(req.params.sessionId)
      .populate('quizId')
      .populate('participants.userId', 'username');

    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (err) {
    console.error('Fetch live session status error:', err);
    res.status(500).json({ error: 'Failed to get session status' });
  }
});

module.exports = router;