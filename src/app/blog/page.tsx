'use client';

import React, { useEffect, useState } from 'react';
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
  FileText,
  Eye,
  RefreshCw
} from 'lucide-react';
import MainHeader from '@/components/header/MainHeader';
import CartDrawer from '@/components/cart/CartDrawer';
import { BlogPost, RfqLineItem } from '@/lib/types';
import { INITIAL_BLOG_POSTS } from '@/lib/mock-data';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>(INITIAL_BLOG_POSTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<RfqLineItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLiveBlogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/blogs');
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setPosts(json.data);
      }
    } catch (err) {
      console.warn('Could not load live blogs from API, using fallback data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveBlogs();
  }, []);

  // Compute distinct categories
  const categories = ['All', ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean)))];

  const filteredPosts = posts.filter((post) => {
    const matchesCat = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.tags && post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCat && matchesSearch;
  });

  const featuredPost = posts.find((p) => p.featured) || posts[0];

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
            <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, lineHeight: 1.18, marginBottom: '16px', letterSpacing: '-0.02em' }}>
              Fastener Engineering, Standards &amp; Metallurgy Insights
            </h1>
            <p style={{ fontSize: '16px', lineHeight: 1.6, color: '#DBEAFE', maxWidth: '680px' }}>
              Authoritative technical guides, DIN/ISO specification breakdowns, corrosion science, and procurement strategies written by industrial fastener specialists.
            </p>
          </div>
        </div>
      </section>

      {/* Search & Category Filter Bar */}
      <section style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '16px 0', position: 'sticky', top: '70px', zIndex: 10 }}>
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
      <section style={{ padding: '50px 0 80px', background: '#FFFFFF', flex: 1 }}>
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
                  src={featuredPost.image || '/assets/exhibitions/exhibition_stand_branded.jpg'}
                  alt={featuredPost.title}
                  fill
                  priority
                  style={{ objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: '16px', left: '16px', background: '#FF6B00', color: '#FFFFFF', padding: '4px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.05em' }}>
                  FEATURED GUIDE
                </div>
              </div>

              <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#64748B', marginBottom: '14px', flexWrap: 'wrap' }}>
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
                  {featuredPost.views !== undefined && (
                    <>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Eye size={13} />
                        {featuredPost.views} reads
                      </span>
                    </>
                  )}
                </div>

                <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', lineHeight: 1.3, marginBottom: '16px' }}>
                  <Link
                    href={`/blog/${featuredPost.slug || featuredPost.id}`}
                    style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    {featuredPost.title}
                  </Link>
                </h2>

                <p style={{ color: '#64748B', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>
                  {featuredPost.excerpt}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', flexWrap: 'wrap', gap: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    By {featuredPost.author}
                  </span>
                  <Link
                    href={`/blog/${featuredPost.slug || featuredPost.id}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#FFFFFF',
                      background: '#0052CC',
                      fontWeight: 700,
                      fontSize: '13px',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      textDecoration: 'none'
                    }}
                  >
                    <span>Read Full Article</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Standard Article Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '28px' }}>
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
                <Link
                  href={`/blog/${post.slug || post.id}`}
                  style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', flex: 1 }}
                >
                  <div style={{ position: 'relative', height: '200px', background: '#0F172A' }}>
                    <Image
                      src={post.image || '/assets/exhibitions/exhibition_stand_branded.jpg'}
                      alt={post.title}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(15, 23, 42, 0.85)', color: '#FFFFFF', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, backdropFilter: 'blur(4px)' }}>
                      {post.category}
                    </div>
                  </div>

                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#64748B', marginBottom: '10px', flexWrap: 'wrap' }}>
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
                      <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>{post.author}</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#0052CC', fontWeight: 700, fontSize: '13px' }}>
                        Read Guide <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
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
