'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  PlusCircle,
  ShieldCheck,
  RefreshCw,
  HelpCircle,
  Zap,
  ArrowRight,
  TrendingUp,
  Package,
  Layers,
  LayoutGrid,
  Bookmark,
  UserCheck,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import ItemCard from '../components/ItemCard';
import FilterBar from '../components/FilterBar';
import MatchRadarModal from '../components/MatchRadarModal';
import PrivateClaimModal from '../components/PrivateClaimModal';
import FlagPostModal from '../components/FlagPostModal';
import DashboardHero from '../components/DashboardHero';
import StatsCard from '../components/StatsCard';
import CalendarWidget from '../components/CalendarWidget';
import SavedForLaterView from '../components/SavedForLaterView';
import ProfileFocusView from '../components/ProfileFocusView';
import { apiRequest, formatTimeAgo, getCategoryLabel } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, openLoginModal } = useAuth();

  // Active Tab: 'overview' | 'feed' | 'saved' | 'profile'
  const [activeTab, setActiveTab] = useState<'overview' | 'feed' | 'saved' | 'profile'>('overview');

  const [items, setItems] = useState<any[]>([]);
  const [highlights, setHighlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Modals
  const [activeRadarItem, setActiveRadarItem] = useState<any | null>(null);
  const [activeClaimItem, setActiveClaimItem] = useState<any | null>(null);
  const [activeFlagItem, setActiveFlagItem] = useState<any | null>(null);

  const [filters, setFilters] = useState({
    type: 'all',
    category: '',
    zone: '',
    status: '',
    search: '',
  });

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filters.type !== 'all') params.append('type', filters.type);
      if (filters.category) params.append('category', filters.category);
      if (filters.zone) params.append('zone', filters.zone);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const data = await apiRequest(`/items?${params.toString()}`);
      setItems(data.items || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchHighlights = async () => {
    try {
      const data = await apiRequest('/matches/dashboard/highlights');
      setHighlights(data.highlights || []);
    } catch (e) {}
  };

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    fetchHighlights();
  }, []);

  const resetFilters = () => {
    setFilters({
      type: 'all',
      category: '',
      zone: '',
      status: '',
      search: '',
    });
  };

  const lostCount = items.filter((i) => i.type === 'LOST' && i.status === 'OPEN').length;
  const foundCount = items.filter((i) => i.type === 'FOUND' && i.status === 'OPEN').length;
  const returnedCount = items.filter((i) => i.status === 'RETURNED').length;

  return (
    <div className="space-y-6">
      {/* Top Navigation View Pills (Matching Dashboard V22 Views) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200/60">
        <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-white/80 border border-slate-200/80 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('feed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'feed'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Campus Feed</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'saved'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved for later</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Profile &amp; Focus</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchItems}
            disabled={loading}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
            title="Refresh items from database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: OVERVIEW (Main Dashboard V22 Layout) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Hero Banner ("Work's always better together") */}
          <DashboardHero
            onExploreMatches={() => {
              if (highlights.length > 0) setActiveRadarItem(highlights[0].lostItem);
            }}
          />

          {/* 4 Stats Cards (StatsCard component from video code snippet) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatsCard
              title="Open Lost Reports"
              value={lostCount}
              change="+14.2"
              icon={Package}
              subtitle="Active queries"
            />
            <StatsCard
              title="Found Items"
              value={foundCount}
              change="+8.5"
              icon={Sparkles}
              subtitle="Safely recorded"
            />
            <StatsCard
              title="Verified Returns"
              value={returnedCount}
              change="+22.0"
              icon={CheckCircle2}
              subtitle="100% Handover"
            />
            <StatsCard
              title="Privacy Shield"
              value="100%"
              change="+5.0"
              icon={ShieldCheck}
              subtitle="Encrypted proofs"
              badge="W3C & OWASP"
            />
          </div>

          {/* 2-Column Workspace Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 8 Columns: Match Radar + Items */}
            <div className="lg:col-span-8 space-y-6">
              {/* "Unleash Your Potential" / High Confidence Match Banner */}
              {highlights.length > 0 && (
                <div className="p-6 rounded-[32px] bg-gradient-to-r from-emerald-100/90 via-teal-100/70 to-emerald-50 border border-emerald-300/60 shadow-xs relative overflow-hidden">
                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider">
                        <Zap className="w-3.5 h-3.5" />
                        <span>High Confidence Match Detected</span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-900">
                        {highlights[0]?.score}% Pair Confidence
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900">
                        Pairing found for &quot;{highlights[0]?.lostItem?.title}&quot;
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {highlights[0]?.explanationSummary}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveRadarItem(highlights[0].lostItem)}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Inspect Match Factors</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (!isAuthenticated) openLoginModal();
                          else setActiveClaimItem(highlights[0].foundItem);
                        }}
                        className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition"
                      >
                        <span>Verify Claim</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Feed Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Recent Campus Reports</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Categorized items with approximate PostGIS campus coordinates
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('feed')}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  <span>View All ({items.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Reports Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.slice(0, 4).map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onOpenMatches={(it) => setActiveRadarItem(it)}
                    onOpenClaim={(it) => {
                      if (!isAuthenticated) openLoginModal();
                      else setActiveClaimItem(it);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Right 4 Columns: Calendar & Live Stream */}
            <div className="lg:col-span-4 space-y-5">
              {/* Calendar Widget (November 2026) */}
              <CalendarWidget />

              {/* High Confidence Mini Pairs */}
              <div className="glass-card p-5 rounded-3xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Live Match Radar
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>

                <div className="space-y-2.5">
                  {highlights.slice(0, 3).map((h, i) => (
                    <div
                      key={i}
                      onClick={() => setActiveRadarItem(h.lostItem)}
                      className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition border border-slate-200/60"
                    >
                      <div className="flex items-center justify-between text-xs font-bold mb-1">
                        <span className="text-rose-600 truncate max-w-[120px]">{h.lostItem?.title}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-black">
                          {h.score}%
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{h.explanationSummary}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Campus Activity Feed */}
              <div className="glass-card p-5 rounded-3xl space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block border-b border-slate-100 pb-2.5">
                  Recent Activity
                </span>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                    <div>
                      <div className="font-semibold text-slate-800">Priya Sharma submitted verification</div>
                      <div className="text-[10px] text-slate-400">Dell XPS 13 • 12m ago</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                    <div>
                      <div className="font-semibold text-slate-800">Rahul Verma posted found laptop</div>
                      <div className="text-[10px] text-slate-400">Library Desk 7 • 1h ago</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 shrink-0"></div>
                    <div>
                      <div className="font-semibold text-slate-800">Handover verified by Proctor</div>
                      <div className="text-[10px] text-slate-400">Fossil Wallet • 3h ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: CAMPUS FEED (Catalog with filter bar) */}
      {activeTab === 'feed' && (
        <div className="space-y-6">
          <FilterBar filters={filters} setFilters={setFilters} onReset={resetFilters} />

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">
              Campus Reports Feed ({items.length})
            </h2>
            <span className="text-xs text-slate-500">Filtered by live criteria</span>
          </div>

          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-500">Loading campus posts...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs">{error}</div>
          ) : items.length === 0 ? (
            <div className="glass-card rounded-3xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No matching reports found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try clearing your search query or report an item!
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-2 px-4 py-2 rounded-xl text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onOpenMatches={(it) => setActiveRadarItem(it)}
                  onOpenClaim={(it) => {
                    if (!isAuthenticated) openLoginModal();
                    else setActiveClaimItem(it);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: SAVED FOR LATER (Matching Video Frame 00:04 & 00:05) */}
      {activeTab === 'saved' && (
        <SavedForLaterView
          items={items}
          onOpenMatches={(it) => setActiveRadarItem(it)}
          onOpenClaim={(it) => {
            if (!isAuthenticated) openLoginModal();
            else setActiveClaimItem(it);
          }}
        />
      )}

      {/* VIEW 4: PROFILE & FOCUS (Matching Video Frame 00:03) */}
      {activeTab === 'profile' && <ProfileFocusView />}

      {/* Modals */}
      {activeRadarItem && (
        <MatchRadarModal
          item={activeRadarItem}
          onClose={() => setActiveRadarItem(null)}
          onInspectItem={(id) => router.push(`/items/${id}`)}
          onClaimItem={(cand) => {
            setActiveRadarItem(null);
            if (!isAuthenticated) openLoginModal();
            else setActiveClaimItem(cand);
          }}
        />
      )}

      {activeClaimItem && (
        <PrivateClaimModal
          item={activeClaimItem}
          onClose={() => setActiveClaimItem(null)}
          onSuccess={() => fetchItems()}
        />
      )}

      {activeFlagItem && (
        <FlagPostModal
          item={activeFlagItem}
          onClose={() => setActiveFlagItem(null)}
          onSuccess={() => alert('Post flagged for proctor review.')}
        />
      )}
    </div>
  );
}
