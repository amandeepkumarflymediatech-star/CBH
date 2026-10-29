import * as XLSX from 'xlsx';
import { Product } from './types';
import { resolveProductImageUrl } from './product-image-resolver';

export interface SheetSummary {
  name: string;
  totalRows: number;
  estimatedProducts: number;
}

export interface WorkbookInspection {
  fileName?: string;
  sheets: SheetSummary[];
  totalSheets: number;
  firstSheetWithProducts: string;
}

export interface ParseOptions {
  sheetName?: string | 'all';
  defaultImage?: string;
  maxPreview?: number;
}

export interface ParseResult {
  products: Product[];
  totalRowsProcessed: number;
  validCount: number;
  invalidCount: number;
  sheetNamesProcessed: string[];
}

export const KNOWN_PRODUCT_SHEETS = [
  'ANTI THEFT BOLT',
  'ALLEN BOLT',
  'FLANGE BOLT',
  'CARRIAGE BOLT',
  'CSK ALLEN SCREW',
  'COLLAR BUTTON SCREW',
  'HEX BOLT MM',
  'HEX BOLT INCHS',
  'GRUB SCREW',
  'HSFG',
  'ROOFING BOLT',
  'SOCKET BUTTON SCREW',
  'THREAD ROD',
  'WING SCREW',
];

export const NON_PRODUCT_SHEETS = [
  'stock sheet',
  'dropdown',
  'coating price',
  'master sheet',
  'price matrix',
  'sell cheap',
  'sell cheap1',
  'price list',
  'template',
  'quotation',
  'select items',
  'for new enquiry',
  'order booking',
  'price rk',
  'form responses 1',
  'carrige bolt mgin',
  'flange bolt margin',
  'hsfg margin',
  'sheet9',
  'margin',
  'types',
  'all item name',
];

/**
 * Filter product sheets from a workbook: prioritizes known fastener category sheets
 * and filters out calculation, formula, margin, and quotation sheets.
 */
export function filterProductSheets(sheetNames: string[]): string[] {
  const matched = sheetNames.filter((s) =>
    KNOWN_PRODUCT_SHEETS.some((k) => k.toLowerCase() === s.trim().toLowerCase())
  );
  if (matched.length > 0) return matched;

  return sheetNames.filter((s) => {
    const lower = s.trim().toLowerCase();
    return !NON_PRODUCT_SHEETS.some((np) => lower === np || lower.includes(np));
  });
}

/**
 * Generates standard CBH item SKU code from Item Name if not explicitly supplied
 * Preserves standard (DIN/ISO), thread distinction (FT/HT), grade, and dimensions
 */
export function generateItemCode(itemName: string, fallbackIdx: number = 1): string {
  if (!itemName) return `CBH-SKU-${Date.now()}-${fallbackIdx}`;
  
  const clean = itemName
    .toUpperCase()
    .replace(/GRADE\s*/gi, 'G')
    .replace(/FULL THREAD/gi, 'FT')
    .replace(/HALF THREAD/gi, 'HT')
    .replace(/[^A-Z0-9.\-/]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 75);

  return clean ? `CBH-${clean}` : `CBH-FASTENER-${Date.now()}-${fallbackIdx}`;
}

/**
 * Intelligent header row detection: detects whether row 0 or row 1 contains column titles
 */
export function detectHeaderRow(rawRows: any[][]): number {
  if (!rawRows || rawRows.length < 2) return 0;

  const keywords = [
    'item', 'name', 'sku', 'code', 'product', 'category', 'sub-group',
    'price', 'rate', 'grade', 'standard', 'din', 'dia', 'diameter',
    'finish', 'weight', 'stock', 'thread'
  ];

  const scoreRow = (row: any[]): number => {
    if (!Array.isArray(row)) return 0;
    const str = row.filter(Boolean).map(String).join(' ').toLowerCase();
    return keywords.reduce((acc, k) => (str.includes(k) ? acc + 1 : acc), 0);
  };

  const score0 = scoreRow(rawRows[0]);
  const score1 = scoreRow(rawRows[1]);

  return score1 > score0 ? 1 : 0;
}

/**
 * Builds normalized dictionary mapping lowercased alphanumeric header names to column index
 */
export function buildHeaderMap(headerRow: any[]): Record<string, number> {
  const map: Record<string, number> = {};
  if (!Array.isArray(headerRow)) return map;

  headerRow.forEach((h, idx) => {
    if (h !== undefined && h !== null) {
      const norm = String(h).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      if (norm && map[norm] === undefined) {
        map[norm] = idx;
      }
    }
  });

  return map;
}

/**
 * Safely extracts value from row by checking a list of header keys or fallback index
 */
export function getRowValue(
  row: any[],
  headerMap: Record<string, number>,
  possibleKeys: string[],
  fallbackIdx?: number
): any {
  for (const k of possibleKeys) {
    const idx = headerMap[k];
    if (idx !== undefined && row[idx] !== undefined && row[idx] !== null && String(row[idx]).trim() !== '') {
      return row[idx];
    }
  }

  if (fallbackIdx !== undefined && row[fallbackIdx] !== undefined && row[fallbackIdx] !== null) {
    const val = String(row[fallbackIdx]).trim();
    if (val !== '' && val !== '#REF!' && val !== '0' && val !== '#N/A') {
      return row[fallbackIdx];
    }
  }

  return '';
}

/**
 * Infers engineering specifications (standard, grade, finish, diameter) from Item Name
 */
export function inferSpecsFromName(name: string) {
  let standard = 'DIN 933';
  const stdMatch = name.match(/\b(DIN\s*\d+|ISO\s*\d+|BS\s*\d+|ASTM\s*[A-Z0-9]+|IS\s*\d+)/i);
  if (stdMatch) standard = stdMatch[1].toUpperCase().replace(/\s+/, ' ');

  let grade = '8.8';
  const gradeMatch =
    name.match(/GRADE\s*([0-9.A-Z]+)/i) ||
    name.match(/\b(4\.6|5\.8|8\.8|10\.9|12\.9|45H|SS\s*304|SS\s*316)\b/i);
  if (gradeMatch) grade = gradeMatch[1].toUpperCase().replace(/\s+/, ' ');

  let finish = 'Black Passivated (BP)';
  if (/HDG|HOT DIP/i.test(name)) finish = 'Hot Dip Galvanized (HDG)';
  else if (/BLK\s*ZP|BLACK ZINC/i.test(name)) finish = 'Black Zinc Phosphated (Blkzp)';
  else if (/CLEAR ZINC|ZINC/i.test(name)) finish = 'Clear Zinc';
  else if (/SELF|NATURAL/i.test(name)) finish = 'Self Natural';
  else if (/BP|PASSIVATED/i.test(name)) finish = 'Black Passivated (BP)';

  let diameter = 'M10';
  const diaMatch = name.match(/(M\d+(?:\.\d+)?|\d+\/\d+"?|\d+"?)/i);
  if (diaMatch) diameter = diaMatch[1].toUpperCase();

  let threadType = 'Full Thread';
  if (/HALF THREAD|PARTIAL THREAD/i.test(name)) threadType = 'Half Thread';
  else if (/FULL THREAD/i.test(name)) threadType = 'Full Thread';

  let category = 'Hex Screws';
  if (/SOCKET|ALLEN|GRUB/i.test(name)) category = 'Socket Head Screws';
  else if (/FLANGE/i.test(name)) category = 'Flange Bolts';
  else if (/CARRIAGE/i.test(name)) category = 'Carriage Bolts';
  else if (/NUT/i.test(name)) category = 'Nuts';
  else if (/WASHER/i.test(name)) category = 'Washers';
  else if (/ANCHOR/i.test(name)) category = 'Anchor Bolts';
  else if (/STUD/i.test(name)) category = 'Stud Bolts';

  return { standard, grade, finish, diameter, threadType, category };
}

/**
 * Formats rich HTML engineering specification table for product drawer
 */
export function generateHtmlSpecTable(p: {
  name: string;
  subGroup?: string;
  category: string;
  subCategory?: string;
  standard: string;
  threadType?: string;
  diameter: string;
  pitchMm?: number;
  lengthMm?: number;
  sizeFormatted?: string;
  grade: string;
  finish: string;
  weightPerPcKg: number;
  pricePerPiece: number;
  price1000Pcs?: number;
  pcsPerBox?: number | string;
  pcsPerMasterCtn?: number | string;
  moq?: string;
  leadTimeDays?: number;
  drawingUrl?: string;
  gdriveImageUrl?: string;
}): string {
  const p1000 = p.price1000Pcs || +(p.pricePerPiece * 1000).toFixed(2);
  const size = p.sizeFormatted || `${p.diameter}x${p.lengthMm || 0}`;

  return `
<div style="font-family: Arial, sans-serif; font-size: 13px; line-height: 1.6;">
  <p><strong>${p.name}</strong></p>
  <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
    <tbody>
      <tr style="background: #f8f9fa;"><td style="padding: 4px 8px; border: 1px solid #ddd; width: 35%;"><strong>Sub-Group</strong></td><td style="padding: 4px 8px; border: 1px solid #ddd;">${p.subGroup || 'BOLTS & FASTENERS'}</td></tr>
      <tr><td style="padding: 4px 8px; border: 1px solid #ddd;"><strong>Category</strong></td><td style="padding: 4px 8px; border: 1px solid #ddd;">${p.category} ${p.subCategory ? `(${p.subCategory})` : ''}</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 4px 8px; border: 1px solid #ddd;"><strong>Standard / Specification</strong></td><td style="padding: 4px 8px; border: 1px solid #ddd;">${p.standard}</td></tr>
      <tr><td style="padding: 4px 8px; border: 1px solid #ddd;"><strong>Thread Type</strong></td><td style="padding: 4px 8px; border: 1px solid #ddd;">${p.threadType || 'Full Thread'}</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 4px 8px; border: 1px solid #ddd;"><strong>Diameter (DIA)</strong></td><td style="padding: 4px 8px; border: 1px solid #ddd;">${p.diameter}</td></tr>
      ${p.pitchMm ? `<tr><td style="padding: 4px 8px; border: 1px solid #ddd;"><strong>Pitch / TPI</strong></td><td style="padding: 4px 8px; border: 1px solid #ddd;">${p.pitchMm} mm</td></tr>` : ''}
      <tr style="background: #f8f9fa;"><td style="padding: 4px 8px; border: 1px solid #ddd;"><strong>Length</strong></td><td style="padding: 4px 8px; border: 1px solid #ddd;">${p.lengthMm || 0} mm</td></tr>
      <tr><td style="padding: 4px 8px; border: 1px solid #ddd;"><strong>Size</strong></td><td style="padding: 4px 8px; border: 1px solid #ddd;">${size}</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 4px 8px; border: 1px solid #ddd;"><strong>Material Grade</strong></td><td style="padding: 4px 8px; border: 1px solid #ddd;">${p.grade}</td></tr>
      <tr><td style="padding: 4px 8px; border: 1px solid #ddd;"><strong>Finish / Coating</strong></td><td style="padding: 4px 8px; border: 1px solid #ddd;">${p.finish}</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 4px 8px; border: 1px solid #ddd;"><strong>Per Piece Weight</strong></td><td style="padding: 4px 8px; border: 1px solid #ddd;">${p.weightPerPcKg} kg</td></tr>
      <tr><td style="padding: 4px 8px; border: 1px solid #ddd;"><strong>Standard Selling Rate</strong></td><td style="padding: 4px 8px; border: 1px solid #ddd;">₹${p.pricePerPiece} / pc (₹${p1000} / 1000 pcs)</td></tr>
      ${p.pcsPerBox ? `<tr style="background: #f8f9fa;"><td style="padding: 4px 8px; border: 1px solid #ddd;"><strong>Small Box Packaging</strong></td><td style="padding: 4px 8px; border: 1px solid #ddd;">${p.pcsPerBox} pcs</td></tr>` : ''}
      ${p.pcsPerMasterCtn ? `<tr><td style="padding: 4px 8px; border: 1px solid #ddd;"><strong>Master Carton Packaging</strong></td><td style="padding: 4px 8px; border: 1px solid #ddd;">${p.pcsPerMasterCtn} pcs</td></tr>` : ''}
      <tr style="background: #f8f9fa;"><td style="padding: 4px 8px; border: 1px solid #ddd;"><strong>MOQ</strong></td><td style="padding: 4px 8px; border: 1px solid #ddd;">${p.moq || '25 KGS'}</td></tr>
      <tr><td style="padding: 4px 8px; border: 1px solid #ddd;"><strong>Lead Time</strong></td><td style="padding: 4px 8px; border: 1px solid #ddd;">${p.leadTimeDays || 10} Days</td></tr>
      ${p.gdriveImageUrl ? `<tr style="background: #f8f9fa;"><td style="padding: 4px 8px; border: 1px solid #ddd;"><strong>Image Attachment</strong></td><td style="padding: 4px 8px; border: 1px solid #ddd;"><a href="${p.gdriveImageUrl}" target="_blank" rel="noopener noreferrer">View Photo</a></td></tr>` : ''}
      ${p.drawingUrl ? `<tr><td style="padding: 4px 8px; border: 1px solid #ddd;"><strong>Technical Drawing</strong></td><td style="padding: 4px 8px; border: 1px solid #ddd;"><a href="${p.drawingUrl}" target="_blank" rel="noopener noreferrer">View Drawing</a></td></tr>` : ''}
    </tbody>
  </table>
</div>
`.trim();
}

/**
 * Converts a raw Excel row into a fully populated Product object
 */
export function parseRowToProduct(
  row: any[],
  headerMap: Record<string, number>,
  rowIndex: number,
  defaultImage: string = '/assets/bolt_zinc.jpg'
): Product | null {
  if (!row || !Array.isArray(row) || row.length === 0) return null;

  // 1. Item Name
  const rawName = getRowValue(
    row,
    headerMap,
    ['itemname', 'name', 'productname', 'title', 'item', 'description'],
    7
  );
  const name = String(rawName).trim();
  if (
    !name ||
    name === '0' ||
    name === '#REF!' ||
    name === '#N/A' ||
    name === 'undefined' ||
    name.toLowerCase() === 'item name' ||
    name.toLowerCase() === 'itemname'
  ) {
    return null;
  }

  // 2. Inferred specs
  const inferred = inferSpecsFromName(name);

  // 3. SKU
  let rawSku = getRowValue(
    row,
    headerMap,
    ['sku', 'itemcode', 'code', 'sapcode', 'partnumber'],
    6
  );
  let sku = String(rawSku).trim();
  if (!sku || sku === '#REF!' || sku === '0' || sku === '#N/A' || sku.toLowerCase() === 'sku') {
    // Try SAP code fallback
    const sapCode = getRowValue(row, headerMap, ['sapcode', 'sap'], 0);
    if (sapCode && String(sapCode).trim() && String(sapCode) !== '0') {
      sku = `CBH-${String(sapCode).trim()}`;
    } else {
      sku = generateItemCode(name, rowIndex);
    }
  }

  // 4. Categories & Groups
  const subGroup = String(getRowValue(row, headerMap, ['subgroup', 'department', 'group'], 1) || '').trim() || 'BOLTS & FASTENERS';
  const category = String(getRowValue(row, headerMap, ['category', 'productcategory'], 2) || '').trim() || inferred.category;
  const subCategory = String(getRowValue(row, headerMap, ['subcategory'], 3) || '').trim() || category;

  // 5. Standards & Specifications
  const standard = String(getRowValue(row, headerMap, ['standard', 'din', 'specification', 'isostandard', 'bsstandard'], 8) || '').trim() || inferred.standard;
  const din = String(getRowValue(row, headerMap, ['din'], 8) || '').trim() || (standard.includes('DIN') ? standard : '');
  const isoStandard = String(getRowValue(row, headerMap, ['iso1', 'iso', 'isostandard'], 9) || '').trim();
  const bsStandard = String(getRowValue(row, headerMap, ['bs', 'bsstandard'], 17) || '').trim();
  const asmeStandard = String(getRowValue(row, headerMap, ['asme', 'asmestandard'], 16) || '').trim();

  // 6. Grade & Finish
  const grade = String(getRowValue(row, headerMap, ['grade', 'materialgrade', 'material'], 26) || '').trim() || inferred.grade;
  const finish = String(getRowValue(row, headerMap, ['finish', 'coating', 'surfacefinish'], 31) || '').trim() || inferred.finish;

  // 7. Thread & Dimensions
  const threadLength = String(getRowValue(row, headerMap, ['threadlength', 'threadtype', 'thread'], 4) || '').trim() || inferred.threadType;
  const threadType = String(getRowValue(row, headerMap, ['threadtype', 'threadlength'], 25) || '').trim() || threadLength || 'Full Thread';

  const diameter = String(getRowValue(row, headerMap, ['diameter', 'dia', 'diametermm'], 22) || '').trim() || inferred.diameter;
  const pitchRaw = getRowValue(row, headerMap, ['pitch', 'pitchmm', 'tpi'], 23);
  const pitchMm = parseFloat(pitchRaw) || 1.5;

  const lengthRaw = getRowValue(row, headerMap, ['length', 'lengthmm', 'len'], 24);
  const lengthMm = parseInt(String(lengthRaw).replace(/[^0-9]/g, '')) || 50;

  const sizeRaw = getRowValue(row, headerMap, ['size', 'sizeformatted'], 99);
  const sizeFormatted = sizeRaw ? String(sizeRaw).trim() : `${diameter}x${pitchMm}x${lengthMm}`;

  // 8. Weights
  const weightRaw = getRowValue(row, headerMap, ['weightperpc', 'perpieceweightkg', 'weightkg', 'weight', 'weightperunit'], 30);
  let weightPerPcKg = parseFloat(weightRaw);
  if (isNaN(weightPerPcKg) || weightPerPcKg <= 0) {
    weightPerPcKg = 0.05; // 50 grams standard bolt default
  }
  const weightPer1000PcsKg = +(weightPerPcKg * 1000).toFixed(3);

  // 9. Pricing Logic
  // Check column 137 (p1000), 136 (p100), 79 (COST/PER PCS), 78 (COST/100 PCS), or explicit header
  const p1000 = parseFloat(row[137]);
  const p100 = parseFloat(row[136]);
  const pCol79 = parseFloat(row[79]);
  const pCol78 = parseFloat(row[78]);
  const explicitRate = parseFloat(getRowValue(row, headerMap, ['priceperpiece', 'rate', 'price', 'unitprice', 'sellingrate', 'costperpcs', 'rateperpcs', 'finalsp']));

  let pricePerPiece = 0;
  if (!isNaN(p1000) && p1000 > 0) {
    pricePerPiece = +(p1000 / 1000).toFixed(4);
  } else if (!isNaN(p100) && p100 > 0) {
    pricePerPiece = +(p100 / 100).toFixed(4);
  } else if (!isNaN(explicitRate) && explicitRate > 0) {
    pricePerPiece = +explicitRate.toFixed(4);
  } else if (!isNaN(pCol79) && pCol79 > 0) {
    pricePerPiece = +pCol79.toFixed(4);
  } else if (!isNaN(pCol78) && pCol78 > 0) {
    pricePerPiece = +(pCol78 / 100).toFixed(4);
  } else {
    pricePerPiece = 5.0; // Clean default
  }

  // Price Per Kg
  let pricePerKg = parseFloat(getRowValue(row, headerMap, ['priceperkg', 'rateperkg', 'costperkgs', 'costperkg'], 80));
  if (isNaN(pricePerKg) || pricePerKg <= 0) {
    pricePerKg = +(pricePerPiece / weightPerPcKg).toFixed(2);
  }

  const price100Pcs = +(pricePerPiece * 100).toFixed(2);
  const price1000Pcs = +(pricePerPiece * 1000).toFixed(2);

  // 10. Stock & Inventory Telemetry
  const stockRaw = getRowValue(
    row,
    headerMap,
    ['stock', 'stockpcs', 'currentstock', 'qty', 'quantity', 'cbhactualstocklevel', 'actualstocklevel'],
    106
  );
  let stockPcs = parseInt(String(stockRaw).replace(/[^0-9]/g, ''));
  if (isNaN(stockPcs) || stockPcs < 0) {
    stockPcs = 10000; // Ready stock default
  }
  const stockKg = parseFloat((stockPcs * weightPerPcKg).toFixed(2));
  const isInStock = stockPcs > 0;

  // 11. Surplus Lot Flags
  const surplusVal = String(getRowValue(row, headerMap, ['surplus', 'issurplus', 'surpluslot'])).toLowerCase();
  const isSurplus = surplusVal === 'true' || surplusVal === 'yes' || surplusVal === '1';
  const discountRaw = getRowValue(row, headerMap, ['surplusdiscount', 'discount', 'discountpct', 'surplusdiscountpct']);
  const surplusDiscountPct = isSurplus ? parseInt(String(discountRaw)) || 35 : 0;

  // 12. Packaging & Logistics
  const pcsPerBox = getRowValue(row, headerMap, ['pcsperbox', 'boxpcs', 'pcsbox'], 60) || '';
  const pcsPerMasterCtn = getRowValue(row, headerMap, ['pcspermasterctn', 'pcsmasterctn', 'cartonpcs', 'masterctnpcs'], 63) || '';
  const moq = String(getRowValue(row, headerMap, ['moq', 'minorderqty', 'minimumorderqty'], 69) || '25 KGS').trim();

  const prodDays = parseInt(String(getRowValue(row, headerMap, ['production', 'proddays'], 33))) || 7;
  const packDays = parseInt(String(getRowValue(row, headerMap, ['packing', 'packdays'], 35))) || 3;
  const leadTimeRaw = getRowValue(row, headerMap, ['leadtime', 'leadtimedays']);
  const leadTimeDays = leadTimeRaw ? parseInt(String(leadTimeRaw)) || (prodDays + packDays) : prodDays + packDays;

  // 13. Media & Attachments
  const gdriveImageUrl = String(getRowValue(row, headerMap, ['image', 'gdriveimage', 'photourl'], 73) || '').trim();
  const drawingUrl = String(getRowValue(row, headerMap, ['drawing', 'drawingurl', 'cad', 'caddrawing'], 74) || '').trim();

  const explicitImage = String(getRowValue(row, headerMap, ['imageurl', 'photo', 'img']) || '').trim();
  const rawImage = explicitImage || gdriveImageUrl;
  const imageUrl = resolveProductImageUrl(rawImage, category, name);

  // 14. Description HTML & Plain Description
  const descriptionHtml = generateHtmlSpecTable({
    name,
    subGroup,
    category,
    subCategory,
    standard,
    threadType,
    diameter,
    pitchMm,
    lengthMm,
    sizeFormatted,
    grade,
    finish,
    weightPerPcKg,
    pricePerPiece,
    price1000Pcs,
    pcsPerBox,
    pcsPerMasterCtn,
    moq,
    leadTimeDays,
    drawingUrl,
    gdriveImageUrl,
  });

  const customDesc = String(getRowValue(row, headerMap, ['description', 'notes', 'spec']) || '').trim();
  const description = customDesc || `${name} - ${standard} Gr ${grade} ${finish}`;

  return {
    id: Date.now() + rowIndex,
    sku,
    name,
    category,
    subGroup,
    subCategory,
    standard,
    din,
    isoStandard,
    bsStandard,
    asmeStandard,
    grade,
    finish,
    threadType,
    threadLength,
    diameter,
    lengthMm,
    pitchMm,
    sizeFormatted,
    weightPerPcKg,
    weightPer1000PcsKg,
    pricePerPiece,
    originalPricePerPiece: pricePerPiece,
    pricePerKg,
    originalPricePerKg: pricePerKg,
    price100Pcs,
    price1000Pcs,
    stockPcs,
    stockKg,
    stockUom: 'Nos',
    isInStock,
    isSurplus,
    surplusDiscountPct,
    moq,
    leadTimeDays,
    productionDays: prodDays,
    packingDays: packDays,
    pcsPerBox,
    smallBoxWeightKg: 2.5,
    pcsPerMasterCtn,
    masterCtnWeightKg: 20,
    brand: 'CBH',
    hsnCode: '73181500',
    imageUrl,
    drawingUrl,
    gdriveImageUrl,
    descriptionHtml,
    description,
  };
}

/**
 * Inspects an Excel workbook buffer and returns its sheets and row statistics
 */
export function inspectWorkbook(buffer: Buffer): WorkbookInspection {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const sheets: SheetSummary[] = [];
  const validCategorySheets = filterProductSheets(wb.SheetNames);
  let firstSheetWithProducts = validCategorySheets[0] || wb.SheetNames[0] || 'Sheet1';

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    if (!ws) continue;
    const rawRows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
    const totalRows = rawRows.length;

    // Approximate products count: rows with non-empty column 7 or column 1/0
    let estimated = 0;
    if (totalRows > 1) {
      const headerIdx = detectHeaderRow(rawRows);
      for (let i = headerIdx + 1; i < totalRows; i++) {
        const r = rawRows[i];
        if (r && (r[7] || r[1] || r[0])) {
          const str = String(r[7] || r[1] || r[0]).trim();
          if (str && str !== '0' && str !== '#REF!' && str.length > 2 && str.toLowerCase() !== 'item name') {
            estimated++;
          }
        }
      }
    }

    sheets.push({
      name: sheetName,
      totalRows,
      estimatedProducts: estimated,
    });
  }

  return {
    sheets,
    totalSheets: wb.SheetNames.length,
    firstSheetWithProducts,
  };
}

/**
 * Parses products from a workbook buffer
 */
export function parseWorkbookBuffer(
  buffer: Buffer,
  options: ParseOptions = {}
): ParseResult {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const products: Product[] = [];
  const sheetNamesProcessed: string[] = [];
  let totalRowsProcessed = 0;
  let invalidCount = 0;

  const targetSheets =
    !options.sheetName || options.sheetName === 'all'
      ? filterProductSheets(wb.SheetNames)
      : [options.sheetName];

  for (const sheetName of targetSheets) {
    const ws = wb.Sheets[sheetName];
    if (!ws) continue;

    sheetNamesProcessed.push(sheetName);
    const rawRows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
    if (!rawRows || rawRows.length === 0) continue;

    const headerIdx = detectHeaderRow(rawRows);
    const headerRow = rawRows[headerIdx] || [];
    const headerMap = buildHeaderMap(headerRow);
    const dataRows = rawRows.slice(headerIdx + 1);

    for (let i = 0; i < dataRows.length; i++) {
      totalRowsProcessed++;
      const row = dataRows[i];
      const product = parseRowToProduct(row, headerMap, products.length + 1, options.defaultImage);

      if (product) {
        products.push(product);
      } else {
        invalidCount++;
      }

      if (options.maxPreview && products.length >= options.maxPreview) {
        break;
      }
    }

    if (options.maxPreview && products.length >= options.maxPreview) {
      break;
    }
  }

  return {
    products,
    totalRowsProcessed,
    validCount: products.length,
    invalidCount,
    sheetNamesProcessed,
  };
}

/**
 * Generates official CBH Excel Starter Template for bulk importing products
 */
export function generateFastenersExcelTemplate(): Buffer {
  const wb = XLSX.utils.book_new();

  // SHEET 1: Products Import Template
  const templateHeaders = [
    'SKU',
    'Item Name',
    'Sub-Group',
    'Category',
    'Sub-Category',
    'Standard',
    'DIN',
    'ISO Standard',
    'BS Standard',
    'Grade',
    'Finish',
    'Thread Type',
    'Diameter',
    'Pitch (mm)',
    'Length (mm)',
    'Weight Per Piece (kg)',
    'Price Per Piece (INR)',
    'Price Per Kg (INR)',
    'Stock (Pcs)',
    'MOQ',
    'Lead Time (Days)',
    'Pcs Per Box',
    'Pcs Per Master Carton',
    'Is Surplus',
    'Surplus Discount %',
    'Image URL',
    'Drawing URL',
    'Description',
  ];

  const sampleRows = [
    [
      'CBH-HEX-DIN933-M10X50-8.8-BP',
      'Hexagon Head Bolt DIN 933 Full Thread M10x1.5x50 Gr 8.8 BP',
      'BOLTS',
      'Hex Screws',
      'HEX BOLTS',
      'DIN 933',
      'DIN 933',
      'ISO 4017',
      '',
      '8.8',
      'Black Passivated (BP)',
      'Full Thread',
      'M10',
      1.5,
      50,
      0.045,
      12.50,
      277.78,
      25000,
      '25 KGS',
      10,
      200,
      1600,
      'FALSE',
      0,
      '/assets/bolt_zinc.jpg',
      '',
      'High-tensile Grade 8.8 hex fastener for structural heavy equipment',
    ],
    [
      'CBH-SOCKET-DIN912-M8X30-12.9-BP',
      'Socket Head Cap Screw DIN 912 M8x1.25x30 Grade 12.9 BP',
      'SCREW',
      'Socket Head Screws',
      'ALLEN CAP SCREWS',
      'DIN 912',
      'DIN 912',
      'ISO 4762',
      'BS 2470',
      '12.9',
      'Black Passivated (BP)',
      'Full Thread',
      'M8',
      1.25,
      30,
      0.022,
      8.75,
      397.73,
      50000,
      '25 KGS',
      7,
      500,
      4000,
      'FALSE',
      0,
      '/assets/products/1U_Tqo_2VpVxvv1P7BUPGeHXZe2akS68g.png',
      '',
      'High strength alloy steel internal hex allen cap screw',
    ],
    [
      'CBH-GRUB-DIN916-M6X10-45H-BP',
      'Socket Set Screw Cup Point DIN 916 M6x1.0x10 Grade 45H BP',
      'SCREW',
      'Socket Head Screws',
      'ALLEN GRUB SCREWS',
      'DIN 916',
      'DIN 916',
      'ISO 4029',
      'BS 2470',
      'GRADE 45H',
      'Black Passivated (BP)',
      'Full Thread',
      'M6',
      1.0,
      10,
      0.0035,
      2.40,
      685.71,
      85000,
      '25 KGS',
      5,
      1000,
      10000,
      'FALSE',
      0,
      '/files/grub-screw-din916.png',
      '',
      'Hardened grub screw with knurled cup point for torque locking',
    ],
    [
      'CBH-ANCHOR-WEDGE-M12X100-HDG',
      'Heavy Duty Wedge Anchor Bolt M12x100 Hot Dip Galvanized',
      'BOLTS',
      'Anchor Bolts',
      'WEDGE ANCHORS',
      'ASTM A193',
      '',
      '',
      '',
      '8.8',
      'Hot Dip Galvanized (HDG)',
      'Full Thread',
      'M12',
      1.75,
      100,
      0.115,
      38.00,
      330.43,
      15000,
      '100 PCS',
      12,
      50,
      400,
      'TRUE',
      25,
      '/assets/anchor_bolt.jpg',
      '',
      'Heavy duty structural masonry expansion wedge anchor with washer & nut',
    ],
  ];

  const templateData = [templateHeaders, ...sampleRows];
  const wsTemplate = XLSX.utils.aoa_to_sheet(templateData);

  // Set column widths for comfortable editing
  wsTemplate['!cols'] = [
    { wch: 30 }, // SKU
    { wch: 45 }, // Item Name
    { wch: 15 }, // Sub-Group
    { wch: 22 }, // Category
    { wch: 22 }, // Sub-Category
    { wch: 15 }, // Standard
    { wch: 12 }, // DIN
    { wch: 15 }, // ISO Standard
    { wch: 15 }, // BS Standard
    { wch: 12 }, // Grade
    { wch: 25 }, // Finish
    { wch: 15 }, // Thread Type
    { wch: 12 }, // Diameter
    { wch: 12 }, // Pitch (mm)
    { wch: 12 }, // Length (mm)
    { wch: 22 }, // Weight Per Piece (kg)
    { wch: 22 }, // Price Per Piece (INR)
    { wch: 20 }, // Price Per Kg (INR)
    { wch: 15 }, // Stock (Pcs)
    { wch: 12 }, // MOQ
    { wch: 16 }, // Lead Time (Days)
    { wch: 15 }, // Pcs Per Box
    { wch: 22 }, // Pcs Per Master Carton
    { wch: 14 }, // Is Surplus
    { wch: 20 }, // Surplus Discount %
    { wch: 35 }, // Image URL
    { wch: 35 }, // Drawing URL
    { wch: 45 }, // Description
  ];

  XLSX.utils.book_append_sheet(wb, wsTemplate, 'Fasteners Products');

  // SHEET 2: Instructions and Specification Reference
  const instructionsData = [
    ['CBH FASTENERS - BULK PRODUCT IMPORT USER GUIDE'],
    [''],
    ['COLUMN NAME', 'REQUIRED?', 'ACCEPTED FORMATS / EXAMPLES', 'NOTES & TIPS'],
    ['SKU', 'Recommended', 'CBH-HEX-DIN933-M10X50-8.8', 'If left empty, CBH will automatically generate an SKU from the Item Name.'],
    ['Item Name', 'MANDATORY', 'Hexagon Head Bolt DIN 933 Full Thread M10x1.5x50 Gr 8.8 BP', 'Full descriptive commercial fastener name.'],
    ['Sub-Group', 'Optional', 'BOLTS, SCREW, NUT, WASHER, ANCHOR', 'Major hierarchy classification.'],
    ['Category', 'Optional', 'Hex Screws, Socket Head Screws, Carriage Bolts, Nuts', 'Appears in frontend product filters.'],
    ['Standard', 'Optional', 'DIN 933, DIN 912, DIN 916, ISO 4017, ASTM A193, BS 2470', 'Industry standard norm.'],
    ['Grade', 'Optional', '4.6, 5.8, 8.8, 10.9, 12.9, 45H, SS 304, SS 316', 'Metallurgical strength grade.'],
    ['Finish', 'Optional', 'Black Passivated (BP), Hot Dip Galvanized (HDG), Clear Zinc, Self Natural', 'Surface coating treatment.'],
    ['Diameter', 'Optional', 'M6, M8, M10, M12, M16, 1/2", 3/4"', 'Nominal fastener thread diameter.'],
    ['Pitch (mm)', 'Optional', '0.5, 0.7, 1.0, 1.25, 1.5, 1.75, 2.0', 'Thread pitch in millimeters.'],
    ['Length (mm)', 'Optional', '10, 20, 30, 50, 100', 'Nominal bolt / screw length in mm.'],
    ['Weight Per Piece (kg)', 'Recommended', '0.045 (e.g. 45 grams = 0.045 kg)', 'Crucial for live RFQ weight and tonnage calculator.'],
    ['Price Per Piece (INR)', 'MANDATORY', '12.50', 'Base price per single unit in Indian Rupees (₹).'],
    ['Price Per Kg (INR)', 'Optional', '277.78', 'If omitted, automatically computed from Price Per Piece ÷ Weight.'],
    ['Stock (Pcs)', 'Optional', '25000', 'Available ready inventory pieces. Defaults to 10,000.'],
    ['MOQ', 'Optional', '25 KGS, 100 PCS', 'Minimum order quantity threshold.'],
    ['Lead Time (Days)', 'Optional', '7, 10, 14', 'Production + packing turnaround days.'],
    ['Is Surplus', 'Optional', 'TRUE or FALSE', 'Whether this item is featured in the OEM Surplus Clearance section.'],
    ['Surplus Discount %', 'Optional', '25, 35', 'Percentage discount off standard rates for surplus lots.'],
    ['Image URL', 'Optional', '/assets/bolt_zinc.jpg or frappe cloud URL', 'If empty, CBH assigns an appropriate category preset photo.'],
  ];

  const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);
  wsInstructions['!cols'] = [
    { wch: 25 },
    { wch: 15 },
    { wch: 45 },
    { wch: 60 },
  ];

  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions & Guide');

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

