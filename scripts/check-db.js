const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

async function checkDb() {
  const dbPath = path.join(__dirname, '../data/family.db');
  
  if (!fs.existsSync(dbPath)) {
    console.error('❌ Database file not found:', dbPath);
    return;
  }
  
  const SQL = await initSqlJs();
  const fileBuffer = fs.readFileSync(dbPath);
  const db = new SQL.Database(fileBuffer);

  try {
    const result = db.exec('SELECT COUNT(*) as count FROM family_members');
    const count = result.length > 0 ? result[0].values[0][0] : 0;
    
    console.log(`\n✅ Database connected!`);
    console.log(`📊 Total members in database: ${count}`);
    
    // Get first 3 members
    const membersResult = db.exec('SELECT id, name, generation FROM family_members LIMIT 3');
    console.log('\n📋 Sample members:');
    if (membersResult.length > 0) {
      membersResult[0].values.forEach(row => {
        console.log(`   - ${row[1]} (Gen ${row[2]})`);
      });
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    db.close();
  }
}

checkDb();
