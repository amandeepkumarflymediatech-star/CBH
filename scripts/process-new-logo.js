const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function processLogos() {
  const uploadDir = 'C:/Users/TEch/.gemini/antigravity-ide/brain/4281b7da-9b2d-456d-ba3f-106779edb4c2/.user_uploaded';
  const iconPath = path.join(uploadDir, 'media_1793011371281.png');
  const fullPath = path.join(uploadDir, 'media_1793011409948.png');
  const assetsDir = path.join(__dirname, '..', 'public', 'assets');

  console.log('Processing logos from:', uploadDir);

  // 1. Backup legacy logo if not already backed up
  const legacyLogo = path.join(assetsDir, 'logo_blue_legacy.png');
  const currentLogo = path.join(assetsDir, 'logo_blue.png');
  if (fs.existsSync(currentLogo) && !fs.existsSync(legacyLogo)) {
    fs.copyFileSync(currentLogo, legacyLogo);
    console.log('Backed up legacy logo to logo_blue_legacy.png');
  }

  // 2. Process Icon Only (Trim transparent border)
  const iconBuffer = await sharp(iconPath)
    .trim()
    .toBuffer();
  
  const iconTrimmedPath = path.join(assetsDir, 'cbh-logo-icon.png');
  await sharp(iconBuffer)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(iconTrimmedPath);
  console.log('Created:', iconTrimmedPath);

  // 3. Process Full Stacked Logo (Trim transparent border)
  const fullTrimmedBuffer = await sharp(fullPath)
    .trim()
    .toBuffer();
  
  const stackedPath = path.join(assetsDir, 'cbh-logo-stacked.png');
  await sharp(fullTrimmedBuffer)
    .png()
    .toFile(stackedPath);
  console.log('Created:', stackedPath);

  // 4. Extract Text Part (CBH.STORE and Tagline) from the full logo
  // The full image is 1024x1024. Let's inspect bounding box
  const fullMeta = await sharp(fullPath).metadata();
  console.log('Full image dimensions:', fullMeta.width, fullMeta.height);

  // 5. Create a Horizontal Lockup (Icon on Left + Typography on Right)
  // Let's extract the text portion below the 3D hexagon
  // In media_1793011409948.png:
  // Hexagon is in upper half (approx y: 250 to 600)
  // Text 'CBH.STORE' and tagline is in lower half (approx y: 620 to 760)
  const fullTrimmedMeta = await sharp(fullTrimmedBuffer).metadata();
  console.log('Trimmed dimensions:', fullTrimmedMeta.width, fullTrimmedMeta.height);

  // Let's crop text block from the trimmed buffer
  // Text starts exactly at row 399, separated from hexagon (ends at row 360)
  const textCropY = 399;
  const textCropH = fullTrimmedMeta.height - textCropY;
  
  const textBuffer = await sharp(fullTrimmedBuffer)
    .extract({
      left: 0,
      top: textCropY,
      width: fullTrimmedMeta.width,
      height: textCropH
    })
    .trim()
    .toBuffer();

  const textMeta = await sharp(textBuffer).metadata();
  console.log('Text block dimensions:', textMeta.width, textMeta.height);

  // Resize icon to fit nicely with text height (e.g. height 120px)
  const targetH = 140;
  const resizedIcon = await sharp(iconBuffer)
    .resize({ height: targetH, fit: 'contain' })
    .toBuffer();
  const rIconMeta = await sharp(resizedIcon).metadata();

  // Resize text to match proportionally
  const resizedText = await sharp(textBuffer)
    .resize({ height: Math.round(targetH * 0.85), fit: 'contain' })
    .toBuffer();
  const rTextMeta = await sharp(resizedText).metadata();

  // Composite horizontal banner: [ICON] (gap 24px) [TEXT]
  const gap = 20;
  const totalW = rIconMeta.width + gap + rTextMeta.width;
  const canvasH = targetH;

  const horizontalBuffer = await sharp({
    create: {
      width: totalW,
      height: canvasH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([
      { input: resizedIcon, top: 0, left: 0 },
      { input: resizedText, top: Math.round((canvasH - rTextMeta.height) / 2), left: rIconMeta.width + gap }
    ])
    .png()
    .toBuffer();

  const horizontalPath = path.join(assetsDir, 'cbh-logo-horizontal.png');
  await sharp(horizontalBuffer).toFile(horizontalPath);
  console.log('Created horizontal logo:', horizontalPath);

  // 6. Also create White Text version of horizontal logo for dark backgrounds (footer/admin)
  // Invert/recolor dark pixels of text to white
  const whiteTextBuffer = await sharp(resizedText)
    .negate({ alpha: false })
    .toBuffer();
  
  const horizontalWhitePath = path.join(assetsDir, 'cbh-logo-horizontal-white.png');
  await sharp({
    create: {
      width: totalW,
      height: canvasH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([
      { input: resizedIcon, top: 0, left: 0 },
      { input: whiteTextBuffer, top: Math.round((canvasH - rTextMeta.height) / 2), left: rIconMeta.width + gap }
    ])
    .png()
    .toFile(horizontalWhitePath);
  console.log('Created white horizontal logo:', horizontalWhitePath);

  // 7. Update public/assets/logo_blue.png with the new horizontal logo
  fs.copyFileSync(horizontalPath, currentLogo);
  console.log('Updated public/assets/logo_blue.png with new horizontal logo');

  // 8. Update favicon
  const faviconPath = path.join(__dirname, '..', 'public', 'favicon.ico');
  await sharp(iconBuffer)
    .resize(64, 64)
    .png()
    .toFile(faviconPath.replace('.ico', '.png'));
  
  console.log('Logo processing completed successfully!');
}

processLogos().catch(console.error);
