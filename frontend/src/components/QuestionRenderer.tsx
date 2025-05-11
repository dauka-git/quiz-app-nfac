import React from 'react';

interface Question {
  type: 'multiple_choice' | 'true_false' | 'matching' | 'short_answer';
  text: string;
  options?: string[];
  matches?: { left: string; right: string }[];
  correctAnswer: any;
}

const QuestionRenderer: React.FC<{ question: Question }> = ({ question }) => {
  switch (question.type) {
    case 'multiple_choice':
      return (
        <div>
          <p>{question.text}</p>
          {question.options?.map((option, index) => (
            <div key={index}>{option}</div>
          ))}
        </div>
      );
    case 'matching':
      return (
        <div>
          <p>{question.text}</p>
          {question.matches?.map((m, index) => (
            <div key={index}>
              {m.left} - {m.right}
            </div>
          ))}
        </div>
      );
    case 'true_false':
      return <div>{question.text}</div>;
    case 'short_answer':
      return <div>{question.text}</div>;
    default:
      return null;
  }
};

export default QuestionRenderer;