import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST(request: NextRequest) {
  try {
    const { table, recordId } = await request.json();
    
    if (!table || !recordId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Service client로 레코드 조회
    const supabase = createServiceClient();
    const { data: record, error: fetchError } = await supabase
      .from(table)
      .select('*')
      .eq('id', recordId)
      .single();

    if (fetchError || !record) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }

    // Edge Function 호출 (Service Role Key 사용)
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/auto-translate-fields`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          table,
          record,
          event: 'UPDATE'
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Translation failed:', error);
      return NextResponse.json(
        { error: 'Translation failed' },
        { status: 500 }
      );
    }

    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      translations: result.translations,
      translatedFields: result.translatedFields
    });

  } catch (error) {
    console.error('Translation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}