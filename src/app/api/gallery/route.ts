import { NextRequest, NextResponse } from 'next/server';
import { getAllGallery, getGalleryByYear, deleteGalleryPhoto, updateGalleryPhoto } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year');

    if (year) {
      const photos = await getGalleryByYear(parseInt(year));
      return NextResponse.json(photos);
    }

    const photos = await getAllGallery();
    return NextResponse.json(photos);
  } catch (error) {
    console.error('GET /api/gallery error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch gallery', 
        details: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const photoId = parseInt(id);

    // Get photo info before deleting
    const photos = await getAllGallery();
    const photo = photos.find(p => p.id === photoId);

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    // Delete file from filesystem
    const filePath = path.join(process.cwd(), 'public', photo.photoPath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    const success = await deleteGalleryPhoto(photoId);

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Photo deleted' });
  } catch (error) {
    console.error('DELETE /api/gallery error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete photo', 
        details: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const data = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const photoId = parseInt(id);
    const updated = await updateGalleryPhoto(photoId, {
      title: data.title || undefined,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /api/gallery error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update photo', 
        details: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}
