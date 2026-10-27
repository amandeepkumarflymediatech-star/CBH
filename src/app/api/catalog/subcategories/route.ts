import { NextResponse } from 'next/server';
import { getSubcategories, addSubcategory, updateSubcategory, deleteSubcategory } from '@/lib/catalog-data';
import { CatalogSubcategory } from '@/lib/catalog-types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get('category');
  const subcategories = getSubcategories(categorySlug || undefined);
  return NextResponse.json({ success: true, count: subcategories.length, data: subcategories });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ success: false, error: 'Subcategory name is required' }, { status: 400 });
    }
    if (!body.categorySlug || !body.categorySlug.trim()) {
      return NextResponse.json({ success: false, error: 'Parent category (categorySlug) is required' }, { status: 400 });
    }

    const rawSlug = body.slug?.trim() || body.name.trim();
    const slug = rawSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const categorySlug = body.categorySlug.trim();

    const existingSubs = getSubcategories();
    const duplicate = existingSubs.find((s) => s.slug === slug && s.categorySlug === categorySlug);
    if (duplicate) {
      return NextResponse.json(
        { success: false, error: `A subcategory with slug "${slug}" already exists in category "${categorySlug}"` },
        { status: 409 }
      );
    }

    const newSubcategory: CatalogSubcategory = {
      id: `sub-${Date.now()}`,
      slug,
      categorySlug,
      name: body.name.trim(),
      tagline: body.tagline?.trim() || '',
      description: body.description?.trim() || '',
      imageUrl: body.imageUrl?.trim() || 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
      bannerUrl: body.bannerUrl?.trim() || '',
      familiesCount: 0,
      featured: Boolean(body.featured),
      sortOrder: existingSubs.length + 1,
    };

    addSubcategory(newSubcategory);
    return NextResponse.json({ success: true, message: 'Subcategory created successfully', data: newSubcategory }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to create subcategory' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const targetIdOrSlug = body.id || body.slug;
    if (!targetIdOrSlug) {
      return NextResponse.json({ success: false, error: 'Subcategory id or slug is required for updating' }, { status: 400 });
    }

    const updated = updateSubcategory(targetIdOrSlug, {
      name: body.name?.trim(),
      categorySlug: body.categorySlug?.trim(),
      tagline: body.tagline !== undefined ? body.tagline.trim() : undefined,
      description: body.description !== undefined ? body.description.trim() : undefined,
      imageUrl: body.imageUrl?.trim(),
      bannerUrl: body.bannerUrl !== undefined ? body.bannerUrl.trim() : undefined,
      featured: body.featured !== undefined ? Boolean(body.featured) : undefined,
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Subcategory not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Subcategory updated successfully', data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to update subcategory' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    const target = id || slug;

    if (!target) {
      return NextResponse.json({ success: false, error: 'Subcategory id or slug parameter is required' }, { status: 400 });
    }

    const removed = deleteSubcategory(target);
    if (!removed) {
      return NextResponse.json({ success: false, error: 'Subcategory not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Subcategory deleted successfully', data: removed });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to delete subcategory' }, { status: 500 });
  }
}
