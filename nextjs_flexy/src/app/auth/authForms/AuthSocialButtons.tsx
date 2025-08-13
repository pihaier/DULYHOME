import CustomSocialButton from '@/app/components/forms/theme-elements/CustomSocialButton';
import { Stack } from '@mui/system';
import { Avatar, Box } from '@mui/material';

interface AuthSocialButtonsProps {
  title: string;
  onGoogleClick?: () => void;
  onKakaoClick?: () => void;
  disabled?: boolean;
}

const AuthSocialButtons = ({
  title,
  onGoogleClick,
  onKakaoClick,
  disabled = false,
}: AuthSocialButtonsProps) => (
  <>
    <Stack direction="row" justifyContent="center" spacing={2} mt={3}>
      <CustomSocialButton onClick={onGoogleClick} disabled={disabled}>
        <Avatar
          src={'/images/svgs/google-icon.svg'}
          alt={'Google'}
          sx={{
            width: 16,
            height: 16,
            borderRadius: 0,
            mr: 1,
          }}
        />
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            whiteSpace: 'nowrap',
            mr: { sm: '3px' },
          }}
        >
          {title}{' '}
        </Box>{' '}
        Google
      </CustomSocialButton>
      <CustomSocialButton
        onClick={onKakaoClick}
        disabled={disabled}
        sx={{
          backgroundColor: '#FEE500',
          color: '#000000',
          '&:hover': {
            backgroundColor: '#FDD835',
          },
        }}
      >
        <Avatar
          src={'/images/svgs/kakao-icon.svg'}
          alt={'Kakao'}
          sx={{
            width: 20,
            height: 20,
            borderRadius: 0,
            mr: 1,
          }}
        />
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            whiteSpace: 'nowrap',
            mr: { sm: '3px' },
          }}
        >
          {title}{' '}
        </Box>{' '}
        카카오
      </CustomSocialButton>
    </Stack>
  </>
);

export default AuthSocialButtons;
