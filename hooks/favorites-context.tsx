import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { FavoriteEvent, EventReminder } from '@/types/event';
import { Platform } from 'react-native';

interface FavoritesContextType {
  favorites: FavoriteEvent[];
  reminders: EventReminder[];
  addToFavorites: (eventId: string) => Promise<void>;
  removeFromFavorites: (eventId: string) => Promise<void>;
  isFavorite: (eventId: string) => boolean;
  addReminder: (eventId: string, reminderDate: Date, type: 'push' | 'email') => Promise<void>;
  removeReminder: (eventId: string) => Promise<void>;
  hasReminder: (eventId: string) => boolean;
  addToCalendar: (eventId: string) => Promise<void>;
  shareEvent: (eventId: string, eventTitle: string) => Promise<void>;
  isLoading: boolean;
}

export const [FavoritesContext, useFavorites] = createContextHook<FavoritesContextType>(() => {
  const [favorites, setFavorites] = useState<FavoriteEvent[]>([]);
  const [reminders, setReminders] = useState<EventReminder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      loadFavorites();
      loadReminders();
      setInitialized(true);
    }
  }, [initialized]);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem('favorites');
      if (stored) {
        const parsedFavorites = JSON.parse(stored).map((fav: any) => ({
          ...fav,
          addedAt: new Date(fav.addedAt)
        }));
        setFavorites(parsedFavorites);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReminders = async () => {
    try {
      const stored = await AsyncStorage.getItem('reminders');
      if (stored) {
        const parsedReminders = JSON.parse(stored).map((reminder: any) => ({
          ...reminder,
          reminderDate: new Date(reminder.reminderDate)
        }));
        setReminders(parsedReminders);
      }
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  };

  const addToFavorites = useCallback(async (eventId: string) => {
    const newFavorite: FavoriteEvent = {
      eventId,
      addedAt: new Date()
    };
    
    const updatedFavorites = [...favorites, newFavorite];
    setFavorites(updatedFavorites);
    
    try {
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    } catch (error) {
      console.error('Error saving favorite:', error);
      setFavorites(favorites);
    }
  }, [favorites]);

  const removeFromFavorites = useCallback(async (eventId: string) => {
    const updatedFavorites = favorites.filter(fav => fav.eventId !== eventId);
    setFavorites(updatedFavorites);
    
    try {
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    } catch (error) {
      console.error('Error removing favorite:', error);
      setFavorites(favorites);
    }
  }, [favorites]);

  const isFavorite = useCallback((eventId: string) => {
    return favorites.some(fav => fav.eventId === eventId);
  }, [favorites]);

  const addReminder = useCallback(async (eventId: string, reminderDate: Date, type: 'push' | 'email') => {
    if (!eventId.trim()) return;
    
    const newReminder: EventReminder = {
      eventId,
      reminderDate,
      type
    };
    
    const updatedReminders = [...reminders, newReminder];
    setReminders(updatedReminders);
    
    try {
      await AsyncStorage.setItem('reminders', JSON.stringify(updatedReminders));
      
      if (Platform.OS !== 'web' && type === 'push') {
        console.log('Setting up push notification for:', eventId, reminderDate);
      }
    } catch (error) {
      console.error('Error saving reminder:', error);
      setReminders(reminders);
    }
  }, [reminders]);

  const removeReminder = useCallback(async (eventId: string) => {
    const updatedReminders = reminders.filter(reminder => reminder.eventId !== eventId);
    setReminders(updatedReminders);
    
    try {
      await AsyncStorage.setItem('reminders', JSON.stringify(updatedReminders));
    } catch (error) {
      console.error('Error removing reminder:', error);
      setReminders(reminders);
    }
  }, [reminders]);

  const hasReminder = useCallback((eventId: string) => {
    return reminders.some(reminder => reminder.eventId === eventId);
  }, [reminders]);

  const addToCalendar = useCallback(async (eventId: string) => {
    if (Platform.OS === 'web') {
      console.log('Calendar integration not available on web');
      return;
    }
    
    try {
      console.log('Adding event to calendar:', eventId);
    } catch (error) {
      console.error('Error adding to calendar:', error);
    }
  }, []);

  const shareEvent = useCallback(async (eventId: string, eventTitle: string) => {
    if (!eventTitle.trim()) return;
    const sanitizedTitle = eventTitle.trim();
    
    try {
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: sanitizedTitle,
            text: `Confira este evento: ${sanitizedTitle}`,
            url: window.location.href
          });
        } else {
          await navigator.clipboard.writeText(window.location.href);
          console.log('Link copied to clipboard');
        }
      } else {
        console.log('Sharing event:', eventId, sanitizedTitle);
      }
    } catch (error) {
      console.error('Error sharing event:', error);
    }
  }, []);

  return useMemo(() => ({
    favorites,
    reminders,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    addReminder,
    removeReminder,
    hasReminder,
    addToCalendar,
    shareEvent,
    isLoading
  }), [favorites, reminders, addToFavorites, removeFromFavorites, isFavorite, addReminder, removeReminder, hasReminder, addToCalendar, shareEvent, isLoading]);
});