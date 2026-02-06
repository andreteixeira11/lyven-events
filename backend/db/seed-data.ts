/**
 * Backend-only seed data. No imports from project root (no @/) so tsx never loads Expo/React Native.
 */

interface SeedEvent {
  id: string;
  title: string;
  artists: { id: string; name: string; genre: string; image: string }[];
  venue: { id?: string; name: string; address: string; city: string; capacity: number };
  date: Date;
  endDate?: Date;
  image: string;
  description: string;
  category: 'music' | 'theater' | 'comedy' | 'dance' | 'festival' | 'other';
  ticketTypes: { id: string; name: string; price: number; available: number; maxPerPerson: number; description?: string }[];
  isSoldOut: boolean;
  isFeatured: boolean;
  duration?: number;
  promoter: { id: string; name: string; image: string; description: string; verified: boolean; followersCount: number };
  tags: string[];
  socialLinks?: { instagram?: string; facebook?: string; twitter?: string; website?: string };
  coordinates?: { latitude: number; longitude: number };
}

export const mockEvents: SeedEvent[] = [
  {
    id: 'demo-1',
    title: 'Arctic Monkeys',
    date: new Date('2025-11-15T21:00:00'),
    category: 'music',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
    venue: { id: 'venue-1', name: 'Coliseu dos Recreios', address: 'R. Portas de Santo Antão, 1150-268 Lisboa', city: 'Lisboa', capacity: 1500 },
    promoter: { id: 'p1', name: 'Live Nation Portugal', image: 'https://via.placeholder.com/100', description: 'Promotora líder', verified: true, followersCount: 125000 },
    description: 'Show da banda britânica Arctic Monkeys em Lisboa',
    ticketTypes: [{ id: '1', name: 'Geral', price: 39, available: 250, maxPerPerson: 4 }],
    isFeatured: false,
    isSoldOut: false,
    artists: [{ id: 'artist-1', name: 'Arctic Monkeys', genre: 'Rock', image: 'https://via.placeholder.com/100' }],
    tags: ['música', 'rock'],
    coordinates: { latitude: 38.7223, longitude: -9.1393 },
  },
  {
    id: 'demo-2',
    title: 'Festival NOS Alive 2025',
    date: new Date('2025-12-10T16:00:00'),
    category: 'festival',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
    venue: { id: 'venue-2', name: 'Passeio Marítimo de Algés', address: 'Passeio Marítimo de Algés, 1495-165 Algés', city: 'Algés', capacity: 55000 },
    promoter: { id: 'p1', name: 'Live Nation Portugal', image: 'https://via.placeholder.com/100', description: 'Promotora líder', verified: true, followersCount: 125000 },
    description: 'O maior festival de música do verão',
    ticketTypes: [{ id: '1', name: 'Geral', price: 90, available: 40000, maxPerPerson: 6 }],
    isFeatured: false,
    isSoldOut: false,
    artists: [],
    tags: ['festival', 'música', 'verão'],
    coordinates: { latitude: 38.6931, longitude: -9.2369 },
  },
  {
    id: 'demo-3',
    title: 'Concerto na MEO Arena',
    date: new Date('2026-01-20T20:00:00'),
    category: 'music',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800',
    venue: { id: 'venue-3', name: 'MEO Arena', address: 'Rossio dos Olivais, 1990-231 Lisboa', city: 'Lisboa', capacity: 12000 },
    promoter: { id: 'p1', name: 'Live Nation Portugal', image: 'https://via.placeholder.com/100', description: 'Promotora líder', verified: true, followersCount: 125000 },
    description: 'Grande evento musical na MEO Arena',
    ticketTypes: [{ id: '1', name: 'Geral', price: 45, available: 12000, maxPerPerson: 4 }],
    isFeatured: false,
    isSoldOut: false,
    artists: [],
    tags: ['música', 'concerto'],
    coordinates: { latitude: 38.7684, longitude: -9.0937 },
  },
  {
    id: '1',
    title: 'Arctic Monkeys',
    artists: [{ id: 'a1', name: 'Arctic Monkeys', genre: 'Indie Rock', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800' }],
    venue: { id: 'v1', name: 'Coliseu dos Recreios', address: 'Rua das Portas de Santo Antão', city: 'Lisboa', capacity: 3000 },
    date: new Date('2025-02-15T21:00:00'),
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
    description: 'Os Arctic Monkeys regressam a Portugal para um concerto único no icónico Coliseu dos Recreios.',
    category: 'music',
    ticketTypes: [
      { id: 't1', name: 'Plateia', price: 45, available: 150, maxPerPerson: 4 },
      { id: 't2', name: 'Balcão 1', price: 35, available: 80, maxPerPerson: 4 },
      { id: 't3', name: 'Balcão 2', price: 25, available: 200, maxPerPerson: 6 },
    ],
    isSoldOut: false,
    isFeatured: true,
    duration: 120,
    promoter: { id: 'p1', name: 'Live Nation Portugal', image: 'https://via.placeholder.com/100', description: 'Promotora líder', verified: true, followersCount: 125000 },
    tags: ['indie rock', 'british', 'alternative'],
    socialLinks: { instagram: 'https://instagram.com/arcticmonkeys', facebook: 'https://facebook.com/arcticmonkeys' },
    coordinates: { latitude: 38.7223, longitude: -9.1393 },
  },
  {
    id: '2',
    title: 'Festival NOS Alive 2025',
    artists: [
      { id: 'a2', name: 'The Weeknd', genre: 'Pop/R&B', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800' },
      { id: 'a3', name: 'Dua Lipa', genre: 'Pop', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800' },
    ],
    venue: { id: 'v2', name: 'Passeio Marítimo de Algés', address: 'Passeio Marítimo de Algés', city: 'Oeiras', capacity: 55000 },
    date: new Date('2025-07-10T16:00:00'),
    endDate: new Date('2025-07-12T23:59:00'),
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
    description: 'O maior festival de verão regressa com um cartaz de luxo.',
    category: 'festival',
    ticketTypes: [{ id: 't4', name: 'Passe 3 Dias', price: 180, available: 500, maxPerPerson: 4 }],
    isSoldOut: false,
    isFeatured: true,
    promoter: { id: 'p1', name: 'Live Nation Portugal', image: 'https://via.placeholder.com/100', description: 'Promotora líder', verified: true, followersCount: 125000 },
    tags: ['festival', 'música', 'verão'],
    coordinates: { latitude: 38.6931, longitude: -9.2369 },
  },
];
