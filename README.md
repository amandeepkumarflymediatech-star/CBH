# CBH Fasteners - Industrial Metal Parts E-Commerce Platform

> **India's Premier Digital Fastener Procurement Platform**  
> 2 Lacs+ SKUs under one roof • BIS Certified DIN & ISO Precision Fasteners • Direct Mill Traceability with EN 10204 3.1 Inspection Certificates.

---

## 🛠️ Overview & Architecture

CBH Fasteners is a direct, single-source B2B and B2C metal parts e-commerce and bulk procurement platform built with **Next.js (App Router)**, **TypeScript**, and a **MySQL relational SQL schema**. The platform operates strictly on a **Direct Customer ➔ CBH Operations (Admin)** model (no third-party vendor selling or multi-vendor onboarding). The UI aesthetic is modeled after global engineering leaders **Hilti** and **Fischer**, featuring an industrial high-contrast dark charcoal and red palette (`#D2051E`), technical DIN blueprint callouts, parametric spec filtering, and real-time dual pricing in **Pieces (PCS)** and **Weight (KGS)**.

---

## ✨ Core Features

### 1. Storefront & Parametric Fastener Matrix
- **Parametric Fastener Finder**: Filter across Category, Standard (DIN 933, DIN 931, DIN 912, DIN 934, ASTM A193), Grade (5.8, 8.8, 10.9, SS 304, SS 316), Diameter (M6 to M36), Length (12mm to 150mm), and Finish (BP, Blkzp, HDG, Clear Zinc).
- **Dual Unit Billing (PCS & KGS)**: Live weight-to-quantity conversion engine with real-time tariff adjustments.
- **High-Density Technical Catalog**: Dual-pricing cards showing per-piece and per-kg rates, unit weights, and stock levels.
- **Certified Accreditations**: BIS Lab Tested, ISO 9001:2015, and EN 10204 3.1 NABL batch traceability.

### 2. Rapid RFQ & Bulk Ordering Matrix (`/bulk-order`)
- Fast Multi-Line SKU Intake Grid with live quantity steppers.
- Real-time **Wholesale Volume Tier Rebate Dock**:
  - **₹25,000+**: 5% Rebate
  - **₹50,000+**: 15% Wholesale Slab
  - **₹1,00,000+**: 25% Maximum OEM Discount
- Free Pan-India Freight calculation for orders above ₹25,000.
- Applicable GST (18% HSN 7318) breakdown.
- One-click **Direct WhatsApp RFQ (+91 98880 21000)** and Instant Quotation PDF generation.
- CSV / Excel Bill-of-Materials (BOM) batch upload simulator.

### 3. CBH Factory Clearance & Surplus Inventory (`/surplus`)
- Direct factory liquidation lots and surplus structural fasteners at up to **60% below standard tariffs**.
- 3 Quality Pillars: NABL Lab Verification, Direct Factory Dispatch (24-48 hr turnaround), Zero Middlemen.
- Active clearance deals (e.g. ASTM A193 B7 continuous threaded rods).

### 4. Customer Enterprise Portal (`/customer`)
- Enterprise Profile with 15-digit Indian GSTIN verification.
- **Tier Perks Status Widget**: DIAMOND OEM (18% Active Slab Discount).
- 5-Stage Live Order Freight Tracking Timeline:
  `Order Placed` ➔ `Lab Calibration` ➔ `Dispatched` ➔ `In Transit` ➔ `Delivered`.
- Carrier logistics info (TCI Freight, Blue Dart Express) with docket tracking numbers.
- Downloadable **NABL EN 10204 3.1 Mill Test Certificates**.
- Past RFQ & proforma invoice history.

### 5. Central Admin Operations Console (`/admin`)
- Operations KPI Dashboard: Gross Merchandise Value (MTD), Freight Tonnage Shipped, Pending RFQs, Registered OEM Accounts.
- **Live Inventory Manager**: Real-time CRUD for fastener SKUs, dual pricing (PCS & KGS), stock adjustments, and surplus lot flags.
- **RFQ Quotation Desk**: Review incoming client RFQs, analyze net profit margins, approve or submit counter-offers.
- **Live Volume Slab Editor**: Interactive sliders for Grade 4.6, 5.8, 8.8, 10.9, and 12.9 wholesale thresholds.
- **Audit & Event Stream**: Live operational event log for dispatch releases, price overrides, and BIS compliance checks.

### 6. Full Authentication Suite
- **Sign In** (`/login`): Role switcher (Contractor vs Operations Admin), quick-fill demo presets, 30-day session authorization.
- **Register** (`/register`): Enterprise onboarding with Indian GSTIN validation, company representative, and procurement volume tier selection.
- **Password Recovery** (`/forgot-password`): 6-digit OTP and reset token dispatch.
- **Resend Verification** (`/resend-verification`): Live 60-second cooldown timer.

---

## 🗄️ Database Architecture (`db/schema.sql` - MySQL Schema)

- `users`: Enterprise buyers, admins, and metallurgists with tier status and credit lines.
- `products`: Parametric fastener catalog with dual pricing, standards, grades, finishes, thread types, and unit weights.
- `categories`: DIN, ISO, ASTM, and BIS standard classifications.
- `bulk_rfqs` & `rfq_items`: Commercial quotations and line item volume calculations.
- `orders` & `order_items`: Logistics tracking, freight carriers, and NABL test certificate links.
- `surplus_lots`: Industrial surplus inventory liquidation lots.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.x or v20.x+)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/amandeepkumarflymediatech-star/CBH.git
cd CBH

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) or [http://localhost:3001](http://localhost:3001) in your browser.

### Production Build
```bash
npm run build
npm run start
```

---

## 📜 License
Copyright © 2026 CBH Store – A Venture of CBH Tech Pvt. Ltd., India. All rights reserved.
