import React, { useState } from 'react';
import { Button, TextField, Box } from '@mui/material';

interface Question {
  type: 'multiple_choice' | 'true_false' | 'matching' | 'short_answer';
  text: string;
  options?: string[];
  matches?: { left: string; right: string }[];
  correctAnswer: any;
}

const QuizForm: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([
    { type: 'multiple_choice', text: '', options: ['', '', '', ''], correctAnswer: 0 },
  ]);

  const addQuestion = () => {
    const newQuestion: Question = { type: 'multiple_choice', text: '', options: ['', '', '', ''], correctAnswer: 0 };
    setQuestions([...questions, newQuestion]);
  };

  return (
    <Box>
      {questions.map((q, index) => (
        <div key={index}>
          <TextField label={`Question ${index + 1}`} value={q.text} onChange={(e) => {/* handle change */}} />
          <Button onClick={addQuestion}>Add Question</Button>
        </div>
      ))}
    </Box>
  );
};

export default QuizForm;