import { Product } from './types';
import { INITIAL_PRODUCTS } from './mock-data';
import CBH_PRODUCTS, { CbhProductVariation } from './cbh-catalog-products';

export function mapCbhVariationToProduct(v: CbhProductVariation, idx: number): Product {
  const len = parseInt(v.length) || 100;
  return {
    id: 200 + idx,
    sku: v.sku,
    name: v.name,
    category: v.category || 'Hex Screws',
    standard: v.standard || 'DIN 933',
    grade: v.grade || 'Grade 5.8',
    finish: v.finishName || v.finish,
    threadType: v.threadType || 'Full Thread',
    diameter: v.diameter || 'M10',
    lengthMm: len,
    pitchMm: parseFloat(v.pitch) || 1.5,
    weightPerPcKg: v.weightPerPcKg || 0.0601,
    pricePerPiece: v.pricePerPiece,
    originalPricePerPiece: v.originalPricePerPiece || v.pricePerPiece,
    pricePerKg: v.pricePerKg,
    originalPricePerKg: v.pricePerKg,
    stockPcs: v.stockQuantity || 15000,
    stockKg: (v.stockQuantity || 15000) * (v.weightPerPcKg || 0.0601),
    isInStock: true,
    isSurplus: v.isSurplus || false,
    surplusDiscountPct: v.discountPercent || 0,
    imageUrl: v.localImage || v.imageUrl || '/assets/bolt_zinc.jpg',
  };
}

// Build unified catalog: initial baseline products + 49 scraped variations
export function buildStaticProducts(): Product[] {
  const map = new Map<string, Product>();

  // 1. Initial baseline products (all real DIN 933/DIN 934 items)
  for (const p of INITIAL_PRODUCTS) {
    map.set(p.sku.toUpperCase(), p);
  }

  // 2. Real Scraped Variations from cbh.store/products
  if (Array.isArray(CBH_PRODUCTS)) {
    CBH_PRODUCTS.forEach((v, idx) => {
      map.set(v.sku.toUpperCase(), mapCbhVariationToProduct(v, idx));
    });
  }

  return Array.from(map.values());
}

export const ALL_STATIC_PRODUCTS: Product[] = buildStaticProducts();

export function findProductByIdOrSku(idOrSku: string | number, extraProducts?: Product[]): Product | undefined {
  const query = String(idOrSku).toLowerCase().trim();

  if (extraProducts && extraProducts.length > 0) {
    const found = extraProducts.find(
      (p) => String(p.id).toLowerCase() === query || p.sku.toLowerCase() === query
    );
    if (found) return found;
  }

  return ALL_STATIC_PRODUCTS.find(
    (p) => String(p.id).toLowerCase() === query || p.sku.toLowerCase() === query
  );
}
