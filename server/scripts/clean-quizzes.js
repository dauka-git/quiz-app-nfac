// scripts/clean-matching-quizzes.js
const { MongoClient } = require('mongodb');

async function cleanMatchingQuizzes() {
  const uri = 'mongodb://localhost:27017'; // Update with your MongoDB URI
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('quizmaker');
    const quizzes = db.collection('quizzes');

    // Remove matching questions from all quizzes
    const result = await quizzes.updateMany(
      { 'questions.type': 'matching' },
      [
        {
          $set: {
            questions: {
              $filter: {
                input: '$questions',
                cond: { $ne: ['$$this.type', 'matching'] }
              }
            }
          }
        }
      ]
    );

    console.log(`Removed matching questions from ${result.modifiedCount} quizzes`);
  } catch (err) {
    console.error('Error cleaning matching quizzes:', err);
  } finally {
    await client.close();
  }
}

cleanMatchingQuizzes();