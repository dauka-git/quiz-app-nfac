import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Radio,
  FormControl,
  FormLabel,
  RadioGroup,
} from '@mui/material';
import { useUser } from '../components/UserContext';
import { Question, Quiz } from '../interfaces';
import Navbar from '../components/Navbar';

const CreateQuizPage: React.FC = () => {
  const { isAuthenticated, userId } = useUser();
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    console.log('CreateQuizPage: Checking authentication', { isAuthenticated, userId });
    if (!isAuthenticated || !userId) {
      console.log('Not authenticated, redirecting to /register');
      navigate('/register');
    }
  }, [isAuthenticated, userId, navigate]);

  const handleGenerateQuiz = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError('');
    console.log('Sending request to /api/generate-quiz with topic:', topic, 'userId:', userId);
    try {
      const token = localStorage.getItem('token');
      console.log('CreateQuizPage: Token check', { token: token ? '****' : 'MISSING' });
      if (!token) {
        setError('Authentication token missing. Please log in again.');
        return;
      }

      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ topic }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        setQuiz(data.quiz);
        setQuizId(data.quizId);
        setIsAdded(false);
      } else {
        setError(data.error || 'Failed to generate quiz');
      }
    } catch (err) {
      console.error('Generate quiz error:', err);
      setError('Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuiz = async () => {
    if (!quiz || !quizId) {
      setError('No quiz to add');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token missing. Please log in again.');
        return;
      }

      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: quiz.title,
          questions: quiz.questions,
          createdBy: userId,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setIsAdded(true);
        setError('');
        console.log('Quiz added to profile:', data);
      } else {
        setError(data.error || 'Failed to add quiz');
      }
    } catch (err) {
      console.error('Add quiz error:', err);
      setError('Failed to add quiz');
    }
  };

  const handleProceed = () => {
    if (!quiz || !quizId) {
      setError('No quiz to proceed with');
      return;
    }
    navigate(`/quiz/${quizId}`, { state: { quiz, quizId } });
  };

  const renderQuestion = (question: Question, index: number) => {
    switch (question.type) {
      case 'multiple_choice':
        if (!Array.isArray(question.options)) {
          console.error('Invalid options for multiple_choice question:', question);
          return (
            <Box key={index} sx={{ mb: 2 }}>
              <Typography variant="h6">{`${index + 1}. ${question.text}`}</Typography>
              <Typography color="error">Invalid options data</Typography>
            </Box>
          );
        }
        return (
          <Box key={index} sx={{ mb: 2 }}>
            <Typography variant="h6">{`${index + 1}. ${question.text}`}</Typography>
            <FormControl component="fieldset">
              <FormLabel component="legend">{question.subtype === 'single' ? 'Select one:' : 'Select all that apply:'}</FormLabel>
              {question.subtype === 'single' ? (
                <RadioGroup>
                  {question.options.map((option, i) => (
                    <FormControlLabel key={i} value={i} control={<Radio disabled />} label={option} />
                  ))}
                </RadioGroup>
              ) : (
                question.options.map((option, i) => (
                  <FormControlLabel key={i} control={<Checkbox disabled />} label={option} />
                ))
              )}
            </FormControl>
          </Box>
        );
      case 'true_false':
        return (
          <Box key={index} sx={{ mb: 2 }}>
            <Typography variant="h6">{`${index + 1}. ${question.text}`}</Typography>
            <RadioGroup>
              <FormControlLabel value="true" control={<Radio disabled />} label="True" />
              <FormControlLabel value="false" control={<Radio disabled />} label="False" />
            </RadioGroup>
          </Box>
        );
      case 'short_answer':
        return (
          <Box key={index} sx={{ mb: 2 }}>
            <Typography variant="h6">{`${index + 1}. ${question.text}`}</Typography>
            <TextField disabled fullWidth variant="outlined" placeholder="Enter answer" />
          </Box>
        );
      default:
        console.error('Unknown question type:', question);
        return null;
    }
  };

  return (
    <div>
      <Navbar/>
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>Create a Quiz</Typography>
      <TextField
        fullWidth
        label="Enter quiz topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        onClick={handleGenerateQuiz}
        disabled={loading}
        sx={{ mb: 2, mr: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Generate Quiz'}
      </Button>
      {quiz && (
        <>
          <Button
            variant="contained"
            onClick={handleAddQuiz}
            disabled={isAdded || loading}
            sx={{ mb: 2, mr: 2 }}
          >
            {isAdded ? 'Quiz Added' : 'Add Quiz to Profile'}
          </Button>
          <Button
            variant="contained"
            onClick={handleProceed}
            disabled={loading}
            sx={{ mb: 2 }}
          >
            Proceed to Participate
          </Button>
        </>
      )}
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      {quiz && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h5">{quiz.title}</Typography>
          {quiz.questions.map((q, index) => (
            <div key={index}>{renderQuestion(q, index)}</div>
          ))}
        </Box>
      )}
    </Box>
    </div>

  );
};

export default CreateQuizPage;