import fs from 'fs';
import path from 'path';
import { query } from './db';
import { CustomProductRequest, CustomRequestStatus, Product } from './types';
import { getProductsDb, setProductsDb } from './products-db';
import { syncProductsToMySQL } from './sync-products-mysql';
import { ensureItemInErpNext } from './erpnext';

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'custom-product-requests.json');

let memoryRequests: CustomProductRequest[] = [];
let isTableInitialized = false;

function loadLocalRequests(): CustomProductRequest[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8').trim();
      if (content) {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch (err) {
    console.error('[CustomRequests] Failed to read local requests file:', err);
  }
  return [];
}

function saveLocalRequests(list: CustomProductRequest[]): void {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('[CustomRequests] Failed to save local requests file:', err);
  }
}

export async function initCustomRequestsTable(): Promise<void> {
  if (isTableInitialized) return;
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS custom_product_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        request_number VARCHAR(64) UNIQUE NOT NULL,
        customer_id INT NULL,
        customer_name VARCHAR(128) NOT NULL,
        company_name VARCHAR(128) NULL,
        customer_email VARCHAR(128) NOT NULL,
        customer_phone VARCHAR(32) NOT NULL,
        shipping_pincode VARCHAR(16) NULL,
        product_name VARCHAR(255) NOT NULL,
        category VARCHAR(64) DEFAULT 'Hex Screws',
        sub_category VARCHAR(64) NULL,
        standard VARCHAR(64) DEFAULT 'DIN 933',
        grade VARCHAR(64) DEFAULT '8.8',
        finish VARCHAR(64) DEFAULT 'SELF',
        thread_type VARCHAR(64) DEFAULT 'Full Thread',
        diameter VARCHAR(32) NOT NULL,
        length_mm INT NOT NULL,
        pitch_mm DECIMAL(6,2) NOT NULL,
        size_formatted VARCHAR(64) NOT NULL,
        quantity_required DECIMAL(12,2) NOT NULL,
        quantity_uom VARCHAR(16) DEFAULT 'Nos',
        target_price DECIMAL(12,2) NULL,
        urgency_level VARCHAR(32) DEFAULT 'STANDARD',
        drawing_url TEXT NULL,
        sample_image_url TEXT NULL,
        notes TEXT NULL,
        status ENUM('PENDING', 'UNDER_REVIEW', 'APPROVED', 'ADDED_TO_CATALOG', 'REJECTED') DEFAULT 'PENDING',
        admin_notes TEXT NULL,
        converted_product_id INT NULL,
        converted_sku VARCHAR(128) NULL,
        erpnext_item_code VARCHAR(128) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_cpr_status (status),
        INDEX idx_cpr_phone (customer_phone),
        INDEX idx_cpr_email (customer_email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    isTableInitialized = true;
  } catch (err) {
    console.warn('[CustomRequests] MySQL table init skipped (local fallback):', err);
  }
}

function mapRowToRequest(r: any): CustomProductRequest {
  return {
    id: Number(r.id),
    requestNumber: r.request_number,
    customerId: r.customer_id ? Number(r.customer_id) : null,
    customerName: r.customer_name || '',
    companyName: r.company_name || '',
    customerEmail: r.customer_email || '',
    customerPhone: r.customer_phone || '',
    shippingPincode: r.shipping_pincode || '',
    productName: r.product_name || '',
    category: r.category || 'Hex Screws',
    subCategory: r.sub_category || '',
    standard: r.standard || 'DIN 933',
    grade: r.grade || '8.8',
    finish: r.finish || 'SELF',
    threadType: r.thread_type || 'Full Thread',
    diameter: r.diameter || 'M10',
    lengthMm: Number(r.length_mm) || 0,
    pitchMm: parseFloat(r.pitch_mm) || 1.5,
    sizeFormatted: r.size_formatted || `${r.diameter}x${r.length_mm}`,
    quantityRequired: parseFloat(r.quantity_required) || 1000,
    quantityUom: r.quantity_uom || 'Nos',
    targetPrice: r.target_price ? parseFloat(r.target_price) : undefined,
    urgencyLevel: (r.urgency_level as any) || 'STANDARD',
    drawingUrl: r.drawing_url || '',
    sampleImageUrl: r.sample_image_url || '',
    notes: r.notes || '',
    status: (r.status as CustomRequestStatus) || 'PENDING',
    adminNotes: r.admin_notes || '',
    convertedProductId: r.converted_product_id ? Number(r.converted_product_id) : undefined,
    convertedSku: r.converted_sku || undefined,
    erpnextItemCode: r.erpnext_item_code || undefined,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
  };
}

export async function getCustomRequests(filters?: {
  status?: string;
  search?: string;
  customerEmail?: string;
  customerPhone?: string;
}): Promise<CustomProductRequest[]> {
  await initCustomRequestsTable();

  try {
    let sql = 'SELECT * FROM custom_product_requests WHERE 1=1';
    const params: any[] = [];

    if (filters?.status && filters.status !== 'ALL') {
      sql += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters?.customerEmail) {
      sql += ' AND customer_email = ?';
      params.push(filters.customerEmail);
    }
    if (filters?.customerPhone) {
      sql += ' AND customer_phone = ?';
      params.push(filters.customerPhone);
    }
    if (filters?.search && filters.search.trim()) {
      const q = `%${filters.search.trim()}%`;
      sql += ` AND (request_number LIKE ? OR product_name LIKE ? OR company_name LIKE ? OR customer_name LIKE ? OR standard LIKE ? OR diameter LIKE ?)`;
      params.push(q, q, q, q, q, q);
    }

    sql += ' ORDER BY created_at DESC';

    const rows = await query<any>(sql, params);
    if (Array.isArray(rows) && rows.length > 0) {
      return rows.map(mapRowToRequest);
    }
  } catch (err) {
    console.warn('[CustomRequests] MySQL query fallback:', err);
  }

  // Fallback to local memory / file
  let list = memoryRequests.length > 0 ? memoryRequests : loadLocalRequests();
  memoryRequests = list;

  if (filters?.status && filters.status !== 'ALL') {
    list = list.filter((r) => r.status === filters.status);
  }
  if (filters?.customerEmail) {
    list = list.filter((r) => r.customerEmail.toLowerCase() === filters.customerEmail!.toLowerCase());
  }
  if (filters?.customerPhone) {
    list = list.filter((r) => r.customerPhone.includes(filters.customerPhone!));
  }
  if (filters?.search && filters.search.trim()) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (r) =>
        r.requestNumber.toLowerCase().includes(q) ||
        r.productName.toLowerCase().includes(q) ||
        r.companyName?.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.standard.toLowerCase().includes(q) ||
        r.diameter.toLowerCase().includes(q)
    );
  }

  return list;
}

export async function getCustomRequestById(id: number): Promise<CustomProductRequest | null> {
  await initCustomRequestsTable();

  try {
    const rows = await query<any>('SELECT * FROM custom_product_requests WHERE id = ? LIMIT 1', [id]);
    if (Array.isArray(rows) && rows.length > 0) {
      return mapRowToRequest(rows[0]);
    }
  } catch (err) {
    console.warn('[CustomRequests] MySQL find by id fallback:', err);
  }

  const list = memoryRequests.length > 0 ? memoryRequests : loadLocalRequests();
  return list.find((r) => r.id === id) || null;
}

export async function createCustomRequest(
  data: Omit<CustomProductRequest, 'id' | 'requestNumber' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<CustomProductRequest> {
  await initCustomRequestsTable();

  const timestamp = Date.now();
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const requestNumber = `REQ-${new Date().getFullYear()}-${randomSuffix}${String(timestamp).slice(-3)}`;
  const now = new Date().toISOString();

  const newReq: CustomProductRequest = {
    id: timestamp,
    requestNumber,
    customerId: data.customerId || null,
    customerName: data.customerName.trim(),
    companyName: data.companyName?.trim() || '',
    customerEmail: data.customerEmail.trim(),
    customerPhone: data.customerPhone.trim(),
    shippingPincode: data.shippingPincode?.trim() || '',
    productName: data.productName.trim(),
    category: data.category || 'Hex Screws',
    subCategory: data.subCategory || '',
    standard: data.standard || 'DIN 933',
    grade: data.grade || '8.8',
    finish: data.finish || 'SELF',
    threadType: data.threadType || 'Full Thread',
    diameter: data.diameter || 'M10',
    lengthMm: Number(data.lengthMm) || 50,
    pitchMm: parseFloat(String(data.pitchMm)) || 1.5,
    sizeFormatted: data.sizeFormatted || `${data.diameter}x${data.lengthMm}`,
    quantityRequired: parseFloat(String(data.quantityRequired)) || 1000,
    quantityUom: data.quantityUom || 'Nos',
    targetPrice: data.targetPrice ? parseFloat(String(data.targetPrice)) : undefined,
    urgencyLevel: data.urgencyLevel || 'STANDARD',
    drawingUrl: data.drawingUrl || '',
    sampleImageUrl: data.sampleImageUrl || '',
    notes: data.notes || '',
    status: 'PENDING',
    adminNotes: '',
    createdAt: now,
    updatedAt: now,
  };

  try {
    const res: any = await query(
      `INSERT INTO custom_product_requests (
        request_number, customer_id, customer_name, company_name, customer_email, customer_phone,
        shipping_pincode, product_name, category, sub_category, standard, grade, finish,
        thread_type, diameter, length_mm, pitch_mm, size_formatted, quantity_required,
        quantity_uom, target_price, urgency_level, drawing_url, sample_image_url, notes,
        status, admin_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', '')`,
      [
        newReq.requestNumber,
        newReq.customerId,
        newReq.customerName,
        newReq.companyName,
        newReq.customerEmail,
        newReq.customerPhone,
        newReq.shippingPincode,
        newReq.productName,
        newReq.category,
        newReq.subCategory,
        newReq.standard,
        newReq.grade,
        newReq.finish,
        newReq.threadType,
        newReq.diameter,
        newReq.lengthMm,
        newReq.pitchMm,
        newReq.sizeFormatted,
        newReq.quantityRequired,
        newReq.quantityUom,
        newReq.targetPrice || null,
        newReq.urgencyLevel,
        newReq.drawingUrl,
        newReq.sampleImageUrl,
        newReq.notes,
      ]
    );

    if (res && res.insertId) {
      newReq.id = res.insertId;
    }
  } catch (err) {
    console.warn('[CustomRequests] MySQL insert fallback:', err);
  }

  // Update local memory and file
  const list = memoryRequests.length > 0 ? memoryRequests : loadLocalRequests();
  list.unshift(newReq);
  memoryRequests = list;
  saveLocalRequests(list);

  return newReq;
}

export async function updateCustomRequest(
  id: number,
  data: Partial<CustomProductRequest>
): Promise<CustomProductRequest | null> {
  await initCustomRequestsTable();

  const now = new Date().toISOString();

  try {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.status) {
      fields.push('status = ?');
      values.push(data.status);
    }
    if (data.adminNotes !== undefined) {
      fields.push('admin_notes = ?');
      values.push(data.adminNotes);
    }
    if (data.convertedProductId !== undefined) {
      fields.push('converted_product_id = ?');
      values.push(data.convertedProductId);
    }
    if (data.convertedSku !== undefined) {
      fields.push('converted_sku = ?');
      values.push(data.convertedSku);
    }
    if (data.erpnextItemCode !== undefined) {
      fields.push('erpnext_item_code = ?');
      values.push(data.erpnextItemCode);
    }

    if (fields.length > 0) {
      values.push(id);
      await query(`UPDATE custom_product_requests SET ${fields.join(', ')} WHERE id = ?`, values);
    }
  } catch (err) {
    console.warn('[CustomRequests] MySQL update fallback:', err);
  }

  const list = memoryRequests.length > 0 ? memoryRequests : loadLocalRequests();
  const idx = list.findIndex((r) => r.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...data, updatedAt: now };
    memoryRequests = list;
    saveLocalRequests(list);
    return list[idx];
  }

  return null;
}

export async function deleteCustomRequest(id: number): Promise<boolean> {
  await initCustomRequestsTable();

  try {
    await query('DELETE FROM custom_product_requests WHERE id = ?', [id]);
  } catch (err) {
    console.warn('[CustomRequests] MySQL delete fallback:', err);
  }

  const list = memoryRequests.length > 0 ? memoryRequests : loadLocalRequests();
  const filtered = list.filter((r) => r.id !== id);
  const deleted = filtered.length < list.length;
  memoryRequests = filtered;
  saveLocalRequests(filtered);
  return deleted;
}

export interface ConvertCustomRequestParams {
  requestId: number;
  sku: string;
  name: string;
  pricePerPiece: number;
  pricePerKg: number;
  weightPerPcKg: number;
  stockPcs?: number;
  isSurplus?: boolean;
  surplusDiscountPct?: number;
  syncToErpNext?: boolean;
  adminNotes?: string;
  moq?: string;
  leadTimeDays?: number;
}

/**
 * Converts a customer product request into a live catalog Product (and optionally pushes to ERPNext)
 */
export async function convertCustomRequestToProduct(
  params: ConvertCustomRequestParams
): Promise<{ product: Product; request: CustomProductRequest; erpItemCode?: string }> {
  const req = await getCustomRequestById(params.requestId);
  if (!req) {
    throw new Error(`Custom product request #${params.requestId} not found.`);
  }

  const weight = params.weightPerPcKg > 0 ? params.weightPerPcKg : 0.05;
  const stockPcs = params.stockPcs !== undefined ? params.stockPcs : 10000;
  const pricePiece = Number(params.pricePerPiece) || 12.5;
  const priceKg = Number(params.pricePerKg) || (weight > 0 ? +(pricePiece / weight).toFixed(2) : 150);

  const newProduct: Product = {
    id: Date.now(),
    sku: params.sku.trim().toUpperCase(),
    name: params.name.trim(),
    category: req.category || 'Hex Screws',
    subGroup: req.category.includes('SCREW') ? 'SCREW' : 'BOLTS',
    subCategory: req.subCategory || req.category,
    standard: req.standard || 'DIN 933',
    din: req.standard.includes('DIN') ? req.standard : '',
    isoStandard: req.standard.includes('ISO') ? req.standard : '',
    bsStandard: '',
    asmeStandard: req.standard.includes('ASTM') || req.standard.includes('ASME') ? req.standard : '',
    grade: req.grade || '8.8',
    finish: req.finish || 'SELF',
    threadType: req.threadType || 'Full Thread',
    threadLength: req.threadType,
    diameter: req.diameter || 'M10',
    lengthMm: req.lengthMm || 50,
    pitchMm: req.pitchMm || 1.5,
    sizeFormatted: req.sizeFormatted || `${req.diameter}x${req.lengthMm}`,
    weightPerPcKg: weight,
    weightPer1000PcsKg: +(weight * 1000).toFixed(3),
    pricePerPiece: pricePiece,
    originalPricePerPiece: pricePiece,
    pricePerKg: priceKg,
    originalPricePerKg: priceKg,
    price100Pcs: +(pricePiece * 100).toFixed(2),
    price1000Pcs: +(pricePiece * 1000).toFixed(2),
    stockPcs: stockPcs,
    stockKg: +(stockPcs * weight).toFixed(2),
    stockUom: req.quantityUom || 'Nos',
    isInStock: stockPcs > 0,
    isSurplus: Boolean(params.isSurplus),
    surplusDiscountPct: params.isSurplus ? (Number(params.surplusDiscountPct) || 35) : 0,
    moq: params.moq || '25 KGS',
    leadTimeDays: params.leadTimeDays || 10,
    productionDays: 7,
    packingDays: 3,
    pcsPerBox: '',
    smallBoxWeightKg: 2.5,
    pcsPerMasterCtn: '',
    masterCtnWeightKg: 20.0,
    brand: 'CBH',
    hsnCode: '73181500',
    imageUrl: req.sampleImageUrl || req.drawingUrl || '/assets/bolt_zinc.jpg',
    drawingUrl: req.drawingUrl || '',
    gdriveImageUrl: '',
    descriptionHtml: `<p><strong>${params.name}</strong></p><p>Standard: ${req.standard} | Grade: ${req.grade} | Finish: ${req.finish} | Size: ${req.sizeFormatted}</p>`,
    description: `${params.name} (${req.standard}) Grade ${req.grade} Finish ${req.finish}`,
  };

  // 1. Add to Products Catalog (in-memory & JSON)
  const productsDb = getProductsDb();
  productsDb.unshift(newProduct);
  setProductsDb(productsDb);

  // 2. Sync to MySQL products table
  try {
    await syncProductsToMySQL([newProduct]);
  } catch (err) {
    console.warn('[CustomRequests] MySQL product sync warning:', err);
  }

  // 3. Optionally push/ensure in ERPNext
  let erpItemCode: string | undefined;
  if (params.syncToErpNext) {
    try {
      erpItemCode = await ensureItemInErpNext({
        sku: newProduct.sku,
        name: newProduct.name,
        rate: newProduct.pricePerPiece,
        weightPerPcKg: newProduct.weightPerPcKg,
      });
    } catch (err) {
      console.warn('[CustomRequests] ERPNext sync warning:', err);
    }
  }

  // 4. Update Custom Request status to ADDED_TO_CATALOG
  const updatedReq = await updateCustomRequest(params.requestId, {
    status: 'ADDED_TO_CATALOG',
    adminNotes: params.adminNotes || `Added to live catalog as SKU: ${newProduct.sku}`,
    convertedProductId: newProduct.id,
    convertedSku: newProduct.sku,
    erpnextItemCode: erpItemCode,
  });

  return {
    product: newProduct,
    request: updatedReq || req,
    erpItemCode,
  };
}

