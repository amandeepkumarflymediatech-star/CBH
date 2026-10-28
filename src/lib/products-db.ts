import fs from 'fs';
import path from 'path';
import { Product } from './types';
import { ALL_STATIC_PRODUCTS } from './catalog-products-all';

const CACHE_FILE = path.join(process.cwd(), 'src', 'data', 'erpnext-cached-products.json');

export function loadCombinedProducts(): Product[] {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const erpItems: Product[] = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
      if (Array.isArray(erpItems) && erpItems.length > 0) {
        // ERPNext is the authoritative source of truth:
        // Items deleted from ERPNext will not be re-added from old static seed files.
        return erpItems;
      }
    }
  } catch (err) {
    console.error('Failed reading ERPNext cache:', err);
  }

  // Fallback to static seed data only if ERPNext has never been synced yet
  return [...ALL_STATIC_PRODUCTS];
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
