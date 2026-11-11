'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GoogleLogo } from '../../components/GoogleSignInModal';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  Mail,
  UserCircle2,
  AlertCircle,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithGoogle, isAuthenticated } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // Initialize official Google Identity Services
  useEffect(() => {
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
                  router.push('/');
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
          console.warn('Google Identity Services note:', err);
        }
      }
    };

    checkAndInitGoogle();
    const timer = setTimeout(checkAndInitGoogle, 600);
    return () => clearTimeout(timer);
  }, [tab, loginWithGoogle, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your Google account email.');
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
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-12 px-2">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Info Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="mb-2">
            <Link href="/">
              <img
                src="/logo-transparent.png"
                alt="KhojSetu"
                className="h-9 sm:h-11 w-auto object-contain"
              />
            </Link>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-foundry-950 leading-tight">
              {tab === 'signup' ? 'Join the Campus Lost & Found Bridge' : 'Sign in to KhojSetu'}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-light">
              Connect securely with students and faculty. File lost or found reports, verify ownership
              through private answers, and monitor spatial candidate pairs.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-neutral-100 text-foundry-900 flex items-center justify-center shrink-0 mt-0.5 border border-neutral-200">
                <ShieldCheck className="w-4 h-4 text-khoj-orange" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-foundry-900">Zero Password Exposure</h4>
                <p className="text-xs text-neutral-500 font-light">
                  Direct Google OAuth verification. Your account password is never transmitted.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-neutral-100 text-foundry-900 flex items-center justify-center shrink-0 mt-0.5 border border-neutral-200">
                <Lock className="w-4 h-4 text-foundry-900" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-foundry-900">Private Ownership Shield</h4>
                <p className="text-xs text-neutral-500 font-light">
                  Distinguishing verification responses stay strictly peer-to-peer.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Authentication Card */}
        <div className="lg:col-span-6">
          <div className="foundry-card p-6 sm:p-8 rounded-2xl shadow-foundry-frame space-y-6">
            {/* Tabs: Sign In / Create Account */}
            <div className="flex items-center gap-2 border-b border-neutral-200 pb-3">
              <button
                type="button"
                onClick={() => {
                  setTab('signin');
                  setError(null);
                }}
                className={`flex-1 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
                  tab === 'signin'
                    ? 'bg-foundry-900 text-white shadow-xs'
                    : 'text-neutral-500 hover:text-foundry-900'
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
                className={`flex-1 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
                  tab === 'signup'
                    ? 'bg-foundry-900 text-white shadow-xs'
                    : 'text-neutral-500 hover:text-foundry-900'
                }`}
              >
                Create Account
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Official Google Button Container */}
            <div className="space-y-2">
              <div className="flex justify-center w-full min-h-[44px]" ref={googleBtnContainerRef}>
                <button
                  type="button"
                  onClick={() => {
                    const promptEmail = window.prompt('Enter your Google Account / Gmail:');
                    if (promptEmail && promptEmail.includes('@')) {
                      loginWithGoogle({ email: promptEmail.trim() });
                      router.push('/');
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
                One-click authentication via official Google Identity Services
              </p>
            </div>

            <div className="relative flex items-center justify-center pt-1">
              <div className="border-t border-neutral-200 w-full"></div>
              <span className="bg-white px-3 editorial-kicker text-neutral-400 relative">
                Or With Email Credentials
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {tab === 'signup' && (
                <div>
                  <label htmlFor="user-name" className="editorial-kicker text-foundry-900 block mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <UserCircle2 className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="user-name"
                      type="text"
                      autoComplete="name"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-300 focus:border-foundry-900 outline-none transition bg-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="user-email" className="editorial-kicker text-foundry-900 block mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="user-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    placeholder="yourname@gmail.com or campus.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-300 focus:border-foundry-900 outline-none transition bg-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="user-password" className="editorial-kicker text-foundry-900 block mb-1">
                  Password <span className="text-neutral-400 font-normal lowercase">(optional for Google users)</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="user-password"
                    type="password"
                    autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-300 focus:border-foundry-900 outline-none transition bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !email.trim()}
                className="w-full foundry-pill-primary py-3 px-4 flex items-center justify-center gap-2 shadow-md disabled:opacity-50 text-xs sm:text-sm"
              >
                <span>
                  {isSubmitting
                    ? 'Authenticating...'
                    : tab === 'signup'
                    ? 'Create My Account'
                    : 'Sign In to Account'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
