import { execSync } from 'child_process';

try {
  console.log('Resetting DB...');

  execSync(
    `docker exec -i $(docker ps -q -f ancestor=postgres:15) psql -U postgres -d postgres < db/schema.sql`,
    { stdio: 'inherit', shell: '/bin/bash' }
  );

  console.log('DB Reset Complete');
} catch (err) {
  console.error('DB Reset Failed:', err);
}