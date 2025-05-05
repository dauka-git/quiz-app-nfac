// server/test-gemini.js
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = 'Test prompt: Generate a simple question.';
    console.log('Sending test prompt:', prompt);
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    console.log('Gemini response:', response);
  } catch (error) {
    console.error('Gemini test error:', error.message, error.stack);
  }
}

testGemini();