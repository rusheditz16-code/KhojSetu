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
      {/* Top View Navigation Pills (Foundry Minimalist Architecture) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-200/80">
        <div className="inline-flex items-center gap-1.5 p-1 rounded-full bg-white border border-neutral-200/80 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider transition flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-foundry-900 text-white shadow-2xs'
                : 'text-neutral-600 hover:text-foundry-900 hover:bg-neutral-50'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('feed')}
            className={`px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider transition flex items-center gap-2 ${
              activeTab === 'feed'
                ? 'bg-foundry-900 text-white shadow-2xs'
                : 'text-neutral-600 hover:text-foundry-900 hover:bg-neutral-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Campus Catalog</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider transition flex items-center gap-2 ${
              activeTab === 'saved'
                ? 'bg-foundry-900 text-white shadow-2xs'
                : 'text-neutral-600 hover:text-foundry-900 hover:bg-neutral-50'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Dossier</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider transition flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-foundry-900 text-white shadow-2xs'
                : 'text-neutral-600 hover:text-foundry-900 hover:bg-neutral-50'
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
            className="px-3.5 py-1.5 rounded-full bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-600 hover:text-foundry-900 text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5 transition shadow-2xs"
            title="Refresh items from database"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: OVERVIEW (Foundry Editorial Architecture) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Split 50/50 Editorial Hero */}
          <DashboardHero
            onExploreMatches={() => {
              if (highlights.length > 0) setActiveRadarItem(highlights[0].lostItem);
            }}
          />

          {/* 4 Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatsCard
              title="Open Lost Reports"
              value={lostCount}
              change="+14.2"
              icon={Package}
              subtitle="Active queries"
            />
            <StatsCard
              title="Cataloged Finds"
              value={foundCount}
              change="+8.5"
              icon={Sparkles}
              subtitle="Safely recorded"
            />
            <StatsCard
              title="Verified Restorations"
              value={returnedCount}
              change="+22.0"
              icon={CheckCircle2}
              subtitle="100% Handover"
            />
            <StatsCard
              title="Privacy Guard"
              value="100%"
              change="+5.0"
              icon={ShieldCheck}
              subtitle="Zero exposure"
              badge="OWASP & W3C"
            />
          </div>

          {/* 2-Column Workspace Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 8 Columns: Match Radar + Exhibition Catalog */}
            <div className="lg:col-span-8 space-y-6">
              {/* High Confidence Match Highlight */}
              {highlights.length > 0 && (
                <div className="p-6 rounded-xl bg-white border border-neutral-200 shadow-foundry-frame relative overflow-hidden">
                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-foundry-900 text-white text-[9px] font-semibold uppercase tracking-widest">
                        <Zap className="w-3 h-3 text-khoj-orange" />
                        <span>High Confidence Pair Detected</span>
                      </div>
                      <span className="text-[11px] font-mono font-semibold text-emerald-800">
                        {highlights[0]?.score}% Pair Confidence
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-serif font-normal text-foundry-950">
                        Pairing discovered for &quot;{highlights[0]?.lostItem?.title}&quot;
                      </h3>
                      <p className="text-xs text-neutral-600 mt-1 leading-relaxed font-light">
                        {highlights[0]?.explanationSummary}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveRadarItem(highlights[0].lostItem)}
                        className="foundry-pill-primary px-4 py-2 flex items-center gap-1.5 text-[10px]"
                      >
                        <Sparkles className="w-3 h-3 text-khoj-orange" />
                        <span>Inspect Match Factors</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (!isAuthenticated) openLoginModal();
                          else setActiveClaimItem(highlights[0].foundItem);
                        }}
                        className="foundry-pill-outline px-4 py-2 flex items-center gap-1.5 text-[10px]"
                      >
                        <span>Verify Claim</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Feed Header */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-normal text-foundry-950">
                    Recent Campus Exhibits
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Categorized possessions with approximate PostGIS spatial coordinates
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('feed')}
                  className="text-[11px] uppercase tracking-wider font-semibold text-neutral-600 hover:text-foundry-900 flex items-center gap-1"
                >
                  <span>View All ({items.length})</span>
                  <ArrowRight className="w-3 h-3" />
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
              {/* Calendar Widget */}
              <CalendarWidget />

              {/* Live Match Radar Mini Pairs */}
              <div className="foundry-card p-5 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
                  <span className="editorial-kicker text-foundry-900">
                    Spatial Match Stream
                  </span>
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Active
                  </span>
                </div>

                <div className="space-y-2.5">
                  {highlights.length === 0 ? (
                    <div className="py-6 text-center text-xs text-neutral-400">
                      No active spatial pairs detected currently.
                    </div>
                  ) : (
                    highlights.slice(0, 3).map((h, i) => (
                      <div
                        key={i}
                        onClick={() => setActiveRadarItem(h.lostItem)}
                        className="p-3 rounded-lg bg-neutral-50 hover:bg-neutral-100 cursor-pointer transition border border-neutral-200/60"
                      >
                        <div className="flex items-center justify-between text-xs font-semibold mb-1">
                          <span className="text-foundry-900 truncate max-w-[140px]">{h.lostItem?.title}</span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] bg-foundry-900 text-white font-mono font-semibold">
                            {h.score}%
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-500 line-clamp-1">{h.explanationSummary}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Campus Activity Feed */}
              <div className="foundry-card p-5 rounded-xl space-y-3">
                <span className="editorial-kicker text-foundry-900 block border-b border-neutral-100 pb-2.5">
                  Chronological Activity
                </span>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-khoj-orange mt-1.5 shrink-0"></div>
                    <div>
                      <div className="font-semibold text-foundry-900">Priya Sharma submitted verification</div>
                      <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Dell XPS 13 • 12m ago</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 mt-1.5 shrink-0"></div>
                    <div>
                      <div className="font-semibold text-foundry-900">Rahul Verma posted found laptop</div>
                      <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Library Desk 7 • 1h ago</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0"></div>
                    <div>
                      <div className="font-semibold text-foundry-900">Handover verified by Proctor</div>
                      <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Fossil Wallet • 3h ago</div>
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
            <h2 className="text-xl sm:text-2xl font-serif font-normal text-foundry-950">
              Campus Collection ({items.length})
            </h2>
            <span className="text-[11px] uppercase tracking-wider text-neutral-400">Archived Exhibits</span>
          </div>

          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-7 h-7 border-2 border-foundry-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-neutral-400 uppercase tracking-wider">Loading campus archive...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">{error}</div>
          ) : items.length === 0 ? (
            <div className="foundry-card rounded-xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mx-auto">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-foundry-900">No matching exhibits found</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Try refining your search keyword or submit a new campus report.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="foundry-pill-outline mt-2 px-4 py-2"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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

      {/* VIEW 3: SAVED FOR LATER */}
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

      {/* VIEW 4: PROFILE & FOCUS */}
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
