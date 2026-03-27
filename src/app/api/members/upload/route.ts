import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const memberId = formData.get('memberId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!memberId) {
      return NextResponse.json({ error: 'No memberId provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'members', memberId);
    await mkdir(uploadDir, { recursive: true });

    // Generate filename with timestamp
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `profile.${ext}`;
    const filepath = join(uploadDir, filename);

    // Read file and write to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Return the relative path for storage in database
    const photoPath = `/members/${memberId}/profile.${ext}`;

    return NextResponse.json({ success: true, photoPath, filename });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to upload file', details: String(error) },
      { status: 500 }
    );
  }
}
