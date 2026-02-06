import { existsSync } from 'fs';
import { executeRaw } from './index';
import { runMigration } from './migrate';
import { seedDatabase } from './seed';

export async function initDatabase() {
  const useSupabase = !!process.env.SUPABASE_DATABASE_URL;
  const useTurso = !!process.env.TURSO_DATABASE_URL;

  if (useSupabase) {
    console.log('🗄️  Supabase detected as database backend');
    try {
      const { verifySupabaseConnection } = await import('../lib/supabase');
      const isConnected = await verifySupabaseConnection();
      
      if (isConnected) {
        console.log('✅ Supabase database connection verified');
        console.log('ℹ️  Tables should be created via Supabase Dashboard or migrations');
        console.log('ℹ️  Run the SQL from supabase/migrations/00001_lyven_schema.sql in Supabase SQL Editor');
      } else {
        console.warn('⚠️  Supabase connection could not be verified, but will continue');
      }
      
      try {
        await seedDatabase();
        console.log('✅ Database seeded (if needed)');
      } catch (seedError) {
        console.log('ℹ️  Seeding skipped or already done:', seedError instanceof Error ? seedError.message : seedError);
      }
    } catch (error) {
      console.error('❌ Supabase initialization error:', error);
    }
    return;
  }

  if (useTurso) {
    console.log('🗄️  Turso detected. Running migration and seed...');
    try {
      await runMigration(executeRaw);
      console.log('✅ Database migrated');
      await seedDatabase();
      console.log('✅ Database seeded');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
    return;
  }

  const dbExists = existsSync('events.db');
  if (!dbExists) {
    console.log('🗄️  Database not found. Creating...');
    try {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      await execAsync('bun run backend/db/migrate.ts');
      console.log('✅ Database migrated');
      await execAsync('bun run backend/db/seed.ts');
      console.log('✅ Database seeded');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  } else {
    console.log('✅ Database already exists');
  }
}
