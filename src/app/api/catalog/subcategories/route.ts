import { NextResponse } from 'next/server';
import { getSubcategories } from '@/lib/catalog-data';
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
    if (!body.name || !body.slug || !body.categorySlug) {
      return NextResponse.json({ success: false, error: 'Name, slug, and categorySlug are required' }, { status: 400 });
    }

    const subcategories = global.__cbhCatalogSubcategories!;
    const newSubcategory: CatalogSubcategory = {
      id: `sub-${Date.now()}`,
      slug: body.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      categorySlug: body.categorySlug.trim(),
      name: body.name.trim(),
      tagline: body.tagline || '',
      description: body.description || '',
      imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
      bannerUrl: body.bannerUrl || '',
      familiesCount: 0,
      featured: Boolean(body.featured),
      sortOrder: subcategories.length + 1,
    };

    subcategories.push(newSubcategory);
    return NextResponse.json({ success: true, message: 'Subcategory created', data: newSubcategory }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const subcategories = global.__cbhCatalogSubcategories!;
    const idx = subcategories.findIndex((s) => s.id === body.id || (s.slug === body.slug && s.categorySlug === body.categorySlug));
    if (idx === -1) {
      return NextResponse.json({ success: false, error: 'Subcategory not found' }, { status: 404 });
    }
    subcategories[idx] = { ...subcategories[idx], ...body };
    return NextResponse.json({ success: true, message: 'Subcategory updated', data: subcategories[idx] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    const subcategories = global.__cbhCatalogSubcategories!;
    const idx = subcategories.findIndex((s) => s.id === id || s.slug === slug);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: 'Subcategory not found' }, { status: 404 });
    }
    const removed = subcategories.splice(idx, 1)[0];
    return NextResponse.json({ success: true, message: 'Subcategory deleted', data: removed });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
