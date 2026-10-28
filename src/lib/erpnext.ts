// ==============================================================================
// CBH FASTENERS - ERPNEXT / FRAPPE INTEGRATION SERVICE
// ==============================================================================
// Connects CBH digital procurement with client's ERPNext instance.
// Supports: Items, Dual UOM, Stock Bins, Price Lists, Quotations, and Webhooks.
// ==============================================================================

import fs from 'fs';
import path from 'path';
import { Product } from './types';

export interface ErpNextConfig {
  erpnextUrl: string;
  apiKey: string;
  apiSecret: string;
  company?: string;
  defaultPriceList?: string;
  defaultWarehouse?: string;
  autoSync?: boolean;
  lastSyncTime?: string | null;
  lastSyncStatus?: 'CONNECTED' | 'STANDBY' | 'ERROR' | 'SYNCING';
  lastError?: string | null;
  syncedItemsCount?: number;
}

const CONFIG_PATH = path.join(process.cwd(), 'src', 'data', 'erpnext-config.json');

// Get ERPNext Configuration (Priority: local config file -> .env)
export function getErpNextConfig(): ErpNextConfig {
  let fileConfig: Partial<ErpNextConfig> = {};
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
      fileConfig = JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed reading erpnext-config.json:', err);
  }

  return {
    erpnextUrl: fileConfig.erpnextUrl || process.env.ERPNEXT_URL || '',
    apiKey: fileConfig.apiKey || process.env.ERPNEXT_API_KEY || '',
    apiSecret: fileConfig.apiSecret || process.env.ERPNEXT_API_SECRET || '',
    company: fileConfig.company || process.env.ERPNEXT_COMPANY || 'CBC Technologies Private Limited',
    defaultPriceList: fileConfig.defaultPriceList || process.env.ERPNEXT_DEFAULT_PRICE_LIST || 'Standard Selling',
    defaultWarehouse: fileConfig.defaultWarehouse || process.env.ERPNEXT_DEFAULT_WAREHOUSE || 'Stores - CTPL',
    autoSync: fileConfig.autoSync ?? true,
    lastSyncTime: fileConfig.lastSyncTime || null,
    lastSyncStatus: fileConfig.lastSyncStatus || (fileConfig.erpnextUrl ? 'STANDBY' : 'STANDBY'),
    lastError: fileConfig.lastError || null,
    syncedItemsCount: fileConfig.syncedItemsCount || 0,
  };
}

// Save ERPNext Configuration
export function saveErpNextConfig(updates: Partial<ErpNextConfig>): ErpNextConfig {
  const current = getErpNextConfig();
  const merged: ErpNextConfig = { ...current, ...updates };

  try {
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(merged, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed saving erpnext-config.json:', err);
  }

  return merged;
}

// Generate Headers for ERPNext Token Auth
function getErpNextHeaders(config: ErpNextConfig): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `token ${config.apiKey.trim()}:${config.apiSecret.trim()}`,
  };
}

// Clean and normalize ERPNext Base URL
function cleanUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

// Test Connection with ERPNext
export async function testErpNextConnection(configOverride?: Partial<ErpNextConfig>): Promise<{
  success: boolean;
  user?: string;
  serverUrl?: string;
  error?: string;
}> {
  const config = { ...getErpNextConfig(), ...configOverride };

  if (!config.erpnextUrl || !config.apiKey || !config.apiSecret) {
    return {
      success: false,
      error: 'Incomplete ERPNext credentials. Please provide Host URL, API Key, and API Secret.',
    };
  }

  try {
    const baseUrl = cleanUrl(config.erpnextUrl);
    const endpoint = `${baseUrl}/api/method/frappe.auth.get_logged_user`;

    const res = await fetch(endpoint, {
      method: 'GET',
      headers: getErpNextHeaders(config),
      cache: 'no-store',
    });

    if (!res.ok) {
      const errText = await res.text();
      return {
        success: false,
        error: `ERPNext returned HTTP ${res.status}: ${errText.slice(0, 200)}`,
      };
    }

    const data = await res.json();
    const user = data.message || 'ERPNext API User';

    saveErpNextConfig({
      lastSyncStatus: 'CONNECTED',
      lastError: null,
    });

    return {
      success: true,
      user,
      serverUrl: baseUrl,
    };
  } catch (err: any) {
    const errorMsg = err.message || 'Unable to connect to ERPNext server';
    saveErpNextConfig({
      lastSyncStatus: 'ERROR',
      lastError: errorMsg,
    });

    return {
      success: false,
      error: errorMsg,
    };
  }
}

// Raw Item from ERPNext
export interface ErpNextItem {
  name: string;
  item_code: string;
  item_name: string;
  item_group?: string;
  brand?: string;
  description?: string;
  stock_uom?: string;
  standard_rate?: number;
  weight_per_unit?: number;
  weight_uom?: string;
  image?: string;
  disabled?: number;
  is_sales_item?: number;
  lead_time_days?: number;
  min_order_qty?: number;
  safety_stock?: number;
  gst_hsn_code?: string;
  custom_standard?: string;
  custom_grade?: string;
  custom_finish?: string;
  custom_diameter?: string;
  custom_length?: number;
}

// Raw Stock Bin from ERPNext
export interface ErpNextBin {
  item_code: string;
  actual_qty: number;
  warehouse: string;
}

// Raw Price from ERPNext
export interface ErpNextPrice {
  item_code: string;
  price_list_rate: number;
  currency: string;
}

// Helper to extract table cell value from HTML description
function extractCell(html: string, label: string): string {
  if (!html) return '';
  const regex = new RegExp(`<strong>${label}[^<]*<\\/strong><\\/td>\\s*<td[^>]*>(.*?)<\\/td>`, 'i');
  const m = html.match(regex);
  return m && m[1] ? m[1].replace(/<[^>]+>/g, '').trim() : '';
}

function extractLink(html: string, linkText: string): string {
  if (!html) return '';
  const regex = new RegExp(`<a\\s+href="([^"]+)"[^>]*>.*?${linkText}.*?<\\/a>`, 'i');
  const m = html.match(regex);
  return m && m[1] ? m[1] : '';
}

// Normalize ERPNext Item to CBH Product Model
export function normalizeErpNextItemToProduct(
  item: ErpNextItem,
  binStockMap: Map<string, number>,
  priceMap: Map<string, number>,
  idIndex: number
): Product {
  const sku = (item.item_code || item.name || `CBH-${idIndex}`).toUpperCase();
  const name = item.item_name || item.name || sku;
  const description = item.description || '';

  // Extract from HTML specification table if present
  const descSubGroup = extractCell(description, 'Sub-Group');
  const descCategory = extractCell(description, 'Category');
  const descStandard = extractCell(description, 'Standard');
  const descThreadLen = extractCell(description, 'Thread Length');
  const descDia = extractCell(description, 'Diameter');
  const descPitch = extractCell(description, 'Pitch');
  const descLen = extractCell(description, 'Length');
  const descSize = extractCell(description, 'Size');
  const descGrade = extractCell(description, 'Material Grade');
  const descFinish = extractCell(description, 'Finish');
  const descSmallBox = extractCell(description, 'Small Box');
  const descMasterCtn = extractCell(description, 'Master Carton');
  const descMoq = extractCell(description, 'MOQ');
  const descLeadTime = extractCell(description, 'Lead Time');
  const drawingUrl = extractLink(description, 'Drawing');
  const gdriveImageUrl = extractLink(description, 'Photo');

  // Fastener Standards
  let standard = descStandard || item.custom_standard || 'DIN 933';
  const dinMatch = (name + ' ' + description).match(/DIN\s*(\d+)/i);
  const isoMatch = (name + ' ' + description).match(/ISO\s*([0-9-]+)/i);
  const bsMatch = (name + ' ' + description).match(/BS\s*(\d+)/i);
  const asmeMatch = (name + ' ' + description).match(/ASME\s*([A-Z0-9.]+)/i);

  if (!descStandard) {
    const stdMatch = (name + ' ' + description).match(/DIN\s*\d+|ISO\s*[0-9-]+|BS\s*\d+|ASME\s*[A-Z0-9.]+|IS\s*\d+/i);
    if (stdMatch) standard = stdMatch[0].toUpperCase();
  }

  // Grade
  let grade = descGrade || item.custom_grade || '8.8';
  if (!descGrade) {
    const gradeMatch = (name + ' ' + description).match(/\b(4\.6|4\.8|5\.6|5\.8|8\.8|10\.9|12\.9|45H|SS\s*304|SS\s*316|A2-70|A4-80)\b/i);
    if (gradeMatch) grade = gradeMatch[0].toUpperCase();
  }

  // Diameter
  let diameter = descDia || item.custom_diameter || 'M10';
  if (!descDia) {
    const diaMatch = (name + ' ' + description).match(/\bM(\d{1,2})\b/i);
    const inchDiaMatch = (name + ' ' + description).match(/\b(\d\/\d+)"|\b(\d+)"/);
    if (diaMatch) diameter = `M${diaMatch[1]}`;
    else if (inchDiaMatch) diameter = inchDiaMatch[0];
  }

  // Length
  let lengthMm = 100;
  if (descLen) {
    const num = parseInt(descLen);
    if (!isNaN(num)) lengthMm = num;
  } else {
    const lenMatch = (name + ' ' + description).match(/x\s*(\d{1,3})M?\b/i);
    if (lenMatch) lengthMm = parseInt(lenMatch[1]);
  }

  // Pitch
  let pitchMm = 1.5;
  if (descPitch) {
    const pNum = parseFloat(descPitch);
    if (!isNaN(pNum)) pitchMm = pNum;
  }

  // Finish
  let finish = descFinish || item.custom_finish || 'Black Passivated (BP)';
  if (!descFinish) {
    const finishMatch = (name + ' ' + description).match(/Zinc|HDG|Galvanized|Passivated|Black|Natural|SELF|WZP|YZP|BP/i);
    if (finishMatch) {
      const f = finishMatch[0].toUpperCase();
      if (f.includes('HDG') || f.includes('GALV')) finish = 'Hot Dip Galvanized (HDG)';
      else if (f === 'WZP' || f.includes('ZINC')) finish = 'White Zinc Plated (WZP)';
      else if (f === 'YZP') finish = 'Yellow Zinc Plated (YZP)';
      else if (f === 'BP' || f.includes('BLACK')) finish = 'Black Passivated (BP)';
      else if (f === 'SELF') finish = 'Self Natural / Plain';
    }
  }

  // Dual Weight & Pricing
  const weightPerPcKg = item.weight_per_unit && item.weight_per_unit > 0 
    ? (item.weight_uom?.toLowerCase() === 'g' || item.weight_uom?.toLowerCase() === 'gram' ? item.weight_per_unit / 1000 : item.weight_per_unit) 
    : 0.06;

  // Rate from Price List or Item standard rate
  const rateFromList = priceMap.get(item.item_code) ?? item.standard_rate ?? 12.5;
  const pricePerPiece = rateFromList > 0 ? rateFromList : 14.5;
  const pricePerKg = weightPerPcKg > 0 ? parseFloat((pricePerPiece / weightPerPcKg).toFixed(2)) : 145;

  // Stock from Bin
  const stockPcs = binStockMap.get(item.item_code) ?? 15000;
  const stockKg = parseFloat((stockPcs * weightPerPcKg).toFixed(2));

  // Category
  const category = descCategory || item.item_group || 'Hex Screws';
  const subGroup = descSubGroup || (category.includes('SCREW') ? 'SCREW' : 'BOLTS');

  // Image URL - 100% Dynamic from ERPNext Cloud / Google Drive
  let imageUrl = '/assets/bolt_zinc.jpg';
  const server = (process.env.ERPNEXT_URL || 'https://cbhtest.m.frappe.cloud').replace(/\/$/, '');

  const rawImage = (item.image || '').trim();
  if (rawImage) {
    if (rawImage.startsWith('http://') || rawImage.startsWith('https://')) {
      const driveMatch = rawImage.match(/\/d\/([a-zA-Z0-9_-]+)/) || rawImage.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (driveMatch) {
        imageUrl = `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
      } else {
        imageUrl = rawImage;
      }
    } else if (rawImage.startsWith('/files/') || rawImage.startsWith('/private/files/')) {
      imageUrl = `${server}${encodeURI(rawImage)}`;
    } else if (rawImage.startsWith('/assets/')) {
      imageUrl = rawImage;
    } else {
      imageUrl = `${server}/files/${encodeURIComponent(rawImage.replace(/^\//, ''))}`;
    }
  } else if (gdriveImageUrl) {
    const driveMatch = gdriveImageUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || gdriveImageUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (driveMatch) {
      imageUrl = `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
    } else {
      imageUrl = gdriveImageUrl;
    }
  }

  // Parse Box / Master Carton quantities
  let pcsPerBox: number | string | undefined;
  if (descSmallBox) {
    const boxMatch = descSmallBox.match(/(\d+)\s*pcs/i);
    if (boxMatch) pcsPerBox = parseInt(boxMatch[1]);
    else pcsPerBox = descSmallBox;
  }
  let pcsPerMasterCtn: number | string | undefined;
  if (descMasterCtn) {
    const ctnMatch = descMasterCtn.match(/(\d+)\s*pcs/i);
    if (ctnMatch) pcsPerMasterCtn = parseInt(ctnMatch[1]);
    else pcsPerMasterCtn = descMasterCtn;
  }

  // Lead Time & MOQ
  const leadTimeDays = item.lead_time_days || (descLeadTime ? parseInt(descLeadTime) || 10 : 10);
  const moq = descMoq || (item.min_order_qty ? `${item.min_order_qty} ${item.stock_uom || 'Nos'}` : '25 KGS');

  return {
    id: 1000 + idIndex,
    sku,
    name,
    category,
    subGroup,
    subCategory: extractCell(description, 'Category') ? extractCell(description, 'Category').split('(')[1]?.replace(')', '').trim() : undefined,
    standard,
    din: dinMatch ? `DIN ${dinMatch[1]}` : undefined,
    isoStandard: isoMatch ? `ISO ${isoMatch[1]}` : undefined,
    bsStandard: bsMatch ? `BS ${bsMatch[1]}` : undefined,
    asmeStandard: asmeMatch ? `ASME ${asmeMatch[1]}` : undefined,
    grade,
    finish,
    threadType: descThreadLen || (lengthMm <= 120 ? 'Full Thread' : 'Partial Thread'),
    threadLength: descThreadLen,
    diameter,
    lengthMm,
    pitchMm,
    sizeFormatted: descSize || `${diameter}x${lengthMm}`,
    weightPerPcKg,
    weightPer1000PcsKg: +(weightPerPcKg * 1000).toFixed(3),
    pricePerPiece,
    originalPricePerPiece: parseFloat((pricePerPiece * 1.15).toFixed(2)),
    pricePerKg,
    originalPricePerKg: parseFloat((pricePerKg * 1.15).toFixed(2)),
    price100Pcs: +(pricePerPiece * 100).toFixed(2),
    price1000Pcs: +(pricePerPiece * 1000).toFixed(2),
    stockPcs,
    stockKg,
    stockUom: item.stock_uom || 'Nos',
    isInStock: stockPcs > 0,
    isSurplus: false,
    surplusDiscountPct: 0,
    moq,
    leadTimeDays,
    productionDays: 7,
    packingDays: 3,
    pcsPerBox,
    smallBoxWeightKg: 2.5,
    pcsPerMasterCtn,
    masterCtnWeightKg: 20,
    brand: item.brand || 'CBH',
    hsnCode: item.gst_hsn_code || '73181500',
    imageUrl,
    drawingUrl: drawingUrl || undefined,
    gdriveImageUrl: gdriveImageUrl || undefined,
    descriptionHtml: description.includes('<table') ? description : undefined,
    description: description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || name,
  };
}

// Fetch All Items, Stock Bins, and Prices from ERPNext
export async function fetchErpNextProducts(): Promise<{
  success: boolean;
  products: Product[];
  count: number;
  serverUrl?: string;
  error?: string;
}> {
  const config = getErpNextConfig();

  if (!config.erpnextUrl || !config.apiKey || !config.apiSecret) {
    return {
      success: false,
      products: [],
      count: 0,
      error: 'ERPNext credentials not configured in settings or .env',
    };
  }

  try {
    const baseUrl = cleanUrl(config.erpnextUrl);
    const headers = getErpNextHeaders(config);

    // 1. Fetch Items
    const itemFields = encodeURIComponent(
      JSON.stringify([
        'name',
        'item_code',
        'item_name',
        'item_group',
        'description',
        'stock_uom',
        'standard_rate',
        'weight_per_unit',
        'weight_uom',
        'image',
        'disabled',
        'is_sales_item',
        'brand',
        'lead_time_days',
        'min_order_qty',
        'safety_stock',
        'gst_hsn_code',
      ])
    );
    // 1. Fetch All Items with pagination
    const itemFilters = encodeURIComponent(JSON.stringify([['disabled', '=', 0], ['is_sales_item', '=', 1]]));
    const rawItems: ErpNextItem[] = [];
    let itemStart = 0;
    while (true) {
      const itemsUrl = `${baseUrl}/api/resource/Item?fields=${itemFields}&filters=${itemFilters}&limit_page_length=500&limit_start=${itemStart}`;
      const itemsRes = await fetch(itemsUrl, { method: 'GET', headers, cache: 'no-store' });
      if (!itemsRes.ok) break;
      const itemsData = await itemsRes.json();
      const batch: ErpNextItem[] = itemsData.data || [];
      if (!batch.length) break;
      rawItems.push(...batch);
      if (batch.length < 500) break;
      itemStart += 500;
    }

    // 2. Fetch Stock Bins with pagination
    const binStockMap = new Map<string, number>();
    try {
      const binFields = encodeURIComponent(JSON.stringify(['item_code', 'actual_qty', 'warehouse']));
      let binStart = 0;
      while (true) {
        const binUrl = `${baseUrl}/api/resource/Bin?fields=${binFields}&limit_page_length=500&limit_start=${binStart}`;
        const binRes = await fetch(binUrl, { method: 'GET', headers, cache: 'no-store' });
        if (!binRes.ok) break;
        const binData = await binRes.json();
        const bins: ErpNextBin[] = binData.data || [];
        if (!bins.length) break;
        for (const b of bins) {
          const current = binStockMap.get(b.item_code) || 0;
          binStockMap.set(b.item_code, current + (b.actual_qty || 0));
        }
        if (bins.length < 500) break;
        binStart += 500;
      }
    } catch (e) {
      console.warn('Could not fetch ERPNext Bin stock, using defaults:', e);
    }

    // 3. Fetch Item Prices with pagination
    const priceMap = new Map<string, number>();
    try {
      const priceList = config.defaultPriceList || 'Standard Selling';
      const priceFields = encodeURIComponent(JSON.stringify(['item_code', 'price_list_rate', 'currency']));
      const priceFilters = encodeURIComponent(JSON.stringify([['price_list', '=', priceList]]));
      let priceStart = 0;
      while (true) {
        const priceUrl = `${baseUrl}/api/resource/Item%20Price?fields=${priceFields}&filters=${priceFilters}&limit_page_length=500&limit_start=${priceStart}`;
        const priceRes = await fetch(priceUrl, { method: 'GET', headers, cache: 'no-store' });
        if (!priceRes.ok) break;
        const priceData = await priceRes.json();
        const prices: ErpNextPrice[] = priceData.data || [];
        if (!prices.length) break;
        for (const p of prices) {
          if (p.price_list_rate) {
            priceMap.set(p.item_code, p.price_list_rate);
          }
        }
        if (prices.length < 500) break;
        priceStart += 500;
      }
    } catch (e) {
      console.warn('Could not fetch ERPNext Item Price list:', e);
    }

    // 4. Normalize to CBH Products
    const products: Product[] = rawItems.map((item, idx) => 
      normalizeErpNextItemToProduct(item, binStockMap, priceMap, idx + 1)
    );

    // Update config sync status
    saveErpNextConfig({
      lastSyncTime: new Date().toISOString(),
      lastSyncStatus: 'CONNECTED',
      lastError: null,
      syncedItemsCount: products.length,
    });

    return {
      success: true,
      products,
      count: products.length,
      serverUrl: baseUrl,
    };
  } catch (err: any) {
    const errorMsg = err.message || 'Error communicating with ERPNext API';
    saveErpNextConfig({
      lastSyncStatus: 'ERROR',
      lastError: errorMsg,
    });

    return {
      success: false,
      products: [],
      count: 0,
      error: errorMsg,
    };
  }
}

// Ensure Customer Record exists in ERPNext
export async function ensureCustomerInErpNext(params: {
  customerName: string;
  companyName?: string;
  email?: string;
  phone?: string;
  gstin?: string;
}): Promise<string> {
  const config = getErpNextConfig();
  const baseUrl = cleanUrl(config.erpnextUrl);
  const headers = getErpNextHeaders(config);

  const desiredName = (params.companyName || params.customerName || 'CBH Online Customers').trim();
  const fallbackCustomer = 'CBH Online Customers';

  try {
    // 1. Check if Customer already exists
    const checkRes = await fetch(`${baseUrl}/api/resource/Customer/${encodeURIComponent(desiredName)}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (checkRes.ok) {
      const data = await checkRes.json();
      return data.data?.name || desiredName;
    }

    // 2. Try to create new Customer
    const createRes = await fetch(`${baseUrl}/api/resource/Customer`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        customer_name: desiredName,
        customer_type: params.companyName ? 'Company' : 'Individual',
        customer_group: 'Commercial',
        territory: 'India',
        mobile_no: params.phone || '',
        email_id: params.email || '',
        gstin: params.gstin || '',
      }),
    });

    if (createRes.ok) {
      const createdData = await createRes.json();
      return createdData.data?.name || desiredName;
    }
  } catch (err) {
    console.warn('[ERPNext] Customer lookup/creation fallback:', err);
  }

  return fallbackCustomer;
}

// Ensure Fastener Item exists in ERPNext Item Master
export async function ensureItemInErpNext(item: {
  sku: string;
  name?: string;
  rate?: number;
  weightPerPcKg?: number;
}): Promise<string> {
  const config = getErpNextConfig();
  const baseUrl = cleanUrl(config.erpnextUrl);
  const headers = getErpNextHeaders(config);
  const sku = (item.sku || 'CBH-125A-M10-HDG').trim();

  try {
    const checkRes = await fetch(`${baseUrl}/api/resource/Item/${encodeURIComponent(sku)}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (checkRes.ok) {
      return sku;
    }

    // Auto-create item in ERPNext with required HSN 73181500 (Industrial Screws/Fasteners)
    const createRes = await fetch(`${baseUrl}/api/resource/Item`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        item_code: sku,
        item_name: item.name || sku,
        item_group: 'Products',
        stock_uom: 'Nos',
        is_stock_item: 1,
        is_sales_item: 1,
        standard_rate: item.rate || 14.5,
        weight_per_unit: item.weightPerPcKg || 0.05,
        weight_uom: 'Kg',
        gst_hsn_code: '73181500',
      }),
    });

    if (createRes.ok) {
      const created = await createRes.json();
      return created.data?.name || sku;
    }
  } catch (err) {
    console.warn('[ERPNext] Item lookup/create fallback:', err);
  }

  return sku;
}

// Push Customer Single or Bulk Order to ERPNext as a Sales Order & Deduct Stock
export async function pushSalesOrderToErpNext(order: {
  orderNumber: string;
  customerName: string;
  companyName?: string;
  email?: string;
  phone?: string;
  shippingAddress?: string;
  totalAmount: number;
  items: Array<{
    sku: string;
    name?: string;
    quantity: number;
    rate: number;
    weightKg?: number;
  }>;
  submitOrder?: boolean;
  deductStockImmediately?: boolean;
}): Promise<{
  success: boolean;
  erpnextSalesOrderId?: string;
  deliveryNoteId?: string;
  error?: string;
}> {
  const config = getErpNextConfig();
  if (!config.erpnextUrl || !config.apiKey || !config.apiSecret) {
    return { success: false, error: 'ERPNext credentials not configured in settings' };
  }

  try {
    const baseUrl = cleanUrl(config.erpnextUrl);
    const headers = getErpNextHeaders(config);
    const warehouse = config.defaultWarehouse || 'Stores - CTPL';
    const company = config.company || 'CBC Technologies Private Limited';

    // 1. Resolve / Ensure Customer
    const customer = await ensureCustomerInErpNext({
      customerName: order.customerName,
      companyName: order.companyName,
      email: order.email,
      phone: order.phone,
    });

    // 2. Resolve / Ensure Items
    const orderItems = order.items && order.items.length > 0
      ? order.items
      : [{ sku: 'CBH-125A-M10-HDG', name: 'Plain Flat Washer DIN 125A M10', quantity: 100, rate: 14.5 }];

    const validatedItems = await Promise.all(
      orderItems.map(async (it) => {
        const itemCode = await ensureItemInErpNext({
          sku: it.sku,
          name: it.name,
          rate: it.rate,
          weightPerPcKg: it.weightKg,
        });
        return {
          item_code: itemCode,
          qty: Math.max(1, it.quantity || 1),
          rate: it.rate > 0 ? it.rate : 14.5,
          warehouse,
        };
      })
    );

    const today = new Date().toISOString().split('T')[0];
    const deliveryDate = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];

    // 3. Create Sales Order in ERPNext
    const salesOrderPayload = {
      doctype: 'Sales Order',
      customer,
      company,
      transaction_date: today,
      delivery_date: deliveryDate,
      order_type: 'Sales',
      po_no: order.orderNumber,
      items: validatedItems,
    };

    const soRes = await fetch(`${baseUrl}/api/resource/Sales%20Order`, {
      method: 'POST',
      headers,
      body: JSON.stringify(salesOrderPayload),
    });

    if (!soRes.ok) {
      const errText = await soRes.text();
      return {
        success: false,
        error: `ERPNext Sales Order creation failed (HTTP ${soRes.status}): ${errText.slice(0, 300)}`,
      };
    }

    const soData = await soRes.json();
    const salesOrderId = soData.data?.name;
    const itemsCreated = soData.data?.items || [];

    // 4. Submit Sales Order if requested (docstatus: 1 reserves stock and enables billing)
    const shouldSubmit = order.submitOrder !== false;
    if (shouldSubmit && salesOrderId) {
      try {
        await fetch(`${baseUrl}/api/resource/Sales%20Order/${encodeURIComponent(salesOrderId)}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ docstatus: 1 }),
        });
      } catch (submitErr) {
        console.warn('[ERPNext] Could not submit Sales Order:', submitErr);
      }
    }

    // 5. Stock Deduction via Delivery Note
    let deliveryNoteId: string | undefined;
    const shouldDeductStock = order.deductStockImmediately !== false;
    if (shouldDeductStock && salesOrderId && itemsCreated.length > 0) {
      try {
        const dnItems = itemsCreated.map((it: any) => ({
          item_code: it.item_code,
          qty: it.qty,
          rate: it.rate,
          against_sales_order: salesOrderId,
          so_detail: it.name,
          warehouse,
        }));

        const dnRes = await fetch(`${baseUrl}/api/resource/Delivery%20Note`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            doctype: 'Delivery Note',
            customer,
            company,
            posting_date: today,
            items: dnItems,
          }),
        });

        if (dnRes.ok) {
          const dnData = await dnRes.json();
          deliveryNoteId = dnData.data?.name;
          if (deliveryNoteId) {
            // Submit Delivery Note to permanently adjust actual_qty stock in warehouse
            await fetch(`${baseUrl}/api/resource/Delivery%20Note/${encodeURIComponent(deliveryNoteId)}`, {
              method: 'PUT',
              headers,
              body: JSON.stringify({ docstatus: 1 }),
            }).catch(() => {});
          }
        }
      } catch (dnErr) {
        console.warn('[ERPNext] Stock Delivery Note adjustment notice:', dnErr);
      }
    }

    return {
      success: true,
      erpnextSalesOrderId: salesOrderId,
      deliveryNoteId,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed connecting to ERPNext Sales Order API',
    };
  }
}

// Push Customer RFQ / Quotation to ERPNext
export async function pushRfqToErpNext(rfq: {
  rfqNumber: string;
  customerName: string;
  companyName: string;
  email?: string;
  phone?: string;
  gstin?: string;
  totalWeightKg: number;
  grossAmount: number;
  items?: Array<{ sku: string; name?: string; quantity: number; rate: number }>;
}): Promise<{ success: boolean; erpnextQuoteId?: string; error?: string }> {
  const config = getErpNextConfig();
  if (!config.erpnextUrl || !config.apiKey || !config.apiSecret) {
    return { success: false, error: 'ERPNext not configured' };
  }

  try {
    const baseUrl = cleanUrl(config.erpnextUrl);
    const headers = getErpNextHeaders(config);

    // Resolve or create Customer in ERPNext
    const customer = await ensureCustomerInErpNext({
      customerName: rfq.customerName,
      companyName: rfq.companyName,
      email: rfq.email,
      phone: rfq.phone,
      gstin: rfq.gstin,
    });

    // Ensure items exist
    const rawItems = rfq.items && rfq.items.length > 0
      ? rfq.items
      : [{ sku: 'CBH-125A-M10-HDG', name: 'Hexagon Fastener Screw DIN 933', quantity: 1000, rate: 14.5 }];

    const quotationItems = await Promise.all(
      rawItems.map(async (it) => {
        const itemCode = await ensureItemInErpNext({
          sku: it.sku,
          name: it.name,
          rate: it.rate,
        });
        return {
          item_code: itemCode,
          qty: it.quantity || 1000,
          rate: it.rate || 14.5,
        };
      })
    );

    const quotationPayload = {
      doctype: 'Quotation',
      quotation_to: 'Customer',
      party_name: customer,
      transaction_date: new Date().toISOString().split('T')[0],
      valid_till: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      order_type: 'Sales',
      custom_cbh_rfq_reference: rfq.rfqNumber,
      items: quotationItems,
    };

    const res = await fetch(`${baseUrl}/api/resource/Quotation`, {
      method: 'POST',
      headers,
      body: JSON.stringify(quotationPayload),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: `ERPNext returned HTTP ${res.status}: ${errText.slice(0, 200)}` };
    }

    const data = await res.json();
    return {
      success: true,
      erpnextQuoteId: data.data?.name,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Convert Accepted Bulk RFQ into Official ERPNext Sales Order
export async function convertRfqToSalesOrder(rfq: {
  rfqNumber: string;
  customerName: string;
  companyName: string;
  email?: string;
  phone?: string;
  netTotal: number;
  items?: Array<{ sku: string; name?: string; quantity: number; rate: number }>;
}): Promise<{ success: boolean; erpnextSalesOrderId?: string; deliveryNoteId?: string; error?: string }> {
  return pushSalesOrderToErpNext({
    orderNumber: `SO-${rfq.rfqNumber}`,
    customerName: rfq.customerName,
    companyName: rfq.companyName,
    email: rfq.email,
    phone: rfq.phone,
    totalAmount: rfq.netTotal,
    items: rfq.items || [],
    submitOrder: true,
    deductStockImmediately: true,
  });
}

