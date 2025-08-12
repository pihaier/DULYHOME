// Supabase Edge Function 호출 테스트
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cchgtiiycdhmjnklefqe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testExchangeRateSync() {
  try {
    console.log('Edge Function 호출 중...');
    
    const { data, error } = await supabase.functions.invoke('exchange-rate-sync', {
      body: {}
    });
    
    if (error) {
      console.error('Error:', error);
    } else {
      console.log('성공\!');
      console.log('응답:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('예외:', err);
  }
}

testExchangeRateSync();
