"use client"

import { Grid } from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
import ProfileBanner from '@/app/components/apps/userprofile/profile/ProfileBanner';
import GalleryCard from '@/app/components/apps/userprofile/gallery/GalleryCard';
import { UserDataProvider } from '@/app/context/UserDataContext';


const Gallery = () => {
  return (
    (
      <UserDataProvider>
        <PageContainer title="Gallery" description="this is Gallery">
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
              <GalleryCard />
            </Grid>
          </Grid>
        </PageContainer>
      </UserDataProvider>
    )
  );
};

export default Gallery;
