import { View, Text, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { Eye } from 'lucide-react-native';
import { trpcClient } from '@/lib/trpc';
import { useQuery } from '@tanstack/react-query';

interface SocialProofProps {
  eventId: string;
}

export function SocialProof({ eventId }: SocialProofProps) {
  const [sessionId] = useState(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  });

  const pulseAnim = useRef(new Animated.Value(1)).current;

  const { data } = useQuery({
    queryKey: ['activeViewers', eventId],
    queryFn: () => trpcClient.events.getActiveViewers.query({ eventId }),
    refetchInterval: 10000,
  });

  useEffect(() => {
    const trackView = async () => {
      try {
        await trpcClient.events.trackView.mutate({
          eventId,
          sessionId,
        });
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    };

    trackView();
    const interval = setInterval(trackView, 30000);

    return () => clearInterval(interval);
  }, [eventId, sessionId]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  if (!data || data.activeViewers === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
        <Eye size={14} color="#FF4500" />
      </Animated.View>
      <Text style={styles.text}>
        {data.activeViewers === 1
          ? '1 pessoa a ver agora'
          : `${data.activeViewers} pessoas a ver agora`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 69, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 0, 0.3)',
  },
  iconContainer: {
    marginRight: 6,
  },
  text: {
    color: '#FF4500',
    fontSize: 13,
    fontWeight: '600',
  },
});
