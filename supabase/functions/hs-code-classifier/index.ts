import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import OpenAI from 'https://esm.sh/openai@4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY')
});

// Supabase 클라이언트 초기화
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// SSE 메시지 전송 헬퍼
function sendSSEMessage(encoder: TextEncoder, type: string, data: any) {
  const message = `data: ${JSON.stringify({ type, data })}\n\n`;
  return encoder.encode(message);
}

// 메인 핸들러
Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }

  try {
    const { productName, stream = false } = await req.json();
    
    if (!productName) {
      return new Response(JSON.stringify({
        error: '제품명을 입력해주세요'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json; charset=utf-8'
        }
      });
    }

    // SSE 스트리밍 모드
    if (stream) {
      const encoder = new TextEncoder();
      const body = new ReadableStream({
        async start(controller) {
          try {
            console.log(`\n=== HS 코드 단계별 분류 시작 (스트리밍): ${productName} ===`);
            
            // 시작 메시지
            controller.enqueue(sendSSEMessage(encoder, 'start', { 
              productName,
              message: 'HS 코드 분류를 시작합니다...'
            }));

            // 1단계: 97개 류에서 선택 (hs2 테이블)
            controller.enqueue(sendSSEMessage(encoder, 'step', { 
              step: 1,
              description: '97개 류(Chapter) 중에서 선택 중...',
              total: 97
            }));

            const { data: hs2Data, error: hs2Error } = await supabase
              .from('hs2')
              .select('hs_code, description_ko')
              .order('hs_code');
            
            if (hs2Error) throw new Error('HS2 테이블 조회 실패');
            
            const step1Messages = [{
              role: 'user',
              content: `제품 "${productName}"에 해당하는 HS 코드를 선택하세요.
아래 목록에서 가장 적합한 2자리 코드 하나만 답하세요 (예: 04):

${hs2Data.map(item => `${item.hs_code}: ${item.description_ko}`).join('\n')}

답: `
            }];
            
            const step1Completion = await openai.chat.completions.create({
              model: 'gpt-5-mini',
              messages: step1Messages,
              max_completion_tokens: 2000
            });
            
            const chapterResponse = step1Completion.choices[0]?.message?.content?.trim();
            const chapter = chapterResponse.match(/\d{2}/)?.[0];
            
            if (!chapter) throw new Error(`2자리 류를 선택할 수 없습니다`);
            
            const chapterDesc = hs2Data.find(item => item.hs_code === chapter)?.description_ko;
            
            // 1단계 완료 메시지
            controller.enqueue(sendSSEMessage(encoder, 'progress', { 
              step: 1,
              selected: chapter,
              description: chapterDesc,
              message: `✅ 1단계 완료: ${chapter}류 - ${chapterDesc}`
            }));

            // 2단계: 4자리 호 선택
            controller.enqueue(sendSSEMessage(encoder, 'step', { 
              step: 2,
              description: `${chapter}류 내에서 4자리 호(Heading) 선택 중...`
            }));

            const { data: hs4Data } = await supabase
              .from('hs_codes_4digit')
              .select('hs_code, description_ko')
              .like('hs_code', `${chapter}%`)
              .order('hs_code');
            
            if (!hs4Data || hs4Data.length === 0) {
              controller.enqueue(sendSSEMessage(encoder, 'complete', { 
                hsCode: chapter,
                level: 'chapter',
                description: chapterDesc
              }));
              controller.close();
              return;
            }

            controller.enqueue(sendSSEMessage(encoder, 'info', { 
              message: `${hs4Data.length}개 후보 중 선택 중...`
            }));

            const step2Messages = [{
              role: 'user',
              content: `제품: ${productName}
선택된 류: ${chapter} - ${chapterDesc}

아래 목록에서 가장 적합한 4자리 호를 선택하세요 (예: 0401):

${hs4Data.map(item => `${item.hs_code}: ${item.description_ko}`).join('\n')}

답: `
            }];
            
            const step2Completion = await openai.chat.completions.create({
              model: 'gpt-5-mini',
              messages: step2Messages,
              max_completion_tokens: 1500
            });
            
            const heading = step2Completion.choices[0]?.message?.content?.trim().match(/\d{4}/)?.[0];
            if (!heading) {
              const firstHeading = hs4Data[0];
              controller.enqueue(sendSSEMessage(encoder, 'complete', { 
                hsCode: firstHeading.hs_code,
                level: 'heading',
                description: firstHeading.description_ko
              }));
              controller.close();
              return;
            }

            const headingDesc = hs4Data.find(item => item.hs_code === heading)?.description_ko;
            
            // 2단계 완료 메시지
            controller.enqueue(sendSSEMessage(encoder, 'progress', { 
              step: 2,
              selected: heading,
              description: headingDesc,
              message: `✅ 2단계 완료: ${heading}호 - ${headingDesc}`
            }));

            // 3단계: 6자리 소호 선택
            controller.enqueue(sendSSEMessage(encoder, 'step', { 
              step: 3,
              description: `${heading}호 내에서 6자리 소호(Subheading) 선택 중...`
            }));

            const { data: hs6Data } = await supabase
              .from('hs_codes_6digit')
              .select('hs_code, description_ko')
              .like('hs_code', `${heading}%`)
              .order('hs_code');
            
            if (!hs6Data || hs6Data.length === 0) {
              controller.enqueue(sendSSEMessage(encoder, 'complete', { 
                hsCode: heading,
                level: 'heading',
                description: headingDesc
              }));
              controller.close();
              return;
            }

            controller.enqueue(sendSSEMessage(encoder, 'info', { 
              message: `${hs6Data.length}개 후보 중 선택 중...`
            }));

            const step3Messages = [{
              role: 'user',
              content: `제품: ${productName}
선택된 류: ${chapter} - ${chapterDesc}
선택된 호: ${heading} - ${headingDesc}

아래 목록에서 가장 적합한 6자리 소호를 선택하고 이유를 설명하세요.
불확실한 경우 최대 3개까지 선택 가능 (콤마로 구분):

${hs6Data.map(item => `${item.hs_code}: ${item.description_ko}`).join('\n')}

형식: [코드] | [선택 이유]
답: `
            }];
            
            const step3Completion = await openai.chat.completions.create({
              model: 'gpt-5-mini',
              messages: step3Messages,
              max_completion_tokens: 1500
            });
            
            const subheadingResponse = step3Completion.choices[0]?.message?.content?.trim();
            console.log('3단계 GPT 응답 (이유 포함):', subheadingResponse);
            
            // 3단계 이유 추출
            let step3Reason = '';
            if (subheadingResponse && subheadingResponse.includes('|')) {
              const parts = subheadingResponse.split('|');
              if (parts.length >= 2) {
                step3Reason = parts[1].trim();
              }
            }
            
            // 중복 제거를 위해 Set 사용 (5자리 또는 6자리 코드 찾기)
            const rawCandidates = subheadingResponse?.match(/\d{5,6}/g) || [];
            const subheadingCandidates = [...new Set(rawCandidates)];
            
            if (subheadingCandidates.length === 0) {
              const firstSubheading = hs6Data[0];
              controller.enqueue(sendSSEMessage(encoder, 'complete', { 
                hsCode: firstSubheading.hs_code,
                level: 'subheading',
                description: firstSubheading.description_ko
              }));
              controller.close();
              return;
            }

            const subheading = subheadingCandidates[0];
            const subheadingDesc = hs6Data.find(item => item.hs_code === subheading)?.description_ko;
            
            // 3단계 완료 메시지
            controller.enqueue(sendSSEMessage(encoder, 'progress', { 
              step: 3,
              selected: subheading,
              description: subheadingDesc,
              reason: step3Reason,
              candidates: subheadingCandidates.length > 1 ? subheadingCandidates : undefined,
              candidateCount: subheadingCandidates.length,
              message: `✅ 3단계 완료: ${subheading} - ${subheadingDesc}`
            }));

            // 4단계: 10자리 세번 선택
            controller.enqueue(sendSSEMessage(encoder, 'step', { 
              step: 4,
              description: '10자리 세번(Item) 최종 선택 중...'
            }));

            let hs10Data = [];
            const seenCodes = new Set();
            
            for (const candidate of subheadingCandidates) {
              const { data } = await supabase
                .from('hs_codes_10digit')
                .select('hs_code, description_ko')
                .like('hs_code', `${candidate}%`)
                .order('hs_code');
              
              if (data) {
                // 중복 제거
                for (const item of data) {
                  if (!seenCodes.has(item.hs_code)) {
                    seenCodes.add(item.hs_code);
                    hs10Data.push(item);
                  }
                }
              }
            }
            
            if (!hs10Data || hs10Data.length === 0) {
              controller.enqueue(sendSSEMessage(encoder, 'complete', { 
                hsCode: subheading,
                level: 'subheading',
                description: subheadingDesc
              }));
              controller.close();
              return;
            }

            controller.enqueue(sendSSEMessage(encoder, 'info', { 
              message: `${hs10Data.length}개 최종 후보 중 선택 중...`
            }));

            const step4Messages = [{
              role: 'user',
              content: `제품: ${productName}
선택된 류: ${chapter} - ${chapterDesc}
선택된 호: ${heading} - ${headingDesc}
선택된 소호: ${subheading} - ${subheadingDesc}

아래 목록에서 제품 "${productName}"에 가장 적합한 10자리 세번을 추천하세요.

${hs10Data.map(item => `${item.hs_code}: ${item.description_ko}`).join('\n')}

반드시 아래 형식으로 답하세요 (각 줄마다 이유 포함):
최종추천: [코드] | [해당 코드 선택 이유]
대안1: [코드] | [대안으로 제시하는 이유]
대안2: [코드] | [대안으로 제시하는 이유]

답: `
            }];
            
            const step4Completion = await openai.chat.completions.create({
              model: 'gpt-5-mini',
              messages: step4Messages,
              max_completion_tokens: 1500
            });
            
            const itemResponse = step4Completion.choices[0]?.message?.content?.trim();
            console.log('4단계 GPT 응답 (이유 포함):', itemResponse);
            
            // 응답 파싱
            let allCandidates = [];
            let finalHsCode = '';
            let finalDescription = '';
            let selectionReason = '';
            
            if (itemResponse) {
              // 먼저 "최종추천:", "대안" 형식 확인
              if (itemResponse.includes('최종추천:') || itemResponse.includes('대안')) {
                const lines = itemResponse.split('\n').filter(line => line.trim());
                
                for (const line of lines) {
                  if (line.includes('최종추천:') || line.includes('대안')) {
                    const parts = line.split('|').map(p => p.trim());
                    const codeMatch = parts[0]?.match(/\d{10}/);
                    
                    if (codeMatch) {
                      const code = codeMatch[0];
                      const reason = parts[1] || '';
                      const item = hs10Data.find(i => i.hs_code === code);
                      
                      if (item) {
                        const candidate = {
                          hsCode: item.hs_code,
                          description: item.description_ko,
                          reason: reason
                        };
                        
                        if (line.includes('최종추천:')) {
                          finalHsCode = item.hs_code;
                          finalDescription = item.description_ko;
                          selectionReason = reason;
                          allCandidates.unshift(candidate); // 최종 추천을 맨 앞에
                        } else {
                          allCandidates.push(candidate);
                        }
                      }
                    }
                  }
                }
              } else {
                // 단순 "코드 | 이유" 형식 파싱
                const parts = itemResponse.split('|').map(p => p.trim());
                if (parts.length >= 2) {
                  const codeMatch = parts[0].match(/\d{10}/);
                  if (codeMatch) {
                    const code = codeMatch[0];
                    const reason = parts[1];
                    const item = hs10Data.find(i => i.hs_code === code);
                    
                    if (item) {
                      finalHsCode = item.hs_code;
                      finalDescription = item.description_ko;
                      selectionReason = reason;
                      allCandidates.push({
                        hsCode: item.hs_code,
                        description: item.description_ko,
                        reason: reason
                      });
                    }
                  }
                }
                
                // 추가 코드가 있는지 확인 (콤마 뒤)
                if (parts.length >= 3) {
                  const additionalCodes = parts[2].match(/\d{10}/g);
                  if (additionalCodes) {
                    for (const addCode of additionalCodes) {
                      const addItem = hs10Data.find(i => i.hs_code === addCode);
                      if (addItem && !allCandidates.some(c => c.hsCode === addCode)) {
                        allCandidates.push({
                          hsCode: addItem.hs_code,
                          description: addItem.description_ko,
                          reason: '대안'
                        });
                      }
                    }
                  }
                }
              }
            }
            
            // 파싱 실패 시 기존 방식으로 폴백
            if (!finalHsCode) {
              const itemCandidates = itemResponse?.match(/\d{10}/g) || [];
              
              if (itemCandidates.length > 0) {
                for (const candidate of itemCandidates) {
                  const item = hs10Data.find(i => i.hs_code === candidate);
                  if (item) {
                    allCandidates.push({
                      hsCode: item.hs_code,
                      description: item.description_ko,
                      reason: ''  // 이유 없음 (파싱 실패 시)
                    });
                  }
                }
                
                if (allCandidates.length > 0) {
                  finalHsCode = allCandidates[0].hsCode;
                  finalDescription = allCandidates[0].description;
                  selectionReason = '';  // 이유 없음
                }
              }
            }
            
            if (!finalHsCode) {
              const otherItem = hs10Data.find(item => 
                item.description_ko?.includes('기타') || 
                item.description_ko?.includes('그 밖의')
              );
              
              if (otherItem) {
                finalHsCode = otherItem.hs_code;
                finalDescription = otherItem.description_ko;
              } else if (hs10Data.length > 0) {
                finalHsCode = hs10Data[0].hs_code;
                finalDescription = hs10Data[0].description_ko;
              }
            }

            // 4단계 완료 메시지
            controller.enqueue(sendSSEMessage(encoder, 'progress', { 
              step: 4,
              selected: finalHsCode,
              description: finalDescription,
              reason: selectionReason,
              message: `✅ 4단계 완료: ${finalHsCode} - ${finalDescription}`
            }));

            // 최종 결과
            controller.enqueue(sendSSEMessage(encoder, 'complete', {
              hsCode: finalHsCode,
              level: 'item',
              description: finalDescription,
              reason: selectionReason,
              candidates: allCandidates,
              hierarchy: {
                chapter: chapter,
                heading: heading,
                subheading: subheading,
                subheadingCandidates: subheadingCandidates,
                item: finalHsCode
              },
              model: 'gpt-5-mini',
              usage: {
                prompt_tokens: (step1Completion.usage?.prompt_tokens || 0) + 
                               (step2Completion.usage?.prompt_tokens || 0) + 
                               (step3Completion.usage?.prompt_tokens || 0) + 
                               (step4Completion.usage?.prompt_tokens || 0),
                completion_tokens: (step1Completion.usage?.completion_tokens || 0) + 
                                  (step2Completion.usage?.completion_tokens || 0) + 
                                  (step3Completion.usage?.completion_tokens || 0) + 
                                  (step4Completion.usage?.completion_tokens || 0),
                total_tokens: (step1Completion.usage?.total_tokens || 0) + 
                             (step2Completion.usage?.total_tokens || 0) + 
                             (step3Completion.usage?.total_tokens || 0) + 
                             (step4Completion.usage?.total_tokens || 0)
              }
            }));

            controller.close();
          } catch (error) {
            controller.enqueue(sendSSEMessage(encoder, 'error', { 
              message: error.message 
            }));
            controller.close();
          }
        }
      });

      return new Response(body, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    }

    // 기존 논스트리밍 모드 (하위 호환성)
    console.log(`\n=== HS 코드 단계별 분류 시작: ${productName} ===`);
    
    // 1단계: 97개 류에서 선택 (hs2 테이블)
    const { data: hs2Data, error: hs2Error } = await supabase
      .from('hs2')
      .select('hs_code, description_ko')
      .order('hs_code');
    
    if (hs2Error) {
      throw new Error('HS2 테이블 조회 실패');
    }
    
    console.log('1단계: 97개 류 중 선택');
    
    const step1Messages = [
      {
        role: 'user',
        content: `제품 "${productName}"에 해당하는 HS 코드를 선택하세요.
아래 목록에서 가장 적합한 2자리 코드 하나만 답하세요 (예: 04):

${hs2Data.map(item => `${item.hs_code}: ${item.description_ko}`).join('\n')}

답: `
      }
    ];
    
    // 1단계: 2자리 류 선택
    console.log('GPT-5-mini에 요청 중...');
    const step1Completion = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: step1Messages,
      max_completion_tokens: 2000
    });
    
    const chapterResponse = step1Completion.choices[0]?.message?.content?.trim();
    console.log(`GPT 응답 내용: ${chapterResponse}`);
    
    if (!chapterResponse) {
      console.error('GPT 응답이 비어있음');
      throw new Error(`GPT 응답이 비어있습니다`);
    }
    
    const chapter = chapterResponse.match(/\d{2}/)?.[0];
    if (!chapter) {
      throw new Error(`2자리 류를 선택할 수 없습니다`);
    }
    console.log(`선택된 류: ${chapter}`);
    
    // 2단계: 4자리 호 선택 (hs_codes_4digit 테이블)
    const { data: hs4Data, error: hs4Error } = await supabase
      .from('hs_codes_4digit')
      .select('hs_code, description_ko')
      .like('hs_code', `${chapter}%`)
      .order('hs_code');
    
    if (hs4Error || !hs4Data || hs4Data.length === 0) {
      // 4자리가 없으면 2자리만 반환
      return new Response(JSON.stringify({
        hsCode: chapter,
        level: 'chapter',
        description: hs2Data.find(item => item.hs_code === chapter)?.description_ko
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json; charset=utf-8'
        }
      });
    }
    
    console.log(`2단계: ${hs4Data.length}개 호 중 선택`);
    
    // 선택된 류의 설명 찾기
    const chapterDescription = hs2Data.find(item => item.hs_code === chapter)?.description_ko || '';
    
    const step2Messages = [
      {
        role: 'user',
        content: `제품: ${productName}
선택된 류: ${chapter} - ${chapterDescription}

아래 목록에서 가장 적합한 4자리 호를 선택하세요 (예: 0401):

${hs4Data.map(item => `${item.hs_code}: ${item.description_ko}`).join('\n')}

답: `
      }
    ];
    
    const step2Completion = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: step2Messages,
      max_completion_tokens: 1500
    });
    
    console.log('2단계 GPT 응답:', step2Completion.choices[0]?.message?.content);
    const heading = step2Completion.choices[0]?.message?.content?.trim().match(/\d{4}/)?.[0];
    if (!heading) {
      // 4자리 선택 실패시 첫 번째 항목 선택
      const firstHeading = hs4Data[0].hs_code;
      return new Response(JSON.stringify({
        hsCode: firstHeading,
        level: 'heading',
        description: hs4Data[0].description_ko
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json; charset=utf-8'
        }
      });
    }
    console.log(`선택된 호: ${heading}`);
    
    // 3단계: 6자리 소호 선택 (hs_codes_6digit 테이블)
    const { data: hs6Data, error: hs6Error } = await supabase
      .from('hs_codes_6digit')
      .select('hs_code, description_ko')
      .like('hs_code', `${heading}%`)
      .order('hs_code');
    
    if (hs6Error || !hs6Data || hs6Data.length === 0) {
      // 6자리가 없으면 4자리만 반환
      return new Response(JSON.stringify({
        hsCode: heading,
        level: 'heading',
        description: hs4Data.find(item => item.hs_code === heading)?.description_ko
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json; charset=utf-8'
        }
      });
    }
    
    console.log(`3단계: ${hs6Data.length}개 소호 중 선택`);
    
    // 선택된 호의 설명 찾기
    const headingDescription = hs4Data.find(item => item.hs_code === heading)?.description_ko || '';
    
    const step3Messages = [
      {
        role: 'user',
        content: `제품: ${productName}
선택된 류: ${chapter} - ${chapterDescription}
선택된 호: ${heading} - ${headingDescription}

아래 목록에서 가장 적합한 6자리 소호를 선택하세요.
불확실한 경우 최대 3개까지 선택 가능 (콤마로 구분):

${hs6Data.map(item => `${item.hs_code}: ${item.description_ko}`).join('\n')}

답: `
      }
    ];
    
    const step3Completion = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: step3Messages,
      max_completion_tokens: 1500
    });
    
    // 여러 개 선택 가능 (콤마로 구분)
    const subheadingResponse = step3Completion.choices[0]?.message?.content?.trim();
    console.log('3단계 GPT 응답:', subheadingResponse);
    // 중복 제거를 위해 Set 사용 (5자리 또는 6자리 코드 찾기)
    const rawCandidates = subheadingResponse?.match(/\d{5,6}/g) || [];
    const subheadingCandidates = [...new Set(rawCandidates)];
    
    if (subheadingCandidates.length === 0) {
      // 6자리 선택 실패시 첫 번째 항목 선택
      const firstSubheading = hs6Data[0].hs_code;
      return new Response(JSON.stringify({
        hsCode: firstSubheading,
        level: 'subheading',
        description: hs6Data[0].description_ko
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json; charset=utf-8'
        }
      });
    }
    
    const subheading = subheadingCandidates[0]; // 첫 번째 후보를 메인으로 사용
    console.log(`선택된 소호 후보: ${subheadingCandidates.join(', ')}`);
    
    // 4단계: 10자리 세번 선택 (여러 후보에서 검색)
    let hs10Data = [];
    let hs10Error = null;
    const seenCodes = new Set();
    
    // 모든 6자리 후보에서 10자리 검색
    for (const candidate of subheadingCandidates) {
      const { data, error } = await supabase
        .from('hs_codes_10digit')
        .select('hs_code, description_ko')
        .like('hs_code', `${candidate}%`)
        .order('hs_code');
      
      if (!error && data) {
        // 중복 제거
        for (const item of data) {
          if (!seenCodes.has(item.hs_code)) {
            seenCodes.add(item.hs_code);
            hs10Data.push(item);
          }
        }
      }
      if (error) hs10Error = error;
    }
    
    if (hs10Error || !hs10Data || hs10Data.length === 0) {
      // 10자리가 없으면 6자리만 반환
      return new Response(JSON.stringify({
        hsCode: subheading,
        level: 'subheading',
        description: hs6Data.find(item => item.hs_code === subheading)?.description_ko
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json; charset=utf-8'
        }
      });
    }
    
    console.log(`4단계: ${hs10Data.length}개 세번 중 선택`);
    
    // 선택된 소호의 설명 찾기
    const subheadingDescription = hs6Data.find(item => item.hs_code === subheading)?.description_ko || '';
    
    const step4Messages = [
      {
        role: 'user',
        content: `제품: ${productName}
선택된 류: ${chapter} - ${chapterDescription}
선택된 호: ${heading} - ${headingDescription}
선택된 소호: ${subheading} - ${subheadingDescription}

아래 목록에서 가장 적합한 10자리 세번을 선택하세요.
불확실한 경우 최대 3개까지 선택 가능 (콤마로 구분):
정확한 일치가 없으면 "기타" 항목을 선택하세요.

${hs10Data.map(item => `${item.hs_code}: ${item.description_ko}`).join('\n')}

답: `
      }
    ];
    
    const step4Completion = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: step4Messages,
      max_completion_tokens: 1500
    });
    
    // 여러 개 선택 가능 (콤마로 구분)
    const itemResponse = step4Completion.choices[0]?.message?.content?.trim();
    console.log('4단계 GPT 응답:', itemResponse);
    const itemCandidates = itemResponse?.match(/\d{10}/g) || [];
    
    let finalHsCode = '';
    let finalDescription = '';
    let allCandidates = [];
    
    if (itemCandidates.length > 0) {
      // 후보들의 상세 정보 수집
      console.log(`선택된 세번 후보: ${itemCandidates.join(', ')}`);
      for (const candidate of itemCandidates) {
        const item = hs10Data.find(i => i.hs_code === candidate);
        if (item) {
          console.log(`  - ${item.hs_code}: ${item.description_ko}`);
          allCandidates.push({
            hsCode: item.hs_code,
            description: item.description_ko
          });
        }
      }
      
      // 첫 번째 후보를 메인으로 사용
      if (allCandidates.length > 0) {
        finalHsCode = allCandidates[0].hsCode;
        finalDescription = allCandidates[0].description;
        console.log(`최종 선택: ${finalHsCode} - ${finalDescription}`);
      }
    }
    
    if (!finalHsCode) {
      // 10자리 선택 실패시 "기타" 항목 찾기
      const otherItem = hs10Data.find(item => 
        item.description_ko?.includes('기타') || 
        item.description_ko?.includes('그 밖의')
      );
      
      if (otherItem) {
        finalHsCode = otherItem.hs_code;
        finalDescription = otherItem.description_ko;
      } else if (hs10Data.length > 0) {
        // 기타도 없으면 첫 번째 항목 선택
        finalHsCode = hs10Data[0].hs_code;
        finalDescription = hs10Data[0].description_ko;
      }
    }
    
    console.log(`\n=== 분류 완료: ${finalHsCode} ===\n`);
    
    return new Response(JSON.stringify({
      hsCode: finalHsCode,
      level: 'item',
      description: finalDescription,
      reason: '제품 특성과 가장 부합하는 세번',
      candidates: allCandidates,  // 모든 후보 반환
      hierarchy: {
        chapter: chapter,
        heading: heading,
        subheading: subheading,
        subheadingCandidates: subheadingCandidates,  // 6자리 후보들
        item: finalHsCode
      },
      model: 'gpt-5-mini',
      usage: {
        prompt_tokens: (step1Completion.usage?.prompt_tokens || 0) + 
                       (step2Completion.usage?.prompt_tokens || 0) + 
                       (step3Completion.usage?.prompt_tokens || 0) + 
                       (step4Completion.usage?.prompt_tokens || 0),
        completion_tokens: (step1Completion.usage?.completion_tokens || 0) + 
                          (step2Completion.usage?.completion_tokens || 0) + 
                          (step3Completion.usage?.completion_tokens || 0) + 
                          (step4Completion.usage?.completion_tokens || 0),
        total_tokens: (step1Completion.usage?.total_tokens || 0) + 
                     (step2Completion.usage?.total_tokens || 0) + 
                     (step3Completion.usage?.total_tokens || 0) + 
                     (step4Completion.usage?.total_tokens || 0)
      }
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
    
  } catch (error) {
    console.error('HS 코드 분류 오류:', error);
    return new Response(JSON.stringify({
      error: 'HS 코드 분류 중 오류가 발생했습니다',
      details: error?.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  }
});