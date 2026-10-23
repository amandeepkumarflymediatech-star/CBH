import { NextResponse } from 'next/server';
import { INITIAL_USERS } from '@/lib/mock-data';
import { UserAccount } from '@/lib/types';

let usersDb: UserAccount[] = [...INITIAL_USERS];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase() || '';
  const role = searchParams.get('role');
  const tier = searchParams.get('tier');
  const verified = searchParams.get('verified');
  const sortBy = searchParams.get('sortBy');

  let results = [...usersDb];

  if (search) {
    results = results.filter(
      (u) =>
        u.fullName.toLowerCase().includes(search) ||
        u.companyName.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search) ||
        u.gstin.toLowerCase().includes(search) ||
        u.phone.includes(search)
    );
  }

  if (role && role !== 'all') {
    results = results.filter((u) => u.role.toLowerCase() === role.toLowerCase());
  }

  if (tier && tier !== 'all') {
    results = results.filter((u) => u.tier.toLowerCase() === tier.toLowerCase());
  }

  if (verified === 'true') {
    results = results.filter((u) => u.isVerified);
  } else if (verified === 'false') {
    results = results.filter((u) => !u.isVerified);
  }

  if (sortBy === 'credit_desc') {
    results.sort((a, b) => b.creditLimit - a.creditLimit);
  } else if (sortBy === 'discount_desc') {
    results.sort((a, b) => b.tierDiscountPct - a.tierDiscountPct);
  } else if (sortBy === 'name_asc') {
    results.sort((a, b) => a.fullName.localeCompare(b.fullName));
  } else if (sortBy === 'company_asc') {
    results.sort((a, b) => a.companyName.localeCompare(b.companyName));
  }

  return NextResponse.json({
    success: true,
    count: results.length,
    total: usersDb.length,
    data: results,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.fullName || !body.email || !body.phone) {
      return NextResponse.json(
        { success: false, error: 'Full name, email, and phone are required' },
        { status: 400 }
      );
    }

    const newUser: UserAccount = {
      id: Date.now(),
      fullName: body.fullName.trim(),
      companyName: body.companyName ? body.companyName.trim() : 'Independent OEM Fabricator',
      email: body.email.trim().toLowerCase(),
      phone: body.phone.trim(),
      gstin: body.gstin ? body.gstin.trim().toUpperCase() : 'UNREGISTERED',
      role: body.role || 'CUSTOMER',
      tier: body.tier || 'BRONZE',
      tierDiscountPct: parseFloat(body.tierDiscountPct) || 0,
      creditLimit: parseFloat(body.creditLimit) || 500000,
      isVerified: Boolean(body.isVerified),
      city: body.city || 'Mumbai, MH',
      createdAt: new Date().toISOString().split('T')[0],
    };

    usersDb.unshift(newUser);

    return NextResponse.json(
      {
        success: true,
        message: `Account for ${newUser.fullName} (${newUser.companyName}) registered successfully.`,
        data: newUser,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'User creation failed' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const index = usersDb.findIndex((u) => u.id === Number(id));
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'User account not found' }, { status: 404 });
    }

    const updated: UserAccount = {
      ...usersDb[index],
      ...updates,
      tierDiscountPct: updates.tierDiscountPct !== undefined ? parseFloat(updates.tierDiscountPct) : usersDb[index].tierDiscountPct,
      creditLimit: updates.creditLimit !== undefined ? parseFloat(updates.creditLimit) : usersDb[index].creditLimit,
    };

    usersDb[index] = updated;

    return NextResponse.json({
      success: true,
      message: `Account details for ${updated.fullName} updated.`,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'User update failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const index = usersDb.findIndex((u) => u.id === Number(id));
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'User account not found' }, { status: 404 });
    }

    const deleted = usersDb.splice(index, 1)[0];

    return NextResponse.json({
      success: true,
      message: `Account ${deleted.fullName} suspended/removed from system.`,
      data: deleted,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'User deletion failed' }, { status: 500 });
  }
}
