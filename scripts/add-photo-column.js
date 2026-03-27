#!/usr/bin/env node

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'data', 'family.db');
const db = new Database(dbPath);

try {
  // Check if photo column already exists
  const columns = db.prepare("PRAGMA table_info(family_members)").all();
  const hasPhotoColumn = columns.some(col => col.name === 'photo');

  if (hasPhotoColumn) {
    console.log('✓ Photo column already exists');
  } else {
    console.log('Adding photo column to family_members table...');
    db.exec('ALTER TABLE family_members ADD COLUMN photo TEXT');
    console.log('✓ Photo column added successfully');
  }

  // Display current schema
  console.log('\nCurrent table schema:');
  const schema = db.prepare("PRAGMA table_info(family_members)").all();
  schema.forEach(col => {
    console.log(`  - ${col.name}: ${col.type}${col.notnull ? ' (NOT NULL)' : ''}`);
  });

} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
} finally {
  db.close();
}
