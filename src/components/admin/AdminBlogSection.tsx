'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  ExternalLink,
  Eye,
  CheckCircle2,
  Clock,
  Calendar,
  X,
  FileText,
  Sparkles,
  Tag,
  AlertCircle,
  TrendingUp,
  Share2
} from 'lucide-react';
import { BlogPost } from '@/lib/types';
import TablePagination from '@/components/common/TablePagination';

interface AdminBlogSectionProps {
  blogPosts: BlogPost[];
  onAddBlog: (post: Omit<BlogPost, 'id'>) => Promise<void>;
  onUpdateBlog: (post: BlogPost) => Promise<void>;
  onDeleteBlog: (id: string) => Promise<void>;
}

const CATEGORY_PRESETS = [
  'Standards & Compliance',
  'Material Metallurgy',
  'Engineering & Design',
  'Procurement Insights',
  'Logistics & Packaging'
];

const IMAGE_PRESETS = [
  { label: 'Branded Exhibition Stand', url: '/assets/exhibitions/exhibition_stand_branded.jpg' },
  { label: 'Engineering Consultation', url: '/assets/exhibitions/exhibition_conversation.jpg' },
  { label: 'Testing & Quality Lab', url: '/assets/exhibitions/exhibition_stand_photo.jpg' },
  { label: 'BIS & CE Compliance', url: '/assets/certificates/cert_ce.webp' },
];

export default function AdminBlogSection({
  blogPosts,
  onAddBlog,
  onUpdateBlog,
  onDeleteBlog,
}: AdminBlogSectionProps) {
  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'PUBLISHED' | 'DRAFT'>('All');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategory, setFormCategory] = useState(CATEGORY_PRESETS[0]);
  const [formAuthor, setFormAuthor] = useState('Technical Engineering Team');
  const [formReadTime, setFormReadTime] = useState('5 min read');
  const [formDate, setFormDate] = useState('');
  const [formImage, setFormImage] = useState(IMAGE_PRESETS[0].url);
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formStatus, setFormStatus] = useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formTags, setFormTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stats calculation
  const totalArticles = blogPosts.length;
  const publishedArticles = blogPosts.filter((b) => b.status === 'PUBLISHED').length;
  const draftArticles = blogPosts.filter((b) => b.status === 'DRAFT').length;
  const totalViews = blogPosts.reduce((sum, b) => sum + (b.views || 0), 0);

  // Auto-slug generator
  const handleTitleChange = (val: string) => {
    setFormTitle(val);
    if (!editingPost) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormSlug(generated);
    }
  };

  const openCreateModal = () => {
    setEditingPost(null);
    setFormTitle('');
    setFormSlug('');
    setFormCategory(CATEGORY_PRESETS[0]);
    setFormAuthor('Technical Engineering Team');
    setFormReadTime('5 min read');
    setFormDate(
      new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    );
    setFormImage(IMAGE_PRESETS[0].url);
    setFormExcerpt('');
    setFormContent(`## Engineering Overview\n\nExplain the fastener application, metallurgical standard, or engineering principles.\n\n### Technical Standards & Equivalencies\n\n- Standard 1: Details...\n- Standard 2: Details...\n\n> Important Note: Always verify material certificates prior to installation.\n\n### Key Takeaways for Procurement\n\n1. Point one\n2. Point two`);
    setFormStatus('PUBLISHED');
    setFormFeatured(false);
    setFormTags('DIN, ISO, Fasteners, Engineering');
    setIsModalOpen(true);
  };

  const openEditModal = (post: BlogPost) => {
    setEditingPost(post);
    setFormTitle(post.title);
    setFormSlug(post.slug || post.id);
    setFormCategory(post.category);
    setFormAuthor(post.author);
    setFormReadTime(post.readTime || '5 min read');
    setFormDate(post.date);
    setFormImage(post.image || IMAGE_PRESETS[0].url);
    setFormExcerpt(post.excerpt);
    setFormContent(post.content || '');
    setFormStatus(post.status || 'PUBLISHED');
    setFormFeatured(Boolean(post.featured));
    setFormTags(post.tags ? post.tags.join(', ') : '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formExcerpt.trim() || !formContent.trim()) {
      alert('Please fill in title, excerpt, and content fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const tagsArray = formTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      if (editingPost) {
        await onUpdateBlog({
          ...editingPost,
          title: formTitle.trim(),
          slug: formSlug.trim() || editingPost.slug,
          category: formCategory,
          author: formAuthor.trim(),
          readTime: formReadTime.trim(),
          date: formDate.trim(),
          image: formImage.trim(),
          excerpt: formExcerpt.trim(),
          content: formContent.trim(),
          status: formStatus,
          featured: formFeatured,
          tags: tagsArray,
        });
      } else {
        await onAddBlog({
          slug: formSlug.trim() || formTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          title: formTitle.trim(),
          category: formCategory,
          author: formAuthor.trim(),
          readTime: formReadTime.trim(),
          date: formDate.trim() || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          image: formImage.trim(),
          excerpt: formExcerpt.trim(),
          content: formContent.trim(),
          status: formStatus,
          featured: formFeatured,
          views: 0,
          tags: tagsArray,
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed saving blog article:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    const nextStatus = post.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    await onUpdateBlog({ ...post, status: nextStatus });
  };

  const handleToggleFeatured = async (post: BlogPost) => {
    await onUpdateBlog({ ...post, featured: !post.featured });
  };

  // Filtered collection
  const filteredBlogs = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesSearch =
        searchQuery === '' ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.author && post.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (post.tags && post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      const matchesStatus = selectedStatus === 'All' || post.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [blogPosts, searchQuery, selectedCategory, selectedStatus]);

  // Paginated items
  const paginatedBlogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBlogs.slice(start, start + pageSize);
  }, [filteredBlogs, currentPage, pageSize]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* KPI Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ background: '#FFFFFF', padding: '18px 20px', borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Total Articles</span>
            <BookOpen size={16} color="#0052CC" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
            {totalArticles}
          </div>
          <span style={{ fontSize: '11px', color: '#64748B' }}>Knowledge base guides</span>
        </div>

        <div style={{ background: '#FFFFFF', padding: '18px 20px', borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Live Published</span>
            <CheckCircle2 size={16} color="#10B981" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#10B981', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
            {publishedArticles}
          </div>
          <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>Active on /blog storefront</span>
        </div>

        <div style={{ background: '#FFFFFF', padding: '18px 20px', borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Drafts In Review</span>
            <Clock size={16} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#F59E0B', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
            {draftArticles}
          </div>
          <span style={{ fontSize: '11px', color: '#D97706', fontWeight: 600 }}>Pending editorial signoff</span>
        </div>

        <div style={{ background: '#FFFFFF', padding: '18px 20px', borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Total Reader Views</span>
            <Eye size={16} color="#0052CC" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0052CC', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
            {totalViews.toLocaleString()}
          </div>
          <span style={{ fontSize: '11px', color: '#64748B' }}>Total engineer impressions</span>
        </div>
      </div>

      {/* Control Filter Bar */}
      <div style={{ background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '16px 20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)' }}>
        
        {/* Left: Search input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '220px', background: '#F8FAFC', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
          <Search size={15} color="#64748B" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search articles by title, excerpt, DIN standard, author..."
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', width: '100%', color: '#0F172A' }}
          />
        </div>

        {/* Right: Filters & Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              color: '#334155',
              fontSize: '12px',
              fontWeight: 600,
              outline: 'none'
            }}
          >
            <option value="All">All Categories</option>
            {CATEGORY_PRESETS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value as any);
              setCurrentPage(1);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              color: '#334155',
              fontSize: '12px',
              fontWeight: 600,
              outline: 'none'
            }}
          >
            <option value="All">All Statuses</option>
            <option value="PUBLISHED">Published Only</option>
            <option value="DRAFT">Drafts Only</option>
          </select>

          {/* New Article Button */}
          <button
            type="button"
            onClick={openCreateModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#0052CC',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Plus size={15} />
            <span>Publish New Article</span>
          </button>
        </div>
      </div>

      {/* Main Articles Table Card */}
      <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
              Technical Fastener Articles &amp; Insights
            </h3>
            <span style={{ fontSize: '11px', color: '#64748B' }}>
              Showing {filteredBlogs.length} articles matching active filters
            </span>
          </div>

          <Link
            href="/blog"
            target="_blank"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#0052CC',
              textDecoration: 'none'
            }}
          >
            <span>View Public Blog Hub</span>
            <ExternalLink size={13} />
          </Link>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '12px 16px' }}>Article &amp; Metadata</th>
                <th style={{ padding: '12px 16px' }}>Category</th>
                <th style={{ padding: '12px 16px' }}>Author / Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Views</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBlogs.map((post) => (
                <tr
                  key={post.id}
                  style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Article & Image */}
                  <td style={{ padding: '14px 16px', maxWidth: '380px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          position: 'relative',
                          width: '56px',
                          height: '46px',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          background: '#0F172A',
                          flexShrink: 0
                        }}
                      >
                        <Image
                          src={post.image || '/assets/exhibitions/exhibition_stand_branded.jpg'}
                          alt={post.title}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                          <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '13px', lineHeight: 1.3 }}>
                            {post.title}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#64748B' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', color: '#0052CC' }}>/{post.slug || post.id}</span>
                          {post.featured && (
                            <span style={{ background: '#FFEDD5', color: '#C2410C', padding: '1px 6px', borderRadius: '4px', fontWeight: 800, fontSize: '10px' }}>
                              ★ Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td style={{ padding: '14px 16px' }}>
                    <span
                      style={{
                        background: '#EFF6FF',
                        color: '#0052CC',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 700
                      }}
                    >
                      {post.category}
                    </span>
                  </td>

                  {/* Author / Date */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ color: '#0F172A', fontWeight: 600, fontSize: '12px' }}>{post.author}</div>
                    <div style={{ color: '#64748B', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Calendar size={11} />
                      <span>{post.date}</span>
                      <span>•</span>
                      <span>{post.readTime}</span>
                    </div>
                  </td>

                  {/* Views */}
                  <td style={{ padding: '14px 16px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#475569' }}>
                    {post.views !== undefined ? post.views.toLocaleString() : 0}
                  </td>

                  {/* Status Toggle */}
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(post)}
                      style={{
                        background: post.status === 'PUBLISHED' ? '#ECFDF5' : '#F1F5F9',
                        color: post.status === 'PUBLISHED' ? '#047857' : '#64748B',
                        border: post.status === 'PUBLISHED' ? '1px solid #A7F3D0' : '1px solid #CBD5E1',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      title="Click to toggle Published / Draft status"
                    >
                      {post.status === 'PUBLISHED' ? '● Published' : '○ Draft'}
                    </button>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Link
                        href={`/blog/${post.slug || post.id}`}
                        target="_blank"
                        title="View Article on Storefront"
                        style={{
                          background: '#F1F5F9',
                          color: '#0052CC',
                          padding: '6px',
                          borderRadius: '5px',
                          border: '1px solid #CBD5E1',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <ExternalLink size={13} />
                      </Link>

                      <button
                        type="button"
                        onClick={() => openEditModal(post)}
                        title="Edit Article Content"
                        style={{
                          background: '#F8FAFC',
                          color: '#0F172A',
                          padding: '6px',
                          borderRadius: '5px',
                          border: '1px solid #CBD5E1',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <Edit2 size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${post.title}"?`)) {
                            onDeleteBlog(post.id);
                          }
                        }}
                        title="Delete Article"
                        style={{
                          background: '#FEF2F2',
                          color: '#EF4444',
                          padding: '6px',
                          borderRadius: '5px',
                          border: '1px solid #FECACA',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredBlogs.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B' }}>
                    <FileText size={36} color="#94A3B8" style={{ margin: '0 auto 10px' }} />
                    <div style={{ fontWeight: 700, fontSize: '15px', color: '#0F172A' }}>No technical articles found</div>
                    <div style={{ fontSize: '12px', marginTop: '4px' }}>Try modifying search keywords or category filters.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Integrated Pagination */}
        <TablePagination
          currentPage={currentPage}
          totalItems={filteredBlogs.length}
          itemsPerPage={pageSize}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setPageSize}
          itemLabel="articles"
        />
      </div>

      {/* ============================================================== */}
      {/* ADD / EDIT BLOG ARTICLE MODAL                                   */}
      {/* ============================================================== */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px'
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '840px',
              width: '100%',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#0F172A',
                color: '#FFFFFF'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BookOpen size={20} color="#FF6B00" />
                <h3 style={{ fontSize: '16px', fontWeight: 800 }}>
                  {editingPost ? 'Edit Technical Article' : 'Publish New Technical Fastener Guide'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px', flex: 1 }}>
              
              {/* Row 1: Title & Slug */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Article Headline *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Fastener Standards Explained: DIN 933 vs ISO 4017"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    URL Slug (Identifier) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="e.g. din-vs-iso-fastener-standards"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', fontFamily: 'var(--font-mono)' }}
                  />
                </div>
              </div>

              {/* Row 2: Category, Author, Read Time */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                  >
                    {CATEGORY_PRESETS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Author / Department
                  </label>
                  <input
                    type="text"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    placeholder="e.g. Technical Engineering Team"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Estimated Read Time
                  </label>
                  <input
                    type="text"
                    value={formReadTime}
                    onChange={(e) => setFormReadTime(e.target.value)}
                    placeholder="e.g. 6 min read"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Row 3: Status, Featured & Image Selection */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Publication Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                  >
                    <option value="PUBLISHED">Published (Visible on Storefront)</option>
                    <option value="DRAFT">Draft (Internal Review)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '28px' }}>
                  <input
                    type="checkbox"
                    id="featuredCheckbox"
                    checked={formFeatured}
                    onChange={(e) => setFormFeatured(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="featuredCheckbox" style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', cursor: 'pointer' }}>
                    Highlight as Featured Guide on /blog
                  </label>
                </div>
              </div>

              {/* Cover Image Presets & Input */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Article Cover Image
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  {IMAGE_PRESETS.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setFormImage(preset.url)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        border: formImage === preset.url ? '1px solid #0052CC' : '1px solid #CBD5E1',
                        background: formImage === preset.url ? '#EFF6FF' : '#F8FAFC',
                        color: formImage === preset.url ? '#0052CC' : '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="/assets/exhibitions/exhibition_stand_branded.jpg"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', outline: 'none', fontFamily: 'var(--font-mono)' }}
                />
              </div>

              {/* Excerpt / Summary */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Short Excerpt / Meta Description (2-3 sentences for cards &amp; SEO) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formExcerpt}
                  onChange={(e) => setFormExcerpt(e.target.value)}
                  placeholder="Summary of tolerances, metallurgy, and application recommendations..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', resize: 'vertical' }}
                />
              </div>

              {/* Markdown Content */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                    Full Technical Content (Markdown / Sections) *
                  </label>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                    Supports ## Headings, ### Subheadings, - Lists, &gt; Callouts
                  </span>
                </div>
                <textarea
                  rows={10}
                  required
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Write the full in-depth technical analysis..."
                  style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', fontFamily: 'var(--font-mono)', lineHeight: 1.6, resize: 'vertical' }}
                />
              </div>

              {/* Tags */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Tags / Standards (comma separated)
                </label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="DIN 933, ISO 4017, ASTM A193, Grade 8.8"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              {/* Modal Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '9px 18px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#334155', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: '9px 22px', borderRadius: '6px', border: 'none', background: '#0052CC', color: '#FFFFFF', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  {isSubmitting ? 'Saving...' : editingPost ? 'Save Changes' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
