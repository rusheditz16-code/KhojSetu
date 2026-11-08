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
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="radar-title"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 id="radar-title" className="text-lg font-extrabold tracking-tight">
                FoundBeacon Match Radar
              </h2>
              <p className="text-xs text-blue-200">
                Explainable scoring engine comparing PostGIS distance, keywords, and time
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reference Target Bar */}
        <div className="px-6 py-3 bg-slate-100/80 border-b border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
              Analyzing for:
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase text-white ${
                item.type === 'LOST' ? 'bg-rose-600' : 'bg-emerald-600'
              }`}
            >
              {item.type}
            </span>
            <strong className="text-slate-900 font-bold">{item.title}</strong>
          </div>
          <span className="text-slate-500 font-medium">Category: {getCategoryLabel(item.category)}</span>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-500 font-semibold">
                Running PostGIS distance calculation and semantic keyword scanner...
              </p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          ) : matches.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Close Matches Found Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No opposite reports currently meet the threshold. FoundBeacon background workers will automatically alert you the moment a matching post appears!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                <span>Ranked Potential Matches ({matches.length})</span>
                <span className="text-[11px] text-slate-400">Scored out of 100%</span>
              </div>

              {matches.map((match) => {
                const candidate = match.item;
                const isHigh = match.score >= 75;

                return (
                  <div
                    key={candidate.id}
                    className={`rounded-2xl border p-4.5 transition hover:shadow-md ${
                      isHigh ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200 bg-white'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white ${
                              candidate.type === 'LOST' ? 'bg-rose-600' : 'bg-emerald-600'
                            }`}
                          >
                            {candidate.type}
                          </span>
                          <h4 className="text-base font-bold text-slate-900">{candidate.title}</h4>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-blue-500" />
                            {candidate.campusArea}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatTimeAgo(candidate.incidentDate)}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black shadow-xs ${
                            isHigh ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                          }`}
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{match.score}% MATCH</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5 capitalize">
                          {match.confidenceTier} confidence
                        </div>
                      </div>
                    </div>

                    {/* Plain Language Summary */}
                    <div className="mt-3 p-3 rounded-xl bg-slate-100/80 text-xs text-slate-700 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 font-bold block mb-0.5">Why this matches:</strong>
                        <span>{match.explanationSummary}</span>
                      </div>
                    </div>

                    {/* Factor Breakdown */}
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {match.factors.map((f: any, i: number) => (
                        <div
                          key={i}
                          className="p-2 rounded-lg bg-white border border-slate-200/80 flex flex-col justify-between"
                        >
                          <span className="text-[10px] text-slate-400 font-semibold uppercase">{f.factor}</span>
                          <div className="flex items-baseline justify-between mt-1">
                            <span className="font-extrabold text-slate-900">+{f.points}</span>
                            <span className="text-[10px] text-slate-400">/{f.maxPoints} pts</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Action Footer */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onInspectItem(candidate.id);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                      >
                        Inspect Details
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onClaimItem(candidate);
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-xs"
                      >
                        <span>Verify & Claim Ownership</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between shrink-0">
          <span className="flex items-center gap-1 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            Ranked using PostGIS coordinates, category, keywords, and time
          </span>
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
