'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  ArrowLeft,
  Share2,
  Bookmark,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Send,
  Eye,
  Tag,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  Copy,
  Check,
  BookOpen,
  ArrowRight,
  Layers,
  Sparkles
} from 'lucide-react';
import MainHeader from '@/components/header/MainHeader';
import CartDrawer from '@/components/cart/CartDrawer';
import { BlogPost, RfqLineItem } from '@/lib/types';

export default function BlogPostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const blogId = params?.id as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<RfqLineItem[]>([]);

  useEffect(() => {
    if (!blogId) return;

    let isMounted = true;
    setIsLoading(true);

    async function loadPostData() {
      try {
        // Fetch article detail and increment view count
        const res = await fetch(`/api/blogs?id=${encodeURIComponent(blogId)}&trackView=true`);
        const json = await res.json();

        if (json.success && json.data) {
          if (isMounted) setPost(json.data);

          // Fetch related posts from the same category or general list
          const listRes = await fetch(`/api/blogs?category=${encodeURIComponent(json.data.category || 'All')}`);
          const listJson = await listRes.json();
          if (listJson.success && Array.isArray(listJson.data)) {
            const filtered = listJson.data.filter((p: BlogPost) => p.id !== json.data.id && p.slug !== json.data.slug);
            if (isMounted) setRelatedPosts(filtered.slice(0, 3));
          }
        } else {
          // If not found in API, fallback to checking /api/blogs list
          const allRes = await fetch('/api/blogs');
          const allJson = await allRes.json();
          if (allJson.success && Array.isArray(allJson.data)) {
            const match = allJson.data.find(
              (p: BlogPost) => p.id === blogId || p.slug === blogId
            );
            if (match && isMounted) {
              setPost(match);
              setRelatedPosts(allJson.data.filter((p: BlogPost) => p.id !== match.id).slice(0, 3));
            }
          }
        }
      } catch (err) {
        console.error('Failed to load blog detail:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadPostData();

    return () => {
      isMounted = false;
    };
  }, [blogId]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handleShareWhatsApp = () => {
    if (typeof window !== 'undefined' && post) {
      const text = encodeURIComponent(
        `Technical Guide: "${post.title}"\nRead on CBH Fasteners:\n${window.location.href}`
      );
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    }
  };

  // Simple formatting parser for markdown headings, lists, blockquotes, and tables
  const renderFormattedContent = (content: string) => {
    if (!content) return null;

    const sections = content.split('\n\n');

    return sections.map((sec, idx) => {
      const trimmed = sec.trim();

      // Heading 2
      if (trimmed.startsWith('## ')) {
        return (
          <h2
            key={idx}
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: '#0F172A',
              margin: '36px 0 16px',
              letterSpacing: '-0.01em',
              borderBottom: '2px solid #E2E8F0',
              paddingBottom: '10px'
            }}
          >
            {trimmed.replace('## ', '')}
          </h2>
        );
      }

      // Heading 3
      if (trimmed.startsWith('### ')) {
        return (
          <h3
            key={idx}
            style={{
              fontSize: '19px',
              fontWeight: 700,
              color: '#0052CC',
              margin: '28px 0 12px'
            }}
          >
            {trimmed.replace('### ', '')}
          </h3>
        );
      }

      // Blockquote / Alert
      if (trimmed.startsWith('> ')) {
        return (
          <div
            key={idx}
            style={{
              margin: '24px 0',
              padding: '16px 20px',
              background: '#FFF7ED',
              borderLeft: '4px solid #FF6B00',
              borderRadius: '0 8px 8px 0',
              color: '#9A3412',
              fontSize: '14.5px',
              lineHeight: 1.6
            }}
          >
            {trimmed.replace('> ', '')}
          </div>
        );
      }

      // Bullet List
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const items = trimmed.split('\n').filter((l) => l.trim().startsWith('- ') || l.trim().startsWith('* '));
        return (
          <ul
            key={idx}
            style={{
              margin: '16px 0 20px 24px',
              paddingLeft: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              color: '#334155',
              fontSize: '15px',
              lineHeight: 1.65
            }}
          >
            {items.map((item, i) => (
              <li key={i}>{item.replace(/^[-*]\s+/, '')}</li>
            ))}
          </ul>
        );
      }

      // Numbered List
      if (/^\d+\.\s/.test(trimmed)) {
        const items = trimmed.split('\n').filter((l) => /^\d+\.\s/.test(l.trim()));
        return (
          <ol
            key={idx}
            style={{
              margin: '16px 0 20px 24px',
              paddingLeft: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              color: '#334155',
              fontSize: '15px',
              lineHeight: 1.65
            }}
          >
            {items.map((item, i) => (
              <li key={i}>{item.replace(/^\d+\.\s+/, '')}</li>
            ))}
          </ol>
        );
      }

      // Horizontal Divider
      if (trimmed === '---') {
        return <hr key={idx} style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '36px 0' }} />;
      }

      // Standard Paragraph
      return (
        <p
          key={idx}
          style={{
            fontSize: '16px',
            lineHeight: 1.75,
            color: '#334155',
            margin: '0 0 18px',
            fontWeight: 400
          }}
        >
          {trimmed}
        </p>
      );
    });
  };

  if (isLoading) {
    return (
      <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <MainHeader onOpenCart={() => setIsCartOpen(true)} cartCount={cartItems.length} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                border: '3px solid #E2E8F0',
                borderTopColor: '#0052CC',
                borderRadius: '50%',
                margin: '0 auto 16px',
                animation: 'spin 0.8s linear infinite'
              }}
            />
            <p style={{ color: '#64748B', fontSize: '14px', fontWeight: 600 }}>Loading Technical Fastener Article...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <MainHeader onOpenCart={() => setIsCartOpen(true)} cartCount={cartItems.length} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}>
          <div style={{ textAlign: 'center', maxWidth: '480px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#EFF6FF', color: '#0052CC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <BookOpen size={30} />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginBottom: '10px' }}>
              Technical Article Not Found
            </h1>
            <p style={{ color: '#64748B', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
              The requested technical paper or fastener guide does not exist or has been relocated within the CBH engineering library.
            </p>
            <Link
              href="/blog"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#0052CC',
                color: '#FFFFFF',
                padding: '10px 20px',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '13px',
                textDecoration: 'none'
              }}
            >
              <ArrowLeft size={16} />
              <span>Browse All Engineering Guides</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <MainHeader onOpenCart={() => setIsCartOpen(true)} cartCount={cartItems.length} />

      {/* Breadcrumb Bar */}
      <section style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '12px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748B', flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: '#64748B', textDecoration: 'none' }}>Home</Link>
            <ChevronRight size={13} />
            <Link href="/blog" style={{ color: '#0052CC', textDecoration: 'none', fontWeight: 600 }}>Technical Blog</Link>
            <ChevronRight size={13} />
            <span style={{ color: '#94A3B8' }}>{post.category}</span>
            <ChevronRight size={13} />
            <span style={{ color: '#0F172A', fontWeight: 600, maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {post.title}
            </span>
          </div>
        </div>
      </section>

      {/* Main Article Header Hero */}
      <header style={{ padding: '40px 0 30px', background: '#FFFFFF' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  background: '#0052CC',
                  color: '#FFFFFF',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase'
                }}
              >
                {post.category}
              </span>

              {post.featured && (
                <span style={{ background: '#FF6B00', color: '#FFFFFF', padding: '4px 10px', borderRadius: '16px', fontSize: '11px', fontWeight: 800 }}>
                  FEATURED GUIDE
                </span>
              )}
            </div>

            <Link
              href="/blog"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#64748B',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              <ArrowLeft size={15} />
              <span>All Articles</span>
            </Link>
          </div>

          <h1
            style={{
              fontSize: 'clamp(26px, 3.8vw, 40px)',
              fontWeight: 800,
              color: '#0F172A',
              lineHeight: 1.25,
              letterSpacing: '-0.02em',
              marginBottom: '18px'
            }}
          >
            {post.title}
          </h1>

          <p style={{ fontSize: '17px', lineHeight: 1.6, color: '#475569', marginBottom: '28px' }}>
            {post.excerpt}
          </p>

          {/* Meta Attribution & Action Ribbon */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid #F1F5F9',
              borderBottom: '1px solid #F1F5F9',
              padding: '16px 0',
              flexWrap: 'wrap',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: '#0052CC',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '14px'
                  }}
                >
                  {post.author ? post.author.charAt(0) : 'C'}
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                    {post.author}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Fastener Metallurgical Specialist</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#64748B' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={13} color="#0052CC" />
                  {post.date}
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} color="#FF6B00" />
                  {post.readTime}
                </span>
                {post.views !== undefined && (
                  <>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Eye size={13} color="#64748B" />
                      {post.views.toLocaleString()} reads
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Share / Copy buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={handleShareWhatsApp}
                title="Share on WhatsApp"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#25D366',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '7px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <MessageCircle size={14} />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                title="Copy Article Link"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#F1F5F9',
                  color: '#334155',
                  border: '1px solid #CBD5E1',
                  padding: '7px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {isCopied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                <span>{isCopied ? 'Copied' : 'Share'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Featured Cover Banner */}
      <section style={{ padding: '0 0 40px' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: 'clamp(280px, 45vw, 420px)',
              borderRadius: '16px',
              overflow: 'hidden',
              background: '#0F172A',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.1)'
            }}
          >
            <Image
              src={post.image || '/assets/exhibitions/exhibition_stand_branded.jpg'}
              alt={post.title}
              fill
              priority
              style={{ objectFit: 'cover' }}
            />
          </div>
        </div>
      </section>

      {/* Main Article Body & Procurement Callout */}
      <main style={{ padding: '0 0 70px' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          
          {/* Article Rendered Body */}
          <article className="article-content" style={{ fontSize: '16px', lineHeight: 1.75, color: '#334155' }}>
            {renderFormattedContent(post.content)}
          </article>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <Tag size={15} color="#64748B" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>Topics:</span>
              {post.tags.map((t, idx) => (
                <span
                  key={idx}
                  style={{
                    background: '#F1F5F9',
                    color: '#334155',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 600,
                    border: '1px solid #E2E8F0'
                  }}
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Direct Procurement Callout Box */}
          <div
            style={{
              marginTop: '50px',
              background: 'linear-gradient(135deg, #0A2E4E 0%, #0052CC 100%)',
              color: '#FFFFFF',
              borderRadius: '14px',
              padding: '36px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              borderLeft: '6px solid #FF6B00',
              boxShadow: '0 10px 30px rgba(0, 82, 204, 0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={24} color="#FF6B00" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#FED7AA', letterSpacing: '0.05em' }}>
                PROCURE FASTENERS FEATURED IN THIS GUIDE
              </span>
            </div>

            <h3 style={{ fontSize: '22px', fontWeight: 800, lineHeight: 1.3 }}>
              Source Certified DIN / ISO / ASTM Fasteners with NABL 3.1 MTC Traceability
            </h3>

            <p style={{ fontSize: '14px', color: '#DBEAFE', lineHeight: 1.6, maxWidth: '720px' }}>
              CBH Fasteners maintains active bulk inventory across all metric diameters (M6 to M36) in Grade 8.8, 10.9, 12.9, SS 304, and SS 316. Calculate dual prices in PCS or KGS and receive same-day dispatch from our central logistics hubs.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
              <Link
                href="/bulk-order"
                style={{
                  background: '#FF6B00',
                  color: '#FFFFFF',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 800,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Request Volume Bulk RFQ</span>
                <ArrowRight size={15} />
              </Link>

              <Link
                href="/products"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  padding: '10px 18px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Browse Inventory Matrix</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Related Technical Articles */}
      {relatedPosts.length > 0 && (
        <section style={{ background: '#F8FAFC', padding: '60px 0 80px', borderTop: '1px solid #E2E8F0' }}>
          <div className="container" style={{ maxWidth: '1000px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#0052CC', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  RELATED READING
                </span>
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                  More Engineering &amp; Metallurgy Insights
                </h3>
              </div>

              <Link
                href="/blog"
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#0052CC',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>View All Articles</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/blog/${rel.slug || rel.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                    }}
                  >
                    <div style={{ position: 'relative', height: '160px', background: '#0F172A' }}>
                      <Image
                        src={rel.image || '/assets/exhibitions/exhibition_stand_branded.jpg'}
                        alt={rel.title}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#0052CC', textTransform: 'uppercase', marginBottom: '8px' }}>
                        {rel.category}
                      </span>
                      <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', lineHeight: 1.4, marginBottom: '8px', flex: 1 }}>
                        {rel.title}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#64748B', marginTop: '12px', borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
                        <span>{rel.readTime}</span>
                        <span style={{ color: '#0052CC', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          Read <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

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
