import React from "react";
import {
  Typography,
  Avatar,
} from "@mui/material";
import { IconShoppingBag } from "@tabler/icons-react";
import DashboardCard from "../../shared/DashboardCard";

const Purchases = () => {

  return (
    <DashboardCard
      title="Purchases"
      action={
        <Avatar
          sx={{
            width: 48,
            height: 48,
            bgcolor: "primary.main", color: "white"
          }}
        >
          <IconShoppingBag width="24" height="24" />
        </Avatar>
      }
    >
      <>
        <Typography variant="h2" fontSize="30px" pt={1}>2,367</Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Monthly Sales
        </Typography>
      </>
    </DashboardCard>
  );
};

export default Purchases;
