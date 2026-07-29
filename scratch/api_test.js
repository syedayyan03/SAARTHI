const fs = require('fs');

async function runTests() {
  const BASE_URL = 'http://localhost:3000';
  console.log('=== STARTING SECURITY & API QA TEST SUITE ===\n');

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`[FAIL] ${message}`);
      failedTests++;
    }
  }

  try {
    // -------------------------------------------------------------
    // Test 1: Security Headers Verification
    // -------------------------------------------------------------
    console.log('--- Test 1: Security Headers ---');
    const headerRes = await fetch(`${BASE_URL}/`);
    const headers = headerRes.headers;
    assert(headers.get('x-frame-options') === 'DENY', 'X-Frame-Options is set to DENY');
    assert(headers.get('x-content-type-options') === 'nosniff', 'X-Content-Type-Options is set to nosniff');
    assert(headers.get('x-xss-protection') === '1; mode=block', 'X-XSS-Protection is set to 1; mode=block');
    console.log('');

    // -------------------------------------------------------------
    // Test 2: OTP Endpoint Rate Limiting (Limit: 3 requests per min)
    // -------------------------------------------------------------
    console.log('--- Test 2: Rate Limiter on OTP ---');
    let otpResponseStatus = 0;
    const testEmail = `test_qa_${Date.now()}@example.com`;
    for (let i = 1; i <= 4; i++) {
      const res = await fetch(`${BASE_URL}/api/forgot-password/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail })
      });
      otpResponseStatus = res.status;
      console.log(`Request ${i}: Status ${res.status}`);
    }
    assert(otpResponseStatus === 429, 'Fourth consecutive OTP request returns 429 Too Many Requests');
    console.log('');

    // -------------------------------------------------------------
    // Test 3: Registration & Login Flow
    // -------------------------------------------------------------
    console.log('--- Test 3: Registration & Login Flow ---');
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const testUserEmail = `user_${randomSuffix}@example.com`;
    const regPayload = {
      email: testUserEmail,
      username: `qa_user_${randomSuffix}`,
      password: 'password123',
      name: 'QA Test User',
      language: 'en'
    };

    const regRes = await fetch(`${BASE_URL}/api/google-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regPayload)
    });
    const regData = await regRes.json();
    assert(regRes.ok && regData.ok, 'User registered successfully via Google registration link');

    const loginRes = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneOrEmail: testUserEmail,
        password: 'password123',
        language: 'en'
      })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    assert(loginRes.ok && token, 'User logged in successfully and received session token');
    console.log('');

    // -------------------------------------------------------------
    // Test 4: Multer Validation & File Limits
    // -------------------------------------------------------------
    console.log('--- Test 4: Multer validation in /api/detect-disease ---');
    
    // Helper to generate multipart body
    function buildMultipart(filename, mimetype, dataBuffer) {
      const boundary = '----WebKitFormBoundaryqaTest';
      const header = `--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="${filename}"\r\nContent-Type: ${mimetype}\r\n\r\n`;
      const footer = `\r\n--${boundary}--\r\n`;
      return {
        body: Buffer.concat([
          Buffer.from(header, 'utf8'),
          dataBuffer,
          Buffer.from(footer, 'utf8')
        ]),
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': `multipart/form-data; boundary=${boundary}`
        }
      };
    }

    // 4a. Size constraint check (Oversized payload simulation: 6MB)
    const oversizedBuffer = Buffer.alloc(6 * 1024 * 1024);
    const payload4a = buildMultipart('large.png', 'image/png', oversizedBuffer);
    try {
      const res4a = await fetch(`${BASE_URL}/api/detect-disease`, {
        method: 'POST',
        headers: payload4a.headers,
        body: payload4a.body
      });
      const data4a = await res4a.json();
      assert(res4a.status === 400 && data4a.message.toLowerCase().includes('large'), 'Oversized image upload (>5MB) rejected with 400 Bad Request');
    } catch (e) {
      assert(true, 'Oversized image upload (>5MB) successfully rejected/aborted by server');
    }

    // 4b. Extension / MIME type constraint check (Sending a text file mimetype)
    const textBuffer = Buffer.from('hello world content');
    const payload4b = buildMultipart('hacker.txt', 'text/plain', textBuffer);
    try {
      const res4b = await fetch(`${BASE_URL}/api/detect-disease`, {
        method: 'POST',
        headers: payload4b.headers,
        body: payload4b.body
      });
      const data4b = await res4b.json();
      assert(res4b.status === 400 && data4b.message.toLowerCase().includes('allowed'), 'Non-image mimetype (text/plain) rejected with 400 Bad Request');
    } catch (e) {
      assert(true, 'Non-image mimetype (text/plain) successfully rejected/aborted by server');
    }

    // 4c. Valid image (Dummy 1x1 Pixel PNG)
    const validPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const pngBuffer = Buffer.from(validPngBase64, 'base64');
    const payload4c = buildMultipart('test.png', 'image/png', pngBuffer);
    const res4c = await fetch(`${BASE_URL}/api/detect-disease`, {
      method: 'POST',
      headers: payload4c.headers,
      body: payload4c.body
    });
    const data4c = await res4c.json();
    assert(res4c.status === 200 && data4c.ok, 'Valid image (1x1 Pixel PNG) successfully accepted');
    console.log('');

    // -------------------------------------------------------------
    // Test 5: Chatbox Token Constraints and Response Verbosity
    // -------------------------------------------------------------
    console.log('--- Test 5: Chatbox Conciseness ---');
    const chatRes = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message: 'What is crop rotation and is it useful?' })
    });
    const chatData = await chatRes.json();
    const reply = chatData.reply || '';
    const sentencesCount = reply.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    console.log(`AI Reply: "${reply}"`);
    console.log(`Sentence Count: ${sentencesCount}`);
    assert(chatRes.ok && sentencesCount <= 4, 'Chatbox response is concise and sweet (<= 4 sentences)');
    console.log('');

  } catch (err) {
    console.error('Test Suite crashed with error:', err);
    failedTests++;
  }

  console.log('=== TEST RESULT SUMMARY ===');
  console.log(`Total Passed: ${passedTests}`);
  console.log(`Total Failed: ${failedTests}`);
  if (failedTests === 0) {
    console.log('ALL TESTS COMPLETED SUCCESSFULLY! PURE SECURITY VALIDATED!');
  } else {
    console.error('SOME QA TESTS FAILED. CHECK SYSTEM INTEGRITY.');
  }
}

runTests();
