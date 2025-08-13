'use client';
import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Logo from '@/app/dashboard/layout/shared/logo/Logo';
import { NavLinks } from './Navigations';
import { Chip } from '@mui/material';

const MobileSidebar = () => {
  return (
    <>
      <Box px={3}>
        <Logo />
      </Box>
      <Box p={3}>
        <Stack direction="column" spacing={2}>
          {NavLinks.map((navlink, i) => (
            <Button
              color="inherit"
              href={navlink.href}
              key={i}
              sx={{
                justifyContent: 'start',
              }}
            >
              {navlink.title}
            </Button>
          ))}

          <Button
            color="inherit"
            href="/dashboard"
            sx={{
              justifyContent: 'start',
            }}
          >
            대시보드
          </Button>
          <Button color="primary" variant="contained" href="/auth/customer/login">
            로그인
          </Button>
        </Stack>
      </Box>
    </>
  );
};

export default MobileSidebar;
