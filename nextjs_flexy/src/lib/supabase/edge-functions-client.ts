import { FunctionsClient } from '@supabase/functions-js';

// 싱글톤 인스턴스
let functionsClient: FunctionsClient | null = null;

// Edge Functions 전용 클라이언트
// Auth 없이 Functions만 사용 (Multiple GoTrueClient 경고 해결)
export function getEdgeFunctionsClient() {
  // 이미 생성된 클라이언트가 있으면 재사용
  if (functionsClient) {
    return functionsClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  // Functions 전용 클라이언트 (Auth 없음)
  functionsClient = new FunctionsClient(`${supabaseUrl}/functions/v1`, {
    headers: {
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  });

  return functionsClient;
}