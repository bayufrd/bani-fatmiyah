// Script untuk convert familyData.ts menjadi JSON dengan ID integer
const fs = require('fs');

// Import familyData
const { familyData } = require('../src/data/familyData');

// Create mapping dari old ID (string) ke new ID (integer)
const idMapping = {};
let newId = 1;

// First pass: create ID mapping
familyData.forEach(member => {
  idMapping[member.id] = newId++;
});

console.log(`Total members: ${familyData.length}`);
console.log(`ID Mapping created: ${Object.keys(idMapping).length} mappings\n`);

// Second pass: convert data
const convertedData = familyData.map(member => {
  const converted = {
    id: idMapping[member.id],
    name: member.name,
    ...(member.arabicName && { arabicName: member.arabicName }),
    ...(member.birth && { birth: member.birth }),
    ...(member.death && { death: member.death }),
    ...(member.gender && { gender: member.gender }),
    generation: member.generation,
    ...(member.status && { status: member.status }),
    ...(member.address && { address: member.address }),
    ...(member.description && { description: member.description }),
    ...(member.childNumber && { childNumber: member.childNumber }),
    
    // Handle parentId/parentIds - convert to array of integers
    parentIds: (() => {
      let parents = [];
      if (member.parentIds && Array.isArray(member.parentIds)) {
        parents = member.parentIds.map(pId => idMapping[pId]).filter(p => p !== undefined);
      } else if (member.parentId && idMapping[member.parentId]) {
        parents = [idMapping[member.parentId]];
      }
      return parents.length > 0 ? parents : undefined;
    })(),
    
    // Handle spouse - keep as string for now but could expand later
    ...(member.spouseName && { spouse: { name: member.spouseName } }),
  };
  
  // Remove undefined values
  Object.keys(converted).forEach(key => converted[key] === undefined && delete converted[key]);
  return converted;
});

// Save as JSON
const output = {
  metadata: {
    totalMembers: convertedData.length,
    generationStats: {},
    convertedDate: new Date().toISOString(),
  },
  idMapping: idMapping,
  members: convertedData,
};

// Calculate generation stats
convertedData.forEach(m => {
  if (!output.metadata.generationStats[m.generation]) {
    output.metadata.generationStats[m.generation] = 0;
  }
  output.metadata.generationStats[m.generation]++;
});

const outputPath = './family-data-converted.json';
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log(`\n✅ Conversion complete!`);
console.log(`📁 File saved: ${outputPath}`);
console.log(`\n📊 Generation Statistics:`);
Object.entries(output.metadata.generationStats).forEach(([gen, count]) => {
  console.log(`   Generation ${gen}: ${count} members`);
});

console.log(`\n🔍 Sample conversions:`);
console.log(`   father-1 → ${idMapping['father-1']}`);
console.log(`   mother-1 → ${idMapping['mother-1']}`);
console.log(`   masduha-9-1 → ${idMapping['masduha-9-1']}`);
console.log(`   masduha-9-1-1 → ${idMapping['masduha-9-1-1']}`);

// Show sample members
console.log(`\n📋 Sample converted members:`);
convertedData.slice(0, 3).forEach(m => {
  console.log(`   ID: ${m.id}, Name: ${m.name}, Gen: ${m.generation}, Parents: ${JSON.stringify(m.parentIds || [])}`);
});
