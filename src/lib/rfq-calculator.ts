// ============================================================================
// CBH FASTENERS - BULK RFQ & VOLUME TIER PRICING CALCULATOR
// ============================================================================

import { RfqLineItem, RfqSummary, GlobalUnit } from './types';

// ============================================================================
// MINIMUM ORDER QUANTITY (MOQ) RULES
// - PCS: Minimum 100 PCS
// - KGS: Minimum 250 gm (0.25 KG)
// ============================================================================
export const MIN_QTY_PCS = 100;
export const MIN_QTY_KGS = 0.25; // 250 grams = 0.25 kg

export function getMinQty(unit: GlobalUnit = 'PCS'): number {
  return unit === 'KGS' ? MIN_QTY_KGS : MIN_QTY_PCS;
}

export function getDefaultQty(unit: GlobalUnit = 'PCS'): number {
  return unit === 'KGS' ? MIN_QTY_KGS : MIN_QTY_PCS;
}

/**
 * Returns sensible increment/decrement step size based on unit and current quantity
 */
export function getQtyStep(unit: GlobalUnit = 'PCS', currentQty?: number): number {
  if (unit === 'KGS') {
    if (currentQty !== undefined && currentQty < 1) return 0.25; // 250gm step
    if (currentQty !== undefined && currentQty < 5) return 0.5;  // 500gm step
    return 1; // 1kg step
  }
  return 100; // 100 pcs step
}

/**
 * Clamps quantity to MOQ gracefully without throwing jarring errors
 */
export function clampQty(qty: number, unit: GlobalUnit = 'PCS'): number {
  const min = getMinQty(unit);
  if (isNaN(qty) || qty <= 0) return min;
  if (qty < min) return min;
  if (unit === 'KGS') {
    // Avoid floating point inaccuracies (e.g. 0.2500000000004)
    return Math.round(qty * 100) / 100;
  }
  return Math.round(qty);
}

/**
 * Formats quantity for display with clear unit and gram representation
 * e.g. 0.25 kg -> "250 gm (0.25 Kg)", 100 pcs -> "100 Pcs"
 */
export function formatQtyDisplay(qty: number, unit: GlobalUnit = 'PCS'): string {
  if (unit === 'KGS') {
    if (qty === 0.25) return '250 gm (0.25 Kg)';
    if (qty > 0 && qty < 1) {
      const gm = Math.round(qty * 1000);
      return `${gm} gm (${qty} Kg)`;
    }
    return `${qty.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Kg`;
  }
  return `${Math.round(qty).toLocaleString('en-IN')} Pcs`;
}

export function formatUnitLabel(unit: GlobalUnit = 'PCS'): string {
  return unit === 'KGS' ? 'KGS (Min 250 gm)' : 'PCS (Min 100 pcs)';
}

export function calculateRfqSummary(items: RfqLineItem[]): RfqSummary {
  let grossAmount = 0;
  let totalWeightKg = 0;

  items.forEach((item) => {
    grossAmount += item.rowTotal;
    totalWeightKg += item.totalWeightKg;
  });

  // Wholesale Volume Tier Evaluation
  let slabDiscountPct = 0;
  let tierLabel = '0% STANDARD';
  let nextTierDelta = 0;

  if (grossAmount >= 100000) {
    slabDiscountPct = 25;
    tierLabel = '25% FLAT OFF ACTIVE';
    nextTierDelta = 0;
  } else if (grossAmount >= 50000) {
    slabDiscountPct = 15;
    tierLabel = '15% FLAT OFF ACTIVE';
    nextTierDelta = 100000 - grossAmount;
  } else if (grossAmount >= 25000) {
    slabDiscountPct = 5;
    tierLabel = '5% OFF ACTIVE';
    nextTierDelta = 50000 - grossAmount;
  } else {
    slabDiscountPct = 0;
    tierLabel = '0% STANDARD';
    nextTierDelta = 25000 - grossAmount;
  }

  const slabDiscountAmount = (grossAmount * slabDiscountPct) / 100;
  const discountedGross = grossAmount - slabDiscountAmount;

  // Free freight above ₹25,000, otherwise ₹1,200 nominal freight
  const freightAmount = grossAmount >= 25000 || grossAmount === 0 ? 0 : 1200;

  // 18% GST on Indian Industrial Fasteners (HSN 7318)
  const gstRatePct = 18;
  const gstAmount = (discountedGross + freightAmount) * (gstRatePct / 100);

  const netTotal = discountedGross + freightAmount + gstAmount;

  // Progress Bar percentage relative to 1 Lakh (₹1,00,000)
  const progressPercent = Math.min(100, Math.round((grossAmount / 100000) * 100));

  return {
    grossAmount,
    slabDiscountPct,
    slabDiscountAmount,
    freightAmount,
    gstRatePct,
    gstAmount,
    netTotal,
    totalWeightKg,
    tierLabel,
    nextTierDelta,
    progressPercent,
  };
}

export function formatINR(val: number): string {
  return '₹ ' + val.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Converts ALL CAPS or messy text into clean Title Case while preserving
 * standard fastener industry acronyms and specifications (DIN, ISO, ASME, HDG, M10, etc.)
 */
export function toTitleCase(str?: string | null): string {
  if (!str) return '';

  const ACRONYMS = new Set([
    'DIN', 'ISO', 'ASME', 'ASTM', 'BS', 'IS', 'ANSI', 'EN', 'JIS', 'GOST',
    'HDG', 'BZP', 'ZP', 'BP', 'SS', 'MS', 'GI', 'PTFE', 'BLKZP',
    'MOQ', 'HSN', 'SKU', 'NABL', 'CAD', 'PDF', 'RFQ', 'GST', 'B2B', 'OEM',
    'ROHS', 'REACH', 'UNC', 'UNF', 'BSW', 'BA', 'BSF', 'TPI', 'PCD',
    'CBH', 'FT', 'PT', 'HT', 'SS304', 'SS316', 'AISI'
  ]);

  const MINOR_WORDS = new Set(['and', 'or', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'of', 'a', 'an', 'the']);

  return str.replace(/[A-Za-z0-9]+(?:'[a-z]+)?/g, (match, offset) => {
    const upper = match.toUpperCase();
    if (ACRONYMS.has(upper)) return upper;

    // Alphanumeric standard codes like 125A, 127B, 934M
    if (/^\d+[A-Z]$/i.test(match)) return match.toUpperCase();

    // Metric size notation like M10, M12, M10X1.5
    if (/^M\d+/i.test(match)) {
      return match.charAt(0).toUpperCase() + match.slice(1).replace(/X/g, 'x');
    }

    // Pure numbers
    if (/^\d+(\.\d+)?$/.test(match)) return match;

    const lower = match.toLowerCase();
    if (offset > 0 && MINOR_WORDS.has(lower)) return lower;

    return match.charAt(0).toUpperCase() + match.slice(1).toLowerCase();
  });
}

