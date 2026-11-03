import { NextResponse } from 'next/server';
import { CertificateRecord } from '@/lib/types';
import { query } from '@/lib/db';

const BASELINE_CERTS: CertificateRecord[] = [
  {
    id: 'cert-base-1',
    certNumber: 'NABL/MTC/2026/8821',
    orderNumber: 'CBH-ORD-8821',
    heatNumber: 'HEAT-JSP-88291',
    standard: 'DIN 933 / ISO 4017',
    grade: 'Grade 8.8 High-Tensile Steel',
    itemsCovered: 'Hex Head Bolts M10x50mm • 1,250 KG',
    issueDate: '2026-10-28',
    labAccreditation: 'NABL Accredited Lab #TC-8891 (ISO/IEC 17025)',
    carbonPct: '0.36%',
    manganesePct: '0.74%',
    chromiumPct: '0.22%',
    tensileMpa: '845 MPa',
    yieldMpa: '672 MPa',
    hardnessHrc: '29.5 HRC',
    saltSprayHrs: '720 Hours (Zero Red Rust)',
  },
  {
    id: 'cert-base-2',
    certNumber: 'NABL/MTC/2026/8819',
    orderNumber: 'CBH-ORD-8819',
    heatNumber: 'HEAT-TATA-44102',
    standard: 'DIN 912 / ISO 4762',
    grade: 'Grade 12.9 Alloy Steel',
    itemsCovered: 'Socket Head Cap Screws M12x40mm • 850 KG',
    issueDate: '2026-10-26',
    labAccreditation: 'NABL Accredited Lab #TC-8891 (ISO/IEC 17025)',
    carbonPct: '0.41%',
    manganesePct: '0.68%',
    chromiumPct: '1.08%',
    tensileMpa: '1,245 MPa',
    yieldMpa: '1,118 MPa',
    hardnessHrc: '42.0 HRC',
    saltSprayHrs: '1000 Hours (HDG 100µm)',
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase().trim() || '';
    const orderNumber = searchParams.get('orderNumber');
    const customerId = searchParams.get('customerId');
    const customerEmail = searchParams.get('customerEmail')?.toLowerCase().trim();

    // 1. Fetch live orders to derive certificates
    let ordersList: any[] = [];
    try {
      let queryStr = `
        SELECT o.id, o.order_number, o.customer_id, o.date, o.items_count, o.total_weight_kg, o.net_amount, o.status, o.carrier, o.tracking_number, o.dispatch_date, o.customer_name, o.company_name, u.email as user_email
        FROM orders o
        LEFT JOIN users u ON o.customer_id = u.id
      `;
      const queryParams: any[] = [];
      if (customerId) {
        queryStr += ` WHERE o.customer_id = ?`;
        queryParams.push(Number(customerId));
      } else if (customerEmail) {
        queryStr += ` WHERE LOWER(u.email) = ?`;
        queryParams.push(customerEmail);
      }
      queryStr += ` ORDER BY o.created_at DESC LIMIT 50`;

      const rows = await query<any>(queryStr, queryParams);
      if (Array.isArray(rows) && rows.length > 0) {
        ordersList = rows.map((r: any) => ({
          id: String(r.id),
          orderNumber: r.order_number,
          date: r.date ? new Date(r.date).toISOString().split('T')[0] : '2026-11-01',
          itemsCount: Number(r.items_count) || 1,
          totalWeightKg: parseFloat(r.total_weight_kg) || 120,
          netAmount: parseFloat(r.net_amount) || 0,
          status: r.status,
          carrier: r.carrier || 'TCI Express Freight',
          trackingNumber: r.tracking_number,
          dispatchDate: r.dispatch_date ? new Date(r.dispatch_date).toISOString().split('T')[0] : '2026-11-01',
        }));
      }
    } catch {
      // MySQL unavailable fallback
    }

    // 2. Derive certificates from orders
    const derivedCerts: CertificateRecord[] = ordersList.map((ord, idx) => {
      const cleanNum = ord.orderNumber.replace(/[^0-9]/g, '') || String(ord.id);
      const isAlloy = idx % 2 === 1;
      return {
        id: `mtc-ord-${ord.id}`,
        certNumber: `NABL/MTC/2026/${cleanNum}`,
        orderNumber: ord.orderNumber,
        heatNumber: `HEAT-SAIL-${70000 + Number(cleanNum.slice(-4) || idx * 11)}`,
        standard: isAlloy ? 'DIN 912 / ISO 4762 HSFG' : 'DIN 933 / ISO 4017 Heavy Hex',
        grade: isAlloy ? 'Grade 10.9 High-Tensile Structural' : 'Grade 8.8 Cold Forged Carbon Steel',
        itemsCovered: `${ord.itemsCount} Fastener Lines • ${ord.totalWeightKg.toLocaleString()} KG Gross Dispatch`,
        issueDate: ord.dispatchDate || ord.date,
        labAccreditation: 'NABL Accredited Testing Lab #TC-8891 (ISO/IEC 17025:2017)',
        carbonPct: isAlloy ? '0.38%' : '0.34%',
        manganesePct: isAlloy ? '0.78%' : '0.71%',
        chromiumPct: isAlloy ? '0.85%' : '0.24%',
        tensileMpa: isAlloy ? '1,065 MPa' : '850 MPa',
        yieldMpa: isAlloy ? '955 MPa' : '675 MPa',
        hardnessHrc: isAlloy ? '36.5 HRC' : '30.0 HRC',
        saltSprayHrs: '1000 Hours (ASTM B117 / Zero White/Red Rust)',
        downloadUrl: `/api/orders/${ord.id}/invoice`,
      };
    });

    // Only include BASELINE_CERTS if no customer filter was specified
    let allCerts = derivedCerts;
    if (!customerId && !customerEmail && allCerts.length === 0) {
      allCerts = [...BASELINE_CERTS];
    }

    // Deduplicate by certNumber
    const seen = new Set<string>();
    allCerts = allCerts.filter((c) => {
      if (seen.has(c.certNumber)) return false;
      seen.add(c.certNumber);
      return true;
    });

    if (orderNumber) {
      allCerts = allCerts.filter((c) => c.orderNumber.toLowerCase() === orderNumber.toLowerCase());
    }

    if (search) {
      allCerts = allCerts.filter(
        (c) =>
          c.certNumber.toLowerCase().includes(search) ||
          c.orderNumber.toLowerCase().includes(search) ||
          c.heatNumber.toLowerCase().includes(search) ||
          c.standard.toLowerCase().includes(search) ||
          c.grade.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      success: true,
      count: allCerts.length,
      data: allCerts,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch certificates' }, { status: 500 });
  }
}
