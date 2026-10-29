import { query } from './db';
import { CustomerOrder } from './types';

export interface CreateOrderParams {
  orderNumber: string;
  customerId?: number | null;
  customerName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  shippingAddress: string;
  pincode?: string;
  grossAmount?: number;
  discountAmount?: number;
  gstAmount?: number;
  netAmount: number;
  totalWeightKg: number;
  itemsCount?: number;
  status?: string;
  paymentStatus?: string;
  carrier?: string;
  trackingNumber?: string;
  dispatchDate?: string;
  estimatedDelivery?: string;
  mtcCertNumber?: string;
  erpnextSalesOrderId?: string;
  items?: Array<{
    sku: string;
    name?: string;
    standard?: string;
    quantity: number;
    unit?: string;
    rate: number;
    weightKg?: number;
  }>;
}

/**
 * Persists a new customer order and its line items directly into MySQL.
 * Safe and idempotent: if order_number already exists, updates instead of crashing.
 */
export async function saveOrderToMySQL(params: CreateOrderParams): Promise<number | null> {
  try {
    const net = Number(params.netAmount) || 0;
    const gross = Number(params.grossAmount) || +(net / 1.18).toFixed(2);
    const gst = Number(params.gstAmount) || +(net - gross).toFixed(2);
    const discount = Number(params.discountAmount) || 0;
    const weight = Number(params.totalWeightKg) || 0;

    // Extract 6-digit Indian pincode if not explicitly provided
    let pincode = params.pincode || '';
    if (!pincode && params.shippingAddress) {
      const pinMatch = params.shippingAddress.match(/\b\d{6}\b/);
      if (pinMatch) pincode = pinMatch[0];
    }
    if (!pincode) pincode = '400001';

    const orderStatus = params.status || 'PROCESSING';
    const paymentStatus = params.paymentStatus || 'PAID';
    const carrier = params.carrier || 'TCI Freight Express';
    const trackingNumber = params.trackingNumber || `TCI-${Math.floor(100000 + Math.random() * 900000)}`;
    const mtcNumber = params.mtcCertNumber || `MTC-CBH-2026-${Math.floor(1000 + Math.random() * 9000)}-NABL`;

    // 1. Check if order already exists in MySQL
    const existing = await query<any>(
      'SELECT id FROM orders WHERE order_number = ? LIMIT 1',
      [params.orderNumber]
    );

    let orderId: number;

    if (existing && existing.length > 0) {
      orderId = (existing[0] as any).id;
      await query(
        `UPDATE orders SET
          net_amount = ?,
          total_weight_kg = ?,
          order_status = ?,
          payment_status = ?,
          erpnext_sales_order_id = COALESCE(?, erpnext_sales_order_id),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [net, weight, orderStatus, paymentStatus, params.erpnextSalesOrderId || null, orderId]
      );
    } else {
      const res: any = await query(
        `INSERT INTO orders (
          order_number, customer_id, gross_amount, discount_amount, gst_amount, net_amount,
          total_weight_kg, shipping_address, delivery_pincode, carrier_name, tracking_number,
          order_status, payment_status, mtc_document_url, erpnext_sales_order_id, company_name, customer_name
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          params.orderNumber,
          params.customerId || null,
          gross,
          discount,
          gst,
          net,
          weight,
          params.shippingAddress || 'Factory Gate, Industrial Area',
          pincode,
          carrier,
          trackingNumber,
          orderStatus,
          paymentStatus,
          mtcNumber,
          params.erpnextSalesOrderId || null,
          params.companyName || 'Enterprise Buyer',
          params.customerName || 'Procurement In-Charge',
        ]
      );
      orderId = res.insertId;
    }

    // 2. Insert line items if provided
    if (params.items && Array.isArray(params.items) && params.items.length > 0) {
      // Clear previous items if re-saving existing order
      await query('DELETE FROM order_items WHERE order_id = ?', [orderId]);

      const itemRows = params.items.map((it) => {
        const qty = Number(it.quantity) || 1;
        const rate = Number(it.rate) || 0;
        const total = +(qty * rate).toFixed(2);
        return [
          orderId,
          null, // product_id
          it.sku || 'CBH-FASTENER',
          it.name || it.sku || 'High Tensile Fastener',
          it.standard || 'DIN 933',
          qty,
          it.unit || 'Nos',
          rate,
          total,
        ];
      });

      await query(
        `INSERT INTO order_items (
          order_id, product_id, sku, item_name, standard, quantity, unit, unit_price, row_total
        ) VALUES ?`,
        [itemRows]
      );
    }

    return orderId;
  } catch (err) {
    console.error('[saveOrderToMySQL] Error persisting order to MySQL:', err);
    return null;
  }
}

/**
 * Retrieves all customer orders from MySQL with customer and items count.
 */
export async function getOrdersFromMySQL(): Promise<CustomerOrder[]> {
  try {
    const rows = await query<any>(`
      SELECT o.*,
             COALESCE(o.customer_name, u.full_name, 'Procurement In-Charge') as resolved_customer_name,
             COALESCE(o.company_name, u.company_name, 'Enterprise Client') as resolved_company_name,
             COALESCE(u.email, '') as user_email,
             COALESCE(u.phone, '') as user_phone,
             COALESCE(u.gstin, '') as user_gstin,
             (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count
      FROM orders o
      LEFT JOIN users u ON o.customer_id = u.id
      ORDER BY o.created_at DESC
    `);

    if (Array.isArray(rows) && rows.length > 0) {
      let itemRows: any[] = [];
      try {
        itemRows = await query<any>(`
          SELECT order_id, sku, item_name as name, standard, quantity, unit, unit_price as rate, row_total as rowTotal
          FROM order_items
        `);
      } catch (e) {
        console.warn('[getOrdersFromMySQL] Could not fetch order_items:', e);
      }

      const itemsByOrder: Record<string, any[]> = {};
      if (Array.isArray(itemRows)) {
        for (const item of itemRows) {
          const oid = String(item.order_id);
          if (!itemsByOrder[oid]) itemsByOrder[oid] = [];
          itemsByOrder[oid].push({
            sku: item.sku || 'CBH-FASTENER',
            name: item.name || item.sku || 'High Tensile Fastener',
            standard: item.standard || 'DIN',
            quantity: Number(item.quantity) || 1,
            unit: item.unit || 'Nos',
            rate: Number(item.rate) || 0,
            rowTotal: Number(item.rowTotal) || 0,
          });
        }
      }

      return rows.map((r: any) => ({
        id: String(r.id),
        orderNumber: r.order_number,
        date: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        customerName: r.resolved_customer_name,
        companyName: r.resolved_company_name,
        email: r.user_email || undefined,
        phone: r.user_phone || undefined,
        gstin: r.user_gstin || undefined,
        deliveryPincode: r.delivery_pincode || undefined,
        paymentStatus: r.payment_status || 'PAID',
        grossAmount: parseFloat(r.gross_amount) || +(parseFloat(r.net_amount) / 1.18).toFixed(2),
        discountAmount: parseFloat(r.discount_amount) || 0,
        gstAmount: parseFloat(r.gst_amount) || +(parseFloat(r.net_amount) - (parseFloat(r.gross_amount) || 0)).toFixed(2),
        itemsCount: Number(r.items_count) || (itemsByOrder[String(r.id)]?.length || 1),
        totalWeightKg: parseFloat(r.total_weight_kg) || 0,
        netAmount: parseFloat(r.net_amount) || 0,
        status: r.order_status || 'PROCESSING',
        carrier: r.carrier_name || 'Blue Dart Express',
        trackingNumber: r.tracking_number || '',
        dispatchDate: r.dispatch_date ? new Date(r.dispatch_date).toISOString().split('T')[0] : '',
        shippingAddress: r.shipping_address || '',
        mtcCertNumber: r.mtc_document_url || 'MTC-CBH-2025-NABL',
        erpnextSalesOrderId: r.erpnext_sales_order_id || undefined,
        items: itemsByOrder[String(r.id)] || [],
      }));
    }
  } catch (err) {
    console.warn('[getOrdersFromMySQL] Fallback:', err);
  }
  return [];
}
