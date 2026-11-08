'use client';

import React, { useState } from 'react';
import { Search, Bookmark, Lock, Sparkles, ArrowRight, CheckCircle2, Clock, MapPin, Tag } from 'lucide-react';
import { formatTimeAgo, getCategoryLabel } from '../lib/api';

export default function SavedForLaterView({
  items,
  onOpenMatches,
  onOpenClaim,
}: {
  items: any[];
  onOpenMatches: (item: any) => void;
  onOpenClaim: (item: any) => void;
}) {
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [query, setQuery] = useState('');

  const collections = [
    { id: 'all', name: 'All Saved Items', count: items.length },
    { id: 'electronics', name: 'Electronics & Gadgets', count: items.filter((i) => i.category === 'electronics').length },
    { id: 'wallets_bags', name: 'Wallets & Bags', count: items.filter((i) => i.category === 'wallets_bags').length },
    { id: 'id_cards', name: 'ID Cards & Badges', count: items.filter((i) => i.category === 'id_cards').length },
    { id: 'library', name: 'Central Library Area', count: items.filter((i) => i.zone === 'library').length },
  ];

  const filtered = items.filter((item) => {
    if (selectedCollection !== 'all') {
      if (selectedCollection === 'library' && item.zone !== 'library') return false;
      if (selectedCollection !== 'library' && item.category !== selectedCollection) return false;
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.campusArea.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Pastel theme mapping from Dashboard V22 video
  const getCardStyle = (category: string) => {
    switch (category) {
      case 'electronics':
        return 'bg-gradient-to-br from-emerald-50 to-teal-50/60 border-emerald-200/60';
      case 'wallets_bags':
        return 'bg-gradient-to-br from-amber-50 to-orange-50/60 border-amber-200/60';
      case 'id_cards':
        return 'bg-gradient-to-br from-blue-50 to-indigo-50/60 border-blue-200/60';
      default:
        return 'bg-gradient-to-br from-purple-50 to-pink-50/60 border-purple-200/60';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left/Center: Cards Grid */}
      <div className="lg:col-span-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Saved for later</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Items you are tracking across campus with active Match Radar alerts.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter saved reports..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs focus:border-emerald-500 outline-none"
            />
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-3xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between ${getCardStyle(
                item.category
              )}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 shadow-2xs text-slate-800">
                    {getCategoryLabel(item.category)}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      item.type === 'LOST' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.type}
                  </span>
                </div>

                <div className="relative aspect-16/9 rounded-2xl overflow-hidden bg-white/50 mb-3 shadow-inner">
                  {item.photoUrl ? (
                    <img src={item.photoUrl} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">
                      {item.type === 'LOST' ? '🔍' : '📍'}
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{item.title}</h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate font-medium">{item.campusArea}</span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Actions Footer */}
              <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onOpenMatches(item)}
                  className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Match Radar</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenClaim(item)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
                >
                  <span>Verify Claim</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Drawer: Collections */}
      <div className="lg:col-span-4 space-y-4">
        <div className="glass-card p-5 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-emerald-600" />
              <span>Collections</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400">{collections.length} groups</span>
          </div>

          <div className="space-y-1.5">
            {collections.map((col) => (
              <button
                key={col.id}
                type="button"
                onClick={() => setSelectedCollection(col.id)}
                className={`w-full p-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between transition ${
                  selectedCollection === col.id
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{col.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${selectedCollection === col.id ? 'bg-slate-950 text-white font-bold' : 'bg-slate-100 text-slate-500'}`}>
                  {col.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Private Proof Guarantee Pill */}
        <div className="p-4 rounded-3xl bg-slate-900 text-white text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-emerald-400">
            <Lock className="w-4 h-4" />
            <span>Private Proof Shield</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            All private proof answers (serial numbers, engraving, wallpapers) remain shielded until approved by the item poster or proctor.
          </p>
        </div>
      </div>
    </div>
  );
}
