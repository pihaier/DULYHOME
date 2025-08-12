'use client'
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import { Grid } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { useContext, useEffect } from 'react';
import BlankCard from '../../../../components/shared/BlankCard';
import { UserDataContext } from "@/app/context/UserDataContext/index";

import {
  IconBrandFacebook,
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandTwitter,
  IconSearch,
} from '@tabler/icons-react';
import { userType } from '../../../../dashboard/types/apps/users';

const SocialIcons = [
  {
    name: 'Facebook',
    icon: <IconBrandFacebook size="18" color="#1877F2" />,
  },
  {
    name: 'Instagram',
    icon: <IconBrandInstagram size="18" color="#D7336D" />,
  },
  {
    name: 'Github',
    icon: <IconBrandGithub size="18" color="#006097" />,
  },
  {
    name: 'Twitter',
    icon: <IconBrandTwitter size="18" color="#1C9CEA" />,
  },
];

const FriendsCard = () => {
  const { followers, setSearch } = useContext(UserDataContext);

  return (
    <>
      <Grid container spacing={3}>
        <Grid
          size={{
            sm: 12,
            lg: 12
          }}>
          <Stack direction="row" alignItems={'center'} mt={2}>
            <Box>
              <Typography variant="h3">
                Friends &nbsp;
                <Chip label={followers.length} color="secondary" size="small" />
              </Typography>
            </Box>
            <Box ml="auto">
              <TextField
                id="outlined-search"
                placeholder="Search Friends"
                size="small"
                type="search"
                variant="outlined"
                fullWidth
                onChange={(e) => setSearch(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconSearch size="14" />
                      </InputAdornment>
                    ),
                  },

                  htmlInput: { 'aria-label': 'Search Followers' }
                }} />
            </Box>
          </Stack>
        </Grid>
        {followers.map((profile) => {
          return (
            (<Grid
              key={profile.id}
              size={{
                xs: 12,
                lg: 4
              }}>
              <BlankCard className="hoverCard">
                <CardContent>
                  <Stack direction={'column'} gap={2} alignItems="center">
                    <Avatar
                      alt="Remy Sharp"
                      src={profile.avatar}
                      sx={{ width: '80px', height: '80px' }}
                    />
                    <Box textAlign={'center'}>
                      <Typography variant="h4">{profile.name}</Typography>
                      <Typography variant="subtitle1" color='textSecondary'>{profile.role}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
                <Divider />
                <Box p={2} py={1} textAlign={'center'} sx={{ backgroundColor: 'grey.100' }}>
                  {SocialIcons.map((sicon) => {
                    return <IconButton key={sicon.name}>{sicon.icon}</IconButton>;
                  })}
                </Box>
              </BlankCard>
            </Grid>)
          );
        })}
      </Grid>
    </>
  );
};

export default FriendsCard;
