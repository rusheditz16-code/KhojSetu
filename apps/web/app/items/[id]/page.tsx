'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Lock,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  FolderHeart,
  Trash2,
} from 'lucide-react';
import { apiRequest, formatTimeAgo, getCategoryLabel, getZoneLabel } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import MatchRadarModal from '../../../components/MatchRadarModal';
import PrivateClaimModal from '../../../components/PrivateClaimModal';
import ReviewClaimsModal from '../../../components/ReviewClaimsModal';
import FlagPostModal from '../../../components/FlagPostModal';

export default function ItemDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { currentUser, isModerator, isAuthenticated, openLoginModal } = useAuth();

  const [item, setItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimsCount, setClaimsCount] = useState(0);
  const [sidebarMatches, setSidebarMatches] = useState<any[]>([]);

  // Modals
  const [showRadar, setShowRadar] = useState(false);
  const [showClaim, setShowClaim] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showFlag, setShowFlag] = useState(false);

  const fetchItem = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiRequest(`/items/${id}`);
      setItem(data.item);

      // Check claims if owner or proctor
      if (data.item.userId === currentUser?.id || isModerator) {
        try {
          const claimsData = await apiRequest(`/claims/item/${id}`);
          setClaimsCount(claimsData.claims?.length || 0);
        } catch (e) {}
      }

      // Sidebar matches
      try {
        const matchData = await apiRequest(`/matches/${id}?minScore=35`);
        setSidebarMatches(matchData.matches?.slice(0, 3) || []);
      } catch (e) {}
    } catch (err: any) {
      setError(err.message || 'Failed to load item');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItem();
  }, [id, currentUser]);

  const handleUpdateStatus = async (status: string) => {
    try {
      await apiRequest(`/items/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await fetchItem();
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await apiRequest(`/items/${id}`, { method: 'DELETE' });
      router.push('/');
    } catch (err: any) {
      alert(`Deletion failed: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 font-medium">Retrieving item details from NestJS API...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-3">
        <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-xs">{error || 'Item not found'}</div>
        <Link href="/" className="inline-block px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200">
          Back to Browse Feed
        </Link>
      </div>
    );
  }

  const isOwner = item.userId === currentUser?.id;
  const canManage = isOwner || isModerator;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </Link>

        <div className="flex items-center gap-2">
          {!isOwner && (
            <button
              type="button"
              onClick={() => setShowFlag(true)}
              className="text-xs text-slate-500 hover:text-amber-600 flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-amber-50"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              <span>Flag Post</span>
            </button>
          )}

          {canManage && (
            <button
              type="button"
              onClick={handleDelete}
              className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-red-50"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
            <div className="relative aspect-16/9 bg-slate-100">
              {item.photoUrl ? (
                <img src={item.photoUrl} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                  <span className="text-4xl mb-2">{item.type === 'LOST' ? '🔍' : '📍'}</span>
                  <span className="text-xs font-medium text-slate-500">No photo uploaded</span>
                </div>
              )}

              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white ${
                    item.type === 'LOST' ? 'bg-rose-600' : 'bg-emerald-600'
                  }`}
                >
                  {item.type}
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white ${
                    item.status === 'RETURNED'
                      ? 'bg-purple-600'
                      : item.status === 'CLAIM_PENDING'
                      ? 'bg-amber-500'
                      : 'bg-blue-600'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  {getCategoryLabel(item.category)}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{item.title}</h1>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-700 block">Campus Area</span>
                    <span className="text-slate-900 font-bold">{item.campusArea}</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Zone: {getZoneLabel(item.zone)} • Lat: {item.latitude}, Lng: {item.longitude}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-700 block">Incident Date</span>
                    <span className="text-slate-900 font-bold">
                      {new Date(item.incidentDate).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">Reported {formatTimeAgo(item.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Public Description</h3>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{item.description}</p>
              </div>

              {item.secretPrompt && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 uppercase tracking-wider text-[11px]">
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Private Verification Question Required by Reporter</span>
                  </div>
                  <p className="text-amber-950 font-semibold italic text-sm">"{item.secretPrompt}"</p>
                  <p className="text-[11px] text-amber-800">
                    Claimants must submit their proof privately.
                  </p>
                </div>
              )}

              <div className="pt-2 flex flex-wrap items-center gap-3">
                {!isOwner && item.status === 'OPEN' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!isAuthenticated) {
                        openLoginModal();
                      } else {
                        setShowClaim(true);
                      }
                    }}
                    className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Verify & Claim Ownership</span>
                  </button>
                )}

                {canManage && (
                  <button
                    type="button"
                    onClick={() => setShowReview(true)}
                    className="py-2.5 px-4 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 flex items-center gap-2"
                  >
                    <FolderHeart className="w-4 h-4" />
                    <span>Review Submitted Claims ({claimsCount})</span>
                  </button>
                )}

                {canManage && item.status !== 'RETURNED' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus('RETURNED')}
                    className="py-2.5 px-4 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Mark as Returned</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Radar Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Match Radar</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRadar(true)}
                className="text-xs text-blue-600 hover:text-blue-800 font-bold"
              >
                Deep Scan
              </button>
            </div>

            <p className="text-xs text-slate-500">
              FoundBeacon automatically scores opposite reports using PostGIS distance, keywords, and time proximity.
            </p>

            {sidebarMatches.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-2xl text-center text-xs text-slate-400">
                No active candidate items meet the threshold right now.
              </div>
            ) : (
              <div className="space-y-3">
                {sidebarMatches.map((m: any) => (
                  <div
                    key={m.item.id}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-300 bg-slate-50/50 hover:bg-blue-50/20 transition space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase text-white bg-slate-800 px-1.5 py-0.5 rounded">
                          {m.item.type}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 truncate mt-1">{m.item.title}</h4>
                      </div>
                      <span className="shrink-0 text-xs font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        {m.score}%
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2">{m.explanationSummary}</p>

                    <button
                      type="button"
                      onClick={() => setShowRadar(true)}
                      className="text-xs font-bold text-blue-600 hover:underline inline-block pt-1"
                    >
                      Inspect Match Factors →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showRadar && (
        <MatchRadarModal
          item={item}
          onClose={() => setShowRadar(false)}
          onInspectItem={(targetId) => router.push(`/items/${targetId}`)}
          onClaimItem={(candidate) => {
            setShowRadar(false);
            setShowClaim(true);
          }}
        />
      )}

      {showClaim && (
        <PrivateClaimModal
          item={item}
          onClose={() => setShowClaim(false)}
          onSuccess={() => fetchItem()}
        />
      )}

      {showReview && (
        <ReviewClaimsModal
          item={item}
          onClose={() => setShowReview(false)}
          onClaimReviewed={() => fetchItem()}
        />
      )}

      {showFlag && (
        <FlagPostModal
          item={item}
          onClose={() => setShowFlag(false)}
          onSuccess={() => alert('Post flagged for proctor review.')}
        />
      )}
    </div>
  );
}
