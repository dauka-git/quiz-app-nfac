// server/test-mongo.js
require('dotenv').config();
const mongoose = require('mongoose');

async function testMongo() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    await mongoose.connection.close();
  } catch (error) {
    console.error('MongoDB test error:', error.message, error.stack);
  }
}

testMongo();