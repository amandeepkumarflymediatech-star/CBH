-- ============================================================================
-- CBH FASTENERS - INDUSTRIAL B2B & B2C E-COMMERCE MYSQL DATABASE SCHEMA
-- MySQL 8.x / MariaDB Relational Database Schema (InnoDB)
-- Fasteners, Dual Pricing (PCS & KGS), Bulk RFQ Engine, Customer & Admin Panels
-- ============================================================================

-- 1. User & Enterprise Customer Profile Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    company_name VARCHAR(200),
    gstin VARCHAR(15), -- 15-digit Indian GST Identification Number
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'metallurgist', 'dispatcher')),
    tier VARCHAR(20) DEFAULT 'BRONZE' CHECK (tier IN ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'VIP')),
    tier_discount_pct DECIMAL(5, 2) DEFAULT 0.00,
    credit_limit DECIMAL(12, 2) DEFAULT 0.00,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Fastener Categories
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    standard_prefix VARCHAR(50), -- DIN, ISO, ASTM, BIS
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Fastener Product Inventory with Dual Pricing & Technical Metallurgy
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    
    -- Technical Specifications
    standard VARCHAR(50) NOT NULL,       -- DIN 933, DIN 912, DIN 934, DIN 931, ISO 4017, ASTM A193
    grade VARCHAR(50) NOT NULL,          -- 4.6, 5.8, 8.8, 10.9, 12.9, SS304 (A2-70), SS316 (A4-80), B7
    finish VARCHAR(100) NOT NULL,        -- Black Phosphate (BP), Black Zinc (Blkzp), Hot Dip Galv (HDG), Clear Zinc
    thread_type VARCHAR(50) NOT NULL,    -- Full Thread, Half Thread, Fine Pitch, Continuous
    diameter VARCHAR(20) NOT NULL,       -- M6, M8, M10, M12, M16, M20, M24, M36
    length_mm INTEGER NOT NULL,          -- 12, 25, 50, 100, 110, 120, 125, 130, 140, 150, 3000
    pitch_mm DECIMAL(4, 2) NOT NULL,     -- 1.0, 1.25, 1.5, 1.75, 2.0, 3.0
    weight_per_pc_kg DECIMAL(8, 4) NOT NULL, -- Exact unit weight for PCS <-> KGS conversion
    
    -- Dual Unit Pricing (PCS & KGS)
    price_per_piece DECIMAL(10, 2) NOT NULL,
    original_price_per_piece DECIMAL(10, 2),
    price_per_kg DECIMAL(10, 2) NOT NULL,
    original_price_per_kg DECIMAL(10, 2),
    
    -- Inventory Levels
    stock_pcs INTEGER NOT NULL DEFAULT 0,
    stock_kg DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    min_order_pcs INTEGER DEFAULT 100,
    min_order_kg DECIMAL(8, 2) DEFAULT 5.00,
    
    -- Status & Surplus Flags
    is_in_stock BOOLEAN DEFAULT TRUE,
    is_surplus BOOLEAN DEFAULT FALSE,
    surplus_discount_pct INTEGER DEFAULT 0,
    
    -- Documentation
    image_url TEXT,
    cad_step_url TEXT,
    mtc_report_number VARCHAR(100),
    bis_cert_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Wholesale Volume Tier Rebate Settings
CREATE TABLE tier_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tier_name VARCHAR(50) NOT NULL,
    min_order_value DECIMAL(12, 2) NOT NULL,
    discount_pct DECIMAL(5, 2) NOT NULL,
    description TEXT
);

-- 5. Bulk RFQs (Request For Quotation) Engine
CREATE TABLE bulk_rfqs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rfq_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. RFQ-CBH-2025-9831
    customer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    contact_name VARCHAR(150) NOT NULL,
    company_name VARCHAR(200) NOT NULL,
    gstin VARCHAR(15),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    shipping_pincode VARCHAR(10),
    global_unit VARCHAR(10) DEFAULT 'PCS' CHECK (global_unit IN ('PCS', 'KGS')),
    
    -- Commercial Totals
    gross_amount DECIMAL(12, 2) NOT NULL,
    slab_discount_pct DECIMAL(5, 2) DEFAULT 0.00,
    slab_discount_amount DECIMAL(12, 2) DEFAULT 0.00,
    freight_amount DECIMAL(10, 2) DEFAULT 0.00,
    gst_rate_pct DECIMAL(5, 2) DEFAULT 18.00,
    gst_amount DECIMAL(12, 2) NOT NULL,
    net_total DECIMAL(12, 2) NOT NULL,
    total_weight_kg DECIMAL(10, 2) NOT NULL,
    
    -- Status & Workflow
    status VARCHAR(30) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_REVIEW', 'QUOTED', 'APPROVED', 'CONVERTED_TO_PO', 'DECLINED')),
    admin_notes TEXT,
    validity_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. RFQ Line Items
CREATE TABLE rfq_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rfq_id INTEGER NOT NULL REFERENCES bulk_rfqs(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    sku VARCHAR(100) NOT NULL,
    item_description VARCHAR(255) NOT NULL,
    standard VARCHAR(50) NOT NULL,
    unit VARCHAR(10) NOT NULL CHECK (unit IN ('PCS', 'KGS')),
    unit_rate DECIMAL(10, 2) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    total_weight_kg DECIMAL(10, 2) NOT NULL,
    row_total DECIMAL(12, 2) NOT NULL
);

-- 7. Purchase Orders & Logistics Tracking
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. CBH-ORD-2025-8842
    customer_id INTEGER REFERENCES users(id),
    rfq_id INTEGER REFERENCES bulk_rfqs(id),
    
    -- Commercial Summary
    gross_amount DECIMAL(12, 2) NOT NULL,
    discount_amount DECIMAL(12, 2) DEFAULT 0.00,
    gst_amount DECIMAL(12, 2) NOT NULL,
    net_amount DECIMAL(12, 2) NOT NULL,
    total_weight_kg DECIMAL(10, 2) NOT NULL,
    
    -- Logistics & Delivery
    shipping_address TEXT NOT NULL,
    delivery_pincode VARCHAR(10) NOT NULL,
    carrier_name VARCHAR(100), -- Blue Dart Express, TCI Freight, V-Trans
    tracking_number VARCHAR(100),
    dispatch_date TIMESTAMP,
    estimated_delivery TIMESTAMP,
    order_status VARCHAR(30) DEFAULT 'PROCESSING' CHECK (order_status IN ('CONFIRMED', 'PROCESSING', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED')),
    payment_status VARCHAR(30) DEFAULT 'PAID' CHECK (payment_status IN ('PAID', 'PENDING', '30_DAYS_CREDIT', 'PARTIAL')),
    
    -- NABL Traceability
    mtc_document_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Order Line Items
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    sku VARCHAR(100) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    standard VARCHAR(50) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(10) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    row_total DECIMAL(12, 2) NOT NULL
);

-- 9. Certified Surplus Fastener Lots (EPC Liquidation Marketplace)
CREATE TABLE surplus_lots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lot_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    spec_standard VARCHAR(100) NOT NULL, -- e.g. ASTM A193 B7 M24x3000mm
    total_weight_tonnes DECIMAL(8, 2) NOT NULL,
    market_price_per_kg DECIMAL(10, 2) NOT NULL,
    clearance_price_per_kg DECIMAL(10, 2) NOT NULL,
    discount_pct INTEGER NOT NULL,
    depot_location VARCHAR(150) NOT NULL, -- e.g. Hazira Logistics Yard, Gujarat
    status VARCHAR(30) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'RESERVED', 'SOLD')),
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for high-throughput parametric filtering
CREATE INDEX idx_products_standard ON products(standard);
CREATE INDEX idx_products_grade ON products(grade);
CREATE INDEX idx_products_diameter ON products(diameter);
CREATE INDEX idx_products_length ON products(length_mm);
CREATE INDEX idx_products_surplus ON products(is_surplus);
CREATE INDEX idx_rfqs_status ON bulk_rfqs(status);
CREATE INDEX idx_orders_customer ON orders(customer_id);
