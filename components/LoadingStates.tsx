import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@/hooks/theme-context';
import { RefreshCw } from 'lucide-react-native';

/**
 * Loading spinner component
 */
export function LoadingSpinner({ size = 'large', message }: { size?: 'small' | 'large'; message?: string }) {
  const { colors } = useTheme();
  
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={colors.primary} />
      {message && (
        <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
      )}
    </View>
  );
}

/**
 * Full screen loading overlay
 */
export function LoadingOverlay({ message = 'A carregar...' }: { message?: string }) {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.overlay, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.message, { color: colors.textSecondary, marginTop: 16 }]}>
        {message}
      </Text>
    </View>
  );
}

/**
 * Error state component with retry button
 */
export function ErrorState({ 
  message, 
  onRetry,
  retryLabel = 'Tentar Novamente'
}: { 
  message: string; 
  onRetry?: () => void;
  retryLabel?: string;
}) {
  const { colors } = useTheme();
  
  return (
    <View style={styles.errorContainer}>
      <Text style={[styles.errorTitle, { color: colors.error }]}>Oops!</Text>
      <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
        {message}
      </Text>
      {onRetry && (
        <View style={[styles.retryButton, { backgroundColor: colors.primary }]}>
          <RefreshCw size={16} color={colors.white} />
          <Text style={[styles.retryButtonText, { color: colors.white }]}>
            {retryLabel}
          </Text>
        </View>
      )}
    </View>
  );
}

/**
 * Empty state component
 */
export function EmptyState({ 
  icon: Icon,
  title, 
  message,
  actionLabel,
  onAction
}: { 
  icon?: React.ComponentType<{ size: number; color: string }>;
  title: string; 
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const { colors } = useTheme();
  
  return (
    <View style={styles.emptyContainer}>
      {Icon && <Icon size={64} color={colors.textSecondary} />}
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text>
      {message && (
        <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
          {message}
        </Text>
      )}
      {onAction && actionLabel && (
        <View style={[styles.actionButton, { backgroundColor: colors.primary }]}>
          <Text style={[styles.actionButtonText, { color: colors.white }]}>
            {actionLabel}
          </Text>
        </View>
      )}
    </View>
  );
}

/**
 * Skeleton loader for event cards
 */
export function EventCardSkeleton() {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.skeletonCard, { backgroundColor: colors.card }]}>
      <View style={[styles.skeletonImage, { backgroundColor: colors.border }]} />
      <View style={styles.skeletonContent}>
        <View style={[styles.skeletonLine, { backgroundColor: colors.border }]} />
        <View style={[styles.skeletonLineShort, { backgroundColor: colors.border }]} />
        <View style={[styles.skeletonLineShort, { backgroundColor: colors.border }]} />
      </View>
    </View>
  );
}

/**
 * Skeleton loader for event list items
 */
export function EventListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.skeletonListItem}>
          <EventCardSkeleton />
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  skeletonCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  skeletonImage: {
    width: '100%',
    height: 140,
    borderRadius: 12,
  },
  skeletonContent: {
    padding: 12,
  },
  skeletonLine: {
    height: 16,
    borderRadius: 4,
    marginBottom: 8,
    width: '80%',
  },
  skeletonLineShort: {
    height: 12,
    borderRadius: 4,
    marginBottom: 6,
    width: '60%',
  },
  skeletonListItem: {
    marginBottom: 12,
  },
});
