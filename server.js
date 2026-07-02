const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { GoogleGenAI } = require('@google/genai');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { spawn } = require('child_process');

require('dotenv').config();

// Load CROP_PROFILES globally for general usage (like chatbot fallback)
let GLOBAL_CROP_PROFILES = {};
let GLOBAL_KNN_DATA = {};
try {
  const cropProfilesPath = path.join(__dirname, 'data', 'crop_profiles.json');
  if (fs.existsSync(cropProfilesPath)) {
    GLOBAL_CROP_PROFILES = JSON.parse(fs.readFileSync(cropProfilesPath, 'utf8'));
    const customCropProfiles = {
      sugarcane: { N: 100, P: 50, K: 90, temp: 27, humidity: 70, ph: 6.5, rainfall: 250, preferred_soils: ['alluvial', 'clayey', 'black', 'loamy'], water_demand: 'high', category: 'cash', states: ['Uttar Pradesh', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Bihar'] },
      tomato: { N: 80, P: 60, K: 70, temp: 24, humidity: 65, ph: 6.2, rainfall: 90, preferred_soils: ['loamy', 'sandy', 'alluvial'], water_demand: 'medium', category: 'vegetable', states: ['Andhra Pradesh', 'Madhya Pradesh', 'Karnataka', 'Gujarat', 'Odisha'] },
      chilli: { N: 70, P: 50, K: 60, temp: 25, humidity: 60, ph: 6.0, rainfall: 80, preferred_soils: ['loamy', 'alluvial', 'sandy'], water_demand: 'medium', category: 'vegetable', states: ['Andhra Pradesh', 'Telangana', 'Karnataka', 'Madhya Pradesh'] },
      brinjal: { N: 75, P: 45, K: 55, temp: 26, humidity: 65, ph: 6.5, rainfall: 85, preferred_soils: ['loamy', 'sandy', 'alluvial'], water_demand: 'medium', category: 'vegetable', states: ['West Bengal', 'Odisha', 'Gujarat', 'Bihar', 'Madhya Pradesh'] },
      gourd: { N: 60, P: 40, K: 50, temp: 28, humidity: 70, ph: 6.2, rainfall: 100, preferred_soils: ['sandy', 'loamy', 'alluvial'], water_demand: 'medium', category: 'vegetable', states: ['Uttar Pradesh', 'Bihar', 'West Bengal', 'Madhya Pradesh'] },
      cucumber: { N: 55, P: 35, K: 45, temp: 26, humidity: 70, ph: 6.0, rainfall: 90, preferred_soils: ['sandy', 'loamy', 'alluvial'], water_demand: 'medium', category: 'vegetable', states: ['Haryana', 'Karnataka', 'Uttar Pradesh', 'Delhi'] },
      wheat: { N: 80, P: 40, K: 40, temp: 18, humidity: 55, ph: 6.5, rainfall: 75, preferred_soils: ['alluvial', 'loamy', 'clayey', 'black'], water_demand: 'medium', category: 'cereal', states: ['Uttar Pradesh', 'Punjab', 'Haryana', 'Madhya Pradesh', 'Rajasthan'] },
      ragi: { N: 40, P: 30, K: 30, temp: 25, humidity: 65, ph: 6.5, rainfall: 60, preferred_soils: ['red', 'sandy', 'loamy', 'alluvial'], water_demand: 'low', category: 'millet', states: ['Karnataka', 'Tamil Nadu', 'Uttarakhand', 'Maharashtra', 'Andhra Pradesh'] },
      fingermillet: { N: 40, P: 30, K: 30, temp: 25, humidity: 65, ph: 6.5, rainfall: 60, preferred_soils: ['red', 'sandy', 'loamy', 'alluvial'], water_demand: 'low', category: 'millet', states: ['Karnataka', 'Tamil Nadu', 'Uttarakhand', 'Maharashtra', 'Andhra Pradesh'] },
      barley: { N: 60, P: 30, K: 30, temp: 18, humidity: 55, ph: 6.8, rainfall: 50, preferred_soils: ['sandy', 'loamy', 'alluvial'], water_demand: 'low', category: 'cereal', states: ['Rajasthan', 'Uttar Pradesh', 'Haryana', 'Punjab'] },
      millets: { N: 40, P: 25, K: 25, temp: 28, humidity: 55, ph: 6.5, rainfall: 50, preferred_soils: ['red', 'sandy', 'loamy'], water_demand: 'low', category: 'millet', states: ['Rajasthan', 'Maharashtra', 'Karnataka', 'Gujarat', 'Haryana'] }
    };
    Object.assign(GLOBAL_CROP_PROFILES, customCropProfiles);
  }
  const knnPath = path.join(__dirname, 'data', 'crop_knn_dataset.json');
  if (fs.existsSync(knnPath)) GLOBAL_KNN_DATA = JSON.parse(fs.readFileSync(knnPath, 'utf8'));
} catch (e) {
  console.error("Failed to load crop profiles globally:", e);
}

// --- Session Token Security Helpers ---
const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET || SESSION_SECRET.length < 32) {
  if (process.env.NODE_ENV === 'production') throw new Error('SESSION_SECRET must be at least 32 characters in production.');
  console.warn('Using an ephemeral development session secret. Sessions reset on restart.');
}
const ACTIVE_SESSION_SECRET = SESSION_SECRET || crypto.randomBytes(32).toString('hex');

function generateSessionToken(phone, passwordVersion = 0, purpose = 'session') {
  const payload = {
    phone,
    passwordVersion,
    purpose,
    expiresAt: Date.now() + (purpose === 'registration' ? 10 * 60 * 1000 : 24 * 60 * 60 * 1000)
  };
  const payloadStr = JSON.stringify(payload);
  const base64Payload = Buffer.from(payloadStr).toString('base64');
  
  const signature = crypto.createHmac('sha256', ACTIVE_SESSION_SECRET).update(base64Payload).digest('hex');
  
  return `${base64Payload}.${signature}`;
}

function verifySessionToken(token, expectedPurpose = 'session') {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  
  const [base64Payload, signature] = parts;
  
  const expectedSignature = crypto.createHmac('sha256', ACTIVE_SESSION_SECRET).update(base64Payload).digest('hex');
  const supplied = Buffer.from(signature, 'hex');
  const expected = Buffer.from(expectedSignature, 'hex');
  if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) return null;
  
  try {
    const payloadStr = Buffer.from(base64Payload, 'base64').toString('utf8');
    const payload = JSON.parse(payloadStr);
    
    if (Date.now() > payload.expiresAt) {
      return null; // Expired
    }
    if ((payload.purpose || 'session') !== expectedPurpose) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ ok: false, message: 'Access Denied: No Session Token provided.' });
  }
  
  const payload = verifySessionToken(token);
  if (!payload) {
    return res.status(403).json({ ok: false, message: 'Invalid or expired Session Token.' });
  }
  
  const user = loadUsers().find(u => u.phone === payload.phone);
  if (!user || (user.passwordVersion || 0) !== (payload.passwordVersion || 0)) {
    return res.status(403).json({ ok: false, message: 'Session has been revoked.' });
  }
  req.userPhone = payload.phone;
  req.user = user;
  next();
}

function requireAdmin(req, res, next) {
  const admins = (process.env.ADMIN_EMAILS || '').split(',').map(v => v.trim().toLowerCase()).filter(Boolean);
  if (!req.user || !admins.includes(String(req.user.email || '').toLowerCase())) {
    return res.status(403).json({ ok: false, message: 'Administrator access required.' });
  }
  next();
}

// Initialize Multer for in-memory file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => cb(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype))
});

// Initialize Gemini Client
let ai;
try {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy' });
} catch (e) {
  console.warn("Could not initialize native GoogleGenAI client:", e.message);
}

// Unified function to handle both native Gemini SDK and OpenRouter API calls
async function generateContent({ model, contents, systemInstruction = null, responseMimeType = null }) {
  const apiKey = process.env.GEMINI_API_KEY;
  const isOpenRouter = apiKey && apiKey.startsWith('sk-or-');

  if (isOpenRouter) {
    let orModel = model;
    if (model === 'gemini-2.5-flash') {
      orModel = 'google/gemini-2.5-flash';
    }

    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }

    if (typeof contents === 'string') {
      messages.push({ role: 'user', content: contents });
    } else if (Array.isArray(contents)) {
      const isHistory = contents.length > 0 && (contents[0].role !== undefined || contents[0].parts !== undefined);
      
      if (isHistory) {
        contents.forEach(msg => {
          const role = msg.role === 'user' ? 'user' : 'assistant';
          const contentParts = [];
          
          if (Array.isArray(msg.parts)) {
            msg.parts.forEach(part => {
              if (part.text) {
                contentParts.push({ type: 'text', text: part.text });
              } else if (part.inlineData) {
                contentParts.push({
                  type: 'image_url',
                  image_url: {
                    url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
                  }
                });
              }
            });
          }

          messages.push({
            role: role,
            content: contentParts.length === 1 && contentParts[0].type === 'text' ? contentParts[0].text : contentParts
          });
        });
      } else {
        const contentParts = [];
        contents.forEach(part => {
          if (typeof part === 'string') {
            contentParts.push({ type: 'text', text: part });
          } else if (part.inlineData) {
            contentParts.push({
              type: 'image_url',
              image_url: {
                url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
              }
            });
          } else if (typeof part === 'object' && part.text) {
            contentParts.push({ type: 'text', text: part.text });
          }
        });
        messages.push({ role: 'user', content: contentParts });
      }
    }

    console.log(`Calling OpenRouter API with model: ${orModel}`);
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Crop Recommendation Portal'
      },
      body: JSON.stringify({
        model: orModel,
        messages: messages,
        max_tokens: 2000,
        response_format: responseMimeType === 'application/json' ? { type: "json_object" } : undefined
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(`OpenRouter Error: ${data.error.message || JSON.stringify(data.error)}`);
    }
    if (!data.choices || data.choices.length === 0) {
      throw new Error(`OpenRouter returned empty choices: ${JSON.stringify(data)}`);
    }
    
    return {
      text: data.choices[0].message.content
    };
  } else {
    if (!ai) {
      throw new Error("Gemini AI client is not initialized.");
    }
    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        systemInstruction: systemInstruction || undefined,
        maxOutputTokens: 2000,
        responseMimeType: responseMimeType || undefined
      }
    });
    return response;
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// --- Nodemailer Email Sending Helper ---
let transporter;
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  console.log("Nodemailer Gmail transporter initialized successfully.");
} else {
  console.warn("SMTP_USER and SMTP_PASS environment variables are missing in .env. Mails will be simulated in the console.");
}

async function sendEmail({ to, subject, text, html }) {
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"SAARTHI Support" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
        html
      });
      console.log(`[Email Service] Mail successfully sent to: ${to}`);
      return true;
    } catch (e) {
      console.error(`[Email Service] Failed to send email to ${to}:`, e);
      return false;
    }
  } else {
    console.log(`\n========================================`);
    console.log(`[EMAIL SIMULATION]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Text:\n${text}`);
    console.log(`========================================\n`);
    return true;
  }
}

// --- Simple JSON-file user store (for demo) ---
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function ensureUserStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]), 'utf8');
  }
}

function loadUsers() {
  ensureUserStore();
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}

function saveUsers(users) {
  ensureUserStore();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

const SELECTIONS_FILE = path.join(__dirname, 'data', 'selections.json');

function ensureSelectionsStore() {
  const dir = path.dirname(SELECTIONS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(SELECTIONS_FILE)) {
    fs.writeFileSync(SELECTIONS_FILE, JSON.stringify({}), 'utf8');
  }
}

function loadSelections() {
  ensureSelectionsStore();
  try {
    const raw = fs.readFileSync(SELECTIONS_FILE, 'utf8');
    return JSON.parse(raw || '{}');
  } catch (e) {
    return {};
  }
}

function saveSelections(selections) {
  ensureSelectionsStore();
  fs.writeFileSync(SELECTIONS_FILE, JSON.stringify(selections, null, 2), 'utf8');
}

const CHATS_FILE = path.join(__dirname, 'data', 'chats.json');

function ensureChatsStore() {
  const dir = path.dirname(CHATS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(CHATS_FILE)) {
    fs.writeFileSync(CHATS_FILE, JSON.stringify({}), 'utf8');
  }
}

function loadChats() {
  ensureChatsStore();
  try {
    const raw = fs.readFileSync(CHATS_FILE, 'utf8');
    return JSON.parse(raw || '{}');
  } catch (e) {
    return {};
  }
}

function saveChats(chats) {
  ensureChatsStore();
  fs.writeFileSync(CHATS_FILE, JSON.stringify(chats, null, 2), 'utf8');
}

// Load selected crops and chat histories from persistent file databases (survives server restarts)
const userSelections = loadSelections();
const userChats = loadChats();
const otpStore = {};


// API: register new user with hashed password (DISABLED - Google Only)
app.post('/api/register', async (req, res) => {
  return res.status(403).json({ ok: false, message: 'Standard registration is disabled. Please sign up using Google Login.' });
});


// API: secure login using stored hash
app.post('/api/login', async (req, res) => {
  const { phoneOrEmail, password, language } = req.body;
  if (!phoneOrEmail || !password) {
    return res.status(400).json({ ok: false, message: 'Missing phone/email or password.' });
  }
  const identifier = String(phoneOrEmail).trim().toLowerCase();
  const users = loadUsers();
  
  // Find by phone, email, or username
  const user = users.find(u => 
    u.phone === identifier || 
    (u.email && u.email.toLowerCase() === identifier) ||
    (u.username && u.username.toLowerCase() === identifier)
  );
  if (!user) {
    return res.status(401).json({ ok: false, message: 'Account not found. Please register first.' });
  }
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ ok: false, message: 'Incorrect password.' });
  }

  if (language && language !== user.language) {
    user.language = language;
    saveUsers(users);
  }

  res.json({ ok: true, phone: user.phone, email: user.email, username: user.username || '', language: user.language, name: user.name, token: generateSessionToken(user.phone) });
});

// API: get configurations (Google Sign-In Client ID, etc.)
app.get('/api/config', (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    realGoogleAuth: !!process.env.GOOGLE_CLIENT_ID
  });
});

// API: Google registration/login (supports both real ID token verify and mock fallback)
app.post('/api/google-login', async (req, res) => {
  const { idToken, email: mockEmail, name: mockName, language } = req.body;
  let email, name, picture;

  if (idToken) {
    // Real Google Sign-in flow: Verify Google ID token
    try {
      const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
      if (!verifyRes.ok) {
        return res.status(400).json({ ok: false, message: 'Invalid or expired Google OAuth Token.' });
      }
      const payload = await verifyRes.json();
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
      
      if (!email) {
        return res.status(400).json({ ok: false, message: 'Google account email not verified.' });
      }
    } catch (err) {
      console.error("Google Token Verification Error:", err);
      return res.status(500).json({ ok: false, message: 'Failed to verify token with Google servers.' });
    }
  } else if (mockEmail) {
    // Fallback Mock Sign-in flow
    email = mockEmail;
    name = mockName;
  } else {
    return res.status(400).json({ ok: false, message: 'Authentication details missing.' });
  }

  const trimmedEmail = String(email).trim().toLowerCase();
  const users = loadUsers();
  let user = users.find(u => u.email === trimmedEmail);

  if (!user) {
    // Instead of registering automatically, ask them to link username/password
    return res.json({
      ok: true,
      needsRegistration: true,
      email: trimmedEmail,
      name: name || 'Google User',
      picture: picture || ''
    });
  }

  // Update profile pic if it changed
  if (picture && user.picture !== picture) {
    user.picture = picture;
    saveUsers(users);
  }

  res.json({ ok: true, phone: user.phone, email: user.email, username: user.username || '', language: user.language, name: user.name, picture: user.picture, token: generateSessionToken(user.phone) });
});

// API: Send OTP for forgot password to User Email
app.post('/api/forgot-password/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ ok: false, message: 'Email address is required.' });
  }
  const trimmedEmail = String(email).trim().toLowerCase();
  const users = loadUsers();
  const user = users.find(u => u.email && u.email.toLowerCase() === trimmedEmail);
  if (!user) {
    return res.status(404).json({ ok: false, message: 'Account with this email not found. Please register first.' });
  }

  // Generate a 4-digit OTP code
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  // Expire in 5 minutes
  otpStore[trimmedEmail] = {
    code,
    expires: Date.now() + 5 * 60 * 1000
  };

  console.log(`[Email Service Simulation] OTP for ${trimmedEmail} is ${code}`);

  const subject = "SAARTHI Password Reset OTP";
  const text = `Hello ${user.name || 'Farmer'},\n\nYou requested to reset your password on SAARTHI.\nYour OTP code is: ${code}\n\nThis code will expire in 5 minutes.\n\nRegards,\nTeam SAARTHI`;
  const html = `<p>Hello <strong>${user.name || 'Farmer'}</strong>,</p>
                <p>You requested to reset your password on SAARTHI.</p>
                <p>Your OTP code is: <strong style="font-size:1.3rem; color:#10B981;">${code}</strong></p>
                <p>This code will expire in 5 minutes.</p>
                <br/>
                <p>Regards,<br/>Team SAARTHI</p>`;

  await sendEmail({ to: trimmedEmail, subject, text, html });

  res.json({ ok: true, message: 'OTP sent successfully to your email.' });
});

// API: Reset password with OTP verification via email
app.post('/api/forgot-password/reset', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ ok: false, message: 'Missing email, OTP, or new password.' });
  }

  const trimmedEmail = String(email).trim().toLowerCase();
  const storedOtp = otpStore[trimmedEmail];

  if (!storedOtp) {
    return res.status(400).json({ ok: false, message: 'No OTP requested for this email.' });
  }

  if (Date.now() > storedOtp.expires) {
    delete otpStore[trimmedEmail];
    return res.status(400).json({ ok: false, message: 'OTP has expired. Please request a new one.' });
  }

  if (storedOtp.code !== String(otp).trim()) {
    return res.status(400).json({ ok: false, message: 'Incorrect OTP code.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ ok: false, message: 'Password must be at least 6 characters.' });
  }

  const users = loadUsers();
  const userIndex = users.findIndex(u => u.email && u.email.toLowerCase() === trimmedEmail);
  if (userIndex === -1) {
    return res.status(404).json({ ok: false, message: 'User not found.' });
  }

  // Hash new password and save
  const passwordHash = await bcrypt.hash(newPassword, 10);
  users[userIndex].passwordHash = passwordHash;
  saveUsers(users);

  // Clear OTP
  delete otpStore[trimmedEmail];

  res.json({ ok: true, message: 'Password updated successfully. You can now login.' });
});

// --- Simple JSON-file query store ---
const QUERIES_FILE = path.join(DATA_DIR, 'queries.json');

function saveQuery(queryObj) {
  let queries = [];
  try {
    if (fs.existsSync(QUERIES_FILE)) {
      queries = JSON.parse(fs.readFileSync(QUERIES_FILE, 'utf8') || '[]');
    }
  } catch (e) {
    queries = [];
  }
  queries.push(queryObj);
  fs.writeFileSync(QUERIES_FILE, JSON.stringify(queries, null, 2), 'utf8');
}

// API: Help Center Agronomist Query Email Submission
app.post('/api/help-query', async (req, res) => {
  const { name, phone, email, query } = req.body;
  if (!name || !query) {
    return res.status(400).json({ ok: false, message: 'Name and query are required.' });
  }

  const queryObj = {
    id: Date.now().toString(),
    name,
    phone: phone || 'N/A',
    email: email || 'N/A',
    query,
    createdAt: new Date().toISOString()
  };

  // Save query locally
  saveQuery(queryObj);

  // Send email to saarthiforus2071@gmail.com
  const subject = `[SAARTHI Help Center] New Farmer Inquiry from ${name}`;
  const text = `New Agronomist Inquiry:\n\nName: ${name}\nPhone: ${phone || 'N/A'}\nEmail: ${email || 'N/A'}\nQuery: ${query}\n\nSubmitted at: ${queryObj.createdAt}`;
  const html = `<h2>New Agronomist Inquiry</h2>
                <p><strong>Farmer Name:</strong> ${name}</p>
                <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
                <p><strong>Email:</strong> ${email || 'N/A'}</p>
                <p><strong>Query Details:</strong></p>
                <blockquote style="background:#f4f4f4; padding:1.2rem; border-left:5px solid #10b981; font-style:italic;">
                  ${query}
                </blockquote>
                <p>Submitted at: ${queryObj.createdAt}</p>`;

  await sendEmail({ to: 'saarthiforus2071@gmail.com', subject, text, html });

  res.json({ ok: true, message: 'Query forwarded successfully.' });
});

// API: Complete Google account linking registration
app.post('/api/google-register', async (req, res) => {
  const { email, name, picture, username, password, language } = req.body;
  if (!email || !username || !password) {
    return res.status(400).json({ ok: false, message: 'Email, username, and password are required.' });
  }

  const trimmedEmail = String(email).trim().toLowerCase();
  const trimmedUsername = String(username).trim().toLowerCase();

  if (!/^[a-zA-Z0-9_-]{3,20}$/.test(trimmedUsername)) {
    return res.status(400).json({ ok: false, message: 'Username must be 3-20 characters (alphanumeric, underscores, or dashes).' });
  }

  if (password.length < 6) {
    return res.status(400).json({ ok: false, message: 'Password must be at least 6 characters.' });
  }

  const users = loadUsers();
  
  // Verify email is not already taken
  const existingEmail = users.find(u => u.email && u.email.toLowerCase() === trimmedEmail);
  if (existingEmail) {
    return res.status(409).json({ ok: false, message: 'An account with this email already exists.' });
  }

  // Verify username is not already taken
  const existingUsername = users.find(u => u.username && u.username.toLowerCase() === trimmedUsername);
  if (existingUsername) {
    return res.status(409).json({ ok: false, message: 'Username is already taken.' });
  }

  const mockPhone = "G" + Math.floor(100000000 + Math.random() * 900000000).toString();
  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    id: Date.now().toString(),
    phone: mockPhone,
    email: trimmedEmail,
    name: name || 'Google User',
    username: trimmedUsername,
    passwordHash,
    language: language || 'en',
    picture: picture || '',
    createdAt: new Date().toISOString()
  };

  users.push(user);
  saveUsers(users);

  res.json({ ok: true, phone: user.phone, email: user.email, username: user.username, language: user.language, name: user.name, picture: user.picture, token: generateSessionToken(user.phone) });
});

// API: Verify forgot password OTP code
app.post('/api/forgot-password/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ ok: false, message: 'Email and OTP are required.' });
  }

  const trimmedEmail = String(email).trim().toLowerCase();
  const storedOtp = otpStore[trimmedEmail];

  if (!storedOtp) {
    return res.status(400).json({ ok: false, message: 'No OTP requested for this email.' });
  }

  if (Date.now() > storedOtp.expires) {
    delete otpStore[trimmedEmail];
    return res.status(400).json({ ok: false, message: 'OTP has expired. Please request a new one.' });
  }

  if (storedOtp.code !== String(otp).trim()) {
    return res.status(400).json({ ok: false, message: 'Incorrect OTP code.' });
  }

  res.json({ ok: true, message: 'OTP verified successfully.' });
});

// API: Change profile password after verifying old password
app.post('/api/profile/change-password', authenticateToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const phone = req.userPhone;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ ok: false, message: 'Missing fields.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ ok: false, message: 'New password must be at least 6 characters.' });
  }

  const users = loadUsers();
  const userIndex = users.findIndex(u => u.phone === phone);
  if (userIndex === -1) {
    return res.status(404).json({ ok: false, message: 'User not found.' });
  }

  const user = users[userIndex];
  const match = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!match) {
    return res.status(401).json({ ok: false, message: 'Incorrect current password.' });
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  users[userIndex].passwordHash = newHash;
  saveUsers(users);

  res.json({ ok: true, message: 'Password updated successfully.' });
});

// API: Get user profile details
app.get('/api/profile', authenticateToken, (req, res) => {
  const phone = req.userPhone;
  const users = loadUsers();
  const user = users.find(u => u.phone === phone);
  if (!user) {
    return res.status(404).json({ ok: false, message: 'Profile not found.' });
  }
  res.json({
    ok: true,
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    soil: user.soil || '',
    water: user.water || '',
    acres: user.acres || '',
    profilePic: user.profilePic || user.picture || ''
  });
});

// API: Save/update user profile details
app.post('/api/profile/save', authenticateToken, (req, res) => {
  const phone = req.userPhone;
  const { name, soil, water, acres, profilePic } = req.body;
  console.log('[DEBUG SAVE] req.body keys:', Object.keys(req.body));
  console.log('[DEBUG SAVE] phone:', phone, 'name:', name, 'soil:', soil, 'water:', water, 'acres:', acres);
  const users_debug = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'users.json'), 'utf8'));
  console.log('[DEBUG SAVE] found index:', users_debug.findIndex(u => u.phone === phone));

  const users = loadUsers();
  const userIndex = users.findIndex(u => u.phone === phone);
  if (userIndex === -1) {
    return res.status(404).json({ ok: false, message: 'User not found.' });
  }

  users[userIndex].name = name || users[userIndex].name;
  users[userIndex].soil = soil !== undefined ? soil : (users[userIndex].soil || '');
  users[userIndex].water = water !== undefined ? water : (users[userIndex].water || '');
  users[userIndex].acres = acres !== undefined ? acres : (users[userIndex].acres || '');
  users[userIndex].profilePic = profilePic !== undefined ? profilePic : (users[userIndex].profilePic || '');
  users[userIndex].picture = profilePic !== undefined ? profilePic : (users[userIndex].picture || '');

  saveUsers(users);
  res.json({ ok: true, message: 'Profile saved successfully.', user: users[userIndex] });
});

// API: Get chat sessions for user
app.get('/api/chat/sessions', authenticateToken, (req, res) => {
  const phone = req.userPhone;
  const sessions = userChats[phone] || [];
  res.json({ ok: true, sessions });
});

// API: Save chat sessions for user
app.post('/api/chat/sessions', authenticateToken, (req, res) => {
  const phone = req.userPhone;
  const { sessions } = req.body;
  if (!Array.isArray(sessions)) {
    return res.status(400).json({ ok: false, message: 'sessions list must be an array' });
  }

  userChats[phone] = sessions;
  saveChats(userChats);
  res.json({ ok: true, message: 'Chat sessions saved.' });
});

// API: Admin panel get queries list
app.get('/api/admin/queries', authenticateToken, requireAdmin, (req, res) => {
  const QUERIES_FILE = path.join(__dirname, 'data', 'queries.json');
  try {
    if (fs.existsSync(QUERIES_FILE)) {
      const raw = fs.readFileSync(QUERIES_FILE, 'utf8');
      return res.json({ ok: true, queries: JSON.parse(raw || '[]') });
    }
  } catch (e) {
    console.error("Failed to read queries:", e);
  }
  res.json({ ok: true, queries: [] });
});


// API: crop recommendation using ML (Gemini) and crop dataset
function getRegionalBonus(cropName, location) {
  if (!location) return 1.0;
  const locLower = location.toLowerCase();
  const cropLower = cropName.toLowerCase().trim();

  // 1. Telangana & Andhra Pradesh (TS/AP)
  if (locLower.includes("telangana") || locLower.includes("andhra") || locLower.includes("nizamabad") || locLower.includes("guntur") || locLower.includes(", ts") || locLower.includes(", ap")) {
    const regionalCrops = ["rice", "paddy", "maize", "cotton", "groundnuts", "pigeonpeas", "blackgram", "mungbean", "chilli", "tur"];
    if (regionalCrops.includes(cropLower)) return 0.8;
  }

  // 2. Maharashtra (MH)
  if (locLower.includes("maharashtra") || locLower.includes("nashik") || locLower.includes(", mh")) {
    const regionalCrops = ["cotton", "sugarcane", "grapes", "wheat", "maize", "chickpea", "pomegranate", "banana", "mango"];
    if (regionalCrops.includes(cropLower)) return 0.8;
  }

  // 3. Kerala (KL)
  if (locLower.includes("kerala") || locLower.includes("kottayam") || locLower.includes(", kl")) {
    const regionalCrops = ["coconut", "coffee", "banana", "sapota", "papaya", "mango"];
    if (regionalCrops.includes(cropLower)) return 0.8;
  }

  // 4. Haryana & Punjab (HR/PB)
  if (locLower.includes("haryana") || locLower.includes("punjab") || locLower.includes("karnal") || locLower.includes(", hr") || locLower.includes(", pb")) {
    const regionalCrops = ["wheat", "rice", "paddy", "sugarcane", "maize", "cotton"];
    if (regionalCrops.includes(cropLower)) return 0.8;
  }

  // 5. Karnataka (KA)
  if (locLower.includes("karnataka") || locLower.includes("bengaluru") || locLower.includes(", ka")) {
    const regionalCrops = ["coffee", "coconut", "fingermillet", "ragi", "sugarcane", "maize", "cotton", "groundnuts"];
    if (regionalCrops.includes(cropLower)) return 0.8;
  }

  // 6. Gujarat (GJ)
  if (locLower.includes("gujarat") || locLower.includes(", gj")) {
    const regionalCrops = ["cotton", "groundnuts", "wheat", "maize"];
    if (regionalCrops.includes(cropLower)) return 0.8;
  }

  // 7. Tamil Nadu (TN)
  if (locLower.includes("tamil nadu") || locLower.includes(", tn")) {
    const regionalCrops = ["rice", "paddy", "coconut", "banana", "sugarcane", "groundnuts"];
    if (regionalCrops.includes(cropLower)) return 0.8;
  }

  return 1.0;
}

app.post('/api/recommend', authenticateToken, async (req, res) => {
  const { location, soilType, waterSource, n, p, k, temperature, humidity, ph, rainfall } = req.body;
  const acres = req.body.acres ? Number(req.body.acres) : 1.0;
  if (!location || !soilType || !waterSource) {
    return res.status(400).json({ ok: false, message: 'Missing basic fields' });
  }

  try {
    // 1. Load KNN Dataset and Crop Profiles
    const KNN_DATA = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'crop_knn_dataset.json'), 'utf8'));
    const CROP_PROFILES = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'crop_profiles.json'), 'utf8'));

    // Add custom crop profiles for sugarcane, vegetables, and other food grains
    const customCropProfiles = {
      sugarcane: { N: 100, P: 50, K: 90, temp: 27, humidity: 70, ph: 6.5, rainfall: 250, preferred_soils: ['alluvial', 'clayey', 'black', 'loamy'], water_demand: 'high', states: ['Uttar Pradesh', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Bihar'] },
      tomato: { N: 80, P: 60, K: 70, temp: 24, humidity: 65, ph: 6.2, rainfall: 90, preferred_soils: ['loamy', 'sandy', 'alluvial'], water_demand: 'medium', states: ['Andhra Pradesh', 'Madhya Pradesh', 'Karnataka', 'Gujarat', 'Odisha'] },
      chilli: { N: 70, P: 50, K: 60, temp: 25, humidity: 60, ph: 6.0, rainfall: 80, preferred_soils: ['loamy', 'alluvial', 'sandy'], water_demand: 'medium', states: ['Andhra Pradesh', 'Telangana', 'Karnataka', 'Madhya Pradesh'] },
      brinjal: { N: 75, P: 45, K: 55, temp: 26, humidity: 65, ph: 6.5, rainfall: 85, preferred_soils: ['loamy', 'sandy', 'alluvial'], water_demand: 'medium', states: ['West Bengal', 'Odisha', 'Gujarat', 'Bihar', 'Madhya Pradesh'] },
      gourd: { N: 60, P: 40, K: 50, temp: 28, humidity: 70, ph: 6.2, rainfall: 100, preferred_soils: ['sandy', 'loamy', 'alluvial'], water_demand: 'medium', states: ['Uttar Pradesh', 'Bihar', 'West Bengal', 'Madhya Pradesh'] },
      cucumber: { N: 55, P: 35, K: 45, temp: 26, humidity: 70, ph: 6.0, rainfall: 90, preferred_soils: ['sandy', 'loamy', 'alluvial'], water_demand: 'medium', states: ['Haryana', 'Karnataka', 'Uttar Pradesh', 'Delhi'] },
      wheat: { N: 80, P: 40, K: 40, temp: 18, humidity: 55, ph: 6.5, rainfall: 75, preferred_soils: ['alluvial', 'loamy', 'clayey', 'black'], water_demand: 'medium', states: ['Uttar Pradesh', 'Punjab', 'Haryana', 'Madhya Pradesh', 'Rajasthan'] },
      ragi: { N: 40, P: 30, K: 30, temp: 25, humidity: 65, ph: 6.5, rainfall: 60, preferred_soils: ['red', 'sandy', 'loamy', 'alluvial'], water_demand: 'low', states: ['Karnataka', 'Tamil Nadu', 'Uttarakhand', 'Maharashtra', 'Andhra Pradesh'] },
      fingermillet: { N: 40, P: 30, K: 30, temp: 25, humidity: 65, ph: 6.5, rainfall: 60, preferred_soils: ['red', 'sandy', 'loamy', 'alluvial'], water_demand: 'low', states: ['Karnataka', 'Tamil Nadu', 'Uttarakhand', 'Maharashtra', 'Andhra Pradesh'] },
      barley: { N: 60, P: 30, K: 30, temp: 18, humidity: 55, ph: 6.8, rainfall: 50, preferred_soils: ['sandy', 'loamy', 'alluvial'], water_demand: 'low', states: ['Rajasthan', 'Uttar Pradesh', 'Haryana', 'Punjab'] },
      millets: { N: 40, P: 25, K: 25, temp: 28, humidity: 55, ph: 6.5, rainfall: 50, preferred_soils: ['red', 'sandy', 'loamy'], water_demand: 'low', states: ['Rajasthan', 'Maharashtra', 'Karnataka', 'Gujarat', 'Haryana'] }
    };

    Object.assign(CROP_PROFILES, customCropProfiles);

    const bounds = KNN_DATA.meta?.bounds || KNN_DATA.bounds || {
      N: { min: 10, max: 311 },
      P: { min: 10, max: 252 },
      K: { min: 10, max: 379 },
      temperature: { min: 5.4, max: 42.0 },
      humidity: { min: 20.0, max: 95.0 },
      ph: { min: 4.5, max: 8.5 },
      rainfall: { min: 20.0, max: 400.0 }
    };

    const weights = KNN_DATA.meta?.weights || {
      N: 1.5,
      P: 1.5,
      K: 1.5,
      temperature: 2.0,
      humidity: 1.5,
      ph: 2.0,
      rainfall: 1.5
    };

    const normalizeWeighted = (val, feature) => {
      const b = bounds[feature];
      if (!b) return 0.5;
      const w = weights[feature] || 1.0;
      const range = b.max - b.min;
      if (range === 0) return 0.0;
      return ((val - b.min) / range) * w;
    };

    // 2. Resolve N, P, K, pH defaults based on soil type
    const soilNPKMap = {
      black: { N: 70, P: 45, K: 80, ph: 7.2 },
      red: { N: 35, P: 25, K: 40, ph: 6.2 },
      sandy: { N: 20, P: 18, K: 20, ph: 6.0 },
      loamy: { N: 75, P: 55, K: 55, ph: 6.6 },
      clay: { N: 65, P: 40, K: 70, ph: 7.4 },
      laterite: { N: 30, P: 20, K: 35, ph: 5.5 }
    };
    const defaultNPK = { N: 50, P: 40, K: 45, ph: 6.5 };

    const waterRainfallAddition = {
      borewell: 150,
      canal: 120,
      tank: 80,
      openwell: 100,
      rainfed: 0
    };

    // 3. Resolve state annual average rainfall dynamically
    const stateRainfallMap = {
      telangana: 950,
      andhra: 950,
      maharashtra: 1150,
      kerala: 3000,
      haryana: 550,
      punjab: 600,
      karnataka: 1250,
      gujarat: 800,
      tamil: 950,
      rajasthan: 400,
      uttar: 950,
      madhya: 1050,
      bihar: 1200,
      bengal: 1750,
      odisha: 1450,
      assam: 2800
    };

    let baseRainfall = 1000; // default fallback
    const locLower = location.toLowerCase();
    for (const [state, rain] of Object.entries(stateRainfallMap)) {
      if (locLower.includes(state) || (state === "telangana" && locLower.includes("ts")) || (state === "andhra" && locLower.includes("ap")) || (state === "maharashtra" && locLower.includes("mh")) || (state === "kerala" && locLower.includes("kl")) || (state === "karnataka" && locLower.includes("ka")) || (state === "gujarat" && locLower.includes("gj")) || (state === "tamil" && locLower.includes("tn")) || (state === "punjab" && locLower.includes("pb")) || (state === "haryana" && locLower.includes("hr"))) {
        baseRainfall = rain;
        break;
      }
    }

    const soilProfile = soilNPKMap[soilType.toLowerCase()] || defaultNPK;
    const waterBonus = waterRainfallAddition[waterSource.toLowerCase()] || 0;

    const parseNum = (val, def) => { const num = Number(val); return isNaN(num) ? def : num; };

    const targetN = n !== undefined ? parseNum(n, soilProfile.N) : soilProfile.N;
    const targetP = p !== undefined ? parseNum(p, soilProfile.P) : soilProfile.P;
    const targetK = k !== undefined ? parseNum(k, soilProfile.K) : soilProfile.K;
    const targetT = temperature !== undefined ? parseNum(temperature, 26) : 26;
    const targetH = humidity !== undefined ? parseNum(humidity, 65) : 65;
    const targetPh = ph !== undefined ? parseNum(ph, soilProfile.ph) : soilProfile.ph;
    
    // SCALE DOWN rainfall from annual state map averages to seasonal crop average to match Kaggle bounds
    let targetR = rainfall !== undefined ? parseNum(rainfall, baseRainfall) + waterBonus : baseRainfall + waterBonus;
    let queryRainfall = targetR;
    if (rainfall === undefined) {
      queryRainfall = (baseRainfall / 6) + (waterBonus / 2);
    }
    // Clamp rainfall within min-max bounds of dataset to prevent distance skewing
    if (bounds.rainfall) {
      queryRainfall = Math.max(bounds.rainfall.min, Math.min(bounds.rainfall.max, queryRainfall));
    }

    // 4. Normalize query values
    const qN = normalizeWeighted(targetN, "N");
    const qP = normalizeWeighted(targetP, "P");
    const qK = normalizeWeighted(targetK, "K");
    const qT = normalizeWeighted(targetT, "temperature");
    const qH = normalizeWeighted(targetH, "humidity");
    const qPh = normalizeWeighted(targetPh, "ph");
    const qR = normalizeWeighted(queryRainfall, "rainfall");

    const userSoil = soilType.toLowerCase().trim();

    let waterSupply = "medium";
    const wsLower = waterSource.toLowerCase();
    if (wsLower === 'rainfed' || wsLower === 'tank') {
      waterSupply = queryRainfall < 120 ? "low" : "medium";
    } else if (wsLower === 'borewell' || wsLower === 'canal') {
      waterSupply = "high";
    } else if (queryRainfall < 80) {
      waterSupply = "low";
    } else if (queryRainfall >= 150) {
      waterSupply = "high";
    }

    // 5. Evaluate distance to all generated dataset instances
    const cropMatches = [];
    for (const inst of KNN_DATA.instances) {
      const instName = inst.label;
      const iN = normalizeWeighted(inst.N, "N");
      const iP = normalizeWeighted(inst.P, "P");
      const iK = normalizeWeighted(inst.K, "K");
      const iT = normalizeWeighted(inst.temperature, "temperature");
      const iH = normalizeWeighted(inst.humidity, "humidity");
      const iPh = normalizeWeighted(inst.ph, "ph");
      const iR = normalizeWeighted(inst.rainfall, "rainfall");

      let dist = Math.sqrt(
        Math.pow(iN - qN, 2) +
        Math.pow(iP - qP, 2) +
        Math.pow(iK - qK, 2) +
        Math.pow(iT - qT, 2) +
        Math.pow(iH - qH, 2) +
        Math.pow(iPh - qPh, 2) +
        Math.pow(iR - qR, 2)
      );

      const profile = CROP_PROFILES[instName] || {};

      // Soil preference modifier
      const preferred = profile.preferred_soils || [];
      if (preferred.some(s => s.toLowerCase().includes(userSoil) || userSoil.includes(s.toLowerCase()))) {
        dist *= 0.6;
      } else {
        dist *= 2.0;
      }

      // Water supply modifier
      const demand = profile.water_demand || "medium";
      if (demand === waterSupply) {
        dist *= 0.7;
      } else if (demand === "high" && waterSupply === "low") {
        dist *= 3.0;
      } else if (demand === "low" && waterSupply === "high") {
        dist *= 1.5;
      } else {
        dist *= 1.2;
      }

      // Regional suitability modifier
      const regBonus = getRegionalBonus(instName, location);
      dist *= regBonus;

      cropMatches.push({ name: instName, distance: dist });
    }

    // Sort and execute KNN (K = 25 nearest neighbors)
    cropMatches.sort((a, b) => a.distance - b.distance);
    const kNeighbors = cropMatches.slice(0, 25);

    const counts = {};
    for (const neighbor of kNeighbors) {
      counts[neighbor.name] = (counts[neighbor.name] || 0) + 1;
    }

    // 6. Group minimum distances for ALL crops in profiles to rank them
    const cropMinDistances = {};
    cropMatches.forEach(m => {
      if (cropMinDistances[m.name] === undefined || m.distance < cropMinDistances[m.name]) {
        cropMinDistances[m.name] = m.distance;
      }
    });

    // Also compute distances for custom profiles not in the raw instances dataset
    for (const [cropName, profile] of Object.entries(CROP_PROFILES)) {
      if (cropMinDistances[cropName] === undefined) {
        const pN = normalizeWeighted(profile.N, "N");
        const pP = normalizeWeighted(profile.P, "P");
        const pK = normalizeWeighted(profile.K, "K");
        const pT = normalizeWeighted(profile.temp, "temperature");
        const pH = normalizeWeighted(profile.humidity, "humidity");
        const pPh = normalizeWeighted(profile.ph, "ph");
        const pR = normalizeWeighted(profile.rainfall, "rainfall");

        let dist = Math.sqrt(
          Math.pow(pN - qN, 2) +
          Math.pow(pP - qP, 2) +
          Math.pow(pK - qK, 2) +
          Math.pow(pT - qT, 2) +
          Math.pow(pH - qH, 2) +
          Math.pow(pPh - qPh, 2) +
          Math.pow(pR - qR, 2)
        );

        // Apply soil modifier
        const preferred = profile.preferred_soils || [];
        if (preferred.some(s => s.toLowerCase().includes(userSoil) || userSoil.includes(s.toLowerCase()))) {
          dist *= 0.6;
        } else {
          dist *= 2.0;
        }

        // Apply water demand modifier
        const demand = profile.water_demand || "medium";
        if (demand === waterSupply) {
          dist *= 0.7;
        } else if (demand === "high" && waterSupply === "low") {
          dist *= 3.0;
        } else if (demand === "low" && waterSupply === "high") {
          dist *= 1.5;
        } else {
          dist *= 1.2;
        }

        const regBonus = getRegionalBonus(cropName, location);
        dist *= regBonus;

        cropMinDistances[cropName] = dist;
      }
    }

    // Unified scoring: counts * 1000 - minDist
    const rankedCrops = Object.keys(CROP_PROFILES).map(cropName => {
      const knnCount = counts[cropName] || 0;
      const minDist = cropMinDistances[cropName] !== undefined ? cropMinDistances[cropName] : 999;
      return {
        name: cropName,
        knnCount,
        minDist,
        score: knnCount * 1000 - minDist
      };
    });

    rankedCrops.sort((a, b) => b.score - a.score);

    // 7. Functional categorization mapping
    const getCategory = (cropName) => {
      const profile = CROP_PROFILES[cropName.toLowerCase()];
      if (profile && profile.category) {
        const cat = profile.category.toLowerCase();
        if (cat === 'cereal' || cat === 'millet' || cat === 'fodder') return 'food';
        if (cat === 'pulse') return 'pulses';
        if (cat === 'vegetable') return 'vegetable';
        return 'commercial'; // for fruit, oilseed, cash_crop, plantation, fibre_crop, spice
      }
      return null;
    };

    const categorizedRecsRaw = {
      food: [],
      commercial: [],
      vegetable: [],
      pulses: []
    };

    rankedCrops.forEach(item => {
      const cat = getCategory(item.name);
      if (cat) {
        const prob = counts[item.name] ? (counts[item.name] / 25) : (1 / (1 + item.minDist));
        const confidencePercent = Math.round(prob * 100);
        categorizedRecsRaw[cat].push({
          name: item.name,
          probability: prob,
          minDist: item.minDist,
          confidence: `${confidencePercent}%`
        });
      }
    });

    // Keep top 2 crops per category
    for (const cat of ['food', 'commercial', 'vegetable', 'pulses']) {
      categorizedRecsRaw[cat].sort((a, b) => b.probability - a.probability || a.minDist - b.minDist);
      categorizedRecsRaw[cat] = categorizedRecsRaw[cat].slice(0, 2);
    }

    // Flat compatibility top list (top 3 overall)
    const topCrops = rankedCrops.slice(0, 3).map(item => ({
      name: item.name,
      probability: counts[item.name] ? (counts[item.name] / 25) : (1 / (1 + item.minDist))
    }));

    const cropDetailsFallback = {
      rice: { budget: 24000, advice: "Requires high water volume. Keep water levels uniform during sowing.", factors: "Matches clay/loam profile with high moisture retention." },
      paddy: { budget: 24000, advice: "Requires high water volume. Keep water levels uniform during sowing.", factors: "Matches clay/loam profile with high moisture retention." },
      cotton: { budget: 28000, advice: "Treat seeds with fungicides to prevent damping off. Avoid excess nitrogen.", factors: "Excellent fit for well-drained loamy/black soil with moderate water." },
      maize: { budget: 18000, advice: "Provide adequate zinc. Ensure good drainage to prevent waterlogging.", factors: "Fits moderate climate and medium water input capacity." },
      sugarcane: { budget: 35000, advice: "Propagate with healthy setts. Keep soil weed-free for the first 3 months.", factors: "Requires deep soils and prolonged water availability." },
      wheat: { budget: 19000, advice: "Sow in winter. Provide critical irrigations at crown root stage.", factors: "Suitable for loamy/clayey soils with low-moderate temp." },
      barley: { budget: 17000, advice: "Sow early in season. Ensure balanced nitrogen and phosphorus.", factors: "Good tolerance to sandy/alkaline soils with low water requirement." },
      millets: { budget: 15000, advice: "Requires minimal fertilizer. Control weeds during first 20 days.", factors: "Thrives in dry climate and poor red/sandy soil types." },
      fingermillet: { budget: 16000, advice: "Raise nurseries and transplant. Apply organic manure.", factors: "Highly drought resistant crop suitable for poor soils." },
      ragi: { budget: 16000, advice: "Raise nurseries and transplant. Apply organic manure.", factors: "Highly drought resistant crop suitable for poor soils." },
      groundnuts: { budget: 22000, advice: "Ensure gypsum application at pegging. Keep soil loose for peg penetration.", factors: "Prefers well-drained sandy loam or red soils." },
      chickpea: { budget: 21000, advice: "Aerate soil. Ensure inoculants for nitrogen fixation are applied.", factors: "Thrives in black soil with cool weather and low moisture." },
      kidneybeans: { budget: 20000, advice: "Avoid waterlogging. Maintain balanced N-P-K applications.", factors: "Matches mild temperate weather and well-drained soil." },
      pigeonpeas: { budget: 22000, advice: "Watch out for pod borer. Ensure good drainage.", factors: "Drought resistant legume suitable for red/loamy soils." },
      mothbeans: { budget: 14000, advice: "Extremely drought tolerant. Avoid heavy nitrogen fertilizers.", factors: "Optimal for dry sandy soil with minimal water availability." },
      mungbean: { budget: 17000, advice: "Ensure proper weeding. Harvest when pods turn black/brown.", factors: "Short duration crop fitting well-drained loamy/sandy loam soils." },
      blackgram: { budget: 18000, advice: "Apply phosphorus starter. Keep watch for leaf spot.", factors: "Grows well in loam and heavy black soils." },
      lentil: { budget: 19000, advice: "Sow in lines. Avoid excess water during vegetative growth.", factors: "Thrives in cold climate and wide range of soils." },
      pomegranate: { budget: 38000, advice: "Prune regularly. Manage irrigation to prevent fruit cracking.", factors: "Grows in diverse soils; prefers loamy/alluvial and dry air." },
      banana: { budget: 45000, advice: "Requires heavy feeding of nitrogen and potash. Mulch heavily.", factors: "Thrives in rich, humid, alluvial/clayey soils." },
      mango: { budget: 32000, advice: "Prune tree canopy for light. Stop watering 2 months before flowering.", factors: "Deep root system suited for alluvial/loamy/laterite soils." },
      grapes: { budget: 48000, advice: "Prune heavily in winter. Spray fungicides to prevent downy mildew.", factors: "Optimal for sandy loam/alluvial soils and dry warm climates." },
      watermelon: { budget: 21000, advice: "Mulch with plastic to conserve moisture. Pinch off late flowers.", factors: "Requires sandy soil, hot sun, and moderate irrigation." },
      muskmelon: { budget: 22000, advice: "Keep fruit off wet soil. Ensure balanced watering to avoid cracking.", factors: "Requires light sandy loam soil and warm dry climate." },
      apple: { budget: 52000, advice: "Ensure proper chilling hours. Prune during winter dormancy.", factors: "Temperate climate crop requiring rich loamy soil." },
      orange: { budget: 36000, advice: "Apply zinc and iron sprays. Avoid waterlogging around root collar.", factors: "Fits subtropical climate and deep well-drained loamy/alluvial soil." },
      papaya: { budget: 26000, advice: "Avoid planting in clay. Thin out male/female plants as needed.", factors: "Requires warm weather, sandy loam, and quick drainage." },
      coconut: { budget: 29000, advice: "Provide basin watering. Apply salt and ash to base annually.", factors: "Prefers high humidity, sandy loam soil, and coastal climates." },
      jute: { budget: 23000, advice: "Weed early. Harvest when 50% plants are in pod.", factors: "Thrives in alluvial soil and high humidity/monsoon rain." },
      coffee: { budget: 34000, advice: "Prune consistently. Maintain uniform shade trees.", factors: "Optimal for hilly altitude, laterite/red soils, and moderate rain." },
      sapota: { budget: 25000, advice: "Requires minimal care once established. Protect from wind damage.", factors: "Fits well-drained alluvial, sandy loam, or laterite soils." },
      tomato: { budget: 22000, advice: "Provide support stakes for plants. Ensure moderate watering and potassium rich fertilizer.", factors: "Thrives in well-drained loamy/sandy soil with moderate weather." },
      chilli: { budget: 20000, advice: "Avoid overhead watering to prevent leaf diseases. Apply well-composted organic manure.", factors: "Prefers warm climate and well-drained loamy soil." },
      brinjal: { budget: 18000, advice: "Ensure regular irrigation. Watch out for fruit and shoot borer pests.", factors: "Thrives in warm season and sandy loam or silt loam soils." },
      gourd: { budget: 16000, advice: "Provide trellis support. Keep soil moist but not waterlogged.", factors: "Requires warm weather and well-drained sandy loam soil." },
      cucumber: { budget: 15000, advice: "Ensure consistent watering to prevent bitter fruit. Provide trellis for climbing vines.", factors: "Prefers loose well-drained soils with high organic matter." }
    };

    let recommendations = [];
    let categorizedRecs = {};
    let geminiFailed = false;

    // Flatten list of all categorized crops to explain
    const cropsToExplain = [];
    for (const [cat, list] of Object.entries(categorizedRecsRaw)) {
      list.forEach(c => {
        cropsToExplain.push({ name: c.name, category: cat, probability: c.probability });
      });
    }

    try {
      const prompt = `
# Role: Precision Agriculture Expert
You are an expert agronomist specialized in data-driven crop recommendation. 
Your goal is to explain and write dynamic insights for the crop recommendations selected by our K-Nearest Neighbors Classifier.

# Context & Inputs:
- User Location: ${location}
- User Soil Type: ${soilType}
- User Water Source: ${waterSource}
- Temperature: ${targetT}°C, Humidity: ${targetH}%, Soil pH: ${targetPh}, Inferred Rainfall: ${targetR}mm
- Selected Crops to Explain (from KNN classification on the entire Kaggle Dataset):
${JSON.stringify(cropsToExplain)}

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
  "commercial": [...],
  "vegetable": [...],
  "pulses": [...]
}
`;

      console.log('Categorized recommendation requested:', req.body);
      const response = await generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        responseMimeType: 'application/json'
      });

      const aiText = response.text || '';
      const parsedObj = parseJSONFromText(aiText);
      if (!parsedObj || typeof parsedObj !== 'object') {
        throw new Error("Failed to parse valid JSON object from AI output.");
      }

      // Map and validate response
      for (const cat of ['food', 'commercial', 'vegetable', 'pulses']) {
        const list = parsedObj[cat] || [];
        categorizedRecs[cat] = list.map(crop => {
          const rawMatch = categorizedRecsRaw[cat].find(c => c.name.toLowerCase() === crop.name.toLowerCase()) || categorizedRecsRaw[cat][0];
          // Strictly use the KNN model's crop name, NOT the AI's potentially hallucinated name
          const cropProper = rawMatch.name.charAt(0).toUpperCase() + rawMatch.name.slice(1);
          const budget = Number(crop.budgetPerAcre || cropDetailsFallback[crop.name.toLowerCase()]?.budget || 20000);
          return {
            name: cropProper,
            confidence: crop.confidence || `${Math.round(rawMatch.probability * 100)}%`,
            budgetPerAcre: budget,
            keyFactors: crop.keyFactors || `Matches ${soilType} soil and environmental profile.`,
            actionableInsight: crop.actionableInsight || `Ensure standard agronomic prep.`,
            totalBudget: budget * acres
          };
        });
      }

    } catch (err) {
      console.error("Gemini AI failed. Using pure JS Euclidean distance fallback:", err.message);
      geminiFailed = true;
    }

    if (geminiFailed || Object.keys(categorizedRecs).length === 0) {
      for (const cat of ['food', 'commercial', 'vegetable', 'pulses']) {
        categorizedRecs[cat] = categorizedRecsRaw[cat].map(item => {
          const cropProper = item.name.charAt(0).toUpperCase() + item.name.slice(1);
          const confScore = Math.round(item.probability * 100) + "%";
          
          const details = cropDetailsFallback[item.name.toLowerCase()] || {
            budget: 20000,
            advice: "Ensure balanced fertilizer application and proper spacing.",
            factors: `Closest matching crop according to soil (${soilType}) and environment.`
          };

          const budget = details.budget;

          return {
            name: cropProper,
            confidence: confScore + " (KNN Model Match)",
            budgetPerAcre: budget,
            keyFactors: details.factors,
            actionableInsight: details.advice,
            totalBudget: budget * acres
          };
        });
      }
    }

    // Generate flat list of top 3 crops for compatibility
    recommendations = topCrops.map(item => {
      const cropProper = item.name.charAt(0).toUpperCase() + item.name.slice(1);
      const details = cropDetailsFallback[item.name.toLowerCase()] || { budget: 20000, advice: "Standard advice.", factors: "Factors." };
      return {
        name: cropProper,
        confidence: `${Math.round(item.probability * 100)}% (KNN)`,
        budgetPerAcre: details.budget,
        keyFactors: details.factors,
        actionableInsight: details.advice,
        totalBudget: details.budget * acres
      };
    });

    res.json({ ok: true, recommendations, categorized: categorizedRecs });

  } catch (error) {
    console.error("Unhandled Recommendation Error:", error);
    res.status(500).json({ ok: false, message: 'Recommendation service offline.' });
  }
});

// API: save selected crop for monitoring (supports multiple crops)
app.post('/api/select-crop', authenticateToken, (req, res) => {
  const { crop, acres } = req.body;
  const phone = req.userPhone;
  if (!crop) {
    return res.status(400).json({ ok: false, message: 'Missing crop selection' });
  }

  if (!userSelections[phone]) {
    userSelections[phone] = { selections: [] };
  } else if (!userSelections[phone].selections) {
    // Migrate legacy single selection
    const legacy = userSelections[phone];
    userSelections[phone] = { selections: [] };
    if (legacy.crop) {
      userSelections[phone].selections.push({
        crop: legacy.crop,
        acres: legacy.acres || 1.0,
        createdAt: legacy.createdAt || new Date().toISOString()
      });
    }
  }

  // Check if crop already exists
  const existingIdx = userSelections[phone].selections.findIndex(
    s => s.crop.toLowerCase() === crop.toLowerCase()
  );
  const parsedAcres = parseFloat(acres) || 1.0;
  if (existingIdx > -1) {
    userSelections[phone].selections[existingIdx].acres = parsedAcres;
    userSelections[phone].selections[existingIdx].createdAt = new Date().toISOString();
  } else {
    userSelections[phone].selections.push({
      crop,
      acres: parsedAcres,
      createdAt: new Date().toISOString()
    });
  }

  saveSelections(userSelections);
  res.json({ ok: true, selections: userSelections[phone].selections });
});

// API: deselect/remove a crop selection from active monitoring list
app.post('/api/deselect-crop', authenticateToken, (req, res) => {
  const { crop } = req.body;
  const phone = req.userPhone;
  if (!crop) {
    return res.status(400).json({ ok: false, message: 'Missing crop selection to remove' });
  }

  if (userSelections[phone]) {
    if (!userSelections[phone].selections) {
      // Migrate legacy single selection
      const legacy = userSelections[phone];
      userSelections[phone] = { selections: [] };
      if (legacy.crop) {
        userSelections[phone].selections.push({
          crop: legacy.crop,
          acres: legacy.acres || 1.0,
          createdAt: legacy.createdAt || new Date().toISOString()
        });
      }
    }
    userSelections[phone].selections = userSelections[phone].selections.filter(
      s => (s.crop || s.name || "").toLowerCase() !== crop.toLowerCase()
    );
    saveSelections(userSelections);
  }

  res.json({ ok: true, selections: (userSelections[phone] && userSelections[phone].selections) ? userSelections[phone].selections : [] });
});

// API: get selected crop (supports multiple crops for dashboard monitoring card)
app.get('/api/selected-crop', authenticateToken, (req, res) => {
  const phone = req.userPhone;
  if (!phone || !userSelections[phone]) {
    return res.json({ ok: true, selection: null, selections: [] });
  }
  if (!userSelections[phone].selections) {
    const legacy = userSelections[phone];
    userSelections[phone] = {
      selections: [{
        crop: legacy.crop,
        acres: legacy.acres || 1.0,
        createdAt: legacy.createdAt || new Date().toISOString()
      }]
    };
  }
  const selections = userSelections[phone].selections;
  const lastSelection = selections[selections.length - 1] || null;
  res.json({ ok: true, selection: lastSelection, selections });
});

// API: fake market demand
app.get('/api/market-demand', (req, res) => {
  const { location, search } = req.query;
  const locLower = (location || '').toLowerCase();
  const searchLower = (search || '').trim().toLowerCase();

  const csvPath = path.join(__dirname, 'data', 'market_demand.csv');

  if (!fs.existsSync(csvPath)) {
    return res.json({
      ok: true,
      crops: [
        { name: 'Paddy (Sanna Ralu)', commodity: 'Paddy', variety: 'Sanna Ralu', demand: 'High', price: '₹2300 / quintal', market: 'Nizamabad APMC', arrivals: '180 tonnes', date: '2026-06-18' },
        { name: 'Onion (Red Onion)', commodity: 'Onion', variety: 'Red Onion', demand: 'High', price: '₹2200 / quintal', market: 'Lasalgaon Mandi', arrivals: '850 tonnes', date: '2026-06-18' }
      ],
      location: location || 'Your area',
      availableCommodities: ['Paddy', 'Onion']
    });
  }

  const results = [];
  const csv = require('csv-parser');

  fs.createReadStream(csvPath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      // 1. Filter by Location (District or State match)
      let locationFiltered = results.filter(row => {
        const stateMatch = row.State && locLower.includes(row.State.toLowerCase());
        const districtMatch = row.District && locLower.includes(row.District.toLowerCase());
        return stateMatch || districtMatch;
      });

      // If no match found for location, fallback to all results
      if (locationFiltered.length === 0) {
        locationFiltered = results;
      }

      // 2. Filter by Commodity Search if requested, otherwise show high demand
      let finalFiltered = [];
      if (searchLower) {
        finalFiltered = locationFiltered.filter(row => 
          row.Commodity && row.Commodity.toLowerCase().includes(searchLower)
        );
      } else {
        // Show all markets in the area, but prioritize High/Rising demand
        finalFiltered = locationFiltered.sort((a, b) => {
          const score = (d) => d === 'High' ? 3 : d === 'Rising' ? 2 : d === 'Medium' ? 1 : 0;
          return score(b.Demand) - score(a.Demand);
        });
      }

      // Map to frontend structure
      const crops = finalFiltered.map(row => ({
        name: `${row.Commodity} (${row.Variety})`,
        commodity: row.Commodity,
        variety: row.Variety,
        market: row.Market,
        demand: row.Demand,
        price: `₹${row.ModalPrice} / quintal`,
        minPrice: `₹${row.MinPrice}`,
        maxPrice: `₹${row.MaxPrice}`,
        arrivals: `${row.Arrivals} tonnes`,
        date: row.Date
      }));

      // Get unique available commodities in this location for suggestions
      const availableCommodities = [...new Set(locationFiltered.map(row => row.Commodity))];

      res.json({
        ok: true,
        crops: crops,
        location: location || 'Your area',
        availableCommodities: availableCommodities
      });
    })
    .on('error', (err) => {
      console.error("Error reading market CSV:", err.message);
      res.status(500).json({ ok: false, message: 'Failed to read market demand data.' });
    });
});

function parseJSONFromText(text) {
  if (!text) return null;
  const trimmed = text.trim();
  
  try {
    return JSON.parse(trimmed);
  } catch (e) {}
  
  try {
    const stripped = trimmed.replace(/^```json/i, "").replace(/```$/i, "").trim();
    return JSON.parse(stripped);
  } catch (e) {}

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    try {
      const jsonStr = trimmed.substring(start, end + 1);
      return JSON.parse(jsonStr);
    } catch (e) {}
  }

  const startArr = trimmed.indexOf('[');
  const endArr = trimmed.lastIndexOf(']');
  if (startArr !== -1 && endArr !== -1 && endArr > startArr) {
    try {
      const jsonStr = trimmed.substring(startArr, endArr + 1);
      return JSON.parse(jsonStr);
    } catch (e) {}
  }
  
  console.error("parseJSONFromText failed. Raw text:", text);
  return null;
}

// --- Translation & Synonym Maps for Dynamic Crop Fallback ---
const cropFieldsTrans = {
  en: {
    title: "Cultivation Guide (Offline Fallback)",
    category: "Category",
    soil: "Soil Preference",
    ph: "Soil pH",
    climate: "Climate & Water",
    temp: "Temperature",
    water: "Water Demand",
    fertilizer: "Recommended NPK",
    states: "Commonly Grown in",
    tips: "General Tips",
    tip1: "Ensure proper field drainage to prevent root/stem rot.",
    tip2: "Conduct regular soil testing to optimize fertilizer dosage.",
    tip3: "Monitor weather forecasts to plan irrigation and harvesting.",
    unspecified: "Not specified"
  },
  te: {
    title: "సాగు గైడ్ (ఆఫ్‌లైన్ ప్రత్యామ్నాయం)",
    category: "వర్గం",
    soil: "నేల అనుకూలత",
    ph: "నేల పిహెచ్ (pH)",
    climate: "వాతావరణం & నీరు",
    temp: "ఉష్ణోగ్రత",
    water: "నీటి అవసరం",
    fertilizer: "సిఫార్సు చేసిన NPK",
    states: "ప్రధానంగా పండించే రాష్ట్రాలు",
    tips: "సాధారణ సూచనలు",
    tip1: "వేరు కుళ్లు తెగులు నివారణకు పొలంలో నీటి నిల్వ లేకుండా చూసుకోండి.",
    tip2: "ఎరువుల మోతాదును సర్దుబాటు చేయడానికి క్రమం తప్పకుండా నేల పరీక్షలు చేయండి.",
    tip3: "నీటి పారుదల మరియు కోత ప్రణాళిక కోసం వాతావరణ సమాచారాన్ని గమనించండి.",
    unspecified: "తెలియదు"
  },
  hi: {
    title: "खेती मार्गदर्शिका (ऑफ़लाइन विकल्प)",
    category: "श्रेणी",
    soil: "मिट्टी की प्राथमिकता",
    ph: "मिट्टी का पीएच (pH)",
    climate: "जलवायु और पानी",
    temp: "तापमान",
    water: "पानी की आवश्यकता",
    fertilizer: "अनुशंसित एनपीके (NPK)",
    states: "मुख्य उत्पादक राज्य",
    tips: "सामान्य सुझाव",
    tip1: "जड़ सड़न को रोकने के लिए खेत में जल निकासी की उचित व्यवस्था करें।",
    tip2: "उर्वरक की सही मात्रा के लिए नियमित रूप से मिट्टी का परीक्षण करवाएं।",
    tip3: "सिंचाई और कटाई की योजना के लिए मौसम के पूर्वानुमान पर नजर रखें।",
    unspecified: "निर्दिष्ट नहीं"
  },
  mr: {
    title: "लागवड मार्गदर्शिका (ऑफलाईन पर्याय)",
    category: "वर्ग",
    soil: "मातीची पसंती",
    ph: "मातीचा पीएच (pH)",
    climate: "हवामान आणि पाणी",
    temp: "तापमान",
    water: "पाण्याची गरज",
    fertilizer: "शिफारस केलेले एनपीके (NPK)",
    states: "प्रमुख उत्पादक राज्ये",
    tips: "सामान्य सल्ला",
    tip1: "मूळ कुजणे टाळण्यासाठी शेतात पाण्याचा निचरा व्यवस्थित ठेवा.",
    tip2: "खतांची मात्रा निश्चित करण्यासाठी नियमित माती परीक्षण करा.",
    tip3: "पाणी व्यवस्थापन आणि कापणीचे नियोजन करण्यासाठी हवामानाचा अंदाज घ्या.",
    unspecified: "निर्दिष्ट नाही"
  },
  ml: {
    title: "കൃഷി ഗൈഡ് (ഓഫ്‌ലൈൻ ബദൽ)",
    category: "വിഭാഗം",
    soil: "അനുയോജ്യമായ മണ്ണ്",
    ph: "മണ്ണിന്റെ പിഎച്ച് (pH)",
    climate: "കാലാവസ്ഥയും വെള്ളവും",
    temp: "താപനില",
    water: "ജലാവശ്യം",
    fertilizer: "ശുപാർശ ചെയ്ത എൻപികെ (NPK)",
    states: "പ്രധാന ഉൽപ്പാദക സംസ്ഥാനങ്ങൾ",
    tips: "പൊതുവായ നിർദ്ദേശങ്ങൾ",
    tip1: "വേരുചീയൽ തടയാൻ തോട്ടത്തിൽ വെള്ളം കെട്ടിനിൽക്കുന്നത് ഒഴിവാക്കുക.",
    tip2: "വളപ്രയോഗം കൃത്യമാക്കാൻ കൃത്യമായ സമയങ്ങളിൽ മണ്ണ് പരിശോധിക്കുക.",
    tip3: "നനയ്ക്കുന്നതിനും വിളവെടുക്കുന്നതിനും കാലാവസ്ഥാ വിവരങ്ങൾ ശ്രദ്ധിക്കുക.",
    unspecified: "വ്യക്തമല്ല"
  }
};

const valTrans = {
  en: {
    fruit: "Fruit", cereal: "Cereal", millet: "Millet", pulses: "Pulses", vegetable: "Vegetable",
    spice: "Spice", cash: "Cash Crop", oilseed: "Oilseed", plantation: "Plantation Crop", flower: "Flower",
    medicinal: "Medicinal Plant", fodder: "Fodder",
    low: "Low", medium: "Medium", high: "High"
  },
  te: {
    fruit: "పండు", cereal: "ధాన్యం", millet: "చిరుధాన్యాలు", pulses: "పప్పుధాన్యాలు", vegetable: "కూరగాయ",
    spice: "మసాలా దినుసులు", cash: "నగదు పంట", oilseed: "నూనెగింజలు", plantation: "తోట పంట", flower: "పువ్వులు",
    medicinal: "ఔషధ మొక్క", fodder: "పశుగ్రాసం",
    low: "తక్కువ", medium: "మధ్యస్థం", high: "ఎక్కువ"
  },
  hi: {
    fruit: "फल", cereal: "अनाज", millet: "बाजरा/मोटा अनाज", pulses: "दालें", vegetable: "सब्जी",
    spice: "मसाले", cash: "नकदी फसल", oilseed: "तिलहन", plantation: "बागवानी फसल", flower: "फूल",
    medicinal: "औषधीय पौधा", fodder: "चारा",
    low: "कम", medium: "मध्यम", high: "अधिक"
  },
  mr: {
    fruit: "फळ", cereal: "धान्य", millet: "बाजरी/तृणधान्य", pulses: "कडधान्ये", vegetable: "भाजीपाला",
    spice: "मसाले", cash: "नगदी पीक", oilseed: "गळित धान्य", plantation: "बागायत पीक", flower: "फुले",
    medicinal: "औषधी वनस्पती", fodder: "चारा",
    low: "कमी", medium: "मध्यम", high: "जास्त"
  },
  ml: {
    fruit: "ഫലം", cereal: "ധാന്യം", millet: "ചെറുധാന്യങ്ങൾ", pulses: "പയറുവർഗ്ഗങ്ങൾ", vegetable: "പച്ചക്കറി",
    spice: "വ്യഞ്ജനങ്ങൾ", cash: "നാണ്യവിള", oilseed: "എണ്ണക്കുരുക്കൾ", plantation: "തോട്ടവിള", flower: "പൂക്കൾ",
    medicinal: "ഔഷധസസ്യം", fodder: "തീറ്റപ്പുല്ല്",
    low: "കുറഞ്ഞത്", medium: "മിതമായത്", high: "കൂടുതൽ"
  }
};

const localCropSynonyms = {
  papaya: ['papaya', 'पपीता', 'బొప్పాయి', 'पपई', 'പപ്പായ'],
  banana: ['banana', 'केला', 'అరటి', 'केळी', 'വാഴപ്പഴം', 'ഏത്തപ്പഴം'],
  rice: ['rice', 'paddy', 'धान', 'चावल', 'వరి', 'భూదేవి', 'भात', 'നെല്ല്', 'അരി'],
  wheat: ['wheat', 'गेहूं', 'గోధుమ', 'गहू', 'ഗോതമ്പ്'],
  maize: ['maize', 'corn', 'मक्का', 'మొక్కజొన్న', 'मका', 'ചോളം'],
  cotton: ['cotton', 'कपास', 'పత్తి', 'कापूस', 'പരുത്തി'],
  coconut: ['coconut', 'नारियल', 'కొబ్బరి', 'नारळ', 'തേങ്ങ'],
  coffee: ['coffee', 'कॉफी', 'కాఫీ', 'कॅाफी', 'കാപ്പി'],
  mango: ['mango', 'आम', 'మామిడి', 'आंबा', 'മാമ്പഴം', 'മാവ്'],
  tomato: ['tomato', 'टमाटर', 'టమోటా', 'टोमॅटो', 'തക്കാളി'],
  chilli: ['chilli', 'chili', 'mirchi', 'मिर्च', 'मिर्ची', 'మిర్చి', 'मिरची', 'മുളക്'],
  sugarcane: ['sugarcane', 'गन्ना', 'చెరకు', 'ऊस', 'കരിമ്പ്'],
  potato: ['potato', 'आलू', 'బంగాళదుంప', 'बटाटा', 'ഉരുളക്കിഴങ്ങ്'],
  onion: ['onion', 'प्याज', 'ఉల్లిపాయ', 'कांदा', 'സവാള', 'ഉള്ളി']
};

// --- Smart Local Fallbacks for Chat and Disease Detection when API key fails/offline ---
function getFallbackChatResponse(message, lang) {
  const msgLower = (message || '').toLowerCase();
  
  // 1. Unrelated topics guardrails
  const unrelatedKeywords = ['coding', 'programming', 'javascript', 'python', 'mathematics', 'history', 'geography', 'pop culture', 'movie', 'actor', 'essay', 'physics', 'chemistry', 'biology', 'calculus', 'algebra'];
  if (unrelatedKeywords.some(keyword => msgLower.includes(keyword))) {
    if (lang === 'te') {
      return "నేను సారథిని, మీ వ్యవసాయ సహాయకుడిని. నేను పంటలు, వ్యవసాయం, వాతావరణం మరియు మార్కెట్ సమాచారానికి సంబంధించిన ప్రశ్నలకు మాత్రమే సమాధానం చెప్పగలను. దయచేసి ఈ అంశాలకు సంబంధించిన ప్రశ్న అడగండి.";
    } else if (lang === 'hi') {
      return "मैं सारथी हूँ, आपका कृषि सहायक। मैं केवल फसलों, खेती, मौसम और कृषि बाजार से संबंधित प्रश्नों में ही आपकी सहायता कर सकता हूँ। कृपया इन विषयों से संबंधित प्रश्न पूछें।";
    } else if (lang === 'mr') {
      return "मी सारथी आहे, तुमचा कृषी सहाय्यक। मी फक्त पीक, शेती, हवामान आणि बाजार दरांशी संबंधित प्रश्नांची उत्तरे देऊ शकतो. कृपया या विषयांवर प्रश्न विचारा.";
    } else if (lang === 'ml') {
      return "ഞാൻ സാരഥിയാണ്, നിങ്ങളുടെ കാർഷിക സഹായി. കൃഷി, കാലാവസ്ഥ, വിപണി വിവരങ്ങൾ എന്നിവയുമായി ബന്ധപ്പെട്ട സംശയങ്ങൾക്ക് മാത്രമേ എനിക്ക് മറുപടി നൽകാൻ സാധിക്കൂ. ദയവായി ഈ വിഷയങ്ങളുമായി ബന്ധപ്പെട്ട ചോദ്യങ്ങൾ ചോദിക്കുക.";
    } else {
      return "I am SAARTHI, your agricultural assistant. I can only assist you with crop-related issues, farming, weather, and agricultural market information. Please ask a question related to these topics.";
    }
  }

  // 1.5. Dynamic Crop Cultivation Fallback
  let matchedCropKey = null;
  let matchedProfile = null;

  // Layer 1: Local Multilingual Synonyms Dictionary
  for (const [key, syns] of Object.entries(localCropSynonyms)) {
    if (syns.some(s => msgLower.includes(s))) {
      const profileKey = Object.keys(GLOBAL_CROP_PROFILES).find(k => k.toLowerCase() === key);
      if (profileKey) {
        matchedCropKey = profileKey;
        matchedProfile = GLOBAL_CROP_PROFILES[profileKey];
        break;
      }
    }
  }

  // Layer 2: Exact Key substring & Alternative Parentheses matching
  if (!matchedCropKey) {
    for (const [key, profile] of Object.entries(GLOBAL_CROP_PROFILES)) {
      const lowerKey = key.toLowerCase();
      if (msgLower.includes(lowerKey)) {
        matchedCropKey = key;
        matchedProfile = profile;
        break;
      }
      const match = lowerKey.match(/^([^(]+)\(([^)]+)\)$/);
      if (match) {
        const mainName = match[1].trim();
        const altName = match[2].trim();
        if (msgLower.includes(mainName) || msgLower.includes(altName)) {
          matchedCropKey = key;
          matchedProfile = profile;
          break;
        }
      }
    }
  }

  if (matchedCropKey && matchedProfile) {
    const t = cropFieldsTrans[lang] || cropFieldsTrans.en;
    const v = valTrans[lang] || valTrans.en;

    const displayName = matchedCropKey.split(' ').map(w => {
      if (w.startsWith('(')) {
        return '(' + w.charAt(1).toUpperCase() + w.slice(2);
      }
      return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(' ');

    const categoryText = v[matchedProfile.category] || matchedProfile.category || t.unspecified;
    const soilsText = matchedProfile.preferred_soils ? matchedProfile.preferred_soils.join(', ') : t.unspecified;
    const phText = (matchedProfile.ph_min !== undefined && matchedProfile.ph_max !== undefined) 
      ? `${matchedProfile.ph_min} - ${matchedProfile.ph_max}` 
      : (matchedProfile.ph ? matchedProfile.ph.toFixed(1) : t.unspecified);
    const tempText = (matchedProfile.temp_min !== undefined && matchedProfile.temp_max !== undefined)
      ? `${matchedProfile.temp_min}°C - ${matchedProfile.temp_max}°C`
      : (matchedProfile.temp ? `${matchedProfile.temp.toFixed(1)}°C` : t.unspecified);
    const waterText = v[matchedProfile.water_demand] || matchedProfile.water_demand || t.unspecified;
    
    let npkText = t.unspecified;
    if (matchedProfile.N !== undefined && matchedProfile.P !== undefined && matchedProfile.K !== undefined) {
      npkText = `${Math.round(matchedProfile.N)} - ${Math.round(matchedProfile.P)} - ${Math.round(matchedProfile.K)}`;
    }
    const statesText = matchedProfile.states ? matchedProfile.states.join(', ') : t.unspecified;

    if (lang === 'te') {
      return `🌿 **${displayName} ${t.title}**\n\n` +
             `- **${t.category}:** ${categoryText}\n` +
             `- **${t.soil}:** ${soilsText}\n` +
             `- **${t.ph}:** ${phText}\n` +
             `- **${t.climate}:** ${tempText} (${t.water}: ${waterText})\n` +
             `- **${t.fertilizer}:** ${npkText} (కిలోలు/హెక్టారు)\n` +
             `- **${t.states}:** ${statesText}\n\n` +
             `**${t.tips}:**\n` +
             `1. ${t.tip1}\n` +
             `2. ${t.tip2}\n` +
             `3. ${t.tip3}`;
    } else if (lang === 'hi') {
      return `🌿 **${displayName} ${t.title}**\n\n` +
             `- **${t.category}:** ${categoryText}\n` +
             `- **${t.soil}:** ${soilsText}\n` +
             `- **${t.ph}:** ${phText}\n` +
             `- **${t.climate}:** ${tempText} (${t.water}: ${waterText})\n` +
             `- **${t.fertilizer}:** ${npkText} (किग्रा/हेक्टेयर)\n` +
             `- **${t.states}:** ${statesText}\n\n` +
             `**${t.tips}:**\n` +
             `1. ${t.tip1}\n` +
             `2. ${t.tip2}\n` +
             `3. ${t.tip3}`;
    } else if (lang === 'mr') {
      return `🌿 **${displayName} ${t.title}**\n\n` +
             `- **${t.category}:** ${categoryText}\n` +
             `- **${t.soil}:** ${soilsText}\n` +
             `- **${t.ph}:** ${phText}\n` +
             `- **${t.climate}:** ${tempText} (${t.water}: ${waterText})\n` +
             `- **${t.fertilizer}:** ${npkText} (किग्रॅ/हेक्टर)\n` +
             `- **${t.states}:** ${statesText}\n\n` +
             `**${t.tips}:**\n` +
             `1. ${t.tip1}\n` +
             `2. ${t.tip2}\n` +
             `3. ${t.tip3}`;
    } else if (lang === 'ml') {
      return `🌿 **${displayName} ${t.title}**\n\n` +
             `- **${t.category}:** ${categoryText}\n` +
             `- **${t.soil}:** ${soilsText}\n` +
             `- **${t.ph}:** ${phText}\n` +
             `- **${t.climate}:** ${tempText} (${t.water}: ${waterText})\n` +
             `- **${t.fertilizer}:** ${npkText} (കിലോഗ്രാം/ഹെക്ടർ)\n` +
             `- **${t.states}:** ${statesText}\n\n` +
             `**${t.tips}:**\n` +
             `1. ${t.tip1}\n` +
             `2. ${t.tip2}\n` +
             `3. ${t.tip3}`;
    } else {
      return `🌿 **${displayName} ${t.title}**\n\n` +
             `- **${t.category}:** ${categoryText}\n` +
             `- **${t.soil}:** ${soilsText}\n` +
             `- **${t.ph}:** ${phText}\n` +
             `- **${t.climate}:** ${tempText} (${t.water}: ${waterText})\n` +
             `- **${t.fertilizer}:** ${npkText} (kg/ha)\n` +
             `- **${t.states}:** ${statesText}\n\n` +
             `**${t.tips}:**\n` +
             `1. ${t.tip1}\n` +
             `2. ${t.tip2}\n` +
             `3. ${t.tip3}`;
    }
  }

  // 2. Crop disease / leaf spot / paddy
  if (msgLower.includes('disease') || msgLower.includes('spot') || msgLower.includes('leaf') || msgLower.includes('paddy') || msgLower.includes('rice') || msgLower.includes('తేగులు') || msgLower.includes('మచ్చ') || msgLower.includes('వరి') || msgLower.includes('रोग') || msgLower.includes('धब्बा') || msgLower.includes('धान') || msgLower.includes('ठिपके') || msgLower.includes('भात') || msgLower.includes('നെല്ല്') || msgLower.includes('ഇലപ്പുള്ളി')) {
    if (lang === 'te') {
      return "వరి ఆకులపై గోధుమ రంగు మచ్చలు ఉంటే, అది ఆకుమచ్చ తెగులు (Leaf Blast / Brown Spot) కావచ్చు. నివారణకు:\n- పొలంలో నీటి నిల్వలను నివారించి సరైన నీటి పారుదల కల్పించండి.\n- మోతాదుకు మించి నత్రజని ఎరువులు వేయకండి.\n- అవసరమైతే ట్రైసైక్లాజోల్ (Tricyclazole) లేదా హెక్సాకోనాజోల్ పిచికారీ చేయండి.";
    } else if (lang === 'hi') {
      return "यदि धान की पत्तियों पर भूरे धब्बे हैं, तो यह धान का झोंका (Leaf Blast) या भूरा धब्बा रोग हो सकता है। नियंत्रण के उपाय:\n- खेत में जल निकासी की उचित व्यवस्था करें।\n- नाइट्रोजन उर्वरकों का अधिक उपयोग करने से बचें।\n- रोग के प्रकोप के आधार पर ट्राइसाइक्लाजोल (Tricyclazole) या हेक्साकोनाजोल का छिड़काव करें।";
    } else if (lang === 'mr') {
      return "भाताच्या पानांवर तपकिरी ठिपके असल्यास तो करपा रोग (Leaf Blast) असू शकतो. नियंत्रणासाठी उपाय:\n- शेतात पाण्याचा योग्य निचरा ठेवा आणि जास्त पाणी साचू देऊ नका.\n- नत्र खतांचा (Nitrogen) गरजेपेक्षा जास्त वापर टाळा.\n- तीव्र प्रादुर्भाव असल्यास ट्रायसायक्लाझोल (Tricyclazole) कवकनाशकाची फवारणी करा.";
    } else if (lang === 'ml') {
      return "നെല്ലിലെ ഇലകളിൽ തവിട്ടുനിറത്തിലുള്ള പാടുകൾ കാണുന്നുണ്ടെങ്കിൽ അത് ഇലപ്പുള്ളി രോഗമാകാം. പ്രതിരോധ മാർഗ്ഗങ്ങൾ:\n- വയലിൽ അധിക വെള്ളം കെട്ടിനിൽക്കാൻ അനുവദിക്കരുത്.\n- നൈട്രജൻ വളങ്ങൾ അമിതമായി നൽകുന്നത് ഒഴിവാക്കുക.\n- ആവശ്യമെങ്കിൽ ട്രൈസൈക്ലാസോൾ കീടനാശിനി വിദഗ്ദ്ധ നിർദ്ദേശപ്രകാരം ഉപയോഗിക്കുക.";
    } else {
      return "If you observe brown spots on paddy or crop leaves, it could be Leaf Blast or Fungal Spot disease. Recommended management:\n- Ensure proper field drainage and avoid waterlogging.\n- Apply balanced Nitrogen fertilizer doses (do not over-fertilize).\n- For chemical control, apply Tricyclazole or Hexaconazole fungicides under agronomist guidance.";
    }
  }

  // 3. Cotton / Fertilizer / Soil
  if (msgLower.includes('cotton') || msgLower.includes('fertilizer') || msgLower.includes('soil') || msgLower.includes('పత్తి') || msgLower.includes('ఎరువు') || msgLower.includes('నేల') || msgLower.includes('कपास') || msgLower.includes('उर्वरक') || msgLower.includes('मिट्टी') || msgLower.includes('खत') || msgLower.includes('माती') || msgLower.includes('പരുത്തി') || msgLower.includes('വളം') || msgLower.includes('മണ്ണ്')) {
    if (lang === 'te') {
      return "నల్ల రేగడి నేల పత్తి పంటకు చాలా అనుకూలమైనది. ఎరువుల యాజమాన్యం:\n- పత్తికి హెక్టారుకు 120:60:60 కిలోల NPK నిష్పత్తి ఆదర్శవంతమైనది.\n- నత్రజని ఎరువును 3 విడతలుగా వేయండి (పంట విత్తినప్పుడు, 30 రోజులకు, 60 రోజులకు).\n- ఆకులు ఎర్రబడకుండా ఉండటానికి మెగ్నీషియం సల్ఫేట్ ద్రావణాన్ని పిచికారీ చేయండి.";
    } else if (lang === 'hi') {
      return "काली मिट्टी कपास की खेती के लिए सर्वोत्तम मानी जाती है। उर्वरक प्रबंधन सुझाव:\n- कपास के लिए प्रति हेक्टेयर 120:60:60 किलोग्राम एनपीके (NPK) का अनुपात आदर्श है।\n- नाइट्रोजन को तीन बराबर भागों में बांटकर डालें (बुवाई के समय, 30 दिन और 60 दिन बाद)।\n- पत्तियों को लाल होने से बचाने के लिए 1% मैग्नीशियम सल्फेट का छिड़काव करें।";
    } else if (lang === 'mr') {
      return "काळ्या मातीत कापूस पिकाचे उत्पादन चांगले येते. खत व्यवस्थापन सल्ला:\n- कापूस पिकासाठी प्रति हेक्टरी १२१:६१:६१ किलो एनपीके खतांचे प्रमाण योग्य आहे.\n- नत्र खत तीन हप्त्यांमध्ये विभागून द्या (पेरणीच्या वेळी, ३० दिवसांनी आणि ६० दिवसांनी).\n- पानांचा लालसरपणा रोखण्यासाठी मॅग्नेशियम सल्फेटची फवारणी करा.";
    } else if (lang === 'ml') {
      return "കരിമണ്ണ് പരുത്തി കൃഷിക്ക് വളരെ അനുയോജ്യമാണ്. വളപ്രയോഗ നിർദ്ദേശങ്ങൾ:\n- പരുത്തിക്ക് ഹെക്ടറിന് 120:60:60 കിലോഗ്രാം എൻപികെ (NPK) എന്ന തോതിൽ നൽകുന്നത് ഉത്തമമാണ്.\n- നൈട്രജൻ വളങ്ങൾ മൂന്ന് തവണകളായി വിഭജിച്ച് നൽകുക.\n- ഇലകൾ ചുവക്കുന്നത് തടയാൻ മഗ്നീഷ്യം സൾഫേറ്റ് സ്പ്രേ ചെയ്യുക.";
    } else {
      return "For cotton cultivation in black soil, a balanced NPK nutrient ratio of 120:60:60 kg/ha is recommended:\n- Apply Nitrogen fertilizer in three split doses (at sowing, 30 days, and 60 days of crop growth).\n- To prevent leaf reddening, spray 1% Magnesium Sulphate solution.\n- Conduct a soil test to adjust micro-nutrients like Zinc and Boron.";
    }
  }

  // 4. Weather / Harvesting
  if (msgLower.includes('weather') || msgLower.includes('rain') || msgLower.includes('harvest') || msgLower.includes('వాతావరణం') || msgLower.includes('వర్షం') || msgLower.includes('కోత') || msgLower.includes('मौसम') || msgLower.includes('बारिश') || msgLower.includes('कटाई') || msgLower.includes('पाऊस') || msgLower.includes('कापणी') || msgLower.includes('മഴ') || msgLower.includes('വിളവെടുപ്പ്')) {
    if (lang === 'te') {
      return "వర్షం పడే సూచనలు ఉన్నప్పుడు పంట కోయడం వాయిదా వేయండి. కోత తర్వాత సూచనలు:\n- కోసిన ధాన్యాన్ని నిల్వ చేసే ముందు తేమ శాతం 12-14% కంటే తక్కువ ఉండేలా బాగా ఆరబెట్టండి.\n- తేమ ఎక్కువగా ఉంటే ధాన్యం బూజు పట్టి పాడయ్యే అవకాశం ఉంది.\n- మీ ప్రాంతంలోని వాతావరణ హెచ్చరికలను ఎప్పటికప్పుడు గమనించండి.";
    } else if (lang === 'hi') {
      return "बारिश की संभावना होने पर फसल की कटाई स्थगित कर दें। कटाई के बाद के निर्देश:\n- अनाज को भंडारित करने से पहले उसमें नमी की मात्रा 12-14% तक लाने के लिए अच्छी तरह सुखाएं।\n- उच्च नमी से अनाज में फफूंद (Fungus) लगने और सड़ने का खतरा रहता है।\n- स्थानीय मौसम पूर्वानुमान पर नजर बनाए रखें।";
    } else if (lang === 'mr') {
      return "पावसाची शक्यता असल्यास पिकाची कापणी पुढे ढकला. कापणीनंतरचा सल्ला:\n- साठवणुकीपूर्वी धान्यातील ओलावा १२ ते १४ टक्क्यांपर्यंत खाली येईपर्यंत ते चांगले वाळवा.\n- धान्यात जास्त ओलावा राहिल्यास बुरशी लागण्याचा आणि धान्य सडण्याचा धोका असतो.\n- स्थानिक हवामान विभागाच्या इशाऱ्यांकडे लक्ष द्या.";
    } else if (lang === 'ml') {
      return "മഴയ്ക്ക് സാധ്യതയുണ്ടെങ്കിൽ വിളവെടുപ്പ് മാറ്റിവെയ്ക്കുക. വിളവെടുപ്പിന് ശേഷം ചെയ്യേണ്ടത്:\n- സൂക്ഷിച്ചുവെക്കുന്നതിന് മുൻപ് ധാന്യങ്ങൾ നന്നായി ഉണക്കി ഈർപ്പം 12-14% ആയി കുറയ്ക്കുക.\n- ഈർപ്പം കൂടിയാൽ പൂപ്പൽ വരാനും ധാന്യങ്ങൾ നശിക്കാനും സാധ്യതയുണ്ട്.\n- തദ്ദേശീയ കാലാവസ്ഥാ പ്രവചനങ്ങൾ ശ്രദ്ധിക്കുക.";
    } else {
      return "Avoid harvesting crops when heavy rainfall is forecasted. Post-harvest advice:\n- Dry the harvested produce thoroughly to achieve a moisture content of 12-14% before storage.\n- Storing grain with high moisture leads to fungal infection and grain spoilage.\n- Monitor local meteorological forecasts regularly.";
    }
  }

  // 5. Market Demand
  if (msgLower.includes('market') || msgLower.includes('demand') || msgLower.includes('price') || msgLower.includes('మంచి డిమాండ్') || msgLower.includes('ధర') || msgLower.includes('మార్కెట్') || msgLower.includes('बाजार') || msgLower.includes('मांग') || msgLower.includes('भाव') || msgLower.includes('दर') || msgLower.includes('വിപണി') || msgLower.includes('വില')) {
    if (lang === 'te') {
      return "ప్రస్తుతం మార్కెట్లో అధిక డిమాండ్ మరియు లాభదాయకమైన ధరలు ఉన్న పంటలు:\n- వరి (సన్న రకాలు), మొక్కజొన్న, కందిపప్పు (తుర్ దాల్).\n- మీ సమీప మండి (APMC) రోజువారీ ధరలను గమనించి పంటను అమ్ముకోవాల్సిందిగా సలహా.\n- పంటను ఒకేసారి కాకుండా దశలవారీగా మార్కెట్‌కు తరలించడం లాభదాయకం.";
    } else if (lang === 'hi') {
      return "इस समय बाजार में जिन फसलों की अच्छी मांग और भाव हैं, वे हैं:\n- धान (बासमती व महीन किस्में), मक्का, अरहर (तुअर दाल)।\n- अपने नजदीकी मंडी (APMC) के दैनिक भावों की जांच करें और सही समय पर फसल बेचें।\n- कीमतों में सुधार होने तक अनाज को सुरक्षित रूप से भंडारित करने पर विचार करें।";
    } else if (lang === 'mr') {
      return "सध्या बाजारपेठेत खालील पिकांना चांगली मागणी व भाव मिळत आहे:\n- भात (बासमती), मका आणि तुरीची डाळ.\n- आपल्या जवळच्या कृषी उत्पन्न बाजार समितीच्या (APMC) रोजच्या दरांची माहिती घ्या.\n- बाजारात आवक कमी असताना पीक विकणे अधिक फायद्याचे ठरते.";
    } else if (lang === 'ml') {
      return "നിലവിൽ വിപണിയിൽ ഉയർന്ന ഡിമാൻഡും മികച്ച വിലയുമുള്ള വിളകൾ താഴെ പറയുന്നവയാണ്:\n- നെല്ല്, ചോളവും, തുവരപ്പരിപ്പും, പച്ചക്കറികൾ.\n- കൂടുതൽ വിവരങ്ങൾക്ക് അടുത്തുള്ള വിപണി നിരക്കുകൾ പരിശോധിക്കുക.";
    } else {
      return "Currently, commodities with strong market demand and positive price trends include:\n- Premium Paddy (Basmati/Fine quality), Maize, pulses like Pigeon Peas (Tur Dal), and Oilseeds.\n- It is advised to monitor daily rates at your nearest APMC mandi to optimize your sales timing.\n- Consider crop grading and clean sorting to fetch higher premiums.";
    }
  }

  // 6. Generic Greeting / Help Response
  if (lang === 'te') {
    return "నమస్కారం! నేను సారథిని (SAARTHI). వ్యవసాయంలో మీకు సహాయపడటానికి నేను ఇక్కడ ఉన్నాను. మీరు నన్ను వరి, పత్తి పంటల సాగు పద్ధతులు, ఎరువుల యాజమాన్యం, వ్యాధుల నివారణ లేదా మార్కెట్ ధరల గురించి అడగవచ్చు.";
  } else if (lang === 'hi') {
    return "नमस्ते! मैं सारथी (SAARTHI) हूँ। कृषि कार्यों में आपकी सहायता के लिए मैं उपस्थित हूँ। आप मुझसे धान या कपास की खेती, खाद प्रबंधन, कीट-रोग नियंत्रण अथवा मंडी भाव के बारे में प्रश्न पूछ सकते हैं।";
  } else if (lang === 'mr') {
    return "नमस्कार! मी सारथी (SAARTHI) आहे. शेती कामांमध्ये तुम्हाला मदत करण्यासाठी मी तयार आहे. तुम्ही मला भात किंवा कापूस लागवड, खत व्यवस्थापन, कीड नियंत्रण किंवा बाजारभावाविषयी विचारू शकता.";
  } else if (lang === 'ml') {
    return "നമസ്കാരം! ഞാൻ സാരഥിയാണ് (SAARTHI). കൃഷി സംബന്ധമായ ആവശ്യങ്ങളിൽ നിങ്ങളെ സഹായിക്കാൻ ഞാൻ ഇവിടെയുണ്ട്. നെല്ല്, പരുത്തി കൃഷി രീതികൾ, വളപ്രയോഗം, രോഗങ്ങൾ എന്നിവയെക്കുറിച്ച് ചോദിക്കാവുന്നതാണ്.";
  } else {
    return "Hello! I am SAARTHI, your agricultural assistant. How can I help you today?";
  }
}

function getFallbackDiseaseResponse(lang) {
  if (lang === 'te') {
    return {
      disease: "ఆకుమచ్చ తెగులు / శిలీంధ్ర ఇన్ఫెక్షన్ (ఆఫ్‌లైన్ ప్రత్యామ్నాయ నిర్ధారణ)",
      severity: "మధ్యస్థం (Moderate)",
      advice: [
        "వ్యాధి మరింత వ్యాపించకుండా ఉండటానికి సోకిన ఆకులను కత్తిరించి పొలానికి దూరంగా నాశనం చేయండి.",
        "మొక్కల పైనుండి నీరు పోయడం నివారించండి; తేమను తగ్గించడానికి మొక్కల మొదట్లో మాత్రమే నీటి తడులు ఇవ్వండి.",
        "వేప నూనె 5ml ఒక లీటరు నీటిలో కలిపి పిచికారీ చేయండి లేదా కాపర్ ఆక్సిక్లోరైడ్ 3g ని పిచికారీ చేయండి."
      ]
    };
  } else if (lang === 'hi') {
    return {
      disease: "फंगल लीफ स्पॉट (ऑफ़लाइन वैकल्पिक निदान)",
      severity: "मध्यम (Moderate)",
      advice: [
        "संक्रमण को खेत में फैलने से रोकने के लिए प्रभावित रोगग्रस्त पत्तियों को तुरंत काटकर नष्ट करें।",
        "पौधों के ऊपर छिड़काव विधि से पानी देने से बचें; सिंचाई केवल जड़ों में करें ताकि पत्तियों पर नमी न रहे।",
        "जैविक नियंत्रण के लिए नीम के तेल (5 मिली/लीटर) का छिड़काव करें या उपयुक्त कॉपर ऑक्सीक्लोराइड कवकनाशी का प्रयोग करें।"
      ]
    };
  } else if (lang === 'mr') {
    return {
      disease: "तांबेरा किंवा पानांवरील ठिपके (ऑफलाईन पर्यायी निदान)",
      severity: "मध्यम (Moderate)",
      advice: [
        "रोगाचा पुढील प्रादुर्भाव टाळण्यासाठी रोगट पाने त्वरित तोडून नष्ट करावीत.",
        "पिकाच्या वरून पाणी देणे टाळावे जेणेकरून पानांवर ओलावा राहणार नाही आणि बुरशी वाढणार नाही.",
        "५ मिली कडुनिंबाचे तेल प्रति लिटर पाण्यात मिसळून फवारावे किंवा योग्य कॉपर-आधारित कवकनाशकाचा वापर करावा."
      ]
    };
  } else if (lang === 'ml') {
    return {
      disease: "ഇലപ്പുള്ളി രോഗം (ഓഫ്‌ലൈൻ ബദൽ രോഗനിർണ്ണയം)",
      severity: "മിതത്വം (Moderate)",
      advice: [
        "രോഗം ബാധിച്ച ഇലകൾ മുറിച്ചുമാറ്റി നശിപ്പിച്ചു കളയുക.",
        "ഇലകൾ നനയാതിരിക്കാൻ ചെടിയുടെ ചുവട്ടിൽ മാത്രം നനയ്ക്കുക.",
        "വേപ്പെണ്ണ ലായനി തളിക്കുകയോ കോപ്പർ ഓക്സിക്ലോറൈഡ് കീടനാശിനി വിദഗ്ദ്ധോപദേശപ്രകാരം ഉപയോഗിക്കുകയോ ചെയ്യുക."
      ]
    };
  } else {
    return {
      disease: "Fungal Leaf Spot (Offline Fallback Diagnosis)",
      severity: "Moderate",
      advice: [
        "Prune and destroy infected leaves immediately to prevent fungal spores from spreading further.",
        "Avoid overhead irrigation; apply water directly to the soil base to keep the foliage dry.",
        "Spray organic neem oil solution (5ml/L) or apply copper-based fungicides after consulting a local agronomy expert."
      ]
    };
  }
}

let chatModel = null;
try {
  const modelPath = path.join(__dirname, 'models', 'chat_intent_model.json');
  if (fs.existsSync(modelPath)) {
    chatModel = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
    console.log("Chatbox intent classifier model loaded successfully.");
  } else {
    console.warn("Chatbox intent classifier model not found. Fallback mode active.");
  }
} catch (err) {
  console.error("Failed to load chatbox intent classifier model:", err);
}

function classifyQueryLocal(query) {
  if (!chatModel) {
    return { intent: 'agriculture', confidence: 1.0 };
  }
  
  if (!query || !query.trim()) {
    return { intent: 'unrelated', confidence: 1.0 };
  }

  // 1. Tokenize query supporting English, Hindi, Telugu, Marathi, Malayalam characters
  const rawWords = query.toLowerCase().match(/[\w\u0900-\u097F\u0C00-\u0C7F\u0D00-\u0D7F]+/g) || [];
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
    if (chatModel.vocabulary[term] !== undefined) {
      termCounts[term] = (termCounts[term] || 0) + 1;
    }
  });

  // 4. Calculate TF-IDF features
  const tfidfFeatures = {};
  for (const [term, count] of Object.entries(termCounts)) {
    const idx = chatModel.vocabulary[term];
    const tf = chatModel.sublinear_tf ? (1 + Math.log(count)) : count;
    const idf = chatModel.idf[idx];
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
  let z = chatModel.intercept;
  for (const [idx, val] of Object.entries(normalizedFeatures)) {
    z += chatModel.coef[idx] * val;
  }

  const prob_1 = 1 / (1 + Math.exp(-z));
  const prob_0 = 1 - prob_1;

  const intent = prob_1 >= 0.5 ? 'agriculture' : 'unrelated';
  const confidence = prob_1 >= 0.5 ? prob_1 : prob_0;

  return { intent, confidence };
}

const langRefusalMap = {
  te: "నేను సారథిని, మీ వ్యవసాయ సహాయకుడిని. నేను పంటలు, వ్యవసాయం, వాతావరణం మరియు మార్కెట్ సమాచారానికి సంబంధించిన ప్రశ్నలకు మాత్రమే సమాధానం చెప్పగలను. దయచేసి ఈ అంశాలకు సంబంధించిన ప్రశ్న అడగండి.",
  hi: "मैं सारथी हूँ, आपका कृषि सहायक। मैं केवल फसलों, खेती, मौसम और कृषि बाजार से संबंधित प्रश्नों में ही आपकी सहायता कर सकता हूँ। कृपया इन विषयों से संबंधित प्रश्न पूछें।",
  mr: "मी सारथी आहे, तुमचा कृषी सहाय्यक। मी फक्त पीक, शेती, हवामान आणि बाजार दरांशी संबंधित प्रश्नांची उत्तरे देऊ शकतो. कृपया या विषयांवर प्रश्न विचारा.",
  ml: "ഞാൻ സാരഥിയാണ്, നിങ്ങളുടെ കാർഷിക സഹായി. കൃഷി, കാലാവസ്ഥ, വിപണി വിവരങ്ങൾ എന്നിവയലുമായി ബന്ധപ്പെട്ട സംശയങ്ങൾക്ക് മാത്രമേ എനിക്ക് മറുപടി നൽകാൻ സാധിക്കൂ. ദയവായി ഈ വിഷയങ്ങളുമായി ബന്ധപ്പെട്ട ചോദ്യങ്ങൾ ചോദിക്കുക.",
  en: "I am SAARTHI, your agricultural assistant. I can only assist you with crop-related issues, farming, weather, and agricultural market information. Please ask a question related to these topics."
};

const chatRateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

// API: Real-time intelligent AI Chatbox via Gemini (Multimodal)
app.post('/api/chat', authenticateToken, upload.single('image'), async (req, res) => {
  const message = req.body.message || '';
  const lang = req.body.lang || 'en';

  const userKey = req.userPhone || req.ip;
  const now = Date.now();
  const userLimit = chatRateLimitMap.get(userKey) || { count: 0, startTime: now };

  if (now - userLimit.startTime > RATE_LIMIT_WINDOW_MS) {
    userLimit.count = 1;
    userLimit.startTime = now;
  } else {
    userLimit.count += 1;
    if (userLimit.count > MAX_REQUESTS_PER_WINDOW) {
      return res.status(429).json({ ok: false, reply: "Rate limit exceeded. Please wait a minute before sending more messages." });
    }
  }
  chatRateLimitMap.set(userKey, userLimit);

  try {
    let conversationHistory = [];
    if (req.body.conversationHistory) {
      try {
        conversationHistory = JSON.parse(req.body.conversationHistory);
      } catch (e) {
        console.warn("Failed to parse conversationHistory:", e);
      }
    }

    if (!message && !req.file) {
      return res.status(400).json({ ok: false, reply: 'Please provide a message or an image.' });
    }

    // Check message intent if it's a text-based query (Bypassed per user request)
    /*
    if (message) {
      const classification = classifyQueryLocal(message);
      if (classification.intent === 'unrelated' && classification.confidence > 0.55) {
        const refusal = langRefusalMap[lang] || langRefusalMap.en;
        return res.json({ ok: true, reply: refusal, localFilter: true });
      }
    }
    */

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Server API Key is missing.");
    }

    // Map short codes to full readable languages for Gemini
    const langMap = { en: "English", te: "Telugu", hi: "Hindi", mr: "Marathi", ml: "Malayalam" };
    const requestedLang = langMap[lang] || "English";

    // Extremely concise system prompt to minimize input tokens
    const systemPrompt = `You are SAARTHI, an agricultural assistant. ONLY answer queries directly related to farming, crops, soil, pests, weather, and market prices in ${requestedLang}. Refuse unrelated topics politely and briefly. Keep answers helpful and clear.`;

    // Map frontend history into Gemini "contents" format - keeping only the last 2 messages to save input tokens
    const formattedHistory = [];
    if (conversationHistory && Array.isArray(conversationHistory)) {
      const recentHistory = conversationHistory.slice(-2);
      recentHistory.forEach(msg => {
        formattedHistory.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      });
    }

    // Handle the current message (multimodal text + image chunking)
    const currentMessageParts = [];
    if (message) {
      currentMessageParts.push({ text: message });
    }
    if (req.file) {
      // Pass the uploaded image directly to Gemini via buffer
      currentMessageParts.push({
        inlineData: {
          data: req.file.buffer.toString("base64"),
          mimeType: req.file.mimetype
        }
      });
    }

    // Append the new message to the history stream
    if (currentMessageParts.length > 0) {
      formattedHistory.push({
        role: 'user',
        parts: currentMessageParts
      });
    }

    // Make the inference query with full history context
    const response = await generateContent({
      model: 'gemini-2.5-flash',
      contents: formattedHistory,
      systemInstruction: systemPrompt
    });

    res.json({ ok: true, reply: response.text });

  } catch (error) {
    console.error("AI Chat Error (Invoking Fallback):", error.message);
    // Offline / Failed API response fallback
    const reply = getFallbackChatResponse(message, lang);
    res.json({ ok: true, reply: reply });
  }
});

// API: real-time disease detection via local CNN / Gemini Vision API
app.post('/api/detect-disease', authenticateToken, upload.single('image'), async (req, res) => {
  const lang = req.body.lang || 'en';

  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, message: 'Please upload an image for detection.' });
    }

    const langMap = { en: "English", te: "Telugu", hi: "Hindi", mr: "Marathi", ml: "Malayalam" };
    const requestedLang = langMap[lang] || "English";

    // 1. Try local prediction if model file exists
    const modelPath = path.join(__dirname, 'models', 'plant_disease_model.pth');
    const altModelPath = path.join(__dirname, 'plant_disease_model.pth');
    const modelExists = fs.existsSync(modelPath) || fs.existsSync(altModelPath);

    if (modelExists) {
      console.log("Local CNN Model file found. Running local inference...");
      
      // Ensure temp_uploads folder exists
      const tempDir = path.join(__dirname, 'temp_uploads');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }

      const tempFilename = `leaf_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
      const tempFilePath = path.join(tempDir, tempFilename);

      // Save buffer to temporary file
      fs.writeFileSync(tempFilePath, req.file.buffer);

      try {
        const { exec } = require('child_process');
        const util = require('util');
        const execPromise = util.promisify(exec);

        // Run python predict_disease.py <tempFilePath>
        const predictScript = path.join(__dirname, 'predict_disease.py');
        const command = `python "${predictScript}" "${tempFilePath}"`;
        const { stdout } = await execPromise(command);

        // Clean up temp file immediately
        try {
          fs.unlinkSync(tempFilePath);
        } catch (e) {}

        const result = JSON.parse(stdout.trim());
        if (result && result.ok) {
          const rawDisease = result.disease;
          const confidence = result.confidence;

          // Format disease display name (e.g. Tomato___Early_blight -> Tomato Early blight)
          const displayDisease = rawDisease.replace(/___/g, ' ').replace(/_/g, ' ');

          // Query Gemini via text to get local language advice & severity for this disease
          let severity = "N/A";
          let advice = ['Please consult local agricultural authorities.'];

          if (process.env.GEMINI_API_KEY) {
            const textPrompt = `Provide typical severity (Mild/Moderate/Severe) and 3 short organic advice items for plant disease "${displayDisease}" in ${requestedLang}. Return ONLY JSON: {"severity":"...","advice":["...","...","..."]}`;
            let adviceJSON = null;
            const maxAdviceAttempts = 3;

            for (let attempt = 1; attempt <= maxAdviceAttempts; attempt++) {
              try {
                const response = await generateContent({
                  model: 'gemini-2.5-flash',
                  contents: textPrompt,
                  responseMimeType: 'application/json'
                });

                const aiText = response.text || '';
                adviceJSON = parseJSONFromText(aiText);
                if (adviceJSON) {
                  severity = adviceJSON.severity || 'N/A';
                  advice = adviceJSON.advice || advice;
                  break;
                } else {
                  console.warn(`Attempt ${attempt} - Failed to parse advice JSON:`, JSON.stringify(aiText));
                }
              } catch (geminiError) {
                console.warn(`Attempt ${attempt} - Failed to get advice:`, geminiError.message);
              }

              if (attempt < maxAdviceAttempts) {
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }

            if (!adviceJSON) {
              console.warn("Falling back to database advice after multiple failures.");
              const fallback = getFallbackDiseaseResponse(lang);
              severity = fallback.severity;
              advice = fallback.advice;
            }
          } else {
            const fallback = getFallbackDiseaseResponse(lang);
            severity = fallback.severity;
            advice = fallback.advice;
          }

          return res.json({
            ok: true,
            disease: displayDisease,
            confidence: confidence,
            severity: severity,
            advice: advice
          });
        } else {
          console.warn("Local prediction python script returned an error:", result ? result.error : "Unknown");
        }
      } catch (err) {
        console.error("Local CNN Prediction failed, falling back to Gemini Vision API:", err.message);
        // Clean up temp file if it still exists
        if (fs.existsSync(tempFilePath)) {
          try {
            fs.unlinkSync(tempFilePath);
          } catch (e) {}
        }
      }
    }

    // 2. Fallback: Gemini Vision API image prediction
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Server API Key is missing.");
    }

    // Convert multer buffer to Gemini inline data
    const imagePart = {
      inlineData: {
        data: req.file.buffer.toString("base64"),
        mimeType: req.file.mimetype,
      }
    };

    const prompt = `Leaf pathologist. Analyze leaf image. Return ONLY JSON: {"disease":"name in ${requestedLang}","severity":"Mild/Moderate/Severe","advice":["short step 1","short step 2","short step 3"]}`;

    // Make the inference query (with retry mechanism)
    let resultJSON = null;
    let aiText = '';
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await generateContent({
          model: 'gemini-2.5-flash',
          contents: [imagePart, { text: prompt }],
          responseMimeType: 'application/json'
        });

        aiText = response.text || '';
        resultJSON = parseJSONFromText(aiText);

        if (resultJSON) {
          break; // successfully parsed, break the retry loop
        } else {
          console.warn(`Attempt ${attempt} - Raw AI Output failed parsing:`, JSON.stringify(aiText));
        }
      } catch (err) {
        console.warn(`Attempt ${attempt} - Vision API call failed:`, err.message);
      }

      if (attempt < maxAttempts) {
        // Wait 1 second before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (!resultJSON) {
      throw new Error("Failed to parse valid JSON disease response from AI output after multiple attempts.");
    }

    res.json({
      ok: true,
      disease: resultJSON.disease || 'Unknown',
      severity: resultJSON.severity || 'N/A',
      advice: resultJSON.advice || ['Please consult local agricultural authorities.']
    });

  } catch (error) {
    console.error("Disease Detection Error (Invoking Fallback):", error.message);
    const fallbackResponse = getFallbackDiseaseResponse(lang);
    res.json({
      ok: true,
      disease: fallbackResponse.disease,
      severity: fallbackResponse.severity,
      advice: fallbackResponse.advice
    });
  }
});

// Fallback to index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  
  // Asynchronously trigger fetch_market_data.py on startup to ensure data is updated daily
  const { exec } = require('child_process');
  const path = require('path');
  const fetchScript = path.join(__dirname, 'fetch_market_data.py');
  exec(`python "${fetchScript}"`, (err, stdout, stderr) => {
    if (err) {
      console.warn("Could not auto-run fetch_market_data.py on startup:", err.message);
    } else {
      console.log("Daily mandi market data updated on startup:", stdout.trim());
    }
  });
});

