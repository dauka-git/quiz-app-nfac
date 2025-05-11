import React, { useState, useContext } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
} from '@mui/material';
import { useUser } from '../components/UserContext';
import { Question, Quiz } from '../interfaces';
import Navbar from '../components/Navbar';

interface QuizState {
  quiz: Quiz;
  quizId: string;
}

const QuizParticipationPage: React.FC = () => {
  const { userId } = useUser();
  const { quizId } = useParams<{ quizId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { quiz } = (location.state as QuizState) || { quiz: { title: '', questions: [], createdBy: '' }, quizId: '' };
  const [answers, setAnswers] = useState<(string | number | number[] | boolean)[]>(Array(quiz.questions.length).fill(null));
  const [error, setError] = useState('');
  const [score, setScore] = useState<number | null>(null);

  const handleAnswerChange = (index: number, value: string | number | number[] | boolean) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (answers.some((answer) => answer === null)) {
      setError('Please answer all questions');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token missing. Please log in again.');
        return;
      }

      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quizId, answers }),
      });

      const data = await response.json();
      if (response.ok) {
        setScore(data.score);
        setError('');
        console.log('Quiz submitted:', data);
      } else {
        setError(data.error || 'Failed to submit quiz');
      }
    } catch (err) {
      console.error('Submit quiz error:', err);
      setError('Failed to submit quiz');
    }
  };

  const renderQuestion = (question: Question, index: number) => {
    switch (question.type) {
      case 'multiple_choice':
        if (!Array.isArray(question.options)) {
          console.error('Invalid options for multiple_choice question:', question);
          return (
            <Box key={index} sx={{ mb: 3 }}>
              <Typography variant="h6">{`${index + 1}. ${question.text}`}</Typography>
              <Typography color="error">Invalid options data</Typography>
            </Box>
          );
        }
        return (
          <Box key={index} sx={{ mb: 3 }}>
            <Typography variant="h6">{`${index + 1}. ${question.text}`}</Typography>
            <FormControl component="fieldset">
              <FormLabel component="legend">{question.subtype === 'single' ? 'Select one:' : 'Select all that apply:'}</FormLabel>
              {question.subtype === 'single' ? (
                <RadioGroup
                  value={answers[index] ?? ''}
                  onChange={(e) => handleAnswerChange(index, Number(e.target.value))}
                >
                  {question.options.map((option, i) => (
                    <FormControlLabel key={i} value={i} control={<Radio />} label={option} />
                  ))}
                </RadioGroup>
              ) : (
                question.options.map((option, i) => (
                  <FormControlLabel
                    key={i}
                    control={
                      <Checkbox
                        checked={Array.isArray(answers[index]) && (answers[index] as number[]).includes(i)}
                        onChange={(e) => {
                          const current = (answers[index] as number[]) || [];
                          const newValue = e.target.checked
                            ? [...current, i]
                            : current.filter((v) => v !== i);
                          handleAnswerChange(index, newValue);
                        }}
                      />
                    }
                    label={option}
                  />
                ))
              )}
            </FormControl>
          </Box>
        );
      case 'true_false':
        return (
          <Box key={index} sx={{ mb: 3 }}>
            <Typography variant="h6">{`${index + 1}. ${question.text}`}</Typography>
            <RadioGroup
              value={answers[index] === null ? '' : answers[index].toString()}
              onChange={(e) => handleAnswerChange(index, e.target.value === 'true')}
            >
              <FormControlLabel value="true" control={<Radio />} label="True" />
              <FormControlLabel value="false" control={<Radio />} label="False" />
            </RadioGroup>
          </Box>
        );
      case 'short_answer':
        return (
          <Box key={index} sx={{ mb: 3 }}>
            <Typography variant="h6">{`${index + 1}. ${question.text}`}</Typography>
            <TextField
              fullWidth
              variant="outlined"
              value={answers[index] ?? ''}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
            />
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
      <Typography variant="h4" gutterBottom>{quiz.title}</Typography>
      {quiz.questions.length === 0 ? (
        <Typography color="error">No quiz data available</Typography>
      ) : (
        <>
          {quiz.questions.map((q, index) => (
            <div key={index}>{renderQuestion(q, index)}</div>
          ))}
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{ mt: 2 }}
            disabled={score !== null}
          >
            Submit Quiz
          </Button>
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
          {score !== null && (
            <Typography variant="h6" sx={{ mt: 2 }}>
              Your Score: {score} / {quiz.questions.length}
            </Typography>
          )}
        </>
      )}
    </Box>
    </div>

  );
};

export default QuizParticipationPage;