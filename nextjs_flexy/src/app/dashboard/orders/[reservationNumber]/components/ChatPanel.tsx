import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useChat, ChatMessage } from '../hooks/useChat';

interface ChatPanelProps {
  reservationNumber: string;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ reservationNumber }) => {
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, participants, loading, error, sendMessage } = useChat(reservationNumber);

  // 메시지 목록 하단으로 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 메시지 전송 처리
  const handleSendMessage = async () => {
    if (!messageInput.trim() || loading) return;

    const message = messageInput.trim();
    setMessageInput('');

    try {
      await sendMessage(message);
    } catch (err) {}
  };

  // 엔터키 처리
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // 역할에 따른 아바타 색상
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'customer':
        return '#1976d2';
      case 'korean_team':
        return '#2e7d32';
      case 'chinese_staff':
        return '#ed6c02';
      case 'admin':
        return '#d32f2f';
      default:
        return '#757575';
    }
  };

  // 역할 텍스트
  const getRoleText = (role: string) => {
    switch (role) {
      case 'customer':
        return '고객';
      case 'korean_team':
        return '한국팀';
      case 'chinese_staff':
        return '중국직원';
      case 'admin':
        return '관리자';
      case 'inspector':
        return '검수원';
      case 'factory':
        return '공장';
      default:
        return role;
    }
  };

  // 메시지 렌더링
  const renderMessage = (message: ChatMessage) => {
    const isCurrentUser = false; // TODO: 현재 사용자 확인 로직 추가

    return (
      <ListItem
        key={message.id}
        sx={{
          flexDirection: 'column',
          alignItems: isCurrentUser ? 'flex-end' : 'flex-start',
          py: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 0.5,
            alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
          }}
        >
          <Avatar
            sx={{
              width: 24,
              height: 24,
              bgcolor: getRoleColor(message.sender_role),
              fontSize: '0.75rem',
            }}
          >
            <PersonIcon fontSize="small" />
          </Avatar>
          <Typography variant="caption" color="text.secondary">
            {message.sender_name}
          </Typography>
          <Chip
            label={getRoleText(message.sender_role)}
            size="small"
            variant="outlined"
            sx={{ height: 16, fontSize: '0.6rem' }}
          />
          <Typography variant="caption" color="text.secondary">
            {new Date(message.created_at).toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Typography>
        </Box>

        <Paper
          elevation={1}
          sx={{
            p: 1.5,
            maxWidth: '80%',
            bgcolor: isCurrentUser ? 'primary.light' : 'grey.100',
            color: isCurrentUser ? 'primary.contrastText' : 'text.primary',
          }}
        >
          {/* 원본 메시지 */}
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {message.original_message}
          </Typography>

          {/* 번역 메시지 (원본과 다른 경우만) */}
          {message.translated_message &&
            message.translated_message !== message.original_message && (
              <>
                <Divider sx={{ my: 1, opacity: 0.3 }} />
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    fontStyle: 'italic',
                    opacity: 0.8,
                  }}
                >
                  {message.translated_message}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.6, fontSize: '0.6rem' }}>
                  (번역됨)
                </Typography>
              </>
            )}
        </Paper>
      </ListItem>
    );
  };

  return (
    <Paper
      elevation={2}
      sx={{
        height: '600px',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 20,
      }}
    >
      {/* 헤더 */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid #eee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6">실시간 채팅</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={!loading ? '연결됨' : '연결 중...'}
            color={!loading ? 'success' : 'warning'}
            size="small"
            variant="outlined"
          />
          <Typography variant="caption" color="text.secondary">
            참여자 {participants.length}명
          </Typography>
        </Box>
      </Box>

      {/* 에러 표시 */}
      {error && (
        <Alert severity="error" sx={{ m: 1 }}>
          {error}
        </Alert>
      )}

      {/* 메시지 목록 */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <CircularProgress size={24} />
          </Box>
        ) : messages.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              textAlign: 'center',
              p: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              아직 메시지가 없습니다.
              <br />첫 번째 메시지를 보내보세요!
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0, flex: 1 }}>
            {messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </List>
        )}
      </Box>

      {/* 메시지 입력 */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid #eee',
          display: 'flex',
          gap: 1,
          alignItems: 'flex-end',
        }}
      >
        <TextField
          ref={inputRef}
          fullWidth
          multiline
          maxRows={3}
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="메시지를 입력하세요..."
          variant="outlined"
          size="small"
          disabled={loading}
        />
        <IconButton
          color="primary"
          onClick={handleSendMessage}
          disabled={!messageInput.trim() || loading}
          sx={{ mb: 0.5 }}
        >
          {loading ? <CircularProgress size={20} /> : <SendIcon />}
        </IconButton>
        <IconButton color="default" disabled={loading} sx={{ mb: 0.5 }}>
          <AttachFileIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default ChatPanel;
