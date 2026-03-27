import { NextRequest, NextResponse } from 'next/server';
import { getAllGallery, getGalleryByYear, deleteGalleryPhoto, updateGalleryPhoto } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year');

    if (year) {
      const photos = getGalleryByYear(parseInt(year));
      return NextResponse.json(photos);
    }

    const photos = getAllGallery();
    return NextResponse.json(photos);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch gallery', details: String(error) },
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
    const photos = getAllGallery();
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
    const success = deleteGalleryPhoto(photoId);

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Photo deleted' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete photo', details: String(error) },
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
    const updated = updateGalleryPhoto(photoId, {
      title: data.title || undefined,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update photo', details: String(error) },
      { status: 500 }
    );
  }
}
