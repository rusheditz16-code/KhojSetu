'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { GoogleLogo } from './GoogleSignInModal';
import {
  Search,
  Bell,
  Plus,
  Sparkles,
  LogOut,
  User,
  FolderHeart,
} from 'lucide-react';
import { formatTimeAgo } from '../lib/api';

export default function DashboardHeader({
  onSearch,
}: {
  onSearch?: (q: string) => void;
}) {
  const router = useRouter();
  const { currentUser, isAuthenticated, openLoginModal, logout } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifMenu(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchValue);
    } else {
      router.push(`/?search=${encodeURIComponent(searchValue)}`);
    }
  };

  return (
    <header className="px-3 sm:px-8 py-3 sm:py-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 border-b border-neutral-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-20">
      {/* Left: Brand Identity & Search input */}
      <div className="flex items-center gap-3 sm:gap-6 flex-1 max-w-xl">
        <Link href="/" className="shrink-0 flex items-center">
          <img
            src="/logo-transparent.png"
            alt="KhojSetu"
            className="h-7 sm:h-9 w-auto object-contain"
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
            placeholder="Search reports, items, campus zones..."
            className="w-full pl-9 pr-3 py-1.5 sm:py-2 rounded-full bg-neutral-100 hover:bg-neutral-50 focus:bg-white border border-transparent focus:border-foundry-900 text-xs text-foundry-900 placeholder-neutral-400 transition outline-none"
          />
        </form>
      </div>

      {/* Right: Notifications, Auth Controls & Report Pill */}
      <div className="flex items-center justify-between md:justify-end gap-2 sm:gap-3 shrink-0">
        {/* Notifications Bell */}
        <div className="relative" ref={notifRef}>
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

        {/* User Authentication Status */}
        {isAuthenticated && currentUser ? (
          <div className="relative" ref={userRef}>
            <button
              type="button"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 pl-2 sm:border-l border-neutral-200 text-left active:scale-95"
              aria-label="User account menu"
            >
              <div className="w-8 h-8 rounded-full bg-foundry-900 text-white font-semibold text-xs flex items-center justify-center shrink-0 border border-neutral-700">
                {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:block text-right">
                <div className="text-xs font-semibold text-foundry-900 max-w-[120px] truncate">{currentUser.name}</div>
                <div className="text-[9px] text-neutral-400 font-mono truncate max-w-[120px]">
                  {currentUser.email}
                </div>
              </div>
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-foundry-900 rounded-xl shadow-2xl border border-neutral-200 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="text-xs font-semibold text-foundry-900 truncate">{currentUser.name}</div>
                <div className="text-[11px] text-neutral-400 font-mono truncate mt-0.5">{currentUser.email}</div>

                <div className="mt-3 pt-2 border-t border-neutral-100 space-y-1.5">
                  <Link
                    href="/my-posts"
                    onClick={() => setShowUserDropdown(false)}
                    className="w-full text-left text-xs font-medium text-neutral-700 hover:text-foundry-900 py-1.5 px-2 rounded-lg hover:bg-neutral-50 flex items-center gap-2"
                  >
                    <FolderHeart className="w-3.5 h-3.5" />
                    <span>My Dossier &amp; Claims</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setShowUserDropdown(false);
                      openLoginModal('signin');
                    }}
                    className="w-full text-left text-xs font-medium text-neutral-700 hover:text-foundry-900 py-1.5 px-2 rounded-lg hover:bg-neutral-50 flex items-center justify-between"
                  >
                    <span>Switch Google Account</span>
                    <GoogleLogo />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowUserDropdown(false);
                      logout();
                    }}
                    className="w-full text-left text-xs font-semibold text-rose-600 hover:text-rose-700 py-1.5 px-2 rounded-lg hover:bg-rose-50 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => openLoginModal('signin')}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-white hover:bg-neutral-50 border border-neutral-300 text-xs font-semibold text-foundry-900 shadow-2xs transition active:scale-95"
            >
              <GoogleLogo />
              <span className="text-[11px] uppercase tracking-wider font-semibold">Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => openLoginModal('signup')}
              className="hidden sm:inline-flex items-center px-3.5 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-foundry-900 text-[11px] font-semibold uppercase tracking-wider transition"
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Report Button (Foundry pill style) */}
        <Link
          href="/report"
          className="foundry-pill-primary px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-1 shadow-sm hover:shadow text-[10px] sm:text-[11px]"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden xs:inline">Report Item</span>
          <span className="xs:hidden">Report</span>
        </Link>
      </div>
    </header>
  );
}
