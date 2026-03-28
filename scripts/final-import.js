#!/usr/bin/env node
/**
 * Ultra-simple importer - directly eval TypeScript syntax
 * Using sql.js (pure JavaScript SQLite)
 */
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');
const vm = require('vm');

console.log('\n🚀 Starting bulk import...\n');

const tsPath = path.join(__dirname, '../src/data/familyData.ts');
let content = fs.readFileSync(tsPath, 'utf8');

// Extract hanya array content
const startMarker = 'export const familyData: FamilyMember[] = ';
const startIdx = content.indexOf(startMarker);
const arrayStart = startIdx + startMarker.length;
const arrayEnd = content.lastIndexOf('];') + 1;

if (startIdx === -1) {
  console.error('❌ familyData not found');
  process.exit(1);
}

const arrayCode = content.substring(arrayStart, arrayEnd);

// Setup a sandbox context
const sandbox = {};

async function finalImport() {
  try {
    // Remove type annotation dan execute
    let code = arrayCode
      .replace(/:\s*FamilyMember\[\]/, '') // Remove type annotation
      .replace(/\/\/.*/g, ''); // Remove comments
    
    // Execute dalam VM context
    vm.runInNewContext('const familyData = ' + code, sandbox);
    const familyData = sandbox.familyData;
    
    if (!Array.isArray(familyData)) {
      throw new Error('Result is not an array');
    }
    
    console.log(`✅ Successfully loaded ${familyData.length} members\n`);
    
    // Now insert into database with sql.js
    const dbPath = path.join(__dirname, '../data/family.db');
    const SQL = await initSqlJs();
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
    
    console.log(`📥 Importing to database...\n`);
    
    let success = 0;
    for (const m of familyData) {
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
          m.parentIds ? JSON.stringify(m.parentIds) : null,
          m.spouseIds ? JSON.stringify(m.spouseIds) : null,
          m.childIds ? JSON.stringify(m.childIds) : null
        ]);
        success++;
      } catch (e) {
        //
      }
    }
    
    // Save database to file
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
    
    console.log(`✅ Imported: ${success}/${familyData.length}\n`);
    
    // Verify
    const countResult = db.exec('SELECT COUNT(*) as count FROM family_members');
    const count = countResult.length > 0 ? countResult[0].values[0][0] : 0;
    
    const byGenResult = db.exec(`
      SELECT generation, COUNT(*) as count 
      FROM family_members 
      GROUP BY generation 
      ORDER BY generation
    `);
    
    console.log(`📊 Total: ${count} members\n`);
    console.log('By generation:');
    if (byGenResult.length > 0) {
      byGenResult[0].values.forEach(row => console.log(`   Gen ${row[0]}: ${row[1]} members`));
    }
    console.log('');
    
    const size = (fs.statSync(dbPath).size / (1024 * 1024)).toFixed(2);
    console.log(`💾 Database size: ${size} MB\n`);
    
    db.close();
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

finalImport();
