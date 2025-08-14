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
    const { productName, stream = true } = await req.json();  // 기본값을 true로 변경
    
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

    // SSE 스트리밍 모드 (항상 실행)
    {
      const encoder = new TextEncoder();
      const body = new ReadableStream({
        async start(controller) {
          try {
            console.log(`\n=== [스트리밍 모드] HS 코드 단계별 분류 시작: ${productName} ===`);
            
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
            
            const step1Content = `제품 "${productName}"에 해당하는 HS 코드를 선택하세요.
아래 목록에서 가장 적합한 2자리 코드 하나만 답하세요 (예: 04):

${hs2Data.map(item => `${item.hs_code}: ${item.description_ko}`).join('\n')}

답: `;

            console.log('=== 1단계 GPT에게 보내는 프롬프트 ===');
            console.log(`제품: ${productName}`);
            console.log(`2자리 류 개수: ${hs2Data.length}개`);
            console.log('2자리 목록 (처음 10개):', hs2Data.slice(0, 10).map(d => `${d.hs_code}: ${d.description_ko}`).join('\n'));
            console.log('=== 프롬프트 끝 ===');

            const step1Messages = [{
              role: 'user',
              content: step1Content
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

            const step2Content = `제품: ${productName}
선택된 류: ${chapter}

아래 목록에서 가장 적합한 4자리 호를 선택하세요 (예: 0401):

${hs4Data.map(item => `${item.hs_code}: ${item.description_ko}`).join('\n')}

답: `;

            console.log('=== 2단계 GPT에게 보내는 프롬프트 ===');
            console.log(`제품: ${productName}`);
            console.log(`선택된 류: ${chapter}`);
            console.log(`4자리 호 개수: ${hs4Data.length}개`);
            console.log('4자리 목록 (처음 5개):', hs4Data.slice(0, 5).map(d => `${d.hs_code}: ${d.description_ko}`).join('\n'));
            console.log('=== 프롬프트 끝 ===');
            
            const step2Messages = [{
              role: 'user',
              content: step2Content
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

            // 3단계: 10자리 세번 직접 선택 (6자리는 내부적으로만 사용)
            controller.enqueue(sendSSEMessage(encoder, 'step', { 
              step: 3,
              description: '10자리 세번(Item) 최종 선택 중...'
            }));
            
            // 먼저 4자리로 직접 모든 10자리 코드 가져오기
            const { data: hs10DataRaw } = await supabase
              .from('hs_codes_10digit')
              .select('hs_code, description_ko')
              .like('hs_code', `${heading}%`)
              .order('hs_code');
            
            if (!hs10DataRaw || hs10DataRaw.length === 0) {
              controller.enqueue(sendSSEMessage(encoder, 'complete', { 
                hsCode: heading,
                level: 'heading',
                description: headingDesc
              }));
              controller.close();
              return;
            }

            // 6자리 코드도 가져와서 설명 enrichment용으로 사용
            const { data: hs6Data } = await supabase
              .from('hs_codes_6digit')
              .select('hs_code, description_ko')
              .like('hs_code', `${heading}%`)
              .order('hs_code');
            
            // 6자리 설명을 맵으로 저장
            const hs6Map = new Map();
            if (hs6Data) {
              for (const item of hs6Data) {
                hs6Map.set(item.hs_code, item.description_ko);
              }
            }
            
            // 모든 10자리 코드 처리 (6자리 설명이 있으면 추가)
            let hs10Data = [];
            console.log(`4자리 ${heading}에 대한 10자리 코드: ${hs10DataRaw.length}개`);
            
            for (const item of hs10DataRaw) {
              // 해당 10자리의 6자리 코드 찾기
              const hs6Code = item.hs_code.substring(0, 6);
              const hs6Description = hs6Map.get(hs6Code);
              
              // 6자리 설명이 있고 중복되지 않으면 추가
              const enrichedDescription = hs6Description && !item.description_ko.includes(hs6Description)
                ? `${item.description_ko} [${hs6Description}]`
                : item.description_ko;
              
              hs10Data.push({
                hs_code: item.hs_code,
                description_ko: enrichedDescription
              });
            }
            
            console.log(`최종 10자리 코드: ${hs10Data.length}개`, hs10Data.map(d => d.hs_code));
            
            if (!hs10Data || hs10Data.length === 0) {
              controller.enqueue(sendSSEMessage(encoder, 'complete', { 
                hsCode: heading,
                level: 'heading',
                description: headingDesc
              }));
              controller.close();
              return;
            }

            controller.enqueue(sendSSEMessage(encoder, 'info', { 
              message: `${hs10Data.length}개 최종 후보 중 선택 중...`
            }));

            // 3단계: 10자리 선택 (평가와 순위를 한번에)
            const step3Content = `제품: ${productName}
선택된 류: ${chapter}
선택된 호: ${heading} - ${headingDesc}

가능한 10자리 코드들:
${hs10Data.map(item => `${item.hs_code}: ${item.description_ko}`).join('\n')}

위 코드들 중에서 "${productName}"에 가장 적합한 코드를 순위대로 나열하세요.
최대 5개까지 선택하세요.

답변 형식 (반드시 이 형식을 따르세요):
1순위: [10자리코드] | [해당 코드가 가장 적합한 구체적 이유]
2순위: [10자리코드] | [대안으로 고려할 만한 이유]
3순위: [10자리코드] | [추가 대안으로 고려할 만한 이유]
4순위: [10자리코드] | [추가 대안으로 고려할 만한 이유]
5순위: [10자리코드] | [추가 대안으로 고려할 만한 이유]

답:`;

            console.log('=== 3단계 GPT에게 보내는 프롬프트 ===');
            console.log(`제품: ${productName}`);
            console.log(`선택된 류: ${chapter}`);
            console.log(`선택된 호: ${heading} - ${headingDesc}`);
            console.log(`10자리 코드 개수: ${hs10Data.length}개`);
            console.log('10자리 목록 (처음 5개):', hs10Data.slice(0, 5).map(d => `${d.hs_code}: ${d.description_ko}`).join('\n'));
            console.log('=== 프롬프트 끝 ===');

            
            const step3Messages = [{
              role: 'user',
              content: step3Content
            }];
            
            const step3Completion = await openai.chat.completions.create({
              model: 'gpt-5-mini',
              messages: step3Messages,
              max_completion_tokens: 1500
            });
            
            const rankingResponse = step3Completion.choices[0]?.message?.content?.trim() || '';
            console.log('3단계 순위 응답 길이:', rankingResponse.length);
            console.log('3단계 순위 응답:', rankingResponse);
            
            // 최종 응답 
            const itemResponse = rankingResponse;
            console.log('3단계 최종 응답:', itemResponse);
            
            // 응답 파싱
            let allCandidates = [];
            let allEvaluations = [];
            let finalHsCode = '';
            let finalDescription = '';
            let selectionReason = '';
            
            if (itemResponse) {
              console.log('3단계 응답 파싱 시작');
              
              // 순위 파싱
              if (itemResponse.includes('순위:')) {
                const lines = itemResponse.split('\n').filter(line => line.trim());
                
                for (const line of lines) {
                  if (line.includes('순위:')) {
                    // | 구분자가 있으면 그걸로 파싱
                    let code = '';
                    let reason = '';
                    
                    if (line.includes('|')) {
                      const parts = line.split('|').map(p => p.trim());
                      const codeMatch = parts[0]?.match(/\d{10}/);
                      if (codeMatch) {
                        code = codeMatch[0];
                        reason = parts[1] || '';
                      }
                    } else {
                      // | 구분자가 없으면 코드 뒤의 모든 텍스트를 이유로
                      const codeMatch = line.match(/\d{10}/);
                      if (codeMatch) {
                        code = codeMatch[0];
                        const codeIndex = line.indexOf(code);
                        reason = line.substring(codeIndex + 10).replace(/^\s*[:：]\s*/, '').trim();
                      }
                    }
                    
                    if (code) {
                      const item = hs10Data.find(i => i.hs_code === code);
                      
                      if (item) {
                        const candidate = {
                          hsCode: item.hs_code,
                          description: item.description_ko,
                          reason: reason || '적합한 분류',
                          rank: line.includes('1순위') ? 1 : 
                                line.includes('2순위') ? 2 : 
                                line.includes('3순위') ? 3 :
                                line.includes('4순위') ? 4 : 5
                        };
                        console.log(`파싱된 후보: ${candidate.hsCode} - 이유: "${candidate.reason}" (원본: "${line}")`);
                        
                        if (line.includes('1순위')) {
                          finalHsCode = item.hs_code;
                          finalDescription = item.description_ko;
                          selectionReason = reason;
                          // 중복 체크 후 추가
                          if (!allCandidates.some(c => c.hsCode === item.hs_code)) {
                            allCandidates.unshift(candidate); // 1순위를 맨 앞에
                          }
                        } else {
                          // 중복 체크 후 추가
                          if (!allCandidates.some(c => c.hsCode === item.hs_code)) {
                            allCandidates.push(candidate);
                          }
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

            // 3단계 완료 메시지
            controller.enqueue(sendSSEMessage(encoder, 'progress', { 
              step: 3,
              selected: finalHsCode,
              description: finalDescription,
              reason: selectionReason,
              allItems: hs10Data,  // 모든 10자리 코드 전달
              evaluations: allEvaluations,  // 전체 평가 전달
              message: `✅ 3단계 완료: ${finalHsCode} - ${finalDescription}`
            }));

            // 최종 결과
            controller.enqueue(sendSSEMessage(encoder, 'complete', {
              hsCode: finalHsCode,
              level: 'item',
              description: finalDescription,
              reason: selectionReason,
              candidates: allCandidates,
              allItems: hs10Data,  // 모든 10자리 코드 전달
              evaluations: allEvaluations,  // 전체 평가 전달
              hierarchy: {
                chapter: chapter,
                heading: heading,
                item: finalHsCode
              },
              model: 'gpt-5-mini',
              usage: {
                prompt_tokens: (step1Completion.usage?.prompt_tokens || 0) + 
                               (step2Completion.usage?.prompt_tokens || 0) + 
                               (step3Completion.usage?.prompt_tokens || 0),
                completion_tokens: (step1Completion.usage?.completion_tokens || 0) + 
                                  (step2Completion.usage?.completion_tokens || 0) + 
                                  (step3Completion.usage?.completion_tokens || 0),
                total_tokens: (step1Completion.usage?.total_tokens || 0) + 
                             (step2Completion.usage?.total_tokens || 0) + 
                             (step3Completion.usage?.total_tokens || 0)
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