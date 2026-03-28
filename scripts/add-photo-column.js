#!/usr/bin/env node

const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(process.cwd(), 'data', 'family.db');

async function addPhotoColumn() {
  if (!fs.existsSync(dbPath)) {
    console.error('❌ Database file not found:', dbPath);
    return;
  }
  
  const SQL = await initSqlJs();
  const fileBuffer = fs.readFileSync(dbPath);
  const db = new SQL.Database(fileBuffer);

  try {
    // Check if photo column already exists
    const columnsResult = db.exec("PRAGMA table_info(family_members)");
    const columns = columnsResult.length > 0 ? columnsResult[0].values : [];
    const hasPhotoColumn = columns.some(col => col[1] === 'photo');

    if (hasPhotoColumn) {
      console.log('✓ Photo column already exists');
    } else {
      console.log('Adding photo column to family_members table...');
      db.run('ALTER TABLE family_members ADD COLUMN photo TEXT');
      
      // Save changes to file
      const data = db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(dbPath, buffer);
      
      console.log('✓ Photo column added successfully');
    }

    // Display current schema
    console.log('\nCurrent table schema:');
    const schemaResult = db.exec("PRAGMA table_info(family_members)");
    if (schemaResult.length > 0) {
      schemaResult[0].values.forEach(col => {
        console.log(`  - ${col[1]}: ${col[2]}${col[3] ? ' (NOT NULL)' : ''}`);
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    db.close();
  }
}

addPhotoColumn();
