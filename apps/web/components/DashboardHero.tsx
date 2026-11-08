'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, Plus, CheckCircle2 } from 'lucide-react';

export default function DashboardHero({
  onOpenReport,
  onExploreMatches,
}: {
  onOpenReport?: () => void;
  onExploreMatches?: () => void;
}) {
  const avatars = [
    { name: 'Priya', bg: 'bg-emerald-500', initial: 'P' },
    { name: 'Rahul', bg: 'bg-blue-500', initial: 'R' },
    { name: 'Ananya', bg: 'bg-amber-500', initial: 'A' },
    { name: 'Arjun', bg: 'bg-indigo-500', initial: 'A' },
  ];

  return (
    <div className="glass-card p-6 sm:p-8 rounded-[32px] relative overflow-hidden border border-white/80">
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 text-xs font-bold border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI-Assisted Lost &amp; Found Bridge</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Work&apos;s always <span className="text-emerald-600 italic font-serif">better</span> together.
          </h1>

          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-xl">
            KhojSetu automatically suggests likely matches using category signatures, PostGIS campus distance,
            and incident time proximity—while keeping identifying ownership details 100% private.
          </p>

          {/* Avatars & Community Pill */}
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center -space-x-2">
              {avatars.map((a, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full ${a.bg} text-white font-bold text-xs flex items-center justify-center ring-2 ring-white shadow-xs`}
                  title={a.name}
                >
                  {a.initial}
                </div>
              ))}
            </div>
            <span className="text-slate-600 font-medium">
              Over <strong>350+ verified campus students</strong> active today
            </span>
          </div>
        </div>

        {/* Right Action Block (Dashboard V22 badge & buttons) */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-[#121c1d] text-white flex items-center gap-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/20 text-emerald-400 flex items-center justify-center border border-emerald-400/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                Explainable Accuracy
              </div>
              <div className="text-lg font-black text-white">98.4% Match Rate</div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link
              href="/report"
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Report Item</span>
            </Link>

            {onExploreMatches && (
              <button
                type="button"
                onClick={onExploreMatches}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center gap-1.5"
              >
                <span>View Radar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
