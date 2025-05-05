// server/models/User.js
const mongoose = require('mongoose');

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

module.exports = mongoose.model('User', userSchema);