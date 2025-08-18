'use client';

import { useEffect } from 'react';
import { setupChatTranslation } from '@/lib/supabase/chat-translator';

export function ChatTranslationProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 번역 Realtime 리스너 설정
    const setup = async () => {
      await setupChatTranslation();
    };
    
    setup();
  }, []);

  return <>{children}</>;
}