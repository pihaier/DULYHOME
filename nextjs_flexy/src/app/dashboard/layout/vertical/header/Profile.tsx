import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Box, Menu, Avatar, Typography, Divider, Button } from '@mui/material';
import Image from 'next/image';
import { Stack } from '@mui/system';
import {
  IconChevronDown,
  IconCreditCard,
  IconCurrencyDollar,
  IconMail,
  IconShield,
} from '@tabler/icons-react';
import { useUser } from '@/lib/context/GlobalContext';

const Profile = () => {
  const [anchorEl2, setAnchorEl2] = useState<HTMLElement | null>(null);
  const { user, userProfile, supabase } = useUser();
  const router = useRouter();

  const handleClick2 = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl2(event.currentTarget);
  };
  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
      } else {
        // 로그아웃 성공 시 메인 페이지로 이동
        router.push('/');
      }
    } catch (error) {}
  };

  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const primarylight = theme.palette.primary.light;
  const error = theme.palette.error.main;
  const errorlight = theme.palette.error.light;
  const success = theme.palette.success.main;
  const successlight = theme.palette.success.light;

  /*profile data*/
  const profiledata = [
    {
      href: '/dashboard/profile',
      title: '내 프로필',
      subtitle: '개인정보 및 계정 설정',
      icon: <IconCurrencyDollar width="20" height="20" />,
      color: primary,
      lightcolor: primarylight,
    },
    {
      href: '/dashboard/orders',
      title: '내 주문 내역',
      subtitle: '신청 현황 및 진행 상태',
      icon: <IconShield width="20" height="20" />,
      color: success,
      lightcolor: successlight,
    },
  ];

  return (
    <Box>
      <Button
        size="large"
        aria-label="menu"
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        sx={{
          ...(typeof anchorEl2 === 'object' && {
            borderRadius: '9px',
          }),
        }}
        onClick={handleClick2}
      >
        <Avatar
          src={'/images/users/1.jpg'}
          alt={'ProfileImg'}
          sx={{
            width: 30,
            height: 30,
          }}
        />
        <Box
          sx={{
            display: {
              xs: 'none',
              sm: 'flex',
            },
            alignItems: 'center',
          }}
        >
          <Typography color="textprimary" variant="h5" fontWeight="400" sx={{ ml: 1 }}>
            Hi,
          </Typography>
          <Typography
            variant="h5"
            fontWeight="700"
            sx={{
              ml: 1,
            }}
          >
            {(userProfile?.contact_person && userProfile.contact_person !== '미입력') 
              ? userProfile.contact_person 
              : user?.user_metadata?.name || '고객님'}
          </Typography>
          <IconChevronDown width="20" height="20" />
        </Box>
      </Button>
      {/* ------------------------------------------- */}
      {/* Message Dropdown */}
      {/* ------------------------------------------- */}
      <Menu
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        sx={{
          '& .MuiMenu-paper': {
            width: '360px',
            p: 4,
            pb: 2,
          },
        }}
      >
        <Typography variant="h4">User Profile</Typography>
        <Stack direction="row" py={3} spacing={2} alignItems="center">
          <Avatar src={'/images/users/1.jpg'} alt={'ProfileImg'} sx={{ width: 95, height: 95 }} />
          <Box>
            <Typography variant="h4" color="textPrimary">
              {(userProfile?.contact_person && userProfile.contact_person !== '미입력') 
                ? userProfile.contact_person 
                : user?.user_metadata?.name || '고객님'}
            </Typography>
            <Typography variant="h6" color="textSecondary">
              {(userProfile?.company_name && userProfile.company_name !== '미입력') 
                ? userProfile.company_name 
                : '회사명'}
            </Typography>
            <Typography
              variant="subtitle2"
              color="textSecondary"
              display="flex"
              alignItems="center"
              gap={1}
            >
              <IconMail width="18" height="18" />
              {user?.email || '이메일'}
            </Typography>
          </Box>
        </Stack>
        <Divider />

        {profiledata.map((prf) => (
          <Box key={prf.title}>
            <Box sx={{ py: 2, px: 0 }} className="hover-text-primary">
              <Link href={prf.href}>
                <Stack direction="row" spacing={2}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink="0"
                    sx={{
                      bgcolor: prf.lightcolor,
                      color: prf.color,
                      boxShadow: 'none',
                      minWidth: '50px',
                      width: '45px',
                      height: '40px',
                      borderRadius: '10px',
                    }}
                  >
                    {prf.icon}
                  </Box>
                  <Box>
                    <Typography
                      variant="h5"
                      className="text-hover"
                      color="textPrimary"
                      noWrap
                      sx={{
                        width: '240px',
                      }}
                    >
                      {prf.title}
                    </Typography>
                    <Typography
                      color="textSecondary"
                      variant="h6"
                      sx={{
                        width: '240px',
                      }}
                      noWrap
                    >
                      {prf.subtitle}
                    </Typography>
                  </Box>
                </Stack>
              </Link>
            </Box>
            <Divider
              style={{
                marginTop: 0,
                marginBottom: 0,
              }}
            />
          </Box>
        ))}

        <Box mt={2}>
          <Button variant="outlined" color="secondary" fullWidth onClick={handleLogout}>
            로그아웃
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Profile;
