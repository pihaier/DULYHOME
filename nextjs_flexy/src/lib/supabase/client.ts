import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''

// SSR을 위한 쿠키 기반 클라이언트 생성
// 쿠키를 동일한 도메인에서 공유하도록 설정
export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        // 쿠키 옵션 설정으로 도메인 전체에서 세션 공유
        get(name: string) {
          if (typeof document === 'undefined') {
            return undefined;
          }
          const cookies = document.cookie.split(';');
          const cookie = cookies.find(c => c.trim().startsWith(`${name}=`));
          if (cookie) {
            return decodeURIComponent(cookie.split('=')[1]);
          }
          return undefined;
        },
        set(name: string, value: string, options?: any) {
          if (typeof document === 'undefined') {
            return;
          }
          let cookieString = `${name}=${encodeURIComponent(value)}`;
          
          // 기본 옵션 설정
          const defaultOptions = {
            path: '/',
            sameSite: 'lax',
            secure: window.location.protocol === 'https:',
            ...options
          };
          
          if (defaultOptions.maxAge) {
            cookieString += `; Max-Age=${defaultOptions.maxAge}`;
          }
          if (defaultOptions.expires) {
            cookieString += `; Expires=${defaultOptions.expires.toUTCString()}`;
          }
          if (defaultOptions.path) {
            cookieString += `; Path=${defaultOptions.path}`;
          }
          if (defaultOptions.domain) {
            cookieString += `; Domain=${defaultOptions.domain}`;
          }
          if (defaultOptions.secure) {
            cookieString += '; Secure';
          }
          if (defaultOptions.sameSite) {
            cookieString += `; SameSite=${defaultOptions.sameSite}`;
          }
          
          document.cookie = cookieString;
        },
        remove(name: string, options?: any) {
          if (typeof document === 'undefined') {
            return;
          }
          document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
        }
      }
    }
  );
}