import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface CartOptions {
  isCustomOrder: boolean;
  customOrderType: string;
  memo: string;
}

interface AddToCartDialogProps {
  open: boolean;
  onClose: () => void;
  cartOptions: CartOptions;
  onCartOptionsChange: (options: CartOptions) => void;
  onConfirm: () => void;
  loading?: boolean;
}

export default function AddToCartDialog({
  open,
  onClose,
  cartOptions,
  onCartOptionsChange,
  onConfirm,
  loading = false
}: AddToCartDialogProps) {
  
  const handleChange = (field: keyof CartOptions, value: any) => {
    onCartOptionsChange({
      ...cartOptions,
      [field]: value
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">장바구니 추가 옵션</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>주문 유형</InputLabel>
            <Select
              value={cartOptions.isCustomOrder ? 'custom' : 'normal'}
              onChange={(e) => {
                const isCustom = e.target.value === 'custom';
                handleChange('isCustomOrder', isCustom);
                if (!isCustom) {
                  handleChange('customOrderType', '');
                }
              }}
              label="주문 유형"
            >
              <MenuItem value="normal">일반 주문</MenuItem>
              <MenuItem value="custom">맞춤 제작</MenuItem>
            </Select>
          </FormControl>

          {cartOptions.isCustomOrder && (
            <FormControl fullWidth>
              <InputLabel>맞춤 제작 유형</InputLabel>
              <Select
                value={cartOptions.customOrderType}
                onChange={(e) => handleChange('customOrderType', e.target.value)}
                label="맞춤 제작 유형"
              >
                <MenuItem value="logo">로고 인쇄</MenuItem>
                <MenuItem value="color">색상 변경</MenuItem>
                <MenuItem value="size">사이즈 변경</MenuItem>
                <MenuItem value="material">재질 변경</MenuItem>
                <MenuItem value="other">기타</MenuItem>
              </Select>
            </FormControl>
          )}

          <TextField
            label="메모 (선택사항)"
            multiline
            rows={3}
            value={cartOptions.memo}
            onChange={(e) => handleChange('memo', e.target.value)}
            placeholder="판매자에게 전달할 메시지를 입력하세요"
            fullWidth
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          취소
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained" 
          disabled={loading || (cartOptions.isCustomOrder && !cartOptions.customOrderType)}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? '추가 중...' : '장바구니에 추가'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}