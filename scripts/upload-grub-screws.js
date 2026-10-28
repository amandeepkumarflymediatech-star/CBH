const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const ERPNEXT_URL = 'https://cbhtest.m.frappe.cloud';
const API_KEY = 'd2141a328e0411a';
const API_SECRET = '7311220ffb3e4cd';
const AUTH_HEADER = {
  'Authorization': `token ${API_KEY}:${API_SECRET}`,
  'Content-Type': 'application/json',
};

const BOLTS_FILE = path.join(__dirname, '..', 'BOLTS.xlsx');

function generateItemCode(itemName) {
  return ('CBH-' + itemName.toUpperCase()
    .replace(/\(.*?\)/g, '')
    .replace(/FULL THREAD|HALF THREAD/gi, '')
    .replace(/GRADE\s*/gi, 'G')
    .replace(/[^A-Z0-9.\-\/]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  ).substring(0, 60);
}

async function main() {
  console.log('=== Uploading GRUB SCREWS (142 items) with ALL Excel data to ERPNext ===');

  const wb = XLSX.readFile(BOLTS_FILE);
  const ws = wb.Sheets['GRUB SCREW'];
  if (!ws) {
    console.error('Sheet "GRUB SCREW" not found!');
    process.exit(1);
  }

  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
  const rawRows = data.slice(2).filter(r => r && r[7]);
  console.log(`Found ${rawRows.length} items in GRUB SCREW sheet.`);

  let ok = 0, fail = 0;

  for (let idx = 0; idx < rawRows.length; idx++) {
    const r = rawRows[idx];
    const itemName = String(r[7]).trim();
    const itemCode = generateItemCode(itemName);

    const subGroup = r[1] || 'SCREW';
    const category = r[2] || 'SOCKET HEAD';
    const subCategory = r[3] || 'ALLEN GRUB SCREWS';
    const threadLength = r[4] || 'FULL THREAD';
    const standard = r[8] || r[9] || r[17] || 'DIN 916';
    const dia = r[22] || '';
    const pitch = r[23] || '';
    const length = r[24] || '';
    const grade = r[26] || 'GRADE 45H';
    const finish = r[31] || 'BP';
    const weightPerPc = parseFloat(r[30]) || 0;
    const prodDays = parseInt(r[33]) || 7;
    const packDays = parseInt(r[35]) || 3;
    const leadTimeDays = prodDays + packDays; // 10 days
    const moq = r[69] || '25 KGS';
    const size = r[99] || `${dia}X${pitch}X${length}`;
    const pcsPerBox = r[60] ? Math.round(parseFloat(r[60])) : 'Standard';
    const pcsPerCtn = r[63] ? Math.round(parseFloat(r[63])) : 'Standard';
    const gdriveImg = r[73] || '';
    const gdriveDraw = r[74] || '';

    // Selling rate per piece
    const p1000 = parseFloat(r[137]);
    const p100 = parseFloat(r[136]);
    let rate = 0;
    if (!isNaN(p1000) && p1000 > 0) rate = +(p1000 / 1000).toFixed(4);
    else if (!isNaN(p100) && p100 > 0) rate = +(p100 / 100).toFixed(4);

    // Formatted HTML specification table preserving 100% of the input data
    const descriptionHtml = `
<div style="font-family: Arial, sans-serif; font-size: 13px; line-height: 1.6;">
  <p><strong>${itemName}</strong></p>
  <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
    <tbody>
      <tr style="background: #f8f9fa;"><td style="padding: 4px 8px; border: 1px solid #ddd; width: 35%;"><strong>Sub-Group</strong></td><td style="padding: 4px 8px; border: 1px solid #ddd;">${subGroup}</td></tr>
      <tr><td style="padding: 4px 8px; border: 1px solid #ddd;"><strong>Category</strong></td><td style="padding: 4px 8px; border: 1px solid #ddd;">${category} (${subCategory})</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 4px 8px; border: 1px solid #ddd;"><strong>Standard / Specification</strong></td><td style="padding: 4px 8px; border: 1px solid #ddd;">${standard}</td></tr>
      <tr><td style="padding: 4px 8px; border: 1px solid #ddd;"><strong>Thread Length</strong></td><td style="padding: 4px 8px; border: 1px solid #ddd;">${threadLength}</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 4px 8px; border: 1px solid #ddd;"><strong>Diameter (DIA)</strong></td><td style="padding: 4px 8px; border: 1px solid #ddd;">${dia}</td></tr>
      <tr><td style="padding: 4px 8px; border: 1px solid #ddd;"><strong>Pitch / TPI</strong></td><td style="padding: 4px 8px; border: 1px solid #ddd;">${pitch}</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 4px 8px; border: 1px solid #ddd;"><strong>Length</strong></td><td style="padding: 4px 8px; border: 1px solid #ddd;">${length}</td></tr>
      <tr><td style="padding: 4px 8px; border: 1px solid #ddd;"><strong>Size</strong></td><td style="padding: 4px 8px; border: 1px solid #ddd;">${size}</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 4px 8px; border: 1px solid #ddd;"><strong>Material Grade</strong></td><td style="padding: 4px 8px; border: 1px solid #ddd;">${grade}</td></tr>
      <tr><td style="padding: 4px 8px; border: 1px solid #ddd;"><strong>Finish / Coating</strong></td><td style="padding: 4px 8px; border: 1px solid #ddd;">${finish}</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 4px 8px; border: 1px solid #ddd;"><strong>Per Piece Weight</strong></td><td style="padding: 4px 8px; border: 1px solid #ddd;">${weightPerPc} kg</td></tr>
      <tr><td style="padding: 4px 8px; border: 1px solid #ddd;"><strong>Standard Selling Rate</strong></td><td style="padding: 4px 8px; border: 1px solid #ddd;">₹${rate} / pc (₹${p1000}/1000 pcs)</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 4px 8px; border: 1px solid #ddd;"><strong>Small Box Packaging</strong></td><td style="padding: 4px 8px; border: 1px solid #ddd;">2.5 KGS Box (${pcsPerBox} pcs)</td></tr>
      <tr><td style="padding: 4px 8px; border: 1px solid #ddd;"><strong>Master Carton Packaging</strong></td><td style="padding: 4px 8px; border: 1px solid #ddd;">20 KGS Box (${pcsPerCtn} pcs)</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 4px 8px; border: 1px solid #ddd;"><strong>MOQ</strong></td><td style="padding: 4px 8px; border: 1px solid #ddd;">${moq}</td></tr>
      <tr><td style="padding: 4px 8px; border: 1px solid #ddd;"><strong>Lead Time</strong></td><td style="padding: 4px 8px; border: 1px solid #ddd;">${leadTimeDays} Days (Production: ${prodDays}d, Packing: ${packDays}d)</td></tr>
      ${gdriveImg ? `<tr style="background: #f8f9fa;"><td style="padding: 4px 8px; border: 1px solid #ddd;"><strong>Image Attachment</strong></td><td style="padding: 4px 8px; border: 1px solid #ddd;"><a href="${gdriveImg}" target="_blank">View Photo</a></td></tr>` : ''}
      ${gdriveDraw ? `<tr><td style="padding: 4px 8px; border: 1px solid #ddd;"><strong>Technical Drawing</strong></td><td style="padding: 4px 8px; border: 1px solid #ddd;"><a href="${gdriveDraw}" target="_blank">View Drawing</a></td></tr>` : ''}
    </tbody>
  </table>
</div>
`.trim();

    const payload = {
      item_code: itemCode,
      item_name: itemName,
      item_group: 'Products',
      stock_uom: 'Nos',
      brand: 'CBH',
      gst_hsn_code: '73181500',
      is_stock_item: 1,
      is_fixed_asset: 0,
      allow_sales: 1,
      allow_purchase: 1,
      standard_rate: rate,
      weight_per_unit: weightPerPc,
      weight_uom: 'Kg',
      lead_time_days: leadTimeDays,
      min_order_qty: 25,
      safety_stock: 25,
      image: '/files/grub-screw-din916.png',
      description: descriptionHtml
    };

    try {
      const checkRes = await fetch(`${ERPNEXT_URL}/api/resource/Item/${encodeURIComponent(itemCode)}`, {
        headers: AUTH_HEADER
      });

      let res;
      if (checkRes.ok) {
        res = await fetch(`${ERPNEXT_URL}/api/resource/Item/${encodeURIComponent(itemCode)}`, {
          method: 'PUT',
          headers: AUTH_HEADER,
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${ERPNEXT_URL}/api/resource/Item`, {
          method: 'POST',
          headers: AUTH_HEADER,
          body: JSON.stringify(payload)
        });
      }

      const d = await res.json();
      if (res.ok && d.data) {
        ok++;
        console.log(`[${idx + 1}/${rawRows.length}] OK: ${itemCode} | ₹${rate}/pc | Wt: ${weightPerPc}kg | Box: ${pcsPerBox}pcs`);
      } else {
        fail++;
        const msg = d.exception || d.message || JSON.stringify(d);
        console.log(`[${idx + 1}/${rawRows.length}] FAIL: ${itemCode} -> ${msg}`);
      }
    } catch (e) {
      fail++;
      console.log(`[${idx + 1}/${rawRows.length}] ERROR: ${itemCode} -> ${e.message}`);
    }

    await new Promise(r => setTimeout(r, 220));
  }

  console.log(`\n=== Summary: ${ok} Uploaded/Updated, ${fail} Failed ===`);
}

main().catch(console.error);

