"use client"

import { Grid } from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
import ProfileBanner from '@/app/components/apps/userprofile/profile/ProfileBanner';
import FollowerCard from '@/app/components/apps/userprofile/followers/FollowerCard';
import { UserDataProvider } from '@/app/context/UserDataContext';


const Followers = () => {
  return (
    (
      <UserDataProvider>
        <PageContainer title="Followers" description="this is Followers">
          <Grid container spacing={3}>
            <Grid
              size={{
                sm: 12
              }}>
              <ProfileBanner />
            </Grid>
            <Grid
              size={{
                sm: 12
              }}>
              <FollowerCard />
            </Grid>
          </Grid>
        </PageContainer>
      </UserDataProvider>
    )
  );
};

export default Followers;
