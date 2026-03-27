import Database from 'better-sqlite3';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { familyData } from '@/data/familyData';

export async function POST(request: NextRequest) {
  try {
    const dbPath = path.join(process.cwd(), 'data', 'family.db');
    const db = new Database(dbPath);

    // Clear dan recreate dengan INTEGER primary key
    db.exec(`
      DROP TABLE IF EXISTS family_members;
      CREATE TABLE family_members (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        arabicName TEXT,
        birth TEXT,
        death TEXT,
        gender TEXT,
        generation INTEGER NOT NULL,
        status TEXT,
        address TEXT,
        description TEXT,
        childNumber INTEGER,
        spouse TEXT,
        parentIds TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const stmt = db.prepare(`
      INSERT INTO family_members (
        id, name, arabicName, birth, death, gender, generation, status, 
        address, description, childNumber, spouse, parentIds
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Create ID mapping
    const idMapping: Record<string, number> = {};
    let newId = 1;
    familyData.forEach((member) => {
      idMapping[member.id] = newId++;
    });

    console.log(`Total mappings: ${Object.keys(idMapping).length}`);

    let success = 0;
    const errors: string[] = [];

    for (const m of familyData) {
      try {
        // Convert old string ID to new integer ID
        const numericId = idMapping[m.id];

        // Handle both parentId (singular) and parentIds (plural)
        let parentIdsArray: number[] = [];
        if (m.parentIds && Array.isArray(m.parentIds)) {
          parentIdsArray = m.parentIds
            .map((pId: string) => idMapping[pId])
            .filter((id: number | undefined) => id !== undefined) as number[];
        } else if (m.parentId && idMapping[m.parentId]) {
          parentIdsArray = [idMapping[m.parentId]];
        }

        stmt.run(
          numericId,
          m.name,
          m.arabicName || null,
          m.birth || null,
          m.death || null,
          m.gender || null,
          m.generation,
          m.status || null,
          m.address || null,
          m.description || null,
          m.childNumber || null,
          m.spouse ? JSON.stringify(m.spouse) : null,
          parentIdsArray.length > 0 ? JSON.stringify(parentIdsArray) : null
        );
        success++;
      } catch (e) {
        errors.push(`${m.id}: ${String(e)}`);
      }
    }

    db.close();

    console.log(`✅ Imported ${success}/${familyData.length} members`);
    if (errors.length > 0) {
      console.log(`⚠️  Errors: ${errors.length}`);
    }

    return NextResponse.json({
      success: true,
      imported: success,
      total: familyData.length,
      errors: errors.length > 0 ? errors.slice(0, 5) : [],
      message: `Imported ${success} members successfully with INTEGER IDs`,
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
