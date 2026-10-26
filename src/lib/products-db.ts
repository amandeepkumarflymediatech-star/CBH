import fs from 'fs';
import path from 'path';
import { Product } from './types';
import { ALL_STATIC_PRODUCTS } from './catalog-products-all';

const CACHE_FILE = path.join(process.cwd(), 'src', 'data', 'erpnext-cached-products.json');

export function loadCombinedProducts(): Product[] {
  let erpItems: Product[] = [];
  try {
    if (fs.existsSync(CACHE_FILE)) {
      erpItems = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    }
  } catch {
    // fallback
  }

  const map = new Map<string, Product>();

  // 1. All real scraped & baseline products
  for (const p of ALL_STATIC_PRODUCTS) {
    map.set(p.sku.toUpperCase(), p);
  }

  // 2. Live ERPNext Synced items take precedence
  for (const p of erpItems) {
    map.set(p.sku.toUpperCase(), p);
  }

  return Array.from(map.values());
}

// In-memory collection shared at runtime
let productsDb: Product[] = loadCombinedProducts();

export function getProductsDb(): Product[] {
  if (productsDb.length === 0) {
    productsDb = loadCombinedProducts();
  }
  return productsDb;
}

export function setProductsDb(newProducts: Product[]): void {
  productsDb = [...newProducts];
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(newProducts, null, 2), 'utf-8');
  } catch {
    // ignore
  }
}
