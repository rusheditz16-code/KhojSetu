'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, Plus, CheckCircle2, Compass, MapPin } from 'lucide-react';

export default function DashboardHero({
  onOpenReport,
  onExploreMatches,
}: {
  onOpenReport?: () => void;
  onExploreMatches?: () => void;
}) {
  return (
    <div className="w-full bg-white border border-neutral-200/80 rounded-2xl overflow-hidden mb-8 grid grid-cols-1 lg:grid-cols-12 shadow-xs">
      {/* Left 50% Editorial Panel */}
      <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between bg-[#FAFAFA] border-b lg:border-b-0 lg:border-r border-neutral-200/80">
        <div>
          {/* Foundry Uppercase Kicker */}
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-khoj-orange"></span>
            <span className="editorial-kicker text-neutral-600">
              Campus Lost &amp; Found Archive • Spatial Radar Matrix
            </span>
          </div>

          {/* Editorial Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-foundry-950 font-normal tracking-tight leading-[1.15] mb-4">
            Bridging the distance between <span className="italic font-normal">lost</span> &amp; <span className="italic font-normal text-khoj-orange">found</span>.
          </h1>

          <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed max-w-xl font-normal mb-8">
            KhojSetu automatically pairs mislaid campus possessions using category biometric signatures,
            PostGIS spatial proximity, and chronological incident logs—safeguarding claimant privacy with zero public exposure.
          </p>
        </div>

        {/* Foundry Pill CTAs & Metrics */}
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Link
              href="/report"
              className="foundry-pill-primary px-6 py-3 flex items-center gap-2 hover:bg-neutral-800"
            >
              <Plus className="w-4 h-4" />
              <span>Report An Item</span>
            </Link>

            {onExploreMatches && (
              <button
                type="button"
                onClick={onExploreMatches}
                className="foundry-pill-outline px-6 py-3 flex items-center gap-2"
              >
                <span>Explore Radar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Editorial Trust Ticker */}
          <div className="pt-4 border-t border-neutral-200/80 flex items-center gap-6 text-[11px] text-neutral-500 uppercase tracking-wider">
            <div>
              <span className="font-semibold text-foundry-900">350+</span> Campus Items
            </div>
            <span>•</span>
            <div>
              <span className="font-semibold text-foundry-900">98.4%</span> Spatial Match
            </div>
            <span>•</span>
            <div>
              <span className="font-semibold text-foundry-900">100%</span> Private Proof
            </div>
          </div>
        </div>
      </div>

      {/* Right 50% Exhibition Showcase (Foundry Art Frame) */}
      <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col items-center justify-center bg-white relative">
        <div className="w-full max-w-sm bg-white rounded-xl border border-neutral-200 p-5 shadow-foundry-frame relative group hover:border-neutral-400 transition-colors">
          {/* Exhibition Canvas with Matting */}
          <div className="foundry-matting aspect-square rounded-lg p-6 flex flex-col items-center justify-center relative overflow-hidden mb-4">
            <img
              src="/logo-transparent.png"
              alt="KhojSetu Exhibition"
              className="max-h-24 w-auto object-contain opacity-90 group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-3 left-3">
              <span className="bg-foundry-900 text-white text-[9px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full">
                Active Match
              </span>
            </div>
            <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-neutral-600 border border-neutral-200">
              <MapPin className="w-3 h-3 text-khoj-orange" />
              <span className="font-mono">Zone A • Library</span>
            </div>
          </div>

          {/* Exhibition Typography Below Frame */}
          <div className="space-y-1">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
              Live Pair Signal #849
            </div>
            <div className="text-sm font-semibold text-foundry-900 flex items-center justify-between">
              <span>MacBook Pro 14&quot; &amp; Leather Pouch</span>
              <span className="text-xs font-mono font-medium text-emerald-700">98.4% Match</span>
            </div>
            <p className="text-xs text-neutral-500 line-clamp-1 pt-1 font-light">
              Found by Campus Proctor at East Wing Study Cubicle. Verification prompt enabled.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
