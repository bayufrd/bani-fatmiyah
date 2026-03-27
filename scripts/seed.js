const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Import familyData - read as JS (require JSON dari TS)
// Baca file TS dan extract array
const tsContent = fs.readFileSync(path.join(__dirname, '../src/data/familyData.ts'), 'utf8');
const arrayStart = tsContent.indexOf('export const familyData: FamilyMember[] = [');
const arrayContent = tsContent.substring(arrayStart);

// Evaluasi sebagai JavaScript
const module_temp = { exports: {} };
eval(arrayContent.replace('export const familyData: FamilyMember[] = ', 'const familyData = '));
const oldFamilyData = eval('familyData');

function seedDatabase() {
  const dataDir = path.join(__dirname, '../data');
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

  // Clear existing data
  db.prepare('DELETE FROM family_members').run();

  console.log(`📥 Importing ${oldFamilyData.length} members...`);

  const stmt = db.prepare(`
    INSERT INTO family_members (
      id, name, arabicName, birth, death, gender, generation, status, 
      address, description, childNumber, spouseName, parentIds, spouseIds, childIds, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `);

  let count = 0;
  for (const member of oldFamilyData) {
    try {
      stmt.run(
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
      );
      count++;
    } catch (err) {
      console.error(`❌ Error importing ${member.id}:`, err.message);
    }
  }

  console.log(`✅ Successfully imported ${count}/${oldFamilyData.length} members!`);
  console.log(`📊 Database file: ${dbPath}`);
  console.log(`💾 File size: ${(fs.statSync(dbPath).size / 1024).toFixed(2)} KB`);

  db.close();
}

seedDatabase();
