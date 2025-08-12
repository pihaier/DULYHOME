"use client";
import React, { useState } from "react";
import {
  Box,
  Stack,
  Typography,
  Link,
  Chip,
  Button,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Image from "next/image";
import useMediaQuery from "@mui/material/useMediaQuery";
import { IconX } from "@tabler/icons-react";

const NotificationBg = styled(Box)(() => ({
  position: "absolute",
  right: "20%",
  top: 0,
}));

const NotificationBg2 = styled(Box)(() => ({
  position: "absolute",
  right: 0,
  top: 0,
}));

const NotificationBg3 = styled(Box)(() => ({
  position: "absolute",
  left: 0,
  bottom: "-5px",
}));

const HeaderAlert = () => {
  // Always return null to hide the alert banner
  return null;
};

export default HeaderAlert;
