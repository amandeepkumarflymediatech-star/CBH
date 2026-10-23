// ============================================================================
// CBH FASTENERS - BULK RFQ & VOLUME TIER PRICING CALCULATOR
// ============================================================================

import { RfqLineItem, RfqSummary } from './types';

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
