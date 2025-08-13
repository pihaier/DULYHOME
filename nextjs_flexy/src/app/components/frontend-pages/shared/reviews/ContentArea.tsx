'use client';
import React from 'react';
import { Typography } from '@mui/material';
import Image from 'next/image';

const ContentArea = () => {
  return (
    <>
      <Typography
        variant="h4"
        lineHeight={1.4}
        mb={3}
        fontWeight={700}
        sx={{
          fontSize: {
            lg: '40px',
            xs: '35px',
          },
          mr: {
            xs: 0,
            lg: 4,
          },
        }}
      >
        고객님들이 말하는{' '}
        <Image
          src="/images/logos/logoIcon.svg"
          alt="logo"
          width={40}
          height={40}
          style={{ margin: '0 8px', verticalAlign: 'middle' }}
        />
        두리무역
      </Typography>
      <Typography variant="body1" lineHeight={1.8}>
        7년간 함께해온 고객님들의 진솔한 후기를 통해 두리무역의 전문성과 신뢰성을 확인해보세요.
      </Typography>
    </>
  );
};

export default ContentArea;
