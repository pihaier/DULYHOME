'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Container,
  Card,
  CardContent,
  Avatar,
  Stack,
  Chip,
  Button,
  Paper,
  IconButton,
  Fade,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import {
  IconLanguage,
  IconBrain,
  IconMessage,
  IconClock,
  IconShieldCheck,
  IconArrowRight,
  IconUser,
  IconBrandOpenai,
  IconRefresh,
  IconHeadset,
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatBubble = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isUser',
})<{ isUser?: boolean }>(({ theme, isUser }) => ({
  padding: theme.spacing(2, 3),
  maxWidth: '70%',
  borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
  background: isUser
    ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
    : theme.palette.background.paper,
  color: isUser ? 'white' : theme.palette.text.primary,
  boxShadow: theme.shadows[3],
  position: 'relative',
  marginBottom: theme.spacing(2),
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  background: theme.palette.background.paper,
  borderRadius: (theme.shape.borderRadius as number) * 2,
  transition: 'all 0.3s ease',
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[10],
  },
}));

const RealtimeTranslation = () => {
  const theme = useTheme();
  const [currentLang, setCurrentLang] = useState('ko');
  const [isTyping, setIsTyping] = useState(false);

  const messages = {
    ko: [
      { text: '안녕하세요, 이번 주문 건에 대해 논의하고 싶습니다.', isUser: true },
      { text: '네, 어떤 부분을 논의하시겠습니까?', isUser: false },
      { text: '품질 검사 기준과 배송 일정을 확인하고 싶습니다.', isUser: true },
    ],
    zh: [
      { text: '您好，我想讨论一下这次订单的事情。', isUser: true },
      { text: '好的，您想讨论哪个部分？', isUser: false },
      { text: '我想确认质量检验标准和配送日程。', isUser: true },
    ],
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLang((prev) => (prev === 'ko' ? 'zh' : 'ko'));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <IconBrandOpenai size={30} />,
      title: 'GPT 기반',
      description: '최신 AI 모델로 문맥을 완벽히 이해하는 번역',
      stat: '99.9%',
      statLabel: '정확도',
    },
    {
      icon: <IconClock size={30} />,
      title: '실시간 번역',
      description: '0.5초 이내 즉시 번역 제공',
      stat: '0.5초',
      statLabel: '응답속도',
    },
    {
      icon: <IconHeadset size={30} />,
      title: '중국 구매팀 실시간 문의',
      description: '전담 중국 구매팀과 24시간 실시간 상담',
      stat: '24시간',
      statLabel: '상담가능',
    },
    {
      icon: <IconShieldCheck size={30} />,
      title: '전문 용어 DB',
      description: '10만개+ 무역 전문 용어 데이터베이스',
      stat: '10만+',
      statLabel: '전문용어',
    },
    {
      icon: <IconBrain size={30} />,
      title: '컨텍스트 유지',
      description: '대화 맥락을 이해하는 스마트 번역',
      stat: '100%',
      statLabel: '맥락이해',
    },
  ];

  return (
    <Box
      sx={{
        py: { xs: 8, sm: 10, lg: 12 },
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 배경 장식 */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.palette.primary.light}20 0%, transparent 70%)`,
        }}
      />

      <Container maxWidth="lg">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h2"
            textAlign="center"
            fontWeight={700}
            sx={{
              fontSize: { xs: '32px', sm: '40px', lg: '48px' },
              mb: 2,
              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            실시간 AI 통번역 시스템
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 8 }}>
            GPT 기반 한중 비즈니스 전문 통번역으로 언어 장벽 없는 무역
            <br />
            중국 구매팀 담당자와 실시간 소통
          </Typography>
        </motion.div>

        {/* 실시간 채팅 데모 */}
        <Grid container spacing={4} mb={8}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card sx={{ p: 3, height: '100%', position: 'relative' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h5" fontWeight={600}>
                    실시간 번역 채팅
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      label={currentLang === 'ko' ? '한국어' : '中文'}
                      color="primary"
                      size="small"
                    />
                    <IconButton
                      size="small"
                      onClick={() => setCurrentLang((prev) => (prev === 'ko' ? 'zh' : 'ko'))}
                    >
                      <IconRefresh size={18} />
                    </IconButton>
                  </Stack>
                </Stack>

                <Box sx={{ minHeight: 300 }}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentLang}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      {messages[currentLang].map((msg, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            justifyContent: msg.isUser ? 'flex-end' : 'flex-start',
                            mb: 2,
                          }}
                        >
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.2 }}
                          >
                            <ChatBubble isUser={msg.isUser}>
                              <Typography variant="body1">{msg.text}</Typography>
                            </ChatBubble>
                          </motion.div>
                        </Box>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </Box>

                {/* AI 번역 인디케이터 */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 1,
                    borderRadius: 20,
                    bgcolor: theme.palette.primary.light,
                  }}
                >
                  <IconBrandOpenai size={20} />
                  <Typography variant="caption" fontWeight={600}>
                    AI 실시간 번역 중
                  </Typography>
                </Box>
              </Card>
            </motion.div>
          </Grid>

          <Grid size={{ xs: 12, lg: 5 }}>
            <Stack spacing={3}>
              {features.slice(0, 2).map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                >
                  <FeatureCard>
                    <CardContent>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          sx={{
                            bgcolor: theme.palette.primary.light,
                            color: theme.palette.primary.main,
                            width: 56,
                            height: 56,
                          }}
                        >
                          {feature.icon}
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="h6" fontWeight={600}>
                            {feature.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {feature.description}
                          </Typography>
                        </Box>
                        <Box textAlign="center">
                          <Typography variant="h4" fontWeight={700} color="primary">
                            {feature.stat}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {feature.statLabel}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </FeatureCard>
                </motion.div>
              ))}
            </Stack>
          </Grid>
        </Grid>

        {/* 기능 카드 */}
        <Grid container spacing={3} mb={8}>
          {features.slice(2).map((feature, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6 }}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              >
                <FeatureCard>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        sx={{
                          bgcolor: theme.palette.info.light,
                          color: theme.palette.info.main,
                        }}
                      >
                        {feature.icon}
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="h6" fontWeight={600}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {feature.description}
                        </Typography>
                      </Box>
                      <Chip
                        label={feature.stat}
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 700 }}
                      />
                    </Stack>
                  </CardContent>
                </FeatureCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default RealtimeTranslation;
