'use client';
import React, { createContext, useState, useEffect } from 'react';
import { TicketType } from '@/app/dashboard/types/apps/ticket';
import useSWR from 'swr';
import { deleteFetcher, getFetcher } from '@/app/api/globalFetcher';

export interface TicketContextType {
  tickets: TicketType[];
  deleteTicket: (id: number) => void;
  setTicketSearch: (searchTerm: string) => void;
  searchTickets: (searchTerm: string) => void;
  ticketSearch: string;
  filter: string;
  error: string;
  loading: boolean;
  setFilter: (filter: string) => void;
}

// Create Context
export const TicketContext = createContext<TicketContextType>({} as TicketContextType);

// Provider Component
export const TicketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [ticketSearch, setTicketSearch] = useState<string>('');
  const [filter, setFilter] = useState<string>('total_tickets');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Fetch tickets from the API when the component mounts using useEffect
  const {
    data: ticketsData,
    isLoading: isTicketsLoading,
    error: ticketsError,
    mutate,
  } = useSWR('/api/ticket', getFetcher);
  useEffect(() => {
    if (ticketsData) {
      setTickets(ticketsData.data);
      setLoading(isTicketsLoading);
    } else if (ticketsError) {
      setError(ticketsError);
      setLoading(isTicketsLoading);
    } else {
      setLoading(isTicketsLoading);
    }
  }, [ticketsData, ticketsError, isTicketsLoading]);

  // Delete a ticket with the specified ID from the server and update the tickets state
  const deleteTicket = async (id: number) => {
    try {
      await mutate(deleteFetcher('/api/ticket', { id }));
    } catch (err) {
    }
  };

  // Update the ticket search term state based on the provided search term value.
  const searchTickets = (searchTerm: string) => {
    setTicketSearch(searchTerm);
  };

  return (
    <TicketContext.Provider
      value={{
        tickets,
        error,
        loading,
        deleteTicket,
        setTicketSearch,
        searchTickets,
        ticketSearch,
        filter,
        setFilter,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};
