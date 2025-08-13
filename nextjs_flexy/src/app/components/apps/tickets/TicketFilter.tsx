'use client';
import Box from '@mui/material/Box';
import { Grid } from '@mui/material';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useContext, useEffect } from 'react';

import { TicketContext } from '@/app/context/TicketContext';
import { mutate } from 'swr';
import { usePathname } from 'next/navigation';

const BoxStyled = styled(Box)(() => ({
  padding: '30px',
  transition: '0.1s ease-in',
  cursor: 'pointer',
  color: 'inherit',
  '&:hover': {
    transform: 'scale(1.03)',
  },
}));

const TicketFilter = () => {
  const { tickets, setFilter } = useContext(TicketContext);

  const pendingC = tickets.filter((t: { Status: string }) => t.Status === 'Pending').length;
  const openC = tickets.filter((t: { Status: string }) => t.Status === 'Open').length;
  const closeC = tickets.filter((t: { Status: string }) => t.Status === 'Closed').length;

  // Reset Tickets on browser refresh
  const location = usePathname();

  const handleResetTickets = async () => {
    const response = await fetch('/api/ticket', {
      method: 'GET',
      headers: {
        broserRefreshed: 'true',
      },
    });
    const result = await response.json();
    await mutate('/api/ticket');
  };

  useEffect(() => {
    const isPageRefreshed = sessionStorage.getItem('isPageRefreshed');
    if (isPageRefreshed === 'true') {
      sessionStorage.removeItem('isPageRefreshed');
      handleResetTickets();
    }
  }, [location]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem('isPageRefreshed', 'true');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <Grid container spacing={3} textAlign="center">
      <Grid
        size={{
          xs: 12,
          md: 6,
          lg: 3,
        }}
      >
        <BoxStyled
          onClick={() => setFilter('total_tickets')}
          sx={{ backgroundColor: 'primary.light', color: 'primary.main' }}
        >
          <Typography variant="h2">{tickets.length}</Typography>
          <Typography variant="h5" fontWeight={500}>
            Total Tickets
          </Typography>
        </BoxStyled>
      </Grid>
      <Grid
        size={{
          xs: 12,
          md: 6,
          lg: 3,
        }}
      >
        <BoxStyled
          onClick={() => setFilter('Pending')}
          sx={{ backgroundColor: 'warning.light', color: 'warning.main' }}
        >
          <Typography variant="h2">{pendingC}</Typography>
          <Typography variant="h5" fontWeight={500}>
            Pending Tickets
          </Typography>
        </BoxStyled>
      </Grid>
      <Grid
        size={{
          xs: 12,
          md: 6,
          lg: 3,
        }}
      >
        <BoxStyled
          onClick={() => setFilter('Open')}
          sx={{ backgroundColor: 'success.light', color: 'success.main' }}
        >
          <Typography variant="h2">{openC}</Typography>
          <Typography variant="h5" fontWeight={500}>
            Open Tickets
          </Typography>
        </BoxStyled>
      </Grid>
      <Grid
        size={{
          xs: 12,
          md: 6,
          lg: 3,
        }}
      >
        <BoxStyled
          onClick={() => setFilter('Closed')}
          sx={{ backgroundColor: 'error.light', color: 'error.main' }}
        >
          <Typography variant="h2">{closeC}</Typography>
          <Typography variant="h5" fontWeight={500}>
            Closed Tickets
          </Typography>
        </BoxStyled>
      </Grid>
    </Grid>
  );
};

export default TicketFilter;
