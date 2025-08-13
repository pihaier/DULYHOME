'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Box,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Announcement as AnnouncementIcon,
  HelpOutline as HelpIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { createClient } from '@/lib/supabase/client';

interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
  is_important: boolean;
  created_at: string;
}

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  sort_order: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`support-tabpanel-${index}`}
      aria-labelledby={`support-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const CustomerSupportView = () => {
  const supabase = createClient();
  const [tabValue, setTabValue] = useState(0);
  const [expandedNotice, setExpandedNotice] = useState<string | false>(false);
  const [expandedFAQ, setExpandedFAQ] = useState<string | false>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [notices, setNotices] = useState<Notice[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // 공지사항 조회 (visible만)
      const { data: noticesData, error: noticesError } = await supabase
        .from('notices')
        .select('*')
        .eq('is_visible', true)
        .order('is_important', { ascending: false })
        .order('created_at', { ascending: false });

      if (noticesError) {
        console.error('Error fetching notices:', noticesError);
        throw noticesError;
      }
      setNotices(noticesData || []);

      // FAQ 조회 (visible만)
      const { data: faqsData, error: faqsError } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_visible', true)
        .order('sort_order', { ascending: true });

      if (faqsError) {
        console.error('Error fetching FAQs:', faqsError);
        throw faqsError;
      }
      setFaqs(faqsData || []);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError('데이터를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleNoticeChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedNotice(isExpanded ? panel : false);
    };

  const handleFAQChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedFAQ(isExpanded ? panel : false);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '공지':
        return 'error';
      case '안내':
        return 'info';
      case '기능추가':
        return 'success';
      case '점검':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getFAQCategoryColor = (category: string) => {
    switch (category) {
      case '회원가입':
        return 'primary';
      case '서비스신청':
        return 'success';
      case '결제':
        return 'warning';
      case '배송':
        return 'info';
      case '통관':
        return 'secondary';
      case '서비스':
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Typography variant="h3" fontWeight="bold" textAlign="center" mb={2}>
            고객지원 센터
          </Typography>
          <Typography variant="h6" color="text.secondary" textAlign="center" mb={4}>
            공지사항과 자주 묻는 질문을 확인하세요
          </Typography>
        </Grid>

        <Grid size={12}>
          <Card>
            <CardContent>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
                  <Tab
                    label={`공지사항 (${notices.length})`}
                    icon={<AnnouncementIcon />}
                    iconPosition="start"
                  />
                  <Tab
                    label={`자주 묻는 질문 (${faqs.length})`}
                    icon={<HelpIcon />}
                    iconPosition="start"
                  />
                </Tabs>
              </Box>

              {/* 공지사항 탭 */}
              <TabPanel value={tabValue} index={0}>
                <Stack spacing={2}>
                  {notices.length === 0 ? (
                    <Typography color="text.secondary" textAlign="center" py={4}>
                      등록된 공지사항이 없습니다.
                    </Typography>
                  ) : (
                    notices.map((notice) => (
                      <Accordion
                        key={notice.id}
                        expanded={expandedNotice === `notice-${notice.id}`}
                        onChange={handleNoticeChange(`notice-${notice.id}`)}
                        sx={{
                          '&:before': { display: 'none' },
                          boxShadow: 1,
                          '&.Mui-expanded': {
                            boxShadow: 2,
                          },
                        }}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          sx={{
                            '& .MuiAccordionSummary-content': {
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: 1,
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                            <Typography variant="h6" fontWeight={500}>
                              {notice.title}
                            </Typography>
                            {notice.is_important && (
                              <Chip label="중요" color="error" size="small" />
                            )}
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={notice.category}
                              color={getCategoryColor(notice.category) as any}
                              size="small"
                              variant="outlined"
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {new Date(notice.created_at).toLocaleDateString('ko-KR')}
                              </Typography>
                            </Box>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography
                            variant="body1"
                            sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}
                          >
                            {notice.content}
                          </Typography>
                        </AccordionDetails>
                      </Accordion>
                    ))
                  )}
                </Stack>
              </TabPanel>

              {/* FAQ 탭 */}
              <TabPanel value={tabValue} index={1}>
                <Stack spacing={2}>
                  {faqs.length === 0 ? (
                    <Typography color="text.secondary" textAlign="center" py={4}>
                      등록된 FAQ가 없습니다.
                    </Typography>
                  ) : (
                    faqs.map((faq) => (
                      <Accordion
                        key={faq.id}
                        expanded={expandedFAQ === `faq-${faq.id}`}
                        onChange={handleFAQChange(`faq-${faq.id}`)}
                        sx={{
                          '&:before': { display: 'none' },
                          boxShadow: 1,
                          '&.Mui-expanded': {
                            boxShadow: 2,
                          },
                        }}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          sx={{
                            '& .MuiAccordionSummary-content': {
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                            },
                          }}
                        >
                          <Chip
                            label={faq.category}
                            color={getFAQCategoryColor(faq.category) as any}
                            size="small"
                            sx={{ minWidth: 80 }}
                          />
                          <Typography variant="h6" fontWeight={500}>
                            {faq.question}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography
                            variant="body1"
                            sx={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}
                          >
                            {faq.answer}
                          </Typography>
                        </AccordionDetails>
                      </Accordion>
                    ))
                  )}
                </Stack>
              </TabPanel>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CustomerSupportView;
