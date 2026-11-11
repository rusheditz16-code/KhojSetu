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
  Layers,
  GraduationCap,
} from 'lucide-react';
import { formatTimeAgo } from '../lib/api';

export default function DashboardHeader({
  onSearch,
}: {
  onSearch?: (q: string) => void;
}) {
  const router = useRouter();
  const { currentUser, usersList, switchUser, isAuthenticated, openLoginModal, logout } = useAuth();
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
    <header className="px-4 sm:px-8 py-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-neutral-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-20">
      {/* Left: Brand Identity & Search input */}
      <div className="flex items-center gap-6 flex-1 max-w-xl">
        <Link href="/" className="shrink-0 flex items-center">
          <img
            src="/logo-transparent.png"
            alt="KhojSetu"
            className="h-8 sm:h-9 w-auto object-contain"
          />
        </Link>

        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              if (onSearch) onSearch(e.target.value);
            }}
            placeholder="Search reports, models, items, campus zones..."
            className="w-full pl-9 pr-4 py-2 rounded-full bg-neutral-100 hover:bg-neutral-50 focus:bg-white border border-transparent focus:border-foundry-900 text-xs text-foundry-900 placeholder-neutral-400 transition outline-none"
          />
        </form>
      </div>

      {/* Right: Persona Switcher, Notifications & Foundry Pill CTAs */}
      <div className="flex items-center justify-between md:justify-end gap-2.5 shrink-0">
        {/* Persona quick-switch (for demo testing) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium border border-neutral-200 transition"
          >
            <GraduationCap className="w-3.5 h-3.5 text-neutral-500" />
            <span className="hidden sm:inline text-neutral-400 text-[10px] uppercase tracking-wider">Persona:</span>
            <strong className="text-foundry-900 text-xs font-semibold truncate max-w-[100px]">
              {currentUser?.name?.split(' ')[0] || 'Demo'}
            </strong>
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          </button>

          {showPersonaMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white text-foundry-900 rounded-xl shadow-xl border border-neutral-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3.5 py-1.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 mb-1">
                Select Campus Persona
              </div>
              {usersList.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    switchUser(u.id);
                    setShowPersonaMenu(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-neutral-50 transition ${
                    u.id === currentUser?.id ? 'bg-neutral-100 font-semibold text-foundry-950' : 'text-neutral-700'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-foundry-900">{u.name}</div>
                    <div className="text-[10px] text-neutral-400">
                      {u.role === 'MODERATOR' ? 'Campus Proctor / Curator' : u.email}
                    </div>
                  </div>
                  {u.id === currentUser?.id && <Check className="w-4 h-4 text-foundry-900" />}
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
            className="relative p-2 rounded-full bg-white hover:bg-neutral-100 text-neutral-600 border border-neutral-200 transition"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-khoj-orange text-[8px] font-bold text-white ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-neutral-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <span className="font-semibold text-xs uppercase tracking-widest text-foundry-900">
                  Radar Notifications
                </span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 hover:text-foundry-900">
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100 mt-2">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-neutral-400">
                    No new alerts. Match suggestions and ownership claims will appear here.
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
                      className={`py-2.5 px-2 rounded-lg cursor-pointer hover:bg-neutral-50 transition flex items-start gap-3 ${
                        !n.isRead ? 'bg-neutral-50' : ''
                      }`}
                    >
                      <div className="w-7 h-7 rounded-full bg-foundry-900 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-foundry-900 truncate">{n.title}</div>
                        <div className="text-[11px] text-neutral-500 line-clamp-2 mt-0.5">{n.message}</div>
                        <div className="text-[10px] text-neutral-400 mt-1 uppercase tracking-wider">{formatTimeAgo(n.createdAt)}</div>
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
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-neutral-200">
            <div className="text-right">
              <div className="text-xs font-semibold text-foundry-900">{currentUser.name}</div>
              <div className="text-[10px] text-neutral-400 uppercase tracking-wider">{currentUser.role === 'MODERATOR' ? 'Curator Desk' : 'Verified Member'}</div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={openLoginModal}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-neutral-50 border border-neutral-300 text-xs font-medium text-foundry-900 shadow-2xs transition"
          >
            <GoogleLogo />
            <span className="hidden sm:inline text-[11px] uppercase tracking-wider font-semibold">Sign in</span>
          </button>
        )}

        {/* Report Button (Foundry pill style) */}
        <Link
          href="/report"
          className="foundry-pill-primary px-4 py-2 flex items-center gap-1.5 shadow-sm hover:shadow"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Report Item</span>
        </Link>
      </div>
    </header>
  );
}
