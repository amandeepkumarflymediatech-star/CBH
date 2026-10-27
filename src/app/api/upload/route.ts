import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let buffer: Buffer;
    let originalName = 'product-image';
    let ext = '.jpg';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json(
          { success: false, error: 'No image file uploaded' },
          { status: 400 }
        );
      }

      originalName = file.name;
      const detectedExt = path.extname(file.name).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'].includes(detectedExt)) {
        ext = detectedExt;
      }
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else if (contentType.includes('application/json')) {
      const body = await request.json();
      const base64Data = body.image || body.file;
      if (!base64Data) {
        return NextResponse.json(
          { success: false, error: 'No image data provided' },
          { status: 400 }
        );
      }

      // Handle data:image/png;base64,...
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        if (mimeType.includes('png')) ext = '.png';
        else if (mimeType.includes('webp')) ext = '.webp';
        else if (mimeType.includes('svg')) ext = '.svg';
        else ext = '.jpg';
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(base64Data, 'base64');
      }

      if (body.filename) {
        originalName = body.filename;
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Unsupported Content-Type. Use multipart/form-data or application/json' },
        { status: 400 }
      );
    }

    // Sanitize filename
    const cleanStem = path
      .basename(originalName, path.extname(originalName))
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    const uniqueFileName = `fastener-${cleanStem}-${Date.now()}${ext}`;

    const uploadDir = path.join(process.cwd(), 'public', 'assets', 'products');
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, uniqueFileName);
    await writeFile(filePath, buffer);

    const publicUrl = `/assets/products/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: uniqueFileName,
      sizeBytes: buffer.length,
    });
  } catch (error: any) {
    console.error('Image upload failed:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Image upload failed' },
      { status: 500 }
    );
  }
}
