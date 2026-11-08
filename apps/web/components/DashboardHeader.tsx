'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { GoogleLogo } from './GoogleSignInModal';
import {
  Search,
  Bell,
  Plus,
  ChevronDown,
  Check,
  Sparkles,
  Shield,
  Layers,
  GraduationCap,
  Calendar,
} from 'lucide-react';
import { formatTimeAgo } from '../lib/api';

export default function DashboardHeader({
  onSearch,
}: {
  onSearch?: (q: string) => void;
}) {
  const router = useRouter();
  const { currentUser, usersList, switchUser, isAuthenticated, openLoginModal, logout, isModerator } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchValue);
    } else {
      router.push(`/?search=${encodeURIComponent(searchValue)}`);
    }
  };

  return (
    <header className="px-4 sm:px-8 py-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-slate-200/70 bg-white/70 backdrop-blur-md sticky top-0 z-20">
      {/* Left: Search input */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              if (onSearch) onSearch(e.target.value);
            }}
            placeholder="Search lost & found reports, categories, campus areas..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-emerald-500 text-xs text-slate-800 placeholder-slate-400 transition outline-none"
          />
        </form>
      </div>

      {/* Right: Persona Switcher, Notifications & Google SSO */}
      <div className="flex items-center justify-between md:justify-end gap-2.5 shrink-0">
        {/* Persona quick-switch (for demo testing) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold border border-slate-200/60 transition"
          >
            <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline text-slate-500">Persona:</span>
            <strong className="text-slate-900 truncate max-w-[100px]">
              {currentUser?.name?.split(' ')[0] || 'Demo'}
            </strong>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showPersonaMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Select Campus Persona
              </div>
              {usersList.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    switchUser(u.id);
                    setShowPersonaMenu(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 transition ${
                    u.id === currentUser?.id ? 'bg-emerald-50/80 font-bold text-emerald-800' : 'text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-slate-900">{u.name}</div>
                    <div className="text-[10px] text-slate-400">
                      {u.role === 'MODERATOR' ? 'Campus Proctor' : u.email}
                    </div>
                  </div>
                  {u.id === currentUser?.id && <Check className="w-4 h-4 text-emerald-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 transition"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-black text-white ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-900">
                  Campus Alerts & Matches
                </span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[11px] font-bold text-emerald-600 hover:underline">
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 mt-2">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No new alerts. Match suggestions and claims will appear here!
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markRead(n.id);
                        setShowNotifMenu(false);
                        if (n.linkUrl) router.push(n.linkUrl);
                      }}
                      className={`py-2.5 px-2 rounded-xl cursor-pointer hover:bg-slate-50 transition flex items-start gap-3 ${
                        !n.isRead ? 'bg-emerald-50/50' : ''
                      }`}
                    >
                      <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">{n.title}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{n.message}</div>
                        <div className="text-[10px] text-slate-400 mt-1">{formatTimeAgo(n.createdAt)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action: Google Sign In or Profile */}
        {isAuthenticated && currentUser ? (
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-900">{currentUser.name}</div>
              <div className="text-[10px] text-emerald-600 font-semibold">{currentUser.role === 'MODERATOR' ? 'Campus Proctor' : 'Verified Student'}</div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={openLoginModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 shadow-2xs transition active:scale-98"
          >
            <GoogleLogo />
            <span className="hidden sm:inline">Sign in with Google</span>
          </button>
        )}

        {/* Report Button (Dashboard V22 emerald style) */}
        <Link
          href="/report"
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition active:scale-98"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Report Item</span>
        </Link>
      </div>
    </header>
  );
}
