'use client';

import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Check, XCircle, AlertCircle, Clock, ExternalLink } from 'lucide-react';
import { apiRequest, formatTimeAgo } from '../lib/api';

export default function ReviewClaimsModal({
  item,
  onClose,
  onClaimReviewed,
}: {
  item: any;
  onClose: () => void;
  onClaimReviewed?: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);
  const [pickupInstructions, setPickupInstructions] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchClaims = async () => {
    if (!item) return;
    try {
      setLoading(true);
      setError(null);
      const data = await apiRequest(`/claims/item/${item.id}`);
      setClaims(data.claims || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load claims');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [item]);

  const handleReviewAction = async (claimId: string, status: string) => {
    try {
      setIsSubmitting(true);
      await apiRequest(`/claims/${claimId}/review`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          reviewer_notes: reviewNotes.trim() || (status === 'APPROVED' ? 'Ownership verified.' : 'Proof unverified.'),
          pickup_instructions: status === 'APPROVED' ? pickupInstructions.trim() || 'Contact finder.' : null,
        }),
      });

      setActiveReviewId(null);
      setPickupInstructions('');
      setReviewNotes('');
      await fetchClaims();
      onClaimReviewed?.();
    } catch (err: any) {
      setError(err.message || 'Failed to review claim');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-claims-title"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <h2 id="review-claims-title" className="text-base font-bold">
              Review Ownership Claims
            </h2>
            <p className="text-xs text-slate-300">
              For: <span className="font-semibold text-white">{item.title}</span>
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-2.5 flex items-center gap-2 text-xs text-emerald-900 shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Compare submitted private proof details with your item before approving.</span>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-500">Retrieving confidential claims...</p>
            </div>
          ) : error ? (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          ) : claims.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No claims submitted for this report yet.
            </div>
          ) : (
            <div className="space-y-4">
              {claims.map((claim) => (
                <div key={claim.id} className="rounded-2xl border border-slate-200 p-4.5 bg-slate-50/50 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {claim.claimant?.name || 'Student Claimant'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {claim.claimant?.email || 'student@campus.edu'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">{formatTimeAgo(claim.createdAt)}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          claim.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : claim.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {claim.status}
                      </span>
                    </div>
                  </div>

                  {/* Private Proof Detail */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Submitted Private Proof:
                    </span>
                    <p className="text-slate-800 font-medium whitespace-pre-wrap leading-relaxed">
                      {claim.privateProofDetail}
                    </p>

                    {claim.privateProofPhotoUrl && (
                      <div className="mt-2 pt-2 border-t border-slate-100">
                        <a
                          href={claim.privateProofPhotoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>View attached proof document</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {claim.status === 'APPROVED' && claim.pickupInstructions && (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                      <strong>Pickup Instructions Given:</strong> {claim.pickupInstructions}
                    </div>
                  )}

                  {claim.status === 'PENDING' && (
                    <div>
                      {activeReviewId === claim.id ? (
                        <div className="p-3 bg-white rounded-xl border border-blue-200 space-y-3 mt-2">
                          <h4 className="text-xs font-bold text-slate-900">Coordinate Pickup or Reject</h4>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Pickup Instructions (Revealed upon approval)
                            </label>
                            <input
                              type="text"
                              value={pickupInstructions}
                              onChange={(e) => setPickupInstructions(e.target.value)}
                              placeholder="e.g. Deposited at Library Desk 2 with Ref #502"
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-blue-500"
                            />
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setActiveReviewId(null)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() => handleReviewAction(claim.id, 'REJECTED')}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200"
                            >
                              Reject Claim
                            </button>
                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() => handleReviewAction(claim.id, 'APPROVED')}
                              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs"
                            >
                              Approve Ownership
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveReviewId(claim.id);
                              setPickupInstructions('Central Library Front Desk, claim with student ID');
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
                          >
                            Review & Respond
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
