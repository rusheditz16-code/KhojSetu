'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GoogleLogo } from '../../components/GoogleSignInModal';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  Check,
  Lock,
  ArrowRight,
  Sparkles,
  Building2,
  Mail,
  UserCircle2,
  AlertCircle,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithGoogle, usersList, currentUser, isAuthenticated } = useAuth();
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuickLogin = async (u: any) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await loginWithGoogle({
        email: u.email,
        name: u.name,
        role: u.role,
      });
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Google');
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
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Google');
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
              Sign in with your Google Account
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-light">
              KhojSetu connects students and curators across campus. Sign in with any Google / Gmail account
              or your university identity to archive lost items, verify ownership privately, and view spatial pair signals.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-neutral-100 text-foundry-900 flex items-center justify-center shrink-0 mt-0.5 border border-neutral-200">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-foundry-900">Zero Password Exposure</h4>
                <p className="text-xs text-neutral-500 font-light">
                  Google SSO handles credentials securely. KhojSetu never sees or touches your password.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-neutral-100 text-foundry-900 flex items-center justify-center shrink-0 mt-0.5 border border-neutral-200">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-foundry-900">Private Ownership Shield</h4>
                <p className="text-xs text-neutral-500 font-light">
                  Distinguishing verification answers stay encrypted and peer-to-peer.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Authentication Card */}
        <div className="lg:col-span-6">
          <div className="foundry-card p-5 sm:p-8 rounded-2xl shadow-foundry-frame space-y-6">
            <div>
              <span className="editorial-kicker text-foundry-900">Instant Verification</span>
              <h2 className="text-xl font-serif font-normal text-foundry-950 mt-1">
                Enter Your Google Email
              </h2>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Custom Google Sign-In Form */}
            <form onSubmit={handleCustomLogin} className="space-y-3.5">
              <div>
                <label htmlFor="custom-email" className="editorial-kicker text-foundry-900 block mb-1">
                  Google Account / Gmail <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="custom-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    placeholder="yourname@gmail.com or campus.edu"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-300 focus:border-foundry-900 outline-none transition bg-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="custom-name" className="editorial-kicker text-foundry-900 block mb-1">
                  Your Full Name <span className="text-neutral-400 font-normal lowercase">(optional)</span>
                </label>
                <div className="relative">
                  <UserCircle2 className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="custom-name"
                    type="text"
                    autoComplete="name"
                    placeholder="e.g. Rahul Sharma"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-300 focus:border-foundry-900 outline-none transition bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !customEmail.trim()}
                className="w-full foundry-pill-primary py-3 px-4 flex items-center justify-center gap-2.5 shadow-md disabled:opacity-50 text-xs sm:text-sm"
              >
                <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0">
                  <GoogleLogo />
                </div>
                <span>{isSubmitting ? 'Verifying with Google...' : 'Continue with Google Account'}</span>
              </button>
            </form>

            <div className="relative flex items-center justify-center pt-2">
              <div className="border-t border-neutral-200 w-full"></div>
              <span className="bg-white px-3 editorial-kicker text-neutral-400 relative">
                Or Try Demo Persona
              </span>
            </div>

            <div className="space-y-2">
              {usersList.slice(0, 3).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickLogin(u)}
                  disabled={isSubmitting}
                  className="w-full p-2.5 sm:p-3 rounded-xl border border-neutral-200 hover:border-foundry-900 bg-neutral-50/50 hover:bg-neutral-50 transition flex items-center justify-between text-left group active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-foundry-900 text-white font-semibold text-xs flex items-center justify-center shrink-0">
                      {u.name[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-foundry-900 truncate">{u.name}</div>
                      <div className="text-[10px] text-neutral-400 font-mono truncate">
                        {u.role === 'MODERATOR' ? 'Campus Proctor / Curator' : u.email}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-foundry-900 transition-transform group-hover:translate-x-0.5 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
