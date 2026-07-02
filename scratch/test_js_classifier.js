const fs = require('fs');
const path = require('path');

// Load JSON model
const modelPath = path.join(__dirname, '..', 'models', 'chat_intent_model.json');
if (!fs.existsSync(modelPath)) {
  console.error("Model JSON not found!");
  process.exit(1);
}
const model = JSON.parse(fs.readFileSync(modelPath, 'utf8'));

function classifyQueryLocal(query) {
  if (!query || !query.trim()) {
    return { intent: 'unrelated', confidence: 1.0 };
  }

  // 1. Tokenize query supporting English, Hindi, Telugu, Marathi, Malayalam characters
  const rawWords = query.toLowerCase().match(/[\w\u0900-\u097F\u0C00-\u0C7F\u0D00-\u0D7F]+/g) || [];
  // Filter out single character tokens to match scikit-learn default token_pattern (?u)\b\w\w+\b
  const tokens = rawWords.filter(w => w.length >= 2);

  if (tokens.length === 0) {
    return { intent: 'unrelated', confidence: 1.0 };
  }

  // 2. Generate n-grams (1-grams and 2-grams)
  const ngrams = [];
  tokens.forEach(t => ngrams.push(t));
  for (let i = 0; i < tokens.length - 1; i++) {
    ngrams.push(`${tokens[i]} ${tokens[i+1]}`);
  }

  // 3. Count terms that are in the vocabulary
  const termCounts = {};
  ngrams.forEach(term => {
    if (model.vocabulary[term] !== undefined) {
      termCounts[term] = (termCounts[term] || 0) + 1;
    }
  });

  // 4. Calculate TF-IDF features
  const tfidfFeatures = {};
  for (const [term, count] of Object.entries(termCounts)) {
    const idx = model.vocabulary[term];
    const tf = model.sublinear_tf ? (1 + Math.log(count)) : count;
    const idf = model.idf[idx];
    tfidfFeatures[idx] = tf * idf;
  }

  // 5. L2 Normalization
  let sumSquares = 0;
  for (const val of Object.values(tfidfFeatures)) {
    sumSquares += val * val;
  }
  const norm = Math.sqrt(sumSquares);

  const normalizedFeatures = {};
  if (norm > 0) {
    for (const [idx, val] of Object.entries(tfidfFeatures)) {
      normalizedFeatures[idx] = val / norm;
    }
  }

  // 6. Compute Logistic Regression prediction
  let z = model.intercept;
  for (const [idx, val] of Object.entries(normalizedFeatures)) {
    z += model.coef[idx] * val;
  }

  const prob_1 = 1 / (1 + Math.exp(-z));
  const prob_0 = 1 - prob_1;

  const intent = prob_1 >= 0.5 ? 'agriculture' : 'unrelated';
  const confidence = prob_1 >= 0.5 ? prob_1 : prob_0;

  return { intent, confidence };
}

// Sanity check test cases
const testQueries = [
  "NPK requirement for ragi crop",
  "how to write a Python list?",
  "వరి పంట తెగులు నివారణ ఎలా?", // Paddy disease in Telugu
  "मंडी में आज का मक्का का भाव", // Mandi maize price in Hindi
  "explain javascript promises and async await",
  "कापूस कापणी", // Cotton harvest in Marathi
  "നെൽകൃഷിക്ക് ആവശ്യമായ വളം" // Paddy fertilizer in Malayalam
];

console.log("============================================================");
console.log("  SAARTHI JS In-Process Intent Classifier Test Run");
console.log("============================================================");

testQueries.forEach(q => {
  const result = classifyQueryLocal(q);
  const label = result.intent === 'agriculture' ? "IN-SCOPE (Agriculture)" : "OUT-OF-SCOPE (Unrelated)";
  console.log(`Query: '${q}'`);
  console.log(`  -> Class: ${label} (Prob: ${(result.confidence*100).toFixed(1)}%)`);
});

console.log("============================================================");
