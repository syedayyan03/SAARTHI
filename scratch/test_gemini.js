const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('Using API Key:', apiKey);
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Hello, respond with exactly "Key is working!"'
    });
    console.log('Success response:', response.text);
  } catch (err) {
    console.error('Gemini call failed with error:', err);
  }
}

testGemini();
