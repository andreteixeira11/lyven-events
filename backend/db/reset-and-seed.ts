import Database from 'better-sqlite3';
import { db } from './index';
import { users, promoterAuth, promoterProfiles } from './schema';

const anyDb = db as any;

console.log('🔄 Resetting database...');

const sqlite = new Database('events.db');

console.log('🗑️  Dropping promoter_auth table...');
sqlite.exec('DROP TABLE IF EXISTS promoter_auth;');

console.log('🆕 Creating promoter_auth table...');
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS promoter_auth (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log('✅ Tables reset successfully!');
sqlite.close();

console.log('🌱 Seeding database...');

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

async function seed() {
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

  console.log('\n📋 Verificando dados na base de dados:');
  
  const sqliteCheck = new Database('events.db');
  
  const authRecords = sqliteCheck.prepare('SELECT * FROM promoter_auth WHERE email = ?').all('teste');
  console.log('Registos em promoter_auth:', authRecords);
  
  const userRecords = sqliteCheck.prepare('SELECT * FROM users WHERE email = ?').all('teste');
  console.log('Registos em users:', userRecords);
  
  const profileRecords = sqliteCheck.prepare('SELECT * FROM promoter_profiles WHERE user_id = ?').all(testPromoterUser.id);
  console.log('Registos em promoter_profiles:', profileRecords);
  
  sqliteCheck.close();

  console.log('\n🎉 Database reset and seeding completed!');
  console.log('\n📝 Credenciais de login:');
  console.log('   Email: teste');
  console.log('   Password: teste');
}

seed();
