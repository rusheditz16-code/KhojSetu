'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { GoogleLogo } from './GoogleSignInModal';
import {
  LayoutGrid,
  PlusCircle,
  FolderHeart,
  ShieldAlert,
  LogOut,
  Compass,
} from 'lucide-react';

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { currentUser, isAuthenticated, isModerator, openLoginModal, logout } = useAuth();

  const navLinks = [
    { href: '/', label: 'Exhibits & Feed', icon: LayoutGrid, exact: true },
    { href: '/report', label: 'Report Lost / Found', icon: PlusCircle },
    { href: '/my-posts', label: 'My Dossier & Claims', icon: FolderHeart },
    ...(isModerator ? [{ href: '/moderator', label: 'Curator Desk', icon: ShieldAlert }] : []),
  ];

  return (
    <aside className="w-full lg:w-[84px] bg-[#121212] text-white flex lg:flex-col items-center justify-between p-3 lg:py-6 lg:px-2 shrink-0 border-b lg:border-b-0 lg:border-r border-neutral-800 z-30">
      {/* Top: Brand Logo Mark */}
      <div className="flex lg:flex-col items-center gap-5">
        <Link
          href="/"
          className="relative w-12 h-12 rounded-xl bg-white flex items-center justify-center p-1 shadow-xs hover:scale-105 transition-transform"
          title="KhojSetu • Bridging Lost & Found"
        >
          <img
            src="/logo-icon-transparent.png"
            alt="KhojSetu"
            className="w-10 h-10 object-contain"
          />
        </Link>

        {/* Desktop Nav Items */}
        <nav className="hidden lg:flex flex-col items-center gap-2 mt-2" aria-label="Sidebar Navigation">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all group ${
                  isActive
                    ? 'bg-white text-foundry-900 shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/80'
                }`}
                title={link.label}
              >
                <Icon className="w-5 h-5 stroke-[1.75]" />
                {isActive && (
                  <span className="absolute -left-2 w-1 h-5 rounded-r-full bg-khoj-orange"></span>
                )}
                {/* Tooltip on hover */}
                <span className="absolute left-16 px-3 py-1.5 rounded-lg bg-foundry-950 text-white text-[11px] font-medium tracking-wider uppercase whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-2xl border border-neutral-800 z-50">
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile Links Row */}
      <nav className="flex lg:hidden items-center gap-1.5">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`p-2.5 rounded-xl transition ${
                isActive ? 'bg-white text-foundry-900' : 'text-neutral-400 hover:text-white'
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
              className="relative w-10 h-10 rounded-full bg-neutral-800 text-white font-semibold text-xs flex items-center justify-center border border-neutral-700 hover:border-white transition-colors"
              title={`${currentUser.name} (${currentUser.role})`}
            >
              {currentUser.name ? currentUser.name[0] : 'U'}
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-khoj-orange border-2 border-foundry-900"></span>
            </button>

            {/* Hover Menu */}
            <div className="absolute bottom-12 lg:bottom-0 left-auto right-0 lg:left-14 lg:right-auto w-60 bg-foundry-900 text-white rounded-xl shadow-2xl border border-neutral-800 p-4 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-50">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-neutral-800">
                <GoogleLogo />
                <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
                  Verified Identity
                </span>
              </div>
              <div className="text-xs font-semibold truncate text-white">{currentUser.name}</div>
              <div className="text-[11px] text-neutral-400 truncate mt-0.5">{currentUser.email}</div>
              <div className="mt-3 pt-3 border-t border-neutral-800 flex items-center justify-between text-[11px]">
                <button
                  onClick={openLoginModal}
                  className="text-neutral-300 hover:text-white tracking-wider uppercase text-[10px] font-semibold"
                >
                  Switch User
                </button>
                <button
                  onClick={logout}
                  className="text-rose-400 hover:text-rose-300 tracking-wider uppercase text-[10px] font-semibold flex items-center gap-1"
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
            className="w-10 h-10 rounded-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 flex items-center justify-center transition group relative"
            title="Sign in with Google"
          >
            <GoogleLogo />
            <span className="absolute left-14 px-2.5 py-1 rounded bg-foundry-950 text-white text-[10px] uppercase tracking-wider font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-neutral-800">
              Sign In
            </span>
          </button>
        )}
      </div>
    </aside>
  );
}
