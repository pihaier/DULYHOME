'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Stack,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Avatar,
  Divider,
} from '@mui/material';
import {
  SmartToy as BotIcon,
  Person as PersonIcon,
  Send as SendIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { createClient } from '@/lib/supabase/client';

interface Message {
  type: 'user' | 'bot' | 'codes';
  text?: string;
  questions?: string[];
  codes?: Array<{
    hs_code: string;
    name_ko: string;
    name_en?: string;
    tax_rate?: number;
    confidence?: number;
  }>;
}

export default function HSCodeChatSearch() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [context, setContext] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;

    // 사용자 메시지 추가
    const userMessage: Message = { type: 'user', text: query };
    setMessages((prev) => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.functions.invoke('hs-code-smart-search', {
        body: { query, context },
      });

      if (error || (data && data.error)) {
        setMessages((prev) => [
          ...prev,
          {
            type: 'bot',
            text: '검색 중 오류가 발생했습니다. 다시 시도해주세요.',
          },
        ]);
        return;
      }

      if (data.status === 'need_info') {
        // 추가 정보 필요
        setMessages((prev) => [
          ...prev,
          {
            type: 'bot',
            text: data.message,
            questions: data.questions,
          },
        ]);

        if (data.preliminary_codes?.length > 0) {
          setMessages((prev) => [
            ...prev,
            {
              type: 'codes',
              codes: data.preliminary_codes,
            },
          ]);
        }
      } else {
        // 코드 찾음
        setMessages((prev) => [
          ...prev,
          {
            type: 'bot',
            text: data.message,
          },
          {
            type: 'codes',
            codes: data.codes,
          },
        ]);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionClick = (question: string) => {
    setContext((prev) => prev + ' ' + question);
    setQuery(question);
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          🤖 AI HS코드 스마트 검색
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          제품명을 입력하면 AI가 질문을 통해 정확한 HS코드를 찾아드립니다
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* 대화 내역 */}
        <Paper
          variant="outlined"
          sx={{
            height: 400,
            overflowY: 'auto',
            p: 2,
            mb: 2,
            bgcolor: 'grey.50',
          }}
        >
          {messages.length === 0 ? (
            <Box sx={{ textAlign: 'center', color: 'text.secondary', mt: 10 }}>
              <BotIcon sx={{ fontSize: 48, mb: 2 }} />
              <Typography>
                무엇을 찾으시나요?
                <br />
                예: "커피머신", "슬리퍼", "노트북"
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {messages.map((msg, idx) => (
                <Box key={idx}>
                  {msg.type === 'user' && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Paper
                        sx={{
                          p: 1.5,
                          bgcolor: 'primary.main',
                          color: 'white',
                          maxWidth: '70%',
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2">{msg.text}</Typography>
                          <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.dark' }}>
                            <PersonIcon fontSize="small" />
                          </Avatar>
                        </Stack>
                      </Paper>
                    </Box>
                  )}

                  {msg.type === 'bot' && (
                    <Box sx={{ display: 'flex' }}>
                      <Paper
                        sx={{
                          p: 1.5,
                          bgcolor: 'white',
                          maxWidth: '70%',
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="flex-start">
                          <Avatar sx={{ width: 24, height: 24, bgcolor: 'secondary.main' }}>
                            <BotIcon fontSize="small" />
                          </Avatar>
                          <Box>
                            <Typography variant="body2">{msg.text}</Typography>
                            {msg.questions && (
                              <Stack spacing={1} sx={{ mt: 2 }}>
                                {msg.questions.map((q, qIdx) => (
                                  <Chip
                                    key={qIdx}
                                    label={q}
                                    onClick={() => handleQuestionClick(q)}
                                    sx={{ justifyContent: 'flex-start' }}
                                  />
                                ))}
                              </Stack>
                            )}
                          </Box>
                        </Stack>
                      </Paper>
                    </Box>
                  )}

                  {msg.type === 'codes' && msg.codes && (
                    <List>
                      {msg.codes.map((code, cIdx) => (
                        <ListItem
                          key={cIdx}
                          sx={{
                            bgcolor: 'background.paper',
                            mb: 1,
                            borderRadius: 1,
                            border: 1,
                            borderColor: 'divider',
                          }}
                          secondaryAction={
                            <Button
                              size="small"
                              onClick={() => copyToClipboard(code.hs_code)}
                              startIcon={copiedCode === code.hs_code ? <CheckIcon /> : <CopyIcon />}
                            >
                              {copiedCode === code.hs_code ? '복사됨' : '복사'}
                            </Button>
                          }
                        >
                          <ListItemText
                            primary={
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Chip label={code.hs_code} size="small" color="primary" />
                                <Typography variant="body2">{code.name_ko}</Typography>
                                {code.confidence && code.confidence > 0.8 && (
                                  <Chip
                                    label="추천"
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                  />
                                )}
                              </Stack>
                            }
                            secondary={
                              <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                                {code.tax_rate !== undefined && (
                                  <Typography variant="caption">
                                    관세율: {code.tax_rate}%
                                  </Typography>
                                )}
                                {code.name_en && (
                                  <Typography variant="caption" color="text.secondary">
                                    {code.name_en}
                                  </Typography>
                                )}
                              </Stack>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              ))}
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              )}
            </Stack>
          )}
        </Paper>

        {/* 입력창 */}
        <Stack direction="row" spacing={1}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="제품명을 입력하세요..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            disabled={loading}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            startIcon={<SendIcon />}
          >
            검색
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
