'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FolderHeart, CheckCircle2, Clock, Sparkles, MapPin, Calendar, Lock, ArrowRight, HelpCircle } from 'lucide-react';
import { apiRequest, formatTimeAgo, getCategoryLabel } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogo } from '../../components/GoogleSignInModal';
import ReviewClaimsModal from '../../components/ReviewClaimsModal';
import MatchRadarModal from '../../components/MatchRadarModal';

export default function MyPostsPage() {
  const router = useRouter();
  const { currentUser, isAuthenticated, openLoginModal } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'claims'>('posts');
  const [myItems, setMyItems] = useState<any[]>([]);
  const [myClaims, setMyClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeReviewItem, setActiveReviewItem] = useState<any | null>(null);
  const [activeRadarItem, setActiveRadarItem] = useState<any | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [itemsRes, claimsRes] = await Promise.all([
        apiRequest<{ items: any[] }>('/items'),
        apiRequest<{ claims: any[] }>('/claims/my').catch(() => ({ claims: [] })),
      ]);

      const filtered = (itemsRes.items || []).filter((i) => i.userId === currentUser?.id);
      setMyItems(filtered);
      setMyClaims(claimsRes.claims || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100 shadow-xs">
          <FolderHeart className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Sign in to Access Your Dossier</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          Sign in with your campus Google Workspace account to see items you have reported and check the status of private ownership claims.
        </p>
        <button
          type="button"
          onClick={() => openLoginModal('signin')}
          className="mt-2 py-3 px-6 rounded-2xl text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 shadow-md inline-flex items-center gap-2.5 transition active:scale-98"
        >
          <GoogleLogo />
          <span>Sign in with Campus Google Account</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full mb-2">
              <FolderHeart className="w-3.5 h-3.5" />
              <span>Personal Campus Dossier</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">My Reports & Claims</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage items you reported and check the status of private ownership claims.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Persona</span>
            <span className="font-bold text-slate-800">{currentUser?.name}</span>
            <span className="text-slate-500 block text-[11px]">{currentUser?.email}</span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="mt-6 flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('posts')}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
              activeTab === 'posts' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>My Reported Items</span>
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px]">{myItems.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('claims')}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
              activeTab === 'claims' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>My Submitted Claims</span>
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px]">{myClaims.length}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500">Retrieving records from NestJS API...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-xs">{error}</div>
      ) : activeTab === 'posts' ? (
        myItems.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-500 space-y-2">
            <HelpCircle className="w-8 h-8 mx-auto text-slate-300" />
            <h3 className="text-sm font-bold text-slate-700">No reported items yet</h3>
            <p className="text-xs text-slate-400">Reports you submit will show up here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white ${
                        item.type === 'LOST' ? 'bg-rose-600' : 'bg-emerald-600'
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 uppercase">{getCategoryLabel(item.category)}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        item.status === 'RETURNED'
                          ? 'bg-purple-100 text-purple-800'
                          : item.status === 'CLAIM_PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 truncate">{item.title}</h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      {item.campusArea}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatTimeAgo(item.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveReviewItem(item)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition"
                  >
                    Review Claims
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveRadarItem(item)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Matches</span>
                  </button>

                  <Link
                    href={`/items/${item.id}`}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      ) : myClaims.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-500 space-y-2">
          <Lock className="w-8 h-8 mx-auto text-slate-300" />
          <h3 className="text-sm font-bold text-slate-700">No claims submitted</h3>
          <p className="text-xs text-slate-400">Claims you submit on found belongings will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {myClaims.map((claim) => (
            <div key={claim.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Claimed Item</span>
                  <h3 className="text-base font-bold text-slate-900">{claim.item?.title || 'Reported Item'}</h3>
                  <div className="text-xs text-slate-500 mt-0.5">{claim.item?.campusArea}</div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    claim.status === 'APPROVED'
                      ? 'bg-emerald-600 text-white'
                      : claim.status === 'REJECTED'
                      ? 'bg-rose-600 text-white'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  {claim.status === 'APPROVED' ? 'Verified & Approved' : claim.status === 'REJECTED' ? 'Not Verified' : 'Under Review'}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Your Confidential Ownership Proof:
                </span>
                <p className="text-slate-800 whitespace-pre-wrap">{claim.privateProofDetail}</p>
              </div>

              {claim.status === 'APPROVED' && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Pickup Instructions:</span>
                  </div>
                  <p className="font-medium text-emerald-950">{claim.pickupInstructions || 'Coordinate directly with reporter.'}</p>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <Link
                  href={`/items/${claim.itemId}`}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <span>View Item Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeReviewItem && (
        <ReviewClaimsModal
          item={activeReviewItem}
          onClose={() => setActiveReviewItem(null)}
          onClaimReviewed={() => fetchData()}
        />
      )}

      {activeRadarItem && (
        <MatchRadarModal
          item={activeRadarItem}
          onClose={() => setActiveRadarItem(null)}
          onInspectItem={(id) => router.push(`/items/${id}`)}
          onClaimItem={() => {}}
        />
      )}
    </div>
  );
}
