import { NextResponse } from 'next/server';
import {
  getAllTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '@/lib/testimonials-db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const search = searchParams.get('search')?.toLowerCase().trim() || '';
    const category = searchParams.get('category');
    const featuredOnly = searchParams.get('featured') === 'true';
    const includeAll = searchParams.get('all') === 'true'; // For admin console to see HIDDEN too

    // Single item by ID
    if (id) {
      const item = await getTestimonialById(id);
      if (!item) {
        return NextResponse.json({ success: false, error: 'Testimonial not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: item });
    }

    // Collection query
    let items = await getAllTestimonials(includeAll);

    // Filter by featured
    if (featuredOnly) {
      items = items.filter((t) => t.featured);
    }

    // Filter by category
    if (category && category !== 'All') {
      items = items.filter((t) => (t.category || '').toLowerCase() === category.toLowerCase());
    }

    // Filter by search query
    if (search) {
      items = items.filter(
        (t) =>
          t.name.toLowerCase().includes(search) ||
          t.company.toLowerCase().includes(search) ||
          (t.role && t.role.toLowerCase().includes(search)) ||
          t.feedback.toLowerCase().includes(search) ||
          (t.verifiedPurchase && t.verifiedPurchase.toLowerCase().includes(search)) ||
          (t.location && t.location.toLowerCase().includes(search))
      );
    }

    return NextResponse.json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch testimonials' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.company || !body.feedback) {
      return NextResponse.json(
        { success: false, error: 'Name, Company, and Feedback are required fields' },
        { status: 400 }
      );
    }

    const created = await createTestimonial(body);
    return NextResponse.json({
      success: true,
      message: 'Testimonial created successfully',
      data: created,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create testimonial' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const id = body.id;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Testimonial ID is required for update' },
        { status: 400 }
      );
    }

    const updated = await updateTestimonial(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Testimonial not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Testimonial updated successfully',
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update testimonial' },
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
        id = body?.id;
      } catch {
        // body might be empty
      }
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Testimonial ID is required for deletion' },
        { status: 400 }
      );
    }

    const success = await deleteTestimonial(id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Testimonial not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Testimonial deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete testimonial' },
      { status: 500 }
    );
  }
}
