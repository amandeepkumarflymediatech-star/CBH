// ==============================================================================
// CBH FASTENERS - REVERT CBHTEST TO CBHTECH MIGRATION (REMOVE 153 IMPORTED ITEMS)
// ==============================================================================

const fs = require('fs');
const path = require('path');

const TARGET_URL = 'https://cbhtech.m.frappe.cloud';
const TARGET_TOKEN = 'b30fbfcf1eb3ef2:e23af56c82cef2d'; // hrmanager@capitalbolts.co

async function revertMigration() {
  const csvPath = path.join(__dirname, '..', 'cbhtest_items_for_cbhtech.csv');
  if (!fs.existsSync(csvPath)) {
    console.error('CSV backup not found:', csvPath);
    return;
  }

  const rawCsv = fs.readFileSync(csvPath, 'utf-8');
  const lines = rawCsv.split('\n').filter(Boolean).slice(1);
  const itemCodesToDelete = lines.map((l) => {
    const match = l.match(/^"([^"]+)"/);
    return match ? match[1] : l.split(',')[0];
  }).filter(Boolean);

  console.log(`Found ${itemCodesToDelete.length} migrated items to potentially delete from cbhtech.`);

  let deletedCount = 0;
  let notFoundCount = 0;

  for (const itemCode of itemCodesToDelete) {
    try {
      const url = `${TARGET_URL}/api/resource/Item/${encodeURIComponent(itemCode)}`;
      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `token ${TARGET_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        deletedCount++;
        if (deletedCount % 20 === 0) console.log(`Deleted ${deletedCount}/${itemCodesToDelete.length}...`);
      } else if (res.status === 404) {
        notFoundCount++;
      } else {
        const text = await res.text();
        console.warn(`Failed to delete ${itemCode}: HTTP ${res.status} - ${text.slice(0, 100)}`);
      }
    } catch (err) {
      console.warn(`Error deleting ${itemCode}:`, err.message);
    }
  }

  console.log(`Reversion finished! Deleted ${deletedCount} items, ${notFoundCount} were not found.`);
}

if (require.main === module) {
  revertMigration();
}

module.exports = { revertMigration };

