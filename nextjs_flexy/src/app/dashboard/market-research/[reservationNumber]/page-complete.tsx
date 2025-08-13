'use client';

import React, { useState, useEffect, use } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Card,
  CardContent,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import ParentCard from '@/app/components/shared/ParentCard';
import BlankCard from '@/app/components/shared/BlankCard';
import ChatPanel from '../../orders/_components/ChatPanel';
import OrderHeader from '../../orders/_components/OrderHeader';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';