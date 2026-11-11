'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, Check, ArrowRight, UserCircle2, Mail, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function GoogleLogo() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
  const [error, setError] = useState<string | null>(null);

  if (!isLoginModalOpen) return null;

  const handleQuickLogin = async (u: any) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await loginWithGoogle({
        email: u.email,
        name: u.name,
        role: u.role,
      });
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = customEmail.trim();
    if (!email) {
      setError('Please enter your Google account email.');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address (e.g. name@gmail.com).');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await loginWithGoogle({
        email,
        name: customName.trim() || undefined,
      });
      setCustomEmail('');
      setCustomName('');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-foundry-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="google-auth-title"
    >
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-foundry-900 text-white relative">
          <button
            type="button"
            onClick={closeLoginModal}
            aria-label="Close dialog"
            className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2.5">
            <div className="h-7 px-2.5 bg-white rounded flex items-center shadow-xs">
              <img
                src="/logo-transparent.png"
                alt="KhojSetu"
                className="h-5 w-auto object-contain"
              />
            </div>
            <span className="editorial-kicker text-neutral-400">
              Identity Verification
            </span>
          </div>

          <h2 id="google-auth-title" className="text-xl sm:text-2xl font-serif font-normal">
            Sign in with Google
          </h2>
          <p className="text-xs text-neutral-400 mt-1 font-light leading-relaxed">
            Use any Google / Gmail account or university email to post reports and claim items privately.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Primary Action: Sign in with ANY Google Account */}
          <form onSubmit={handleCustomLogin} className="space-y-3.5">
            <div>
              <label htmlFor="google-email-input" className="editorial-kicker text-foundry-900 block mb-1">
                Google Account / Gmail <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="google-email-input"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="yourname@gmail.com or campus.edu"
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-300 focus:border-foundry-900 focus:ring-1 focus:ring-foundry-900 outline-none transition bg-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="google-name-input" className="editorial-kicker text-foundry-900 block mb-1">
                Your Name <span className="text-neutral-400 font-normal lowercase">(optional)</span>
              </label>
              <div className="relative">
                <UserCircle2 className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="google-name-input"
                  type="text"
                  autoComplete="name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-300 focus:border-foundry-900 focus:ring-1 focus:ring-foundry-900 outline-none transition bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full foundry-pill-primary py-3 px-4 flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg disabled:opacity-50 text-xs sm:text-sm"
            >
              <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0">
                <GoogleLogo />
              </div>
              <span>{isSubmitting ? 'Verifying with Google...' : 'Continue with Google Account'}</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center pt-1">
            <div className="border-t border-neutral-200 w-full"></div>
            <span className="bg-white px-3 editorial-kicker text-neutral-400 relative">
              Or Choose A Demo Persona
            </span>
          </div>

          {/* Quick Demo Persona Switcher */}
          <div className="space-y-2">
            {usersList.slice(0, 3).map((u) => (
              <button
                key={u.id}
                type="button"
                disabled={isSubmitting}
                onClick={() => handleQuickLogin(u)}
                className={`w-full p-2.5 sm:p-3 rounded-xl border transition flex items-center justify-between text-left group active:scale-[0.99] ${
                  currentUser?.id === u.id
                    ? 'border-foundry-900 bg-neutral-100 ring-1 ring-foundry-900'
                    : 'border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 bg-neutral-50/50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-foundry-900 text-white flex items-center justify-center font-semibold text-xs shrink-0">
                    {u.name[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-foundry-900 flex items-center gap-1.5 truncate">
                      <span className="truncate">{u.name}</span>
                      {u.role === 'MODERATOR' && (
                        <span className="text-[9px] font-semibold uppercase tracking-wider bg-neutral-200 text-foundry-900 px-1.5 py-0.2 rounded shrink-0">
                          Curator
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-neutral-500 font-mono truncate">{u.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 pl-2">
                  <GoogleLogo />
                  {currentUser?.id === u.id ? (
                    <Check className="w-4 h-4 text-foundry-900" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-foundry-900 transition-transform group-hover:translate-x-0.5" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Privacy Guarantee Footer */}
          <div className="pt-3 border-t border-neutral-100 flex items-start gap-2 text-[11px] text-neutral-500 font-light">
            <ShieldCheck className="w-3.5 h-3.5 text-khoj-orange shrink-0 mt-0.5" />
            <span>
              Identity protected: KhojSetu never sees your password. Distinguishing ownership answers and phone contacts stay 100% private.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
