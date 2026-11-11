'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { GoogleLogo } from './GoogleSignInModal';
import {
  Compass,
  PlusCircle,
  FolderHeart,
  ShieldAlert,
  Bell,
  Check,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  LogOut,
  UserCheck,
  Shield,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { formatTimeAgo } from '../lib/api';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentUser,
    isAuthenticated,
    logout,
    openLoginModal,
    isModerator,
  } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Demo Bar & Campus SSO Status */}
      <div className="bg-slate-900 text-slate-200 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-slate-100">KhojSetu • FoundBeacon</span>
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="hidden sm:inline text-slate-300">
            University Campus Single Sign-On (Google Workspace Enabled)
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">{currentUser?.name}</span>
              {currentUser?.role === 'MODERATOR' && (
                <span className="bg-amber-400/20 text-amber-300 text-[10px] px-1.5 py-0.5 rounded font-bold">
                  Proctor
                </span>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openLoginModal('signin')}
              className="text-white hover:text-emerald-400 font-semibold transition"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 focus:outline-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">KhojSetu</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                  FoundBeacon
                </span>
              </div>
              <div className="text-[11px] font-medium text-slate-500 leading-none">
                Campus Lost & Found Bridge
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
            <Link
              href="/"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
                pathname === '/'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Compass className="w-4 h-4" />
              Browse Items
            </Link>

            <Link
              href="/report"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
                pathname === '/report'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-blue-600" />
              Report Item
            </Link>

            <Link
              href="/my-posts"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
                pathname === '/my-posts'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FolderHeart className="w-4 h-4 text-emerald-600" />
              My Reports & Claims
            </Link>

            {isModerator && (
              <Link
                href="/moderator"
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
                  pathname === '/moderator'
                    ? 'bg-amber-100 text-amber-900'
                    : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Moderator Desk
              </Link>
            )}
          </nav>

          {/* Right Section: Google Sign-In or User Profile Dropdown + Alerts */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                aria-label={`Notifications, ${unreadCount} unread`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">Campus Alerts</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-slate-400 text-xs">
                        No notifications yet. You will be alerted when a match or claim appears!
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markRead(n.id);
                            setShowNotifications(false);
                            if (n.linkUrl) router.push(n.linkUrl);
                          }}
                          className={`p-3 text-left cursor-pointer transition flex items-start gap-3 hover:bg-slate-50 ${
                            !n.isRead ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate">{n.title}</div>
                            <div className="text-xs text-slate-600 line-clamp-2 mt-0.5">{n.message}</div>
                            <div className="text-[10px] text-slate-400 mt-1">{formatTimeAgo(n.createdAt)}</div>
                          </div>
                          {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0"></span>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Google Auth Status / Button */}
            {isAuthenticated && currentUser ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2.5 p-1 sm:px-3 sm:py-1.5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition shadow-2xs group"
                  aria-expanded={showUserDropdown}
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-blue-500/20">
                    {currentUser.name ? currentUser.name[0] : 'U'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition flex items-center gap-1.5">
                      <span>{currentUser.name}</span>
                      {isModerator && (
                        <span className="text-[9px] font-extrabold bg-amber-100 text-amber-900 px-1 rounded">
                          Proctor
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[120px]">
                      {currentUser.email}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition" />
                </button>

                {/* User Dropdown */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <GoogleLogo />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Google Account
                        </span>
                      </div>
                      <div className="font-bold text-sm text-slate-900 mt-1">{currentUser.name}</div>
                      <div className="text-xs text-slate-500 truncate">{currentUser.email}</div>
                      <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        <UserCheck className="w-3 h-3 text-blue-600" />
                        <span>{currentUser.role === 'MODERATOR' ? 'Campus Proctor Desk' : 'Verified Student'}</span>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/my-posts"
                        onClick={() => setShowUserDropdown(false)}
                        className="px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                      >
                        <FolderHeart className="w-4 h-4 text-emerald-600" />
                        <span>My Reports & Claims</span>
                      </Link>

                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          openLoginModal();
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                      >
                        <GoogleLogo />
                        <span>Switch Google Workspace Account</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openLoginModal('signin')}
                className="flex items-center gap-2.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs hover:shadow transition active:scale-98"
                aria-label="Sign in with Google"
              >
                <GoogleLogo />
                <span className="hidden sm:inline font-bold">Sign in with Google</span>
                <span className="sm:hidden font-bold">Sign in</span>
              </button>
            )}

            {/* Mobile Hamburger */}
            <div className="md:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2">
          {!isAuthenticated && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openLoginModal();
              }}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs flex items-center justify-center gap-2 transition"
            >
              <GoogleLogo />
              <span>Sign in with Google Workspace</span>
            </button>
          )}

          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2"
          >
            <Compass className="w-4 h-4" />
            Browse Items
          </Link>
          <Link
            href="/report"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-blue-600" />
            Report Item
          </Link>
          <Link
            href="/my-posts"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2"
          >
            <FolderHeart className="w-4 h-4 text-emerald-600" />
            My Reports & Claims
          </Link>
          {isModerator && (
            <Link
              href="/moderator"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Moderator Desk
            </Link>
          )}

          {isAuthenticated && (
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out ({currentUser?.name})</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}