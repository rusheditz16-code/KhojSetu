'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, MapPin, Calendar, CheckCircle, HelpCircle, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { apiRequest, formatTimeAgo, getCategoryLabel } from '../lib/api';

export default function MatchRadarModal({
  item,
  onClose,
  onInspectItem,
  onClaimItem,
}: {
  item: any;
  onClose: () => void;
  onInspectItem: (id: string) => void;
  onClaimItem: (candidate: any) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMatches() {
      if (!item) return;
      try {
        setLoading(true);
        setError(null);
        const data = await apiRequest(`/matches/${item.id}?minScore=25`);
        setMatches(data.matches || []);
      } catch (err: any) {
        setError(err.message || 'Failed to compute match radar.');
      } finally {
        setLoading(false);
      }
    }
    fetchMatches();
  }, [item]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-foundry-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="radar-title"
    >
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-foundry-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-khoj-orange border border-neutral-700">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="editorial-kicker text-neutral-400">PostGIS Spatial Engine</span>
              <h2 id="radar-title" className="text-lg font-serif font-normal">
                KhojSetu Match Radar
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reference Target Bar */}
        <div className="px-6 py-3 bg-neutral-50 border-b border-neutral-200 text-xs flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="editorial-kicker">Target Reference:</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider text-white ${
                item.type === 'LOST' ? 'bg-rose-700' : 'bg-foundry-900'
              }`}
            >
              {item.type}
            </span>
            <strong className="text-foundry-900 font-semibold">{item.title}</strong>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono">
            {getCategoryLabel(item.category)}
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-7 h-7 border-2 border-foundry-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs uppercase tracking-wider text-neutral-400">
                Computing PostGIS spatial distances and attribute matrices...
              </p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 text-rose-700 rounded-lg text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          ) : matches.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mx-auto">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-foundry-900">No Candidate Matches Yet</h3>
              <p className="text-xs text-neutral-500 max-w-md mx-auto font-light">
                No opposite exhibits currently cross the similarity threshold. The background radar continuously scans new reports.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-xs font-semibold text-neutral-500 flex items-center justify-between">
                <span className="editorial-kicker">Ranked Candidates ({matches.length})</span>
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-mono">100 pt Scale</span>
              </div>

              {matches.map((match) => {
                const candidate = match.item;
                const isHigh = match.score >= 75;

                return (
                  <div
                    key={candidate.id}
                    className="foundry-card rounded-xl p-4 transition space-y-3"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider text-white ${
                              candidate.type === 'LOST' ? 'bg-rose-700' : 'bg-foundry-900'
                            }`}
                          >
                            {candidate.type}
                          </span>
                          <h4 className="text-sm font-semibold text-foundry-900">{candidate.title}</h4>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-khoj-orange" />
                            {candidate.campusArea || 'Main Campus'}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                            <Calendar className="w-3 h-3" />
                            {formatTimeAgo(candidate.incidentDate)}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-foundry-900 text-white">
                          <Sparkles className="w-3 h-3 text-khoj-orange" />
                          <span>{match.score}% MATCH</span>
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono mt-0.5 uppercase tracking-wider">
                          {match.confidenceTier} confidence
                        </div>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="p-3 rounded-lg bg-neutral-50 text-xs text-neutral-700 flex items-start gap-2 border border-neutral-200/60 font-light">
                      <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-foundry-900 font-semibold block mb-0.5 text-[11px] uppercase tracking-wider">
                          Explainable Correlation:
                        </strong>
                        <span>{match.explanationSummary}</span>
                      </div>
                    </div>

                    {/* Factor Breakdown */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {match.factors.map((f: any, i: number) => (
                        <div
                          key={i}
                          className="p-2 rounded-lg bg-white border border-neutral-200/80 flex flex-col justify-between"
                        >
                          <span className="text-[9px] text-neutral-400 font-semibold uppercase tracking-wider">{f.factor}</span>
                          <div className="flex items-baseline justify-between mt-1">
                            <span className="font-mono font-bold text-foundry-900">+{f.points}</span>
                            <span className="text-[9px] text-neutral-400 font-mono">/{f.maxPoints} pts</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Action Footer */}
                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onInspectItem(candidate.id);
                        }}
                        className="foundry-pill-outline px-3.5 py-1.5 text-[10px]"
                      >
                        Inspect Dossier
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onClaimItem(candidate);
                        }}
                        className="foundry-pill-primary px-3.5 py-1.5 flex items-center gap-1.5 text-[10px]"
                      >
                        <span>Verify &amp; Claim</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-neutral-50 border-t border-neutral-200 text-xs text-neutral-500 flex items-center justify-between shrink-0">
          <span className="flex items-center gap-1 text-[11px] font-light">
            <ShieldCheck className="w-3.5 h-3.5 text-khoj-orange" />
            Ranked using PostGIS spatial coordinates, semantic keywords, and chronological delta
          </span>
          <button
            type="button"
            onClick={onClose}
            className="foundry-pill-outline px-4 py-1 text-[10px]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
