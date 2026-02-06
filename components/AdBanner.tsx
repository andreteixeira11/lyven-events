import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Platform
} from 'react-native';
import { ExternalLink, X } from 'lucide-react-native';
import { Advertisement } from '@/types/event';

interface AdBannerProps {
  advertisement: Advertisement;
  onClose?: () => void;
  onPress?: (ad: Advertisement) => void;
}

const AdBanner: React.FC<AdBannerProps> = ({
  advertisement,
  onClose,
  onPress
}) => {
  const handlePress = async () => {
    if (onPress) {
      onPress(advertisement);
    }
    
    if (advertisement.targetUrl) {
      try {
        const supported = await Linking.canOpenURL(advertisement.targetUrl);
        if (supported) {
          await Linking.openURL(advertisement.targetUrl);
        }
      } catch (error) {
        console.error('Error opening URL:', error);
      }
    }
  };

  const renderBanner = () => (
    <View style={styles.bannerContainer}>
      <TouchableOpacity 
        style={styles.bannerContent}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Image 
          source={{ uri: advertisement.image }} 
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerTitle}>{advertisement.title}</Text>
          <Text style={styles.bannerDescription}>
            {advertisement.description}
          </Text>
          {advertisement.targetUrl && (
            <View style={styles.bannerAction}>
              <ExternalLink size={16} color="#fff" />
              <Text style={styles.bannerActionText}>Saber mais</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
      {onClose && (
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={onClose}
        >
          <X size={20} color="#fff" />
        </TouchableOpacity>
      )}
      <View style={styles.adLabel}>
        <Text style={styles.adLabelText}>Anúncio</Text>
      </View>
    </View>
  );

  const renderCard = () => (
    <View style={styles.cardContainer}>
      <TouchableOpacity 
        style={styles.cardContent}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <Image 
          source={{ uri: advertisement.image }} 
          style={styles.cardImage}
        />
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{advertisement.title}</Text>
          <Text style={styles.cardDescription} numberOfLines={2}>
            {advertisement.description}
          </Text>
          {advertisement.targetUrl && (
            <View style={styles.cardAction}>
              <ExternalLink size={14} color="#007AFF" />
              <Text style={styles.cardActionText}>Ver mais</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
      {onClose && (
        <TouchableOpacity 
          style={styles.cardCloseButton}
          onPress={onClose}
        >
          <X size={16} color="#666" />
        </TouchableOpacity>
      )}
      <View style={styles.cardAdLabel}>
        <Text style={styles.cardAdLabelText}>Anúncio</Text>
      </View>
    </View>
  );

  const renderSponsoredEvent = () => (
    <View style={styles.sponsoredContainer}>
      <TouchableOpacity 
        style={styles.sponsoredContent}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <Image 
          source={{ uri: advertisement.image }} 
          style={styles.sponsoredImage}
        />
        <View style={styles.sponsoredInfo}>
          <View style={styles.sponsoredHeader}>
            <Text style={styles.sponsoredTitle}>{advertisement.title}</Text>
            <View style={styles.sponsoredBadge}>
              <Text style={styles.sponsoredBadgeText}>Patrocinado</Text>
            </View>
          </View>
          <Text style={styles.sponsoredDescription} numberOfLines={2}>
            {advertisement.description}
          </Text>
        </View>
      </TouchableOpacity>
      {onClose && (
        <TouchableOpacity 
          style={styles.sponsoredCloseButton}
          onPress={onClose}
        >
          <X size={16} color="#666" />
        </TouchableOpacity>
      )}
    </View>
  );

  switch (advertisement.type) {
    case 'banner':
      return renderBanner();
    case 'card':
      return renderCard();
    case 'sponsored_event':
      return renderSponsoredEvent();
    default:
      return renderCard();
  }
};

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'relative',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    height: 120
  },
  bannerContent: {
    flex: 1,
    position: 'relative'
  },
  bannerImage: {
    width: '100%',
    height: '100%'
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 12
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4
  },
  bannerDescription: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 8
  },
  bannerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  bannerActionText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500'
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center'
  },
  adLabel: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  adLabelText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '500'
  },
  cardContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative'
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 8
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center'
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20
  },
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  cardActionText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500'
  },
  cardCloseButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardAdLabel: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#dee2e6'
  },
  cardAdLabelText: {
    fontSize: 9,
    color: '#666',
    fontWeight: '500'
  },
  sponsoredContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e3f2fd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative'
  },
  sponsoredContent: {
    flexDirection: 'row',
    padding: 12
  },
  sponsoredImage: {
    width: 60,
    height: 60,
    borderRadius: 8
  },
  sponsoredInfo: {
    flex: 1,
    marginLeft: 12
  },
  sponsoredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  sponsoredTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1
  },
  sponsoredBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8
  },
  sponsoredBadgeText: {
    fontSize: 9,
    color: '#1976d2',
    fontWeight: '500'
  },
  sponsoredDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16
  },
  sponsoredCloseButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default AdBanner;