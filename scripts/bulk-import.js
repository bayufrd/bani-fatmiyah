#!/usr/bin/env node
/**
 * Bulk Import v2 - Gunakan eval() untuk parse JavaScript objects langsung
 * Using sql.js (pure JavaScript SQLite)
 */
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

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

async function bulkImport() {
  // Initialize sql.js
  const SQL = await initSqlJs();
  
  // Create new database
  const db = new SQL.Database();

  console.log('\n🔄 Preparing database...\n');

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

  console.log(`📥 Importing ${familyData.length} members...\n`);

  let success = 0;
  let failed = 0;

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
      failed++;
    }
  }

  // Save database to file
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);

  const fileSize = fs.statSync(dbPath).size;
  const sizeKB = (fileSize / 1024).toFixed(2);

  console.log(`\n✅ IMPORT COMPLETE!\n`);
  console.log(`📊 Results:`);
  console.log(`   ✓ Imported: ${success} members`);
  console.log(`   ✗ Failed: ${failed} members`);
  console.log(`   💾 Size: ${sizeKB} KB\n`);

  // Verify
  const countResult = db.exec('SELECT COUNT(*) as count FROM family_members');
  const count = countResult.length > 0 ? countResult[0].values[0][0] : 0;
  
  const byGenResult = db.exec(`
    SELECT generation, COUNT(*) as count 
    FROM family_members 
    GROUP BY generation 
    ORDER BY generation
  `);

  console.log(`✅ Total: ${count} members\n`);
  console.log('📊 By generation:');
  if (byGenResult.length > 0) {
    byGenResult[0].values.forEach(row => console.log(`   Gen ${row[0]}: ${row[1]} members`));
  }
  console.log('');

  db.close();
}

bulkImport();
