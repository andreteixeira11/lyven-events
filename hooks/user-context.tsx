import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { User, UserType, PromoterProfile } from '@/types/user';
import { createDefaultUser } from '@/constants/onboarding';
import { trpcClient } from '@/lib/trpc';

export const [UserProvider, useUser] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [promoterProfile, setPromoterProfile] = useState<PromoterProfile | null>(null);
  const initializedRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    
    const loadUser = async () => {
      if (initializedRef.current) return;
      initializedRef.current = true;
      
      try {
        const userData = await AsyncStorage.getItem('user');
        const promoterData = await AsyncStorage.getItem('promoterProfile');
        
        if (!mountedRef.current) return;
        
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          
          if (parsedUser.userType === 'promoter' && promoterData) {
            setPromoterProfile(JSON.parse(promoterData));
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    };
    
    loadUser();
    
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const saveUser = async (userData: User) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const savePromoterProfile = async (profile: PromoterProfile) => {
    try {
      await AsyncStorage.setItem('promoterProfile', JSON.stringify(profile));
      setPromoterProfile(profile);
    } catch (error) {
      console.error('Error saving promoter profile:', error);
    }
  };

  const createUser = useCallback(async (email: string, name: string) => {
    if (!email?.trim() || !name?.trim()) return;
    if (email.length > 100 || name.length > 50) return;
    
    const sanitizedEmail = email.trim();
    const sanitizedName = name.trim();
    
    const defaultUser = createDefaultUser(sanitizedEmail, sanitizedName);
    const newUser: User = {
      ...defaultUser,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    } as User;
    
    await saveUser(newUser);
    return newUser;
  }, []);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    console.log('🔄 Atualizando utilizador:', updates);
    
    if (updates && Object.keys(updates).length > 0) {
      if (!user) {
        console.log('ℹ️ Criando novo utilizador a partir de updates');
        await saveUser(updates as User);
      } else {
        console.log('ℹ️ Atualizando utilizador existente');
        const updatedUser = { ...user, ...updates };
        await saveUser(updatedUser);
      }
    }
  }, [user]);

  const completeOnboarding = useCallback(async (userData: Partial<User>) => {
    if (!user) return;
    
    console.log('📝 Completando onboarding com dados:', userData);
    
    const updatedUser = {
      ...user,
      ...userData,
      isOnboardingComplete: true,
    };
    
    await saveUser(updatedUser);
    
    const language = userData.preferences?.language;
    const supportedLanguage = language === 'pt' || language === 'en' ? language : 'pt';
    
    trpcClient.users.updateOnboarding.mutate({
      id: user.id,
      phone: userData.phone,
      interests: userData.interests,
      locationCity: userData.location?.city,
      locationRegion: userData.location?.region,
      locationLatitude: userData.location?.latitude,
      locationLongitude: userData.location?.longitude,
      preferencesNotifications: userData.preferences?.notifications,
      preferencesLanguage: supportedLanguage,
      preferencesPriceMin: userData.preferences?.priceRange?.min,
      preferencesPriceMax: userData.preferences?.priceRange?.max,
      preferencesEventTypes: userData.preferences?.eventTypes,
    }).then(() => {
      console.log('✅ Onboarding sincronizado com backend');
    }).catch((error) => {
      console.error('❌ Erro ao sincronizar onboarding com backend:', error);
    });
  }, [user]);

  const switchUserType = useCallback(async (userType: UserType) => {
    if (!user) return;
    
    await updateUser({ userType });
    
    if (userType === 'normal') {
      await AsyncStorage.removeItem('promoterProfile');
      setPromoterProfile(null);
    }
  }, [user, updateUser]);

  const createPromoterProfile = useCallback(async (profileData: Omit<PromoterProfile, 'userId' | 'isApproved' | 'eventsCreated' | 'followers' | 'rating' | 'totalEvents'>) => {
    if (!user) return;
    
    const newProfile: PromoterProfile = {
      ...profileData,
      userId: user.id,
      isApproved: false,
      eventsCreated: [],
      followers: [],
      rating: 0,
      totalEvents: 0,
    };
    
    await savePromoterProfile(newProfile);
    await switchUserType('promoter');
  }, [user, switchUserType]);

  const addToFavorites = useCallback(async (eventId: string) => {
    if (!user) return;
    
    const updatedFavorites = [...user.favoriteEvents];
    if (!updatedFavorites.includes(eventId)) {
      updatedFavorites.push(eventId);
      await updateUser({ favoriteEvents: updatedFavorites });
    }
  }, [user, updateUser]);

  const removeFromFavorites = useCallback(async (eventId: string) => {
    if (!user) return;
    
    const updatedFavorites = user.favoriteEvents.filter(id => id !== eventId);
    await updateUser({ favoriteEvents: updatedFavorites });
  }, [user, updateUser]);

  const addToHistory = useCallback(async (eventId: string) => {
    if (!user) return;
    
    const updatedHistory = [...user.eventHistory];
    if (!updatedHistory.includes(eventId)) {
      updatedHistory.push(eventId);
      await updateUser({ eventHistory: updatedHistory });
    }
  }, [user, updateUser]);

  const followPromoter = useCallback(async (promoterId: string) => {
    if (!user) return;
    
    const updatedFollowing = { ...user.following };
    if (!updatedFollowing.promoters.includes(promoterId)) {
      updatedFollowing.promoters.push(promoterId);
      await updateUser({ following: updatedFollowing });
    }
  }, [user, updateUser]);

  const unfollowPromoter = useCallback(async (promoterId: string) => {
    if (!user) return;
    
    const updatedFollowing = { ...user.following };
    updatedFollowing.promoters = updatedFollowing.promoters.filter(id => id !== promoterId);
    await updateUser({ following: updatedFollowing });
  }, [user, updateUser]);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove(['user', 'promoterProfile']);
      setUser(null);
      setPromoterProfile(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }, []);

  return useMemo(() => ({
    user,
    promoterProfile,
    isLoading,
    createUser,
    updateUser,
    completeOnboarding,
    switchUserType,
    createPromoterProfile,
    addToFavorites,
    removeFromFavorites,
    addToHistory,
    followPromoter,
    unfollowPromoter,
    logout,
  }), [
    user,
    promoterProfile,
    isLoading,
    createUser,
    updateUser,
    completeOnboarding,
    switchUserType,
    createPromoterProfile,
    addToFavorites,
    removeFromFavorites,
    addToHistory,
    followPromoter,
    unfollowPromoter,
    logout,
  ]);
});