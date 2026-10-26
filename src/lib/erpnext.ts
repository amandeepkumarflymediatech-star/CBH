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
    defaultPriceList: fileConfig.defaultPriceList || process.env.ERPNEXT_DEFAULT_PRICE_LIST || 'Standard Selling',
    defaultWarehouse: fileConfig.defaultWarehouse || process.env.ERPNEXT_DEFAULT_WAREHOUSE || 'Stores - CBH',
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
  description?: string;
  stock_uom?: string;
  standard_rate?: number;
  weight_per_unit?: number;
  weight_uom?: string;
  image?: string;
  disabled?: number;
  is_sales_item?: number;
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

  // Extract or parse Fastener Attributes (from custom fields or description)
  let standard = item.custom_standard || 'DIN 933';
  let grade = item.custom_grade || '8.8';
  let finish = item.custom_finish || 'Black Passivated (BP)';
  let diameter = item.custom_diameter || 'M10';
  let lengthMm = item.custom_length || 100;

  // Smart regex extraction from name/description if custom fields are not present
  const standardMatch = (name + ' ' + description).match(/DIN\s*\d+|ISO\s*\d+|ASTM\s*[A-Z0-9]+/i);
  if (standardMatch) standard = standardMatch[0].toUpperCase();

  const gradeMatch = (name + ' ' + description).match(/\b(4\.6|5\.8|8\.8|10\.9|12\.9|SS\s*304|SS\s*316|A2-70|A4-80)\b/i);
  if (gradeMatch) grade = gradeMatch[0].toUpperCase();

  const diaMatch = (name + ' ' + description).match(/\bM(\d{1,2})\b/i);
  if (diaMatch) diameter = `M${diaMatch[1]}`;

  const lenMatch = (name + ' ' + description).match(/x\s*(\d{2,3})\b/i);
  if (lenMatch) lengthMm = parseInt(lenMatch[1]);

  const finishMatch = (name + ' ' + description).match(/Zinc|HDG|Galvanized|Passivated|Black|Natural/i);
  if (finishMatch) {
    const f = finishMatch[0].toLowerCase();
    if (f.includes('hdg') || f.includes('galv')) finish = 'Hot Dip Galvanized (HDG)';
    else if (f.includes('zinc')) finish = 'Clear Zinc';
    else if (f.includes('black')) finish = 'Black Passivated (BP)';
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
  const category = item.item_group || 'Hex Screws';

  // Image
  let imageUrl = '/assets/bolt_zinc.jpg';
  if (item.image) {
    imageUrl = item.image.startsWith('http') 
      ? item.image 
      : `${cleanUrl(getErpNextConfig().erpnextUrl)}${item.image}`;
  }

  return {
    id: 1000 + idIndex,
    sku,
    name,
    category,
    standard,
    grade,
    finish,
    threadType: lengthMm <= 120 ? 'Full Thread' : 'Partial Thread',
    diameter,
    lengthMm,
    pitchMm: 1.5,
    weightPerPcKg,
    pricePerPiece,
    originalPricePerPiece: parseFloat((pricePerPiece * 1.15).toFixed(2)),
    pricePerKg,
    originalPricePerKg: parseFloat((pricePerKg * 1.15).toFixed(2)),
    stockPcs,
    stockKg,
    isInStock: stockPcs > 0,
    isSurplus: false,
    surplusDiscountPct: 0,
    imageUrl,
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
      ])
    );
    const itemFilters = encodeURIComponent(JSON.stringify([['disabled', '=', 0], ['is_sales_item', '=', 1]]));
    const itemsUrl = `${baseUrl}/api/resource/Item?fields=${itemFields}&filters=${itemFilters}&limit_page_length=200`;
    
    const itemsRes = await fetch(itemsUrl, { method: 'GET', headers, cache: 'no-store' });
    if (!itemsRes.ok) {
      throw new Error(`Failed to fetch items from ERPNext: HTTP ${itemsRes.status}`);
    }
    const itemsData = await itemsRes.json();
    const rawItems: ErpNextItem[] = itemsData.data || [];

    // 2. Fetch Stock Bins
    const binStockMap = new Map<string, number>();
    try {
      const binFields = encodeURIComponent(JSON.stringify(['item_code', 'actual_qty', 'warehouse']));
      const binUrl = `${baseUrl}/api/resource/Bin?fields=${binFields}&limit_page_length=500`;
      const binRes = await fetch(binUrl, { method: 'GET', headers, cache: 'no-store' });
      if (binRes.ok) {
        const binData = await binRes.json();
        const bins: ErpNextBin[] = binData.data || [];
        for (const b of bins) {
          const current = binStockMap.get(b.item_code) || 0;
          binStockMap.set(b.item_code, current + (b.actual_qty || 0));
        }
      }
    } catch (e) {
      console.warn('Could not fetch ERPNext Bin stock, using defaults:', e);
    }

    // 3. Fetch Item Prices
    const priceMap = new Map<string, number>();
    try {
      const priceList = config.defaultPriceList || 'Standard Selling';
      const priceFields = encodeURIComponent(JSON.stringify(['item_code', 'price_list_rate', 'currency']));
      const priceFilters = encodeURIComponent(JSON.stringify([['price_list', '=', priceList]]));
      const priceUrl = `${baseUrl}/api/resource/Item%20Price?fields=${priceFields}&filters=${priceFilters}&limit_page_length=500`;
      const priceRes = await fetch(priceUrl, { method: 'GET', headers, cache: 'no-store' });
      if (priceRes.ok) {
        const priceData = await priceRes.json();
        const prices: ErpNextPrice[] = priceData.data || [];
        for (const p of prices) {
          if (p.price_list_rate) {
            priceMap.set(p.item_code, p.price_list_rate);
          }
        }
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

// Push Customer RFQ / Quotation to ERPNext
export async function pushRfqToErpNext(rfq: {
  rfqNumber: string;
  customerName: string;
  companyName: string;
  email?: string;
  phone?: string;
  totalWeightKg: number;
  grossAmount: number;
  items?: Array<{ sku: string; quantity: number; rate: number }>;
}): Promise<{ success: boolean; erpnextQuoteId?: string; error?: string }> {
  const config = getErpNextConfig();
  if (!config.erpnextUrl || !config.apiKey || !config.apiSecret) {
    return { success: false, error: 'ERPNext not configured' };
  }

  try {
    const baseUrl = cleanUrl(config.erpnextUrl);
    const headers = getErpNextHeaders(config);

    const quotationPayload = {
      doctype: 'Quotation',
      quotation_to: 'Customer',
      party_name: rfq.companyName || rfq.customerName || 'CBH Online Buyer',
      transaction_date: new Date().toISOString().split('T')[0],
      valid_till: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      order_type: 'Sales',
      custom_cbh_rfq_reference: rfq.rfqNumber,
      items: (rfq.items && rfq.items.length > 0)
        ? rfq.items.map((it) => ({
            item_code: it.sku,
            qty: it.quantity || 1000,
            rate: it.rate || 14.5,
          }))
        : [
            {
              item_code: 'CBH-HEX-M10-100',
              item_name: 'Hexagon Head Screw DIN 933 Gr 8.8',
              qty: Math.max(100, Math.round(rfq.totalWeightKg / 0.06)),
              rate: 14.5,
            },
          ],
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
