import { useState, useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { EventShare, EventInvite, EventAttendance } from '@/types/event';
import { Platform, Share } from 'react-native';
import * as Linking from 'expo-linking';

interface SocialContextType {
  shares: EventShare[];
  invites: EventInvite[];
  attendance: EventAttendance[];
  shareEvent: (eventId: string, eventTitle: string, platform: EventShare['platform']) => Promise<boolean>;
  inviteFriend: (eventId: string, friendId: string, message?: string) => Promise<string>;
  setAttendance: (eventId: string, status: EventAttendance['status']) => Promise<void>;
  getEventAttendance: (eventId: string) => EventAttendance | undefined;
  getEventShares: (eventId: string) => EventShare[];
  getEventInvites: (eventId: string) => EventInvite[];
}

export const [SocialProvider, useSocial] = createContextHook<SocialContextType>(() => {
  const [shares, setShares] = useState<EventShare[]>([]);
  const [invites, setInvites] = useState<EventInvite[]>([]);
  const [attendance, setAttendanceState] = useState<EventAttendance[]>([]);

  const shareEvent = useCallback(async (
    eventId: string,
    eventTitle: string,
    platform: EventShare['platform']
  ): Promise<boolean> => {
    if (!eventId?.trim() || !eventTitle?.trim()) return false;

    try {
      const shareUrl = `https://dice-app.com/event/${eventId}`;
      const shareMessage = `Vê este evento incrível: ${eventTitle} ${shareUrl}`;

      if (platform === 'copy') {
        // Copy to clipboard functionality would go here
        console.log('Copied to clipboard:', shareMessage);
      } else if (platform === 'whatsapp') {
        const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(shareMessage)}`;
        await Linking.openURL(whatsappUrl);
      } else if (platform === 'facebook') {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        await Linking.openURL(facebookUrl);
      } else if (platform === 'instagram') {
        // Instagram sharing would require specific implementation
        console.log('Instagram sharing not implemented yet');
      } else if (platform === 'twitter') {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`;
        await Linking.openURL(twitterUrl);
      } else {
        // Use native share
        if (Platform.OS !== 'web') {
          await Share.share({
            message: shareMessage,
            url: shareUrl,
            title: eventTitle,
          });
        }
      }

      const newShare: EventShare = {
        eventId,
        platform,
        sharedAt: new Date()
      };

      setShares(prev => [...prev, newShare]);
      return true;
    } catch (error) {
      console.error('Error sharing event:', error);
      return false;
    }
  }, []);

  const inviteFriend = useCallback(async (
    eventId: string,
    friendId: string,
    message?: string
  ): Promise<string> => {
    if (!eventId?.trim() || !friendId?.trim()) return '';

    const inviteId = `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newInvite: EventInvite = {
      id: inviteId,
      eventId,
      fromUserId: 'current_user', // Would be actual user ID
      toUserId: friendId,
      message,
      status: 'pending',
      sentAt: new Date()
    };

    setInvites(prev => [...prev, newInvite]);
    console.log('Invite sent:', inviteId);
    return inviteId;
  }, []);

  const setAttendance = useCallback(async (
    eventId: string,
    status: EventAttendance['status']
  ): Promise<void> => {
    if (!eventId?.trim()) return;

    const existingIndex = attendance.findIndex(a => a.eventId === eventId);
    const newAttendance: EventAttendance = {
      eventId,
      userId: 'current_user', // Would be actual user ID
      status,
      addedAt: new Date()
    };

    if (existingIndex >= 0) {
      const updated = [...attendance];
      updated[existingIndex] = newAttendance;
      setAttendanceState(updated);
    } else {
      setAttendanceState(prev => [...prev, newAttendance]);
    }
  }, [attendance]);

  const getEventAttendance = useCallback((eventId: string): EventAttendance | undefined => {
    if (!eventId?.trim()) return undefined;
    return attendance.find(a => a.eventId === eventId);
  }, [attendance]);

  const getEventShares = useCallback((eventId: string): EventShare[] => {
    if (!eventId?.trim()) return [];
    return shares.filter(share => share.eventId === eventId);
  }, [shares]);

  const getEventInvites = useCallback((eventId: string): EventInvite[] => {
    if (!eventId?.trim()) return [];
    return invites.filter(invite => invite.eventId === eventId);
  }, [invites]);

  return useMemo(() => ({
    shares,
    invites,
    attendance,
    shareEvent,
    inviteFriend,
    setAttendance,
    getEventAttendance,
    getEventShares,
    getEventInvites
  }), [
    shares,
    invites,
    attendance,
    shareEvent,
    inviteFriend,
    setAttendance,
    getEventAttendance,
    getEventShares,
    getEventInvites
  ]);
});