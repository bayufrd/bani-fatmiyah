const familyData = require('../src/data/familyData').familyData;
import * as fs from 'fs';
import * as path from 'path';

// Export to JSON
const jsonPath = path.join(__dirname, '../data/family-data.json');
fs.writeFileSync(jsonPath, JSON.stringify(familyData, null, 2));
console.log(`✅ Exported ${familyData.length} members to ${jsonPath}`);
