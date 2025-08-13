import { useState } from 'react';
import { Box, Menu, Typography, Button, Divider, Grid, styled } from '@mui/material';
import Link from 'next/link';
import { IconChevronDown, IconHelp } from '@tabler/icons-react';
import AppLinks from './AppLinks';
import QuickLinks from './QuickLinks';
import React from 'react';

const AppDD = () => {
  const [anchorEl2, setAnchorEl2] = useState<HTMLElement | null>(null);

  const handleClick2 = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl2(event.currentTarget);
  };

  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  return (
    <>
      <Box>
        <Button
          aria-label="show 11 new notifications"
          color="inherit"
          variant="text"
          aria-controls="msgs-menu"
          aria-haspopup="true"
          sx={{
            bgcolor: anchorEl2 ? 'primary.light' : '',
            color: anchorEl2 ? 'primary.main' : (theme) => theme.palette.text.primary,
          }}
          onClick={handleClick2}
          endIcon={<IconChevronDown size="15" />}
        >
          Apps
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
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          transformOrigin={{ horizontal: 'left', vertical: 'top' }}
          sx={{
            '& .MuiMenu-paper': {
              width: '850px',
            },
            '& .MuiMenu-paper ul': {
              p: 0,
            },
          }}
        >
          <Grid container>
            <Grid
              display="flex"
              size={{
                sm: 8,
              }}
            >
              <Box p={4} pb={3} pr={0}>
                <AppLinks />
                <Divider />
                <Box
                  sx={{
                    display: {
                      xs: 'none',
                      sm: 'flex',
                    },
                  }}
                  alignItems="center"
                  justifyContent="space-between"
                  pt={3}
                  pr={3}
                >
                  <Link href="/">
                    <Typography
                      variant="subtitle2"
                      fontWeight="500"
                      color="textPrimary"
                      display="flex"
                      alignItems="center"
                      gap={1}
                    >
                      <IconHelp width={21} />
                      Frequently Asked Questions
                    </Typography>
                  </Link>
                  <Button variant="contained" color="primary">
                    Check
                  </Button>
                </Box>
              </Box>
              <Divider orientation="vertical" />
            </Grid>
            <Grid
              size={{
                sm: 4,
              }}
            >
              <Box p={4}>
                <QuickLinks />
              </Box>
            </Grid>
          </Grid>
        </Menu>
      </Box>
      <Button
        color="inherit"
        sx={{ color: (theme) => theme.palette.text.primary }}
        variant="text"
        href="/apps/chats"
        component={Link}
      >
        Chat
      </Button>
      <Button
        color="inherit"
        sx={{ color: (theme) => theme.palette.text.primary }}
        variant="text"
        href="/apps/calendar"
        component={Link}
      >
        Calendar
      </Button>
      <Button
        color="inherit"
        sx={{ color: (theme) => theme.palette.text.primary }}
        variant="text"
        href="/apps/email"
        component={Link}
      >
        Email
      </Button>
    </>
  );
};

export default AppDD;
