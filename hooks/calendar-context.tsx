import { useState, useEffect, useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { CalendarEvent, EventReminder, QRTicket } from '@/types/event';
import { Platform } from 'react-native';
import * as Calendar from 'expo-calendar';
import * as Notifications from 'expo-notifications';

interface CalendarContextType {
  calendarEvents: CalendarEvent[];
  reminders: EventReminder[];
  tickets: QRTicket[];
  addToCalendar: (eventId: string, eventTitle: string, eventDate: Date, venue: string) => Promise<boolean>;
  setReminder: (eventId: string, eventDate: Date) => Promise<boolean>;
  removeReminder: (eventId: string) => Promise<void>;
  addTicket: (ticket: Omit<QRTicket, 'id'>) => Promise<string>;
  getTicketsByEvent: (eventId: string) => QRTicket[];
  markTicketAsUsed: (ticketId: string) => Promise<void>;
  isEventInCalendar: (eventId: string) => boolean;
  hasReminder: (eventId: string) => boolean;
}

export const [CalendarProvider, useCalendar] = createContextHook<CalendarContextType>(() => {
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [reminders, setReminders] = useState<EventReminder[]>([]);
  const [tickets, setTickets] = useState<QRTicket[]>([]);

  const loadCalendarData = useCallback(async () => {
    try {
      // Mock data loading for now - in real app would use AsyncStorage
      console.log('Loading calendar data...');
    } catch (error) {
      console.error('Error loading calendar data:', error);
    }
  }, []);

  useEffect(() => {
    loadCalendarData();
  }, [loadCalendarData]);

  const saveCalendarEvents = useCallback(async (events: CalendarEvent[]) => {
    if (!Array.isArray(events)) return;
    try {
      console.log('Saving calendar events:', events.length);
      setCalendarEvents(events);
    } catch (error) {
      console.error('Error saving calendar events:', error);
    }
  }, []);

  const saveReminders = useCallback(async (reminderList: EventReminder[]) => {
    if (!Array.isArray(reminderList)) return;
    try {
      console.log('Saving reminders:', reminderList.length);
      setReminders(reminderList);
    } catch (error) {
      console.error('Error saving reminders:', error);
    }
  }, []);

  const saveTickets = useCallback(async (ticketList: QRTicket[]) => {
    if (!Array.isArray(ticketList)) return;
    try {
      console.log('Saving tickets:', ticketList.length);
      setTickets(ticketList);
    } catch (error) {
      console.error('Error saving tickets:', error);
    }
  }, []);

  const addToCalendar = useCallback(async (
    eventId: string,
    eventTitle: string,
    eventDate: Date,
    venue: string
  ): Promise<boolean> => {
    if (!eventId?.trim() || !eventTitle?.trim() || !venue?.trim()) return false;
    
    try {
      if (Platform.OS !== 'web') {
        const { status } = await Calendar.requestCalendarPermissionsAsync();
        if (status !== 'granted') {
          console.log('Calendar permission denied');
          return false;
        }

        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        const defaultCalendar = calendars.find(cal => cal.source.name === 'Default') || calendars[0];

        if (defaultCalendar) {
          const calendarId = await Calendar.createEventAsync(defaultCalendar.id, {
            title: eventTitle,
            startDate: eventDate,
            endDate: new Date(eventDate.getTime() + 2 * 60 * 60 * 1000),
            location: venue,
            notes: `Evento adicionado via DICE App`,
          });

          const newCalendarEvent: CalendarEvent = {
            eventId,
            addedAt: new Date(),
            calendarId
          };

          await saveCalendarEvents([...calendarEvents, newCalendarEvent]);
          return true;
        }
      } else {
        const newCalendarEvent: CalendarEvent = {
          eventId,
          addedAt: new Date()
        };
        await saveCalendarEvents([...calendarEvents, newCalendarEvent]);
        return true;
      }
    } catch (error) {
      console.error('Error adding to calendar:', error);
    }
    return false;
  }, [calendarEvents, saveCalendarEvents]);

  const setReminder = useCallback(async (eventId: string, eventDate: Date): Promise<boolean> => {
    if (!eventId?.trim()) return false;
    
    try {
      console.log('Setting reminder for event:', eventId);
      
      const newReminder: EventReminder = {
        eventId,
        reminderDate: new Date(eventDate.getTime() - 3 * 24 * 60 * 60 * 1000),
        type: 'push'
      };

      await saveReminders([...reminders, newReminder]);
      return true;
    } catch (error) {
      console.error('Error setting reminder:', error);
      return false;
    }
  }, [reminders, saveReminders]);

  const removeReminder = useCallback(async (eventId: string): Promise<void> => {
    if (!eventId?.trim()) return;
    const updatedReminders = reminders.filter(r => r.eventId !== eventId);
    await saveReminders(updatedReminders);
  }, [reminders, saveReminders]);

  const addTicket = useCallback(async (ticketData: Omit<QRTicket, 'id'>): Promise<string> => {
    const ticketId = `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTicket: QRTicket = {
      ...ticketData,
      id: ticketId
    };

    await saveTickets([...tickets, newTicket]);
    return ticketId;
  }, [tickets, saveTickets]);

  const getTicketsByEvent = useCallback((eventId: string): QRTicket[] => {
    if (!eventId?.trim()) return [];
    return tickets.filter(ticket => ticket.eventId === eventId);
  }, [tickets]);

  const markTicketAsUsed = useCallback(async (ticketId: string): Promise<void> => {
    if (!ticketId?.trim()) return;
    const updatedTickets = tickets.map(ticket => 
      ticket.id === ticketId ? { ...ticket, isUsed: true } : ticket
    );
    await saveTickets(updatedTickets);
  }, [tickets, saveTickets]);

  const isEventInCalendar = useCallback((eventId: string): boolean => {
    if (!eventId?.trim()) return false;
    return calendarEvents.some(event => event.eventId === eventId);
  }, [calendarEvents]);

  const hasReminder = useCallback((eventId: string): boolean => {
    if (!eventId?.trim()) return false;
    return reminders.some(reminder => reminder.eventId === eventId);
  }, [reminders]);

  return useMemo(() => ({
    calendarEvents,
    reminders,
    tickets,
    addToCalendar,
    setReminder,
    removeReminder,
    addTicket,
    getTicketsByEvent,
    markTicketAsUsed,
    isEventInCalendar,
    hasReminder
  }), [
    calendarEvents,
    reminders,
    tickets,
    addToCalendar,
    setReminder,
    removeReminder,
    addTicket,
    getTicketsByEvent,
    markTicketAsUsed,
    isEventInCalendar,
    hasReminder
  ]);
});