import { createClient } from '@/lib/supabase/client';

interface TranslateOptions {
  table: string;
  recordId: string;
  delay?: number;
}

/**
 * 백그라운드에서 자동 번역을 실행합니다.
 * 번역 실패해도 에러를 throw하지 않고 조용히 처리합니다.
 */
export async function translateInBackground({
  table,
  recordId,
  delay = 1000,
}: TranslateOptions): Promise<void> {
  setTimeout(async () => {
    try {
      const supabase = createClient();

      // 1. 레코드 조회
      const { data: record, error: fetchError } = await supabase
        .from(table)
        .select('*')
        .eq('id', recordId)
        .single();

      if (fetchError || !record) {
        return;
      }

      // 2. Edge Function 호출
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/auto-translate-fields`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            table,
            record,
            event: 'INSERT',
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return;
      }

      const result = await response.json();

      if (result.translatedFields > 0) {
          `[Translation] Successfully translated ${result.translatedFields} fields for ${table}`
        );
      }
    } catch (error) {
    }
  }, delay);
}

/**
 * Staff가 입력한 데이터를 번역합니다 (UPDATE 이벤트)
 */
export async function translateStaffInput({
  table,
  recordId,
  delay = 500,
}: TranslateOptions): Promise<void> {
  setTimeout(async () => {
    try {
      const supabase = createClient();

      const { data: record, error: fetchError } = await supabase
        .from(table)
        .select('*')
        .eq('id', recordId)
        .single();

      if (fetchError || !record) {
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/auto-translate-fields`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            table,
            record,
            event: 'UPDATE',
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return;
      }

      const result = await response.json();
    } catch (error) {
    }
  }, delay);
}
