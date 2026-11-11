'use client';

import React from 'react';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import { CATEGORIES, CAMPUS_ZONES } from '../lib/api';

export default function FilterBar({
  filters,
  setFilters,
  onReset,
}: {
  filters: any;
  setFilters: (f: any) => void;
  onReset: () => void;
}) {
  const activeCount =
    (filters.type !== 'all' ? 1 : 0) +
    (filters.category ? 1 : 0) +
    (filters.zone ? 1 : 0) +
    (filters.search ? 1 : 0);

  return (
    <div className="bg-white rounded-xl border border-neutral-200/80 p-4 mb-6 space-y-3.5 shadow-2xs">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Type Toggle - Foundry High-Contrast Pills */}
        <div
          role="radiogroup"
          aria-label="Filter by report type"
          className="inline-flex bg-neutral-100 p-1 rounded-full self-start sm:self-auto shrink-0 border border-neutral-200/60"
        >
          <button
            type="button"
            role="radio"
            aria-checked={filters.type === 'all'}
            onClick={() => setFilters({ ...filters, type: 'all' })}
            className={`px-4 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider transition ${
              filters.type === 'all'
                ? 'bg-foundry-900 text-white shadow-2xs'
                : 'text-neutral-600 hover:text-foundry-900'
            }`}
          >
            All Exhibits
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={filters.type === 'lost'}
            onClick={() => setFilters({ ...filters, type: 'lost' })}
            className={`px-4 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider transition ${
              filters.type === 'lost'
                ? 'bg-rose-700 text-white shadow-2xs'
                : 'text-neutral-600 hover:text-rose-700'
            }`}
          >
            Lost Only
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={filters.type === 'found'}
            onClick={() => setFilters({ ...filters, type: 'found' })}
            className={`px-4 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider transition ${
              filters.type === 'found'
                ? 'bg-foundry-900 text-white shadow-2xs'
                : 'text-neutral-600 hover:text-foundry-900'
            }`}
          >
            Found Only
          </button>
        </div>

        {/* Minimalist Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            id="item-search"
            name="item-search"
            aria-label="Search lost and found items"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Search catalog by title, brand, or description..."
            className="w-full pl-9 pr-9 py-1.5 rounded-full border border-neutral-200 text-xs focus:border-foundry-900 transition bg-neutral-50/50 outline-none"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => setFilters({ ...filters, search: '' })}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-foundry-900"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown Filters (Architectural Hairline Line) */}
      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-neutral-100 text-xs">
        <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] uppercase tracking-wider font-semibold mr-1">
          <SlidersHorizontal className="w-3 h-3" />
          <span>Refine:</span>
        </div>

        <select
          aria-label="Filter by category"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1 text-[11px] text-neutral-700 font-medium focus:border-foundry-900 outline-none"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by campus zone"
          value={filters.zone}
          onChange={(e) => setFilters({ ...filters, zone: e.target.value })}
          className="bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1 text-[11px] text-neutral-700 font-medium focus:border-foundry-900 outline-none"
        >
          <option value="">All Campus Zones</option>
          {CAMPUS_ZONES.map((z) => (
            <option key={z.id} value={z.id}>
              {z.name}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by status"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1 text-[11px] text-neutral-700 font-medium focus:border-foundry-900 outline-none"
        >
          <option value="">Status: Open &amp; Pending</option>
          <option value="OPEN">Open Only</option>
          <option value="CLAIM_PENDING">Claim Pending</option>
          <option value="RETURNED">Returned Items</option>
        </select>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="ml-auto text-[10px] uppercase tracking-wider text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 hover:underline py-1"
          >
            <X className="w-3 h-3" />
            Reset ({activeCount})
          </button>
        )}
      </div>
    </div>
  );
}
