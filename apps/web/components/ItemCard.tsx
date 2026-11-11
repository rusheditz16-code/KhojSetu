'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Calendar, Sparkles, Lock, ArrowRight, CheckCircle2, Clock, Plus } from 'lucide-react';
import { getCategoryLabel, formatTimeAgo } from '../lib/api';

export default function ItemCard({
  item,
  onOpenMatches,
  onOpenClaim,
}: {
  item: any;
  onOpenMatches: (item: any) => void;
  onOpenClaim: (item: any) => void;
}) {
  const isLost = item.type === 'LOST';

  return (
    <div className="foundry-card rounded-xl p-3 sm:p-4 flex flex-col justify-between group relative overflow-hidden">
      <div>
        {/* Exhibition Frame with Matting */}
        <div className="relative aspect-square sm:aspect-[4/3] rounded-lg foundry-matting overflow-hidden mb-3.5 flex items-center justify-center p-3">
          {item.photoUrl ? (
            <img
              src={item.photoUrl}
              alt={item.title}
              className="w-full h-full object-cover rounded shadow-2xs group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded border border-neutral-200/60 p-4 text-center">
              <span className="text-3xl mb-1.5 opacity-80">{isLost ? '🔍' : '📦'}</span>
              <span className="text-[10px] font-semibold tracking-widest uppercase text-neutral-400">
                {isLost ? 'Lost Item' : 'Found Possession'}
              </span>
            </div>
          )}

          {/* Type & Status Badges */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-widest shadow-2xs ${
                isLost
                  ? 'bg-white text-rose-700 border border-rose-200'
                  : 'bg-foundry-900 text-white'
              }`}
            >
              {item.type}
            </span>

            {item.status === 'RETURNED' && (
              <span className="bg-emerald-700 text-white px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" />
                Returned
              </span>
            )}

            {item.status === 'CLAIM_PENDING' && (
              <span className="bg-amber-600 text-white px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                Claim Pending
              </span>
            )}
          </div>

          {/* Category Pill */}
          <div className="absolute top-2.5 right-2.5">
            <span className="bg-white/95 backdrop-blur-xs text-foundry-900 font-medium text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs border border-neutral-200/60">
              {getCategoryLabel(item.category)}
            </span>
          </div>

          {/* Foundry Floating Quick-Action Button on Hover */}
          <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              type="button"
              onClick={() => onOpenMatches(item)}
              title="Quick Match Radar"
              className="w-8 h-8 rounded-full bg-foundry-900 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Private Proof Badge */}
          {item.secretPrompt && (
            <div className="absolute bottom-2.5 left-2.5 bg-foundry-900/90 backdrop-blur-xs text-white text-[9px] font-medium tracking-wider uppercase px-2 py-0.5 rounded flex items-center gap-1">
              <Lock className="w-2.5 h-2.5 text-khoj-orange" />
              <span>Shield Active</span>
            </div>
          )}
        </div>

        {/* Typographic Metadata below Frame */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-neutral-400">
            <span className="truncate">{item.campusArea || 'Main Campus'}</span>
            <span>{formatTimeAgo(item.createdAt)}</span>
          </div>

          <h3 className="text-sm font-semibold text-foundry-900 line-clamp-1 group-hover:text-neutral-700 transition">
            {item.title}
          </h3>

          <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed font-normal pt-0.5">
            {item.description}
          </p>
        </div>
      </div>

      {/* Foundry Hairline Actions Footer */}
      <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onOpenMatches(item)}
          className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-neutral-600 hover:text-foundry-900 transition"
        >
          <Sparkles className="w-3 h-3 text-khoj-orange" />
          <span>Radar</span>
        </button>

        <div className="flex items-center gap-2">
          <Link
            href={`/items/${item.id}`}
            className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 hover:text-foundry-900 transition"
          >
            Details
          </Link>

          {item.status === 'OPEN' && (
            <button
              type="button"
              onClick={() => onOpenClaim(item)}
              className="foundry-pill-primary px-3 py-1 flex items-center gap-1 text-[10px]"
            >
              <span>Claim</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
