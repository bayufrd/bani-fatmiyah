const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

async function checkArabic() {
  const dbPath = path.join(__dirname, '../data/family.db');
  
  if (!fs.existsSync(dbPath)) {
    console.error('❌ Database file not found:', dbPath);
    return;
  }
  
  const SQL = await initSqlJs();
  const fileBuffer = fs.readFileSync(dbPath);
  const db = new SQL.Database(fileBuffer);

  // Check members with empty or missing Arabic names
  const result = db.exec(`
    SELECT id, name, arabicName 
    FROM family_members 
    WHERE arabicName IS NULL OR arabicName = '' OR TRIM(arabicName) = ''
    LIMIT 20
  `);

  console.log('\n=== Members with missing Arabic names ===\n');
  if (result.length === 0 || result[0].values.length === 0) {
    console.log('All members have Arabic names!');
  } else {
    result[0].values.forEach(row => {
      console.log(`${row[0]}. ${row[1]} → "${row[2] || '(empty)'}"`);
    });
  }

  db.close();
}

checkArabic();
