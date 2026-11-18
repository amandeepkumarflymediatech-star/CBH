'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronRight,
  ArrowRight,
  LayoutGrid,
  Hexagon,
  Wrench,
  ShieldCheck,
  Layers,
  Anchor,
  Flame,
  CircleDot,
  Disc,
  Home as HomeIcon,
  Lock,
  Package,
} from 'lucide-react';
import {
  NAVIGATION_CATEGORIES,
  NavCategoryItem,
} from '@/data/navigation-categories';

function renderIcon(iconName: string, className = 'w-4 h-4') {
  switch (iconName) {
    case 'Hexagon':
      return <Hexagon className={className} />;
    case 'Bolt':
      return <Package className={className} />;
    case 'Wrench':
      return <Wrench className={className} />;
    case 'ShieldCheck':
      return <ShieldCheck className={className} />;
    case 'Layers':
      return <Layers className={className} />;
    case 'Anchor':
      return <Anchor className={className} />;
    case 'Flame':
      return <Flame className={className} />;
    case 'CircleDot':
      return <CircleDot className={className} />;
    case 'Disc':
      return <Disc className={className} />;
    case 'Home':
      return <HomeIcon className={className} />;
    case 'Lock':
      return <Lock className={className} />;
    default:
      return <Hexagon className={className} />;
  }
}

interface MobileCategoriesAccordionProps {
  onCloseDrawer: () => void;
}

export default function MobileCategoriesAccordion({
  onCloseDrawer,
}: MobileCategoriesAccordionProps) {
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);

  const toggleCategory = (id: string) => {
    setExpandedCategoryId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-1.5 my-1">
      {NAVIGATION_CATEGORIES.map((cat) => {
        const isExpanded = expandedCategoryId === cat.id;

        return (
          <div
            key={cat.id}
            className={`rounded-xl border transition-all overflow-hidden ${
              isExpanded
                ? 'border-blue-400 bg-blue-50/30 shadow-xs'
                : 'border-slate-200/90 bg-white hover:border-slate-300'
            }`}
          >
            {/* Category Header Row (Tap to expand subcategories) */}
            <button
              type="button"
              onClick={() => toggleCategory(cat.id)}
              className="w-full flex items-center justify-between p-2.5 text-left cursor-pointer transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isExpanded
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  {renderIcon(cat.iconName, 'w-3.5 h-3.5')}
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-slate-900 leading-tight truncate">
                    {cat.name}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {cat.badge && (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {cat.badge}
                  </span>
                )}
                <ChevronDown
                  size={15}
                  className={`text-slate-400 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180 text-blue-600' : ''
                  }`}
                />
              </div>
            </button>

            {/* Expanded Subcategories Accordion Panel */}
            {isExpanded && (
              <div className="p-2 pt-1.5 space-y-1.5 bg-slate-50/90 border-t border-blue-100">
                {cat.subcategories.map((sub) => (
                  <Link
                    key={sub.id}
                    href={sub.href}
                    onClick={onCloseDrawer}
                    className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-blue-400 text-slate-800 hover:text-blue-700 text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="leading-snug break-words">{sub.name}</span>
                      {sub.specBadge && (
                        <span className="text-[9.5px] text-blue-600 font-mono mt-0.5 font-bold">
                          {sub.specBadge}
                        </span>
                      )}
                    </div>
                    <ArrowRight size={13} className="text-slate-400 shrink-0" />
                  </Link>
                ))}

                {/* Direct Link to Category Catalog */}
                <Link
                  href={cat.href}
                  onClick={onCloseDrawer}
                  className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition-colors mt-2"
                >
                  <span>View All {cat.shortName} Catalog</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
