import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../components/UserContext';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
} from '@mui/material';
import Navbar from '../components/Navbar';

const ProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const { isAuthenticated } = useUser();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      navigate('/register');
      return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/register');
          return;
        }

        const [profileResponse, leaderboardResponse] = await Promise.all([
          fetch(`/api/profile/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/leaderboard', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!profileResponse.ok || !leaderboardResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const profileData = await profileResponse.json();
        const leaderboardData = await leaderboardResponse.json();
        setStats(profileData);
        setLeaderboard(leaderboardData);
      } catch (err) {
        setError('Error loading profile data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, userId, navigate]);

  const handleDeleteQuiz = async (quizId: string) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/register');
        return;
      }

      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setStats((prev: any) => ({
          ...prev,
          quizzes: prev.quizzes.filter((q: any) => q._id !== quizId),
        }));
      } else {
        throw new Error('Failed to delete quiz');
      }
    } catch (err) {
      setError('Error deleting quiz');
      console.error(err);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!stats) return null;

  return (
    <div>
    <Navbar/>
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>Profile: {stats.username}</Typography>

      <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Statistics</Typography>
            <Typography>Total Quizzes Taken: {stats.quizzesTaken}</Typography>
            <Typography>Total Score: {stats.totalScore}</Typography>
            <Typography>Average Score: {stats.averageScore.toFixed(2)}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Leaderboard</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Rank</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Score</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaderboard.map((user, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.totalScore}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      </Box>

      <Typography variant="h6">Your Quizzes</Typography>
      {stats.quizzes && stats.quizzes.length > 0 ? (
        <Box sx={{ mt: 2 }}>
          {stats.quizzes.map((quiz: any) => (
            <Paper key={quiz._id} sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography>{quiz.title}</Typography>
                <Typography variant="caption">Created: {new Date(quiz.createdAt).toLocaleDateString()}</Typography>
              </Box>
              <Box>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate(`/quiz/${quiz._id}`, { state: { quiz } })}
                  sx={{ mr: 1 }}
                >
                  View
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleDeleteQuiz(quiz._id)}
                >
                  Delete
                </Button>
              </Box>
            </Paper>
          ))}
        </Box>
      ) : (
        <Typography sx={{ mt: 2 }}>No quizzes saved yet.</Typography>
      )}
    </Box>
    </div>
  );
};

export default ProfilePage;