import { NextResponse } from 'next/server';
import { UserAccount } from '@/lib/types';
import { query } from '@/lib/db';

let usersDb: UserAccount[] = [];

let availableUserColumns: Set<string> | null = null;

async function ensureUsersSchema(): Promise<Set<string>> {
  if (availableUserColumns && availableUserColumns.size > 0) {
    return availableUserColumns;
  }

  try {
    const cols = await query<any>('DESCRIBE users');
    const existing = new Set<string>(
      Array.isArray(cols) ? cols.map((c: any) => String(c.Field || c.field || '').toLowerCase()) : []
    );

    const colsToAdd: { name: string; type: string }[] = [
      { name: 'delivery_sites', type: 'LONGTEXT NULL' },
      { name: 'team_members', type: 'LONGTEXT NULL' },
      { name: 'notification_preferences', type: 'LONGTEXT NULL' },
      { name: 'designation', type: 'VARCHAR(255) NULL' },
      { name: 'pan', type: 'VARCHAR(50) NULL' },
      { name: 'tan', type: 'VARCHAR(50) NULL' },
      { name: 'msme', type: 'VARCHAR(100) NULL' },
      { name: 'avatar', type: 'LONGTEXT NULL' },
    ];

    for (const col of colsToAdd) {
      if (existing.size > 0 && !existing.has(col.name.toLowerCase())) {
        try {
          await query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
          existing.add(col.name.toLowerCase());
          console.log(`[Users API] Added missing column to users table: ${col.name}`);
        } catch (addErr: any) {
          console.warn(`[Users API] Notice on column ${col.name}:`, addErr?.message || addErr);
        }
      }
    }

    availableUserColumns = existing;
    return existing;
  } catch (err) {
    console.warn('[Users API] Schema check fallback:', err);
    return new Set<string>();
  }
}

async function getUsers(): Promise<UserAccount[]> {
  try {
    await ensureUsersSchema();
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
        address: r.address || '',
        role: r.role || 'customer',
        tier: r.tier || 'BRONZE',
        tierDiscountPct: parseFloat(r.tier_discount_pct) || 0,
        creditLimit: parseFloat(r.credit_limit) || 0,
        isVerified: Boolean(r.is_verified),
        joinedDate: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        createdAt: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        ordersCount: Number(r.orders_count) || 0,
        designation: r.designation || undefined,
        pan: r.pan || undefined,
        tan: r.tan || undefined,
        msme: r.msme || undefined,
        deliverySites: r.delivery_sites ? (typeof r.delivery_sites === 'string' ? JSON.parse(r.delivery_sites) : r.delivery_sites) : undefined,
        teamMembers: r.team_members ? (typeof r.team_members === 'string' ? JSON.parse(r.team_members) : r.team_members) : undefined,
        notificationPreferences: r.notification_preferences ? (typeof r.notification_preferences === 'string' ? JSON.parse(r.notification_preferences) : r.notification_preferences) : undefined,
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
    const validCols = await ensureUsersSchema();

    // Map fields to their corresponding MySQL columns
    const fieldMapping: { col: string; val: any }[] = [
      { col: 'full_name', val: updates.fullName ?? null },
      { col: 'company_name', val: updates.companyName ?? null },
      { col: 'email', val: updates.email ? updates.email.trim().toLowerCase() : null },
      { col: 'phone', val: updates.phone ?? null },
      { col: 'address', val: updates.address ?? null },
      { col: 'gstin', val: updates.gstin ?? null },
      { col: 'role', val: updates.role ? String(updates.role).toLowerCase() : null },
      { col: 'tier', val: updates.tier ? String(updates.tier).toUpperCase() : null },
      { col: 'tier_discount_pct', val: updates.tierDiscountPct !== undefined ? parseFloat(updates.tierDiscountPct) : null },
      { col: 'credit_limit', val: updates.creditLimit !== undefined ? parseFloat(updates.creditLimit) : null },
      { col: 'is_verified', val: updates.isVerified !== undefined ? (updates.isVerified ? 1 : 0) : null },
      { col: 'delivery_sites', val: updates.deliverySites ? JSON.stringify(updates.deliverySites) : null },
      { col: 'team_members', val: updates.teamMembers ? JSON.stringify(updates.teamMembers) : null },
      { col: 'notification_preferences', val: updates.notificationPreferences ? JSON.stringify(updates.notificationPreferences) : null },
      { col: 'designation', val: updates.designation ?? null },
      { col: 'pan', val: updates.pan ?? null },
      { col: 'tan', val: updates.tan ?? null },
      { col: 'msme', val: updates.msme ?? null },
      { col: 'avatar', val: updates.avatar ?? null },
    ];

    const clauses: string[] = [];
    const values: any[] = [];

    for (const f of fieldMapping) {
      if (validCols.size === 0) {
        // Fallback to core columns if schema could not be inspected
        const coreCols = ['full_name', 'company_name', 'email', 'phone', 'address', 'gstin', 'role', 'tier', 'tier_discount_pct', 'credit_limit', 'is_verified'];
        if (coreCols.includes(f.col)) {
          clauses.push(`${f.col} = COALESCE(?, ${f.col})`);
          values.push(f.val);
        }
      } else if (validCols.has(f.col.toLowerCase())) {
        clauses.push(`${f.col} = COALESCE(?, ${f.col})`);
        values.push(f.val);
      }
    }

    if (validCols.size === 0 || validCols.has('updated_at')) {
      clauses.push('updated_at = NOW()');
    }

    // 1. Update in MySQL
    if (clauses.length > 0) {
      try {
        values.push(numId);
        await query(
          `UPDATE users SET
            ${clauses.join(',\n            ')}
          WHERE id = ?`,
          values
        );
      } catch (dbErr) {
        console.warn('[Users API] MySQL update error:', dbErr);
      }
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
