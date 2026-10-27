'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Globe,
  Search,
  FileCode,
  FileText,
  Bot,
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Save,
  RefreshCw,
  Eye,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Copy,
  Layers,
  ArrowRight,
  ShieldCheck,
  Code2,
  Sliders,
  Check
} from 'lucide-react';
import {
  FullSeoConfig,
  PageSeoConfig,
  FaqItem,
  SitemapUrlItem
} from '@/lib/seo-types';

type TabType = 'overview' | 'pages' | 'global' | 'faqs' | 'robots' | 'sitemap' | 'llms';

export default function AdminSeoPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [config, setConfig] = useState<FullSeoConfig | null>(null);

  // Search & Filters for On-Page SEO
  const [pageSearch, setPageSearch] = useState('');
  const [editingPage, setEditingPage] = useState<PageSeoConfig | null>(null);
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Fetch SEO configuration
  useEffect(() => {
    fetchSeoConfig();
  }, []);

  const fetchSeoConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/seo');
      const json = await res.json();
      if (json.success && json.data) {
        setConfig(json.data);
      }
    } catch {
      showNotification('Failed to load SEO configuration', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSaveAll = async (overrideConfig?: FullSeoConfig) => {
    const payload = overrideConfig || config;
    if (!payload) return;

    try {
      setSaving(true);
      const res = await fetch('/api/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setConfig(json.data);
        showNotification('SEO configuration saved successfully and synced with <head> tags!');
      } else {
        showNotification(json.error || 'Failed to save', 'error');
      }
    } catch {
      showNotification('Error saving SEO configuration', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Helper to copy links
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // Page Edit Actions
  const handleSavePage = (page: PageSeoConfig) => {
    if (!config) return;
    const exists = config.pages.findIndex((p) => p.id === page.id || p.path === page.path);
    let updatedPages = [...config.pages];

    if (exists >= 0) {
      updatedPages[exists] = { ...page, updatedAt: new Date().toISOString() };
    } else {
      updatedPages.push({ ...page, id: page.id || `page-${Date.now()}`, updatedAt: new Date().toISOString() });
    }

    const updatedConfig = { ...config, pages: updatedPages };
    setConfig(updatedConfig);
    setEditingPage(null);
    setIsCreatingPage(false);
    handleSaveAll(updatedConfig);
  };

  const handleDeletePage = (id: string, path: string) => {
    if (!confirm(`Are you sure you want to delete custom SEO for route ${path}?`)) return;
    if (!config) return;
    const updatedPages = config.pages.filter((p) => p.id !== id);
    const updatedConfig = { ...config, pages: updatedPages };
    setConfig(updatedConfig);
    handleSaveAll(updatedConfig);
  };

  if (loading || !config) {
    return (
      <div className="bg-white rounded-2xl border border-[#D8DFE7] p-12 text-center shadow-sm">
        <RefreshCw className="w-8 h-8 text-[#0052CC] animate-spin mx-auto mb-3" />
        <h3 className="text-base font-bold text-[#0F172A]">Loading CBH SEO Architecture Engine...</h3>
        <p className="text-xs text-slate-500 mt-1">Reading dynamic schemas, on-page routes, robots.txt &amp; llms.txt</p>
      </div>
    );
  }

  const filteredPages = config.pages.filter(
    (p) =>
      p.path.toLowerCase().includes(pageSearch.toLowerCase()) ||
      p.title.toLowerCase().includes(pageSearch.toLowerCase()) ||
      p.pageName.toLowerCase().includes(pageSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2 ${
            notification.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700'
              : 'bg-rose-900 text-white border-rose-700'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-[#D8DFE7] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">
              Dynamic SEO &amp; Technical Schema Console
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0052CC] text-xs font-bold border border-blue-200 flex items-center gap-1">
              <Sparkles size={12} />
              &lt;head&gt; Injection Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic per-page meta, Schema.org FAQs, global OpenGraph, dynamic <code className="text-[#0052CC] font-bold">sitemap.xml</code>, <code className="text-[#0052CC] font-bold">robots.txt</code>, and <code className="text-[#0052CC] font-bold">llms.txt</code> for search spiders and AI crawlers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSaveAll()}
            disabled={saving}
            className="px-5 py-2.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow transition-all disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Syncing Head...' : 'Save & Deploy SEO'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto bg-white p-2 rounded-2xl border border-[#D8DFE7] shadow-sm text-xs font-bold">
        {[
          { id: 'overview', label: 'Overview & Audit', icon: Layers },
          { id: 'pages', label: `On-Page Dynamic SEO (${config.pages.length})`, icon: FileText },
          { id: 'global', label: 'Global Meta & Social', icon: Globe },
          { id: 'faqs', label: 'FAQs Schema Manager', icon: HelpCircle },
          { id: 'robots', label: 'Robots.txt Editor', icon: Bot },
          { id: 'sitemap', label: 'Sitemap.xml Generator', icon: FileCode },
          { id: 'llms', label: 'llms.txt (AI Crawlers)', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4 py-2.5 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
                active
                  ? 'bg-[#0052CC] text-white shadow-sm'
                  : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: OVERVIEW & AUDIT
      ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#D8DFE7] shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Configured Routes</span>
              <div className="text-2xl font-black text-[#0F172A] mt-1">{config.pages.length} Pages</div>
              <div className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">
                <CheckCircle2 size={12} />
                <span>All indexed via App Router &lt;head&gt;</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#D8DFE7] shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Schema.org FAQs</span>
              <div className="text-2xl font-black text-[#0052CC] mt-1">
                {config.pages.reduce((acc, p) => acc + (p.faqs?.length || 0), 0) + (config.global.globalFaqs?.length || 0)} Questions
              </div>
              <div className="text-xs text-slate-500 font-medium mt-2">
                Valid FAQPage JSON-LD in &lt;head&gt;
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#D8DFE7] shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Search Verification</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                {config.global.googleVerification ? 'Active' : 'Standby'}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-2">
                Google Search Console &amp; Bing
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#D8DFE7] shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">AI Context (LLMs.txt)</span>
              <div className="text-2xl font-black text-[#FF6B00] mt-1">Ready</div>
              <div className="text-xs text-slate-500 font-medium mt-2">
                Standard spec for Claude, GPT &amp; Gemini
              </div>
            </div>
          </div>

          {/* Live Endpoints Verification Strip */}
          <div className="bg-white rounded-2xl border border-[#D8DFE7] p-6 shadow-sm space-y-4">
            <h3 className="text-base font-black text-[#0F172A]">Public Search &amp; AI Endpoints (Click to View Live)</h3>
            <p className="text-xs text-slate-500">
              These live routes are automatically served with proper mime-types and header caching:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs font-bold text-[#0F172A]">/sitemap.xml</div>
                  <div className="text-[11px] text-slate-500">Dynamic XML URL index with changefreq &amp; priority</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(`${window.location.origin}/sitemap.xml`, 'sitemap')}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-black"
                  >
                    {copiedLink === 'sitemap' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                  <a
                    href="/sitemap.xml"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-blue-50 text-[#0052CC] border border-blue-200 text-xs font-bold flex items-center gap-1 hover:bg-blue-100"
                  >
                    <span>View XML</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs font-bold text-[#0F172A]">/robots.txt</div>
                  <div className="text-[11px] text-slate-500">Directives for Googlebot, Bingbot, Baidu &amp; AI crawlers</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(`${window.location.origin}/robots.txt`, 'robots')}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-black"
                  >
                    {copiedLink === 'robots' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                  <a
                    href="/robots.txt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-blue-50 text-[#0052CC] border border-blue-200 text-xs font-bold flex items-center gap-1 hover:bg-blue-100"
                  >
                    <span>View Text</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between md:col-span-2">
                <div>
                  <div className="font-mono text-xs font-bold text-[#0F172A]">/llms.txt</div>
                  <div className="text-[11px] text-slate-500">Official open AI standard context for LLMs &amp; AI search spiders</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(`${window.location.origin}/llms.txt`, 'llms')}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-black"
                  >
                    {copiedLink === 'llms' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                  <a
                    href="/llms.txt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-blue-50 text-[#0052CC] border border-blue-200 text-xs font-bold flex items-center gap-1 hover:bg-blue-100"
                  >
                    <span>View llms.txt</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: ON-PAGE DYNAMIC SEO
      ========================================================================= */}
      {activeTab === 'pages' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl border border-[#D8DFE7] p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={pageSearch}
                onChange={(e) => setPageSearch(e.target.value)}
                placeholder="Search route by path (/products, /bulk-order) or title..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0052CC] font-medium"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingPage({
                  id: `page-${Date.now()}`,
                  path: '/new-route',
                  pageName: 'New Page',
                  title: 'Title | CBH Fasteners',
                  description: 'Meta description for new page...',
                  keywords: 'fasteners, engineering',
                  robots: 'index, follow',
                  faqs: [],
                });
                setIsCreatingPage(true);
              }}
              className="px-4 py-2.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus size={15} />
              <span>Add Dynamic Route SEO</span>
            </button>
          </div>

          {/* Table of Routes */}
          <div className="bg-white rounded-2xl border border-[#D8DFE7] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-[#D8DFE7] text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Route Path</th>
                    <th className="py-3.5 px-4">Page Title &amp; Description</th>
                    <th className="py-3.5 px-4">Robots</th>
                    <th className="py-3.5 px-4">FAQs Schema</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPages.map((page) => (
                    <tr key={page.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-4 align-top">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-[#0F172A]">
                          <span className="text-[#0052CC]">{page.path}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium block mt-0.5">{page.pageName}</span>
                      </td>

                      <td className="py-4 px-4 align-top max-w-md">
                        <div className="font-bold text-[#0F172A] line-clamp-1">{page.title}</div>
                        <div className="text-slate-500 text-[11px] line-clamp-2 mt-1 leading-relaxed">
                          {page.description}
                        </div>
                      </td>

                      <td className="py-4 px-4 align-top">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            page.robots?.includes('noindex')
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {page.robots || 'index, follow'}
                        </span>
                      </td>

                      <td className="py-4 px-4 align-top">
                        {page.faqs && page.faqs.length > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0052CC] border border-blue-200 font-bold text-[10px]">
                            {page.faqs.length} FAQs Active
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Global Fallback</span>
                        )}
                      </td>

                      <td className="py-4 px-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPage({ ...page });
                              setIsCreatingPage(false);
                            }}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-[#0052CC] transition-colors"
                            title="Edit Route SEO"
                          >
                            <Edit3 size={15} />
                          </button>

                          <Link
                            href={page.path}
                            target="_blank"
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                            title="Visit Public Page"
                          >
                            <ExternalLink size={15} />
                          </Link>

                          {page.path !== '/' && (
                            <button
                              type="button"
                              onClick={() => handleDeletePage(page.id, page.path)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors"
                              title="Delete Route SEO"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredPages.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        No pages match your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Edit / Create Page Modal */}
          {editingPage && (
            <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full p-6 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b pb-4">
                  <h3 className="text-lg font-black text-[#0F172A]">
                    {isCreatingPage ? 'Add Dynamic On-Page SEO Route' : `Configure SEO for ${editingPage.path}`}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditingPage(null)}
                    className="text-slate-400 hover:text-black font-bold text-sm"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-[#0F172A] mb-1">Route Path (URL)</label>
                      <input
                        type="text"
                        value={editingPage.path}
                        onChange={(e) => setEditingPage({ ...editingPage, path: e.target.value })}
                        placeholder="e.g. /products or /bulk-order"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:border-[#0052CC]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#0F172A] mb-1">Internal Name</label>
                      <input
                        type="text"
                        value={editingPage.pageName}
                        onChange={(e) => setEditingPage({ ...editingPage, pageName: e.target.value })}
                        placeholder="e.g. Hex Screws Matrix"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0052CC]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#0F172A] mb-1">
                      Meta Title <span className="text-slate-400 font-normal">({editingPage.title.length} chars)</span>
                    </label>
                    <input
                      type="text"
                      value={editingPage.title}
                      onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-[#0052CC]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#0F172A] mb-1">
                      Meta Description <span className="text-slate-400 font-normal">({editingPage.description.length} chars)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={editingPage.description}
                      onChange={(e) => setEditingPage({ ...editingPage, description: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0052CC]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-[#0F172A] mb-1">Meta Keywords</label>
                      <input
                        type="text"
                        value={editingPage.keywords}
                        onChange={(e) => setEditingPage({ ...editingPage, keywords: e.target.value })}
                        placeholder="fasteners, hex bolts, DIN 933"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0052CC]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#0F172A] mb-1">Robots Directive</label>
                      <select
                        value={editingPage.robots || 'index, follow'}
                        onChange={(e: any) => setEditingPage({ ...editingPage, robots: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0052CC]"
                      >
                        <option value="index, follow">index, follow (Default, Recommended)</option>
                        <option value="noindex, follow">noindex, follow</option>
                        <option value="index, nofollow">index, nofollow</option>
                        <option value="noindex, nofollow">noindex, nofollow (Block Indexing)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#0F172A] mb-1">Custom Canonical URL (Optional)</label>
                    <input
                      type="text"
                      value={editingPage.canonicalUrl || ''}
                      onChange={(e) => setEditingPage({ ...editingPage, canonicalUrl: e.target.value })}
                      placeholder="Leave blank to use default canonical URL"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0052CC]"
                    />
                  </div>

                  {/* Google SERP Preview Box */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Google SERP Live Snippet Preview</span>
                    <div className="text-[#1a0dab] font-medium text-base hover:underline cursor-pointer">
                      {editingPage.title || 'Page Title'}
                    </div>
                    <div className="text-[#006621] text-xs">
                      https://cbh.store{editingPage.path}
                    </div>
                    <div className="text-[#545454] text-xs leading-relaxed">
                      {editingPage.description || 'Meta description will appear here...'}
                    </div>
                  </div>

                  {/* On-Page FAQs Builder */}
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-[#0F172A]">Page-Specific FAQs Schema (Schema.org JSON-LD in &lt;head&gt;)</h4>
                        <p className="text-[11px] text-slate-500">Rendered strictly within HTML &lt;head&gt; for Google Rich FAQ snippets.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const currentFaqs = editingPage.faqs || [];
                          setEditingPage({
                            ...editingPage,
                            faqs: [
                              ...currentFaqs,
                              {
                                id: `faq-${Date.now()}`,
                                question: 'Frequently Asked Question?',
                                answer: 'Answer text detailing metallurgy, tolerance, or dispatch terms.',
                              },
                            ],
                          });
                        }}
                        className="px-3 py-1.5 bg-blue-50 text-[#0052CC] border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-blue-100"
                      >
                        <Plus size={13} /> Add FAQ
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(editingPage.faqs || []).map((faq, idx) => (
                        <div key={faq.id || idx} className="p-3 rounded-xl border border-slate-200 bg-white space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Q{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (editingPage.faqs || []).filter((_, i) => i !== idx);
                                setEditingPage({ ...editingPage, faqs: updated });
                              }}
                              className="text-rose-500 hover:text-rose-700"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) => {
                              const updated = [...(editingPage.faqs || [])];
                              updated[idx].question = e.target.value;
                              setEditingPage({ ...editingPage, faqs: updated });
                            }}
                            placeholder="Question"
                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-xs"
                          />
                          <textarea
                            rows={2}
                            value={faq.answer}
                            onChange={(e) => {
                              const updated = [...(editingPage.faqs || [])];
                              updated[idx].answer = e.target.value;
                              setEditingPage({ ...editingPage, faqs: updated });
                            }}
                            placeholder="Answer"
                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setEditingPage(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSavePage(editingPage)}
                    className="px-5 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-xl text-xs font-bold"
                  >
                    Save Route SEO
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: GLOBAL META & SOCIAL
      ========================================================================= */}
      {activeTab === 'global' && (
        <div className="bg-white rounded-2xl border border-[#D8DFE7] p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="text-base font-black text-[#0F172A]">Sitewide Global Metadata &amp; Search Console</h3>
              <p className="text-xs text-slate-500">Defaults used across all pages unless specifically overridden in On-Page SEO.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-bold text-[#0F172A] mb-1">Site Brand Name</label>
              <input
                type="text"
                value={config.global.siteName}
                onChange={(e) => setConfig({ ...config, global: { ...config.global, siteName: e.target.value } })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0052CC]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#0F172A] mb-1">Canonical Base URL</label>
              <input
                type="text"
                value={config.global.canonicalBase}
                onChange={(e) => setConfig({ ...config, global: { ...config.global, canonicalBase: e.target.value } })}
                placeholder="https://cbh.store"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:border-[#0052CC]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-[#0F172A] mb-1">Default Sitewide Title</label>
              <input
                type="text"
                value={config.global.defaultTitle}
                onChange={(e) => setConfig({ ...config, global: { ...config.global, defaultTitle: e.target.value } })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0052CC]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-[#0F172A] mb-1">Default Meta Description</label>
              <textarea
                rows={3}
                value={config.global.defaultDescription}
                onChange={(e) => setConfig({ ...config, global: { ...config.global, defaultDescription: e.target.value } })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0052CC]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-[#0F172A] mb-1">Default Sitewide Keywords</label>
              <input
                type="text"
                value={config.global.defaultKeywords}
                onChange={(e) => setConfig({ ...config, global: { ...config.global, defaultKeywords: e.target.value } })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0052CC]"
              />
            </div>
          </div>

          {/* Search Console Verification */}
          <div className="border-t pt-5">
            <h4 className="font-bold text-[#0F172A] mb-3 text-xs uppercase tracking-wider text-slate-500">
              Webmaster Verification Tags (Injected into &lt;head&gt;)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[#0F172A] mb-1">Google Search Console Verification Token</label>
                <input
                  type="text"
                  value={config.global.googleVerification}
                  onChange={(e) => setConfig({ ...config, global: { ...config.global, googleVerification: e.target.value } })}
                  placeholder="e.g. google-site-verification code"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0F172A] mb-1">Bing Webmaster (msvalidate.01) Token</label>
                <input
                  type="text"
                  value={config.global.bingVerification}
                  onChange={(e) => setConfig({ ...config, global: { ...config.global, bingVerification: e.target.value } })}
                  placeholder="e.g. 128-bit hex string"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:border-[#0052CC]"
                />
              </div>
            </div>
          </div>

          {/* Social & OpenGraph */}
          <div className="border-t pt-5">
            <h4 className="font-bold text-[#0F172A] mb-3 text-xs uppercase tracking-wider text-slate-500">
              Social Sharing &amp; OpenGraph
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[#0F172A] mb-1">Twitter / X Handle</label>
                <input
                  type="text"
                  value={config.global.twitterHandle}
                  onChange={(e) => setConfig({ ...config, global: { ...config.global, twitterHandle: e.target.value } })}
                  placeholder="@cbhfasteners"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0F172A] mb-1">OpenGraph Image Path</label>
                <input
                  type="text"
                  value={config.global.ogImage}
                  onChange={(e) => setConfig({ ...config, global: { ...config.global, ogImage: e.target.value } })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0F172A] mb-1">Theme Color</label>
                <input
                  type="text"
                  value={config.global.themeColor}
                  onChange={(e) => setConfig({ ...config, global: { ...config.global, themeColor: e.target.value } })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:border-[#0052CC]"
                />
              </div>
            </div>
          </div>

          {/* Raw Custom Head Script Injection */}
          <div className="border-t pt-5 space-y-2">
            <h4 className="font-bold text-[#0F172A] text-xs uppercase tracking-wider text-slate-500">
              Custom &lt;head&gt; Raw Code / Tracking Scripts
            </h4>
            <p className="text-[11px] text-slate-500">
              Any custom meta tags, Google Analytics, or GTM container tags placed here will be injected strictly into the HTML <code className="text-[#0052CC] font-bold">&lt;head&gt;</code> tag and never in the body.
            </p>
            <textarea
              rows={4}
              value={config.global.customHeadTags}
              onChange={(e) => setConfig({ ...config, global: { ...config.global, customHeadTags: e.target.value } })}
              placeholder="<!-- Google Analytics / Meta Tags -->"
              className="w-full p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: FAQS SCHEMA MANAGER
      ========================================================================= */}
      {activeTab === 'faqs' && (
        <div className="bg-white rounded-2xl border border-[#D8DFE7] p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="text-base font-black text-[#0F172A]">Sitewide Global FAQs Schema.org Builder</h3>
              <p className="text-xs text-slate-500">
                These questions are converted to valid <code className="font-mono text-[#0052CC]">application/ld+json</code> FAQPage schema and injected strictly in the HTML <code className="font-mono text-[#0052CC]">&lt;head&gt;</code>.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const current = config.global.globalFaqs || [];
                setConfig({
                  ...config,
                  global: {
                    ...config.global,
                    globalFaqs: [
                      ...current,
                      {
                        id: `faq-g-${Date.now()}`,
                        question: 'What is the order lead time for high-tensile fasteners?',
                        answer: 'Standard Grade 8.8 and 10.9 fasteners in stock ship in 24 to 48 hours.',
                      },
                    ],
                  },
                });
              }}
              className="px-4 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Plus size={14} /> Add Global FAQ
            </button>
          </div>

          <div className="space-y-4">
            {(config.global.globalFaqs || []).map((faq, idx) => (
              <div key={faq.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Question #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (config.global.globalFaqs || []).filter((_, i) => i !== idx);
                      setConfig({ ...config, global: { ...config.global, globalFaqs: updated } });
                    }}
                    className="p-1 text-rose-500 hover:text-rose-700"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) => {
                    const updated = [...(config.global.globalFaqs || [])];
                    updated[idx].question = e.target.value;
                    setConfig({ ...config, global: { ...config.global, globalFaqs: updated } });
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-[#0F172A]"
                />
                <textarea
                  rows={2}
                  value={faq.answer}
                  onChange={(e) => {
                    const updated = [...(config.global.globalFaqs || [])];
                    updated[idx].answer = e.target.value;
                    setConfig({ ...config, global: { ...config.global, globalFaqs: updated } });
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: ROBOTS.TXT EDITOR
      ========================================================================= */}
      {activeTab === 'robots' && (
        <div className="bg-white rounded-2xl border border-[#D8DFE7] p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h3 className="text-base font-black text-[#0F172A]">Robots.txt Directives Editor</h3>
              <p className="text-xs text-slate-500">Live dynamic endpoint served at <code className="font-mono text-[#0052CC]">/robots.txt</code> with text/plain response.</p>
            </div>
            <a
              href="/robots.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 flex items-center gap-1.5 hover:bg-slate-50"
            >
              <span>Test Live /robots.txt</span>
              <ExternalLink size={12} />
            </a>
          </div>

          <div>
            <textarea
              rows={14}
              value={config.robots?.content || ''}
              onChange={(e) => setConfig({ ...config, robots: { ...config.robots, content: e.target.value } })}
              className="w-full p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: SITEMAP.XML MANAGER
      ========================================================================= */}
      {activeTab === 'sitemap' && (
        <div className="bg-white rounded-2xl border border-[#D8DFE7] p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h3 className="text-base font-black text-[#0F172A]">Dynamic XML Sitemap Generator</h3>
              <p className="text-xs text-slate-500">Served live at <code className="font-mono text-[#0052CC]">/sitemap.xml</code> with application/xml headers.</p>
            </div>
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 flex items-center gap-1.5 hover:bg-slate-50"
            >
              <span>Test Live /sitemap.xml</span>
              <ExternalLink size={12} />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
            <label className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer">
              <span>Automatically Include Fastener Products in Sitemap</span>
              <input
                type="checkbox"
                checked={config.sitemap?.includeProducts !== false}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    sitemap: { ...config.sitemap, includeProducts: e.target.checked },
                  })
                }
                className="w-4 h-4 text-[#0052CC] rounded"
              />
            </label>

            <label className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer">
              <span>Automatically Include Fastener Categories in Sitemap</span>
              <input
                type="checkbox"
                checked={config.sitemap?.includeCategories !== false}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    sitemap: { ...config.sitemap, includeCategories: e.target.checked },
                  })
                }
                className="w-4 h-4 text-[#0052CC] rounded"
              />
            </label>
          </div>

          {/* Additional Static URLs in Sitemap */}
          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-[#0F172A] text-xs uppercase tracking-wider text-slate-500">
                Additional Custom URLs in Sitemap
              </h4>
              <button
                type="button"
                onClick={() => {
                  const current = config.sitemap?.additionalUrls || [];
                  setConfig({
                    ...config,
                    sitemap: {
                      ...config.sitemap,
                      additionalUrls: [
                        ...current,
                        {
                          url: 'https://cbh.store/about',
                          changefreq: 'monthly',
                          priority: 0.7,
                          lastmod: new Date().toISOString().split('T')[0],
                        },
                      ],
                    },
                  });
                }}
                className="px-3 py-1 bg-blue-50 text-[#0052CC] border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1"
              >
                <Plus size={12} /> Add URL
              </button>
            </div>

            <div className="space-y-2">
              {(config.sitemap?.additionalUrls || []).map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                  <input
                    type="text"
                    value={item.url}
                    onChange={(e) => {
                      const updated = [...(config.sitemap?.additionalUrls || [])];
                      updated[idx].url = e.target.value;
                      setConfig({ ...config, sitemap: { ...config.sitemap, additionalUrls: updated } });
                    }}
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-xs"
                    placeholder="URL"
                  />
                  <select
                    value={item.changefreq}
                    onChange={(e: any) => {
                      const updated = [...(config.sitemap?.additionalUrls || [])];
                      updated[idx].changefreq = e.target.value;
                      setConfig({ ...config, sitemap: { ...config.sitemap, additionalUrls: updated } });
                    }}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                  >
                    <option value="always">always</option>
                    <option value="hourly">hourly</option>
                    <option value="daily">daily</option>
                    <option value="weekly">weekly</option>
                    <option value="monthly">monthly</option>
                    <option value="yearly">yearly</option>
                  </select>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="1.0"
                    value={item.priority}
                    onChange={(e) => {
                      const updated = [...(config.sitemap?.additionalUrls || [])];
                      updated[idx].priority = parseFloat(e.target.value);
                      setConfig({ ...config, sitemap: { ...config.sitemap, additionalUrls: updated } });
                    }}
                    className="w-20 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center"
                    placeholder="Priority"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (config.sitemap?.additionalUrls || []).filter((_, i) => i !== idx);
                      setConfig({ ...config, sitemap: { ...config.sitemap, additionalUrls: updated } });
                    }}
                    className="p-1.5 text-rose-500 hover:text-rose-700"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 7: LLMS.TXT (AI SEARCH CRAWLERS)
      ========================================================================= */}
      {activeTab === 'llms' && (
        <div className="bg-white rounded-2xl border border-[#D8DFE7] p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h3 className="text-base font-black text-[#0F172A]">llms.txt AI Specification</h3>
              <p className="text-xs text-slate-500">
                The open AI standard for feeding clean, markdown-structured industrial specifications to LLM search spiders and crawlers.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/llms.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 flex items-center gap-1.5 hover:bg-slate-50"
              >
                <span>Test Live /llms.txt</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block font-bold text-[#0F172A] text-xs mb-1">
                llms.txt Markdown Specification (<code className="text-[#0052CC]">/llms.txt</code>)
              </label>
              <textarea
                rows={18}
                value={config.llms?.content || ''}
                onChange={(e) => setConfig({ ...config, llms: { ...config.llms, content: e.target.value } })}
                className="w-full p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl focus:outline-none leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
