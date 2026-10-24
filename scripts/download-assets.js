const fs = require('fs');
const path = require('path');
const https = require('https');

const certDir = path.join(__dirname, '..', 'public', 'assets', 'certificates');
const logoDir = path.join(__dirname, '..', 'public', 'assets', 'client-logos');
const exhDir = path.join(__dirname, '..', 'public', 'assets', 'exhibitions');

[certDir, logoDir, exhDir].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const downloads = [
  // Certificates
  { url: 'https://cbh.codetest.store/assets/images/certificates/imageye___-_imgi_3_default.webp', dest: path.join(certDir, 'cert_ce.webp') },
  { url: 'https://cbh.codetest.store/assets/images/certificates/imageye___-_imgi_4_default.jpg', dest: path.join(certDir, 'cert_star_export.jpg') },
  { url: 'https://cbh.codetest.store/assets/images/certificates/previews/iso-9001-tuv-india.jpg', dest: path.join(certDir, 'cert_tuv_iso.jpg') },
  { url: 'https://cbh.codetest.store/assets/images/certificates/previews/bis-licence.jpg', dest: path.join(certDir, 'cert_bis_licence.jpg') },
  { url: 'https://cbh.codetest.store/assets/images/certificates/previews/bis-certification-grant.jpg', dest: path.join(certDir, 'cert_bis_grant.jpg') },
  { url: 'https://cbh.codetest.store/assets/images/certificates/imageye___-_imgi_6_default.png', dest: path.join(certDir, 'cert_aqc_iso.png') },
  { url: 'https://cbh.codetest.store/assets/images/certificates/imageye___-_imgi_7_default.jpg', dest: path.join(certDir, 'cert_msme_awards.jpg') },

  // Client Logos
  { url: 'https://cbh.codetest.store/assets/images/client-logos/imageye___-_imgi_31_indianoil_logo.webp', dest: path.join(logoDir, 'indianoil.webp') },
  { url: 'https://cbh.codetest.store/assets/images/client-logos/imageye___-_imgi_33_MPPGCL.webp', dest: path.join(logoDir, 'mppgcl.webp') },
  { url: 'https://cbh.codetest.store/assets/images/client-logos/imageye___-_imgi_35_NALCO.webp', dest: path.join(logoDir, 'nalco.webp') },
  { url: 'https://cbh.codetest.store/assets/images/client-logos/imageye___-_imgi_37_PSPCL-Logo.webp', dest: path.join(logoDir, 'pspcl.webp') },
  { url: 'https://cbh.codetest.store/assets/images/client-logos/imageye___-_imgi_39_Tata_Project_Limited.webp', dest: path.join(logoDir, 'tata_projects.webp') },
  { url: 'https://cbh.codetest.store/assets/images/client-logos/imageye___-_imgi_41_tata-power.webp', dest: path.join(logoDir, 'tata_power.webp') },
  { url: 'https://cbh.codetest.store/assets/images/client-logos/imageye___-_imgi_43_356-3561447_bharat-petroleum-logo-bharat-petroleum-corporation-limited-hd.webp', dest: path.join(logoDir, 'bpcl.webp') },
  { url: 'https://cbh.codetest.store/assets/images/client-logos/imageye___-_imgi_45_1430548318NTPC-Logo.webp', dest: path.join(logoDir, 'ntpc.webp') },
  { url: 'https://cbh.codetest.store/assets/images/client-logos/imageye___-_imgi_47_BSTPTC.webp', dest: path.join(logoDir, 'bstptc.webp') },
  { url: 'https://cbh.codetest.store/assets/images/client-logos/imageye___-_imgi_49_DRDO.webp', dest: path.join(logoDir, 'drdo.webp') },
  { url: 'https://cbh.codetest.store/assets/images/client-logos/imageye___-_imgi_52_INDIAN%20RAILWAY.webp', dest: path.join(logoDir, 'indian_railway.webp') },
  { url: 'https://cbh.codetest.store/assets/images/client-logos/imageye___-_imgi_32_logo_21183_1632211596.webp', dest: path.join(logoDir, 'bses.webp') },
  { url: 'https://cbh.codetest.store/assets/images/client-logos/imageye___-_imgi_34_MPPKVVCL.webp', dest: path.join(logoDir, 'mppkvvcl.webp') },
  { url: 'https://cbh.codetest.store/assets/images/client-logos/imageye___-_imgi_36_NHPC_Logo_PNG_File.webp', dest: path.join(logoDir, 'nhpc.webp') },
  { url: 'https://cbh.codetest.store/assets/images/client-logos/imageye___-_imgi_38_RRVUN.webp', dest: path.join(logoDir, 'rrvun.webp') },
  { url: 'https://cbh.codetest.store/assets/images/client-logos/imageye___-_imgi_40_tata-motors-logo.webp', dest: path.join(logoDir, 'tata_motors.webp') },
  { url: 'https://cbh.codetest.store/assets/images/client-logos/imageye___-_imgi_42_278-2787662_next-delhi-metro-logo-png.webp', dest: path.join(logoDir, 'dmrc.webp') },
  { url: 'https://cbh.codetest.store/assets/images/client-logos/imageye___-_imgi_44_1200px-BHEL_logo.svg.webp', dest: path.join(logoDir, 'bhel.webp') },
  { url: 'https://cbh.codetest.store/assets/images/client-logos/imageye___-_imgi_46_201810170105422367_L-and-T-arm-opens-tech-hub-for-IoT-in-Bengaluru_SECVPF.webp', dest: path.join(logoDir, 'lnt.webp') },
  { url: 'https://cbh.codetest.store/assets/images/client-logos/imageye___-_imgi_50_DTL.webp', dest: path.join(logoDir, 'dtl.webp') },

  // Exhibitions
  { url: 'https://cbh.codetest.store/assets/images/exhibitions/exhibition-stand-branded.jpg', dest: path.join(exhDir, 'exhibition_stand_branded.jpg') },
  { url: 'https://cbh.codetest.store/assets/images/exhibitions/exhibition-stand-photo.jpg', dest: path.join(exhDir, 'exhibition_stand_photo.jpg') },
  { url: 'https://cbh.codetest.store/assets/images/exhibitions/exhibition-conversation.jpg', dest: path.join(exhDir, 'exhibition_conversation.jpg') },
];

function download(item) {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(item.dest);
    https.get(item.url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          console.log('Downloaded:', path.basename(item.dest));
          resolve(true);
        });
      });
    }).on('error', (err) => {
      fs.unlink(item.dest, () => {});
      console.error('Error downloading:', item.url, err.message);
      resolve(false);
    });
  });
}

async function run() {
  for (const item of downloads) {
    await download(item);
  }
  console.log('All downloads completed!');
}

run();
