// Direct seed using Node
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Membaca data dari file familyData.ts dan extract array
const tsFilePath = path.join(__dirname, '../src/data/familyData.ts');
let fileContent = fs.readFileSync(tsFilePath, 'utf8');

// Find array content
const startIdx = fileContent.indexOf('export const familyData: FamilyMember[] = [');
const endIdx = fileContent.lastIndexOf('];') + 2;
let arrayStr = fileContent.substring(startIdx + 42, endIdx - 2);

// Simple parsing - extract objects
const objects = [];
let current = '{';
let braceCount = 0;

for (let i = 0; i < arrayStr.length; i++) {
  const char = arrayStr[i];
  current += char;

  if (char === '{') braceCount++;
  if (char === '}') braceCount--;

  if (braceCount === 0 && current.trim().endsWith('}')) {
    try {
      // Convert to valid JSON
      let json = current
        .replace(/'/g, '"')
        .replace(/,\s*}/g, '}')
        .replace(/:\s*'/g, ': "')
        .replace(/\s*:\s*\{/g, ': {')
        .replace(/\}\s*,/g, '},')
        .replace(/gender:\s*(['"])(male|female)\1/g, 'gender: "$2"')
        .replace(/status:\s*(['"])(alive|deceased)\1/g, 'status: "$2"');

      eval('objects.push(' + json + ')');
    } catch (e) {
      // Skip parsing error objects
    }
    current = '{';
  }
}

console.log(`\n📌 Found ${objects.length} members to import\n`);

// Setup database
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'family.db');

// Remove old database if exists
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('🗑️  Cleared old database\n');
}

const db = new Database(dbPath);

db.exec(`
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

const stmt = db.prepare(`
  INSERT INTO family_members (
    id, name, arabicName, birth, death, gender, generation, status, 
    address, description, childNumber, spouseName, parentIds, spouseIds, childIds
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let success = 0;
for (const member of objects) {
  try {
    stmt.run(
      member.id || `member-${Date.now()}-${Math.random()}`,
      member.name || 'Unknown',
      member.arabicName || null,
      member.birth || null,
      member.death || null,
      member.gender || null,
      member.generation || 0,
      member.status || null,
      member.address || null,
      member.description || null,
      member.childNumber || null,
      member.spouseName || null,
      member.parentIds ? JSON.stringify(member.parentIds) : null,
      member.spouseIds ? JSON.stringify(member.spouseIds) : null,
      member.childIds ? JSON.stringify(member.childIds) : null
    );
    success++;
  } catch (err) {
    console.error(`❌ ${member.name}:`, err.message);
  }
}

const fileSize = fs.statSync(dbPath).size;
console.log(`\n✅ Import Complete!`);
console.log(`📊 Imported: ${success}/${objects.length} members`);
console.log(`💾 Database: ${dbPath}`);
console.log(`📈 Size: ${(fileSize / 1024).toFixed(2)} KB\n`);

db.close();
