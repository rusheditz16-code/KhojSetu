'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { GoogleLogo } from './GoogleSignInModal';
import {
  UserCheck,
  Shield,
  Calendar,
  FolderHeart,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function ProfileFocusView() {
  const { currentUser, isAuthenticated, openLoginModal } = useAuth();

  const daysActivity = [
    { day: 'Mon', count: 4, height: '40%' },
    { day: 'Tue', count: 6, height: '60%' },
    { day: 'Wed', count: 9, height: '90%', active: true },
    { day: 'Thu', count: 5, height: '50%' },
    { day: 'Fri', count: 8, height: '80%' },
    { day: 'Sat', count: 3, height: '30%' },
    { day: 'Sun', count: 2, height: '20%' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Profile Header Card (Matching Hannah Brooks view in video) */}
      <div className="glass-card p-6 sm:p-8 rounded-[32px] border border-white/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 text-white font-black text-2xl flex items-center justify-center shadow-lg ring-4 ring-white">
                {currentUser?.name ? currentUser.name[0] : 'U'}
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center text-[10px] text-slate-950 font-bold">
                ✓
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {currentUser?.name || 'Verified Campus Student'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {currentUser?.role === 'MODERATOR' ? 'Campus Proctor' : 'Verified Student'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{currentUser?.email || 'name@campus.edu'}</p>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400 font-semibold">
                <span>Student ID: {currentUser?.studentId || 'CS-2023-042'}</span>
                <span>•</span>
                <span>Campus SSO Protected</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => openLoginModal('signin')}
              className="px-4 py-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 shadow-2xs flex items-center gap-2 transition"
            >
              <GoogleLogo />
              <span>Switch Account</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Stats Row (Matching video) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Reports Filed
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">12</span>
            <span className="text-[10px] text-emerald-600 font-bold">+2 this week</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Active Claims
            </span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">4</span>
            <span className="text-[10px] text-slate-400 font-medium">Under private review</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Verified Returns
            </span>
            <span className="text-2xl font-black text-purple-600 mt-1 block">9</span>
            <span className="text-[10px] text-purple-600 font-bold">100% Handover Rate</span>
          </div>
        </div>
      </div>

      {/* Focus This Week & Activity Chart (Matching video) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Focus Bar Chart */}
        <div className="lg:col-span-8 glass-card p-6 sm:p-8 rounded-[32px] space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Weekly Engagement
              </div>
              <h3 className="text-lg font-black text-slate-900">Focus this week</h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>05:24 hrs active</span>
            </div>
          </div>

          {/* Daily Bar Chart */}
          <div className="pt-4 flex items-end justify-between gap-3 h-44">
            {daysActivity.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div
                  className={`w-full max-w-[42px] rounded-2xl transition-all duration-300 ${
                    d.active
                      ? 'bg-gradient-to-t from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/30'
                      : 'bg-slate-200 hover:bg-slate-300'
                  }`}
                  style={{ height: d.height }}
                  title={`${d.count} activities on ${d.day}`}
                ></div>
                <span className="text-[11px] font-bold text-slate-500">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Quick Dossier Notes */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-card p-6 rounded-[32px] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Campus Trust Score
            </h4>
            <div className="text-3xl font-black text-slate-900">4.9 / 5.0</div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Earned through 9 verified item handovers and clean proctor moderation audit history.
            </p>
          </div>

          <div className="p-6 rounded-[32px] bg-[#121c1d] text-white space-y-2 shadow-lg">
            <div className="flex items-center gap-2 font-bold text-xs text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span>Match Radar Engine</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              FoundBeacon automatically runs PostGIS distance and keyword clustering in the background.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
