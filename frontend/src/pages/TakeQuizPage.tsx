import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';

interface Quiz {
  _id: string;
  title: string;
  questions: { text: string }[];
}

const TakeQuizPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [scores, setScores] = useState<{ [key: string]: number }>({});
  const userId = localStorage.getItem('userId'); // Assuming userId is stored here

  useEffect(() => {
    fetch(`/api/quizzes/${id}`)
      .then((res) => res.json())
      .then((data) => setQuiz(data));
  }, [id]);

  const handleSubmit = () => {
    if (userId) {
      setScores((prev) => ({ ...prev, [userId]: 0 })); // Initialize score if userId exists
    }
    navigate('/');
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      {quiz && <Typography variant="h4">{quiz.title}</Typography>}
      <Button onClick={handleSubmit}>Submit</Button>
      {userId && <Typography>Score: {scores[userId] || 0} / {quiz?.questions.length || 0}</Typography>}
    </Box>
  );
};

export default TakeQuizPage;