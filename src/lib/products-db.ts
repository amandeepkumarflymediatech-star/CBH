import fs from 'fs';
import path from 'path';
import { Product } from './types';
import { ALL_STATIC_PRODUCTS } from './catalog-products-all';

const CACHE_FILE = path.join(process.cwd(), 'src', 'data', 'products-cache.json');
const LEGACY_CACHE_FILE = path.join(process.cwd(), 'src', 'data', 'erpnext-cached-products.json');

// Memory cache state tracking
let isDbInitialized = false;
let productsDb: Product[] = [];

export function loadCombinedProducts(): Product[] {
  try {
    const fileToRead = fs.existsSync(CACHE_FILE) ? CACHE_FILE : (fs.existsSync(LEGACY_CACHE_FILE) ? LEGACY_CACHE_FILE : null);
    if (fileToRead) {
      const fileContent = fs.readFileSync(fileToRead, 'utf-8').trim();
      if (fileContent) {
        const items = JSON.parse(fileContent);
        if (Array.isArray(items)) {
          return items;
        }
      }
    }
  } catch (err) {
    console.error('Failed reading products cache:', err);
  }

  // If no data is available in cache or DB, return empty array.
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
