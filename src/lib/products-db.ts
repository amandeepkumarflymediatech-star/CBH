import fs from 'fs';
import path from 'path';
import { Product } from './types';
import { ALL_STATIC_PRODUCTS } from './catalog-products-all';

const CACHE_FILE = path.join(process.cwd(), 'src', 'data', 'erpnext-cached-products.json');

// Memory cache state tracking
let isDbInitialized = false;
let productsDb: Product[] = [];

export function loadCombinedProducts(): Product[] {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const fileContent = fs.readFileSync(CACHE_FILE, 'utf-8').trim();
      if (fileContent) {
        const erpItems = JSON.parse(fileContent);
        if (Array.isArray(erpItems)) {
          // IMPORTANT: If CACHE_FILE exists and is a valid JSON array, respect it!
          // Even if erpItems is empty [], that means the admin deliberately deleted all products.
          // Never re-seed static demo products unless CACHE_FILE does not exist at all.
          return erpItems;
        }
      }
    }
  } catch (err) {
    console.error('Failed reading ERPNext cache:', err);
  }

  // If no data is available in cache or DB, return empty array.
  // Never automatically insert or fallback to static demo data.
  return [];
}

export function getProductsDb(): Product[] {
  if (!isDbInitialized) {
    productsDb = loadCombinedProducts();
    isDbInitialized = true;
  }
  return productsDb;
}

export function setProductsDb(newProducts: Product[]): void {
  productsDb = [...newProducts];
  isDbInitialized = true;
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(newProducts, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed writing products cache:', err);
  }
}

export function resetProductsToDefault(): Product[] {
  productsDb = [...ALL_STATIC_PRODUCTS];
  isDbInitialized = true;
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(productsDb, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed resetting products cache to defaults:', err);
  }
  return productsDb;
}
