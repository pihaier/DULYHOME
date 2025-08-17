'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Checkbox,
  TextField,
  Stack,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import PageContainer from '@/app/components/container/PageContainer';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/context/GlobalContext';
import ConstructionIcon from '@mui/icons-material/Construction';

interface CartItem {
  id: string;
  offer_id: string;
  sku_id: string;
  product_name: string;
  product_image: string;
  product_url: string;
  selected_attributes: any;
  min_order_quantity: number;
  china_price: number;
  quantity: number;
  exchange_rate: number;
  package_width: number;
  package_length: number;
  package_height: number;
  package_weight: number;
  china_shipping_fee: number;
  china_shipping_fee_krw: number;
  exw_total: number;
  commission: number;
  commission_vat: number;
  first_payment: number;
  memo: string;
  requirements: any;
  is_sample_needed: boolean;
  is_logo_needed: boolean;
  is_custom_packaging: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [editQuantity, setEditQuantity] = useState(1);
  const [editMemo, setEditMemo] = useState('');
  const { user } = useUser();
  const supabase = createClient();

  // 장바구니 데이터 가져오기
  const fetchCartItems = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        console.log('No user session');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('cart_items_1688')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching cart items:', error);
      } else {
        setCartItems(data || []);
      }
    } catch (error) {
      console.error('Failed to fetch cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  // 아이템 삭제
  const handleDelete = async (itemId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase.from('cart_items_1688').delete().eq('id', itemId);

      if (error) {
        throw error;
      }

      await fetchCartItems();
      alert('삭제되었습니다.');
    } catch (error) {
      console.error('Failed to delete item:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  // 수량 수정
  const handleEdit = (item: CartItem) => {
    setEditingItem(item);
    setEditQuantity(item.quantity);
    setEditMemo(item.memo || '');
    setEditDialog(true);
  };

  // 수정 저장
  const handleSaveEdit = async () => {
    if (!editingItem) return;

    try {
      // 최소 주문 수량 체크
      if (editQuantity < editingItem.min_order_quantity) {
        alert(`최소 주문 수량은 ${editingItem.min_order_quantity}개 입니다.`);
        return;
      }

      // 1차 비용 재계산
      const chinaPriceKRW = Math.floor(editingItem.china_price * editingItem.exchange_rate);
      const totalChinaPrice = chinaPriceKRW * editQuantity;
      const exwTotal = totalChinaPrice + editingItem.china_shipping_fee_krw;
      const commission = Math.floor(exwTotal * 0.05); // 5% 수수료
      const commissionVAT = Math.floor(commission * 0.1);
      const firstPayment = exwTotal + commission + commissionVAT;

      const { error } = await supabase
        .from('cart_items_1688')
        .update({
          quantity: editQuantity,
          memo: editMemo,
          is_sample_needed: editingItem.is_sample_needed,
          is_logo_needed: editingItem.is_logo_needed,
          is_custom_packaging: editingItem.is_custom_packaging,
          exw_total: exwTotal,
          commission: commission,
          commission_vat: commissionVAT,
          first_payment: firstPayment,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingItem.id);

      if (error) {
        throw error;
      }

      await fetchCartItems();
      setEditDialog(false);
      alert('수정되었습니다.');
    } catch (error) {
      console.error('Failed to update item:', error);
      alert('수정에 실패했습니다.');
    }
  };

  // 선택 항목 관리
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedItems(cartItems.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  // 총 금액 계산
  const calculateTotal = () => {
    const selectedCartItems = cartItems.filter((item) => selectedItems.includes(item.id));
    return selectedCartItems.reduce((sum, item) => sum + (item.first_payment || 0), 0);
  };

  if (loading) {
    return (
      <PageContainer title="장바구니" description="1688 상품 장바구니">
        <Container maxWidth="lg">
          <Box sx={{ py: 4 }}>
            <Typography>로딩 중...</Typography>
          </Box>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="장바구니" description="1688 상품 장바구니">
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>
            <ShoppingCartIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
            1688 장바구니
          </Typography>

          {/* 준비중 알림 */}
          <Alert severity="warning" icon={<ConstructionIcon />} sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              1688 서비스 준비중
            </Typography>
            <Typography variant="body2">
              현재 1688.com API 연동 및 주문 시스템 준비 중입니다. 빠른 시일 내에 정식 서비스를
              제공할 예정입니다.
            </Typography>
          </Alert>

          {cartItems.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                장바구니가 비어있습니다.
              </Typography>
              <Button variant="contained" sx={{ mt: 2 }} href="/1688">
                상품 둘러보기
              </Button>
            </Paper>
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedItems.length === cartItems.length}
                          onChange={handleSelectAll}
                        />
                      </TableCell>
                      <TableCell>상품정보</TableCell>
                      <TableCell align="center">옵션/메모/요청사항</TableCell>
                      <TableCell align="center">중국단가</TableCell>
                      <TableCell align="center">수량</TableCell>
                      <TableCell align="center">포장정보</TableCell>
                      <TableCell align="center">중국배송비</TableCell>
                      <TableCell align="right">1차 결제비용</TableCell>
                      <TableCell align="center">작업</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cartItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleSelectItem(item.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={2}>
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              style={{ width: 80, height: 80, objectFit: 'cover' }}
                            />
                            <Box>
                              <Typography variant="subtitle2">{item.product_name}</Typography>
                              <Button
                                size="small"
                                startIcon={<OpenInNewIcon />}
                                onClick={() => window.open(item.product_url, '_blank')}
                              >
                                1688에서 보기
                              </Button>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell align="center">
                          <Box>
                            {item.selected_attributes &&
                              Object.entries(item.selected_attributes).map(([key, value]) => (
                                <Chip
                                  key={key}
                                  label={`${key}: ${value}`}
                                  size="small"
                                  sx={{ m: 0.5 }}
                                />
                              ))}
                            {/* 메모 표시 */}
                            {item.memo && (
                              <Typography
                                variant="caption"
                                display="block"
                                sx={{ mt: 1, fontStyle: 'italic' }}
                              >
                                메모: {item.memo}
                              </Typography>
                            )}
                            {/* 추가 요청사항 표시 */}
                            <Stack
                              direction="row"
                              spacing={0.5}
                              sx={{ mt: 1 }}
                              justifyContent="center"
                            >
                              {item.is_sample_needed && (
                                <Chip label="샘플" size="small" color="info" variant="outlined" />
                              )}
                              {item.is_logo_needed && (
                                <Chip
                                  label="로고"
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                />
                              )}
                              {item.is_custom_packaging && (
                                <Chip
                                  label="커스텀포장"
                                  size="small"
                                  color="warning"
                                  variant="outlined"
                                />
                              )}
                            </Stack>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          ¥{item.china_price}
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            ₩{Math.floor(item.china_price * item.exchange_rate).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {item.quantity}개
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            최소: {item.min_order_quantity}개
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="caption">
                            {item.package_width}×{item.package_length}×{item.package_height}cm
                            <br />
                            {item.package_weight}kg
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          ¥{item.china_shipping_fee}
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            ₩{item.china_shipping_fee_krw?.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="subtitle2" color="primary">
                            ₩{item.first_payment?.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1}>
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(item)}
                              color="primary"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(item.id)}
                              color="error"
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

              {/* 합계 및 주문 버튼 */}
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 8 }}>
                      <Alert severity="info">
                        선택한 {selectedItems.length}개 상품의 1차 결제 비용입니다. 2차 결제
                        비용(운송비, 관세 등)은 별도로 계산됩니다.
                      </Alert>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" gutterBottom>
                          선택 상품 1차 결제 총액
                        </Typography>
                        <Typography variant="h4" color="primary" gutterBottom>
                          ₩{calculateTotal().toLocaleString()}
                        </Typography>
                        <Button
                          variant="contained"
                          size="large"
                          fullWidth
                          startIcon={<LocalShippingIcon />}
                          disabled={selectedItems.length === 0}
                        >
                          선택 상품 주문하기
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </>
          )}

          {/* 수정 다이얼로그 */}
          <Dialog open={editDialog} onClose={() => setEditDialog(false)}>
            <DialogTitle>수량 및 메모 수정</DialogTitle>
            <DialogContent>
              <Box sx={{ pt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  수량 (최소: {editingItem?.min_order_quantity}개)
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                  <IconButton
                    onClick={() =>
                      setEditQuantity(
                        Math.max(editingItem?.min_order_quantity || 1, editQuantity - 1)
                      )
                    }
                  >
                    <RemoveIcon />
                  </IconButton>
                  <TextField
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(Number(e.target.value))}
                    type="number"
                    size="small"
                    sx={{ width: 100 }}
                    inputProps={{ min: editingItem?.min_order_quantity || 1 }}
                  />
                  <IconButton onClick={() => setEditQuantity(editQuantity + 1)}>
                    <AddIcon />
                  </IconButton>
                </Stack>

                <Typography variant="subtitle2" gutterBottom>
                  메모
                </Typography>
                <TextField
                  value={editMemo}
                  onChange={(e) => setEditMemo(e.target.value)}
                  multiline
                  rows={3}
                  fullWidth
                  placeholder="특별 요청사항을 입력하세요"
                />

                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                  추가 요청사항
                </Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={editingItem?.is_sample_needed || false}
                        onChange={(e) =>
                          setEditingItem((prev) =>
                            prev ? { ...prev, is_sample_needed: e.target.checked } : null
                          )
                        }
                      />
                    }
                    label="샘플 필요"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={editingItem?.is_logo_needed || false}
                        onChange={(e) =>
                          setEditingItem((prev) =>
                            prev ? { ...prev, is_logo_needed: e.target.checked } : null
                          )
                        }
                      />
                    }
                    label="로고 삽입 필요"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={editingItem?.is_custom_packaging || false}
                        onChange={(e) =>
                          setEditingItem((prev) =>
                            prev ? { ...prev, is_custom_packaging: e.target.checked } : null
                          )
                        }
                      />
                    }
                    label="커스텀 포장 필요"
                  />
                </FormGroup>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditDialog(false)}>취소</Button>
              <Button onClick={handleSaveEdit} variant="contained">
                저장
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Container>
    </PageContainer>
  );
}
