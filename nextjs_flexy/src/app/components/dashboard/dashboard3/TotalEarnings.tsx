import React from "react";
import {
  Typography,
  Avatar,
} from "@mui/material";
import { IconCurrencyDollar } from "@tabler/icons-react";
import DashboardCard from "../../shared/DashboardCard";

const TotalEarnings = () => {

  return (
    <DashboardCard
      title="Total Earnings"
      action={
        <Avatar
          sx={{
            width: 48,
            height: 48,
            bgcolor: "secondary.main", color: "white"
          }}
        >
          <IconCurrencyDollar width="24" height="24" />
        </Avatar>
      }
    >
      <>
        <Typography variant="h2" fontSize="30px" pt={1}>
          $93,438.78
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Monthly Revenue
        </Typography>
      </>
    </DashboardCard>
  );
};

export default TotalEarnings;
