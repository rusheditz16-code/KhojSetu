'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Calendar, Sparkles, Lock, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
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
    <div className="glass-card glass-card-hover rounded-3xl p-4 flex flex-col justify-between group">
      <div>
        {/* Image Container with Rounded Corners */}
        <div className="relative aspect-16/10 rounded-2xl bg-slate-100 overflow-hidden mb-3.5 shadow-inner">
          {item.photoUrl ? (
            <img
              src={item.photoUrl}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 p-4 text-center">
              <span className="text-3xl mb-1">{isLost ? '🔍' : '📍'}</span>
              <span className="text-[11px] font-semibold text-slate-500">Campus Report</span>
            </div>
          )}

          {/* Type & Status Badges */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm text-white ${
                isLost ? 'bg-rose-500' : 'bg-emerald-500 text-slate-950 font-bold'
              }`}
            >
              {item.type}
            </span>

            {item.status === 'RETURNED' && (
              <span className="bg-purple-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm">
                <CheckCircle2 className="w-3 h-3" />
                Returned
              </span>
            )}

            {item.status === 'CLAIM_PENDING' && (
              <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm">
                <Clock className="w-3 h-3" />
                Claim Pending
              </span>
            )}
          </div>

          {/* Category Pill */}
          <div className="absolute top-2.5 right-2.5">
            <span className="bg-white/95 backdrop-blur-xs text-slate-800 font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-2xs border border-white/60">
              {getCategoryLabel(item.category)}
            </span>
          </div>

          {/* Private Proof Notice */}
          {item.secretPrompt && (
            <div className="absolute bottom-2 left-2.5 bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>Private Proof Shield</span>
            </div>
          )}
        </div>

        {/* Content */}
        <h3 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition">
          {item.title}
        </h3>

        <div className="mt-1.5 space-y-1 text-xs text-slate-500">
          <div className="flex items-center gap-1 text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate font-semibold text-[11px]">{item.campusArea}</span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(item.incidentDate).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <span>{formatTimeAgo(item.createdAt)}</span>
          </div>
        </div>

        <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {item.description}
        </p>
      </div>

      {/* Actions Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onOpenMatches(item)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Match Radar</span>
        </button>

        <div className="flex items-center gap-1.5">
          <Link
            href={`/items/${item.id}`}
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            Details
          </Link>

          {item.status === 'OPEN' && (
            <button
              type="button"
              onClick={() => onOpenClaim(item)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-emerald-600 transition shadow-xs"
            >
              <span>Claim</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
