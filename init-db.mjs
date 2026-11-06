#!/usr/bin/env node
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPackage = join(__dirname, 'packages', 'database');

console.log('🔄 Regenerating Prisma Client for SQLite...');
try {
  execSync('npx prisma generate', { 
    cwd: dbPackage,
    stdio: 'inherit',
    timeout: 30000
  });
  console.log('✅ Prisma Client generated');
} catch (err) {
  console.error('❌ Failed to generate Prisma Client');
  process.exit(1);
}

console.log('\n🔄 Creating SQLite database...');
try {
  execSync('npx prisma db push --accept-data-loss --skip-generate', { 
    cwd: dbPackage,
    stdio: 'inherit',
    timeout: 30000
  });
  console.log('✅ Database created');
} catch (err) {
  console.error('❌ Failed to create database');
  process.exit(1);
}

console.log('\n✅ Database setup complete!');
