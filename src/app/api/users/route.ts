import { NextResponse } from 'next/server';
import { UserAccount } from '@/lib/types';
import { query } from '@/lib/db';

let usersDb: UserAccount[] = [];

async function getUsers(): Promise<UserAccount[]> {
  try {
    const rows = await query<any>(`
      SELECT u.*,
             (SELECT COUNT(*) FROM orders WHERE customer_id = u.id) as orders_count
      FROM users u
      ORDER BY u.created_at DESC
    `);
    if (Array.isArray(rows)) {
      if (rows.length === 0) return [];
      return rows.map((r: any) => ({
        id: Number(r.id),
        fullName: r.full_name,
        companyName: r.company_name || 'Enterprise Client',
        email: r.email,
        gstin: r.gstin || '',
        phone: r.phone || '',
        role: r.role || 'customer',
        tier: r.tier || 'BRONZE',
        tierDiscountPct: parseFloat(r.tier_discount_pct) || 0,
        creditLimit: parseFloat(r.credit_limit) || 0,
        isVerified: Boolean(r.is_verified),
        joinedDate: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        createdAt: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        ordersCount: Number(r.orders_count) || 0,
      }));
    }
  } catch (err) {
    console.warn('[Users API] MySQL query fallback:', err);
  }
  return usersDb;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase() || '';
  const role = searchParams.get('role');
  const tier = searchParams.get('tier');
  const verified = searchParams.get('verified');
  const sortBy = searchParams.get('sortBy');

  const allUsers = await getUsers();
  let results = [...allUsers];

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
    total: allUsers.length,
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

    let createdId = Date.now();

    // 1. Insert into MySQL
    try {
      const res: any = await query(
        `INSERT INTO users (full_name, company_name, email, phone, gstin, role, tier, tier_discount_pct, credit_limit, is_verified, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          body.fullName.trim(),
          body.companyName ? body.companyName.trim() : 'Enterprise Client',
          body.email.trim().toLowerCase(),
          body.phone.trim(),
          body.gstin ? body.gstin.trim().toUpperCase() : 'UNREGISTERED',
          body.role ? String(body.role).toLowerCase() : 'customer',
          body.tier ? String(body.tier).toUpperCase() : 'BRONZE',
          parseFloat(body.tierDiscountPct) || 0,
          parseFloat(body.creditLimit) || 500000,
          body.isVerified ? 1 : 0,
        ]
      );
      if (res && res.insertId) {
        createdId = res.insertId;
      }
    } catch (dbErr) {
      console.warn('[Users API] MySQL insert error:', dbErr);
    }

    const newUser: UserAccount = {
      id: createdId,
      fullName: body.fullName.trim(),
      companyName: body.companyName ? body.companyName.trim() : 'Enterprise Client',
      email: body.email.trim().toLowerCase(),
      phone: body.phone.trim(),
      gstin: body.gstin ? body.gstin.trim().toUpperCase() : 'UNREGISTERED',
      role: body.role || 'CUSTOMER',
      tier: body.tier || 'BRONZE',
      tierDiscountPct: parseFloat(body.tierDiscountPct) || 0,
      creditLimit: parseFloat(body.creditLimit) || 500000,
      isVerified: Boolean(body.isVerified),
      city: body.city || 'Ludhiana, PB',
      createdAt: new Date().toISOString().split('T')[0],
      ordersCount: 0,
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

    const numId = Number(id);

    // 1. Update in MySQL
    try {
      await query(
        `UPDATE users SET
          full_name = COALESCE(?, full_name),
          company_name = COALESCE(?, company_name),
          email = COALESCE(?, email),
          phone = COALESCE(?, phone),
          gstin = COALESCE(?, gstin),
          role = COALESCE(?, role),
          tier = COALESCE(?, tier),
          tier_discount_pct = COALESCE(?, tier_discount_pct),
          credit_limit = COALESCE(?, credit_limit),
          is_verified = COALESCE(?, is_verified),
          updated_at = NOW()
        WHERE id = ?`,
        [
          updates.fullName ?? null,
          updates.companyName ?? null,
          updates.email ? updates.email.trim().toLowerCase() : null,
          updates.phone ?? null,
          updates.gstin ?? null,
          updates.role ? String(updates.role).toLowerCase() : null,
          updates.tier ? String(updates.tier).toUpperCase() : null,
          updates.tierDiscountPct !== undefined ? parseFloat(updates.tierDiscountPct) : null,
          updates.creditLimit !== undefined ? parseFloat(updates.creditLimit) : null,
          updates.isVerified !== undefined ? (updates.isVerified ? 1 : 0) : null,
          numId,
        ]
      );
    } catch (dbErr) {
      console.warn('[Users API] MySQL update error:', dbErr);
    }

    // 2. Also sync in memory fallback if present
    const index = usersDb.findIndex((u) => u.id === numId);
    let updated: any = { id: numId, ...updates };
    if (index !== -1) {
      updated = {
        ...usersDb[index],
        ...updates,
        tierDiscountPct: updates.tierDiscountPct !== undefined ? parseFloat(updates.tierDiscountPct) : usersDb[index].tierDiscountPct,
        creditLimit: updates.creditLimit !== undefined ? parseFloat(updates.creditLimit) : usersDb[index].creditLimit,
      };
      usersDb[index] = updated;
    }

    return NextResponse.json({
      success: true,
      message: `Account details updated.`,
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

    const numId = Number(id);

    // 1. Delete from MySQL
    try {
      // Disconnect foreign keys from orders and bulk_rfqs first to prevent FK constraint failures
      await query('UPDATE orders SET customer_id = NULL WHERE customer_id = ?', [numId]);
      await query('UPDATE bulk_rfqs SET customer_id = NULL WHERE customer_id = ?', [numId]);
      await query('DELETE FROM users WHERE id = ?', [numId]);
    } catch (dbErr) {
      console.warn('[Users API] MySQL delete error:', dbErr);
    }

    // 2. Also remove from in-memory / fallback store if present
    const index = usersDb.findIndex((u) => u.id === numId);
    let deleted: any = null;
    if (index !== -1) {
      deleted = usersDb.splice(index, 1)[0];
    }

    return NextResponse.json({
      success: true,
      message: `Account #${numId} deleted successfully from system.`,
      data: deleted || { id: numId },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'User deletion failed' }, { status: 500 });
  }
}
