import Database from 'better-sqlite3';
import path from 'path';
import * as fs from 'fs';

// Import familyData dari src
// @ts-ignore - import dari file TypeScript
const { familyData: oldFamilyData } = require('../src/data/familyData');

function seedDatabase() {
  // Buat folder data jika belum ada
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'family.db');
  const db = new Database(dbPath);

  // Create table
  db.exec(`
    CREATE TABLE IF NOT EXISTS family_members (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      arabicName TEXT,
      birth TEXT,
      death TEXT,
      gender TEXT,
      generation INTEGER NOT NULL,
      status TEXT,
      address TEXT,
      description TEXT,
      childNumber INTEGER,
      spouseName TEXT,
      parentIds TEXT,
      spouseIds TEXT,
      childIds TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Check if data already exists
  const count = db.prepare('SELECT COUNT(*) as count FROM family_members').get() as { count: number };
  
  if (count.count === 0) {
    console.log('Seeding database with initial data...');
    
    const stmt = db.prepare(`
      INSERT INTO family_members (
        id, name, arabicName, birth, death, gender, generation, status, spouseName, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    for (const member of oldFamilyData) {
      stmt.run(
        member.id,
        member.name,
        member.arabicName,
        member.birth,
        member.death,
        member.gender,
        member.generation,
        member.status,
        member.spouseName
      );
    }

    console.log('✅ Database seeded successfully!');
  } else {
    console.log(`📊 Database already has ${count.count} members`);
  }

  db.close();
}

seedDatabase();
