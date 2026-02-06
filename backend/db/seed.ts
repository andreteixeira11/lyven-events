import { db } from './index';
import { promoters, events, users, promoterAuth, promoterProfiles, following } from './schema';

const anyDb = db as any;
import { mockEvents } from './seed-data';

export async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  const adminUser = {
    id: 'user-admin-1',
    name: 'Administrador',
    email: 'admin',
    userType: 'admin' as const,
    interests: JSON.stringify([]),
    locationLatitude: null,
    locationLongitude: null,
    locationCity: null,
    locationRegion: null,
    preferencesNotifications: true,
    preferencesLanguage: 'pt' as const,
    preferencesPriceMin: 0,
    preferencesPriceMax: 1000,
    preferencesEventTypes: JSON.stringify([]),
    isOnboardingComplete: true,
  };

  try {
    await anyDb.insert(users).values(adminUser).onConflictDoUpdate({
      target: users.email,
      set: adminUser,
    });
    console.log('✅ Admin user created/updated:', adminUser.email);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }

  try {
    const authResult = await anyDb.insert(promoterAuth).values({
      id: 'auth-admin-1',
      email: 'admin',
      password: 'Lyven12345678',
      userId: adminUser.id,
    }).onConflictDoUpdate({
      target: promoterAuth.email,
      set: {
        password: 'Lyven12345678',
        userId: adminUser.id,
      },
    });
    console.log('✅ Admin auth created/updated - Username: admin, Password: Lyven12345678');
    console.log('📋 Auth result:', authResult);
  } catch (error) {
    console.error('❌ Error creating admin auth:', error);
    console.error('❌ Error details:', error);
  }

  const testPromoterUser = {
    id: 'user-promoter-teste',
    name: 'Promotor Teste',
    email: 'teste',
    userType: 'promoter' as const,
    interests: JSON.stringify(['music', 'festivals']),
    locationLatitude: 38.7223,
    locationLongitude: -9.1393,
    locationCity: 'Lisboa',
    locationRegion: 'Lisboa',
    preferencesNotifications: true,
    preferencesLanguage: 'pt' as const,
    preferencesPriceMin: 0,
    preferencesPriceMax: 1000,
    preferencesEventTypes: JSON.stringify(['music', 'festivals']),
    isOnboardingComplete: true,
  };

  try {
    await anyDb.insert(users).values(testPromoterUser).onConflictDoUpdate({
      target: users.email,
      set: testPromoterUser,
    });
    console.log('✅ Test promoter user created/updated:', testPromoterUser.email);
  } catch (error) {
    console.error('❌ Error creating test promoter user:', error);
  }

  try {
    await anyDb.insert(promoterAuth).values({
      id: 'auth-promoter-teste',
      email: 'teste',
      password: 'teste',
      userId: testPromoterUser.id,
    }).onConflictDoUpdate({
      target: promoterAuth.email,
      set: {
        password: 'teste',
        userId: testPromoterUser.id,
      },
    });
    console.log('✅ Test promoter auth created/updated - Email: teste, Password: teste');
  } catch (error) {
    console.error('❌ Error creating test promoter auth:', error);
  }

  try {
    await anyDb.insert(promoterProfiles).values({
      id: 'profile-promoter-teste',
      userId: testPromoterUser.id,
      companyName: 'Teste Events',
      description: 'Promotora de eventos teste',
      website: 'https://teste.com',
      isApproved: true,
      approvalDate: new Date().toISOString(),
    }).onConflictDoUpdate({
      target: promoterProfiles.userId,
      set: {
        companyName: 'Teste Events',
        description: 'Promotora de eventos teste',
        website: 'https://teste.com',
        isApproved: true,
        approvalDate: new Date().toISOString(),
      },
    });
    console.log('✅ Test promoter profile created/updated');
  } catch (error) {
    console.error('❌ Error creating test promoter profile:', error);
  }

  try {
    await anyDb.insert(promoters).values({
      id: 'profile-promoter-teste',
      name: 'Teste Events',
      image: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400',
      description: 'Promotora de eventos teste',
      verified: true,
      followersCount: 0,
    }).onConflictDoNothing();
    console.log('✅ Test promoter (promoters table) created for profile-promoter-teste');
  } catch (error) {
    console.error('❌ Error creating test promoter row:', error);
  }

  const promoterData = [
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
      image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400',
      description: 'Festivais e concertos únicos',
      verified: true,
      followersCount: 85000
    },
    {
      id: 'p3',
      name: 'Teatro Nacional',
      image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=400',
      description: 'Espetáculos de teatro e dança',
      verified: true,
      followersCount: 45000
    },
    {
      id: 'p4',
      name: 'Comedy Club Lisboa',
      image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=400',
      description: 'O melhor da comédia portuguesa',
      verified: false,
      followersCount: 12000
    },
    {
      id: 'p5',
      name: 'Porto Music Events',
      image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400',
      description: 'Organizadora de eventos musicais no Porto',
      verified: true,
      followersCount: 52000
    },
    {
      id: 'p6',
      name: 'Algarve Summer Fest',
      image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400',
      description: 'Festivais de verão no Algarve',
      verified: true,
      followersCount: 38000
    }
  ];

  for (const promoter of promoterData) {
    await anyDb.insert(promoters).values(promoter).onConflictDoNothing();
  }
  console.log('✅ Promoters seeded');

  for (const event of mockEvents) {
    await anyDb.insert(events).values({
      id: event.id,
      title: event.title,
      artists: JSON.stringify(event.artists),
      venueName: event.venue.name,
      venueAddress: event.venue.address,
      venueCity: event.venue.city,
      venueCapacity: event.venue.capacity,
      date: event.date.toISOString(),
      endDate: event.endDate?.toISOString(),
      image: event.image,
      description: event.description,
      category: event.category,
      ticketTypes: JSON.stringify(event.ticketTypes),
      isSoldOut: event.isSoldOut,
      isFeatured: event.isFeatured,
      duration: event.duration,
      promoterId: event.promoter.id,
      tags: JSON.stringify(event.tags),
      instagramLink: event.socialLinks?.instagram,
      facebookLink: event.socialLinks?.facebook,
      twitterLink: event.socialLinks?.twitter,
      websiteLink: event.socialLinks?.website,
      latitude: event.coordinates?.latitude,
      longitude: event.coordinates?.longitude,
      status: 'published',
    }).onConflictDoNothing();
  }
  console.log('✅ Events seeded');

  try {
    await anyDb.insert(events).values({
      id: 'event-promoter-teste-1',
      title: 'Arctic Monkeys - Teste Promoter',
      artists: JSON.stringify([{ id: 'a1', name: 'Arctic Monkeys', genre: 'Rock', image: 'https://via.placeholder.com/100' }]),
      venueName: 'Coliseu dos Recreios',
      venueAddress: 'R. Portas de Santo Antão, 1150-268 Lisboa',
      venueCity: 'Lisboa',
      venueCapacity: 1500,
      date: new Date('2026-06-15T21:00:00').toISOString(),
      image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
      description: 'Show da banda britânica Arctic Monkeys em Lisboa (evento teste promotor)',
      category: 'music',
      ticketTypes: JSON.stringify([{ id: '1', name: 'Geral', price: 39, available: 250, maxPerPerson: 4 }]),
      isSoldOut: false,
      isFeatured: false,
      promoterId: 'profile-promoter-teste',
      tags: JSON.stringify(['música', 'rock']),
      status: 'published',
    }).onConflictDoNothing();
    console.log('✅ Test promoter event created (event-promoter-teste-1)');
  } catch (error) {
    console.error('❌ Error creating test promoter event:', error);
  }

  const demoEvents = [
    {
      id: 'demo-1',
      title: 'Arctic Monkeys',
      artists: JSON.stringify([{ id: 'artist-1', name: 'Arctic Monkeys', genre: 'Rock', image: 'https://via.placeholder.com/100' }]),
      venueName: 'Coliseu dos Recreios',
      venueAddress: 'R. Portas de Santo Antão, 1150-268 Lisboa',
      venueCity: 'Lisboa',
      venueCapacity: 1500,
      date: new Date('2025-11-15T21:00:00').toISOString(),
      endDate: null,
      image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
      description: 'Show da banda britânica Arctic Monkeys em Lisboa',
      category: 'music' as const,
      ticketTypes: JSON.stringify([{ id: '1', name: 'Geral', price: 39, available: 250, maxPerPerson: 4 }]),
      isSoldOut: false,
      isFeatured: true,
      duration: 180,
      promoterId: 'p1',
      tags: JSON.stringify(['música', 'rock']),
      instagramLink: null,
      facebookLink: null,
      twitterLink: null,
      websiteLink: null,
      latitude: 38.7223,
      longitude: -9.1393,
      status: 'published' as const,
    },
    {
      id: 'demo-2',
      title: 'Festival NOS Alive 2025',
      artists: JSON.stringify([]),
      venueName: 'Passeio Marítimo de Algés',
      venueAddress: 'Passeio Marítimo de Algés, 1495-165 Algés',
      venueCity: 'Algés',
      venueCapacity: 55000,
      date: new Date('2025-12-10T16:00:00').toISOString(),
      endDate: null,
      image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
      description: 'O maior festival de música do verão',
      category: 'festival' as const,
      ticketTypes: JSON.stringify([{ id: '1', name: 'Geral', price: 90, available: 40000, maxPerPerson: 6 }]),
      isSoldOut: false,
      isFeatured: true,
      duration: 720,
      promoterId: 'p1',
      tags: JSON.stringify(['festival', 'música', 'verão']),
      instagramLink: null,
      facebookLink: null,
      twitterLink: null,
      websiteLink: null,
      latitude: 38.6931,
      longitude: -9.2369,
      status: 'published' as const,
    },
    {
      id: 'demo-3',
      title: 'Concerto na MEO Arena',
      artists: JSON.stringify([]),
      venueName: 'MEO Arena',
      venueAddress: 'Rossio dos Olivais, 1990-231 Lisboa',
      venueCity: 'Lisboa',
      venueCapacity: 12000,
      date: new Date('2026-01-20T20:00:00').toISOString(),
      endDate: null,
      image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800',
      description: 'Grande evento musical na MEO Arena',
      category: 'music' as const,
      ticketTypes: JSON.stringify([{ id: '1', name: 'Geral', price: 45, available: 12000, maxPerPerson: 4 }]),
      isSoldOut: false,
      isFeatured: false,
      duration: 150,
      promoterId: 'p1',
      tags: JSON.stringify(['música', 'concerto']),
      instagramLink: null,
      facebookLink: null,
      twitterLink: null,
      websiteLink: null,
      latitude: 38.7684,
      longitude: -9.0937,
      status: 'published' as const,
    },
    {
      id: 'demo-4',
      title: 'Dua Lipa ao Vivo',
      artists: JSON.stringify([{ id: 'artist-2', name: 'Dua Lipa', genre: 'Pop', image: 'https://via.placeholder.com/100' }]),
      venueName: 'Altice Arena',
      venueAddress: 'Rossio dos Olivais, 1990-231 Lisboa',
      venueCity: 'Lisboa',
      venueCapacity: 20000,
      date: new Date('2025-12-05T21:30:00').toISOString(),
      endDate: null,
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
      description: 'Show espetacular da Dua Lipa na Altice Arena',
      category: 'music' as const,
      ticketTypes: JSON.stringify([{ id: '1', name: 'Geral', price: 55, available: 18000, maxPerPerson: 4 }, { id: '2', name: 'VIP', price: 120, available: 500, maxPerPerson: 2 }]),
      isSoldOut: false,
      isFeatured: true,
      duration: 150,
      promoterId: 'p2',
      tags: JSON.stringify(['música', 'pop', 'internacional']),
      instagramLink: null,
      facebookLink: null,
      twitterLink: null,
      websiteLink: null,
      latitude: 38.7684,
      longitude: -9.0937,
      status: 'published' as const,
    },
    {
      id: 'demo-5',
      title: 'Stand-Up Comedy Night',
      artists: JSON.stringify([{ id: 'artist-3', name: 'Ricardo Araújo Pereira', genre: 'Comedy', image: 'https://via.placeholder.com/100' }]),
      venueName: 'Casino Lisboa',
      venueAddress: 'Parque das Nações, 1990-231 Lisboa',
      venueCity: 'Lisboa',
      venueCapacity: 800,
      date: new Date('2025-11-20T22:00:00').toISOString(),
      endDate: null,
      image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800',
      description: 'Noite de comédia com os melhores humoristas portugueses',
      category: 'comedy' as const,
      ticketTypes: JSON.stringify([{ id: '1', name: 'Geral', price: 25, available: 700, maxPerPerson: 4 }]),
      isSoldOut: false,
      isFeatured: false,
      duration: 120,
      promoterId: 'p4',
      tags: JSON.stringify(['comédia', 'stand-up']),
      instagramLink: null,
      facebookLink: null,
      twitterLink: null,
      websiteLink: null,
      latitude: 38.7682,
      longitude: -9.0943,
      status: 'published' as const,
    },
    {
      id: 'demo-6',
      title: 'Festival de Jazz no Porto',
      artists: JSON.stringify([]),
      venueName: 'Casa da Música',
      venueAddress: 'Av. da Boavista 604-610, 4149-071 Porto',
      venueCity: 'Porto',
      venueCapacity: 3000,
      date: new Date('2025-11-25T19:00:00').toISOString(),
      endDate: new Date('2025-11-28T23:00:00').toISOString(),
      image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800',
      description: 'Festival internacional de jazz com artistas de renome mundial',
      category: 'festival' as const,
      ticketTypes: JSON.stringify([{ id: '1', name: 'Passe 3 dias', price: 75, available: 2500, maxPerPerson: 4 }, { id: '2', name: 'Dia único', price: 30, available: 1000, maxPerPerson: 4 }]),
      isSoldOut: false,
      isFeatured: true,
      duration: 240,
      promoterId: 'p5',
      tags: JSON.stringify(['jazz', 'festival', 'internacional']),
      instagramLink: null,
      facebookLink: null,
      twitterLink: null,
      websiteLink: null,
      latitude: 41.1579,
      longitude: -8.6291,
      status: 'published' as const,
    },
    {
      id: 'demo-7',
      title: 'Sunset Sessions Algarve',
      artists: JSON.stringify([]),
      venueName: 'Praia da Rocha',
      venueAddress: 'Praia da Rocha, 8500-510 Portimão',
      venueCity: 'Portimão',
      venueCapacity: 5000,
      date: new Date('2025-12-15T18:00:00').toISOString(),
      endDate: null,
      image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800',
      description: 'Festival de música eletrônica ao pôr do sol no Algarve',
      category: 'festival' as const,
      ticketTypes: JSON.stringify([{ id: '1', name: 'Early Bird', price: 35, available: 2000, maxPerPerson: 4 }, { id: '2', name: 'Geral', price: 45, available: 2500, maxPerPerson: 4 }]),
      isSoldOut: false,
      isFeatured: true,
      duration: 360,
      promoterId: 'p6',
      tags: JSON.stringify(['eletrônica', 'verão', 'praia']),
      instagramLink: null,
      facebookLink: null,
      twitterLink: null,
      websiteLink: null,
      latitude: 37.1194,
      longitude: -8.5368,
      status: 'published' as const,
    },
    {
      id: 'demo-8',
      title: 'Ballet Clássico: O Lago dos Cisnes',
      artists: JSON.stringify([{ id: 'artist-4', name: 'Companhia Nacional de Bailado', genre: 'Ballet', image: 'https://via.placeholder.com/100' }]),
      venueName: 'Teatro Nacional D. Maria II',
      venueAddress: 'Praça Dom Pedro IV, 1100-200 Lisboa',
      venueCity: 'Lisboa',
      venueCapacity: 650,
      date: new Date('2025-11-30T20:00:00').toISOString(),
      endDate: null,
      image: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800',
      description: 'Apresentação clássica do ballet O Lago dos Cisnes',
      category: 'dance' as const,
      ticketTypes: JSON.stringify([{ id: '1', name: 'Plateia', price: 40, available: 400, maxPerPerson: 4 }, { id: '2', name: 'Balcão', price: 25, available: 200, maxPerPerson: 4 }]),
      isSoldOut: false,
      isFeatured: false,
      duration: 150,
      promoterId: 'p3',
      tags: JSON.stringify(['ballet', 'dança', 'clássico']),
      instagramLink: null,
      facebookLink: null,
      twitterLink: null,
      websiteLink: null,
      latitude: 38.7142,
      longitude: -9.1371,
      status: 'published' as const,
    },
    {
      id: 'demo-9',
      title: 'Rock in Porto 2026',
      artists: JSON.stringify([]),
      venueName: 'Estádio do Dragão',
      venueAddress: 'Via Futebol Clube do Porto, 4350-415 Porto',
      venueCity: 'Porto',
      venueCapacity: 50000,
      date: new Date('2026-01-10T18:00:00').toISOString(),
      endDate: null,
      image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
      description: 'Maior festival de rock do norte de Portugal',
      category: 'festival' as const,
      ticketTypes: JSON.stringify([{ id: '1', name: 'Geral', price: 65, available: 45000, maxPerPerson: 6 }, { id: '2', name: 'Golden Circle', price: 120, available: 3000, maxPerPerson: 4 }]),
      isSoldOut: false,
      isFeatured: true,
      duration: 480,
      promoterId: 'p5',
      tags: JSON.stringify(['rock', 'festival', 'verão']),
      instagramLink: null,
      facebookLink: null,
      twitterLink: null,
      websiteLink: null,
      latitude: 41.1618,
      longitude: -8.5832,
      status: 'published' as const,
    },
    {
      id: 'demo-10',
      title: 'Ed Sheeran World Tour',
      artists: JSON.stringify([{ id: 'artist-5', name: 'Ed Sheeran', genre: 'Pop', image: 'https://via.placeholder.com/100' }]),
      venueName: 'Estádio da Luz',
      venueAddress: 'Av. Eusébio da Silva Ferreira, 1500-313 Lisboa',
      venueCity: 'Lisboa',
      venueCapacity: 65000,
      date: new Date('2026-02-01T21:00:00').toISOString(),
      endDate: null,
      image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
      description: 'Ed Sheeran traz a sua tour mundial a Portugal',
      category: 'music' as const,
      ticketTypes: JSON.stringify([{ id: '1', name: 'Geral', price: 75, available: 55000, maxPerPerson: 4 }, { id: '2', name: 'VIP', price: 180, available: 5000, maxPerPerson: 2 }]),
      isSoldOut: false,
      isFeatured: true,
      duration: 180,
      promoterId: 'p2',
      tags: JSON.stringify(['música', 'pop', 'internacional']),
      instagramLink: null,
      facebookLink: null,
      twitterLink: null,
      websiteLink: null,
      latitude: 38.7528,
      longitude: -9.1845,
      status: 'published' as const,
    },
  ];

  for (const event of demoEvents) {
    await anyDb.insert(events).values(event).onConflictDoNothing();
  }
  console.log('✅ Demo events seeded');

  const testUser = {
    id: 'user-teste-app',
    name: 'João Silva',
    email: 'joao@teste.com',
    userType: 'normal' as const,
    interests: JSON.stringify(['music', 'festivals', 'dance']),
    locationLatitude: 38.7223,
    locationLongitude: -9.1393,
    locationCity: 'Lisboa',
    locationRegion: 'Lisboa',
    preferencesNotifications: true,
    preferencesLanguage: 'pt' as const,
    preferencesPriceMin: 0,
    preferencesPriceMax: 200,
    preferencesEventTypes: JSON.stringify(['music', 'festivals', 'dance']),
    isOnboardingComplete: true,
  };

  try {
    await anyDb.insert(users).values(testUser).onConflictDoUpdate({
      target: users.email,
      set: testUser,
    });
    console.log('✅ Test user created/updated:', testUser.email);
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  }

  const testFollows = [
    {
      id: 'follow-1',
      userId: testUser.id,
      promoterId: 'p1',
      artistId: null,
      friendId: null,
    },
    {
      id: 'follow-2',
      userId: testUser.id,
      promoterId: 'p2',
      artistId: null,
      friendId: null,
    },
    {
      id: 'follow-3',
      userId: testUser.id,
      promoterId: 'p5',
      artistId: null,
      friendId: null,
    },
  ];

  for (const follow of testFollows) {
    try {
      await anyDb.insert(following).values(follow).onConflictDoNothing();
    } catch {
      console.log('Follow já existe ou erro:', follow.id);
    }
  }
  console.log('✅ Test user follows seeded');

  console.log('🎉 Database seeding completed!');
  console.log('\n📝 Test credentials:');
  console.log('Test User: joao@teste.com');
  console.log('This user follows promoters: Live Nation Portugal, Everything is New, Porto Music Events');
}
