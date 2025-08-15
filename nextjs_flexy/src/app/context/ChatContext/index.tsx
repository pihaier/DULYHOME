'use client';
import { createContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from 'react';
import React from 'react';
import useSWR from 'swr';
import { ChatsType, MessageType } from '@/app/dashboard/types/apps/chat';
import { getFetcher, postFetcher } from '@/app/api/globalFetcher';

// Define context props interface
export interface ChatContextProps {
  chatData: ChatsType[];
  chatContent: MessageType[];
  chatSearch: string;
  selectedChat: ChatsType | null;
  loading: boolean;
  error: string;
  activeChatId: number | null;
  setChatContent: Dispatch<SetStateAction<MessageType[]>>;
  setChatSearch: Dispatch<SetStateAction<string>>;
  setSelectedChat: Dispatch<SetStateAction<ChatsType | null>>;
  setActiveChatId: Dispatch<SetStateAction<number | null>>;
  sendMessage: (chatId: number | string, message: MessageType | string) => void;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<string>>;
}

// Create the context
export const ChatContext = createContext<ChatContextProps>({
  chatData: [],
  chatContent: [],
  chatSearch: '',
  selectedChat: null,
  loading: true,
  error: '',
  activeChatId: null,
  setChatContent: () => {},
  setChatSearch: () => {},
  setSelectedChat: () => {},
  setActiveChatId: () => {},
  sendMessage: () => {},
  setLoading: () => {},
  setError: () => {},
});

// Create the provider component
export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [chatData, setChatData] = useState<ChatsType[]>([]);
  const [chatContent, setChatContent] = useState<MessageType[]>([]);
  const [chatSearch, setChatSearch] = useState<string>('');
  const [selectedChat, setSelectedChat] = useState<ChatsType | null>(null);
  const [activeChatId, setActiveChatId] = useState<number | null>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const {
    data: ChatsData,
    isLoading: isChatsLoading,
    error: Chatserror,
    mutate,
  } = useSWR('/api/chat', getFetcher);

  // Fetch chat data from the API
  useEffect(() => {
    if (ChatsData) {
      setLoading(isChatsLoading);
      const chatsData = ChatsData.data;
      if (chatData.length === 0) {
        const specificChat = chatsData[0];
        setSelectedChat(specificChat);
      }
      setChatData(chatsData);
    } else if (Chatserror) {
      setError(Chatserror);
      setLoading(isChatsLoading);
    } else {
      setLoading(isChatsLoading);
    }
  }, [ChatsData, Chatserror, isChatsLoading, chatData.length]);

  // Function to send a message to a chat identified by `chatId` using an API call.

  const sendMessage = async (chatId: number | string, message: MessageType | string) => {
    try {
      const { data }: { data: ChatsType[] } = await mutate(
        postFetcher('/api/chat', { chatId, message })
      );
      const updatedChat = data.find((chat) => chat.id === chatId);
      if (updatedChat) {
        setSelectedChat(updatedChat);
      }
    } catch (error) {}
  };

  const value: ChatContextProps = {
    chatData,
    chatContent,
    chatSearch,
    selectedChat,
    loading,
    error,
    activeChatId,
    setChatContent,
    setChatSearch,
    setSelectedChat,
    setActiveChatId,
    sendMessage,
    setError,
    setLoading,
  };
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
export type { ChatsType, MessageType };
