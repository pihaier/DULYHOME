const https = require('https');

const postData = JSON.stringify({});

const options = {
  hostname: 'cchgtiiycdhmjnklefqe.supabase.co',
  port: 443,
  path: '/functions/v1/exchange-rate-sync',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('Calling Edge Function...');

const req = https.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('RESPONSE:', data);
    try {
      const json = JSON.parse(data);
      console.log('PARSED:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Not JSON response');
    }
  });
});

req.on('error', (e) => {
  console.error(`Error: ${e.message}`);
  if (e.code) console.error(`Code: ${e.code}`);
});

req.write(postData);
req.end();