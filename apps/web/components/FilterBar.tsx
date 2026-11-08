'use client';

import React from 'react';
import { Search, Filter, X } from 'lucide-react';
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
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs mb-6 space-y-3.5">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            id="item-search"
            name="item-search"
            aria-label="Search lost and found items"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Search keywords (e.g., 'Dell laptop', 'brown wallet', 'keys')..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-slate-50/50"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => setFilters({ ...filters, search: '' })}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Type Toggle */}
        <div
          role="radiogroup"
          aria-label="Filter by report type"
          className="inline-flex bg-slate-100 p-1 rounded-xl self-start sm:self-auto shrink-0"
        >
          <button
            type="button"
            role="radio"
            aria-checked={filters.type === 'all'}
            onClick={() => setFilters({ ...filters, type: 'all' })}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              filters.type === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Reports
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={filters.type === 'lost'}
            onClick={() => setFilters({ ...filters, type: 'lost' })}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              filters.type === 'lost' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-rose-600'
            }`}
          >
            Lost Items
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={filters.type === 'found'}
            onClick={() => setFilters({ ...filters, type: 'found' })}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              filters.type === 'found' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-emerald-600'
            }`}
          >
            Found Items
          </button>
        </div>
      </div>

      {/* Dropdown Filters */}
      <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 font-semibold mr-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        <select
          aria-label="Filter by category"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:border-blue-500"
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
          className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:border-blue-500"
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
          className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:border-blue-500"
        >
          <option value="">Status: Open & Pending</option>
          <option value="OPEN">Open Only</option>
          <option value="CLAIM_PENDING">Claim Pending</option>
          <option value="RETURNED">Returned Items</option>
        </select>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="ml-auto text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 hover:underline py-1"
          >
            <X className="w-3.5 h-3.5" />
            Clear filters ({activeCount})
          </button>
        )}
      </div>
    </div>
  );
}
