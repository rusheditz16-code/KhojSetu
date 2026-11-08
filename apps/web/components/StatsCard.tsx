'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, LucideIcon } from 'lucide-react';

export default function StatsCard({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  subtitle,
  badge,
}: {
  title: string;
  value: string | number;
  change?: string | number;
  isPositive?: boolean;
  icon: LucideIcon;
  subtitle?: string;
  badge?: string;
}) {
  return (
    <div className="glass-card glass-card-hover p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div>
        <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{value}</div>

        <div className="mt-2 flex items-center justify-between text-xs">
          {change !== undefined && (
            <div className={`flex items-center gap-1 font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              <span>{change}%</span>
            </div>
          )}

          {subtitle && <span className="text-slate-400 text-[11px] truncate">{subtitle}</span>}
          {badge && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
              {badge}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
