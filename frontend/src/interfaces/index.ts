// src/interfaces/index.ts
export interface Question {
    type: 'multiple_choice' | 'true_false' | 'matching' | 'short_answer';
    subtype?: 'single' | 'multiple' | null;
    text: string;
    options?: string[];
    matches?: { left: string; right: string }[];
    correctAnswer: number | number[] | boolean | string | number[];
    caseSensitive?: boolean;
  }
  
  export interface Quiz {
    _id?: string;
    title: string;
    questions: Question[];
    createdBy: string;
    createdAt?: string;
    userScores?: { userId: string; score: number; total: number; timestamp: string }[];
  }
  
  export interface User {
    _id?: string;
    username: string;
    password: string;
    email: string;
    registrationDate?: string;
    statistics: {
      totalQuizzesTaken: number;
      totalScore: number;
      topicsLacking: { topic: string; weaknessScore: number }[];
    };
  }
  
  export interface ProfileStats {
    username: string;
    quizzesTaken: number;
    totalScore: number;
    averageScore: number;
    topicsLacking: { topic: string; weaknessScore: number }[];
  }