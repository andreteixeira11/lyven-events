import { Advertisement } from '@/types/event';

export const mockAdvertisements: Advertisement[] = [
  {
    id: 'ad-1',
    title: 'Festival de Verão 2024',
    description: 'O maior festival de música do país está chegando! Não perca!',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
    targetUrl: 'https://example.com/festival-verao',
    type: 'banner',
    position: 'home_top',
    isActive: true,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    impressions: 15420,
    clicks: 892,
    budget: 2500,
    targetAudience: {
      interests: ['music', 'festival'],
      ageRange: { min: 18, max: 35 },
      location: 'Lisboa'
    }
  },
  {
    id: 'ad-2',
    title: 'Concerto Especial',
    description: 'Uma noite única com os melhores artistas nacionais',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&h=300&fit=crop',
    targetUrl: 'https://example.com/concerto-especial',
    type: 'card',
    position: 'home_middle',
    isActive: true,
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-06-30'),
    impressions: 8750,
    clicks: 456,
    budget: 1200,
    targetAudience: {
      interests: ['music', 'concert'],
      ageRange: { min: 25, max: 50 }
    }
  },
  {
    id: 'ad-3',
    title: 'Teatro Nacional',
    description: 'Espetáculo imperdível no Teatro Nacional',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=300&fit=crop',
    targetUrl: 'https://example.com/teatro-nacional',
    type: 'sponsored_event',
    position: 'search_results',
    isActive: true,
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-05-31'),
    impressions: 5230,
    clicks: 287,
    budget: 800,
    targetAudience: {
      interests: ['theater', 'culture'],
      ageRange: { min: 30, max: 65 }
    }
  }
];

export const getActiveAdvertisements = (position?: Advertisement['position']): Advertisement[] => {
  return mockAdvertisements.filter(ad => {
    const isActive = ad.isActive && new Date() >= ad.startDate && new Date() <= ad.endDate;
    return position ? isActive && ad.position === position : isActive;
  });
};

export const getAdvertisementById = (id: string): Advertisement | undefined => {
  return mockAdvertisements.find(ad => ad.id === id);
};