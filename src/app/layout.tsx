import type { Metadata, Viewport } from 'next';
import '../../css/main.css';
import '../../css/storefront.css';
import '../../css/bulk-rfq.css';
import '../../css/product-detail.css';
import '../../css/admin-panel.css';
import './globals.css';
import TopOpsBar from '@/components/header/TopOpsBar';
import IndustrialFooter from '@/components/footer/IndustrialFooter';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'CBH Fasteners | India\'s Premier Digital Fastener Procurement Platform',
  description: '2 Lacs+ SKUs under one roof. BIS Certified DIN & ISO precision fasteners, hex screws, heavy bolts, and anchors. Rapid RFQ & dual unit PCS/KGS wholesale pricing.',
  keywords: 'fasteners, hex screws, DIN 933, bolts, anchors, BIS certified fasteners, bulk fastener order, surplus stock, Hilti, Fischer',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/assets/logo_blue.png" type="image/png" />
      </head>
      <body>
        <TopOpsBar />
        {children}
        <IndustrialFooter />
      </body>
    </html>
  );
}
