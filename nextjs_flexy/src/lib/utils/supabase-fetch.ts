// Supabase REST API를 직접 호출하는 유틸리티 함수들

const supabaseUrl = 'https://fzpyfzpmwyvqumvftfbr.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6cHlmenBtd3l2cXVtdmZ0ZmJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NjY5NzksImV4cCI6MjA2OTI0Mjk3OX0.iz3EeD1-W84mHHRhQ4_JpimLjSAIYDTs00UgLeZIGW0';

export async function fetchMarketResearchByReservation(reservationNumber: string) {
  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/market_research_requests?reservation_number=eq.${reservationNumber}&limit=1`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data: data[0] || null, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function insertChatMessage(message: any) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/chat_messages`, {
      method: 'POST',
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    return { data: data[0], error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function fetchChatMessages(reservationNumber: string) {
  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/chat_messages?reservation_number=eq.${reservationNumber}&order=created_at.asc`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}
