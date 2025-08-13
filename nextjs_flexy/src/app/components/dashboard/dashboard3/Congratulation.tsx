import React, { useContext } from 'react';
import { Card, CardContent, Typography, Box, Button, Stack, Avatar } from '@mui/material';
import BlankCard from '../../shared/BlankCard';
import { IconArrowUpLeft } from '@tabler/icons-react';
import { CustomizerContext } from '@/app/context/customizerContext';

const Congratulation = () => {
  const { activeDir } = useContext(CustomizerContext);

  return (
    <BlankCard>
      <Box>
        <Avatar
          src="/images/backgrounds/welcome-bg2-2x-svg.svg"
          sx={{
            borderRadius: 0,
            height: 178,
            width: 190,
            position: 'absolute',
            right: 0,
            top: '10px',
            transform: activeDir === 'rtl' ? 'scaleX(-1)' : 'unset',
          }}
        />
      </Box>
      <CardContent>
        <Stack spacing={1} useFlexGap flexWrap="wrap">
          <Typography variant="h4" mt={1} gutterBottom>
            Congratulation Johnathan
          </Typography>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="h2" fontWeight="600" mb={0} mt={1}>
              $39,358
            </Typography>
            <Stack direction="row" alignItems="center">
              <IconArrowUpLeft size="14" />
              <Typography variant="h6" fontWeight="700">
                +9%
              </Typography>
            </Stack>
          </Stack>
        </Stack>

        <Box
          mb={2}
          sx={{
            display: {
              sm: 'flex',
              xs: 'block',
            },
            alignItems: 'flex-end',
          }}
        ></Box>
        <Box mb={1}>
          <Button variant="contained" color="secondary">
            Download
          </Button>
        </Box>
      </CardContent>
    </BlankCard>
  );
};

export default Congratulation;
