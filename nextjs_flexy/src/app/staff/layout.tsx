'use client';

import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Avatar,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Support as SupportIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/lib/context/GlobalContext';
import { createClient } from '@/lib/supabase/client';

const drawerWidth = 280;

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, userProfile } = useUser();
  const supabase = createClient();
  
  // 중국 직원인지 확인
  const isChineseStaff = userProfile?.role === 'chinese_staff';

  const menuItems = [
    {
      title: isChineseStaff ? '仪表板' : '대시보드',
      titleCn: '仪表板',
      titleKo: '대시보드',
      icon: <DashboardIcon />,
      path: '/staff',
    },
    {
      title: isChineseStaff ? '聊天管理' : '채팅 관리',
      titleCn: '聊天管理',
      titleKo: '채팅 관리',
      icon: <ChatIcon />,
      path: '/staff/chat-management',
    },
    {
      title: isChineseStaff ? '客户支持' : '고객지원 관리',
      titleCn: '客户支持',
      titleKo: '고객지원 관리',
      icon: <SupportIcon />,
      path: '/staff/customer-support',
    },
    {
      title: isChineseStaff ? '用户管理' : '사용자 관리',
      titleCn: '用户管理',
      titleKo: '사용자 관리',
      icon: <PeopleIcon />,
      path: '/staff/users',
    },
    {
      title: isChineseStaff ? '系统设置' : '시스템 설정',
      titleCn: '系统设置',
      titleKo: '시스템 설정',
      icon: <SettingsIcon />,
      path: '/staff/settings',
    },
  ];

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/staff/login');
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: 2, py: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            {userProfile?.contact_person?.[0] || 'S'}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" noWrap>
              {isChineseStaff ? '员工管理' : '직원 관리'}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {userProfile?.company_name || userProfile?.contact_person}
            </Typography>
          </Box>
          {isMobile && (
            <IconButton onClick={handleDrawerToggle} sx={{ ml: 1 }}>
              <ChevronLeftIcon />
            </IconButton>
          )}
        </Box>
      </Toolbar>

      <Divider />

      <List sx={{ flexGrow: 1, px: 2, py: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={pathname === item.path}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: pathname === item.path ? 'white' : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.title} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
        >
          {isChineseStaff ? '退出' : '로그아웃'}
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* App Bar for Mobile */}
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{
            width: '100%',
            bgcolor: 'background.paper',
            color: 'text.primary',
            boxShadow: 1,
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              {isChineseStaff ? '员工管理系统' : '직원 관리 시스템'}
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar Drawer */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
              },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
                borderRight: '1px solid',
                borderColor: 'divider',
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          pt: { xs: 8, md: 0 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
