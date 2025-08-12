// Edge Function 직접 호출
async function callEdgeFunction() {
  const url = 'https://cchgtiiycdhmjnklefqe.supabase.co/functions/v1/exchange-rate-sync';
  
  try {
    console.log('Edge Function 호출 중...');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    console.log('응답 상태:', response.status);
    const data = await response.json();
    console.log('응답 데이터:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('에러:', error.message);
    if (error.cause) {
      console.error('원인:', error.cause);
    }
  }
}

callEdgeFunction();
