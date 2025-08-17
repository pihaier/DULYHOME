'use client';
import React from 'react';
import Button from '@mui/material/Button';

import { styled } from '@mui/material/styles';
import { Chip } from '@mui/material';
import NextLink from 'next/link';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export const NavLinks = [
  {
    title: '회사소개',
    href: '/frontend-pages/about',
  },
  {
    title: '1688 상품',
    href: '/1688',
    badge: '준비중',
  },
  {
    title: '서비스',
    href: '/frontend-pages/services',
  },
  {
    title: '고객지원',
    href: '/frontend-pages/blog',
  },
  {
    title: '계산기',
    href: '/frontend-pages/calculators',
  },
  {
    title: '문의하기',
    href: '/frontend-pages/contact',
  },
];

const Navigations = () => {
  const router = usePathname();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const StyledButton = styled(Button)(({ theme }) => ({
    a: {
      color: theme.palette.text.secondary,
      fontWeight: 500,
      fontSize: '15px',
    },

    '&.active': {
      backgroundColor: 'rgba(93, 135, 255, 0.15)',
      a: {
        color: theme.palette.primary.main,
      },
    },
  }));

  return (
    <>
      {NavLinks.map((navlink, i) => (
        <StyledButton
          color="inherit"
          className={router === navlink.href ? 'active' : 'not-active'}
          variant="text"
          key={i}
        >
          <NextLink href={navlink.href}>
            {navlink.title}
            {navlink.badge && (
              <Chip 
                label={navlink.badge} 
                size="small" 
                color={navlink.badge === '준비중' ? 'warning' : 'error'}
                sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
              />
            )}
          </NextLink>
        </StyledButton>
      ))}
    </>
  );
};

export default Navigations;
