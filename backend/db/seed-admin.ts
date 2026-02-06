import Database from 'better-sqlite3';

console.log('👤 Adding admin user to database...');

const sqlite = new Database('events.db');

try {
  console.log('🔍 Checking if admin user already exists...');
  const existingUser = sqlite.prepare('SELECT * FROM users WHERE email = ?').get('geral@lyven.pt');
  
  if (existingUser) {
    console.log('📝 Admin user already exists, updating...');
    sqlite.prepare(`
      UPDATE users 
      SET name = ?, user_type = ?, is_onboarding_complete = 1
      WHERE email = ?
    `).run('Administrador', 'admin', 'geral@lyven.pt');
    console.log('✅ Admin user updated');
  } else {
    console.log('➕ Creating new admin user...');
    sqlite.prepare(`
      INSERT INTO users (
        id, name, email, user_type, interests, 
        preferences_notifications, preferences_language, 
        preferences_price_min, preferences_price_max, 
        preferences_event_types, favorite_events, event_history,
        is_onboarding_complete
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'user-admin-1',
      'Administrador',
      'geral@lyven.pt',
      'admin',
      '[]',
      1,
      'pt',
      0,
      1000,
      '[]',
      '[]',
      '[]',
      1
    );
    console.log('✅ Admin user created');
  }

  console.log('🔍 Checking if admin auth already exists...');
  const existingAuth = sqlite.prepare('SELECT * FROM promoter_auth WHERE email = ?').get('geral@lyven.pt');
  
  if (existingAuth) {
    console.log('📝 Admin auth already exists, updating password...');
    sqlite.prepare(`
      UPDATE promoter_auth 
      SET password = ?, user_id = ?
      WHERE email = ?
    `).run('Lyven12345678', 'user-admin-1', 'geral@lyven.pt');
    console.log('✅ Admin auth updated');
  } else {
    console.log('➕ Creating new admin auth...');
    sqlite.prepare(`
      INSERT INTO promoter_auth (id, email, password, user_id)
      VALUES (?, ?, ?, ?)
    `).run(
      'auth-admin-1',
      'geral@lyven.pt',
      'Lyven12345678',
      'user-admin-1'
    );
    console.log('✅ Admin auth created');
  }

  console.log('\n📋 Verificando dados criados:');
  const adminUser = sqlite.prepare('SELECT * FROM users WHERE email = ?').get('geral@lyven.pt');
  console.log('Admin user:', adminUser);
  
  const adminAuth = sqlite.prepare('SELECT * FROM promoter_auth WHERE email = ?').get('geral@lyven.pt');
  console.log('Admin auth:', adminAuth);

  console.log('\n🎉 Admin user setup completed!');
  console.log('\n📝 Credenciais de login do administrador:');
  console.log('   Email: geral@lyven.pt');
  console.log('   Password: Lyven12345678');
  
} catch (error) {
  console.error('❌ Error setting up admin user:', error);
} finally {
  sqlite.close();
}
