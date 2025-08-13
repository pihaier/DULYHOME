'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/context/GlobalContext';
import { useRouter } from 'next/navigation';

interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
  is_important: boolean;
  is_visible: boolean;
  created_at: string;
}

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  sort_order: number;
  is_visible: boolean;
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

export default function CustomerSupportManagement() {
  const supabase = createClient();
  const router = useRouter();
  const { userProfile } = useUser();

  const [tabValue, setTabValue] = useState(0);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [noticeDialog, setNoticeDialog] = useState(false);
  const [faqDialog, setFaqDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: 'notice' | 'faq';
    id: string;
  }>({
    open: false,
    type: 'notice',
    id: '',
  });

  // Form states
  const [noticeForm, setNoticeForm] = useState<Partial<Notice>>({
    title: '',
    content: '',
    category: '공지',
    is_important: false,
    is_visible: true,
  });

  const [faqForm, setFaqForm] = useState<Partial<FAQ>>({
    category: '서비스신청',
    question: '',
    answer: '',
    sort_order: 0,
    is_visible: true,
  });

  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // 권한 체크
  useEffect(() => {
    if (userProfile && !['admin', 'korean_team', 'chinese_staff'].includes(userProfile.role)) {
      router.push('/dashboard');
    }
  }, [userProfile, router]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 공지사항 조회 (모든 항목)
      const { data: noticesData, error: noticesError } = await supabase
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false });

      if (noticesError) throw noticesError;
      setNotices(noticesData || []);

      // FAQ 조회 (모든 항목)
      const { data: faqsData, error: faqsError } = await supabase
        .from('faqs')
        .select('*')
        .order('sort_order', { ascending: true });

      if (faqsError) throw faqsError;
      setFaqs(faqsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      showSnackbar('데이터를 불러오는데 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Notice CRUD operations
  const handleSaveNotice = async () => {
    try {
      if (noticeForm.id) {
        // Update
        const { error } = await supabase
          .from('notices')
          .update({
            title: noticeForm.title,
            content: noticeForm.content,
            category: noticeForm.category,
            is_important: noticeForm.is_important,
            is_visible: noticeForm.is_visible,
          })
          .eq('id', noticeForm.id);

        if (error) throw error;
        showSnackbar('공지사항이 수정되었습니다.', 'success');
      } else {
        // Create
        const { error } = await supabase.from('notices').insert({
          title: noticeForm.title,
          content: noticeForm.content,
          category: noticeForm.category,
          is_important: noticeForm.is_important,
          is_visible: noticeForm.is_visible,
        });

        if (error) throw error;
        showSnackbar('공지사항이 추가되었습니다.', 'success');
      }

      setNoticeDialog(false);
      setNoticeForm({
        title: '',
        content: '',
        category: '공지',
        is_important: false,
        is_visible: true,
      });
      fetchData();
    } catch (error) {
      console.error('Error saving notice:', error);
      showSnackbar('저장에 실패했습니다.', 'error');
    }
  };

  const handleEditNotice = (notice: Notice) => {
    setNoticeForm(notice);
    setNoticeDialog(true);
  };

  const handleDeleteNotice = async () => {
    try {
      const { error } = await supabase.from('notices').delete().eq('id', deleteDialog.id);

      if (error) throw error;
      showSnackbar('공지사항이 삭제되었습니다.', 'success');
      setDeleteDialog({ open: false, type: 'notice', id: '' });
      fetchData();
    } catch (error) {
      console.error('Error deleting notice:', error);
      showSnackbar('삭제에 실패했습니다.', 'error');
    }
  };

  const handleToggleNoticeVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase
        .from('notices')
        .update({ is_visible: !currentVisibility })
        .eq('id', id);

      if (error) throw error;
      showSnackbar('공개 상태가 변경되었습니다.', 'success');
      fetchData();
    } catch (error) {
      console.error('Error toggling visibility:', error);
      showSnackbar('상태 변경에 실패했습니다.', 'error');
    }
  };

  // FAQ CRUD operations
  const handleSaveFAQ = async () => {
    try {
      if (faqForm.id) {
        // Update
        const { error } = await supabase
          .from('faqs')
          .update({
            category: faqForm.category,
            question: faqForm.question,
            answer: faqForm.answer,
            sort_order: faqForm.sort_order,
            is_visible: faqForm.is_visible,
          })
          .eq('id', faqForm.id);

        if (error) throw error;
        showSnackbar('FAQ가 수정되었습니다.', 'success');
      } else {
        // Create
        const { error } = await supabase.from('faqs').insert({
          category: faqForm.category,
          question: faqForm.question,
          answer: faqForm.answer,
          sort_order: faqForm.sort_order,
          is_visible: faqForm.is_visible,
        });

        if (error) throw error;
        showSnackbar('FAQ가 추가되었습니다.', 'success');
      }

      setFaqDialog(false);
      setFaqForm({
        category: '서비스신청',
        question: '',
        answer: '',
        sort_order: 0,
        is_visible: true,
      });
      fetchData();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      showSnackbar('저장에 실패했습니다.', 'error');
    }
  };

  const handleEditFAQ = (faq: FAQ) => {
    setFaqForm(faq);
    setFaqDialog(true);
  };

  const handleDeleteFAQ = async () => {
    try {
      const { error } = await supabase.from('faqs').delete().eq('id', deleteDialog.id);

      if (error) throw error;
      showSnackbar('FAQ가 삭제되었습니다.', 'success');
      setDeleteDialog({ open: false, type: 'faq', id: '' });
      fetchData();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      showSnackbar('삭제에 실패했습니다.', 'error');
    }
  };

  const handleToggleFAQVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase
        .from('faqs')
        .update({ is_visible: !currentVisibility })
        .eq('id', id);

      if (error) throw error;
      showSnackbar('공개 상태가 변경되었습니다.', 'success');
      fetchData();
    } catch (error) {
      console.error('Error toggling visibility:', error);
      showSnackbar('상태 변경에 실패했습니다.', 'error');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
          >
            <Typography variant="h4" fontWeight="bold">
              고객지원 관리
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                if (tabValue === 0) {
                  setNoticeForm({
                    title: '',
                    content: '',
                    category: '공지',
                    is_important: false,
                    is_visible: true,
                  });
                  setNoticeDialog(true);
                } else {
                  setFaqForm({
                    category: '서비스신청',
                    question: '',
                    answer: '',
                    sort_order: 0,
                    is_visible: true,
                  });
                  setFaqDialog(true);
                }
              }}
            >
              {tabValue === 0 ? '공지사항 추가' : 'FAQ 추가'}
            </Button>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label={`공지사항 (${notices.length})`} />
              <Tab label={`자주 묻는 질문 (${faqs.length})`} />
            </Tabs>
          </Box>

          {/* 공지사항 탭 */}
          <TabPanel value={tabValue} index={0}>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>제목</TableCell>
                    <TableCell>카테고리</TableCell>
                    <TableCell align="center">중요</TableCell>
                    <TableCell align="center">공개</TableCell>
                    <TableCell>작성일</TableCell>
                    <TableCell align="center">관리</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {notices.map((notice) => (
                    <TableRow key={notice.id}>
                      <TableCell>{notice.title}</TableCell>
                      <TableCell>
                        <Chip label={notice.category} size="small" />
                      </TableCell>
                      <TableCell align="center">
                        {notice.is_important && <Chip label="중요" color="error" size="small" />}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleToggleNoticeVisibility(notice.id, notice.is_visible)}
                        >
                          {notice.is_visible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        {new Date(notice.created_at).toLocaleDateString('ko-KR')}
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditNotice(notice)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              setDeleteDialog({ open: true, type: 'notice', id: notice.id })
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* FAQ 탭 */}
          <TabPanel value={tabValue} index={1}>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>카테고리</TableCell>
                    <TableCell>질문</TableCell>
                    <TableCell>정렬순서</TableCell>
                    <TableCell align="center">공개</TableCell>
                    <TableCell align="center">관리</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {faqs.map((faq) => (
                    <TableRow key={faq.id}>
                      <TableCell>
                        <Chip label={faq.category} size="small" color="primary" />
                      </TableCell>
                      <TableCell>{faq.question}</TableCell>
                      <TableCell>{faq.sort_order}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleToggleFAQVisibility(faq.id, faq.is_visible)}
                        >
                          {faq.is_visible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditFAQ(faq)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteDialog({ open: true, type: 'faq', id: faq.id })}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </CardContent>
      </Card>

      {/* Notice Dialog */}
      <Dialog open={noticeDialog} onClose={() => setNoticeDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{noticeForm.id ? '공지사항 수정' : '공지사항 추가'}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="제목"
              fullWidth
              value={noticeForm.title}
              onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>카테고리</InputLabel>
              <Select
                value={noticeForm.category}
                label="카테고리"
                onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value })}
              >
                <MenuItem value="공지">공지</MenuItem>
                <MenuItem value="안내">안내</MenuItem>
                <MenuItem value="기능추가">기능추가</MenuItem>
                <MenuItem value="점검">점검</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="내용"
              fullWidth
              multiline
              rows={6}
              value={noticeForm.content}
              onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
            />
            <Stack direction="row" spacing={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={noticeForm.is_important}
                    onChange={(e) =>
                      setNoticeForm({ ...noticeForm, is_important: e.target.checked })
                    }
                  />
                }
                label="중요 공지사항"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={noticeForm.is_visible}
                    onChange={(e) => setNoticeForm({ ...noticeForm, is_visible: e.target.checked })}
                  />
                }
                label="공개"
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoticeDialog(false)}>취소</Button>
          <Button variant="contained" onClick={handleSaveNotice}>
            저장
          </Button>
        </DialogActions>
      </Dialog>

      {/* FAQ Dialog */}
      <Dialog open={faqDialog} onClose={() => setFaqDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{faqForm.id ? 'FAQ 수정' : 'FAQ 추가'}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>카테고리</InputLabel>
              <Select
                value={faqForm.category}
                label="카테고리"
                onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
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
              label="질문"
              fullWidth
              value={faqForm.question}
              onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
            />
            <TextField
              label="답변"
              fullWidth
              multiline
              rows={6}
              value={faqForm.answer}
              onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
            />
            <TextField
              label="정렬 순서"
              type="number"
              value={faqForm.sort_order}
              onChange={(e) => setFaqForm({ ...faqForm, sort_order: parseInt(e.target.value) })}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={faqForm.is_visible}
                  onChange={(e) => setFaqForm({ ...faqForm, is_visible: e.target.checked })}
                />
              }
              label="공개"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFaqDialog(false)}>취소</Button>
          <Button variant="contained" onClick={handleSaveFAQ}>
            저장
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, type: 'notice', id: '' })}
      >
        <DialogTitle>삭제 확인</DialogTitle>
        <DialogContent>
          <Typography>
            정말 이 {deleteDialog.type === 'notice' ? '공지사항을' : 'FAQ를'} 삭제하시겠습니까?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, type: 'notice', id: '' })}>
            취소
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={deleteDialog.type === 'notice' ? handleDeleteNotice : handleDeleteFAQ}
          >
            삭제
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
