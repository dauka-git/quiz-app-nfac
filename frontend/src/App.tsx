import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import CreateQuizPage from './pages/CreateQuizPage';
import QuizParticipationPage from './pages/QuizParticipationPage';
import ProfilePage from './pages/ProfilePage';
import { UserProvider } from './components/UserContext';
import HomePage from './pages/HomePage';
import QuizzesPage from './pages/QuizzesPage';

const App: React.FC = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/create" element={<CreateQuizPage />} />
          <Route path="/quizzes" element={<QuizzesPage />} />

          <Route path="/quiz/:quizId" element={<QuizParticipationPage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/" element={<HomePage />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;