'use client';

import * as React from 'react';
import PageContainer from '@/app/components/container/PageContainer';
import { Grid, Tabs, Tab, Box, CardContent, Divider } from '@mui/material';
import { IconUserCircle, IconTruck, IconFileInvoice } from '@tabler/icons-react';
import BlankCard from '@/app/components/shared/BlankCard';
import ProfileInfoTab from './ProfileInfoTab';
import ShippingInfoTab from './ShippingInfoTab';
import TaxInvoiceTab from './TaxInvoiceTab';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const ProfilePage = () => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <PageContainer title="프로필 설정" description="사용자 프로필 설정">
      <Grid container spacing={3}>
        <Grid size={12}>
          <BlankCard>
            <Box sx={{ maxWidth: { xs: 320, sm: 480 } }}>
              <Tabs
                value={value}
                onChange={handleChange}
                scrollButtons="auto"
                aria-label="profile tabs"
              >
                <Tab
                  iconPosition="start"
                  icon={<IconUserCircle size="22" />}
                  label="기본 프로필"
                  {...a11yProps(0)}
                />
                <Tab
                  iconPosition="start"
                  icon={<IconTruck size="22" />}
                  label="배송 정보"
                  {...a11yProps(1)}
                />
                <Tab
                  iconPosition="start"
                  icon={<IconFileInvoice size="22" />}
                  label="세금계산서 자료"
                  {...a11yProps(2)}
                />
              </Tabs>
            </Box>
            <Divider />
            <CardContent>
              <TabPanel value={value} index={0}>
                <ProfileInfoTab />
              </TabPanel>
              <TabPanel value={value} index={1}>
                <ShippingInfoTab />
              </TabPanel>
              <TabPanel value={value} index={2}>
                <TaxInvoiceTab />
              </TabPanel>
            </CardContent>
          </BlankCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default ProfilePage;
