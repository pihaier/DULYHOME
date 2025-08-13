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
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Announcement as AnnouncementIcon,
  HelpOutline as HelpIcon,
  CalendarToday as CalendarIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useUser } from '@/lib/context/GlobalContext';
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

const CustomerSupportListDB = () => {
  const { user, userProfile } = useUser();
  const supabase = createClient();
  const [tabValue, setTabValue] = useState(0);
  const [expandedNotice, setExpandedNotice] = useState<string | false>(false);
  const [expandedFAQ, setExpandedFAQ] = useState<string | false>(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [notices, setNotices] = useState<Notice[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState<'add' | 'edit'>('add');
  const [editType, setEditType] = useState<'notice' | 'faq'>('notice');
  const [editData, setEditData] = useState<any>(null);

  useEffect(() => {
    // 로그인한 사용자의 role이 admin 또는 korean_team인지 확인
    if (userProfile?.role && ['admin', 'korean_team'].includes(userProfile.role)) {
      setIsAdmin(true);
    }
    fetchData();
  }, [userProfile]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // 공지사항 조회
      const { data: noticesData, error: noticesError } = await supabase
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false });

      if (noticesError) {
        console.error('Error fetching notices:', noticesError);
        // 테이블이 없는 경우 빈 배열로 처리
        if (noticesError.code === '42P01') {
          setNotices([]);
        } else {
          throw noticesError;
        }
      } else {
        setNotices(noticesData || []);
      }

      // FAQ 조회
      const { data: faqsData, error: faqsError } = await supabase
        .from('faqs')
        .select('*')
        .order('sort_order', { ascending: true });

      if (faqsError) {
        console.error('Error fetching FAQs:', faqsError);
        // 테이블이 없는 경우 빈 배열로 처리
        if (faqsError.code === '42P01') {
          setFaqs([]);
        } else {
          throw faqsError;
        }
      } else {
        setFaqs(faqsData || []);
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      // 테이블이 없는 경우 로컬 데이터 사용
      if (err?.code === '42P01') {
        setError('데이터베이스 테이블이 아직 생성되지 않았습니다. 마이그레이션을 실행해주세요.');
        // 임시로 기본 데이터 표시
        setNotices([]);
        setFaqs([]);
      } else {
        setError('데이터를 불러오는데 실패했습니다.');
      }
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

  const handleEdit = (type: 'notice' | 'faq', item: any) => {
    setEditMode('edit');
    setEditType(type);
    setEditData(item);
    setEditDialogOpen(true);
  };

  const handleAdd = (type: 'notice' | 'faq') => {
    setEditMode('add');
    setEditType(type);
    setEditData(
      type === 'notice'
        ? { title: '', content: '', category: '공지', is_important: false }
        : { question: '', answer: '', category: '서비스신청', sort_order: 0 }
    );
    setEditDialogOpen(true);
  };

  const handleDelete = async (type: 'notice' | 'faq', id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from(type === 'notice' ? 'notices' : 'faqs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // 로컬 상태 업데이트
      if (type === 'notice') {
        setNotices(notices.filter((n) => n.id !== id));
      } else {
        setFaqs(faqs.filter((f) => f.id !== id));
      }
    } catch (err) {
      console.error('Error deleting:', err);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleSave = async () => {
    try {
      if (editType === 'notice') {
        if (editMode === 'add') {
          const { data, error } = await supabase
            .from('notices')
            .insert([
              {
                title: editData.title,
                content: editData.content,
                category: editData.category,
                is_important: editData.is_important,
              },
            ])
            .select()
            .single();

          if (error) throw error;
          setNotices([data, ...notices]);
        } else {
          const { data, error } = await supabase
            .from('notices')
            .update({
              title: editData.title,
              content: editData.content,
              category: editData.category,
              is_important: editData.is_important,
            })
            .eq('id', editData.id)
            .select()
            .single();

          if (error) throw error;
          setNotices(notices.map((n) => (n.id === data.id ? data : n)));
        }
      } else {
        if (editMode === 'add') {
          const { data, error } = await supabase
            .from('faqs')
            .insert([
              {
                question: editData.question,
                answer: editData.answer,
                category: editData.category,
                sort_order: editData.sort_order || faqs.length,
              },
            ])
            .select()
            .single();

          if (error) throw error;
          setFaqs([...faqs, data]);
        } else {
          const { data, error } = await supabase
            .from('faqs')
            .update({
              question: editData.question,
              answer: editData.answer,
              category: editData.category,
              sort_order: editData.sort_order,
            })
            .eq('id', editData.id)
            .select()
            .single();

          if (error) throw error;
          setFaqs(faqs.map((f) => (f.id === data.id ? data : f)));
        }
      }

      setEditDialogOpen(false);
      setEditData(null);
    } catch (err) {
      console.error('Error saving:', err);
      alert('저장에 실패했습니다.');
    }
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

  if (error && notices.length === 0 && faqs.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Alert severity="warning">
          {error}
          <br />
          임시로 기본 데이터를 표시합니다.
        </Alert>
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
                  <Tab label="공지사항" icon={<AnnouncementIcon />} iconPosition="start" />
                  <Tab label="자주 묻는 질문 (FAQ)" icon={<HelpIcon />} iconPosition="start" />
                </Tabs>
              </Box>

              {/* 공지사항 탭 */}
              <TabPanel value={tabValue} index={0}>
                {isAdmin && (
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleAdd('notice')}
                    >
                      공지사항 추가
                    </Button>
                  </Box>
                )}
                <Stack spacing={2}>
                  {notices.map((notice) => (
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
                          {notice.is_important && <Chip label="중요" color="error" size="small" />}
                          {isAdmin && (
                            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit('notice', notice);
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete('notice', notice.id);
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
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
                  ))}
                </Stack>
              </TabPanel>

              {/* FAQ 탭 */}
              <TabPanel value={tabValue} index={1}>
                {isAdmin && (
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleAdd('faq')}
                    >
                      FAQ 추가
                    </Button>
                  </Box>
                )}
                <Stack spacing={2}>
                  {faqs.map((faq) => (
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
                        {isAdmin && (
                          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit('faq', faq);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete('faq', faq.id);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                          {faq.answer}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Stack>
              </TabPanel>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 편집 다이얼로그 */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editMode === 'add' ? '추가' : '수정'} - {editType === 'notice' ? '공지사항' : 'FAQ'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {editType === 'notice' ? (
              <>
                <TextField
                  fullWidth
                  label="제목"
                  value={editData?.title || ''}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                />
                <FormControl fullWidth>
                  <InputLabel>카테고리</InputLabel>
                  <Select
                    value={editData?.category || '공지'}
                    label="카테고리"
                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                  >
                    <MenuItem value="공지">공지</MenuItem>
                    <MenuItem value="안내">안내</MenuItem>
                    <MenuItem value="기능추가">기능추가</MenuItem>
                    <MenuItem value="점검">점검</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="내용"
                  multiline
                  rows={6}
                  value={editData?.content || ''}
                  onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editData?.is_important || false}
                      onChange={(e) => setEditData({ ...editData, is_important: e.target.checked })}
                    />
                  }
                  label="중요 공지사항"
                />
              </>
            ) : (
              <>
                <FormControl fullWidth>
                  <InputLabel>카테고리</InputLabel>
                  <Select
                    value={editData?.category || '서비스신청'}
                    label="카테고리"
                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                  >
                    <MenuItem value="회원가입">회원가입</MenuItem>
                    <MenuItem value="서비스신청">서비스신청</MenuItem>
                    <MenuItem value="결제">결제</MenuItem>
                    <MenuItem value="배송">배송</MenuItem>
                    <MenuItem value="통관">통관</MenuItem>
                    <MenuItem value="서비스">서비스</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="질문"
                  value={editData?.question || ''}
                  onChange={(e) => setEditData({ ...editData, question: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="답변"
                  multiline
                  rows={4}
                  value={editData?.answer || ''}
                  onChange={(e) => setEditData({ ...editData, answer: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="정렬 순서"
                  type="number"
                  value={editData?.sort_order || 0}
                  onChange={(e) =>
                    setEditData({ ...editData, sort_order: parseInt(e.target.value) || 0 })
                  }
                />
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>취소</Button>
          <Button onClick={handleSave} variant="contained">
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CustomerSupportListDB;
