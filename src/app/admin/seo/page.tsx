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
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import {
  FullSeoConfig,
  PageSeoConfig,
  FaqItem,
  SitemapUrlItem
} from '@/lib/seo-types';

type TabType = 'pages' | 'global' | 'faqs' | 'robots' | 'sitemap' | 'llms';

export default function AdminSeoPage() {
  const [activeTab, setActiveTab] = useState<TabType>('pages');
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
        showNotification('SEO configuration saved and synced with <head> tags!');
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
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
        <RefreshCw className="w-7 h-7 text-[#0052CC] animate-spin mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-800">Loading SEO Configuration...</h3>
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
    <div className="space-y-4">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2 animate-fade-in ${
            notification.type === 'success'
              ? 'bg-slate-900 text-white border-slate-700'
              : 'bg-rose-900 text-white border-rose-700'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 size={15} className="text-emerald-400" />
          ) : (
            <AlertCircle size={15} className="text-rose-400" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Clean Compact Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              SEO &amp; Schema Engine
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1 shrink-0">
              <Sparkles size={11} />
              &lt;head&gt; Active
            </span>
          </div>

          {/* Quick Endpoint Pills */}
          <div className="hidden lg:flex items-center gap-1.5 pl-3 border-l border-slate-200 text-[11px]">
            <span className="text-slate-400 font-medium">Live:</span>
            {[
              { path: '/sitemap.xml', label: 'sitemap.xml', id: 'sitemap' },
              { path: '/robots.txt', label: 'robots.txt', id: 'robots' },
              { path: '/llms.txt', label: 'llms.txt', id: 'llms' },
            ].map((ep) => (
              <div
                key={ep.id}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 font-mono text-slate-600"
              >
                <a
                  href={ep.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0052CC] flex items-center gap-1"
                  title={`Open ${ep.path}`}
                >
                  <span>{ep.label}</span>
                  <ExternalLink size={10} />
                </a>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      typeof window !== 'undefined' ? `${window.location.origin}${ep.path}` : ep.path,
                      ep.id
                    )
                  }
                  className="text-slate-400 hover:text-slate-700 ml-0.5"
                  title="Copy URL"
                >
                  {copiedLink === ep.id ? <Check size={10} className="text-emerald-600" /> : <Copy size={10} />}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <button
            type="button"
            onClick={() => handleSaveAll()}
            disabled={saving}
            className="px-4 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saving ? 'Syncing...' : 'Save & Deploy'}</span>
          </button>
        </div>
      </div>

      {/* Touch-Friendly Horizontal Navigation Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-1.5 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'pages', label: `Routes & Pages (${config.pages.length})`, icon: FileText },
            { id: 'global', label: 'Global Meta & Social', icon: Globe },
            { id: 'faqs', label: `Global FAQs (${config.global.globalFaqs?.length || 0})`, icon: HelpCircle },
            { id: 'robots', label: 'Robots.txt', icon: Bot },
            { id: 'sitemap', label: 'Sitemap.xml', icon: FileCode },
            { id: 'llms', label: 'llms.txt (AI)', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                  active
                    ? 'bg-[#0052CC] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          TAB 1: ON-PAGE DYNAMIC SEO (DEFAULT)
      ========================================================================= */}
      {activeTab === 'pages' && (
        <div className="space-y-3">
          {/* Controls Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={pageSearch}
                onChange={(e) => setPageSearch(e.target.value)}
                placeholder="Search route by path or title..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#0052CC]"
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
              className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0"
            >
              <Plus size={14} />
              <span>Add Dynamic Route</span>
            </button>
          </div>

          {/* Table of Routes */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-xs min-w-[680px]">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Route Path</th>
                    <th className="py-2.5 px-3">Page Title &amp; Description</th>
                    <th className="py-2.5 px-3">Robots</th>
                    <th className="py-2.5 px-3">FAQs Schema</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPages.map((page) => (
                    <tr key={page.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 align-middle">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                          <span className="text-[#0052CC]">{page.path}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium block truncate max-w-[140px]">
                          {page.pageName}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 align-middle max-w-sm">
                        <div className="font-semibold text-slate-900 truncate">{page.title}</div>
                        <div className="text-slate-500 text-[11px] truncate mt-0.5">
                          {page.description}
                        </div>
                      </td>

                      <td className="py-2.5 px-3 align-middle">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block whitespace-nowrap ${
                            page.robots?.includes('noindex')
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {page.robots || 'index, follow'}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 align-middle whitespace-nowrap">
                        {page.faqs && page.faqs.length > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0052CC] border border-blue-200 font-bold text-[10px]">
                            {page.faqs.length} FAQs
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Global Fallback</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 align-middle text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPage({ ...page });
                              setIsCreatingPage(false);
                            }}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-[#0052CC] transition-colors"
                            title="Edit Route SEO"
                          >
                            <Edit3 size={13} />
                          </button>

                          <Link
                            href={page.path}
                            target="_blank"
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                            title="Visit Public Page"
                          >
                            <ExternalLink size={13} />
                          </Link>

                          {page.path !== '/' && (
                            <button
                              type="button"
                              onClick={() => handleDeletePage(page.id, page.path)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors"
                              title="Delete Route SEO"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredPages.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
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
            <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden animate-fade-in">
              <div className="bg-white rounded-t-2xl sm:rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-4 sm:p-5 space-y-4 max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                    {isCreatingPage ? 'Add Dynamic On-Page SEO Route' : `Configure SEO: ${editingPage.path}`}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditingPage(null)}
                    className="text-slate-400 hover:text-black font-bold text-sm p-1"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Route Path (URL)</label>
                      <input
                        type="text"
                        value={editingPage.path}
                        onChange={(e) => setEditingPage({ ...editingPage, path: e.target.value })}
                        placeholder="e.g. /products or /bulk-order"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-[#0052CC]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Internal Name</label>
                      <input
                        type="text"
                        value={editingPage.pageName}
                        onChange={(e) => setEditingPage({ ...editingPage, pageName: e.target.value })}
                        placeholder="e.g. Products Catalog"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0052CC]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-800">Meta Title</label>
                      <span className="text-[10px] text-slate-400">{editingPage.title.length} chars</span>
                    </div>
                    <input
                      type="text"
                      value={editingPage.title}
                      onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold focus:outline-none focus:border-[#0052CC]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-800">Meta Description</label>
                      <span className="text-[10px] text-slate-400">{editingPage.description.length} chars</span>
                    </div>
                    <textarea
                      rows={2}
                      value={editingPage.description}
                      onChange={(e) => setEditingPage({ ...editingPage, description: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0052CC]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Robots Directive</label>
                      <select
                        value={editingPage.robots || 'index, follow'}
                        onChange={(e: any) => setEditingPage({ ...editingPage, robots: e.target.value })}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0052CC]"
                      >
                        <option value="index, follow">index, follow (Default, Recommended)</option>
                        <option value="noindex, follow">noindex, follow</option>
                        <option value="index, nofollow">index, nofollow</option>
                        <option value="noindex, nofollow">noindex, nofollow (Block Indexing)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Custom Canonical URL (Optional)</label>
                      <input
                        type="text"
                        value={editingPage.canonicalUrl || ''}
                        onChange={(e) => setEditingPage({ ...editingPage, canonicalUrl: e.target.value })}
                        placeholder="Leave blank for default"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0052CC]"
                      />
                    </div>
                  </div>

                  {/* Google SERP Preview Box */}
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-0.5">
                    <span className="text-[9px] font-bold uppercase text-slate-400">Google SERP Snippet Preview</span>
                    <div className="text-[#1a0dab] font-medium text-xs hover:underline cursor-pointer truncate">
                      {editingPage.title || 'Page Title'}
                    </div>
                    <div className="text-[#006621] text-[10px] truncate">
                      https://cbh.store{editingPage.path}
                    </div>
                    <div className="text-[#545454] text-[11px] line-clamp-2">
                      {editingPage.description || 'Meta description will appear here...'}
                    </div>
                  </div>

                  {/* On-Page FAQs Builder */}
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs">Page-Specific FAQs Schema</h4>
                        <p className="text-[10px] text-slate-500">Rendered in &lt;head&gt; as Schema.org JSON-LD.</p>
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
                                answer: 'Answer detailing specs, tolerance, or shipping.',
                              },
                            ],
                          });
                        }}
                        className="px-2.5 py-1 bg-blue-50 text-[#0052CC] border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-blue-100"
                      >
                        <Plus size={12} /> Add FAQ
                      </button>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {(editingPage.faqs || []).map((faq, idx) => (
                        <div key={faq.id || idx} className="p-2.5 rounded-lg border border-slate-200 bg-white space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[9px] font-bold text-slate-400 uppercase">Q{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (editingPage.faqs || []).filter((_, i) => i !== idx);
                                setEditingPage({ ...editingPage, faqs: updated });
                              }}
                              className="text-rose-500 hover:text-rose-700"
                            >
                              <Trash2 size={12} />
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
                            className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md font-medium text-xs"
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
                            className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setEditingPage(null)}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSavePage(editingPage)}
                    className="px-4 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-lg text-xs font-bold"
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
          TAB 2: GLOBAL META & SOCIAL
      ========================================================================= */}
      {activeTab === 'global' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="border-b pb-3">
            <h3 className="text-sm font-bold text-slate-900">Sitewide Global Metadata &amp; Search Console</h3>
            <p className="text-xs text-slate-500">Defaults used across all pages unless specifically overridden in On-Page SEO.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Site Brand Name</label>
              <input
                type="text"
                value={config.global.siteName}
                onChange={(e) => setConfig({ ...config, global: { ...config.global, siteName: e.target.value } })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0052CC]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Canonical Base URL</label>
              <input
                type="text"
                value={config.global.canonicalBase}
                onChange={(e) => setConfig({ ...config, global: { ...config.global, canonicalBase: e.target.value } })}
                placeholder="https://cbh.store"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-[#0052CC]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-800 mb-1">Default Sitewide Title</label>
              <input
                type="text"
                value={config.global.defaultTitle}
                onChange={(e) => setConfig({ ...config, global: { ...config.global, defaultTitle: e.target.value } })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0052CC]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-800 mb-1">Default Meta Description</label>
              <textarea
                rows={2}
                value={config.global.defaultDescription}
                onChange={(e) => setConfig({ ...config, global: { ...config.global, defaultDescription: e.target.value } })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0052CC]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-800 mb-1">Default Sitewide Keywords</label>
              <input
                type="text"
                value={config.global.defaultKeywords}
                onChange={(e) => setConfig({ ...config, global: { ...config.global, defaultKeywords: e.target.value } })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0052CC]"
              />
            </div>
          </div>

          {/* Search Console Verification */}
          <div className="border-t pt-4">
            <h4 className="font-bold text-slate-800 mb-2 text-xs uppercase tracking-wider text-slate-500">
              Webmaster Verification Tags
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Google Search Console Token</label>
                <input
                  type="text"
                  value={config.global.googleVerification}
                  onChange={(e) => setConfig({ ...config, global: { ...config.global, googleVerification: e.target.value } })}
                  placeholder="google-site-verification token"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Bing Webmaster (msvalidate.01)</label>
                <input
                  type="text"
                  value={config.global.bingVerification}
                  onChange={(e) => setConfig({ ...config, global: { ...config.global, bingVerification: e.target.value } })}
                  placeholder="Bing verification code"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs focus:outline-none focus:border-[#0052CC]"
                />
              </div>
            </div>
          </div>

          {/* Social & OpenGraph */}
          <div className="border-t pt-4">
            <h4 className="font-bold text-slate-800 mb-2 text-xs uppercase tracking-wider text-slate-500">
              Social Sharing &amp; OpenGraph
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Twitter / X Handle</label>
                <input
                  type="text"
                  value={config.global.twitterHandle}
                  onChange={(e) => setConfig({ ...config, global: { ...config.global, twitterHandle: e.target.value } })}
                  placeholder="@cbhfasteners"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">OpenGraph Image Path</label>
                <input
                  type="text"
                  value={config.global.ogImage}
                  onChange={(e) => setConfig({ ...config, global: { ...config.global, ogImage: e.target.value } })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Theme Color</label>
                <input
                  type="text"
                  value={config.global.themeColor}
                  onChange={(e) => setConfig({ ...config, global: { ...config.global, themeColor: e.target.value } })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs focus:outline-none focus:border-[#0052CC]"
                />
              </div>
            </div>
          </div>

          {/* Raw Custom Head Script Injection */}
          <div className="border-t pt-4 space-y-1.5">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-500">
              Custom &lt;head&gt; Raw Code / Scripts
            </h4>
            <textarea
              rows={3}
              value={config.global.customHeadTags}
              onChange={(e) => setConfig({ ...config, global: { ...config.global, customHeadTags: e.target.value } })}
              placeholder="<!-- Google Analytics / Meta Tags -->"
              className="w-full p-2.5 bg-slate-900 text-emerald-400 font-mono text-xs rounded-lg focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: FAQS SCHEMA MANAGER
      ========================================================================= */}
      {activeTab === 'faqs' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Sitewide Global FAQs Schema.org Builder</h3>
              <p className="text-xs text-slate-500">
                Converted to <code className="font-mono text-[#0052CC]">application/ld+json</code> FAQPage in HTML &lt;head&gt;.
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
                        answer: 'Standard Grade 8.8 and 10.9 fasteners ship in 24 to 48 hours.',
                      },
                    ],
                  },
                });
              }}
              className="px-3 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0"
            >
              <Plus size={13} /> Add Global FAQ
            </button>
          </div>

          <div className="space-y-3">
            {(config.global.globalFaqs || []).map((faq, idx) => (
              <div key={faq.id || idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Question #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (config.global.globalFaqs || []).filter((_, i) => i !== idx);
                      setConfig({ ...config, global: { ...config.global, globalFaqs: updated } });
                    }}
                    className="p-1 text-rose-500 hover:text-rose-700"
                  >
                    <Trash2 size={13} />
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
                  className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-900"
                />
                <textarea
                  rows={2}
                  value={faq.answer}
                  onChange={(e) => {
                    const updated = [...(config.global.globalFaqs || [])];
                    updated[idx].answer = e.target.value;
                    setConfig({ ...config, global: { ...config.global, globalFaqs: updated } });
                  }}
                  className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: ROBOTS.TXT EDITOR
      ========================================================================= */}
      {activeTab === 'robots' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Robots.txt Directives Editor</h3>
              <p className="text-xs text-slate-500">Live dynamic endpoint served at <code className="font-mono text-[#0052CC]">/robots.txt</code>.</p>
            </div>
            <a
              href="/robots.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1 hover:bg-slate-50 self-start sm:self-auto shrink-0"
            >
              <span>Test Live /robots.txt</span>
              <ExternalLink size={11} />
            </a>
          </div>

          <div>
            <textarea
              rows={12}
              value={config.robots?.content || ''}
              onChange={(e) => setConfig({ ...config, robots: { ...config.robots, content: e.target.value } })}
              className="w-full p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-lg focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: SITEMAP.XML MANAGER
      ========================================================================= */}
      {activeTab === 'sitemap' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Dynamic XML Sitemap Generator</h3>
              <p className="text-xs text-slate-500">Served live at <code className="font-mono text-[#0052CC]">/sitemap.xml</code>.</p>
            </div>
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1 hover:bg-slate-50 self-start sm:self-auto shrink-0"
            >
              <span>Test Live /sitemap.xml</span>
              <ExternalLink size={11} />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold">
            <label className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer">
              <span>Automatically Include Fastener Products</span>
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

            <label className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer">
              <span>Automatically Include Fastener Categories</span>
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
          <div className="border-t pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-500">
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
                className="px-2.5 py-1 bg-blue-50 text-[#0052CC] border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <Plus size={11} /> Add URL
              </button>
            </div>

            <div className="space-y-1.5">
              {(config.sitemap?.additionalUrls || []).map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                  <input
                    type="text"
                    value={item.url}
                    onChange={(e) => {
                      const updated = [...(config.sitemap?.additionalUrls || [])];
                      updated[idx].url = e.target.value;
                      setConfig({ ...config, sitemap: { ...config.sitemap, additionalUrls: updated } });
                    }}
                    className="w-full sm:flex-1 px-2.5 py-1 bg-white border border-slate-200 rounded-md font-mono text-xs"
                    placeholder="URL"
                  />
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                      value={item.changefreq}
                      onChange={(e: any) => {
                        const updated = [...(config.sitemap?.additionalUrls || [])];
                        updated[idx].changefreq = e.target.value;
                        setConfig({ ...config, sitemap: { ...config.sitemap, additionalUrls: updated } });
                      }}
                      className="px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-semibold flex-1 sm:flex-initial"
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
                      className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-semibold text-center"
                      placeholder="Pri"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (config.sitemap?.additionalUrls || []).filter((_, i) => i !== idx);
                        setConfig({ ...config, sitemap: { ...config.sitemap, additionalUrls: updated } });
                      }}
                      className="p-1 text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: LLMS.TXT (AI SEARCH CRAWLERS)
      ========================================================================= */}
      {activeTab === 'llms' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">llms.txt AI Specification</h3>
              <p className="text-xs text-slate-500">
                Specification for feeding markdown-structured catalog data to AI spiders (Claude, GPT, Gemini).
              </p>
            </div>
            <a
              href="/llms.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1 hover:bg-slate-50 self-start sm:self-auto shrink-0"
            >
              <span>Test Live /llms.txt</span>
              <ExternalLink size={11} />
            </a>
          </div>

          <div>
            <textarea
              rows={14}
              value={config.llms?.content || ''}
              onChange={(e) => setConfig({ ...config, llms: { ...config.llms, content: e.target.value } })}
              className="w-full p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-lg focus:outline-none leading-relaxed"
            />
          </div>
        </div>
      )}
    </div>
  );
}
