require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

async function test() {
  let ai;
  try {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy' });
  } catch (e) {
    console.error("Could not initialize native GoogleGenAI client:", e.message);
    return;
  }

  const prompt = `
# Role: Precision Agriculture Expert
You are an expert agronomist specialized in data-driven crop recommendation. 
Your goal is to explain and write dynamic insights for the crop recommendations selected by our K-Nearest Neighbors Classifier.

# Context & Inputs:
- User Location: Delhi
- User Soil Type: alluvial
- User Water Source: borewell
- Temperature: 28°C, Humidity: 60%, Soil pH: 6.5, Inferred Rainfall: 200mm
- Selected Crops to Explain (from KNN classification on the entire Kaggle Dataset):
[]

# Instructions:
1. Explain why each selected crop is suitable for the user's soil, water source, and weather based on the classification results.
2. Provide actionable advice for soil preparation, fertilization, or irrigation specific to that crop.
3. Recommend an appropriate confidence score (e.g. between 70% and 99%) based on the classification probability.
4. Estimate a standard budget per acre (in INR) for each crop.

# Output Format:
Return ONLY a strictly valid JSON object containing 4 arrays matching the categories ('food', 'commercial', 'vegetable', 'pulses'). Do not include Markdown blocks.
Example format:
{
  "food": [
    {
      "name": "Crop Name",
      "confidence": "Estimated score (e.g., 92%)",
      "budgetPerAcre": 25000,
      "keyFactors": "List the primary reasons (e.g., 'Matches preferred clay soil and high rainfall water demand').",
      "actionableInsight": "Brief advice on soil preparation for this specific crop."
    }
  ],
  "commercial": [],
  "vegetable": [],
  "pulses": []
}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });
    console.log("Response successful:");
    console.log(response.text);
  } catch (err) {
    console.error("Error from AI:", err.message);
  }
}

test();
