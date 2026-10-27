import { NextResponse } from 'next/server';
import { getCategories, addCategory, updateCategory, deleteCategory, resetCatalogToDefault } from '@/lib/catalog-data';
import { CatalogCategory } from '@/lib/catalog-types';

export async function GET() {
  const categories = getCategories();
  return NextResponse.json({ success: true, count: categories.length, data: categories });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.action === 'reset') {
      resetCatalogToDefault();
      return NextResponse.json({ success: true, message: 'Catalog reset to Fischer defaults' });
    }

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ success: false, error: 'Category name is required' }, { status: 400 });
    }

    const categories = getCategories();
    const rawSlug = body.slug?.trim() || body.name.trim();
    const slug = rawSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

    const existing = categories.find((c) => c.slug === slug);
    if (existing) {
      return NextResponse.json({ success: false, error: `A category with slug "${slug}" already exists` }, { status: 409 });
    }

    const newCategory: CatalogCategory = {
      id: `cat-${Date.now()}`,
      slug,
      name: body.name.trim(),
      tagline: body.tagline?.trim() || '',
      description: body.description?.trim() || '',
      imageUrl: body.imageUrl?.trim() || 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
      bannerUrl: body.bannerUrl?.trim() || '',
      subcategoriesCount: 0,
      productsCount: 0,
      featured: Boolean(body.featured),
      sortOrder: categories.length + 1,
    };

    addCategory(newCategory);
    return NextResponse.json({ success: true, message: 'Category created successfully', data: newCategory }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to create category' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const targetIdOrSlug = body.id || body.slug;
    if (!targetIdOrSlug) {
      return NextResponse.json({ success: false, error: 'Category id or slug is required for updating' }, { status: 400 });
    }

    const updated = updateCategory(targetIdOrSlug, {
      name: body.name?.trim(),
      tagline: body.tagline !== undefined ? body.tagline.trim() : undefined,
      description: body.description !== undefined ? body.description.trim() : undefined,
      imageUrl: body.imageUrl?.trim(),
      bannerUrl: body.bannerUrl !== undefined ? body.bannerUrl.trim() : undefined,
      featured: body.featured !== undefined ? Boolean(body.featured) : undefined,
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Category updated successfully', data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    const target = id || slug;

    if (!target) {
      return NextResponse.json({ success: false, error: 'Category id or slug parameter is required' }, { status: 400 });
    }

    const removed = deleteCategory(target);
    if (!removed) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Category deleted successfully', data: removed });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to delete category' }, { status: 500 });
  }
}
