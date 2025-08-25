'use client';
'use client';
import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Logo from '@/app/dashboard/layout/shared/logo/Logo';
import { NavLinks } from './Navigations';
import { Chip } from '@mui/material';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const MobileSidebar = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
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
          <Button 
            component={Link}
            color="primary" 
            variant="contained" 
            href={`/auth/customer/login?redirect=${encodeURIComponent(pathname + (searchParams.toString() ? '?' + searchParams.toString() : ''))}`}
          >
            로그인
          </Button>
        </Stack>
      </Box>
    </>
  );
};

export default MobileSidebar;
