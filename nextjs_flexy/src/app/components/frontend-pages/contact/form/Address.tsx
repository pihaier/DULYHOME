'use client';
import React from 'react';
import { Box, Typography, Container, Grid, MenuItem, Button, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import Image from 'next/image';

const ShapeBg = styled(Box)(() => ({
  position: 'absolute',
  right: 0,
  top: 0,
}));

const Address = () => {
  return (
    <Box bgcolor="primary.main" borderRadius="12px" position="relative">
      <ShapeBg>
        <Image src="/images/frontend-pages/contact/shape1.png" alt="img" width={200} height={250} />
      </ShapeBg>
      <Box p="30px" zIndex={1}>
        <Typography fontSize="20px" fontWeight={700} color="white" mb={2}>
          두리무역
        </Typography>
        <Typography variant="body1" color="white" lineHeight={1.8}>
          대표자: 김두호
          <br />
          사업자등록번호: 605-29-80697
        </Typography>

        <Divider sx={{ opacity: 0.3, my: '30px' }} />

        <Typography fontSize="20px" fontWeight={700} color="white" mb={2}>
          연락처
        </Typography>
        <Typography variant="body1" color="white" lineHeight={1.8}>
          📞 전화: 031-699-8781
          <br />
          📧 이메일: duly@duly.co.kr
          <br />⏰ 운영시간: 평일 09:00~18:00
        </Typography>

        <Divider sx={{ opacity: 0.3, my: '30px' }} />

        <Typography fontSize="20px" fontWeight={700} color="white" mb={2}>
          주소
        </Typography>
        <Typography variant="body1" color="white" lineHeight={1.8}>
          인천광역시 연수구 센트럴로 313 B2512
          <br />
          (송도동, 송도 센트로드)
        </Typography>

        <Divider sx={{ opacity: 0.3, my: '30px' }} />

        <Typography fontSize="18px" fontWeight={600} color="white" mb={2}>
          빠른 문의
        </Typography>
        <Typography variant="body1" color="white" lineHeight={1.8}>
          💬 카카오톡: @두리무역
          <br />
          📱 문자 문의: 031-699-8781
        </Typography>
      </Box>
    </Box>
  );
};

export default Address;
