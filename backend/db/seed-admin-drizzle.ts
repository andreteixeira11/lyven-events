/**
 * Seed admin user (info@lyven.pt / lyven@123) using the project's database (Turso or Supabase).
 * Run from project root: npx tsx backend/db/seed-admin-drizzle.ts
 * Ensure .env has TURSO_* or SUPABASE_DATABASE_URL set.
 */
import '../load-env';
import { db, users, promoterAuth } from '.';
import { eq } from 'drizzle-orm';

const ADMIN_EMAIL = 'info@lyven.pt';
const ADMIN_PASSWORD = 'lyven@123';
const ADMIN_USER_ID = 'user-admin-1';
const ADMIN_AUTH_ID = 'auth-admin-1';

async function seedAdmin() {
  console.log('👤 Seeding admin user...');
  console.log('   Email:', ADMIN_EMAIL);
  console.log('   Password:', ADMIN_PASSWORD);

  try {
    const existingUsers = await db.select().from(users).where(eq(users.email, ADMIN_EMAIL)).limit(1);

    if (existingUsers.length > 0) {
      console.log('📝 Admin user exists, updating...');
      await db
        .update(users)
        .set({
          name: 'Administrador',
          userType: 'admin',
          isOnboardingComplete: true,
        })
        .where(eq(users.id, existingUsers[0].id));
      console.log('✅ Admin user updated');
    } else {
      console.log('➕ Creating admin user...');
      await db.insert(users).values({
        id: ADMIN_USER_ID,
        name: 'Administrador',
        email: ADMIN_EMAIL,
        userType: 'admin',
        interests: '[]',
        preferencesNotifications: true,
        preferencesLanguage: 'pt',
        preferencesPriceMin: 0,
        preferencesPriceMax: 1000,
        preferencesEventTypes: '[]',
        favoriteEvents: '[]',
        eventHistory: '[]',
        isOnboardingComplete: true,
      });
      console.log('✅ Admin user created');
    }

    const existingAuth = await db.select().from(promoterAuth).where(eq(promoterAuth.email, ADMIN_EMAIL)).limit(1);

    if (existingAuth.length > 0) {
      console.log('📝 Admin auth exists, updating password...');
      await db
        .update(promoterAuth)
        .set({
          password: ADMIN_PASSWORD,
          userId: ADMIN_USER_ID,
        })
        .where(eq(promoterAuth.email, ADMIN_EMAIL));
      console.log('✅ Admin auth updated');
    } else {
      console.log('➕ Creating admin auth...');
      await db.insert(promoterAuth).values({
        id: ADMIN_AUTH_ID,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        userId: ADMIN_USER_ID,
      });
      console.log('✅ Admin auth created');
    }

    console.log('\n🎉 Admin seed completed.');
    console.log('   Login: select "Admin" on the login screen, then use');
    console.log('   Email:', ADMIN_EMAIL);
    console.log('   Password:', ADMIN_PASSWORD);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
  process.exit(0);
}

seedAdmin();
