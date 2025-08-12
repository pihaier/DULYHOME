require('dotenv').config({ path: '.env.local' });

async function testOpenAI() {
  console.log('Testing OpenAI API...');
  console.log('API Key starts with:', process.env.OPENAI_API_KEY?.substring(0, 20));
  
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: 'test'
      })
    });
    
    console.log('Status:', response.status);
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Error:', error);
    } else {
      const data = await response.json();
      console.log('Success! Embedding length:', data.data[0].embedding.length);
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

testOpenAI();