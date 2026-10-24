import { NextResponse } from 'next/server';
import { getCategories, resetCatalogToDefault } from '@/lib/catalog-data';
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

    if (!body.name || !body.slug) {
      return NextResponse.json({ success: false, error: 'Name and slug are required' }, { status: 400 });
    }

    const categories = getCategories();
    const newCategory: CatalogCategory = {
      id: `cat-${Date.now()}`,
      slug: body.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      name: body.name.trim(),
      tagline: body.tagline || '',
      description: body.description || '',
      imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
      bannerUrl: body.bannerUrl || '',
      subcategoriesCount: 0,
      productsCount: 0,
      featured: Boolean(body.featured),
      sortOrder: categories.length + 1,
    };

    categories.push(newCategory);
    return NextResponse.json({ success: true, message: 'Category created', data: newCategory }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const categories = getCategories();
    const idx = categories.findIndex((c) => c.id === body.id || c.slug === body.slug);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }
    categories[idx] = { ...categories[idx], ...body };
    return NextResponse.json({ success: true, message: 'Category updated', data: categories[idx] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    const categories = getCategories();
    const idx = categories.findIndex((c) => c.id === id || c.slug === slug);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }
    const removed = categories.splice(idx, 1)[0];
    return NextResponse.json({ success: true, message: 'Category deleted', data: removed });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
