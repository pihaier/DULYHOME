import React from 'react';
import { Box, Container } from '@mui/material';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: 4,
      }}
    >
      <Container maxWidth="md">{children}</Container>
    </Box>
  );
}
