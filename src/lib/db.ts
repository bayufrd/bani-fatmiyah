import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database | null = null;

export interface FamilyMember {
  id: number; // Changed to number for INTEGER IDs
  name: string;
  nickname?: string; // Nama panggilan
  arabicName?: string;
  birth?: string;
  death?: string;
  gender?: string;
  generation: number;
  status?: string;
  address?: string;
  description?: string;
  childNumber?: number;
  parentIds?: number[]; // Changed to number array
  spouse?: string | any; // JSON string or parsed object
  photo?: string; // Path to photo file
  createdAt?: string;
  updatedAt?: string;
}

export interface FamilyGallery {
  id: number;
  title: string;
  photoPath: string;
  year: number;
  albumTitle: string;  // Judul album yang ditampilkan
  uploadedAt: string;
  updatedAt: string;
}

function getDb() {
  if (!db) {
    try {
      // Ensure data directory exists
      const fs = require('fs');
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        console.log('📁 Creating data directory at:', dataDir);
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      const dbPath = path.join(dataDir, 'family.db');
      console.log('🔧 Initializing database at:', dbPath);
      
      db = new Database(dbPath);
      console.log('✅ Database opened successfully');
      
      // Enable foreign keys
      db.pragma('foreign_keys = ON');
      
      // Initialize table if not exists - with INTEGER primary key
      db.exec(`
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
        );
        CREATE TABLE IF NOT EXISTS family_gallery (
          id INTEGER PRIMARY KEY,
          title TEXT NOT NULL,
          photoPath TEXT NOT NULL,
          year INTEGER NOT NULL,
          albumTitle TEXT NOT NULL,
          uploadedAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Database tables initialized');
      
      // Check if tables have data
      const memberCount = (db.prepare('SELECT COUNT(*) as count FROM family_members').get() as any).count;
      const galleryCount = (db.prepare('SELECT COUNT(*) as count FROM family_gallery').get() as any).count;
      console.log(`📊 Database status - Members: ${memberCount}, Gallery: ${galleryCount}`);
      
      // Migration: Add albumTitle column if it doesn't exist
      try {
        const columns = db.prepare(`PRAGMA table_info(family_gallery)`).all();
        const hasAlbumTitle = (columns as any[]).some(col => col.name === 'albumTitle');
        
        if (!hasAlbumTitle) {
          console.log('🔄 Migrating: Adding albumTitle column to family_gallery');
          db.exec(`ALTER TABLE family_gallery ADD COLUMN albumTitle TEXT NOT NULL DEFAULT 'Unnamed Album'`);
          console.log('✅ Migration complete: albumTitle column added');
        }
      } catch (error) {
        console.error('Migration error:', error);
      }
    } catch (error) {
      console.error('❌ Database initialization error:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));
      throw new Error(`Database initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  return db;
}

export function initDb() {
  try {
    getDb();
    seedDatabaseIfEmpty();
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
  }
}

export function getAllMembers(): FamilyMember[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM family_members ORDER BY generation, name');
  return stmt.all() as FamilyMember[];
}

export function getMemberById(id: number): FamilyMember | undefined {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM family_members WHERE id = ?');
  return stmt.get(id) as FamilyMember | undefined;
}

export function createMember(member: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>): FamilyMember {
  const db = getDb();
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    INSERT INTO family_members (
      name, nickname, arabicName, birth, death, gender, generation, status, 
      address, description, childNumber, spouse, parentIds, photo, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    member.name, member.nickname, member.arabicName, member.birth, member.death,
    member.gender, member.generation, member.status, member.address,
    member.description, member.childNumber, member.spouse,
    member.parentIds, member.photo, now, now
  );
  
  return getMemberById(result.lastInsertRowid as number)!;
}

export function updateMember(id: number, updates: Partial<FamilyMember>): FamilyMember | undefined {
  const db = getDb();
  const now = new Date().toISOString();
  
  const existing = getMemberById(id);
  if (!existing) return undefined;
  
  const updated = { ...existing, ...updates, updatedAt: now };
  
  const stmt = db.prepare(`
    UPDATE family_members SET
      name = ?, nickname = ?, arabicName = ?, birth = ?, death = ?, gender = ?,
      generation = ?, status = ?, address = ?, description = ?,
      childNumber = ?, spouse = ?, parentIds = ?, photo = ?, updatedAt = ?
    WHERE id = ?
  `);
  
  stmt.run(
    updated.name, updated.nickname, updated.arabicName, updated.birth, updated.death,
    updated.gender, updated.generation, updated.status, updated.address,
    updated.description, updated.childNumber, updated.spouse,
    updated.parentIds, updated.photo, now, id
  );
  
  return getMemberById(id);
}

export function deleteMember(id: number): boolean {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM family_members WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

export function searchMembers(query: string): FamilyMember[] {
  const db = getDb();
  const searchTerm = `%${query}%`;
  const stmt = db.prepare(`
    SELECT * FROM family_members 
    WHERE name LIKE ? OR arabicName LIKE ? OR description LIKE ?
    ORDER BY generation, name
  `);
  return stmt.all(searchTerm, searchTerm, searchTerm) as FamilyMember[];
}

export function getMembersByGeneration(generation: number): FamilyMember[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM family_members WHERE generation = ? ORDER BY name');
  return stmt.all(generation) as FamilyMember[];
}

// Gallery functions
export function getAllGallery(): FamilyGallery[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM family_gallery ORDER BY year DESC, uploadedAt DESC');
  return stmt.all() as FamilyGallery[];
}

export function getGalleryByYear(year: number): FamilyGallery[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM family_gallery WHERE year = ? ORDER BY uploadedAt DESC');
  return stmt.all(year) as FamilyGallery[];
}

export function addGalleryPhoto(photo: Omit<FamilyGallery, 'id' | 'uploadedAt' | 'updatedAt'>): FamilyGallery {
  const db = getDb();
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    INSERT INTO family_gallery (title, photoPath, year, albumTitle, uploadedAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(photo.title, photo.photoPath, photo.year, photo.albumTitle, now, now);
  
  return {
    id: result.lastInsertRowid as number,
    ...photo,
    uploadedAt: now,
    updatedAt: now,
  };
}

export function updateGalleryPhoto(id: number, updates: Partial<FamilyGallery>): FamilyGallery | undefined {
  const db = getDb();
  const now = new Date().toISOString();
  
  const existing = db.prepare('SELECT * FROM family_gallery WHERE id = ?').get(id) as FamilyGallery | undefined;
  if (!existing) return undefined;
  
  const updated = { ...existing, ...updates, updatedAt: now };
  
  const stmt = db.prepare(`
    UPDATE family_gallery SET title = ?, photoPath = ?, year = ?, albumTitle = ?, updatedAt = ?
    WHERE id = ?
  `);
  
  stmt.run(updated.title, updated.photoPath, updated.year, updated.albumTitle, now, id);
  
  return db.prepare('SELECT * FROM family_gallery WHERE id = ?').get(id) as FamilyGallery;
}

export function deleteGalleryPhoto(id: number): boolean {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM family_gallery WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

// Auto-seed database from familyData if empty
export function seedDatabaseIfEmpty() {
  try {
    const db = getDb();
    const memberCount = (db.prepare('SELECT COUNT(*) as count FROM family_members').get() as any).count;
    
    if (memberCount === 0) {
      console.log('🌱 Database is empty, seeding with initial data...');
      
      try {
        // Dynamically import familyData
        const familyData = require('@/data/familyData').default;
        
        if (familyData && Array.isArray(familyData)) {
          const insertStmt = db.prepare(`
            INSERT OR REPLACE INTO family_members 
            (id, name, nickname, arabicName, birth, death, gender, generation, status, address, description, childNumber, spouse, parentIds, photo, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          
          for (const member of familyData) {
            const parentIds = Array.isArray(member.parentIds) ? JSON.stringify(member.parentIds) : JSON.stringify([]);
            const spouse = typeof member.spouse === 'object' ? JSON.stringify(member.spouse) : member.spouse;
            
            insertStmt.run(
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
            );
          }
          
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
