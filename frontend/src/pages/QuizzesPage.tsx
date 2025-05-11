import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, List, ListItem, ListItemText } from '@mui/material';

interface Quiz {
  _id: string;
  title: string;
  createdBy: { username: string } | string;
  tags: string[];
  createdAt: string;
}

const QuizzesPage = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [searchTags, setSearchTags] = useState('');

  useEffect(() => {
    fetchPublicQuizzes();
  }, []);

  const fetchPublicQuizzes = async (tags?: string) => {
    try {
      const url = `/api/public-quizzes${tags ? `?tags=${tags}` : ''}`;
      console.log('Fetching from:', url);
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setQuizzes(data);
    } catch (err) {
      console.error('Fetch quizzes error:', err);
    }
  };

  const handleSearch = () => {
    fetchPublicQuizzes(searchTags);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>Public Quizzes</Typography>
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Search by Tags (comma-separated)"
          value={searchTags}
          onChange={(e) => setSearchTags(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button onClick={handleSearch} variant="contained" sx={{ mt: 1 }}>
          Search
        </Button>
      </Box>
      <List>
        {quizzes.map((quiz) => (
          <ListItem key={quiz._id} button onClick={() => navigate(`/quiz/${quiz._id}`)}>
            <ListItemText
              primary={quiz.title}
              secondary={`Created by: ${typeof quiz.createdBy === 'object' ? quiz.createdBy.username : 'Unknown'} | Tags: ${quiz.tags.join(', ')} | Created: ${new Date(quiz.createdAt).toLocaleDateString()}`}
            />
          </ListItem>
        ))}
      </List>
      {quizzes.length === 0 && <Typography>No public quizzes found.</Typography>}
    </Box>
  );
};

export default QuizzesPage;