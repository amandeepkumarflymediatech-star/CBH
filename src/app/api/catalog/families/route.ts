import { NextResponse } from 'next/server';
import { getFamilies, getFamilyBySlug } from '@/lib/catalog-data';
import { CatalogProductFamily } from '@/lib/catalog-types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const subcategory = searchParams.get('subcategory');
  const slug = searchParams.get('slug');

  if (slug) {
    const family = getFamilyBySlug(slug);
    if (!family) {
      return NextResponse.json({ success: false, error: 'Product family not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: family });
  }

  const families = getFamilies(category || undefined, subcategory || undefined);
  return NextResponse.json({ success: true, count: families.length, data: families });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.slug || !body.categorySlug || !body.subcategorySlug) {
      return NextResponse.json(
        { success: false, error: 'Name, slug, categorySlug, and subcategorySlug are required' },
        { status: 400 }
      );
    }

    const families = global.__cbhCatalogFamilies!;
    const newFamily: CatalogProductFamily = {
      id: `fam-${Date.now()}`,
      slug: body.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      name: body.name.trim(),
      categorySlug: body.categorySlug.trim(),
      subcategorySlug: body.subcategorySlug.trim(),
      headline: body.headline || '',
      claim: body.claim || '',
      description: body.description || '',
      heroImageUrl: body.heroImageUrl || 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1000&q=80',
      galleryImages: body.galleryImages || [body.heroImageUrl || 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1000&q=80'],
      videoUrl: body.videoUrl || '',
      topFeatures: body.topFeatures || [],
      advantages: body.advantages || [],
      applications: body.applications || [],
      buildingMaterials: body.buildingMaterials || [],
      materialsAvailable: body.materialsAvailable || [
        { id: 'gvz', name: 'Zinc-plated steel', code: 'gvz', badgeColor: '#3B82F6' },
      ],
      approvals: body.approvals || [],
      installationSteps: body.installationSteps || [],
      documents: body.documents || [],
      variants: body.variants || [],
      featured: Boolean(body.featured),
      sortOrder: families.length + 1,
      updatedAt: new Date().toISOString(),
    };

    families.push(newFamily);
    return NextResponse.json({ success: true, message: 'Product family created', data: newFamily }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const families = global.__cbhCatalogFamilies!;
    const idx = families.findIndex((f) => f.id === body.id || f.slug === body.slug);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: 'Product family not found' }, { status: 404 });
    }
    families[idx] = { ...families[idx], ...body, updatedAt: new Date().toISOString() };
    return NextResponse.json({ success: true, message: 'Product family updated', data: families[idx] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    const families = global.__cbhCatalogFamilies!;
    const idx = families.findIndex((f) => f.id === id || f.slug === slug);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: 'Product family not found' }, { status: 404 });
    }
    const removed = families.splice(idx, 1)[0];
    return NextResponse.json({ success: true, message: 'Product family deleted', data: removed });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
