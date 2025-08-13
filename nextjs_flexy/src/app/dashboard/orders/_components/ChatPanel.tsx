'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Avatar,
  Paper,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { useUser } from '@/lib/context/GlobalContext';
import { fetchChatMessages as fetchMessages, insertChatMessage } from '@/lib/utils/supabase-fetch';
import { createSimpleClient } from '@/lib/supabase/client-simple';

interface ChatMessage {
  id: string;
  reservation_number: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  original_message: string;
  original_language: string;
  translated_message?: string;
  translated_language?: string;
  message_type: string;
  created_at: string;
}

interface ChatPanelProps {
  reservationNumber: string;
  currentUserId?: string;
  currentUserRole?: string;
  currentUserName?: string;
  serviceType?: string; // 서비스 타입 추가 ('market-research' | 'factory-contact' | 'inspection')
  onFileUpload?: () => void;
}

export default function ChatPanel({
  reservationNumber,
  currentUserId,
  currentUserRole,
  currentUserName,
  serviceType,
  onFileUpload,
}: ChatPanelProps) {
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const { supabase, user } = useUser();
  const effectiveUserId = user?.id || currentUserId || '93c87ed3-a25d-4838-acd5-6e082ed56478';

  // 채팅 메시지 가져오기
  const fetchChatMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('reservation_number', reservationNumber)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching chat messages:', error);
      } else {
        setChatMessages(data || []);
      }
    } catch (error) {
      console.error('Error in fetchChatMessages:', error);
    } finally {
      setLoadingChat(false);
    }
  };

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!chatMessage.trim() || sendingMessage) return;

    setSendingMessage(true);
    const messageToSend = chatMessage;
    setChatMessage('');

    try {
      // 사용자 정보 가져오기
      const {
        data: { user },
      } = await supabase.auth.getUser();
      let userProfile = null;

      if (user?.id) {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!profileError) {
          userProfile = profile;
        }
      }

      // 언어 감지 로직
      const detectLanguage = (text: string) => {
        const koreanPattern = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
        const chinesePattern = /[\u4e00-\u9fa5]/;
        const koreanCount = (text.match(koreanPattern) || []).length;
        const chineseCount = (text.match(chinesePattern) || []).length;
        return chineseCount > koreanCount ? 'zh' : 'ko';
      };

      // 메시지 저장 - 테스트용으로 currentUserId 사용
      const senderId = user?.id || currentUserId || '93c87ed3-a25d-4838-acd5-6e082ed56478'; // 테스트 user ID
      const senderName =
        currentUserName ||
        userProfile?.contact_person ||
        userProfile?.company_name ||
        user?.email ||
        'Unknown';
      const senderRole = currentUserRole || userProfile?.role || 'customer';

      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          reservation_number: reservationNumber,
          sender_id: senderId,
          sender_name: senderName,
          sender_role: senderRole,
          original_message: messageToSend,
          original_language: detectLanguage(messageToSend),
          message_type: 'text',
          service_type: serviceType, // service_type 추가
          is_read: false, // 새 메시지는 읽지 않은 상태로 추가
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to send message:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        alert(`메시지 전송에 실패했습니다: ${error.message}`);
      } else {
        // 메시지 즉시 추가 (실시간 구독이 작동하지 않을 경우를 대비)
        setChatMessages((prev) => [...prev, data]);

        // 번역 함수 호출
        try {
          const { error: functionError } = await supabase.functions.invoke('translate-message', {
            body: { record: data },
          });

          if (functionError) {
            console.error('Translation function error:', functionError);
          }
        } catch (err) {
          console.error('Failed to invoke translation:', err);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Catch block error details:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      alert(
        `메시지 전송 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      );
    } finally {
      setSendingMessage(false);
    }
  };

  // Enter 키로 메시지 전송
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 초기 로드 및 실시간 구독
  useEffect(() => {
    if (!reservationNumber) return;

    setLoadingChat(true);
    fetchChatMessages().then(() => {
      // 번역 안 된 메시지 찾아서 번역 요청
      const translatePendingMessages = async () => {
        const { data: untranslated } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('reservation_number', reservationNumber)
          .is('translated_message', null)
          .not('original_message', 'is', null);
        
        if (untranslated && untranslated.length > 0) {
          console.log(`Found ${untranslated.length} untranslated messages`);
          
          for (const msg of untranslated) {
            await supabase.functions.invoke('translate-message', {
              body: { record: msg }
            });
          }
        }
      };
      
      translatePendingMessages();
    });

    // Realtime 구독 - 더 간단한 방식으로
    console.log('Setting up Realtime subscription for:', reservationNumber);
    
    const channel = supabase
      .channel(`chat_messages_${reservationNumber}`)
      .on(
        'postgres_changes',
        {
          event: '*', // 모든 이벤트 수신
          schema: 'public',
          table: 'chat_messages',
          filter: `reservation_number=eq.${reservationNumber}`,
        },
        (payload) => {
          console.log('Realtime event received:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as ChatMessage;
            
            // 중복 체크 후 추가
            setChatMessages((prev) => {
              const exists = prev.some(msg => msg.id === newMessage.id);
              if (exists) {
                console.log('Message already exists, skipping');
                return prev;
              }
              console.log('Adding new message:', newMessage.id);
              return [...prev, newMessage];
            });
            
            // 번역 요청
            if (!newMessage.translated_message && newMessage.original_message) {
              console.log('Requesting translation for message:', newMessage.id);
              supabase.functions.invoke('translate-message', {
                body: { record: newMessage }
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedMessage = payload.new as ChatMessage;
            console.log('Updating message:', updatedMessage.id);
            setChatMessages((prev) =>
              prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedMessage = payload.old as ChatMessage;
            console.log('Deleting message:', deletedMessage.id);
            setChatMessages((prev) =>
              prev.filter((msg) => msg.id !== deletedMessage.id)
            );
          }
        }
      )
      .subscribe((status, error) => {
        console.log('Subscription status:', status);
        if (error) {
          console.error('Subscription error:', error);
        }
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to realtime updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Channel error - check Supabase Dashboard Realtime settings');
        } else if (status === 'TIMED_OUT') {
          console.error('⏱️ Subscription timed out');
        } else if (status === 'CLOSED') {
          console.log('🔒 Subscription closed');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [reservationNumber, supabase]);

  // 자동 스크롤
  useEffect(() => {
    if (chatScrollRef.current) {
      // 스크롤을 맨 아래로 이동
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        bgcolor: 'grey.50',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Typography
          variant="h6"
          fontWeight="bold"
          gutterBottom
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            pb: 1,
            mb: 2,
            flexShrink: 0,
          }}
        >
          채팅
        </Typography>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <Box
            ref={chatScrollRef}
            sx={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              bgcolor: 'white',
              p: 2,
              borderRadius: 1,
              mb: 2,
              display: 'flex',
              flexDirection: 'column',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#f1f1f1',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#888',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                backgroundColor: '#555',
              },
            }}
          >
            {loadingChat ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={24} />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  채팅 내용을 불러오는 중...
                </Typography>
              </Box>
            ) : chatMessages.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary" variant="body2">
                  채팅 내용이 없습니다.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {chatMessages.map((msg) => (
                  <Box
                    key={msg.id}
                    sx={{
                      display: 'flex',
                      justifyContent: msg.sender_id === effectiveUserId ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <Paper
                      sx={{
                        p: 2,
                        maxWidth: '80%',
                        bgcolor: msg.sender_id === effectiveUserId ? 'primary.light' : 'grey.100',
                      }}
                    >
                      {/* 발신자 이름 */}
                      <Typography variant="caption" fontWeight="bold" color="primary.dark">
                        {msg.sender_name}
                      </Typography>
                      
                      {/* 원문 메시지 */}
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {msg.original_message}
                      </Typography>
                      
                      {/* 번역 메시지 (있을 경우만) */}
                      {msg.translated_message && (
                        <Box
                          sx={{
                            mt: 1,
                            p: 1,
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            borderLeft: '3px solid',
                            borderColor: msg.original_language === 'ko' ? 'error.light' : 'info.main',
                          }}
                        >
                          <Typography variant="body2" sx={{ fontSize: '0.9em', color: 'text.secondary' }}>
                            {msg.original_language === 'ko' ? '🇨🇳 ' : '🇰🇷 '}
                            {msg.translated_message}
                          </Typography>
                        </Box>
                      )}
                      
                      {/* 번역 중 표시 */}
                      {!msg.translated_message && msg.original_message && msg.original_language !== 'ko' && (
                        <Typography
                          variant="caption"
                          sx={{
                            mt: 0.5,
                            display: 'block',
                            color: 'warning.main',
                            fontStyle: 'italic',
                          }}
                        >
                          🔄 한국어 번역 중...
                        </Typography>
                      )}
                      
                      {/* 시간 표시 */}
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'flex', alignItems: 'center', mt: 1 }}
                      >
                        <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                        {new Date(msg.created_at).toLocaleString('ko-KR')}
                      </Typography>
                    </Paper>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>

          <TextField
            fullWidth
            size="small"
            placeholder="메시지를 입력하세요..."
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{ bgcolor: 'white', flexShrink: 0 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {onFileUpload && (
                    <IconButton edge="end" onClick={onFileUpload} size="small">
                      <AttachFileIcon />
                    </IconButton>
                  )}
                  <IconButton
                    edge="end"
                    color="primary"
                    size="small"
                    onClick={handleSendMessage}
                    disabled={!chatMessage.trim() || sendingMessage}
                  >
                    <SendIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
