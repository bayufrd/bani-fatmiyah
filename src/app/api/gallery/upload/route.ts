import { NextRequest, NextResponse } from 'next/server';
import { addGalleryPhoto } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const year = formData.get('year') as string;
    const folderName = formData.get('folderName') as string;
    const albumTitle = formData.get('albumTitle') as string;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (!year || !folderName || !albumTitle) {
      return NextResponse.json({ error: 'Year, folder name, and album title required' }, { status: 400 });
    }

    const yearNum = parseInt(year);
    if (isNaN(yearNum)) {
      return NextResponse.json({ error: 'Invalid year' }, { status: 400 });
    }

    // Create safe folder name (replace spaces with hyphens)
    const safeFolderName = folderName.trim().replace(/\s+/g, '-').toLowerCase();
    const galleryPath = path.join(process.cwd(), 'public', 'gallery', `${year}_${safeFolderName}`);

    // Create folder if not exists
    if (!fs.existsSync(galleryPath)) {
      fs.mkdirSync(galleryPath, { recursive: true });
    }

    const uploadedPhotos = [];

    // Process each file
    for (const file of files) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        continue; // Skip invalid files
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        continue; // Skip oversized files
      }

      // Generate unique filename
      const timestamp = Date.now();
      const ext = file.name.split('.').pop();
      const safeFileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`;

      // Save file
      const filePath = path.join(galleryPath, safeFileName);
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(filePath, buffer);

      // Create database entry
      const photoPath = `/gallery/${year}_${safeFolderName}/${safeFileName}`;
      const galleryPhoto = addGalleryPhoto({
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        photoPath,
        year: yearNum,
        albumTitle,
      });

      uploadedPhotos.push(galleryPhoto);
    }

    return NextResponse.json({
      success: true,
      uploaded: uploadedPhotos.length,
      photos: uploadedPhotos,
    });
  } catch (error) {
    console.error('Gallery upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload gallery photos', details: String(error) },
      { status: 500 }
    );
  }
}
