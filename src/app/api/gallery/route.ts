import { NextResponse } from 'next/server';
import {
  getAllGalleryItems,
  getGalleryItemById,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} from '@/lib/gallery-db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const category = searchParams.get('category');
    const search = searchParams.get('search')?.toLowerCase().trim() || '';
    const includeAll = searchParams.get('all') === 'true'; // For admin console

    // 1. Single item by ID
    if (id) {
      const item = await getGalleryItemById(id);
      if (!item) {
        return NextResponse.json({ success: false, error: 'Gallery item not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: item });
    }

    // 2. Collection
    let items = await getAllGalleryItems(category || undefined, includeAll);

    // Search filter
    if (search) {
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(search) ||
          (item.description && item.description.toLowerCase().includes(search)) ||
          (item.location && item.location.toLowerCase().includes(search)) ||
          (item.categoryLabel && item.categoryLabel.toLowerCase().includes(search)) ||
          (item.specs && item.specs.some((s) => s.toLowerCase().includes(search)))
      );
    }

    return NextResponse.json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch gallery items' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.title || !body.image) {
      return NextResponse.json(
        { success: false, error: 'Title and image URL are required fields' },
        { status: 400 }
      );
    }

    const created = await createGalleryItem({
      id: body.id,
      title: body.title.trim(),
      category: body.category || 'manufacturing',
      categoryLabel: body.categoryLabel,
      image: body.image.trim(),
      location: body.location?.trim() || '',
      date: body.date?.trim() || '',
      description: body.description?.trim() || '',
      specs: Array.isArray(body.specs)
        ? body.specs
        : typeof body.specs === 'string'
        ? body.specs.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [],
      sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : undefined,
      isActive: body.isActive !== false,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Gallery item "${created.title}" added successfully.`,
        data: created,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create gallery item' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (!body.id || !body.title || !body.image) {
      return NextResponse.json(
        { success: false, error: 'ID, title, and image are required for update' },
        { status: 400 }
      );
    }

    const updated = await updateGalleryItem({
      id: body.id,
      title: body.title.trim(),
      category: body.category || 'manufacturing',
      categoryLabel: body.categoryLabel,
      image: body.image.trim(),
      location: body.location?.trim() || '',
      date: body.date?.trim() || '',
      description: body.description?.trim() || '',
      specs: Array.isArray(body.specs)
        ? body.specs
        : typeof body.specs === 'string'
        ? body.specs.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [],
      sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : 0,
      isActive: body.isActive !== false,
    });

    return NextResponse.json({
      success: true,
      message: `Gallery item "${updated.title}" updated successfully.`,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update gallery item' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch {
        // no body
      }
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Item ID is required for deletion' },
        { status: 400 }
      );
    }

    await deleteGalleryItem(id);

    return NextResponse.json({
      success: true,
      message: 'Gallery item deleted successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete gallery item' },
      { status: 500 }
    );
  }
}
