export interface Artist {
  id: string;
  name: string;
  genre: string;
  image: string;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  capacity: number;
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  available: number;
  description?: string;
  maxPerPerson: number;
}

export interface Event {
  id: string;
  title: string;
  artists: Artist[];
  venue: Venue;
  date: Date;
  endDate?: Date;
  image: string;
  description: string;
  category: EventCategory;
  ticketTypes: TicketType[];
  isSoldOut: boolean;
  isFeatured: boolean;
  duration?: number;
  promoter: Promoter;
  tags: string[];
  socialLinks?: SocialLinks;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export type EventCategory = 'music' | 'theater' | 'comedy' | 'dance' | 'festival' | 'other';

export interface CartItem {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  price: number;
  eventTitle?: string;
  eventImage?: string;
  ticketTypeName?: string;
}

export interface PurchasedTicket {
  id: string;
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  purchaseDate: Date;
  qrCode: string;
  addedToCalendar?: boolean;
  reminderSet?: boolean;
}

export interface Promoter {
  id: string;
  name: string;
  image: string;
  description: string;
  verified: boolean;
  followersCount: number;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  website?: string;
}

export interface EventFilters {
  category?: EventCategory;
  priceRange?: {
    min: number;
    max: number;
  };
  dateRange?: {
    start: Date;
    end: Date;
  };
  location?: string;
  radius?: number;
}

export interface FavoriteEvent {
  eventId: string;
  addedAt: Date;
}

export interface EventReminder {
  eventId: string;
  reminderDate: Date;
  type: 'push' | 'email';
}

export interface CalendarEvent {
  eventId: string;
  addedAt: Date;
  calendarId?: string;
}

export interface EventShare {
  eventId: string;
  platform: 'facebook' | 'instagram' | 'whatsapp' | 'twitter' | 'copy';
  sharedAt: Date;
}

export interface EventInvite {
  id: string;
  eventId: string;
  fromUserId: string;
  toUserId: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
  sentAt: Date;
}

export interface EventAttendance {
  eventId: string;
  userId: string;
  status: 'going' | 'interested' | 'not_going';
  addedAt: Date;
}

export interface EventSuggestion {
  eventId: string;
  score: number;
  reasons: string[];
  basedOn: 'interests' | 'location' | 'history' | 'friends' | 'promoters';
}

export interface QRTicket {
  id: string;
  eventId: string;
  ticketTypeId: string;
  userId: string;
  qrCode: string;
  isUsed: boolean;
  purchaseDate: Date;
  validUntil: Date;
}

export interface EventStatistics {
  eventId: string;
  totalTicketsSold: number;
  totalRevenue: number;
  ticketTypeStats: {
    ticketTypeId: string;
    sold: number;
    revenue: number;
    percentage: number;
  }[];
  dailySales: {
    date: string;
    tickets: number;
    revenue: number;
  }[];
  lastUpdated: Date;
}

export interface PromoterEvent {
  id: string;
  title: string;
  date: Date;
  venue: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  ticketsSold: number;
  totalTickets: number;
  revenue: number;
  image: string;
}

export interface Advertisement {
  id: string;
  title: string;
  description: string;
  image: string;
  targetUrl?: string;
  type: 'banner' | 'card' | 'sponsored_event';
  position: 'home_top' | 'home_middle' | 'search_results' | 'event_detail';
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  impressions: number;
  clicks: number;
  budget: number;
  targetAudience?: {
    interests: string[];
    ageRange?: {
      min: number;
      max: number;
    };
    location?: string;
  };
}

export interface MapEvent {
  id: string;
  title: string;
  venue: string;
  date: Date;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  category: EventCategory;
  price: number;
  image: string;
  isFeatured: boolean;
}