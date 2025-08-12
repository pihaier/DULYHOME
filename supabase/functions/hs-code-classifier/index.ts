import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import OpenAI from 'https://esm.sh/openai@4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY')!,
});

// Supabase 클라이언트 초기화
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// HS 코드 검색 도구 정의
const hsCodeSearchTool: OpenAI.Chat.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'searchHSCodes',
    description: 'Supabase hs_codes 테이블에서 HS 코드를 검색합니다. 제품명, 카테고리, 영문명 등으로 검색 가능합니다.',
    parameters: {
      type: 'object',
      properties: {
        searchTerm: {
          type: 'string',
          description: '검색할 제품명 또는 키워드 (한글/영어)'
        },
        searchField: {
          type: 'string',
          enum: ['name_ko', 'name_en', 'category_name', 'all'],
          description: '검색할 필드 선택'
        },
        limit: {
          type: 'number',
          description: '반환할 최대 결과 수',
          default: 10
        }
      },
      required: ['searchTerm']
    }
  }
};

// HS 코드 상세 정보 조회 도구
const hsCodeDetailTool: OpenAI.Chat.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'getHSCodeDetails',
    description: '특정 HS 코드의 상세 정보를 조회합니다.',
    parameters: {
      type: 'object',
      properties: {
        hsCode: {
          type: 'string',
          description: '조회할 HS 코드 (10자리)'
        }
      },
      required: ['hsCode']
    }
  }
};

// HS 코드 검색 함수
async function searchHSCodes(args: {
  searchTerm: string;
  searchField?: string;
  limit?: number;
}) {
  const { searchTerm, searchField = 'all', limit = 10 } = args;
  
  try {
    let query = supabase
      .from('hs_codes')
      .select('hs_code, name_ko, name_en, category_name, spec_name');
    
    // 검색 필드에 따른 쿼리 구성
    if (searchField === 'all') {
      query = query.or(
        `name_ko.ilike.%${searchTerm}%,` +
        `name_en.ilike.%${searchTerm}%,` +
        `category_name.ilike.%${searchTerm}%,` +
        `hs_code.ilike.%${searchTerm}%`
      );
    } else {
      query = query.ilike(searchField, `%${searchTerm}%`);
    }
    
    const { data, error } = await query.limit(limit);
    
    if (error) {
      console.error('Supabase 검색 오류:', error);
      return { error: error.message };
    }
    
    return {
      results: data || [],
      count: data?.length || 0
    };
  } catch (error: any) {
    console.error('검색 함수 오류:', error);
    return { error: error.message };
  }
}

// HS 코드 상세 정보 조회 함수
async function getHSCodeDetails(args: { hsCode: string }) {
  const { hsCode } = args;
  
  try {
    const { data, error } = await supabase
      .from('hs_codes')
      .select('*')
      .eq('hs_code', hsCode)
      .single();
    
    if (error) {
      console.error('상세 조회 오류:', error);
      return { error: error.message };
    }
    
    return data || { error: 'HS 코드를 찾을 수 없습니다' };
  } catch (error: any) {
    console.error('상세 조회 함수 오류:', error);
    return { error: error.message };
  }
}

// Function 실행 핸들러
async function executeFunction(functionName: string, args: any) {
  switch (functionName) {
    case 'searchHSCodes':
      return await searchHSCodes(args);
    case 'getHSCodeDetails':
      return await getHSCodeDetails(args);
    default:
      throw new Error(`Unknown function: ${functionName}`);
  }
}// 메인 핸들러
Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { productName } = await req.json();
    
    if (!productName) {
      return new Response(
        JSON.stringify({ error: '제품명을 입력해주세요' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' }
        }
      );
    }

    console.log(`\n=== HS 코드 검색 시작: ${productName} ===`);
    
    // GPT-5-mini에 tool calling 요청
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `당신은 한국 HS 코드 분류 전문가입니다. 
        사용자가 제품명을 제공하면:
        1. searchHSCodes 도구를 사용하여 DB에서 검색
           - 제품명으로 검색
           - 필요시 유사 제품이나 영어로도 검색
        
        2. 검색 결과가 없어도 제품의 본질을 분석하여 적절한 HS 코드 추천:
           - 제품의 주요 기능과 용도 파악
           - 해당하는 HS 카테고리 결정
           - 구체적인 10자리 코드 제시
        
        3. 최종 답변은 간단명료하게 (1-3개 추천 가능):
           추천 HS 코드 1: [10자리 숫자]
           카테고리: [해당 카테고리명]
           품목명: [구체적 품목명]
           선택 이유: [간단한 이유]
           
           추천 HS 코드 2: [10자리 숫자] (대안이 있다면)
           카테고리: [해당 카테고리명]
           품목명: [구체적 품목명]
           선택 이유: [간단한 이유]
           
        중요: 반드시 10자리 연속 숫자로 HS 코드 제시 (점이나 공백 없이)`
      },
      {
        role: 'user',
        content: `제품명: ${productName}\n\n이 제품에 가장 적합한 한국 HS 코드를 찾아주세요.`
      }
    ];

    // GPT-5-mini 호출 (tool calling 포함)
    const completion = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages,
      tools: [hsCodeSearchTool, hsCodeDetailTool],
      tool_choice: 'auto',
      max_completion_tokens: 2000,
      reasoning_effort: 'minimal' as any
    });

    const responseMessage = completion.choices[0].message;
    const toolCalls = responseMessage.tool_calls;
    
    // Tool calls 처리
    if (toolCalls && toolCalls.length > 0) {
      const toolResults = [];
      
      for (const toolCall of toolCalls) {
        console.log(`도구 호출: ${toolCall.function.name}`);
        const args = JSON.parse(toolCall.function.arguments);
        console.log('파라미터:', args);
        
        const result = await executeFunction(toolCall.function.name, args);
        console.log('결과:', result);
        
        toolResults.push({
          tool_call_id: toolCall.id,
          role: 'tool' as const,
          content: JSON.stringify(result)
        });
      }
      
      // Tool 결과를 포함하여 다시 GPT-5에 요청
      const finalMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        ...messages,
        responseMessage,
        ...toolResults
      ];
      
      const finalCompletion = await openai.chat.completions.create({
        model: 'gpt-5-mini',
        messages: finalMessages,
        max_completion_tokens: 1500,
        reasoning_effort: 'minimal' as any
      });
      
      const finalResponse = finalCompletion.choices[0].message.content;
      
      // 응답에서 HS 코드 추출 (중복 제거)
      const hsCodePattern = /\b\d{10}\b/g;
      const dottedPattern = /\b(\d{4})\.(\d{2})\.(\d{2})\.(\d{2})\b/g;
      const recommendPattern = /추천\s*(?:HS\s*)?코드\s*\d?\s*[:：]\s*(\d{4})[.\s]?(\d{2})[.\s]?(\d{2})[.\s]?(\d{2})/gi;
      
      const matchedCodes = finalResponse?.match(hsCodePattern) || [];
      
      // 점으로 구분된 형식을 10자리로 변환
      const dottedMatches = [...(finalResponse?.matchAll(dottedPattern) || [])].map(m => 
        m[1] + m[2] + m[3] + m[4]
      );
      
      // "추천 코드:" 다음의 코드 추출
      const recommendMatches = [...(finalResponse?.matchAll(recommendPattern) || [])].map(m => 
        m[1] + m[2] + m[3] + m[4]
      );
      
      const allCodes = [...matchedCodes, ...dottedMatches, ...recommendMatches];
      const recommendedCodes = [...new Set(allCodes)];
      
      // 추천된 코드들의 상세 정보 조회
      const results = [];
      const addedCodes = new Set<string>();
      
      for (const code of recommendedCodes) {
        if (!addedCodes.has(code)) {
          const details = await getHSCodeDetails({ hsCode: code });
          if (!details.error) {
            results.push({
              hs_code: details.hs_code,
              name_ko: details.name_ko,
              name_en: details.name_en,
              category_name: details.category_name,
              confidence: 0.95
            });
            addedCodes.add(code);
          } else {
            // DB에 없는 코드라도 GPT가 추천했다면 추가
            const descPattern = new RegExp(`${code}[^\\d]*?[:：\\s-]+([^\\n\\d]{5,50})`, 'i');
            const descMatch = finalResponse?.match(descPattern);
            
            results.push({
              hs_code: code,
              name_ko: descMatch?.[1]?.trim() || 'GPT 추천 코드 (DB 미등록)',
              name_en: 'GPT Recommended Code (Not in DB)',
              category_name: '전기가열기기',
              confidence: 0.85
            });
            addedCodes.add(code);
          }
        }
      }
      
      // 결과가 없으면 검색 결과에서 상위 3개 반환
      if (results.length === 0 && toolResults.length > 0) {
        try {
          const firstToolResult = JSON.parse(toolResults[0].content);
          if (firstToolResult.results && firstToolResult.results.length > 0) {
            for (const item of firstToolResult.results.slice(0, 3)) {
              if (!addedCodes.has(item.hs_code)) {
                results.push({
                  hs_code: item.hs_code,
                  name_ko: item.name_ko,
                  name_en: item.name_en,
                  category_name: item.category_name,
                  confidence: 0.8
                });
                addedCodes.add(item.hs_code);
              }
            }
          }
        } catch (e) {
          console.error('Tool 결과 파싱 오류:', e);
        }
      }
      
      console.log(`\n=== 검색 완료: ${results.length}개 결과 ===\n`);
      
      return new Response(
        JSON.stringify({
          results,
          gptResponse: finalResponse,
          model: 'gpt-5-mini',
          toolCalls: toolCalls.length,
          usage: {
            prompt_tokens: completion.usage?.prompt_tokens || 0,
            completion_tokens: completion.usage?.completion_tokens || 0,
            total_tokens: completion.usage?.total_tokens || 0,
            reasoning_tokens: (completion.usage as any)?.completion_tokens_details?.reasoning_tokens || 0
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' }
        }
      );
    }
    
    // Tool call이 없는 경우 (직접 응답)
    return new Response(
      JSON.stringify({
        results: [],
        gptResponse: responseMessage.content,
        model: 'gpt-5-mini',
        toolCalls: 0,
        error: 'GPT가 도구를 사용하지 않고 직접 응답했습니다'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' }
      }
    );
    
  } catch (error: any) {
    console.error('HS 코드 분류 오류:', error);
    return new Response(
      JSON.stringify({ 
        error: 'HS 코드 분류 중 오류가 발생했습니다',
        details: error?.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' }
      }
    );
  }
});