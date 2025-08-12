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

export default function ChatPanel({ reservationNumber, currentUserId, currentUserRole, currentUserName, serviceType, onFileUpload }: ChatPanelProps) {
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const { supabase } = useUser();

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
      const { data: { user } } = await supabase.auth.getUser();
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
      const senderName = currentUserName || userProfile?.contact_person || userProfile?.company_name || user?.email || 'Unknown';
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
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to send message:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        alert(`메시지 전송에 실패했습니다: ${error.message}`);
      } else {
        // 메시지 즉시 추가 (실시간 구독이 작동하지 않을 경우를 대비)
        setChatMessages(prev => [...prev, data]);
        
        // 번역 함수 호출
        try {
          const { error: functionError } = await supabase.functions.invoke('translate-message', {
            body: { record: data }
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
        stack: error instanceof Error ? error.stack : undefined
      });
      alert(`메시지 전송 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
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
    fetchChatMessages();

    // Realtime 구독
    const channel = supabase
      .channel(`chat:${reservationNumber}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_messages',
        filter: `reservation_number=eq.${reservationNumber}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setChatMessages(prev => [...prev, payload.new as ChatMessage]);
        } else if (payload.eventType === 'UPDATE') {
          setChatMessages(prev => 
            prev.map(msg => msg.id === payload.new.id ? payload.new as ChatMessage : msg)
          );
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [reservationNumber]);

  // 자동 스크롤
  useEffect(() => {
    if (chatScrollRef.current) {
      // 스크롤을 맨 아래로 이동
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  return (
    <Box sx={{ width: '100%', height: '100%', bgcolor: 'grey.50', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          pb: 1,
          mb: 2
        }}>
          채팅
        </Typography>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box
            ref={chatScrollRef}
            sx={{ 
              flex: 1, 
              overflow: 'auto', 
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
              }
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
                      justifyContent: msg.sender_id === currentUserId ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <Paper
                      sx={{
                        p: 2,
                        maxWidth: '80%',
                        bgcolor: msg.sender_id === currentUserId ? 'primary.light' : 'grey.100'
                      }}
                    >
                      <Typography variant="caption" fontWeight="bold">
                        {msg.sender_name}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {/* 고객은 한글만 보기 - 원문이 중국어면 번역본 표시 */}
                        {msg.original_language === 'zh' && msg.translated_message 
                          ? msg.translated_message 
                          : msg.original_message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
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
            sx={{ bgcolor: 'white' }}
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