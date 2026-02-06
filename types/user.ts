export type UserType = 'normal' | 'promoter' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  userType: UserType;
  interests: string[];
  location?: {
    latitude: number;
    longitude: number;
    city: string;
    region: string;
  };
  preferences: {
    notifications: boolean;
    language: 'pt' | 'en' | 'es' | 'fr' | 'de' | 'it' | 'nl' | 'pl' | 'ru' | 'zh' | 'ja' | 'ko' | 'ar' | 'hi';
    priceRange: {
      min: number;
      max: number;
    };
    eventTypes: string[];
  };
  following: {
    promoters: string[];
    artists: string[];
    friends: string[];
  };
  favoriteEvents: string[];
  eventHistory: string[];
  createdAt: string;
  isOnboardingComplete: boolean;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: 'interests' | 'location' | 'preferences' | 'userType' | 'phone';
  isRequired: boolean;
}

export interface PromoterProfile {
  id?: string;
  userId: string;
  companyName: string;
  description: string;
  website?: string;
  socialMedia: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  isApproved: boolean;
  approvalDate?: string;
  eventsCreated: string[];
  followers: string[];
  rating: number;
  totalEvents: number;
}