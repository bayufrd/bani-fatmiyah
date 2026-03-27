#!/usr/bin/env node
/**
 * Bulk Import - Extract semua data dari familyData.ts dan import ke database
 * Ini membaca file TS secara langsung dan extract array data
 */
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

console.log('\n📖 Reading familyData.ts...\n');

// Baca file TypeScript
const tsPath = path.join(__dirname, '../src/data/familyData.ts');
const tsContent = fs.readFileSync(tsPath, 'utf8');

// Extract array content dengan regex - cari "export const familyData..." hingga "];"
const arrayMatch = tsContent.match(/export const familyData: FamilyMember\[\] = \[([\s\S]*?)\n\];/);
if (!arrayMatch) {
  console.error('❌ Could not find familyData array in file');
  process.exit(1);
}

const arrayContent = '[' + arrayMatch[1] + '\n]';

// Parse sebagai JavaScript dengan eval (hati-hati: hanya untuk data)
// Konversi TypeScript object ke valid JSON
let jsonStr = arrayContent;

// Replace interface syntax dengan JSON
jsonStr = jsonStr
  .replace(/\/\/.*/g, '') // Remove comments
  .replace(/,\s*}/g, '}') // Remove trailing commas before }
  .replace(/,\s*]/g, ']') // Remove trailing commas before ]
  .replace(/'/g, '"') // Single quotes to double quotes
  .replace(/:\s*['"]?(male|female)['"]?\s*([,}])/g, ': "$1"$2') // Quote gender values
  .replace(/:\s*['"]?(alive|deceased)['"]?\s*([,}])/g, ': "$1"$2'); // Quote status values

// Try parse as JSON
let familyData = [];
try {
  familyData = JSON.parse(jsonStr);
  console.log(`✅ Parsed ${familyData.length} members from familyData.ts`);
} catch (err) {
  console.error('❌ JSON Parse Error:', err.message);
  console.log('\n📝 First 500 chars of converted data:');
  console.log(jsonStr.substring(0, 500));
  process.exit(1);
}

// Setup database
const dbPath = path.join(__dirname, '../data/family.db');
const db = new Database(dbPath);

console.log('\n🔄 Clearing old data and creating fresh table...\n');

db.exec(`
  DROP TABLE IF EXISTS family_members;
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

console.log(`📥 Importing ${familyData.length} members...\n`);

let success = 0;
let failed = 0;
const errors = [];

for (const member of familyData) {
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
    failed++;
    errors.push(`${member.name}: ${err.message}`);
  }
}

const fileSize = fs.statSync(dbPath).size;
const sizeKB = (fileSize / 1024).toFixed(2);

console.log(`\n✅ Import Complete!\n`);
console.log(`📊 Results:`);
console.log(`   ✓ Imported: ${success} members`);
console.log(`   ✗ Failed: ${failed} members`);
console.log(`   📈 Total: ${familyData.length} members`);
console.log(`   💾 Database size: ${sizeKB} KB\n`);

if (errors.length > 0 && errors.length <= 10) {
  console.log('⚠️  Errors:');
  errors.forEach(e => console.log(`   - ${e}`));
  console.log();
}

// Verify
console.log('🔍 Verifying...\n');
const count = db.prepare('SELECT COUNT(*) as count FROM family_members').get();
const byGen = db.prepare(`
  SELECT generation, COUNT(*) as count 
  FROM family_members 
  GROUP BY generation 
  ORDER BY generation
`).all();

console.log(`✅ Total in database: ${count.count} members\n`);
console.log('📊 Distribution by generation:');
byGen.forEach(g => console.log(`   Gen ${g.generation}: ${g.count} members`));
console.log('');

db.close();
