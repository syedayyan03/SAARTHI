require('dotenv').config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await res.json();
  if (data.models) {
    data.models.forEach(m => console.log(m.name));
  } else {
    console.log(data);
  }
}
listModels();
