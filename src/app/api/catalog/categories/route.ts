import { NextResponse } from 'next/server';
import {
  getAllCategories,
  getCategoryByIdOrSlug,
  createCategory,
  updateCategory,
  deleteCategory,
  resetCategoriesToDefault,
} from '@/lib/categories-db';
import { getSubcategories } from '@/lib/catalog-data';

export async function GET() {
  try {
    const categories = await getAllCategories();
    const subs = getSubcategories();
    const enriched = categories.map((c) => ({
      ...c,
      subcategoriesCount: subs.filter((s) => s.categorySlug === c.slug).length,
    }));
    return NextResponse.json({ success: true, count: enriched.length, data: enriched });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.action === 'reset') {
      const reset = resetCategoriesToDefault();
      return NextResponse.json({ success: true, message: 'Catalog reset to defaults', data: reset });
    }

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ success: false, error: 'Category name is required' }, { status: 400 });
    }

    const created = await createCategory(body);
    return NextResponse.json({ success: true, message: 'Category created successfully', data: created }, { status: 201 });
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

    const updated = await updateCategory(targetIdOrSlug, body);
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

    const success = await deleteCategory(target);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to delete category' }, { status: 500 });
  }
}
