import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import DatePicker from '@/components/DatePicker';
import TimePicker from '@/components/TimePicker';

interface DateTimeStepProps {
  date: Date;
  time?: Date;
  onDateChange: (date: Date) => void;
  onTimeChange: (time: Date) => void;
}

export default function DateTimeStep({
  date,
  time,
  onDateChange,
  onTimeChange,
}: DateTimeStepProps) {

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Data e Hora</Text>
      <Text style={styles.subtitle}>
        Quando será o seu evento?
      </Text>

      <View style={styles.inputContainer}>
        <DatePicker
          label="Data do Evento *"
          date={date}
          onDateChange={onDateChange}
          minimumDate={new Date()}
        />
      </View>

      {time && (
        <View style={styles.inputContainer}>
          <TimePicker
            label="Hora do Evento"
            time={time}
            onTimeChange={onTimeChange}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 24,
  },
});
