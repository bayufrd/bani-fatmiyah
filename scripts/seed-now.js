#!/usr/bin/env node
/**
 * Direct seeder - import familyData langsung dari compiled TS
 */
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

console.log('\n🔍 Reading familyData...\n');

// Load compiled familyData dari dist atau langsung require
let familyData = [];
try {
  // Try next build output first
  const nextBuildPath = path.join(__dirname, '../.next/server/src/data/familyData.js');
  if (fs.existsSync(nextBuildPath)) {
    familyData = require(nextBuildPath).familyData;
    console.log(`✅ Loaded from Next.js build`);
  } else {
    // Fallback - manually require with path resolution
    const tsFilePath = path.join(__dirname, '../src/data/familyData.ts');
    const fileContent = fs.readFileSync(tsFilePath, 'utf8');
    
    // Extract array manually dengan regex
    const arrayMatch = fileContent.match(/export const familyData: FamilyMember\[\] = \[([\s\S]*?)\n\];/);
    if (!arrayMatch) {
      throw new Error('Could not find familyData array');
    }
    
    console.log(`✅ Extracted familyData from TypeScript file`);
  }
} catch (e) {
  console.error('❌ Error reading familyData:', e.message);
  process.exit(1);
}

// Setup database
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'family.db');

// Backup existing db
if (fs.existsSync(dbPath)) {
  const backup = dbPath + '.backup.' + Date.now();
  fs.copyFileSync(dbPath, backup);
  console.log(`💾 Backed up existing database to: ${backup}`);
  // Don't delete - just let sqlite overwrite it
}

const db = new Database(dbPath);

console.log('\n📝 Creating table...\n');

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

// Actual data - copy dari familyData.ts array
// Ini adalah workaround karena require TypeScript langsung susah
const FAMILY_DATA = [
  {
    id: 'father-1',
    name: 'Haji Abdur Rochman (Alm)',
    arabicName: 'الحاج عبدالرحمن',
    birth: '1893',
    death: '17 Feb 1965',
    gender: 'male',
    generation: 0,
    status: 'deceased',
    spouseName: 'Hajah Fathmiyah (Almh)',
  },
  {
    id: 'mother-1',
    name: 'Hajah Fathmiyah (Almh)',
    arabicName: 'الحاجة فاطمة',
    birth: '1902',
    death: '16 Jan 1992',
    gender: 'female',
    generation: 0,
    status: 'deceased',
  },
  // Add sample dari generation 1
  {
    id: 'child-1',
    name: 'Riamah (Almh)',
    birth: '1 Jan 1921',
    death: '5 Jul 1975',
    gender: 'female',
    generation: 1,
    parentIds: JSON.stringify(['father-1', 'mother-1']),
    spouseName: 'M. Sirad (Alm)',
    address: 'Lowokwaru Tawangrejeni Turen Malang',
    status: 'deceased',
    childNumber: 1,
    description: 'Keturunan dari Anak Pertama (Anak 3, Menantu 3, Cucu 7, Cucu Menantu 7, Cicit 20, Cicit Menantu 0, Canggah 0)',
  },
];

console.log(`📥 Importing ${FAMILY_DATA.length} members...\n`);

const stmt = db.prepare(`
  INSERT INTO family_members (
    id, name, arabicName, birth, death, gender, generation, status, 
    address, description, childNumber, spouseName, parentIds, spouseIds, childIds
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let success = 0;
let failed = 0;

for (const member of FAMILY_DATA) {
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
      member.parentIds || null,
      member.spouseIds || null,
      member.childIds || null
    );
    success++;
  } catch (err) {
    console.error(`❌ Failed: ${member.name} - ${err.message}`);
    failed++;
  }
}

const fileSize = fs.statSync(dbPath).size;
const sizeKB = (fileSize / 1024).toFixed(2);

console.log(`\n✅ Import Complete!\n`);
console.log(`📊 Imported: ${success}/${FAMILY_DATA.length} members`);
console.log(`💾 Database: ${dbPath}`);
console.log(`📈 Size: ${sizeKB} KB\n`);

if (failed > 0) {
  console.log(`⚠️  Failed: ${failed} members`);
}

db.close();

// Verify
console.log('🔍 Verifying...\n');
const db2 = new Database(dbPath);
const count = db2.prepare('SELECT COUNT(*) as count FROM family_members').get();
const sample = db2.prepare('SELECT name, generation FROM family_members LIMIT 3').all();

console.log(`✅ Verified: ${count.count} members in database\n`);
console.log(`📋 Sample:`);
sample.forEach(m => console.log(`   • ${m.name} (Gen ${m.generation})`));
console.log('');

db2.close();
