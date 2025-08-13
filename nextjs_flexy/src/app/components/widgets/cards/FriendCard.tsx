import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CardContent from '@mui/material/CardContent';
import { Grid } from '@mui/material';
import Typography from '@mui/material/Typography';
import { Stack } from '@mui/system';
import BlankCard from '../../shared/BlankCard';

const followerCard = [
  {
    title: 'Andrew Grant',
    location: 'El Salvador',
    avatar: '/images/users/1.jpg',
  },
  {
    title: 'Leo Pratt',
    location: 'Bulgaria',
    avatar: '/images/users/2.jpg',
  },
  {
    title: 'Charles Nunez',
    location: 'Nepal',
    avatar: '/images/users/3.jpg',
  },
  {
    title: 'Lora Powers',
    location: 'Nepal',
    avatar: '/images/users/4.jpg',
  },
];

const FriendCard = () => {
  return (
    <Grid container spacing={3}>
      {followerCard.map((card, index) => (
        <Grid
          key={index}
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <BlankCard>
            <CardContent>
              <Avatar src={card.avatar} sx={{ height: 80, width: 80 }}></Avatar>
              <Stack direction="row" spacing={2} mt={3}>
                <Box>
                  <Typography variant="h6" mb={1}>
                    {card.title}
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <AvatarGroup>
                      <Avatar
                        sx={{ height: 28, width: 28 }}
                        alt="Remy Sharp"
                        src={'/images/users/1.jpg'}
                      />
                      <Avatar
                        sx={{ height: 28, width: 28 }}
                        alt="Travis Howard"
                        src={'/images/users/2.jpg'}
                      />
                      <Avatar
                        sx={{ height: 28, width: 28 }}
                        alt="Cindy Baker"
                        src={'/images/users/3.jpg'}
                      />
                    </AvatarGroup>
                    <Typography variant="subtitle2" color="textSecondary">
                      3 mutual friends
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
              <Stack spacing={2} mt={3}>
                <Button size="large" variant="text" color="primary">
                  Add Friend
                </Button>
                <Button size="large" variant="text" color="secondary">
                  Remove
                </Button>
              </Stack>
            </CardContent>
          </BlankCard>
        </Grid>
      ))}
    </Grid>
  );
};

export default FriendCard;
