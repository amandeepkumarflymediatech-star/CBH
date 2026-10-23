'use client';

import React, { useState } from 'react';
import MainHeader from '@/components/header/MainHeader';
import NavSubBar from '@/components/header/NavSubBar';
import HeroSection from '@/components/home/HeroSection';
import FastenerFinder from '@/components/home/FastenerFinder';
import RapidRFQWidget from '@/components/home/RapidRFQWidget';
import CatalogMatrix from '@/components/home/CatalogMatrix';
import SurplusSection from '@/components/home/SurplusSection';
import TrustCertificates from '@/components/home/TrustCertificates';
import Testimonials from '@/components/home/Testimonials';
import ConsultationBar from '@/components/home/ConsultationBar';
import CartDrawer from '@/components/cart/CartDrawer';
import { GlobalUnit, Product, RfqLineItem } from '@/lib/types';
import { INITIAL_PRODUCTS } from '@/lib/mock-data';

export default function HomePage() {
  const [globalUnit, setGlobalUnit] = useState<GlobalUnit>('PCS');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cartItems, setCartItems] = useState<RfqLineItem[]>([
    {
      id: 1,
      productId: 1,
      sku: 'CBH-933-M10-100-BP',
      name: 'Hex Screws Full Thread M10x1.5x100mm Grade 5.8 BP',
      standard: 'DIN 933',
      unit: 'PCS',
      unitRate: 5.39,
      quantity: 500,
      weightPerPcKg: 0.0601,
      totalWeightKg: 500 * 0.0601,
      rowTotal: 500 * 5.39,
    },
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Filter Handler
  const handleFilterChange = (filters: any) => {
    let filtered = [...INITIAL_PRODUCTS];
    if (filters.grade && filters.grade !== 'all') {
      filtered = filtered.filter((p) => p.grade.toLowerCase().includes(filters.grade));
    }
    if (filters.length && filters.length !== 'all') {
      filtered = filtered.filter((p) => p.lengthMm === parseInt(filters.length));
    }
    if (filters.finish && filters.finish !== 'all') {
      filtered = filtered.filter((p) => p.finish.toLowerCase().includes(filters.finish));
    }
    setProducts(filtered);
  };

  // Add To Cart
  const handleAddToCart = (product: Product, qty: number, unit: GlobalUnit) => {
    const rate = unit === 'PCS' ? product.pricePerPiece : product.pricePerKg;
    const weight = unit === 'PCS' ? qty * product.weightPerPcKg : qty;

    const existingIndex = cartItems.findIndex((item) => item.sku === product.sku && item.unit === unit);
    if (existingIndex > -1) {
      setCartItems((prev) => {
        const updated = [...prev];
        const nextQty = updated[existingIndex].quantity + qty;
        updated[existingIndex].quantity = nextQty;
        updated[existingIndex].totalWeightKg = unit === 'PCS' ? nextQty * product.weightPerPcKg : nextQty;
        updated[existingIndex].rowTotal = nextQty * rate;
        return updated;
      });
    } else {
      const newItem: RfqLineItem = {
        id: Date.now(),
        productId: product.id,
        sku: product.sku,
        name: product.name,
        standard: product.standard,
        unit: unit,
        unitRate: rate,
        quantity: qty,
        weightPerPcKg: product.weightPerPcKg,
        totalWeightKg: weight,
        rowTotal: qty * rate,
      };
      setCartItems((prev) => [...prev, newItem]);
    }

    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (id: string | number, qty: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const totalWeight = item.unit === 'PCS' ? qty * item.weightPerPcKg : qty;
          return {
            ...item,
            quantity: qty,
            totalWeightKg: totalWeight,
            rowTotal: qty * item.unitRate,
          };
        }
        return item;
      })
    );
  };

  const handleRemoveCartItem = (id: string | number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <main>
      {/* Main Header & Sub Navigation */}
      <MainHeader
        unit={globalUnit}
        onUnitToggle={(u) => setGlobalUnit(u)}
        cartCount={cartItems.length}
        onOpenCart={() => setIsCartOpen(true)}
      />
      <NavSubBar />

      {/* SECTION 1: High-Impact Technical Hero Section */}
      <HeroSection />

      {/* Fastener Finder Matrix (Hilti / Fischer Style Precision Engine) */}
      <FastenerFinder onFilterChange={handleFilterChange} />

      {/* SECTION 2: Bulk Order & Rapid RFQ Interactive Widget */}
      <RapidRFQWidget />

      {/* SECTION 3: High-Density Technical Catalog Matrix */}
      <CatalogMatrix
        products={products}
        onAddToCart={handleAddToCart}
      />

      {/* SECTION 4: Surplus Stock Marketplace Banner */}
      <SurplusSection />

      {/* SECTION 5: Trust, Compliance & Client Testimonials Section */}
      <section className="trust-section">
        <div className="container">
          <TrustCertificates />
          <Testimonials />
          <ConsultationBar />
        </div>
      </section>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
      />
    </main>
  );
}
