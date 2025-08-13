'use client';

import { Grid } from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
import ProfileBanner from '@/app/components/apps/userprofile/profile/ProfileBanner';
import FriendsCard from '@/app/components/apps/userprofile/friends/FriendsCard';
import { UserDataProvider } from '@/app/context/UserDataContext';

const Friends = () => {
  return (
    <UserDataProvider>
      <PageContainer title="Friends" description="this is Friends">
        <Grid container spacing={3}>
          <Grid
            size={{
              sm: 12,
            }}
          >
            <ProfileBanner />
          </Grid>
          <Grid
            size={{
              sm: 12,
            }}
          >
            <FriendsCard />
          </Grid>
        </Grid>
      </PageContainer>
    </UserDataProvider>
  );
};

export default Friends;
