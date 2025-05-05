// server/models/QuizModel.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['multiple_choice', 'true_false', 'matching', 'short_answer'],
    required: true,
  },
  subtype: {
    type: String,
    enum: ['single', 'multiple', null],
    default: null,
  },
  text: { type: String, required: true },
  options: [String],
  matches: [{ left: String, right: String }],
  correctAnswer: mongoose.Schema.Types.Mixed,
  caseSensitive: { type: Boolean, default: false },
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  questions: [questionSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  userScores: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      score: Number,
      total: Number,
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  statistics: {
    totalQuizzesTaken: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    topicsLacking: [
      {
        topic: String,
        weaknessScore: Number,
      },
    ],
  },
});

const logSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  details: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now },
});

const liveQuizSessionSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['waiting', 'in_progress', 'finished'],
    default: 'waiting',
  },
  participants: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      socketId: String,
      answers: [
        {
          questionIndex: Number,
          answer: mongoose.Schema.Types.Mixed,
          timeTaken: Number,
        },
      ],
    },
  ],
  currentQuestion: { type: Number, default: 0 },
  questionStartTime: Date,
  settings: {
    timePerQuestion: { type: Number, default: 30 },
  },
});

const Quiz = mongoose.model('Quiz', quizSchema);
const User = mongoose.model('User', userSchema);
const Log = mongoose.model('Log', logSchema);
const LiveQuizSession = mongoose.model('LiveQuizSession', liveQuizSessionSchema);

module.exports = { Quiz, User, Log, LiveQuizSession };