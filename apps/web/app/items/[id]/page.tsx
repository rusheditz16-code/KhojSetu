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
    if (!window.confirm('Delete this archive post?')) return;
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
        <div className="w-7 h-7 border-2 border-foundry-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs uppercase tracking-wider text-neutral-400">Retrieving exhibit from archive...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-3">
        <div className="p-4 bg-rose-50 text-rose-700 rounded-xl text-xs">{error || 'Exhibit not found'}</div>
        <Link href="/" className="foundry-pill-outline inline-block px-5 py-2">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const isOwner = item.userId === currentUser?.id;
  const canManage = isOwner || isModerator;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold text-neutral-500 hover:text-foundry-900 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Catalog</span>
        </Link>

        <div className="flex items-center gap-2">
          {!isOwner && (
            <button
              type="button"
              onClick={() => setShowFlag(true)}
              className="text-[11px] uppercase tracking-wider font-semibold text-neutral-500 hover:text-amber-700 flex items-center gap-1 px-3 py-1 rounded-full border border-neutral-200 hover:bg-neutral-50 transition"
            >
              <ShieldAlert className="w-3 h-3 text-amber-600" />
              <span>Flag</span>
            </button>
          )}

          {canManage && (
            <button
              type="button"
              onClick={handleDelete}
              className="text-[11px] uppercase tracking-wider font-semibold text-neutral-500 hover:text-rose-700 flex items-center gap-1 px-3 py-1 rounded-full border border-neutral-200 hover:bg-neutral-50 transition"
            >
              <Trash2 className="w-3 h-3 text-rose-600" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Exhibition Art Frame (Left 7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="foundry-card rounded-xl p-4 sm:p-6 shadow-foundry-frame">
            <div className="relative aspect-4/3 foundry-matting rounded-lg overflow-hidden flex items-center justify-center p-4">
              {item.photoUrl ? (
                <img src={item.photoUrl} alt={item.title} className="w-full h-full object-cover rounded shadow-2xs" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded border border-neutral-200 text-neutral-400">
                  <span className="text-4xl mb-2">{item.type === 'LOST' ? '🔍' : '📦'}</span>
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-neutral-400">
                    {item.type === 'LOST' ? 'Lost Item Record' : 'Found Item Record'}
                  </span>
                </div>
              )}

              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span
                  className={`px-3 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest shadow-xs ${
                    item.type === 'LOST'
                      ? 'bg-white text-rose-700 border border-rose-200'
                      : 'bg-foundry-900 text-white'
                  }`}
                >
                  {item.type}
                </span>

                <span
                  className="bg-white/95 backdrop-blur-xs text-foundry-900 px-3 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border border-neutral-200"
                >
                  {item.status}
                </span>
              </div>
            </div>

            {/* Public Description */}
            <div className="mt-6 space-y-4">
              <span className="editorial-kicker">Public Dossier Description</span>
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-normal whitespace-pre-line">
                {item.description}
              </p>

              {item.secretPrompt && (
                <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-foundry-900 uppercase tracking-widest text-[10px]">
                    <Lock className="w-3.5 h-3.5 text-khoj-orange" />
                    <span>Private Verification Question Required by Reporter</span>
                  </div>
                  <p className="text-foundry-950 font-serif italic text-sm pt-1">
                    &quot;{item.secretPrompt}&quot;
                  </p>
                  <p className="text-[11px] text-neutral-500 font-light">
                    Claimants must submit their proof answer privately. It will not be exposed to the public.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Details & Actions Column (Right 5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="foundry-card rounded-xl p-6 space-y-5">
            <div>
              <span className="editorial-kicker text-khoj-orange">
                {getCategoryLabel(item.category)}
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-normal text-foundry-950 mt-1">
                {item.title}
              </h1>
            </div>

            {/* Spatial & Chronological Metadata */}
            <div className="space-y-3 pt-4 border-t border-neutral-100 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                <div>
                  <span className="editorial-kicker">Campus Location</span>
                  <div className="text-foundry-900 font-semibold">{item.campusArea || 'Main Campus'}</div>
                  <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                    Zone: {getZoneLabel(item.zone)} • Lat: {item.latitude}, Lng: {item.longitude}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2">
                <Calendar className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                <div>
                  <span className="editorial-kicker">Incident Timestamp</span>
                  <div className="text-foundry-900 font-semibold">
                    {(() => {
                      const d = item.incidentDate ? new Date(item.incidentDate) : new Date();
                      return isNaN(d.getTime())
                        ? 'Recently reported'
                        : d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
                    })()}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    Archived {formatTimeAgo(item.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Pills */}
            <div className="pt-4 border-t border-neutral-100 space-y-2.5">
              {!isOwner && item.status === 'OPEN' && (
                <button
                  type="button"
                  onClick={() => {
                    if (!isAuthenticated) openLoginModal('signin');
                    else setShowClaim(true);
                  }}
                  className="w-full foundry-pill-primary py-3 px-4 flex items-center justify-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5 text-khoj-orange" />
                  <span>Verify &amp; Claim Ownership</span>
                </button>
              )}

              {canManage && (
                <button
                  type="button"
                  onClick={() => setShowReview(true)}
                  className="w-full foundry-pill-outline py-2.5 px-4 flex items-center justify-center gap-2"
                >
                  <FolderHeart className="w-3.5 h-3.5" />
                  <span>Review Submitted Claims ({claimsCount})</span>
                </button>
              )}

              {canManage && item.status !== 'RETURNED' && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('RETURNED')}
                  className="w-full foundry-pill-outline py-2.5 px-4 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Mark as Returned</span>
                </button>
              )}
            </div>
          </div>

          {/* Match Radar Sidebar */}
          <div className="foundry-card rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-khoj-orange" />
                <h3 className="editorial-kicker text-foundry-900">Spatial Match Radar</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRadar(true)}
                className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 hover:text-foundry-900"
              >
                Scan All
              </button>
            </div>

            <p className="text-xs text-neutral-500 font-light">
              KhojSetu calculates spatial cosine similarity against corresponding reports.
            </p>

            {sidebarMatches.length === 0 ? (
              <div className="py-4 text-center text-xs text-neutral-400">
                No active candidate pairs meet the threshold.
              </div>
            ) : (
              <div className="space-y-2">
                {sidebarMatches.map((m: any, idx: number) => {
                  const candidate = m?.item || m?.candidateItem;
                  if (!candidate) return null;
                  return (
                    <div
                      key={candidate.id || idx}
                      onClick={() => setShowRadar(true)}
                      className="p-3 rounded-lg bg-neutral-50 hover:bg-neutral-100 cursor-pointer transition border border-neutral-200/60"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[9px] font-semibold uppercase tracking-wider bg-foundry-900 text-white px-1.5 py-0.5 rounded">
                            {candidate.type}
                          </span>
                          <h4 className="text-xs font-semibold text-foundry-900 truncate mt-1">{candidate.title}</h4>
                        </div>
                        <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full bg-neutral-200 text-foundry-900">
                          {m.score}%
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 line-clamp-1 mt-1">{m.explanationSummary}</p>
                    </div>
                  );
                })}
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
