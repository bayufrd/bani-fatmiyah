// Seed dari JSON static data dengan sql.js
const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

// Static data - ambil dari familyData.ts struktur
const familyData = require('../src/data/familyData').familyData;

// Setup database
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'family.db');

async function seedDatabase() {
  // Initialize sql.js
  const SQL = await initSqlJs();
  
  // Create new database
  const db = new SQL.Database();

  db.run(`
    CREATE TABLE family_members (
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

  let success = 0;
  for (const member of familyData) {
    try {
      db.run(`
        INSERT INTO family_members (
          id, name, arabicName, birth, death, gender, generation, status, 
          address, description, childNumber, spouseName, parentIds, spouseIds, childIds
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        member.id,
        member.name,
        member.arabicName || null,
        member.birth || null,
        member.death || null,
        member.gender || null,
        member.generation,
        member.status || null,
        member.address || null,
        member.description || null,
        member.childNumber || null,
        member.spouseName || null,
        member.parentIds ? JSON.stringify(member.parentIds) : null,
        member.spouseIds ? JSON.stringify(member.spouseIds) : null,
        member.childIds ? JSON.stringify(member.childIds) : null
      ]);
      success++;
    } catch (err) {
      console.error(`❌ ${member.name}:`, err.message);
    }
  }

  // Save database to file
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);

  const fileSize = fs.statSync(dbPath).size;
  console.log(`\n✅ Import Complete!`);
  console.log(`📊 Imported: ${success}/${familyData.length} members`);
  console.log(`💾 Database: ${dbPath}`);
  console.log(`📈 Size: ${(fileSize / 1024).toFixed(2)} KB\n`);

  db.close();
}

seedDatabase();
