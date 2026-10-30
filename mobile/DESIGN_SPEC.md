# CBH Fasteners Mobile App: Purpose, Screens, User Flow & Stitch Design System

---

## 1. Executive Summary & Purpose of the App

### 1.1 What is CBH Fasteners Mobile?
The **CBH Fasteners Mobile App** is an industrial-grade enterprise B2B procurement, pricing, and supply-chain application built for **Chaudhry Bro's & Hassan Fasteners India**. It transforms traditional, manual industrial fastener purchasing (which historically relied on phone calls, WhatsApp messages, paper RFQs, and slow email quotes) into an automated, transparent, high-efficiency digital platform.

### 1.2 Who is it for? (Target Personas)
1. **B2B Industrial Buyers & Contractors (Customer Persona):**
   - EPC (Engineering, Procurement, Construction) contractors.
   - OEM manufacturing plant managers (Automotive, Heavy Machinery, Solar, Railways, Pre-Engineered Buildings).
   - Maintenance, Repair & Operations (MRO) procurement officers.
   - Hardware distributors and stockists requiring bulk tonnage supplies with verified DIN/ISO certifications.

2. **Plant Managers & Operations Desks (Admin Persona):**
   - CBH Sales Engineers & Quoting Desk reviewing RFQs and setting commercial margin markups.
   - Warehouse & Dispatch Officers tracking physical consignments, Blue Dart/TCI freight tracking, and invoice matching.
   - ERPNext Administrators overseeing bidirectional inventory synchronization between physical plant stock and digital catalog.

### 1.3 Key Value Propositions & Problem Solved
- **Instant Dual-Unit Pricing:** Eliminates confusion between **Per Piece (₹/Pc)** and **Per Kilogram (₹/Kg)** for bulk industrial fasteners.
- **Automated Slab Discounts:** Real-time volume discounting (5% for >500 kg, 12% for >2 tons, 22% for container loads) eliminating manual back-and-forth negotiations.
- **NABL MTC Certificate Traceability:** Direct 1-tap download of **EN 10204 Type 3.1 Mill Test Certificates (MTC)** with chemical composition (C, Si, Mn, Cr, Ni) and mechanical tensile ratings (Class 8.8, 10.9, 12.9, SS 304/316) required for engineering compliance.
- **ERPNext Integration:** Continuous live synchronization with factory warehouse bins, stock reservations, and GST-compliant tax invoicing.

---

## 2. Complete Screen Inventory & Information Architecture

- **SCR-01: WelcomeScreen** — Industrial brand gateway with quick role launch buttons (Customer vs Admin).
- **SCR-02: AuthScreen** — Dual-mode login, B2B company registration with GSTIN, forgot password, and 6-digit OTP verification.
- **SCR-03: CustomerHomeScreen** — Procurement dashboard, active consignment tracking banner, standard category shortcuts, bulk RFQ calculator.
- **SCR-04: CustomerCatalogScreen** — Parametric faceted search (DIN 933, DIN 912, Grade 8.8, 10.9, 12.9, SS 304/316).
- **SCR-05: CustomerProductDetailScreen** — Detailed engineering specs, dimensional diagram, weight per pc, dual ₹/pc and ₹/kg pricing, slab discount matrix.
- **SCR-06: CustomerCartScreen** — Multi-item cart with live tonnage calculator, slab discount breakdown, and GST tax computation.
- **SCR-07: CustomerOrdersScreen** — Live milestone consignment tracking (PO Placed -> Reserved -> QC Pass -> Dispatched -> Delivered).
- **SCR-08: CustomerRfqsScreen** — Non-standard custom quotation requests with drawing attachment support.
- **SCR-09: CustomerCertificatesScreen** — Searchable repository of EN 10204 3.1 Mill Test Certificates (MTC).
- **SCR-10: CustomerProfileScreen** — Company GSTIN ledger, approved credit line (e.g. ₹25 Lakhs Net-30), dispatch addresses.
- **SCR-11: AdminDashboardScreen** — Operations telemetry console: daily dispatch tonnage, pending approvals, ERPNext sync status.
- **SCR-12: AdminOrdersScreen** — Dispatch pipeline, transport LR/AWB allocation, and gate pass management.
- **SCR-13: AdminProductsScreen** — Catalog pricing control, raw material indexation, and safety stock levels.
- **SCR-14: AdminRfqsScreen** — Commercial quote review desk: raw steel cost calculation, margin setting, and quotation issuance.
- **SCR-15: AdminUsersScreen** — B2B client KYC, GSTIN verification, credit limits, and payment term approvals.
- **SCR-16: AdminErpSyncScreen** — Real-time bidirectional synchronization terminal with ERPNext DocTypes.
- **SCR-17: AdminPaymentsScreen** — Settlement ledger, NEFT/RTGS wire confirmation, and invoice aging buckets.
- **SCR-18: AdminProfileScreen** — Plant security, operator node clearance, and audit trails.

---

## 3. Stitch-Ready Design System Tokens

```yaml
---
name: CBH Industrial Precision Mobile Design System
colors:
  primary: '#0052CC'            # CBH High-Tensile Blue (Precision & Authority)
  on-primary: '#FFFFFF'
  primary-container: '#0B1A30'  # Deep Navy Container
  on-primary-container: '#93C5FD'
  
  secondary: '#0F172A'          # Machinery Obsidian / Structural Charcoal
  on-secondary: '#FFFFFF'
  secondary-container: '#1E293B'
  on-secondary-container: '#E2E8F0'

  background: '#F8FAFC'         # Anti-fatigue clean canvas
  on-background: '#0F172A'
  surface: '#FFFFFF'            # Clean card & table workplane
  on-surface: '#0F172A'
  surface-variant: '#F1F5F9'
  on-surface-variant: '#475569'
  
  outline: '#CBD5E1'            # 1px machined borders
  outline-variant: '#E2E8F0'

  tertiary: '#059669'           # NABL Certified Emerald
  on-tertiary: '#FFFFFF'
  tertiary-container: '#ECFDF5'
  on-tertiary-container: '#065F46'
  
  status-discount: '#D97706'    # Slab Tier Volume Discount Amber
  status-discount-bg: '#FFFBEB'

typography:
  display:
    fontFamily: 'Barlow Condensed'
    fontSize: '34px'
    fontWeight: '700'
    lineHeight: '40px'
  headline-lg:
    fontFamily: 'Barlow Condensed'
    fontSize: '24px'
    fontWeight: '700'
    lineHeight: '30px'
  headline-md:
    fontFamily: 'Barlow Condensed'
    fontSize: '20px'
    fontWeight: '600'
    lineHeight: '26px'
  body-lg:
    fontFamily: 'Inter'
    fontSize: '16px'
    fontWeight: '500'
    lineHeight: '24px'
  body-md:
    fontFamily: 'Inter'
    fontSize: '14px'
    fontWeight: '400'
    lineHeight: '20px'
  code-tabular:
    fontFamily: 'JetBrains Mono'
    fontSize: '13px'
    fontWeight: '600'
    lineHeight: '18px'
  code-sm:
    fontFamily: 'JetBrains Mono'
    fontSize: '11px'
    fontWeight: '500'
    lineHeight: '14px'

rounded:
  sm: '4px'                     # Buttons & inputs (machined aesthetic)
  DEFAULT: '6px'
  md: '8px'                     # Product cards
  lg: '12px'                    # Hero banners
  full: '9999px'                # Standard pills (DIN 933)
---
```

