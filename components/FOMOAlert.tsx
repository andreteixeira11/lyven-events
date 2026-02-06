import { Text, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react-native';
import { TicketType } from '@/types/event';

interface FOMOAlertProps {
  ticketTypes: TicketType[];
}

export function FOMOAlert({ ticketTypes }: FOMOAlertProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const lowestAvailable = ticketTypes.reduce((min, ticket) => {
    return ticket.available < min ? ticket.available : min;
  }, Infinity);

  const totalAvailable = ticketTypes.reduce((sum, ticket) => sum + ticket.available, 0);
  const totalCapacity = ticketTypes.reduce((sum, ticket) => sum + ticket.available + 100, 0);
  const percentageRemaining = (totalAvailable / totalCapacity) * 100;

  useEffect(() => {
    if (percentageRemaining < 20 || lowestAvailable < 10) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.delay(200),
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [percentageRemaining, lowestAvailable, fadeAnim]);

  if (percentageRemaining >= 20 && lowestAvailable >= 10) {
    return null;
  }

  const getMessage = () => {
    if (lowestAvailable < 5) {
      return `⚡ Últimos ${lowestAvailable} bilhetes disponíveis!`;
    } else if (lowestAvailable < 10) {
      return `🔥 Apenas ${lowestAvailable} bilhetes restantes!`;
    } else if (percentageRemaining < 10) {
      return '⏰ Quase esgotado! Garante o teu bilhete agora!';
    } else {
      return '⚠️ A esgotar rapidamente!';
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <AlertTriangle size={18} color="#FF6B00" />
      <Text style={styles.text}>{getMessage()}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF6B00',
    gap: 8,
    marginBottom: 16,
  },
  text: {
    flex: 1,
    color: '#CC5500',
    fontSize: 14,
    fontWeight: '700',
  },
});
