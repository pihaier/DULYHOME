import React, { useContext } from 'react';
import Image from 'next/image';
import { Card, CardContent, Button, Typography, Box, Stack } from '@mui/material';
import { CustomizerContext } from '@/app/context/customizerContext';
import { useUser } from '@/lib/context/GlobalContext';
import { useRouter } from 'next/navigation';
import { IconClipboardList, IconMessage, IconPlus } from '@tabler/icons-react';

const WelcomeCard = () => {
  const { activeDir } = useContext(CustomizerContext);
  const { user, userProfile } = useUser();
  const router = useRouter();

  const userName = userProfile?.contact_person || user?.user_metadata?.name || '사용자';

  return (
    <Card
      elevation={0}
      sx={{
        position: 'relative',
        backgroundColor: (theme) => theme.palette.primary.main,
        color: 'white',
        borderWidth: '0px',
      }}
    >
      <CardContent>
        <Typography
          sx={{
            marginTop: '8px',
            marginBottom: '0px',
            lineHeight: '35px',
            position: 'relative',
            zIndex: 9,
          }}
          variant="h3"
          fontSize="20px"
          gutterBottom
        >
          안녕하세요 {userName}님, <br /> 오늘도 좋은 하루 되세요!
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 2, position: 'relative', zIndex: 9 }}>
          <Button
            size="small"
            variant="contained"
            color="inherit"
            startIcon={<IconPlus size={16} />}
            onClick={() => router.push('/application/inspection/quality-inspection')}
            sx={{
              backgroundColor: 'white',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'grey.100',
              },
            }}
          >
            신규 신청
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<IconClipboardList size={16} />}
            onClick={() => router.push('/dashboard/orders')}
            sx={{
              borderColor: 'rgba(255,255,255,0.8)',
              color: 'white',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            주문 조회
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<IconMessage size={16} />}
            onClick={() => router.push('/dashboard/chat')}
            sx={{
              borderColor: 'rgba(255,255,255,0.8)',
              color: 'white',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            메시지
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default WelcomeCard;
