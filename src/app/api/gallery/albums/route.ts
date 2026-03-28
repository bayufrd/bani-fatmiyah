import { NextResponse } from 'next/server';
import { getAllGallery } from '@/lib/db';
import fs from 'fs';
import path from 'path';

interface AlbumByYear {
  year: number;
  albums: string[];
}

/**
 * GET /api/gallery/albums
 * Returns albums grouped by year, sorted from newest to oldest
 * Only includes albums that have photos in database
 */
export async function GET() {
  try {
    const albumsByYear = new Map<number, Set<string>>();

    // Get albums from database (only those with actual photos)
    const galleryPhotos = await getAllGallery();
    galleryPhotos.forEach((photo) => {
      if (photo.albumTitle) {
        if (!albumsByYear.has(photo.year)) {
          albumsByYear.set(photo.year, new Set());
        }
        albumsByYear.get(photo.year)!.add(photo.albumTitle);
      }
    });

    // Convert to sorted array (newest to oldest)
    const result: AlbumByYear[] = Array.from(albumsByYear.entries())
      .map(([year, albums]) => ({
        year,
        albums: Array.from(albums).sort(),
      }))
      .sort((a, b) => b.year - a.year); // Sort by year descending (newest first)

    return NextResponse.json({
      success: true,
      albumsByYear: result,
      total: result.reduce((sum, ay) => sum + ay.albums.length, 0),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch albums', details: String(error) },
      { status: 500 }
    );
  }
}
