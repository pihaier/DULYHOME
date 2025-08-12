import React, { useContext } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Stack,
  Avatar,
} from "@mui/material";
import { IconCurrencyDollar } from "@tabler/icons-react";
import { CustomizerContext } from "@/app/context/customizerContext";

const EarningsShop = () => {
  const { activeDir } = useContext(CustomizerContext);

  return (
    <Card
      elevation={0}
      sx={{
        position: "relative",
        backgroundColor: (theme) => theme.palette.primary.light,
        "&:before": {
          content: `""`,
          position: "absolute",
          right: activeDir === "rtl" ? "unset" : "0",
          left: activeDir === "rtl" ? "0" : "unset",
          width: "100%",
          height: "100%",
          background: `url('/images/backgrounds/welcome-bg-2x-svg.svg') no-repeat center`,
          backgroundSize: "cover",
          transform: activeDir === "rtl" ? "scaleX(-1)" : "unset",
          backgroundPosition: activeDir === "rtl" ? 'right 85px center' : 'left 85px center',
        },
      }}
    >
      <CardContent>
        <Stack direction='row' justifyContent='space-between' mb={2}>
          <Box>
            <Typography variant="h5" fontSize='18px'>
              Earnings
            </Typography>
            <Typography variant="h2" mt={1} color='primary.main'>
              $63,438.78
            </Typography>
          </Box>
          <Avatar
            sx={{
              backgroundColor: 'primary.main',
              color: '#fff',
              width: '48px',
              height: '48px',
            }}
          >
            <IconCurrencyDollar width="24" height="24" />
          </Avatar>
        </Stack>
        <Button variant="contained" color="primary">
          Download
        </Button>
      </CardContent>
    </Card>
  );
};

export default EarningsShop;
