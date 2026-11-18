import fs from 'fs';
import path from 'path';
import { Product } from './types';
import { ALL_STATIC_PRODUCTS } from './catalog-products-all';

const CACHE_FILE = path.join(process.cwd(), 'src', 'data', 'products-cache.json');
const LEGACY_CACHE_FILE = path.join(process.cwd(), 'src', 'data', 'erpnext-cached-products.json');

// Memory cache state tracking
declare global {
  var __cbh_products_db__: Product[] | undefined;
}

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
  if (globalThis.__cbh_products_db__ && globalThis.__cbh_products_db__.length > 0) {
    return globalThis.__cbh_products_db__;
  }
  const loaded = loadCombinedProducts();
  globalThis.__cbh_products_db__ = loaded;
  return loaded;
}

export function setProductsDb(newProducts: Product[]): void {
  globalThis.__cbh_products_db__ = [...newProducts];
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(newProducts, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed writing products cache:', err);
  }
}

export function resetProductsToDefault(): Product[] {
  globalThis.__cbh_products_db__ = [...ALL_STATIC_PRODUCTS];
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(globalThis.__cbh_products_db__, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed resetting products cache to defaults:', err);
  }
  return globalThis.__cbh_products_db__;
}
