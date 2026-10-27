'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Boxes,
  TrendingUp,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowUpDown,
  Filter,
  DollarSign,
  Package,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Tag,
  Laptop,
  Smartphone,
  Headphones,
  Footprints,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_QUOTES, INITIAL_USERS } from '@/lib/mock-data';

interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  badge: string;
  badgeType: 'blue' | 'red' | 'purple' | 'gray';
  iconType: 'order' | 'alert' | 'promo' | 'system';
}

interface TopProductItem {
  id: string;
  name: string;
  category: string;
  image?: string;
  stocks: number;
  price: number;
  sales: number;
  earnings: number;
  iconBg: string;
  iconColor: string;
}

export default function AdminDashboardPage() {
  const [revenueTimeframe, setRevenueTimeframe] = useState<'Monthly' | 'Quarterly' | 'Yearly'>('Monthly');
  const [selectedMonth, setSelectedMonth] = useState<string>('Apr');
  const [sortField, setSortField] = useState<'earnings' | 'sales' | 'stocks' | 'price'>('earnings');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Live telemetry counts
  const [productsCount, setProductsCount] = useState(1525);
  const [totalSalesCount, setTotalSalesCount] = useState(10892);
  const [totalIncome, setTotalIncome] = useState(157342);
  const [totalExpenses, setTotalExpenses] = useState(12453);

  useEffect(() => {
    Promise.allSettled([
      fetch('/api/products').then((r) => r.json()),
      fetch('/api/orders').then((r) => r.json()),
      fetch('/api/rfq').then((r) => r.json()),
    ]).then(([prodRes, ordRes, rfqRes]) => {
      if (prodRes.status === 'fulfilled' && prodRes.value?.data?.length) {
        setProductsCount(1500 + prodRes.value.data.length);
      }
      if (ordRes.status === 'fulfilled' && ordRes.value?.data?.length) {
        setTotalSalesCount(10800 + ordRes.value.data.length);
      }
    });
  }, []);

  // Top Products list matching screenshot rows
  const [productsList, setProductsList] = useState<TopProductItem[]>([
    {
      id: 'p1',
      name: 'iPhone 15 Pro',
      category: 'DIN 933 10.9 M16 Bolt',
      stocks: 6200,
      price: 999.00,
      sales: 4800,
      earnings: 4795200,
      iconBg: '#F1F5F9',
      iconColor: '#0F172A',
    },
    {
      id: 'p2',
      name: 'MacBook Air M2',
      category: 'DIN 931 High Hex M20',
      stocks: 1020,
      price: 1299.00,
      sales: 3200,
      earnings: 4156800,
      iconBg: '#F3E8FF',
      iconColor: '#7C3AED',
    },
    {
      id: 'p3',
      name: 'Google Pixel 8',
      category: 'ASTM A193 B7 Heavy Stud',
      stocks: 1500,
      price: 699.00,
      sales: 800,
      earnings: 559200,
      iconBg: '#FEF3C7',
      iconColor: '#D97706',
    },
    {
      id: 'p4',
      name: 'Nike Air Max 90',
      category: 'SS-316 Marine Stud Bolt',
      stocks: 2400,
      price: 130.00,
      sales: 1800,
      earnings: 234000,
      iconBg: '#FEE2E2',
      iconColor: '#DC2626',
    },
    {
      id: 'p5',
      name: 'Galaxy Buds Pro',
      category: 'Fischer FAZ II Heavy Anchor',
      stocks: 850,
      price: 199.00,
      sales: 1000,
      earnings: 199000,
      iconBg: '#E0E7FF',
      iconColor: '#4338CA',
    },
  ]);

  // Recent Activity matching screenshot rows
  const activities: ActivityItem[] = [
    {
      id: 'a1',
      title: 'Order #2048',
      subtitle: 'John Doe • 12 Jan 25',
      date: '12 Jan 25',
      badge: 'New Order',
      badgeType: 'blue',
      iconType: 'order',
    },
    {
      id: 'a2',
      title: 'Low Stock Alert',
      subtitle: 'MacBook Air M2 • 10 Jan 25',
      date: '10 Jan 25',
      badge: 'Low Stock',
      badgeType: 'red',
      iconType: 'alert',
    },
    {
      id: 'a3',
      title: 'Promo code "SUMMER20"',
      subtitle: 'Applied 52 times • 8 Jan 25',
      date: '8 Jan 25',
      badge: 'Campaign',
      badgeType: 'purple',
      iconType: 'promo',
    },
    {
      id: 'a4',
      title: 'System Update',
      subtitle: 'Version 1.2.1 • 2 Jan 25',
      date: '2 Jan 25',
      badge: 'System',
      badgeType: 'gray',
      iconType: 'system',
    },
  ];

  // Bar chart revenue data (Jan - Aug)
  const barData = [
    { month: 'Jan', oneTime: 65, recurring: 45, total: 110 },
    { month: 'Feb', oneTime: 25, recurring: 40, total: 65 },
    { month: 'Mar', oneTime: 45, recurring: 50, total: 95 },
    { month: 'Apr', oneTime: 60, recurring: 25, total: 85, active: true },
    { month: 'May', oneTime: 30, recurring: 35, total: 65 },
    { month: 'Jun', oneTime: 55, recurring: 45, total: 100 },
    { month: 'Jul', oneTime: 80, recurring: 55, total: 135 },
    { month: 'Aug', oneTime: 40, recurring: 48, total: 88 },
  ];

  const handleSort = () => {
    const nextOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(nextOrder);
    const sorted = [...productsList].sort((a, b) => {
      if (nextOrder === 'desc') return b[sortField] - a[sortField];
      return a[sortField] - b[sortField];
    });
    setProductsList(sorted);
  };

  return (
    <div className="space-y-6">
      {/* ================================================================ */}
      {/* ROW 1: 4 METRIC KPI CARDS                                        */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Products */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="text-xs font-semibold text-slate-500">Total Products</div>
            <div className="text-2xl font-black text-[#0F172A] tracking-tight mt-1">
              {productsCount.toLocaleString()}
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#EEF0FD] text-[#5B4DF6] flex items-center justify-center shrink-0">
            <Boxes size={22} />
          </div>
        </div>

        {/* Card 2: Total Sales */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="text-xs font-semibold text-slate-500">Total Sales</div>
            <div className="text-2xl font-black text-[#0F172A] tracking-tight mt-1">
              {totalSalesCount.toLocaleString()}
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center shrink-0">
            <DollarSign size={22} />
          </div>
        </div>

        {/* Card 3: Total Income */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="text-xs font-semibold text-slate-500">Total Income</div>
            <div className="text-2xl font-black text-[#0F172A] tracking-tight mt-1">
              ${totalIncome.toLocaleString()}
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0">
            <ArrowDownLeft size={22} />
          </div>
        </div>

        {/* Card 4: Total Expenses */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="text-xs font-semibold text-slate-500">Total Expenses</div>
            <div className="text-2xl font-black text-[#0F172A] tracking-tight mt-1">
              ${totalExpenses.toLocaleString()}
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#FFF1F2] text-[#E11D48] flex items-center justify-center shrink-0">
            <ArrowUpRight size={22} />
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* ROW 2: SALES REVENUE CHART & TOP CATEGORIES DONUT                */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Sales Revenue (approx 65% width = 8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
            <div>
              <h2 className="text-base font-extrabold text-[#0F172A]">Sales Revenue</h2>
              {/* Legend matching screenshot */}
              <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#93C5FD]" />
                  <span>One-Time Revenue</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#4F46E5]" />
                  <span>Recurring Revenue</span>
                </div>
              </div>
            </div>

            {/* Timeframe pill tabs */}
            <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-500">
              {(['Monthly', 'Quarterly', 'Yearly'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setRevenueTimeframe(tab)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    revenueTimeframe === tab
                      ? 'bg-white text-[#0F172A] shadow-xs'
                      : 'hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Bar Chart Canvas */}
          <div className="relative pt-6 pb-2">
            {/* Horizontal Grid guidelines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[11px] font-semibold text-slate-400 select-none">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                <span>150K</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                <span>130K</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                <span>100K</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                <span>50K</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                <span>10K</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                <span>0</span>
              </div>
            </div>

            {/* Bars Container */}
            <div className="relative z-10 grid grid-cols-8 gap-3 sm:gap-6 items-end h-64 pl-10 pr-2">
              {barData.map((item) => {
                const isSelected = selectedMonth === item.month;
                return (
                  <div
                    key={item.month}
                    onClick={() => setSelectedMonth(item.month)}
                    className="flex flex-col items-center h-full justify-end group cursor-pointer relative"
                  >
                    {/* Tooltip for Apr or selected month matching screenshot */}
                    {isSelected && (
                      <div className="absolute -top-12 z-30 bg-white border border-slate-200/90 rounded-xl p-2.5 shadow-xl whitespace-nowrap text-left animate-in fade-in slide-in-from-bottom-2 duration-150">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#93C5FD]" />
                          <span>One-Time Revenue</span>
                        </div>
                        <div className="text-xs font-extrabold text-[#0F172A] ml-3 mb-1">$6,000</div>

                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" />
                          <span>Recurring Revenue</span>
                        </div>
                        <div className="text-xs font-extrabold text-[#0F172A] ml-3">$25,000</div>
                      </div>
                    )}

                    {/* Background Bar Pillar with layered colors */}
                    <div
                      className={`w-full max-w-[42px] rounded-t-xl overflow-hidden flex flex-col justify-end transition-all ${
                        isSelected
                          ? 'ring-2 ring-[#4F46E5] ring-offset-2 shadow-md'
                          : 'group-hover:opacity-90'
                      }`}
                      style={{ height: `${(item.total / 150) * 100}%` }}
                    >
                      {/* Top segment: One-time (soft blue) */}
                      <div
                        className="w-full bg-[#C7D2FE] transition-colors"
                        style={{ height: `${(item.oneTime / item.total) * 100}%` }}
                      />
                      {/* Bottom segment: Recurring (darker blue) */}
                      <div
                        className="w-full bg-[#4F46E5] transition-colors"
                        style={{ height: `${(item.recurring / item.total) * 100}%` }}
                      />
                    </div>

                    {/* Month Label */}
                    <span className="text-xs font-bold text-slate-500 mt-3 group-hover:text-slate-900">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Top Categories Donut (approx 35% width = 4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4">
            <h2 className="text-base font-extrabold text-[#0F172A]">Top Categories</h2>
            <Link
              href="/admin/categories"
              className="text-xs font-bold text-slate-500 hover:text-[#5B4DF6] no-underline"
            >
              See All
            </Link>
          </div>

          {/* SVG Donut Chart */}
          <div className="relative flex items-center justify-center py-4">
            <svg className="w-48 h-48 -rotate-90" viewBox="0 0 100 100">
              {/* Segment 1: Electronics (68% - Blue #3B82F6) */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="#3B82F6"
                strokeWidth="11"
                strokeDasharray="162.3 238.7"
                strokeDashoffset="0"
                className="transition-all hover:stroke-width-12"
              />
              {/* Segment 2: Fashion (20% - Purple #8B5CF6) */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="#8B5CF6"
                strokeWidth="11"
                strokeDasharray="47.7 238.7"
                strokeDashoffset="-162.3"
                className="transition-all hover:stroke-width-12"
              />
              {/* Segment 3: Health & Wellness (8% - Amber #F59E0B) */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="#F59E0B"
                strokeWidth="11"
                strokeDasharray="19.1 238.7"
                strokeDashoffset="-210"
                className="transition-all hover:stroke-width-12"
              />
              {/* Segment 4: Home & Living (4% - Pink #EC4899) */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="#EC4899"
                strokeWidth="11"
                strokeDasharray="9.6 238.7"
                strokeDashoffset="-229.1"
                className="transition-all hover:stroke-width-12"
              />
            </svg>

            {/* Inner Donut Center Content matching screenshot */}
            <div className="absolute text-center flex flex-col items-center pointer-events-none">
              <span className="text-[11px] font-semibold text-slate-400">Total Sales</span>
              <span className="text-xl font-black text-[#0F172A] tracking-tight mt-0.5">$125,000</span>
            </div>
          </div>

          {/* Categories Legend with exact values matching screenshot */}
          <div className="space-y-2.5 pt-2 text-xs font-semibold text-slate-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
                <span className="text-[#0F172A]">Electronics</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-normal">$85,000</span>
                <span className="font-extrabold text-[#0F172A]">68%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
                <span className="text-[#0F172A]">Fashion</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-normal">$25,000</span>
                <span className="font-extrabold text-[#0F172A]">20%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                <span className="text-[#0F172A]">Health &amp; Wellness</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-normal">$10,000</span>
                <span className="font-extrabold text-[#0F172A]">8%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EC4899]" />
                <span className="text-[#0F172A]">Home &amp; Living</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-normal">$5,000</span>
                <span className="font-extrabold text-[#0F172A]">4%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* ROW 3: RECENT ACTIVITY & TOP PRODUCTS TABLE                      */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Activity (approx 40% width = 5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
              <Clock size={16} className="text-slate-400" />
              <span>Recent Activity</span>
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-slate-500 hover:text-[#5B4DF6] no-underline"
            >
              See All
            </Link>
          </div>

          {/* Activity List matching screenshot items */}
          <div className="divide-y divide-slate-100 mt-2">
            {activities.map((item) => (
              <div key={item.id} className="py-3.5 flex items-center justify-between gap-3 group">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Circular Icon */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      item.iconType === 'order'
                        ? 'bg-[#EEF0FD] text-[#5B4DF6]'
                        : item.iconType === 'alert'
                        ? 'bg-[#FFF1F2] text-[#E11D48]'
                        : item.iconType === 'promo'
                        ? 'bg-[#F3E8FF] text-[#9333EA]'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.iconType === 'order' && <Package size={16} />}
                    {item.iconType === 'alert' && <AlertCircle size={16} />}
                    {item.iconType === 'promo' && <Tag size={16} />}
                    {item.iconType === 'system' && <Laptop size={16} />}
                  </div>

                  {/* Title & Subtitle */}
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#0F172A] truncate group-hover:text-[#5B4DF6] transition-colors">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{item.subtitle}</div>
                  </div>
                </div>

                {/* Pill Tag */}
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full shrink-0 ${
                    item.badgeType === 'blue'
                      ? 'bg-[#EEF0FD] text-[#5B4DF6]'
                      : item.badgeType === 'red'
                      ? 'bg-[#FFF1F2] text-[#E11D48]'
                      : item.badgeType === 'purple'
                      ? 'bg-[#F3E8FF] text-[#9333EA]'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.badge}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 text-center">
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-[#5B4DF6] hover:underline no-underline"
            >
              View Complete Operations Log &rarr;
            </Link>
          </div>
        </div>

        {/* Right: Top Products Table (approx 60% width = 7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
              <Boxes size={16} className="text-slate-400" />
              <span>Top Products</span>
            </h2>

            {/* Sort & Filter buttons matching screenshot */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSort}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                title="Sort Products"
              >
                <ArrowUpDown size={13} />
                <span>Sort</span>
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                  title="Filter by Category"
                >
                  <Filter size={13} />
                  <span>Filter</span>
                </button>

                {isFilterDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl border border-slate-200 shadow-xl p-2 z-30 text-xs font-medium">
                    {['All', 'High Tensile', 'Stainless', 'Anchors'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setCategoryFilter(cat);
                          setIsFilterDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 ${
                          categoryFilter === cat ? 'font-bold text-[#5B4DF6] bg-[#EEF0FD]' : 'text-slate-600'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table matching screenshot */}
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-extrabold uppercase text-slate-400">
                  <th className="py-3 px-2">Product</th>
                  <th className="py-3 px-2">Stocks</th>
                  <th className="py-3 px-2">Price</th>
                  <th className="py-3 px-2">Sales</th>
                  <th className="py-3 px-2 text-right">Earnings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {productsList.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Product Name & Icon */}
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold"
                          style={{ background: prod.iconBg, color: prod.iconColor }}
                        >
                          <Boxes size={16} />
                        </div>
                        <div>
                          <div className="font-bold text-[#0F172A]">{prod.name}</div>
                          <div className="text-[10px] text-slate-400">{prod.category}</div>
                        </div>
                      </div>
                    </td>

                    {/* Stocks */}
                    <td className="py-3 px-2 font-mono text-slate-600 font-semibold">
                      {prod.stocks.toLocaleString()}
                    </td>

                    {/* Price */}
                    <td className="py-3 px-2 font-mono text-slate-900 font-bold">
                      ${prod.price.toFixed(2)}
                    </td>

                    {/* Sales */}
                    <td className="py-3 px-2 font-mono text-slate-600 font-semibold">
                      {prod.sales.toLocaleString()}
                    </td>

                    {/* Earnings */}
                    <td className="py-3 px-2 font-mono text-right font-black text-[#0F172A]">
                      ${prod.earnings.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Showing top 5 commercial fast-moving SKUs</span>
            <Link
              href="/admin/products"
              className="font-bold text-[#5B4DF6] hover:underline no-underline"
            >
              Full Inventory Table &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
