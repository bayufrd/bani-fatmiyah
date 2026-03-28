/// <reference types="node" />
import initSqlJs from 'sql.js';
import path from 'path';
import * as fs from 'fs';
import { Buffer } from 'buffer';

// Import familyData dari src
// @ts-ignore - import dari file TypeScript
const { familyData: oldFamilyData } = require('../src/data/familyData');

async function seedDatabase() {
  // Buat folder data jika belum ada
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'family.db');
  
  // Initialize sql.js
  const SQL = await initSqlJs();
  
  // Load existing db or create new
  let db;
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Create table
  db.run(`
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
  const result = db.exec('SELECT COUNT(*) as count FROM family_members');
  const count = result.length > 0 ? result[0].values[0][0] as number : 0;
  
  if (count === 0) {
    console.log('Seeding database with initial data...');

    for (const member of oldFamilyData) {
      db.run(`
        INSERT INTO family_members (
          id, name, arabicName, birth, death, gender, generation, status, spouseName, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [
        member.id,
        member.name,
        member.arabicName,
        member.birth,
        member.death,
        member.gender,
        member.generation,
        member.status,
        member.spouseName
      ]);
    }

    console.log('✅ Database seeded successfully!');
  } else {
    console.log(`📊 Database already has ${count} members`);
  }

  // Save database to file
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
  
  db.close();
}

seedDatabase();
