import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  Alert,
  ScrollView
} from 'react-native';
import { MapPin, Calendar, Euro, Star, Filter } from 'lucide-react-native';
import { MapEvent, Event } from '@/types/event';
import { mockEvents } from '@/mocks/events';
import { router } from 'expo-router';

interface EventMapProps {
  events?: Event[];
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  onEventPress?: (eventId: string) => void;
}

const { width, height } = Dimensions.get('window');

const EventMap: React.FC<EventMapProps> = ({
  events = mockEvents,
  userLocation,
  onEventPress
}) => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: userLocation?.latitude || 38.7223,
    longitude: userLocation?.longitude || -9.1393,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1
  });

  const eventsWithCoordinates = events.filter(event => event.coordinates);

  const handleEventPress = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleGoToEvent = () => {
    if (selectedEvent) {
      if (onEventPress) {
        onEventPress(selectedEvent.id);
      } else {
        router.push(`/event/${selectedEvent.id}`);
      }
    }
  };

  const formatPrice = (event: Event) => {
    const minPrice = Math.min(...event.ticketTypes.map(t => t.price));
    return `€${minPrice}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-PT', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      music: '#FF6B6B',
      theater: '#4ECDC4',
      comedy: '#FFE66D',
      dance: '#FF8B94',
      festival: '#95E1D3',
      other: '#A8E6CF'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.webMapContainer}>
          <View style={styles.interactiveMapContainer}>
            <View style={styles.mapHeader}>
              <Text style={styles.mapHeaderTitle}>Mapa Interativo de Eventos</Text>
              <Text style={styles.mapHeaderSubtitle}>
                {eventsWithCoordinates.length} eventos disponíveis
              </Text>
            </View>
            <View style={styles.mapGrid}>
              {eventsWithCoordinates.slice(0, 6).map((event, index) => (
                <TouchableOpacity
                  key={event.id}
                  style={[
                    styles.mapMarker,
                    { 
                      top: `${20 + (index % 3) * 30}%`,
                      left: `${15 + Math.floor(index / 3) * 40}%`
                    }
                  ]}
                  onPress={() => handleEventPress(event)}
                >
                  <View style={styles.markerPin}>
                    <MapPin size={24} color="#fff" fill="#0099a8" />
                  </View>
                  <View style={styles.markerLabel}>
                    <Text style={styles.markerText} numberOfLines={1}>
                      {event.title}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <ScrollView style={styles.eventsList} showsVerticalScrollIndicator={false}>
            <View style={styles.eventsListHeader}>
              <Text style={styles.eventsListTitle}>Eventos Próximos</Text>
              <TouchableOpacity style={styles.filterButton}>
                <Filter size={16} color="#0099a8" />
              </TouchableOpacity>
            </View>
            {eventsWithCoordinates.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                onPress={() => handleEventPress(event)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: event.image }} style={styles.eventImage} />
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle} numberOfLines={1}>
                    {event.title}
                  </Text>
                  <View style={styles.eventDetails}>
                    <View style={styles.eventDetail}>
                      <MapPin size={12} color="#666" />
                      <Text style={styles.eventDetailText}>{event.venue.name}</Text>
                    </View>
                    <View style={styles.eventDetail}>
                      <Calendar size={12} color="#666" />
                      <Text style={styles.eventDetailText}>
                        {formatDate(event.date)}
                      </Text>
                    </View>
                    <View style={styles.eventDetail}>
                      <Euro size={12} color="#666" />
                      <Text style={styles.eventDetailText}>
                        {formatPrice(event)}
                      </Text>
                    </View>
                  </View>
                </View>
                <View 
                  style={[
                    styles.categoryIndicator,
                    { backgroundColor: getCategoryColor(event.category) }
                  ]} 
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {selectedEvent && (
          <View style={styles.selectedEventCard}>
            <Image 
              source={{ uri: selectedEvent.image }} 
              style={styles.selectedEventImage} 
            />
            <View style={styles.selectedEventInfo}>
              <Text style={styles.selectedEventTitle}>
                {selectedEvent.title}
              </Text>
              <Text style={styles.selectedEventVenue}>
                {selectedEvent.venue.name}
              </Text>
              <Text style={styles.selectedEventDate}>
                {formatDate(selectedEvent.date)}
              </Text>
              <View style={styles.selectedEventActions}>
                <TouchableOpacity 
                  style={styles.goToEventButton}
                  onPress={handleGoToEvent}
                >
                  <Text style={styles.goToEventButtonText}>Ver Evento</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setSelectedEvent(null)}
                >
                  <Text style={styles.closeButtonText}>Fechar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.mobileMapContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.interactiveMapContainer}>
          <View style={styles.mapHeader}>
            <Text style={styles.mapHeaderTitle}>Mapa Interativo de Eventos</Text>
            <Text style={styles.mapHeaderSubtitle}>
              {eventsWithCoordinates.length} eventos disponíveis
            </Text>
          </View>
          <View style={styles.mapGrid}>
            {eventsWithCoordinates.slice(0, 6).map((event, index) => (
              <TouchableOpacity
                key={event.id}
                style={[
                  styles.mapMarker,
                  { 
                    top: `${20 + (index % 3) * 25}%`,
                    left: `${15 + Math.floor(index / 3) * 40}%`
                  }
                ]}
                onPress={() => {
                  if (onEventPress) {
                    onEventPress(event.id);
                  } else {
                    router.push(`/event/${event.id}`);
                  }
                }}
              >
                <View style={styles.markerPin}>
                  <MapPin size={20} color="#fff" fill="#0099a8" />
                </View>
                <View style={styles.markerLabel}>
                  <Text style={styles.markerText} numberOfLines={1}>
                    {event.title}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.mobileEventsSection}>
          <View style={styles.eventsListHeader}>
            <Text style={styles.eventsListTitle}>Eventos Próximos</Text>
            <TouchableOpacity style={styles.filterButton}>
              <Filter size={16} color="#0099a8" />
            </TouchableOpacity>
          </View>
          
          {eventsWithCoordinates.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.mobileEventCard}
              onPress={() => {
                if (onEventPress) {
                  onEventPress(event.id);
                } else {
                  router.push(`/event/${event.id}`);
                }
              }}
              activeOpacity={0.8}
            >
              <Image source={{ uri: event.image }} style={styles.mobileEventImage} />
              <View style={styles.mobileEventInfo}>
                <Text style={styles.mobileEventTitle} numberOfLines={1}>
                  {event.title}
                </Text>
                <Text style={styles.mobileEventVenue} numberOfLines={1}>
                  {event.venue.name}
                </Text>
                <View style={styles.mobileEventFooter}>
                  <Text style={styles.mobileEventPrice}>
                    {formatPrice(event)}
                  </Text>
                  <Text style={styles.mobileEventDate}>
                    {formatDate(event.date)}
                  </Text>
                </View>
              </View>
              {event.isFeatured && (
                <View style={styles.featuredBadge}>
                  <Star size={12} color="#FFD700" fill="#FFD700" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  webMapContainer: {
    flex: 1,
    flexDirection: 'row'
  },
  mobileMapContainer: {
    flex: 1
  },
  interactiveMapContainer: {
    flex: Platform.OS === 'web' ? 2 : 0,
    backgroundColor: '#F0F9FA',
    margin: 16,
    borderRadius: 16,
    minHeight: Platform.OS === 'web' ? 400 : 300,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    position: 'relative'
  },
  mapHeader: {
    padding: 16,
    backgroundColor: '#0099a8',
    alignItems: 'center'
  },
  mapHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#FFFFFF'
  },
  mapHeaderSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 4,
    opacity: 0.9
  },
  mapGrid: {
    flex: 1,
    position: 'relative',
    minHeight: Platform.OS === 'web' ? 340 : 240
  },
  mapMarker: {
    position: 'absolute',
    alignItems: 'center'
  },
  markerPin: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0099a8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5
  },
  markerLabel: {
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    maxWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3
  },
  markerText: {
    fontSize: 10,
    color: '#0099a8',
    fontWeight: '600' as const,
    textAlign: 'center'
  },
  mapNote: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20
  },
  eventsList: {
    flex: Platform.OS === 'web' ? 1 : 0,
    padding: 16
  },
  mobileEventsSection: {
    padding: 16
  },
  eventsListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  eventsListTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#0099a8'
  },
  filterButton: {
    padding: 8,
    backgroundColor: '#F0F9FA',
    borderRadius: 8
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative'
  },
  eventImage: {
    width: 60,
    height: 60,
    borderRadius: 8
  },
  eventInfo: {
    flex: 1,
    marginLeft: 12
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  eventDetails: {
    gap: 4
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  eventDetailText: {
    fontSize: 12,
    color: '#666'
  },
  categoryIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 4,
    height: '100%',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12
  },
  mobileEventCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative'
  },
  mobileEventImage: {
    width: 50,
    height: 50,
    borderRadius: 8
  },
  mobileEventInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center'
  },
  mobileEventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333'
  },
  mobileEventVenue: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  },
  mobileEventPrice: {
    fontSize: 14,
    color: '#0099a8',
    fontWeight: 'bold' as const
  },
  mobileEventDate: {
    fontSize: 12,
    color: '#666'
  },
  mobileEventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    right: 8
  },
  selectedEventCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    flexDirection: 'row'
  },
  selectedEventImage: {
    width: 80,
    height: 80,
    borderRadius: 12
  },
  selectedEventInfo: {
    flex: 1,
    marginLeft: 16
  },
  selectedEventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  selectedEventVenue: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2
  },
  selectedEventDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12
  },
  selectedEventActions: {
    flexDirection: 'row',
    gap: 8
  },
  goToEventButton: {
    backgroundColor: '#0099a8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1
  },
  goToEventButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center'
  },
  closeButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6'
  },
  closeButtonText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center'
  }
});

export default EventMap;