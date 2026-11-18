'use client';

import React, { useState, useEffect, useCallback } from 'react';
import MainHeader from '@/components/header/MainHeader';
import HeroSection from '@/components/home/HeroSection';
import SimpleVisualCategories from '@/components/home/SimpleVisualCategories';
import SimpleHowItWorks from '@/components/home/SimpleHowItWorks';
import FastenerFinder, { FastenerFilters } from '@/components/home/FastenerFinder';
import RapidRFQWidget from '@/components/home/RapidRFQWidget';
import CatalogMatrix from '@/components/home/CatalogMatrix';
import SurplusSection from '@/components/home/SurplusSection';
import ApplicationsSection from '@/components/home/ApplicationsSection';
import Testimonials from '@/components/home/Testimonials';
import ConsultationBar from '@/components/home/ConsultationBar';
import CartDrawer from '@/components/cart/CartDrawer';
import { GlobalUnit, Product, RfqLineItem } from '@/lib/types';
import { getStoredCart, setStoredCart } from '@/lib/cart';
import { clampQty } from '@/lib/rfq-calculator';

export default function HomePage() {
  const [globalUnit, setGlobalUnit] = useState<GlobalUnit>('PCS');
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProductsCount, setTotalProductsCount] = useState<number>(0);
  const [matchingCount, setMatchingCount] = useState<number>(0);
  const [filterOptions, setFilterOptions] = useState<any>(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Initial fetch: 16 featured ready-to-dispatch products + filterOptions in ~30ms
  useEffect(() => {
    setIsLoadingProducts(true);
    fetch('/api/products/paginated?limit=16&sortBy=featured')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setProducts(data.data);
          const total = data.total ?? data.data.length;
          setTotalProductsCount(total);
          setMatchingCount(total);
        }
        if (data.filterOptions) {
          setFilterOptions(data.filterOptions);
        }
      })
      .catch((err) => console.error('Failed to load initial catalog:', err))
      .finally(() => setIsLoadingProducts(false));
  }, []);

  const [cartItems, setCartItems] = useState<RfqLineItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync cart items with localStorage and listen for updates
  useEffect(() => {
    const saved = getStoredCart();
    setCartItems(saved || []);
    const handleCartChange = (e: any) => {
      if (e.detail?.items) {
        setCartItems(e.detail.items);
      }
    };
    window.addEventListener('cbh_cart_change', handleCartChange);
    return () => window.removeEventListener('cbh_cart_change', handleCartChange);
  }, []);

  // Real-time server-backed filter handler
  const handleFilterChange = useCallback(async (filters: FastenerFilters) => {
    setIsLoadingProducts(true);

    try {
      const params = new URLSearchParams({
        limit: '16',
        page: '1',
      });

      // Semantic category handling:
      let cat = '';
      if (filters.category && filters.category !== 'all') {
        cat = filters.category;
      } else if (filters.tab && filters.tab !== 'all') {
        cat = filters.tab;
      }
      if (cat) params.set('category', cat);

      if (filters.standard && filters.standard !== 'all') params.set('standard', filters.standard);
      if (filters.grade && filters.grade !== 'all') params.set('grade', filters.grade);
      if (filters.diameter && filters.diameter !== 'all') params.set('diameter', filters.diameter);
      if (filters.length && filters.length !== 'all') params.set('length', filters.length);
      if (filters.finish && filters.finish !== 'all') params.set('finish', filters.finish);
      if (filters.inStockOnly) params.set('inStockOnly', 'true');

      const res = await fetch(`/api/products/paginated?${params.toString()}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setProducts(data.data);
        setMatchingCount(data.total ?? data.data.length);
        if (data.filterOptions) {
          setFilterOptions(data.filterOptions);
        }
      }
    } catch (err) {
      console.error('Failed to filter products:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  // Add To Cart
  const handleAddToCart = (product: Product, qty: number, unit: GlobalUnit) => {
    const finalQty = clampQty(qty, unit);
    const rate = unit === 'PCS' ? product.pricePerPiece : product.pricePerKg;
    const weight = unit === 'PCS' ? finalQty * (product.weightPerPcKg || 0.05) : finalQty;

    const existingIndex = cartItems.findIndex((item) => item.sku === product.sku && item.unit === unit);
    if (existingIndex > -1) {
      setCartItems((prev) => {
        const updated = [...prev];
        const nextQty = updated[existingIndex].quantity + finalQty;
        updated[existingIndex].quantity = nextQty;
        updated[existingIndex].totalWeightKg = unit === 'PCS' ? nextQty * (product.weightPerPcKg || 0.05) : nextQty;
        updated[existingIndex].rowTotal = nextQty * rate;
        setStoredCart(updated);
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
        quantity: finalQty,
        weightPerPcKg: product.weightPerPcKg || 0.05,
        totalWeightKg: weight,
        rowTotal: finalQty * rate,
      };
      setCartItems((prev) => {
        const updated = [...prev, newItem];
        setStoredCart(updated);
        return updated;
      });
    }

    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (id: string | number, qty: number) => {
    setCartItems((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id) {
          const nextQty = clampQty(qty, item.unit);
          const totalWeight = item.unit === 'PCS' ? nextQty * (item.weightPerPcKg || 0.05) : nextQty;
          return {
            ...item,
            quantity: nextQty,
            totalWeightKg: totalWeight,
            rowTotal: nextQty * item.unitRate,
          };
        }
        return item;
      });
      setStoredCart(updated);
      return updated;
    });
  };

  const handleRemoveCartItem = (id: string | number) => {
    setCartItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      setStoredCart(updated);
      return updated;
    });
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

      {/* SECTION 2: What We Offer (Visual Friendly Categories for All Users) */}
      <SimpleVisualCategories />

      {/* SECTION 3: How to Order in 3 Simple Steps + WhatsApp Photo Help */}
      <SimpleHowItWorks />

      {/* Fastener Finder Matrix (Hilti / Fischer Style Precision Engine) */}
      <FastenerFinder
        onFilterChange={handleFilterChange}
        productsCount={matchingCount}
        totalProductsCount={totalProductsCount}
        filterOptions={filterOptions}
        isLoading={isLoadingProducts}
      />

      {/* SECTION 2: High-Density Technical Catalog Matrix (Popular Fasteners In Stock) */}
      <CatalogMatrix
        products={products}
        onAddToCart={handleAddToCart}
        isLoading={isLoadingProducts}
        totalMatchingCount={matchingCount}
      />

      {/* SECTION 3: Bulk Order & Rapid RFQ Interactive Widget */}
      <RapidRFQWidget />

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
