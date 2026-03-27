// pages/api/admin/prepare-integer-ids.ts
// Endpoint untuk prepare data dengan integer ID sebelum import

import { NextRequest, NextResponse } from 'next/server';
import { familyData } from '@/data/familyData';

export async function POST(request: NextRequest) {
  try {
    const idMapping: Record<string, number> = {};
    let newId = 1;

    familyData.forEach((member) => {
      idMapping[member.id] = newId++;
    });

    console.log(`Total members: ${familyData.length}`);
    console.log(`Sample mappings:`, {
      'father-1': idMapping['father-1'],
      'mother-1': idMapping['mother-1'],
      'masduha-9-1': idMapping['masduha-9-1'],
      'masduha-9-1-1': idMapping['masduha-9-1-1'],
    });

    // Convert members
    const convertedMembers = familyData.map((member) => {
      const converted: any = {
        id: idMapping[member.id],
        name: member.name,
        gender: member.gender || 'male',
        generation: member.generation,
      };

      // Optional string fields
      if (member.arabicName) converted.arabicName = member.arabicName;
      if (member.birth) converted.birth = member.birth;
      if (member.death) converted.death = member.death;
      if (member.status) converted.status = member.status;
      if (member.address) converted.address = member.address;
      if (member.description) converted.description = member.description;
      if (member.childNumber) converted.childNumber = member.childNumber;

      // Handle parentIds - convert to array of new integer IDs
      let parentIds: number[] = [];
      if (member.parentIds && Array.isArray(member.parentIds)) {
        parentIds = member.parentIds
          .map((pId: string) => idMapping[pId])
          .filter((id: number | undefined) => id !== undefined);
      } else if (member.parentId && idMapping[member.parentId]) {
        parentIds = [idMapping[member.parentId]];
      }

      if (parentIds.length > 0) {
        converted.parentIds = parentIds;
      }

      // Handle spouse
      if (member.spouseName || member.spouse) {
        const spouse: any = {};
        if (typeof member.spouse === 'object' && member.spouse !== null) {
          Object.assign(spouse, member.spouse);
        }
        if (member.spouseName && !spouse.name) {
          spouse.name = member.spouseName;
        }
        if (Object.keys(spouse).length > 0) {
          converted.spouse = spouse;
        }
      }

      return converted;
    });

    // Calculate generation stats
    const generationStats: Record<number, number> = {};
    convertedMembers.forEach((m) => {
      generationStats[m.generation] = (generationStats[m.generation] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      message: 'Data prepared successfully',
      totalMembers: convertedMembers.length,
      idMapping: {
        'father-1': idMapping['father-1'],
        'mother-1': idMapping['mother-1'],
        'masduha-9-1': idMapping['masduha-9-1'],
        'masduha-9-1-1': idMapping['masduha-9-1-1'],
      },
      generationStats,
      sample: convertedMembers.slice(0, 3),
      preview: convertedMembers, // Return all for import
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to prepare data', details: String(error) },
      { status: 500 }
    );
  }
}
