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
  GraduationCap,
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
    if (!customEmail.trim() || !customName.trim()) return;
    try {
      setIsSubmitting(true);
      setError(null);
      await loginWithGoogle({
        email: customEmail.trim(),
        name: customName.trim(),
      });
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Google');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Info Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="mb-2">
            <img
              src="/logo-transparent.png"
              alt="KhojSetu"
              className="h-10 w-auto object-contain"
            />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-foundry-950 leading-tight">
              Sign in with your Campus Google Account
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-light">
              KhojSetu connects students and curators across campus. Sign in with your institutional Google Workspace
              identity to archive lost items, verify ownership privately, and view spatial pair signals.
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
                  Google SSO handles credentials securely. KhojSetu never sees your password.
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
                  Distinguishing traits and serial answers are verified strictly peer-to-peer.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Authentication Card */}
        <div className="lg:col-span-6">
          <div className="foundry-card p-6 sm:p-8 rounded-xl shadow-foundry-frame space-y-6">
            <div>
              <span className="editorial-kicker text-foundry-900">Select Persona or Account</span>
              <h2 className="text-lg font-serif font-normal text-foundry-950 mt-1">
                One-Click Campus Demo
              </h2>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
                {error}
              </div>
            )}

            <div className="space-y-2.5">
              {usersList.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickLogin(u)}
                  disabled={isSubmitting}
                  className="w-full p-3 rounded-lg border border-neutral-200 hover:border-foundry-900 bg-neutral-50/50 hover:bg-neutral-50 transition flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-foundry-900 text-white font-semibold text-xs flex items-center justify-center">
                      {u.name[0]}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-foundry-900">{u.name}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">
                        {u.role === 'MODERATOR' ? 'Campus Proctor / Curator' : u.email}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-foundry-900 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-neutral-100">
              <form onSubmit={handleCustomLogin} className="space-y-3">
                <span className="editorial-kicker">Custom Google Credentials</span>
                <input
                  type="text"
                  placeholder="Student Full Name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 focus:border-foundry-900 outline-none"
                />
                <input
                  type="email"
                  placeholder="student@campus.edu"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 focus:border-foundry-900 outline-none"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !customEmail || !customName}
                  className="w-full foundry-pill-primary py-2.5 disabled:opacity-50"
                >
                  Continue with Google SSO
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
