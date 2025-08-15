import { createClient } from './client';

export async function setupChatTranslation() {
  const supabase = createClient();

  // 새 메시지 감지하고 번역 요청
  supabase
    .channel('chat-translation')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: 'translated_message=is.null',
      },
      async (payload) => {
        // Edge Function 직접 호출
        const response = await fetch(
          'https://fzpyfzpmwyvqumvftfbr.supabase.co/functions/v1/translate-message',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ record: payload.new }),
          }
        );

        if (!response.ok) {
        }
      }
    )
    .subscribe();
}
