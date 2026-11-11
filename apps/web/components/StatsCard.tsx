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
    <div className="foundry-card p-5 rounded-xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <span className="editorial-kicker">{title}</span>
        <div className="w-8 h-8 rounded-full bg-neutral-100 text-foundry-900 flex items-center justify-center border border-neutral-200">
          <Icon className="w-4 h-4 stroke-[1.75]" />
        </div>
      </div>

      <div>
        <div className="text-3xl sm:text-4xl font-serif text-foundry-950 tracking-tight font-normal">
          {value}
        </div>

        <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-xs">
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-[11px] font-semibold ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
              {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              <span>{change}%</span>
            </div>
          )}

          {subtitle && <span className="text-neutral-400 text-[10px] uppercase tracking-wider truncate">{subtitle}</span>}
          {badge && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider bg-neutral-100 text-neutral-700">
              {badge}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
