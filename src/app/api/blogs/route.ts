import { NextResponse } from 'next/server';
import {
  getAllBlogs,
  getBlogByIdOrSlug,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  incrementBlogViews,
} from '@/lib/blogs-db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    const search = searchParams.get('search')?.toLowerCase().trim() || '';
    const category = searchParams.get('category');
    const includeAll = searchParams.get('all') === 'true'; // For admin console
    const trackView = searchParams.get('trackView') === 'true';

    // 1. Single Blog by ID or Slug
    const queryTarget = slug || id;
    if (queryTarget) {
      const blog = await getBlogByIdOrSlug(queryTarget);
      if (!blog) {
        return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
      }

      if (trackView) {
        // Fire-and-forget view count increment
        incrementBlogViews(queryTarget).catch(() => {});
      }

      return NextResponse.json({ success: true, data: blog });
    }

    // 2. Collection Query
    let blogs = await getAllBlogs(includeAll);

    // Filter by Category
    if (category && category !== 'All') {
      blogs = blogs.filter((b) => b.category.toLowerCase() === category.toLowerCase());
    }

    // Filter by Search Query
    if (search) {
      blogs = blogs.filter(
        (b) =>
          b.title.toLowerCase().includes(search) ||
          b.excerpt.toLowerCase().includes(search) ||
          b.content.toLowerCase().includes(search) ||
          (b.author && b.author.toLowerCase().includes(search)) ||
          (b.tags && b.tags.some((t) => t.toLowerCase().includes(search)))
      );
    }

    return NextResponse.json({
      success: true,
      count: blogs.length,
      data: blogs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.title || !body.excerpt || !body.content) {
      return NextResponse.json(
        { success: false, error: 'Title, excerpt, and content are required fields' },
        { status: 400 }
      );
    }

    const created = await createBlogPost({
      slug: body.slug,
      title: body.title,
      excerpt: body.excerpt,
      content: body.content,
      category: body.category || 'Standards & Compliance',
      readTime: body.readTime || '5 min read',
      date: body.date,
      author: body.author || 'Technical Engineering Team',
      image: body.image || '/assets/exhibitions/exhibition_stand_branded.jpg',
      featured: Boolean(body.featured),
      status: body.status || 'PUBLISHED',
      tags: body.tags || [],
    });

    return NextResponse.json(
      {
        success: true,
        message: `Article "${created.title}" published successfully.`,
        data: created,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create blog post' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const id = body.id || body.slug;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Article ID or slug is required for updates' },
        { status: 400 }
      );
    }

    const existing = await getBlogByIdOrSlug(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    const updated = await updateBlogPost({
      ...existing,
      ...body,
      id: existing.id,
      slug: body.slug || existing.slug,
    });

    return NextResponse.json({
      success: true,
      message: `Article "${updated.title}" updated successfully.`,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || searchParams.get('slug');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Article ID or slug is required' },
        { status: 400 }
      );
    }

    await deleteBlogPost(id);

    return NextResponse.json({
      success: true,
      message: 'Article removed successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}
