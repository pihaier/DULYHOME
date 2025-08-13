import React, { useContext, useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { ChatContext } from '@/app/context/ChatContext/index';

import Scrollbar from '../../custom-scroll/Scrollbar';

import { ChatsType } from '../../../dashboard/types/apps/chat';
import { last } from 'lodash';
import { formatDistanceToNowStrict } from 'date-fns';
import { IconChevronDown, IconSearch } from '@tabler/icons-react';

const ChatListing = () => {
  const { chatData, chatSearch, setChatSearch, setSelectedChat, setActiveChatId, activeChatId } =
    useContext(ChatContext);

  const filteredChats = chatData.filter((chat) =>
    chat.name.toLowerCase().includes(chatSearch.toLowerCase())
  );

  const getDetails = (conversation: ChatsType) => {
    let displayText = '';

    const lastMessage = conversation.messages[conversation.messages.length - 1];
    if (lastMessage) {
      const sender = lastMessage.senderId === conversation.id ? 'You: ' : '';
      const message = lastMessage.type === 'image' ? 'Sent a photo' : lastMessage.msg;
      displayText = `${sender}${message}`;
    }

    return displayText;
  };

  const lastActivity = (chat: ChatsType) => last(chat.messages)?.createdAt;

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChatSelect = (chat: ChatsType) => {
    const chatId = typeof chat.id === 'string' ? parseInt(chat.id, 10) : chat.id;
    setSelectedChat(chat);
    setActiveChatId(chatId);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChatSearch(event.target.value);
  };

  return (
    <div>
      {/* ------------------------------------------- */}
      {/* Profile */}
      {/* ------------------------------------------- */}
      <Box display={'flex'} alignItems="center" gap="10px" p={3}>
        <Badge
          variant="dot"
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          overlap="circular"
          color="success"
        >
          <Avatar alt="Remy Sharp" src="/images/users/1.jpg" sx={{ width: 54, height: 54 }} />
        </Badge>
        <Box>
          <Typography variant="h5">Johnathan Doe</Typography>
          <Typography variant="body2">Administrator</Typography>
        </Box>
      </Box>
      {/* ------------------------------------------- */}
      {/* Search */}
      {/* ------------------------------------------- */}
      <Box px={3} py={1}>
        <TextField
          id="outlined-search"
          placeholder="Search contacts"
          size="small"
          type="search"
          variant="outlined"
          fullWidth
          onChange={handleSearchChange}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconSearch size={'16'} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>
      {/* ------------------------------------------- */}
      {/* Contact List */}
      {/* ------------------------------------------- */}
      <List sx={{ px: 0 }}>
        <Box px={2.5} pb={1}>
          <Button
            id="basic-button"
            aria-controls={open ? 'basic-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
            color="inherit"
          >
            Recent Chats <IconChevronDown size="16" />
          </Button>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            slotProps={{
              list: {
                'aria-labelledby': 'basic-button',
              },
            }}
          >
            <MenuItem onClick={handleClose}>Sort By Time</MenuItem>
            <MenuItem onClick={handleClose}>Sort By Unread</MenuItem>
            <MenuItem onClick={handleClose}>Mark as all Read</MenuItem>
          </Menu>
        </Box>
        <Scrollbar
          sx={{
            height: { lg: 'calc(100vh - 100px)', md: '100vh' },
            maxHeight: '600px',
          }}
        >
          {filteredChats && filteredChats.length ? (
            filteredChats.map((chat) => (
              <ListItemButton
                key={chat.id}
                onClick={() => handleChatSelect(chat)}
                sx={{
                  mb: 0.5,
                  py: 2,
                  px: 3,
                  alignItems: 'start',
                }}
                selected={activeChatId === chat.id}
              >
                <ListItemAvatar>
                  <Badge
                    color={
                      chat.status === 'online'
                        ? 'success'
                        : chat.status === 'busy'
                          ? 'error'
                          : chat.status === 'away'
                            ? 'warning'
                            : 'secondary'
                    }
                    variant="dot"
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    overlap="circular"
                  >
                    <Avatar alt="Remy Sharp" src={chat.thumb} sx={{ width: 42, height: 42 }} />
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="h5" fontWeight={500} mb={0.5}>
                      {chat.name}
                    </Typography>
                  }
                  secondary={getDetails(chat)}
                  sx={{ my: 0 }}
                  slotProps={{
                    secondary: {
                      noWrap: true,
                    },
                  }}
                />
                <Box sx={{ flexShrink: '0' }} mt={0.5}>
                  <Typography variant="body2">
                    {formatDistanceToNowStrict(new Date(lastActivity(chat) ?? new Date()), {
                      addSuffix: false,
                    })}
                  </Typography>
                </Box>
              </ListItemButton>
            ))
          ) : (
            <Box m={2}>
              <Alert severity="error" variant="filled" sx={{ color: 'white' }}>
                No Contacts Found!
              </Alert>
            </Box>
          )}
        </Scrollbar>
      </List>
    </div>
  );
};

export default ChatListing;
