// ==============================================================================
// CBH FASTENERS - AUTO MIGRATE ITEMS FROM CBHTEST TO CBHTECH (APPROACH A)
// ==============================================================================

const fs = require('fs');
const path = require('path');

const SOURCE_URL = 'https://cbhtest.m.frappe.cloud';
const SOURCE_TOKEN = 'd2141a328e0411a:7311220ffb3e4cd'; // amandeepkumar.flymediatech@gmail.com

const TARGET_URL = 'https://cbhtech.m.frappe.cloud';
const TARGET_TOKEN = 'b30fbfcf1eb3ef2:e23af56c82cef2d'; // hrmanager@capitalbolts.co

async function fetchAllItems(baseUrl, token) {
  let allItems = [];
  let start = 0;
  const pageLength = 100;

  while (true) {
    const url = `${baseUrl}/api/resource/Item?fields=["*"]&limit_start=${start}&limit_page_length=${pageLength}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `token ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed fetching from ${baseUrl}: HTTP ${res.status}`);
    }

    const json = await res.json();
    const items = json.data || [];
    allItems = allItems.concat(items);

    if (items.length < pageLength) break;
    start += pageLength;
  }

  return allItems;
}

function normalizeItemGroup(ig) {
  const upper = (ig || '').toUpperCase();
  if (upper.includes('NUT')) return 'NUTS';
  if (upper.includes('WASHER')) return 'WASHERS';
  if (upper.includes('BOLT')) return 'BOLTS';
  if (upper.includes('SCREW')) return 'SCREW';
  return 'BOLTS'; // Default valid group on cbhtech
}

function escapeCsv(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

async function runMigration() {
  console.log('🚀 Starting Item Migration: cbhtest -> cbhtech (Approach A)...\n');

  console.log('1. Fetching items from SOURCE (cbhtest.m.frappe.cloud)...');
  const sourceItems = await fetchAllItems(SOURCE_URL, SOURCE_TOKEN);
  console.log(`   ✓ Found ${sourceItems.length} items in cbhtest.\n`);

  console.log('2. Fetching existing items from TARGET (cbhtech.m.frappe.cloud)...');
  const targetItems = await fetchAllItems(TARGET_URL, TARGET_TOKEN);
  const targetSkuSet = new Set(targetItems.map((x) => (x.item_code || x.name || '').toUpperCase()));
  console.log(`   ✓ Found ${targetItems.length} existing items in cbhtech.\n`);

  // Filter missing items
  const missingItems = sourceItems.filter((item) => {
    const code = (item.item_code || item.name || '').toUpperCase();
    return !targetSkuSet.has(code);
  });

  console.log(`3. Migration Scope:`);
  console.log(`   - Existing on cbhtech: ${targetItems.length}`);
  console.log(`   - Missing to migrate:  ${missingItems.length} items\n`);

  // Generate CSV backup
  const csvHeaders = [
    'item_code',
    'item_name',
    'item_group',
    'stock_uom',
    'standard_rate',
    'weight_per_unit',
    'gst_hsn_code',
    'is_stock_item',
    'is_purchase_item',
    'is_sales_item',
  ];

  const csvRows = [csvHeaders.join(',')];
  for (const item of sourceItems) {
    const row = [
      escapeCsv(item.item_code || item.name),
      escapeCsv(item.item_name || item.item_code || item.name),
      escapeCsv(normalizeItemGroup(item.item_group)),
      escapeCsv(item.stock_uom || 'Nos'),
      item.standard_rate || 0,
      item.weight_per_unit || 0,
      escapeCsv('73181500'),
      1,
      1,
      1,
    ];
    csvRows.push(row.join(','));
  }

  const csvPath = path.resolve(process.cwd(), 'cbhtest_items_for_cbhtech.csv');
  fs.writeFileSync(csvPath, csvRows.join('\n'), 'utf8');
  console.log(`4. Saved complete catalog CSV: ${csvPath}\n`);

  if (missingItems.length === 0) {
    console.log('🎉 Target cbhtech already has all items! Migration complete.');
    return;
  }

  console.log(`5. Pushing ${missingItems.length} missing items directly to cbhtech via API...`);
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < missingItems.length; i++) {
    const item = missingItems[i];
    const itemCode = (item.item_code || item.name || '').toUpperCase();

    const payload = {
      item_code: itemCode,
      item_name: item.item_name || itemCode,
      item_group: normalizeItemGroup(item.item_group),
      stock_uom: item.stock_uom || 'Nos',
      standard_rate: item.standard_rate || 0,
      weight_per_unit: item.weight_per_unit || 0,
      gst_hsn_code: '73181500',
      is_stock_item: 1,
      is_purchase_item: 1,
      is_sales_item: 1,
    };

    try {
      const res = await fetch(`${TARGET_URL}/api/resource/Item`, {
        method: 'POST',
        headers: {
          Authorization: `token ${TARGET_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        successCount++;
        process.stdout.write(`   [${i + 1}/${missingItems.length}] ✓ Added: ${itemCode}\n`);
      } else {
        const errJson = await res.json().catch(() => ({}));
        failCount++;
        console.warn(`   [${i + 1}/${missingItems.length}] ✗ Failed: ${itemCode} - ${errJson.message || res.statusText}`);
      }
    } catch (netErr) {
      failCount++;
      console.warn(`   [${i + 1}/${missingItems.length}] ✗ Error: ${itemCode} - ${netErr.message}`);
    }

    // Small delay to prevent rate-limiting
    await new Promise((r) => setTimeout(r, 120));
  }

  console.log('\n==================================================');
  console.log(`Migration Complete:`);
  console.log(`✓ Successfully migrated: ${successCount} items`);
  console.log(`✗ Failed / Skipped:     ${failCount} items`);
  console.log(`📁 Backup CSV saved:    ${csvPath}`);
  console.log('==================================================\n');
}

runMigration().catch(console.error);

