# CBH Fasteners - Mobile Application Architecture

This directory (`/mobile`) contains the complete mobile application codebase for CBH Fasteners, featuring dedicated **Admin** and **Customer** panels, dynamic state management, responsive touch-first layouts, and integration with all website backend APIs.

---

## 📁 Directory Structure

```
mobile/
├── config/                         # API client & configurations for all website endpoints
│   ├── api.ts                      # Unified isomorphic API client with typed methods & offline fallback
│   ├── endpoints.ts                # Exhaustive list of all website API routes
│   ├── auth.ts                     # Mobile session storage & demo user presets
│   ├── theme.ts                    # Mobile theme tokens (colors, typography, shadows, elevation)
│   └── index.ts                    # Config exports
│
├── types/                          # TypeScript definitions
│   └── index.ts                    # Models for Auth, Products, Orders, RFQs, Users, Certificates, etc.
│
├── components/                     # Touch-first responsive mobile components
│   ├── MobileHeader.tsx            # Sticky mobile app bar with back navigation, badges, and roles
│   ├── MobileBottomNav.tsx         # Bottom navigation bar with active indicators and dynamic badges
│   ├── MobileCard.tsx              # Adaptive container with elevation & touch feedback
│   ├── MobileBadge.tsx             # Status indicators (Processing, Dispatched, In-Transit, etc.)
│   ├── MobileSearch.tsx            # Search bar with filter toggle & voice/scan triggers
│   ├── MobileModal.tsx             # Native-style animated bottom-sheet modal
│   └── index.ts
│
├── screens/                        # Screen Views
│   ├── admin/                      # Operations & Plant Administrator Screens
│   │   ├── AdminDashboardScreen.tsx   # Live telemetry, KPI cards, ERP latency, quick actions
│   │   ├── AdminOrdersScreen.tsx      # Dispatch pipeline, carrier filter, status updater modal
│   │   ├── AdminProductsScreen.tsx    # Fastener inventory, dual pricing (PCS/KG), stock adjuster
│   │   ├── AdminRfqsScreen.tsx        # Quote approvals, margin calculator, 1-tap ERP SO push
│   │   ├── AdminUsersScreen.tsx       # B2B client ledger, corporate credit limits, KYC status
│   │   ├── AdminErpSyncScreen.tsx     # ERPNext live connection telemetry & bidirectional sync
│   │   ├── AdminPaymentsScreen.tsx    # PhonePe PG transactions & NEFT/RTGS settlement ledger
│   │   ├── AdminProfileScreen.tsx     # Operator credentials, node specs & session controls
│   │   ├── AdminLoginScreen.tsx       # Administrator clearance login with 1-tap demo
│   │   └── index.ts
│   │
│   └── customer/                   # Procurement Buyer & Client Screens
│       ├── CustomerHomeScreen.tsx          # Storefront home, categories carousel, active shipment ticker
│       ├── CustomerCatalogScreen.tsx       # Fastener catalog browser (DIN 933, DIN 912, grades, finishes)
│       ├── CustomerProductDetailScreen.tsx # Technical specs, PCS vs KGS selector, live MOQ calculator
│       ├── CustomerCartScreen.tsx          # Dynamic slab volume discounts, GST breakdown, PhonePe checkout
│       ├── CustomerOrdersScreen.tsx        # Consignment tracking, carrier info, NABL MTC download
│       ├── CustomerRfqsScreen.tsx          # Inquiries history, approved quotations, PO issuance
│       ├── CustomerCertificatesScreen.tsx  # NABL MTC 3.1 & 3.2 inspection reports with heat chemistry
│       ├── CustomerProfileScreen.tsx       # Company GSTIN, Diamond tier badge, available credit line
│       ├── CustomerAuthScreen.tsx          # B2B login & registration with 1-tap demo autofill
│       └── index.ts
│
├── screen/                         # Singular alias re-exporting from /screens
│   ├── admin/index.ts              # Re-exports ../../screens/admin
│   ├── customer/index.ts           # Re-exports ../../screens/customer
│   └── index.ts                    # Re-exports ../screens
│
├── App.tsx                         # Master Mobile App shell with role switcher & device frame simulator
└── index.ts                        # Root exports
```

---

## ⚡ Key Highlights & Features

1. **All Website APIs Connected (`/mobile/config/api.ts`)**:
   - Authentication (`/api/auth/*`)
   - Inventory & Products (`/api/products`, `/api/products/bulk-upload`)
   - Structured Catalog Taxonomies (`/api/catalog/*`)
   - Dispatch Orders (`/api/orders`)
   - Bulk RFQs (`/api/rfq`)
   - B2B Accounts & Credit Lines (`/api/users`)
   - Factory Surplus Lots (`/api/surplus`)
   - ERPNext Handshake (`/api/erpnext/*`)
   - PhonePe Payments (`/api/payment/phonepe/*`)
   - Media & Uploads (`/api/upload`)

2. **Dual-Role Live Switcher (`mobile/App.tsx`)**:
   - Switch instantaneously between **Admin Panel** and **Customer Panel** using the top toolbar.
   - Toggle between **Smartphone Device Frame** mode (iPhone 16 / Pixel simulated viewport) and **Full Screen** mode.

3. **100% Responsive & Dynamic**:
   - Dual-unit fastener pricing (Pcs and Kgs).
   - Real-time slab discount calculation based on procurement tonnage.
   - Live status editing and AWB consignment tracking updates.
   - Offline & development fallback data so interfaces always render cleanly.

---

## 🚀 Live Preview in Web Browser

Navigate to:
```
http://localhost:3000/mobile
```
This renders `src/app/mobile/page.tsx`, loading the mobile app shell with live APIs and interactive touch controls.

