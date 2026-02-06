import React from 'react';
import { View, StyleSheet } from 'react-native';
import QRCodeSVG from 'react-native-qrcode-svg';

interface QRCodeProps {
  value: string;
  size?: number;
  backgroundColor?: string;
  foregroundColor?: string;
  ticketType?: string;
  logo?: string;
  enableGradient?: boolean;
}

const ticketColors: Record<string, { primary: string; secondary: string }> = {
  'VIP': { primary: '#FFD700', secondary: '#FFA500' },
  'Premium': { primary: '#C084FC', secondary: '#9333EA' },
  'General Admission': { primary: '#3B82F6', secondary: '#1D4ED8' },
  'Early Bird': { primary: '#10B981', secondary: '#059669' },
  'Student': { primary: '#F59E0B', secondary: '#D97706' },
  'default': { primary: '#000000', secondary: '#1F2937' }
};

export default function QRCode({ 
  value, 
  size = 120, 
  backgroundColor = '#FFFFFF',
  foregroundColor,
  ticketType = 'default',
  logo,
  enableGradient = true
}: QRCodeProps) {
  const colors = ticketColors[ticketType] || ticketColors.default;
  const qrColor = foregroundColor || colors.primary;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.qrWrapper}>
        <QRCodeSVG
          value={value}
          size={size}
          color={qrColor}
          backgroundColor={backgroundColor}
          quietZone={8}
          ecl="M"
          enableLinearGradient={enableGradient}
          linearGradient={enableGradient ? [colors.primary, colors.secondary] : undefined}
          gradientDirection={['0%', '0%', '100%', '100%']}
          logo={logo || 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/rcudplkc4ofu5bj6ow23e'}
          logoSize={size * 0.22}
          logoBackgroundColor="#FFFFFF"
          logoMargin={6}
          logoBorderRadius={size * 0.08}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  qrWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
