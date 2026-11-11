'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, ShieldCheck, Mail, Lock, UserCircle2, AlertCircle, ArrowRight, Check } from 'lucide-react';
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
  const { isLoginModalOpen, closeLoginModal, loginWithGoogle, authModalMode } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  // Sync mode with trigger
  useEffect(() => {
    if (authModalMode) {
      setTab(authModalMode);
    }
  }, [authModalMode]);

  // Initialize official Google Identity Services (GIS) when modal opens
  useEffect(() => {
    if (!isLoginModalOpen) return;

    const clientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      '1038592749581-khojsetu.apps.googleusercontent.com';

    const checkAndInitGoogle = () => {
      const google = (window as any).google;
      if (google?.accounts?.id && googleBtnContainerRef.current) {
        try {
          google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response: any) => {
              if (response?.credential) {
                try {
                  setIsSubmitting(true);
                  setError(null);
                  await loginWithGoogle({ credential: response.credential });
                } catch (e: any) {
                  setError(e.message || 'Google verification failed.');
                } finally {
                  setIsSubmitting(false);
                }
              }
            },
            auto_select: false,
          });

          googleBtnContainerRef.current.innerHTML = '';
          google.accounts.id.renderButton(googleBtnContainerRef.current, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            shape: 'pill',
            text: tab === 'signup' ? 'signup_with' : 'continue_with',
            width: 320,
            logo_alignment: 'left',
          });
        } catch (err) {
          console.warn('Google Identity Services init note:', err);
        }
      }
    };

    // Retry once if GIS script is still loading
    checkAndInitGoogle();
    const timer = setTimeout(checkAndInitGoogle, 600);
    return () => clearTimeout(timer);
  }, [isLoginModalOpen, tab, loginWithGoogle]);

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await loginWithGoogle({
        email: cleanEmail,
        name: name.trim() || undefined,
      });
      setEmail('');
      setName('');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-foundry-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-foundry-900 text-white relative">
          <button
            type="button"
            onClick={closeLoginModal}
            aria-label="Close authentication dialog"
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
              Campus Security Gateway
            </span>
          </div>

          <h2 id="auth-modal-title" className="text-xl sm:text-2xl font-serif font-normal">
            {tab === 'signup' ? 'Create Your Account' : 'Welcome to KhojSetu'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1 font-light leading-relaxed">
            {tab === 'signup'
              ? 'Join KhojSetu to catalog lost belongings and claim possessions privately.'
              : 'Sign in to access your dossier, verify claims, and inspect spatial matches.'}
          </p>

          {/* Tab Switcher */}
          <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setTab('signin');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
                tab === 'signin'
                  ? 'bg-white text-foundry-900 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('signup');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
                tab === 'signup'
                  ? 'bg-white text-foundry-900 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Official Native Google Button Container */}
          <div className="space-y-2">
            <div className="flex justify-center w-full min-h-[44px]" ref={googleBtnContainerRef}>
              {/* Fallback button while Google Identity Services renders */}
              <button
                type="button"
                onClick={() => {
                  const promptEmail = window.prompt('Enter your Google Account / Gmail:');
                  if (promptEmail && promptEmail.includes('@')) {
                    loginWithGoogle({ email: promptEmail.trim() });
                  }
                }}
                className="w-full foundry-pill-outline py-2.5 px-4 flex items-center justify-center gap-2.5 text-xs sm:text-sm font-medium hover:bg-neutral-50 transition"
              >
                <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0">
                  <GoogleLogo />
                </div>
                <span>{tab === 'signup' ? 'Sign up with Google' : 'Continue with Google'}</span>
              </button>
            </div>
            <p className="text-[10px] text-center text-neutral-400 font-light">
              One-click Google authentication via Google Identity Services
            </p>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center pt-1">
            <div className="border-t border-neutral-200 w-full"></div>
            <span className="bg-white px-3 editorial-kicker text-neutral-400 relative">
              Or With Email Credentials
            </span>
          </div>

          {/* Direct Sign-In / Sign-Up Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === 'signup' && (
              <div>
                <label htmlFor="auth-name" className="editorial-kicker text-foundry-900 block mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserCircle2 className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-name"
                    type="text"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-neutral-300 focus:border-foundry-900 outline-none transition bg-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="editorial-kicker text-foundry-900 block mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-email"
                  type="email"
                  inputMode="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com or campus.edu"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-neutral-300 focus:border-foundry-900 outline-none transition bg-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="auth-password" className="editorial-kicker text-foundry-900 block mb-1">
                Password <span className="text-neutral-400 font-normal lowercase">(optional for Google users)</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-password"
                  type="password"
                  autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-neutral-300 focus:border-foundry-900 outline-none transition bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !email.trim()}
              className="w-full foundry-pill-primary py-3 px-4 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 text-xs sm:text-sm"
            >
              <span>
                {isSubmitting
                  ? 'Authenticating...'
                  : tab === 'signup'
                  ? 'Complete Registration'
                  : 'Sign In to Account'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Privacy Guarantee Footer */}
          <div className="pt-2 border-t border-neutral-100 flex items-start gap-2 text-[11px] text-neutral-500 font-light">
            <ShieldCheck className="w-3.5 h-3.5 text-khoj-orange shrink-0 mt-0.5" />
            <span>
              Zero password exposure: KhojSetu uses encrypted session tokens. Your personal phone and identity details stay protected.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
