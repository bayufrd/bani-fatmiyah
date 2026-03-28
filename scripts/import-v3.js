#!/usr/bin/env node
/**
 * Bulk Import v3 - Manual object construction
 * Baca file TS dan extract data dengan regex state machine
 * Using sql.js (pure JavaScript SQLite)
 */
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

console.log('\n🔍 Extracting data dari familyData.ts...\n');

const tsPath = path.join(__dirname, '../src/data/familyData.ts');
const content = fs.readFileSync(tsPath, 'utf8');

// Find array start dan end
const startIdx = content.indexOf('export const familyData: FamilyMember[] = [');
if (startIdx === -1) {
  console.error('❌ familyData array not found');
  process.exit(1);
}

const arrayStart = content.indexOf('[', startIdx) + 1;
const arrayEnd = content.lastIndexOf('];');
const arrayContent = content.substring(arrayStart, arrayEnd);

// Parse objects satu per satu dengan state machine
const objects = [];
let current = '';
let braceDepth = 0;
let inString = false;
let stringChar = '';

for (let i = 0; i < arrayContent.length; i++) {
  const char = arrayContent[i];
  const nextChar = arrayContent[i + 1];
  
  // Handle string boundaries
  if ((char === '"' || char === '\'' || char === '`') && (i === 0 || arrayContent[i - 1] !== '\\')) {
    if (!inString) {
      inString = true;
      stringChar = char;
    } else if (char === stringChar) {
      inString = false;
    }
  }
  
  if (!inString) {
    if (char === '{') braceDepth++;
    if (char === '}') braceDepth--;
  }
  
  current += char;
  
  // When we hit closing brace with depth 0, we have a complete object
  if (!inString && braceDepth === 0 && char === '}' && current.trim().length > 2) {
    try {
      // Clean up the object string
      let objStr = current
        .replace(/,\s*}/, '}')
        .replace(/\/\/.*/g, '') // Remove inline comments
        .trim();
      
      // Evaluate as JavaScript object
      const obj = eval('(' + objStr + ')');
      objects.push(obj);
    } catch (e) {
      // Skip malformed objects
    }
    current = '';
  }
}

console.log(`✅ Extracted ${objects.length} objects\n`);

// Setup database
const dbPath = path.join(__dirname, '../data/family.db');

async function importV3() {
  // Initialize sql.js
  const SQL = await initSqlJs();
  
  // Create new database
  const db = new SQL.Database();

  console.log('🔄 Creating database...\n');

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

  console.log(`📥 Importing ${objects.length} members...\n`);

  let success = 0;
  let failed = 0;

  for (const m of objects) {
    try {
      db.run(`
        INSERT INTO family_members (
          id, name, arabicName, birth, death, gender, generation, status, 
          address, description, childNumber, spouseName, parentIds, spouseIds, childIds
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        m.id,
        m.name,
        m.arabicName || null,
        m.birth || null,
        m.death || null,
        m.gender || null,
        m.generation,
        m.status || null,
        m.address || null,
        m.description || null,
        m.childNumber || null,
        m.spouseName || null,
        Array.isArray(m.parentIds) ? JSON.stringify(m.parentIds) : (m.parentIds ? JSON.stringify([m.parentIds]) : null),
        Array.isArray(m.spouseIds) ? JSON.stringify(m.spouseIds) : (m.spouseIds ? JSON.stringify([m.spouseIds]) : null),
        Array.isArray(m.childIds) ? JSON.stringify(m.childIds) : (m.childIds ? JSON.stringify([m.childIds]) : null)
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

  const size = (fs.statSync(dbPath).size / 1024).toFixed(2);

  console.log(`\n✅ IMPORT COMPLETE!\n`);
  console.log(`📊 Results:`);
  console.log(`   ✓ Success: ${success}`);
  console.log(`   ✗ Failed: ${failed}`);
  console.log(`   📈 Size: ${size} KB\n`);

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
  console.log('📊 Distribution:');
  if (byGenResult.length > 0) {
    byGenResult[0].values.forEach(row => console.log(`   Gen ${row[0]}: ${row[1]}`));
  }
  console.log('');

  db.close();
}

importV3();
