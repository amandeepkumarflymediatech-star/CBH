'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  Search,
  Tag,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  FileText
} from 'lucide-react';
import MainHeader from '@/components/header/MainHeader';
import CartDrawer from '@/components/cart/CartDrawer';
import { RfqLineItem } from '@/lib/types';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  image: string;
  featured?: boolean;
}

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<RfqLineItem[]>([]);

  const posts: BlogPost[] = [
    {
      id: 'din-vs-iso-vs-astm',
      title: 'Fastener Standards Explained: Complete Guide to DIN, ISO, and ASTM Equivalencies',
      excerpt: 'Navigate standard harmonization differences between DIN 933, ISO 4017, and ASTM A193. Learn key dimensional tolerances, thread pitch variations, and material marking regulations.',
      category: 'Standards & Compliance',
      readTime: '6 min read',
      date: 'Oct 20, 2024',
      author: 'Technical Engineering Team',
      image: '/assets/exhibitions/exhibition_stand_branded.jpg',
      featured: true
    },
    {
      id: 'ss304-vs-ss316-corrosion',
      title: 'SS 304 vs SS 316 Fasteners: Corrosion Resistance in Marine & Chemical Infrastructure',
      excerpt: 'Why 2-3% molybdenum content in Grade A4 (SS 316) prevents pitting corrosion under severe chloride exposure and seawater mist environments.',
      category: 'Material Metallurgy',
      readTime: '5 min read',
      date: 'Oct 14, 2024',
      author: 'Er. R. K. Singla',
      image: '/assets/exhibitions/exhibition_conversation.jpg'
    },
    {
      id: 'high-tensile-grade-8-8-10-9-12-9',
      title: 'High-Tensile Fasteners: When to Specify Grade 8.8, 10.9, or 12.9 in Structural Assemblies',
      excerpt: 'Understanding proof load, yield strength, and hydrogen embrittlement risks in electroplated high-tensile fasteners subjected to heavy cyclic loads.',
      category: 'Engineering & Design',
      readTime: '8 min read',
      date: 'Oct 02, 2024',
      author: 'Quality Testing Lab',
      image: '/assets/exhibitions/exhibition_stand_photo.jpg'
    },
    {
      id: 'bis-mandatory-qco-fasteners',
      title: 'Mandatory BIS Quality Control Orders (QCO) for Fasteners in India: What OEMs Must Verify',
      excerpt: 'A comprehensive review of the Ministry of Commerce & Industry Quality Control Order for hex bolts, screws, and structural fasteners imported or distributed in India.',
      category: 'Standards & Compliance',
      readTime: '4 min read',
      date: 'Sep 24, 2024',
      author: 'Compliance Cell',
      image: '/assets/certificates/cert_ce.webp'
    },
    {
      id: 'pcs-to-kgs-dual-unit-procurement',
      title: 'Dual-Unit Procurement Guide: How to Accurately Convert PCS to KGS for Bulk Tenders',
      excerpt: 'Eliminate freight discrepancies and billing friction with CBH’s mathematical weight lookup algorithms for standard metric fasteners.',
      category: 'Procurement Insights',
      readTime: '4 min read',
      date: 'Sep 15, 2024',
      author: 'Supply Chain Operations',
      image: '/assets/exhibitions/exhibition_stand_branded.jpg'
    },
    {
      id: 'cold-forging-vs-machined-bolts',
      title: 'Cold Forging vs Machined Fasteners: Grain Flow Analysis & Tensile Fatigue Life',
      excerpt: 'Why cold-headed fasteners exhibit superior shear and tensile fatigue performance compared to lathe-machined counterparts due to continuous metallurgical grain orientation.',
      category: 'Material Metallurgy',
      readTime: '7 min read',
      date: 'Sep 05, 2024',
      author: 'Technical Engineering Team',
      image: '/assets/exhibitions/exhibition_stand_photo.jpg'
    }
  ];

  const categories = ['All', 'Standards & Compliance', 'Material Metallurgy', 'Engineering & Design', 'Procurement Insights'];

  const filteredPosts = posts.filter(post => {
    const matchesCat = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const featuredPost = posts.find(p => p.featured) || posts[0];

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh' }}>
      <MainHeader onOpenCart={() => setIsCartOpen(true)} cartCount={cartItems.length} />

      {/* Hero Banner */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0A2E4E 0%, #0052CC 100%)',
          padding: '60px 0 50px',
          color: '#FFFFFF',
          borderBottom: '4px solid #FF6B00'
        }}
      >
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#93C5FD', marginBottom: '18px' }}>
            <Link href="/" style={{ color: '#93C5FD', textDecoration: 'none' }}>Home</Link>
            <span>/</span>
            <span style={{ color: '#FFFFFF', fontWeight: 600 }}>Engineering Blog &amp; Insights</span>
          </div>

          <div style={{ maxWidth: '800px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(255, 255, 255, 0.12)', borderRadius: '20px', fontSize: '12px', fontWeight: 700, color: '#FED7AA', marginBottom: '16px', backdropFilter: 'blur(6px)' }}>
              <BookOpen size={15} color="#FF6B00" />
              <span>CBH FASTENER TECHNICAL KNOWLEDGE BASE</span>
            </div>
            <h1 style={{ fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 800, lineHeight: 1.15, marginBottom: '16px', letterSpacing: '-0.02em' }}>
              Fastener Engineering, Standards &amp; Metallurgy Insights
            </h1>
            <p style={{ fontSize: '16px', lineHeight: 1.6, color: '#DBEAFE', maxWidth: '680px' }}>
              Authoritative technical guides, DIN/ISO specification breakdowns, corrosion science, and procurement strategies written by industrial fastener specialists.
            </p>
          </div>
        </div>
      </section>

      {/* Search & Category Filter Bar */}
      <section style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '20px 0', position: 'sticky', top: '70px', zIndex: 10 }}>
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            {/* Category Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    background: selectedCategory === cat ? '#0052CC' : '#FFFFFF',
                    color: selectedCategory === cat ? '#FFFFFF' : '#475569',
                    border: selectedCategory === cat ? '1px solid #0052CC' : '1px solid #CBD5E1',
                    boxShadow: selectedCategory === cat ? '0 2px 8px rgba(0, 82, 204, 0.25)' : 'none'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '6px 12px', minWidth: '260px' }}>
              <Search size={16} color="#64748B" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles, DIN, grades..."
                style={{ border: 'none', outline: 'none', marginLeft: '8px', fontSize: '13px', width: '100%', color: '#0F172A' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Blog Listing Grid */}
      <section style={{ padding: '60px 0 80px', background: '#FFFFFF' }}>
        <div className="container">
          {/* Featured Article */}
          {selectedCategory === 'All' && searchQuery === '' && featuredPost && (
            <div
              style={{
                marginBottom: '50px',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
                background: '#FFFFFF',
                boxShadow: '0 8px 30px rgba(15, 23, 42, 0.08)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                alignItems: 'stretch'
              }}
            >
              <div style={{ position: 'relative', minHeight: '320px', background: '#0F172A' }}>
                <Image
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  fill
                  style={{ objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: '16px', left: '16px', background: '#FF6B00', color: '#FFFFFF', padding: '4px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.05em' }}>
                  FEATURED GUIDE
                </div>
              </div>

              <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#64748B', marginBottom: '14px' }}>
                  <span style={{ color: '#0052CC', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{featuredPost.category}</span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} />
                    {featuredPost.date}
                  </span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} />
                    {featuredPost.readTime}
                  </span>
                </div>

                <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', lineHeight: 1.3, marginBottom: '16px' }}>
                  {featuredPost.title}
                </h2>

                <p style={{ color: '#64748B', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>
                  {featuredPost.excerpt}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    By {featuredPost.author}
                  </span>
                  <button
                    type="button"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#0052CC',
                      fontWeight: 700,
                      fontSize: '14px',
                      padding: 0
                    }}
                  >
                    <span>Read Article</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Standard Article Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                style={{
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden',
                  background: '#FFFFFF',
                  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
              >
                <div style={{ position: 'relative', height: '200px', background: '#0F172A' }}>
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(15, 23, 42, 0.85)', color: '#FFFFFF', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, backdropFilter: 'blur(4px)' }}>
                    {post.category}
                  </div>
                </div>

                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#64748B', marginBottom: '10px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} />
                      {post.date}
                    </span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} />
                      {post.readTime}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', lineHeight: 1.35, marginBottom: '12px' }}>
                    {post.title}
                  </h3>

                  <p style={{ color: '#64748B', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px', flex: 1 }}>
                    {post.excerpt}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '16px', marginTop: 'auto' }}>
                    <span style={{ fontSize: '12px', color: '#64748B' }}>{post.author}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#0052CC', fontWeight: 700, fontSize: '13px' }}>
                      Read More <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <FileText size={48} color="#94A3B8" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A' }}>No technical articles found</h3>
              <p style={{ color: '#64748B', marginTop: '8px' }}>Try searching with different terms or selecting another category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQty={() => {}}
        onRemoveItem={() => {}}
      />
    </div>
  );
}
