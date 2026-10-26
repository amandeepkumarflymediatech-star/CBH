'use client';

import React, { useState, useEffect } from 'react';
import MainHeader from '@/components/header/MainHeader';
import HeroSection from '@/components/home/HeroSection';
import FastenerFinder, { FastenerFilters } from '@/components/home/FastenerFinder';
import RapidRFQWidget from '@/components/home/RapidRFQWidget';
import CatalogMatrix from '@/components/home/CatalogMatrix';
import SurplusSection from '@/components/home/SurplusSection';
import ApplicationsSection from '@/components/home/ApplicationsSection';
import Testimonials from '@/components/home/Testimonials';
import ConsultationBar from '@/components/home/ConsultationBar';
import CartDrawer from '@/components/cart/CartDrawer';
import { GlobalUnit, Product, RfqLineItem } from '@/lib/types';
import { INITIAL_PRODUCTS } from '@/lib/mock-data';

export default function HomePage() {
  const [globalUnit, setGlobalUnit] = useState<GlobalUnit>('PCS');
  const [allProducts, setAllProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Fetch live products dynamically from API & ERPNext database
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          setAllProducts(data.data);
          setProducts(data.data);
        }
      })
      .catch((err) => console.log('Could not fetch dynamic products:', err))
      .finally(() => setIsLoadingProducts(false));
  }, []);

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
  const handleFilterChange = (filters: FastenerFilters) => {
    let filtered = [...allProducts];

    // Tab-level filtering
    if (filters.tab && filters.tab !== 'all') {
      if (filters.tab === 'surplus') {
        filtered = filtered.filter((p) => p.isSurplus);
      } else if (filters.tab === 'hex-screws') {
        filtered = filtered.filter((p) => p.standard === 'DIN 933' || p.category === 'Hex Screws');
      } else if (filters.tab === 'hex-bolts') {
        filtered = filtered.filter((p) => p.standard === 'DIN 931' || p.name.toLowerCase().includes('bolt'));
      } else if (filters.tab === 'socket-cap') {
        filtered = filtered.filter((p) => p.standard === 'DIN 912' || p.name.toLowerCase().includes('socket'));
      } else if (filters.tab === 'nuts') {
        filtered = filtered.filter((p) => p.standard === 'DIN 934' || p.name.toLowerCase().includes('nut'));
      } else if (filters.tab === 'anchors') {
        filtered = filtered.filter((p) => p.category === 'Anchors' || p.standard.includes('ETA') || p.name.toLowerCase().includes('anchor'));
      } else if (filters.tab === 'threaded-rods') {
        filtered = filtered.filter((p) => p.standard.includes('A193') || p.name.toLowerCase().includes('rod'));
      }
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      const catClean = filters.category.toLowerCase().replace(/[^a-z0-9]/g, '');
      filtered = filtered.filter((p) => (p.category || '').toLowerCase().replace(/[^a-z0-9]/g, '').includes(catClean));
    }

    // Standard filter
    if (filters.standard && filters.standard !== 'all') {
      const stdClean = filters.standard.toLowerCase().replace(/[^a-z0-9]/g, '');
      filtered = filtered.filter((p) => (p.standard || '').toLowerCase().replace(/[^a-z0-9]/g, '').includes(stdClean));
    }

    // Grade filter
    if (filters.grade && filters.grade !== 'all') {
      const gradeQuery = filters.grade.toLowerCase();
      filtered = filtered.filter((p) => (p.grade || '').toLowerCase().includes(gradeQuery));
    }

    // Diameter filter
    if (filters.diameter && filters.diameter !== 'all') {
      filtered = filtered.filter((p) => (p.diameter || '').toLowerCase() === filters.diameter.toLowerCase());
    }

    // Length filter
    if (filters.length && filters.length !== 'all') {
      filtered = filtered.filter((p) => p.lengthMm === parseInt(filters.length));
    }

    // Finish filter
    if (filters.finish && filters.finish !== 'all') {
      filtered = filtered.filter((p) => (p.finish || '').toLowerCase().includes(filters.finish.toLowerCase()));
    }

    // In Stock Only filter
    if (filters.inStockOnly) {
      filtered = filtered.filter((p) => p.isInStock && p.stockPcs > 0);
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

      {/* SECTION 1: High-Impact Technical Hero Section */}
      <HeroSection />

      {/* Fastener Finder Matrix (Hilti / Fischer Style Precision Engine) */}
      <FastenerFinder
        onFilterChange={handleFilterChange}
        productsCount={products.length}
        totalProductsCount={INITIAL_PRODUCTS.length}
      />

      {/* SECTION 2: Bulk Order & Rapid RFQ Interactive Widget */}
      <RapidRFQWidget />

      {/* SECTION 3: High-Density Technical Catalog Matrix */}
      <CatalogMatrix
        products={products}
        onAddToCart={handleAddToCart}
      />

      {/* SECTION 4: Surplus Stock Marketplace Banner */}
      <SurplusSection />

      {/* APPLICATIONS: Fastening the industries that move us */}
      <ApplicationsSection />

      {/* SECTION 5: Client Reviews & Technical Consultation */}
      <section className="trust-section">
        <div className="container">
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
