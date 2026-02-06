import { Event, Promoter, Advertisement, EventStatistics } from '@/types/event';

const mockPromoters: Promoter[] = [
  {
    id: 'p1',
    name: 'Live Nation Portugal',
    image: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400',
    description: 'Promotora líder mundial em entretenimento ao vivo',
    verified: true,
    followersCount: 125000
  },
  {
    id: 'p2',
    name: 'Everything is New',
    image: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400',
    description: 'Festivais e concertos únicos',
    verified: true,
    followersCount: 85000
  },
  {
    id: 'p3',
    name: 'Teatro Nacional',
    image: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400',
    description: 'Espetáculos de teatro e dança',
    verified: true,
    followersCount: 45000
  },
  {
    id: 'p4',
    name: 'Comedy Club Lisboa',
    image: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400',
    description: 'O melhor da comédia portuguesa',
    verified: false,
    followersCount: 12000
  }
];

export const mockAdvertisements: Advertisement[] = [
  {
    id: 'ad1',
    title: 'Spotify Premium',
    description: 'Música sem limites. Experimente 3 meses grátis.',
    image: 'https://images.unsplash.com/photo-1611339555312-e607c8352fd7?w=800',
    targetUrl: 'https://spotify.com/premium',
    type: 'banner',
    position: 'home_top',
    isActive: true,
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-12-31'),
    impressions: 125000,
    clicks: 3200,
    budget: 5000,
    targetAudience: {
      interests: ['music', 'festival'],
      ageRange: { min: 18, max: 35 }
    }
  },
  {
    id: 'ad2',
    title: 'MEO Arena - Próximos Eventos',
    description: 'Descubra os melhores espetáculos na MEO Arena',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
    type: 'card',
    position: 'home_middle',
    isActive: true,
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-06-30'),
    impressions: 85000,
    clicks: 2100,
    budget: 3000,
    targetAudience: {
      interests: ['music', 'theater'],
      location: 'Lisboa'
    }
  },
  {
    id: 'ad3',
    title: 'Vodafone - Parceiro Oficial',
    description: 'Descontos exclusivos para clientes Vodafone',
    image: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800',
    type: 'sponsored_event',
    position: 'search_results',
    isActive: true,
    startDate: new Date('2025-02-01'),
    endDate: new Date('2025-08-31'),
    impressions: 45000,
    clicks: 890,
    budget: 2000
  }
];

export const mockEventStatistics: EventStatistics[] = [
  {
    eventId: '1',
    totalTicketsSold: 1250,
    totalRevenue: 48750,
    ticketTypeStats: [
      {
        ticketTypeId: 't1',
        sold: 150,
        revenue: 6750,
        percentage: 100
      },
      {
        ticketTypeId: 't2',
        sold: 80,
        revenue: 2800,
        percentage: 100
      },
      {
        ticketTypeId: 't3',
        sold: 1020,
        revenue: 25500,
        percentage: 84
      }
    ],
    dailySales: [
      { date: '2025-01-15', tickets: 45, revenue: 1575 },
      { date: '2025-01-16', tickets: 78, revenue: 2730 },
      { date: '2025-01-17', tickets: 123, revenue: 4305 },
      { date: '2025-01-18', tickets: 89, revenue: 3115 },
      { date: '2025-01-19', tickets: 156, revenue: 5460 }
    ],
    lastUpdated: new Date()
  }
];

export const mockEvents: Event[] = [
  {
    id: 'demo-1',
    title: 'Arctic Monkeys',
    date: new Date('2025-11-15T21:00:00'),
    category: 'music',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
    venue: {
      id: 'venue-1',
      name: 'Coliseu dos Recreios',
      address: 'R. Portas de Santo Antão, 1150-268 Lisboa',
      city: 'Lisboa',
      capacity: 1500
    },
    promoter: {
      id: 'promoter-demo',
      name: 'Promotor Demo',
      image: 'https://via.placeholder.com/100',
      description: 'Promotor de eventos demo',
      verified: true,
      followersCount: 0
    },
    description: 'Show da banda britânica Arctic Monkeys em Lisboa',
    ticketTypes: [{ id: '1', name: 'Geral', price: 39, available: 250, maxPerPerson: 4 }],
    isFeatured: false,
    isSoldOut: false,
    artists: [{ id: 'artist-1', name: 'Arctic Monkeys', genre: 'Rock', image: 'https://via.placeholder.com/100' }],
    tags: ['música', 'rock'],
    coordinates: { latitude: 38.7223, longitude: -9.1393 }
  },
  {
    id: 'demo-2',
    title: 'Festival NOS Alive 2025',
    date: new Date('2025-12-10T16:00:00'),
    category: 'festival',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
    venue: {
      id: 'venue-2',
      name: 'Passeio Marítimo de Algés',
      address: 'Passeio Marítimo de Algés, 1495-165 Algés',
      city: 'Algés',
      capacity: 55000
    },
    promoter: {
      id: 'promoter-demo',
      name: 'Promotor Demo',
      image: 'https://via.placeholder.com/100',
      description: 'Promotor de eventos demo',
      verified: true,
      followersCount: 0
    },
    description: 'O maior festival de música do verão',
    ticketTypes: [{ id: '1', name: 'Geral', price: 90, available: 40000, maxPerPerson: 6 }],
    isFeatured: false,
    isSoldOut: false,
    artists: [],
    tags: ['festival', 'música', 'verão'],
    coordinates: { latitude: 38.6931, longitude: -9.2369 }
  },
  {
    id: 'demo-3',
    title: 'Concerto na MEO Arena',
    date: new Date('2026-01-20T20:00:00'),
    category: 'music',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800',
    venue: {
      id: 'venue-3',
      name: 'MEO Arena',
      address: 'Rossio dos Olivais, 1990-231 Lisboa',
      city: 'Lisboa',
      capacity: 12000
    },
    promoter: {
      id: 'promoter-demo',
      name: 'Promotor Demo',
      image: 'https://via.placeholder.com/100',
      description: 'Promotor de eventos demo',
      verified: true,
      followersCount: 0
    },
    description: 'Grande evento musical na MEO Arena',
    ticketTypes: [{ id: '1', name: 'Geral', price: 45, available: 12000, maxPerPerson: 4 }],
    isFeatured: false,
    isSoldOut: false,
    artists: [],
    tags: ['música', 'concerto'],
    coordinates: { latitude: 38.7684, longitude: -9.0937 }
  },
  {
    id: '1',
    title: 'Arctic Monkeys',
    artists: [
      {
        id: 'a1',
        name: 'Arctic Monkeys',
        genre: 'Indie Rock',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800'
      }
    ],
    venue: {
      id: 'v1',
      name: 'Coliseu dos Recreios',
      address: 'Rua das Portas de Santo Antão',
      city: 'Lisboa',
      capacity: 3000
    },
    date: new Date('2025-02-15T21:00:00'),
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
    description: 'Os Arctic Monkeys regressam a Portugal para um concerto único no icónico Coliseu dos Recreios. Uma noite inesquecível com os maiores sucessos da banda britânica.',
    category: 'music',
    ticketTypes: [
      {
        id: 't1',
        name: 'Plateia',
        price: 45,
        available: 150,
        description: 'Lugares sentados na plateia',
        maxPerPerson: 4
      },
      {
        id: 't2',
        name: 'Balcão 1',
        price: 35,
        available: 80,
        description: 'Lugares no primeiro balcão',
        maxPerPerson: 4
      },
      {
        id: 't3',
        name: 'Balcão 2',
        price: 25,
        available: 200,
        description: 'Lugares no segundo balcão',
        maxPerPerson: 6
      }
    ],
    isSoldOut: false,
    isFeatured: true,
    duration: 120,
    promoter: mockPromoters[0],
    tags: ['indie rock', 'british', 'alternative'],
    socialLinks: {
      instagram: 'https://instagram.com/arcticmonkeys',
      facebook: 'https://facebook.com/arcticmonkeys'
    },
    coordinates: {
      latitude: 38.7223,
      longitude: -9.1393
    }
  },
  {
    id: '2',
    title: 'Festival NOS Alive 2025',
    artists: [
      {
        id: 'a2',
        name: 'The Weeknd',
        genre: 'Pop/R&B',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800'
      },
      {
        id: 'a3',
        name: 'Dua Lipa',
        genre: 'Pop',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800'
      },
      {
        id: 'a4',
        name: 'Tame Impala',
        genre: 'Psychedelic Rock',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800'
      }
    ],
    venue: {
      id: 'v2',
      name: 'Passeio Marítimo de Algés',
      address: 'Passeio Marítimo de Algés',
      city: 'Oeiras',
      capacity: 55000
    },
    date: new Date('2025-07-10T16:00:00'),
    endDate: new Date('2025-07-12T23:59:00'),
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
    description: 'O maior festival de verão regressa com um cartaz de luxo. 3 dias de música non-stop com os melhores artistas internacionais.',
    category: 'festival',
    ticketTypes: [
      {
        id: 't4',
        name: 'Passe 3 Dias',
        price: 180,
        available: 500,
        description: 'Acesso aos 3 dias do festival',
        maxPerPerson: 4
      },
      {
        id: 't5',
        name: 'Bilhete Diário',
        price: 75,
        available: 1000,
        description: 'Acesso a 1 dia do festival',
        maxPerPerson: 6
      },
      {
        id: 't6',
        name: 'VIP 3 Dias',
        price: 350,
        available: 50,
        description: 'Passe VIP com acesso a áreas exclusivas',
        maxPerPerson: 2
      }
    ],
    isSoldOut: false,
    isFeatured: true,
    duration: 480,
    promoter: mockPromoters[1],
    tags: ['festival', 'summer', 'international'],
    socialLinks: {
      instagram: 'https://instagram.com/nosalive',
      website: 'https://nosalive.com'
    },
    coordinates: {
      latitude: 38.6892,
      longitude: -9.2093
    }
  },
  {
    id: '3',
    title: 'O Fantasma da Ópera',
    artists: [
      {
        id: 'a5',
        name: 'Companhia de Teatro Musical',
        genre: 'Musical',
        image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800'
      }
    ],
    venue: {
      id: 'v3',
      name: 'Teatro Camões',
      address: 'Parque das Nações',
      city: 'Lisboa',
      capacity: 1000
    },
    date: new Date('2025-03-20T21:30:00'),
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    description: 'O musical mais famoso de Andrew Lloyd Webber numa produção espetacular com cenários grandiosos e figurinos deslumbrantes.',
    category: 'theater',
    ticketTypes: [
      {
        id: 't7',
        name: 'Plateia Central',
        price: 60,
        available: 30,
        description: 'Melhores lugares na plateia',
        maxPerPerson: 4
      },
      {
        id: 't8',
        name: 'Plateia Lateral',
        price: 45,
        available: 100,
        description: 'Lugares laterais na plateia',
        maxPerPerson: 4
      },
      {
        id: 't9',
        name: 'Balcão',
        price: 30,
        available: 150,
        description: 'Lugares no balcão',
        maxPerPerson: 6
      }
    ],
    isSoldOut: false,
    isFeatured: false,
    duration: 150,
    promoter: mockPromoters[2],
    tags: ['musical', 'teatro', 'clássico'],
    coordinates: {
      latitude: 38.7223,
      longitude: -9.1393
    }
  },
  {
    id: '4',
    title: 'Stand-up Comedy Night',
    artists: [
      {
        id: 'a6',
        name: 'Ricardo Araújo Pereira',
        genre: 'Comédia',
        image: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=800'
      }
    ],
    venue: {
      id: 'v4',
      name: 'Campo Pequeno',
      address: 'Praça de Touros',
      city: 'Lisboa',
      capacity: 8000
    },
    date: new Date('2025-04-05T22:00:00'),
    image: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=800',
    description: 'Uma noite de gargalhadas com o melhor do humor português. Ricardo Araújo Pereira apresenta o seu novo espetáculo.',
    category: 'comedy',
    ticketTypes: [
      {
        id: 't10',
        name: 'Arena',
        price: 25,
        available: 0,
        description: 'Lugares na arena',
        maxPerPerson: 4
      },
      {
        id: 't11',
        name: 'Bancada',
        price: 20,
        available: 300,
        description: 'Lugares na bancada',
        maxPerPerson: 6
      }
    ],
    isSoldOut: true,
    isFeatured: false,
    duration: 90,
    promoter: mockPromoters[3],
    tags: ['comédia', 'humor', 'português'],
    coordinates: {
      latitude: 38.7436,
      longitude: -9.1456
    }
  },
  {
    id: '5',
    title: 'Ballet Nacional - O Lago dos Cisnes',
    artists: [
      {
        id: 'a7',
        name: 'Companhia Nacional de Bailado',
        genre: 'Ballet',
        image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800'
      }
    ],
    venue: {
      id: 'v5',
      name: 'Teatro São Carlos',
      address: 'Rua Serpa Pinto',
      city: 'Lisboa',
      capacity: 1200
    },
    date: new Date('2025-05-10T20:00:00'),
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800',
    description: 'A obra-prima de Tchaikovsky numa produção clássica com a Companhia Nacional de Bailado. Uma experiência inesquecível.',
    category: 'dance',
    ticketTypes: [
      {
        id: 't12',
        name: 'Camarote',
        price: 85,
        available: 20,
        description: 'Lugares nos camarotes',
        maxPerPerson: 2
      },
      {
        id: 't13',
        name: 'Plateia',
        price: 55,
        available: 200,
        description: 'Lugares na plateia',
        maxPerPerson: 4
      },
      {
        id: 't14',
        name: 'Galeria',
        price: 25,
        available: 100,
        description: 'Lugares na galeria',
        maxPerPerson: 6
      }
    ],
    isSoldOut: false,
    isFeatured: false,
    duration: 120,
    promoter: mockPromoters[2],
    tags: ['ballet', 'clássico', 'dança'],
    coordinates: {
      latitude: 38.7071,
      longitude: -9.1426
    }
  },
  {
    id: '6',
    title: 'Sam Smith - Gloria Tour',
    artists: [
      {
        id: 'a8',
        name: 'Sam Smith',
        genre: 'Pop/Soul',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800'
      }
    ],
    venue: {
      id: 'v6',
      name: 'Altice Arena',
      address: 'Rossio dos Olivais',
      city: 'Lisboa',
      capacity: 20000
    },
    date: new Date('2025-06-22T21:00:00'),
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800',
    description: 'Sam Smith traz a Gloria Tour a Lisboa. Uma noite mágica com os grandes sucessos e as novas músicas do álbum Gloria.',
    category: 'music',
    ticketTypes: [
      {
        id: 't15',
        name: 'Golden Circle',
        price: 95,
        available: 100,
        description: 'Área em frente ao palco',
        maxPerPerson: 2
      },
      {
        id: 't16',
        name: 'Pista',
        price: 65,
        available: 500,
        description: 'Acesso à pista geral',
        maxPerPerson: 4
      },
      {
        id: 't17',
        name: 'Bancada',
        price: 45,
        available: 800,
        description: 'Lugares sentados na bancada',
        maxPerPerson: 6
      }
    ],
    isSoldOut: false,
    isFeatured: true,
    duration: 135,
    promoter: mockPromoters[0],
    tags: ['pop', 'soul', 'international'],
    socialLinks: {
      instagram: 'https://instagram.com/samsmith',
      twitter: 'https://twitter.com/samsmith'
    },
    coordinates: {
      latitude: 38.7681,
      longitude: -9.0947
    }
  }
];

export const getEventStatistics = (eventId: string): EventStatistics | undefined => {
  return mockEventStatistics.find(stat => stat.eventId === eventId);
};

export const getActiveAdvertisements = (position: Advertisement['position']): Advertisement[] => {
  return mockAdvertisements.filter(ad => 
    ad.isActive && 
    ad.position === position &&
    new Date() >= ad.startDate &&
    new Date() <= ad.endDate
  );
};