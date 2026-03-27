const Database = require('better-sqlite3');
const db = new Database('./data/family.db');

// Check members with empty or missing Arabic names
const members = db.prepare(`
  SELECT id, name, arabicName 
  FROM family_members 
  WHERE arabicName IS NULL OR arabicName = '' OR TRIM(arabicName) = ''
  LIMIT 20
`).all();

console.log('\n=== Members with missing Arabic names ===\n');
if (members.length === 0) {
  console.log('All members have Arabic names!');
} else {
  members.forEach(m => {
    console.log(`${m.id}. ${m.name} → "${m.arabicName || '(empty)'}"`);
  });
}

db.close();
