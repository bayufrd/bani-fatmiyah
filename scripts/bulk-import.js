#!/usr/bin/env node
/**
 * Bulk Import v2 - Gunakan eval() untuk parse JavaScript objects langsung
 */
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

console.log('\n📖 Reading familyData.ts...\n');

const tsPath = path.join(__dirname, '../src/data/familyData.ts');
const tsContent = fs.readFileSync(tsPath, 'utf8');

// Extract array content
const arrayMatch = tsContent.match(/export const familyData: FamilyMember\[\] = \[([\s\S]*?)\n\];/);
if (!arrayMatch) {
  console.error('❌ Could not find familyData array');
  process.exit(1);
}

// Use eval - extract dan evaluate langsung
let familyData = [];
try {
  // Create a safe eval context
  const code = `
    const familyData = [${arrayMatch[1]}];
  `;
  
  // Execute dengan eval
  eval(code);
  
  console.log(`✅ Parsed ${familyData.length} members from TypeScript`);
} catch (err) {
  console.error('❌ Parse Error:', err.message);
  process.exit(1);
}

// Setup database
const dbPath = path.join(__dirname, '../data/family.db');
const db = new Database(dbPath);

console.log('\n🔄 Preparing database...\n');

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

for (const member of familyData) {
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
    success++;
  } catch (err) {
    failed++;
  }
}

const fileSize = fs.statSync(dbPath).size;
const sizeKB = (fileSize / 1024).toFixed(2);

console.log(`\n✅ IMPORT COMPLETE!\n`);
console.log(`📊 Results:`);
console.log(`   ✓ Imported: ${success} members`);
console.log(`   ✗ Failed: ${failed} members`);
console.log(`   💾 Size: ${sizeKB} KB\n`);

// Verify
const count = db.prepare('SELECT COUNT(*) as count FROM family_members').get();
const byGen = db.prepare(`
  SELECT generation, COUNT(*) as count 
  FROM family_members 
  GROUP BY generation 
  ORDER BY generation
`).all();

console.log(`✅ Total: ${count.count} members\n`);
console.log('📊 By generation:');
byGen.forEach(g => console.log(`   Gen ${g.generation}: ${g.count} members`));
console.log('');

db.close();
