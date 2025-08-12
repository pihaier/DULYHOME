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
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Announcement as AnnouncementIcon,
  HelpOutline as HelpIcon,
  CalendarToday as CalendarIcon,
  Category as CategoryIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { customerSupportData } from '../../../../frontend-pages/blog/customer-support-data';
import { useUser } from '@/lib/context/GlobalContext';
import { IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

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

const CustomerSupportList = () => {
  const { user } = useUser();
  const [tabValue, setTabValue] = useState(0);
  const [expandedNotice, setExpandedNotice] = useState<string | false>(false);
  const [expandedFAQ, setExpandedFAQ] = useState<string | false>(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState<'add' | 'edit'>('add');
  const [editType, setEditType] = useState<'notice' | 'faq'>('notice');
  const [editData, setEditData] = useState<any>(null);
  const [notices, setNotices] = useState(customerSupportData.notices);
  const [faqs, setFaqs] = useState(customerSupportData.faqs);
  
  // 관리자 이메일 설정 (여기에 관리자 이메일을 입력하세요)
  const ADMIN_EMAILS = ['admin@duly.co.kr']; // 여기에 당신의 이메일을 넣으세요
  
  useEffect(() => {
    // 로그인한 사용자가 관리자인지 확인
    if (user?.email && ADMIN_EMAILS.includes(user.email)) {
      setIsAdmin(true);
    }
  }, [user]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleNoticeChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
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

  const handleEdit = (type: 'notice' | 'faq', item: any) => {
    setEditMode('edit');
    setEditType(type);
    setEditData(item);
    setEditDialogOpen(true);
  };
  
  const handleAdd = (type: 'notice' | 'faq') => {
    setEditMode('add');
    setEditType(type);
    setEditData(null);
    setEditDialogOpen(true);
  };
  
  const handleDelete = (type: 'notice' | 'faq', id: number) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      if (type === 'notice') {
        setNotices(notices.filter(n => n.id !== id));
      } else {
        setFaqs(faqs.filter(f => f.id !== id));
      }
    }
  };
  
  const handleSave = () => {
    // 여기서 실제로는 서버에 저장해야 하지만, 일단 로컬 상태만 업데이트
    if (editType === 'notice') {
      if (editMode === 'add') {
        const newNotice = {
          id: notices.length + 1,
          title: editData?.title || '',
          date: new Date().toISOString().split('T')[0],
          category: editData?.category || '공지',
          content: editData?.content || '',
          important: editData?.important || false,
        };
        setNotices([newNotice, ...notices]);
      } else {
        setNotices(notices.map(n => n.id === editData.id ? editData : n));
      }
    } else {
      if (editMode === 'add') {
        const newFaq = {
          id: faqs.length + 1,
          category: editData?.category || '서비스신청',
          question: editData?.question || '',
          answer: editData?.answer || '',
        };
        setFaqs([...faqs, newFaq]);
      } else {
        setFaqs(faqs.map(f => f.id === editData.id ? editData : f));
      }
    }
    setEditDialogOpen(false);
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
                    label="공지사항" 
                    icon={<AnnouncementIcon />} 
                    iconPosition="start"
                  />
                  <Tab 
                    label="자주 묻는 질문 (FAQ)" 
                    icon={<HelpIcon />} 
                    iconPosition="start"
                  />
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
                          {notice.important && (
                            <Chip label="중요" color="error" size="small" />
                          )}
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
                              {notice.date}
                            </Typography>
                          </Box>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                          {notice.content.trim()}
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
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
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
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>취소</Button>
          <Button onClick={handleSave} variant="contained">저장</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CustomerSupportList;