import { User, OnboardingStep } from '@/types/user';

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'userType',
    title: 'Bem-vindo',
    description: 'Vamos configurar a sua conta',
    component: 'userType',
    isRequired: true,
  },
  {
    id: 'phone',
    title: 'Número de Telemóvel',
    description: 'Adicione o seu contacto para maior segurança',
    component: 'phone',
    isRequired: false,
  },
  {
    id: 'interests',
    title: 'Interesses',
    description: 'Selecione os tipos de eventos que mais lhe interessam',
    component: 'interests',
    isRequired: true,
  },
  {
    id: 'location',
    title: 'Localização',
    description: 'Permita-nos mostrar eventos perto de si',
    component: 'location',
    isRequired: false,
  },
  {
    id: 'preferences',
    title: 'Preferências',
    description: 'Configure as suas preferências de notificações e orçamento',
    component: 'preferences',
    isRequired: true,
  },
];

export const EVENT_CATEGORIES = [
  'Música',
  'Teatro',
  'Dança',
  'Comédia',
  'Desporto',
  'Conferências',
  'Workshops',
  'Festivais',
  'Arte',
  'Cinema',
  'Gastronomia',
  'Tecnologia',
];

export const MUSIC_GENRES = [
  'Rock',
  'Pop',
  'Hip-Hop',
  'Electrónica',
  'Jazz',
  'Clássica',
  'Reggae',
  'Folk',
  'Blues',
  'Country',
  'Funk',
  'R&B',
];

export const PRICE_RANGES = [
  { label: 'Gratuito', min: 0, max: 0 },
  { label: 'Até €20', min: 0, max: 20 },
  { label: '€20 - €50', min: 20, max: 50 },
  { label: '€50 - €100', min: 50, max: 100 },
  { label: 'Mais de €100', min: 100, max: 1000 },
];

export const createDefaultUser = (email: string, name: string): Partial<User> => ({
  email,
  name,
  userType: 'normal',
  interests: [],
  preferences: {
    notifications: true,
    language: 'pt',
    priceRange: { min: 0, max: 100 },
    eventTypes: [],
  },
  following: {
    promoters: [],
    artists: [],
    friends: [],
  },
  favoriteEvents: [],
  eventHistory: [],
  isOnboardingComplete: false,
});