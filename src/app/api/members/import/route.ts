import { NextRequest, NextResponse } from 'next/server';
import { createMember, initDb } from '@/lib/db';
import { familyData } from '@/data/familyData';

initDb();

export async function POST(req: NextRequest) {
  try {
    let imported = 0;
    let failed = 0;

    for (const member of familyData) {
      try {
        // Convert string parentIds to number array if needed
        let parentIds: number[] | undefined = undefined;
        if (member.parentIds && Array.isArray(member.parentIds)) {
          // Try to convert string IDs to numbers if they look like numbers
          parentIds = member.parentIds.map(id => {
            const num = parseInt(String(id));
            return isNaN(num) ? 0 : num; // Fallback to 0 if not a valid number
          }).filter(id => id > 0); // Filter out 0 values
          if (parentIds.length === 0) parentIds = undefined;
        }

        createMember({
          name: member.name,
          arabicName: member.arabicName,
          birth: member.birth,
          death: member.death,
          gender: member.gender,
          generation: member.generation,
          status: member.status,
          address: member.address,
          description: member.description,
          childNumber: member.childNumber,
          spouse: undefined, // familyData uses spouseName string, we store as JSON object
          parentIds: parentIds,
        });
        imported++;
      } catch (error) {
        console.error(`Failed to import ${member.name}:`, error);
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      failed,
      total: familyData.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to import data', details: String(error) },
      { status: 500 }
    );
  }
}
