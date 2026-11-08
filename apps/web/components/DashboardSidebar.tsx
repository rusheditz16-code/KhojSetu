'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { GoogleLogo } from './GoogleSignInModal';
import {
  Compass,
  LayoutGrid,
  PlusCircle,
  FolderHeart,
  ShieldAlert,
  Sparkles,
  LogOut,
  UserCheck,
  Search,
} from 'lucide-react';

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { currentUser, isAuthenticated, isModerator, openLoginModal, logout } = useAuth();

  const navLinks = [
    { href: '/', label: 'Overview', icon: LayoutGrid, exact: true },
    { href: '/report', label: 'Report Item', icon: PlusCircle },
    { href: '/my-posts', label: 'My Dossier & Claims', icon: FolderHeart },
    ...(isModerator ? [{ href: '/moderator', label: 'Moderator Desk', icon: ShieldAlert }] : []),
  ];

  return (
    <aside className="w-full lg:w-[76px] bg-[#121c1d] text-white flex lg:flex-col items-center justify-between p-3 lg:py-6 lg:px-2 shrink-0 border-b lg:border-b-0 lg:border-r border-white/5 z-30">
      {/* Top: Brand Logo */}
      <div className="flex lg:flex-col items-center gap-4">
        <Link
          href="/"
          className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-emerald-500/25 hover:scale-105 transition-transform"
          title="KhojSetu FoundBeacon"
        >
          <span className="font-mono text-xl tracking-tighter">K</span>
        </Link>

        {/* Desktop Nav Items */}
        <nav className="hidden lg:flex flex-col items-center gap-2 mt-4" aria-label="Sidebar Navigation">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all group ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 shadow-inner border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                title={link.label}
              >
                <Icon className="w-5 h-5" />
                {isActive && (
                  <span className="absolute -left-1 w-1.5 h-5 rounded-r-full bg-emerald-400"></span>
                )}
                {/* Tooltip on hover */}
                <span className="absolute left-16 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-xl border border-white/10 z-50">
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile Links Row */}
      <nav className="flex lg:hidden items-center gap-1">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`p-2 rounded-xl transition ${
                isActive ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Profile & Google SSO */}
      <div className="flex lg:flex-col items-center gap-3">
        {isAuthenticated && currentUser ? (
          <div className="relative group">
            <button
              type="button"
              className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center ring-2 ring-emerald-400/30 shadow-md group-hover:scale-105 transition-transform"
              title={`${currentUser.name} (${currentUser.role})`}
            >
              {currentUser.name ? currentUser.name[0] : 'U'}
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#121c1d]"></span>
            </button>

            {/* Hover Menu */}
            <div className="absolute bottom-12 lg:bottom-0 left-auto right-0 lg:left-14 lg:right-auto w-56 bg-slate-900 text-white rounded-2xl shadow-2xl border border-white/10 p-3 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-50">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                <GoogleLogo />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Campus Identity
                </span>
              </div>
              <div className="text-xs font-bold truncate text-white">{currentUser.name}</div>
              <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
              <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={openLoginModal}
                  className="text-[11px] text-emerald-400 hover:underline font-semibold"
                >
                  Switch User
                </button>
                <button
                  onClick={logout}
                  className="text-[11px] text-rose-400 hover:underline font-semibold flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={openLoginModal}
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition group relative"
            title="Sign in with Google"
          >
            <GoogleLogo />
            <span className="absolute left-14 px-2 py-1 rounded-md bg-slate-900 text-white text-[11px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Sign in with Google
            </span>
          </button>
        )}
      </div>
    </aside>
  );
}
