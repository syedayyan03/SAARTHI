const fs = require('fs');

async function testUpload() {
  const tokenRes = await fetch('http://localhost:3000/api/google-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'syedayyan8382@gmail.com', name: 'Syed Ayyan', language: 'en' })
  });
  const tokenData = await tokenRes.json();
  const token = tokenData.token;

  console.log('Got token:', token);

  const boundary = '----WebKitFormBoundarytestUpload';
  const header = `--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="test.png"\r\nContent-Type: image/png\r\n\r\n`;
  const footer = `\r\n--${boundary}--\r\n`;
  const validPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const pngBuffer = Buffer.from(validPngBase64, 'base64');
  
  const body = Buffer.concat([
    Buffer.from(header, 'utf8'),
    pngBuffer,
    Buffer.from(footer, 'utf8')
  ]);

  try {
    const res = await fetch('http://localhost:3000/api/detect-disease', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: body
    });
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Response:', data);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testUpload();
