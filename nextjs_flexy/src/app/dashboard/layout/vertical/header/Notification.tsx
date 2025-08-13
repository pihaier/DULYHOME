import React, { useState } from 'react';
import {
  IconButton,
  Box,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Button,
  Chip,
  Divider,
} from '@mui/material';
import * as dropdownData from './data';
import Scrollbar from '@/app/components/custom-scroll/Scrollbar';
import { Stack } from '@mui/system';
import Link from 'next/link';
import { IconBell } from '@tabler/icons-react';

const Notifications = () => {
  const [anchorEl2, setAnchorEl2] = useState<HTMLElement | null>(null);

  const handleClick2 = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl2(event.currentTarget);
  };

  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  return (
    <Box>
      <IconButton
        aria-label="show 11 new notifications"
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        sx={{
          color: anchorEl2 ? 'primary.main' : 'text.primary',
        }}
        onClick={handleClick2}
      >
        <Badge variant="dot" color="secondary">
          <IconBell size="21" />
        </Badge>
      </IconButton>
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
            width: '385px',
          },
          '& .MuiList-padding': {
            p: '30px',
          },
        }}
      >
        <Stack direction="row" pb={2} alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Notification</Typography>
          <Box ml={2}>
            <Chip
              size="small"
              label="5 new"
              color="primary"
              sx={{
                borderRadius: '6px',
                pl: '5px',
                pr: '5px',
              }}
            />
          </Box>
        </Stack>
        <Scrollbar sx={{ height: '385px' }}>
          {dropdownData.notifications.map((notification, index) => (
            <Box key={index}>
              <MenuItem sx={{ py: 2, px: 0 }}>
                <Stack direction="row" spacing={2}>
                  <Avatar
                    src={notification.avatar}
                    alt={notification.avatar}
                    sx={{
                      width: 45,
                      height: 45,
                    }}
                  />
                  <Box>
                    <Typography
                      variant="h5"
                      noWrap
                      sx={{
                        width: '240px',
                      }}
                    >
                      {notification.title}
                    </Typography>
                    <Typography
                      color="textSecondary"
                      variant="h6"
                      noWrap
                      fontWeight="400"
                      sx={{
                        width: '240px',
                      }}
                    >
                      {notification.subtitle}
                    </Typography>
                  </Box>
                </Stack>
              </MenuItem>
              <Divider
                style={{
                  marginTop: 0,
                  marginBottom: 0,
                }}
              />
            </Box>
          ))}
        </Scrollbar>
        <Box pt={2}>
          <Button
            href="/apps/email"
            variant="outlined"
            component={Link}
            color="secondary"
            fullWidth
          >
            See all Notifications
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Notifications;
