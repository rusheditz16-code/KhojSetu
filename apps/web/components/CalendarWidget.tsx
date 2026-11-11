'use client';

import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarWidget({
  onSelectDate,
}: {
  onSelectDate?: (dateStr: string) => void;
}) {
  const [selectedDay, setSelectedDay] = useState(11);

  const days = [
    { day: 'M', date: 9 },
    { day: 'T', date: 10 },
    { day: 'W', date: 11, hasItems: true, isToday: true },
    { day: 'T', date: 12, hasItems: true },
    { day: 'F', date: 13, hasItems: true },
    { day: 'S', date: 14 },
    { day: 'S', date: 15 },
  ];

  return (
    <div className="foundry-card p-5 rounded-xl space-y-4">
      {/* Month Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-3.5 h-3.5 text-neutral-500" />
          <h3 className="editorial-kicker text-foundry-900">
            November, 2026
          </h3>
        </div>
        <div className="flex items-center gap-1 text-neutral-400">
          <button className="p-1 hover:text-foundry-900 transition">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 hover:text-foundry-900 transition">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Weekday Row */}
      <div className="grid grid-cols-7 gap-1.5 text-center">
        {days.map((d, i) => {
          const isSelected = selectedDay === d.date;
          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                setSelectedDay(d.date);
                if (onSelectDate) onSelectDate(`2026-11-${d.date}`);
              }}
              className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all ${
                isSelected
                  ? 'bg-foundry-900 text-white shadow-2xs font-semibold'
                  : 'hover:bg-neutral-100 text-neutral-600'
              }`}
            >
              <span className="text-[10px] uppercase tracking-wider text-neutral-400">{d.day}</span>
              <span className="text-xs font-mono">{d.date}</span>
              {d.hasItems && (
                <span
                  className={`w-1 h-1 rounded-full ${
                    isSelected ? 'bg-khoj-orange' : 'bg-neutral-400'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Incident Log Timeline Status */}
      <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-500 uppercase tracking-wider">
        <span>Campus Logs Synchronized</span>
        <span className="font-mono text-neutral-700">14 Active</span>
      </div>
    </div>
  );
}
