'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Stack, Alert } from '@mui/material';
import { useUser } from '@/lib/context/GlobalContext';

export default function TestRealtimePage() {
  const { supabase, user } = useUser();
  const [status, setStatus] = useState<string>('Not connected');
  const [messages, setMessages] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const testRealtime = () => {
    setError(null);
    setMessages([]);

    // Test 1: Basic channel subscription
    const testChannel = supabase
      .channel('test-channel')
      .on('presence', { event: 'sync' }, () => {
        setMessages((prev) => [...prev, 'Presence sync event']);
      })
      .subscribe((status, err) => {
        if (err) {
          setError(`Channel error: ${err.message}`);
        }
        setStatus(status);
      });

    // Test 2: Database changes subscription
    const dbChannel = supabase
      .channel('db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          setMessages((prev) => [...prev, `DB Change: ${payload.eventType}`]);
        }
      )
      .subscribe((status, err) => {
        if (err) {
          setError(`DB error: ${err.message}`);
        }
      });

    // Cleanup after 30 seconds
    setTimeout(() => {
      supabase.removeChannel(testChannel);
      supabase.removeChannel(dbChannel);
      setStatus('Disconnected');
    }, 30000);
  };

  const checkRealtimeConfig = async () => {
    try {
      // Check if user is authenticated
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError('Not authenticated - Realtime requires authentication');
        return;
      }

      // Test database connection
      const { data, error } = await supabase.from('chat_messages').select('id').limit(1);

      if (error) {
        setError(`Database error: ${error.message}`);
      } else {
        setMessages((prev) => [...prev, 'Database connection OK']);
      }
    } catch (err) {
      setError(`Config error: ${err}`);
    }
  };

  useEffect(() => {
    checkRealtimeConfig();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Realtime Connection Test
      </Typography>

      <Stack spacing={3}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Connection Status</Typography>
          <Typography color={status === 'SUBSCRIBED' ? 'success.main' : 'text.secondary'}>
            {status}
          </Typography>
        </Paper>

        {error && <Alert severity="error">{error}</Alert>}

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">User Info</Typography>
          <Typography variant="body2">User ID: {user?.id || 'Not logged in'}</Typography>
          <Typography variant="body2">Email: {user?.email || 'N/A'}</Typography>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Events</Typography>
          {messages.length === 0 ? (
            <Typography color="text.secondary">No events yet</Typography>
          ) : (
            <Stack spacing={1}>
              {messages.map((msg, idx) => (
                <Typography key={idx} variant="body2">
                  {msg}
                </Typography>
              ))}
            </Stack>
          )}
        </Paper>

        <Button variant="contained" onClick={testRealtime} disabled={status === 'SUBSCRIBED'}>
          Test Realtime Connection
        </Button>

        <Alert severity="info">
          <Typography variant="body2">Supabase Dashboard Realtime 설정 확인:</Typography>
          <ol>
            <li>Dashboard → Database → Replication</li>
            <li>supabase_realtime publication 확인</li>
            <li>chat_messages 테이블의 Enable Realtime 토글 ON</li>
            <li>INSERT, UPDATE, DELETE 이벤트 모두 체크</li>
          </ol>
        </Alert>
      </Stack>
    </Box>
  );
}
