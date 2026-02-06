import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback, useMemo } from 'react';
import NetInfo from '@react-native-community/netinfo';

interface CachedTicket {
  id: string;
  eventId: string;
  qrCode: string;
  eventTitle: string;
  eventImage: string;
  eventDate: string;
  venue: string;
  quantity: number;
  cachedAt: string;
}

interface CachedEvent {
  id: string;
  title: string;
  image: string;
  date: string;
  venue: string;
  description: string;
  cachedAt: string;
}

const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000;

export const [OfflineProvider, useOffline] = createContextHook(() => {
  const [isOnline, setIsOnline] = useState(true);
  const [cachedTickets, setCachedTickets] = useState<CachedTicket[]>([]);
  const [cachedEvents, setCachedEvents] = useState<CachedEvent[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: { isConnected: boolean | null }) => {
      setIsOnline(state.isConnected ?? true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!initialized) {
      loadCache().catch(error => {
        console.error('Failed to initialize offline cache:', error);
      }).finally(() => {
        setInitialized(true);
      });
    }
  }, [initialized]);

  const loadCache = async () => {
    try {
      const ticketsData = await AsyncStorage.getItem('cached_tickets');
      const eventsData = await AsyncStorage.getItem('cached_events');

      if (ticketsData) {
        const tickets = JSON.parse(ticketsData);
        const validTickets = tickets.filter((ticket: CachedTicket) => {
          const cachedTime = new Date(ticket.cachedAt).getTime();
          return Date.now() - cachedTime < CACHE_EXPIRY;
        });
        setCachedTickets(validTickets);
      }

      if (eventsData) {
        const events = JSON.parse(eventsData);
        const validEvents = events.filter((event: CachedEvent) => {
          const cachedTime = new Date(event.cachedAt).getTime();
          return Date.now() - cachedTime < CACHE_EXPIRY;
        });
        setCachedEvents(validEvents);
      }
    } catch (error) {
      console.error('Error loading cache:', error);
    }
  };

  const cacheTicket = useCallback(async (ticket: Omit<CachedTicket, 'cachedAt'>) => {
    try {
      const newTicket: CachedTicket = {
        ...ticket,
        cachedAt: new Date().toISOString(),
      };

      const existingIndex = cachedTickets.findIndex((t) => t.id === ticket.id);
      let updatedTickets: CachedTicket[];

      if (existingIndex >= 0) {
        updatedTickets = [...cachedTickets];
        updatedTickets[existingIndex] = newTicket;
      } else {
        updatedTickets = [...cachedTickets, newTicket];
      }

      setCachedTickets(updatedTickets);
      await AsyncStorage.setItem('cached_tickets', JSON.stringify(updatedTickets));
      console.log('✅ Bilhete guardado offline:', ticket.id);
    } catch (error) {
      console.error('Error caching ticket:', error);
    }
  }, [cachedTickets]);

  const cacheEvent = useCallback(async (event: Omit<CachedEvent, 'cachedAt'>) => {
    try {
      const newEvent: CachedEvent = {
        ...event,
        cachedAt: new Date().toISOString(),
      };

      const existingIndex = cachedEvents.findIndex((e) => e.id === event.id);
      let updatedEvents: CachedEvent[];

      if (existingIndex >= 0) {
        updatedEvents = [...cachedEvents];
        updatedEvents[existingIndex] = newEvent;
      } else {
        updatedEvents = [...cachedEvents, newEvent];
      }

      setCachedEvents(updatedEvents);
      await AsyncStorage.setItem('cached_events', JSON.stringify(updatedEvents));
      console.log('✅ Evento guardado offline:', event.id);
    } catch (error) {
      console.error('Error caching event:', error);
    }
  }, [cachedEvents]);

  const removeCachedTicket = useCallback(async (ticketId: string) => {
    try {
      const updatedTickets = cachedTickets.filter((t) => t.id !== ticketId);
      setCachedTickets(updatedTickets);
      await AsyncStorage.setItem('cached_tickets', JSON.stringify(updatedTickets));
    } catch (error) {
      console.error('Error removing cached ticket:', error);
    }
  }, [cachedTickets]);

  const removeCachedEvent = useCallback(async (eventId: string) => {
    try {
      const updatedEvents = cachedEvents.filter((e) => e.id !== eventId);
      setCachedEvents(updatedEvents);
      await AsyncStorage.setItem('cached_events', JSON.stringify(updatedEvents));
    } catch (error) {
      console.error('Error removing cached event:', error);
    }
  }, [cachedEvents]);

  const clearCache = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove(['cached_tickets', 'cached_events']);
      setCachedTickets([]);
      setCachedEvents([]);
      console.log('✅ Cache limpa com sucesso');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }, []);

  const getCacheSize = useCallback((): number => {
    const ticketsSize = JSON.stringify(cachedTickets).length;
    const eventsSize = JSON.stringify(cachedEvents).length;
    return Math.round((ticketsSize + eventsSize) / 1024);
  }, [cachedTickets, cachedEvents]);

  const cacheSize = getCacheSize();

  return useMemo(() => ({
    isOnline,
    cachedTickets,
    cachedEvents,
    cacheTicket,
    cacheEvent,
    removeCachedTicket,
    removeCachedEvent,
    clearCache,
    cacheSize,
  }), [
    isOnline,
    cachedTickets,
    cachedEvents,
    cacheTicket,
    cacheEvent,
    removeCachedTicket,
    removeCachedEvent,
    clearCache,
    cacheSize,
  ]);
});
