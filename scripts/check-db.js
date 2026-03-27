const Database = require('better-sqlite3');
const db = new Database('./data/family.db');

try {
  const result = db.prepare('SELECT COUNT(*) as count FROM family_members').get();
  console.log(`\n✅ Database connected!`);
  console.log(`📊 Total members in database: ${result.count}`);
  
  // Get first 3 members
  const members = db.prepare('SELECT id, name, generation FROM family_members LIMIT 3').all();
  console.log('\n📋 Sample members:');
  members.forEach(m => {
    console.log(`   - ${m.name} (Gen ${m.generation})`);
  });
  
} catch (err) {
  console.error('❌ Error:', err.message);
} finally {
  db.close();
}
