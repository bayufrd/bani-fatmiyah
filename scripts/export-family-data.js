// Script untuk export family data sebagai JSON
// Jalankan: node export-family-data.js

const fs = require('fs');
const path = require('path');

// Baca file TypeScript
const tsFile = fs.readFileSync('src/data/familyData.ts', 'utf-8');

// Extract hanya array data (tanpa types)
const arrayStart = tsFile.indexOf('[');
const arrayContent = tsFile.substring(arrayStart);

// Buat temporary JavaScript file
const tempJsFile = `
const data = ${arrayContent};
module.exports = { familyData: data };
`;

// Write temp file
fs.writeFileSync('temp-family-data.js', tempJsFile);

try {
  // Import temp file
  const { familyData } = require('./temp-family-data.js');
  
  console.log(`✅ Loaded ${familyData.length} members\n`);
  
  // Create ID mapping
  const idMapping = {};
  let newId = 1;
  
  familyData.forEach(member => {
    idMapping[member.id] = newId++;
  });
  
  console.log(`📌 Created ${Object.keys(idMapping).length} ID mappings\n`);
  
  // Sample mappings
  console.log('Sample ID Mappings:');
  console.log(`  father-1 → ${idMapping['father-1']}`);
  console.log(`  mother-1 → ${idMapping['mother-1']}`);
  console.log(`  masduha-9-1 → ${idMapping['masduha-9-1']}`);
  console.log(`  masduha-9-1-1 → ${idMapping['masduha-9-1-1']}\n`);
  
  // Convert members
  const converted = familyData.map(member => {
    const conv = {
      id: idMapping[member.id],
      name: member.name,
      gender: member.gender,
      generation: member.generation,
    };
    
    // Add optional fields
    if (member.arabicName) conv.arabicName = member.arabicName;
    if (member.birth) conv.birth = member.birth;
    if (member.death) conv.death = member.death;
    if (member.status) conv.status = member.status;
    if (member.address) conv.address = member.address;
    if (member.description) conv.description = member.description;
    if (member.childNumber) conv.childNumber = member.childNumber;
    
    // Handle parentIds - convert to array of integers
    let parentIds = [];
    if (member.parentIds && Array.isArray(member.parentIds)) {
      parentIds = member.parentIds
        .map(pId => idMapping[pId])
        .filter(id => id !== undefined);
    } else if (member.parentId && idMapping[member.parentId]) {
      parentIds = [idMapping[member.parentId]];
    }
    
    if (parentIds.length > 0) {
      conv.parentIds = parentIds;
    }
    
    // Handle spouse
    if (member.spouseName || member.spouse) {
      const spouse = {};
      if (typeof member.spouse === 'object' && member.spouse !== null) {
        Object.assign(spouse, member.spouse);
      }
      if (member.spouseName && !spouse.name) {
        spouse.name = member.spouseName;
      }
      if (Object.keys(spouse).length > 0) {
        conv.spouse = spouse;
      }
    }
    
    return conv;
  });
  
  // Save as JSON
  const output = {
    metadata: {
      totalMembers: converted.length,
      convertedDate: new Date().toISOString(),
      generationStats: {},
    },
    idMapping: idMapping,
    members: converted,
  };
  
  // Calculate generation stats
  converted.forEach(m => {
    if (!output.metadata.generationStats[m.generation]) {
      output.metadata.generationStats[m.generation] = 0;
    }
    output.metadata.generationStats[m.generation]++;
  });
  
  fs.writeFileSync('family-data-converted.json', JSON.stringify(output, null, 2));
  
  console.log('✅ Conversion complete!');
  console.log('📁 File saved: family-data-converted.json\n');
  
  console.log('📊 Generation Statistics:');
  Object.keys(output.metadata.generationStats).sort((a,b) => a-b).forEach(gen => {
    console.log(`   Generation ${gen}: ${output.metadata.generationStats[gen]} members`);
  });
  
  console.log('\n🔍 Sample Converted Members:');
  for (let i = 0; i < Math.min(5, converted.length); i++) {
    const m = converted[i];
    const parents = (m.parentIds || []).join(', ');
    console.log(`   ID: ${String(m.id).padEnd(3)} | ${m.name.substring(0,30).padEnd(30)} | Gen: ${m.generation} | Parents: [${parents}]`);
  }
  
  console.log('\n✅ Siap untuk diimport ke database!');
  
} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
} finally {
  // Cleanup
  if (fs.existsSync('temp-family-data.js')) {
    fs.unlinkSync('temp-family-data.js');
  }
}
