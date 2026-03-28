/// <reference types="node" />
import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import path from 'path';
import fs from 'fs';

let db: SqlJsDatabase | null = null;
let SQL: Awaited<ReturnType<typeof initSqlJs>> | null = null;

export interface FamilyMember {
  id: number;
  name: string;
  nickname?: string;
  arabicName?: string;
  birth?: string;
  death?: string;
  gender?: string;
  generation: number;
  status?: string;
  address?: string;
  description?: string;
  childNumber?: number;
  parentIds?: number[];
  spouse?: string | any;
  photo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FamilyGallery {
  id: number;
  title: string;
  photoPath: string;
  year: number;
  albumTitle: string;
  uploadedAt: string;
  updatedAt: string;
}

// Helper to convert sql.js result to object array
function resultToObjects<T>(result: any): T[] {
  if (!result || result.length === 0) return [];
  const columns = result[0].columns as string[];
  const values = result[0].values as any[][];
  return values.map((row: any[]) => {
    const obj: any = {};
    columns.forEach((col: string, i: number) => {
      obj[col] = row[i];
    });
    return obj as T;
  });
}

// Save database to disk
function saveDb() {
  if (!db) return;
  try {
    const dataDir = path.join(process.cwd(), 'data');
    const dbPath = path.join(dataDir, 'family.db');
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (error) {
    console.error('❌ Failed to save database:', error);
  }
}

async function getDb(): Promise<SqlJsDatabase> {
  if (db) return db;

  try {
    // Initialize sql.js
    if (!SQL) {
      SQL = await initSqlJs();
    }

    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      console.log('📁 Creating data directory at:', dataDir);
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const dbPath = path.join(dataDir, 'family.db');
    console.log('🔧 Initializing database at:', dbPath);

    // Load existing database or create new
    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(fileBuffer);
      console.log('✅ Database loaded from file');
    } else {
      db = new SQL.Database();
      console.log('✅ New database created');
    }

    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');

    // Initialize tables if not exists
    db.run(`
      CREATE TABLE IF NOT EXISTS family_members (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        nickname TEXT,
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
        photo TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    db.run(`
      CREATE TABLE IF NOT EXISTS family_gallery (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        photoPath TEXT NOT NULL,
        year INTEGER NOT NULL,
        albumTitle TEXT NOT NULL,
        uploadedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Database tables initialized');

    // Check if tables have data
    const memberCountResult = db.exec('SELECT COUNT(*) as count FROM family_members');
    const galleryCountResult = db.exec('SELECT COUNT(*) as count FROM family_gallery');
    const memberCount = memberCountResult.length > 0 ? memberCountResult[0].values[0][0] : 0;
    const galleryCount = galleryCountResult.length > 0 ? galleryCountResult[0].values[0][0] : 0;
    console.log(`📊 Database status - Members: ${memberCount}, Gallery: ${galleryCount}`);

    // Migration: Add albumTitle column if it doesn't exist
    try {
      const columns = db.exec('PRAGMA table_info(family_gallery)');
      if (columns.length > 0) {
        const columnNames = columns[0].values.map((row: any) => row[1]);
        if (!columnNames.includes('albumTitle')) {
          console.log('🔄 Migrating: Adding albumTitle column to family_gallery');
          db.run(`ALTER TABLE family_gallery ADD COLUMN albumTitle TEXT NOT NULL DEFAULT 'Unnamed Album'`);
          saveDb();
          console.log('✅ Migration complete: albumTitle column added');
        }
      }
    } catch (error) {
      console.error('Migration error:', error);
    }

    // Save initial state
    saveDb();

    return db;
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw new Error(`Database initialization failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function initDb() {
  try {
    await getDb();
    await seedDatabaseIfEmpty();
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
  }
}

export async function getAllMembers(): Promise<FamilyMember[]> {
  const database = await getDb();
  const result = database.exec('SELECT * FROM family_members ORDER BY generation, name');
  return resultToObjects<FamilyMember>(result);
}

export async function getMemberById(id: number): Promise<FamilyMember | undefined> {
  const database = await getDb();
  const stmt = database.prepare('SELECT * FROM family_members WHERE id = ?');
  stmt.bind([id]);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row as unknown as FamilyMember;
  }
  stmt.free();
  return undefined;
}

export async function createMember(member: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<FamilyMember> {
  const database = await getDb();
  const now = new Date().toISOString();

  database.run(`
    INSERT INTO family_members (
      name, nickname, arabicName, birth, death, gender, generation, status, 
      address, description, childNumber, spouse, parentIds, photo, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    member.name, member.nickname || null, member.arabicName || null,
    member.birth || null, member.death || null, member.gender || null,
    member.generation, member.status || null, member.address || null,
    member.description || null, member.childNumber || null,
    typeof member.spouse === 'object' ? JSON.stringify(member.spouse) : (member.spouse || null),
    member.parentIds ? JSON.stringify(member.parentIds) : null,
    member.photo || null, now, now
  ]);

  const lastId = database.exec('SELECT last_insert_rowid() as id')[0].values[0][0] as number;
  saveDb();
  
  return (await getMemberById(lastId))!;
}

export async function updateMember(id: number, updates: Partial<FamilyMember>): Promise<FamilyMember | undefined> {
  const database = await getDb();
  const now = new Date().toISOString();

  const existing = await getMemberById(id);
  if (!existing) return undefined;

  const updated = { ...existing, ...updates, updatedAt: now };

  database.run(`
    UPDATE family_members SET
      name = ?, nickname = ?, arabicName = ?, birth = ?, death = ?, gender = ?,
      generation = ?, status = ?, address = ?, description = ?,
      childNumber = ?, spouse = ?, parentIds = ?, photo = ?, updatedAt = ?
    WHERE id = ?
  `, [
    updated.name, updated.nickname || null, updated.arabicName || null,
    updated.birth || null, updated.death || null, updated.gender || null,
    updated.generation, updated.status || null, updated.address || null,
    updated.description || null, updated.childNumber || null,
    typeof updated.spouse === 'object' ? JSON.stringify(updated.spouse) : (updated.spouse || null),
    updated.parentIds ? JSON.stringify(updated.parentIds) : null,
    updated.photo || null, now, id
  ]);

  saveDb();
  return getMemberById(id);
}

export async function deleteMember(id: number): Promise<boolean> {
  const database = await getDb();
  const before = database.exec('SELECT COUNT(*) FROM family_members WHERE id = ?', [id]);
  const countBefore = before.length > 0 ? before[0].values[0][0] as number : 0;
  
  if (countBefore === 0) return false;
  
  database.run('DELETE FROM family_members WHERE id = ?', [id]);
  saveDb();
  return true;
}

export async function searchMembers(query: string): Promise<FamilyMember[]> {
  const database = await getDb();
  const searchTerm = `%${query}%`;
  const result = database.exec(`
    SELECT * FROM family_members 
    WHERE name LIKE ? OR arabicName LIKE ? OR description LIKE ?
    ORDER BY generation, name
  `, [searchTerm, searchTerm, searchTerm]);
  return resultToObjects<FamilyMember>(result);
}

export async function getMembersByGeneration(generation: number): Promise<FamilyMember[]> {
  const database = await getDb();
  const result = database.exec('SELECT * FROM family_members WHERE generation = ? ORDER BY name', [generation]);
  return resultToObjects<FamilyMember>(result);
}

// Gallery functions
export async function getAllGallery(): Promise<FamilyGallery[]> {
  const database = await getDb();
  const result = database.exec('SELECT * FROM family_gallery ORDER BY year DESC, uploadedAt DESC');
  return resultToObjects<FamilyGallery>(result);
}

export async function getGalleryByYear(year: number): Promise<FamilyGallery[]> {
  const database = await getDb();
  const result = database.exec('SELECT * FROM family_gallery WHERE year = ? ORDER BY uploadedAt DESC', [year]);
  return resultToObjects<FamilyGallery>(result);
}

export async function addGalleryPhoto(photo: Omit<FamilyGallery, 'id' | 'uploadedAt' | 'updatedAt'>): Promise<FamilyGallery> {
  const database = await getDb();
  const now = new Date().toISOString();

  database.run(`
    INSERT INTO family_gallery (title, photoPath, year, albumTitle, uploadedAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [photo.title, photo.photoPath, photo.year, photo.albumTitle, now, now]);

  const lastId = database.exec('SELECT last_insert_rowid() as id')[0].values[0][0] as number;
  saveDb();

  return {
    id: lastId,
    ...photo,
    uploadedAt: now,
    updatedAt: now,
  };
}

export async function updateGalleryPhoto(id: number, updates: Partial<FamilyGallery>): Promise<FamilyGallery | undefined> {
  const database = await getDb();
  const now = new Date().toISOString();

  const existingResult = database.exec('SELECT * FROM family_gallery WHERE id = ?', [id]);
  if (existingResult.length === 0 || existingResult[0].values.length === 0) return undefined;

  const existing = resultToObjects<FamilyGallery>(existingResult)[0];
  const updated = { ...existing, ...updates, updatedAt: now };

  database.run(`
    UPDATE family_gallery SET title = ?, photoPath = ?, year = ?, albumTitle = ?, updatedAt = ?
    WHERE id = ?
  `, [updated.title, updated.photoPath, updated.year, updated.albumTitle, now, id]);

  saveDb();

  const result = database.exec('SELECT * FROM family_gallery WHERE id = ?', [id]);
  return resultToObjects<FamilyGallery>(result)[0];
}

export async function deleteGalleryPhoto(id: number): Promise<boolean> {
  const database = await getDb();
  const before = database.exec('SELECT COUNT(*) FROM family_gallery WHERE id = ?', [id]);
  const countBefore = before.length > 0 ? before[0].values[0][0] as number : 0;
  
  if (countBefore === 0) return false;
  
  database.run('DELETE FROM family_gallery WHERE id = ?', [id]);
  saveDb();
  return true;
}

// Auto-seed database from familyData if empty
export async function seedDatabaseIfEmpty() {
  try {
    const database = await getDb();
    const memberCountResult = database.exec('SELECT COUNT(*) as count FROM family_members');
    const memberCount = memberCountResult.length > 0 ? memberCountResult[0].values[0][0] as number : 0;

    if (memberCount === 0) {
      console.log('🌱 Database is empty, seeding with initial data...');

      try {
        // Dynamically import familyData
        const familyData = require('@/data/familyData').default;

        if (familyData && Array.isArray(familyData)) {
          for (const member of familyData) {
            const parentIds = Array.isArray(member.parentIds) ? JSON.stringify(member.parentIds) : JSON.stringify([]);
            const spouse = typeof member.spouse === 'object' ? JSON.stringify(member.spouse) : member.spouse;

            database.run(`
              INSERT OR REPLACE INTO family_members 
              (id, name, nickname, arabicName, birth, death, gender, generation, status, address, description, childNumber, spouse, parentIds, photo, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              member.id,
              member.name,
              member.nickname || null,
              member.arabicName || null,
              member.birth || null,
              member.death || null,
              member.gender || null,
              member.generation || 1,
              member.status || null,
              member.address || null,
              member.description || null,
              member.childNumber || null,
              spouse || null,
              parentIds,
              member.photo || null,
              new Date().toISOString(),
              new Date().toISOString()
            ]);
          }

          saveDb();
          console.log(`✅ Seeded database with ${familyData.length} members`);
        }
      } catch (error) {
        console.warn('⚠️  Could not seed from familyData:', error instanceof Error ? error.message : String(error));
      }
    }
  } catch (error) {
    console.error('❌ Seed database error:', error);
  }
}
