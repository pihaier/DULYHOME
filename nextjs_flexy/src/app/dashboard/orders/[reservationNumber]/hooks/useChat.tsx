'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface ChatMessage {
  id: string;
  reservation_number: string;
  sender_id?: string;
  sender_name: string;
  sender_role: string;
  original_message: string;
  original_language: 'ko' | 'zh';
  translated_message?: string;
  translated_language?: 'ko' | 'zh';
  message_type: 'text' | 'file' | 'image' | 'video';
  file_url?: string;
  file_name?: string;
  file_size?: number;
  created_at: string;
  is_deleted: boolean;
}

export interface ChatParticipant {
  id: string;
  reservation_number: string;
  user_id?: string;
  role: string;
  is_online: boolean;
  last_seen: string;
  joined_at: string;
  left_at?: string;
}

export interface UseChatReturn {
  messages: ChatMessage[];
  participants: ChatParticipant[];
  loading: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  markAsRead: () => Promise<void>;
  setTyping: (isTyping: boolean) => Promise<void>;
}

export const useChat = (reservationNumber: string, currentUser?: any): UseChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const channelRef = useRef<any>(null);

  // Load initial chat messages
  const loadMessages = useCallback(async () => {
    if (!reservationNumber) return;

    try {

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('reservation_number', reservationNumber)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      setMessages(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    }
  }, [reservationNumber, supabase]);

  // Load chat participants
  const loadParticipants = useCallback(async () => {
    if (!reservationNumber) return;

    try {
      const { data, error } = await supabase
        .from('chat_participants')
        .select('*')
        .eq('reservation_number', reservationNumber);

      if (error) {
        throw error;
      }

      setParticipants(data || []);
    } catch (err) {
    }
  }, [reservationNumber, supabase]);

  // Send message
  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || !currentUser) return;

      try {

        const messageData = {
          reservation_number: reservationNumber,
          sender_id: currentUser.id,
          sender_name: currentUser.user_metadata?.name || currentUser.email || 'Unknown',
          sender_role: currentUser.user_metadata?.role || 'customer',
          original_message: message,
          original_language: 'ko' as const, // Default to Korean
          message_type: 'text' as const,
          is_deleted: false,
        };

        const { data, error } = await supabase
          .from('chat_messages')
          .insert([messageData])
          .select()
          .single();

        if (error) {
          throw error;
        }

        // Message will be automatically added via Realtime subscription
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message');
      }
    },
    [reservationNumber, currentUser, supabase]
  );

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    // Implementation for marking messages as read
    // This would typically update a read_status table or field
  }, []);

  // Set typing indicator
  const setTyping = useCallback(async (isTyping: boolean) => {
    // Implementation for typing indicator
    // This would typically use Supabase Realtime presence
  }, []);

  // Setup Realtime subscription
  useEffect(() => {
    if (!reservationNumber) return;


    // Create channel
    const channel = supabase
      .channel(`chat:${reservationNumber}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `reservation_number=eq.${reservationNumber}`,
        },
        (payload) => {

          if (payload.eventType === 'INSERT') {
            setMessages((prev) => [...prev, payload.new as ChatMessage]);
          } else if (payload.eventType === 'UPDATE') {
            setMessages((prev) =>
              prev.map((msg) => (msg.id === payload.new.id ? (payload.new as ChatMessage) : msg))
            );
          } else if (payload.eventType === 'DELETE') {
            setMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [reservationNumber, supabase]);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadMessages(), loadParticipants()]);
      setLoading(false);
    };

    loadData();
  }, [loadMessages, loadParticipants]);

  return {
    messages,
    participants,
    loading,
    error,
    sendMessage,
    markAsRead,
    setTyping,
  };
};

export default useChat;
