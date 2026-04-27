import { execSync } from 'child_process';

try {
  console.log('🌱 Seeding DB...');

  execSync(
    `docker exec -i $(docker ps -q -f ancestor=postgres:15) psql -U postgres -d postgres < db/seed.sql`,
    { stdio: 'inherit', shell: '/bin/bash' }
  );

  console.log('✅ DB Seed Complete');
} catch (err) {
  console.error('❌ DB Seed Failed:', err);
}