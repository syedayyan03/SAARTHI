const crypto = require('crypto');

const SESSION_SECRET = 'saarthi-super-secure-key-123';

function generateSessionToken(phone) {
  const payload = {
    phone: phone,
    exp: Date.now() + (24 * 60 * 60 * 1000)
  };
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(base64Payload).digest('hex');
  return `${base64Payload}.${signature}`;
}

async function runTests() {
  const token = generateSessionToken("9999999999");
  console.log("============================================================");
  console.log("  SAARTHI Chatbox Intent Classifier Route Test Suite");
  console.log("============================================================");

  // Test 1: Out-of-scope coding query
  console.log("\n[Test 1] Unrelated Query - 'write a javascript function to sort an array'");
  await testChatAPI(token, {
    message: "write a javascript function to sort an array",
    lang: "en"
  }, (res) => {
    if (!res.ok) throw new Error("Expected res.ok to be true");
    if (!res.localFilter) throw new Error("Expected query to be blocked by local filter");
    console.log("  ✔ Blocked locally as expected");
    console.log("  ✔ Refusal message received:", res.reply);
  });

  // Test 2: Multilingual out-of-scope query
  console.log("\n[Test 2] Multilingual Unrelated Query - 'कंप्यूटर प्रोग्रामिंग क्या है?' (Hindi)");
  await testChatAPI(token, {
    message: "कंप्यूटर प्रोग्रामिंग क्या है?",
    lang: "hi"
  }, (res) => {
    if (!res.ok) throw new Error("Expected res.ok to be true");
    if (!res.localFilter) throw new Error("Expected query to be blocked by local filter");
    console.log("  ✔ Blocked locally as expected");
    console.log("  ✔ Hindi refusal message received:", res.reply);
  });

  // Test 3: In-scope agricultural query
  console.log("\n[Test 3] In-Scope Agricultural Query - 'what is the best NPK fertilizer for sugarcane?'");
  await testChatAPI(token, {
    message: "what is the best NPK fertilizer for sugarcane?",
    lang: "en"
  }, (res) => {
    if (!res.ok) throw new Error("Expected res.ok to be true");
    if (res.localFilter) throw new Error("Expected query to NOT be blocked by local filter");
    console.log("  ✔ Passed through to live LLM or offline fallback responder");
    console.log("  ✔ Response received (length:", res.reply.length, "chars)");
  });

  console.log("\n============================================================");
  console.log("  All Chatbox Intent Classifier Tests Passed Successfully!");
  console.log("============================================================");
}

async function testChatAPI(token, body, assertFn) {
  try {
    const res = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    
    if (res.status !== 200) {
      throw new Error(`Expected status 200, but got ${res.status}`);
    }
    
    const data = await res.json();
    assertFn(data);
  } catch (err) {
    console.error(`  ✖ Test failed: ${err.message}`);
    process.exit(1);
  }
}

runTests();
