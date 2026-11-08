'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, Check, Sparkles, Building2, UserCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function GoogleLogo() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function GoogleSignInModal() {
  const { isLoginModalOpen, closeLoginModal, loginWithGoogle, usersList, currentUser } = useAuth();
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleQuickLogin = async (u: any) => {
    try {
      setIsSubmitting(true);
      await loginWithGoogle({
        email: u.email,
        name: u.name,
        role: u.role,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customName) return;
    try {
      setIsSubmitting(true);
      await loginWithGoogle({
        email: customEmail.trim(),
        name: customName.trim(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="google-auth-title"
    >
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="p-6 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white relative">
          <button
            type="button"
            onClick={closeLoginModal}
            className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-xs">
              <GoogleLogo />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-400/20">
              Campus Identity Provider
            </span>
          </div>

          <h2 id="google-auth-title" className="text-xl font-black">
            Sign in with Google
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Access KhojSetu using your official institutional university Google Workspace account.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Official Google Button Look */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Choose Verified Campus Account
            </span>

            <div className="space-y-2">
              {usersList.slice(0, 3).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleQuickLogin(u)}
                  className={`w-full p-3 rounded-2xl border transition flex items-center justify-between text-left group ${
                    currentUser?.id === u.id
                      ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs border border-slate-200 group-hover:scale-105 transition-transform">
                      {u.name[0]}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{u.name}</span>
                        {u.role === 'MODERATOR' && (
                          <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                            Proctor
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">{u.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <GoogleLogo />
                    {currentUser?.id === u.id && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider relative">
              Or Sign in with another @campus.edu
            </span>
          </div>

          {/* Custom Google account sign-in form */}
          <form onSubmit={handleCustomLogin} className="space-y-3">
            <div>
              <label htmlFor="google-name" className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                id="google-name"
                type="text"
                required
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Neha Gupta"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="google-email" className="block text-xs font-semibold text-slate-700 mb-1">
                Google Workspace Email
              </label>
              <input
                id="google-email"
                type="email"
                required
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="name@campus.edu"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs flex items-center justify-center gap-2 transition"
            >
              <GoogleLogo />
              <span>Continue with Google</span>
            </button>
          </form>

          {/* Privacy Guarantee Footer */}
          <div className="pt-2 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              SSO protected: FoundBeacon never receives your password. Identifying claim details are shielded from other students.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
