'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GoogleLogo } from '../../components/GoogleSignInModal';
import { useAuth } from '../../context/AuthContext';
import {
  Compass,
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Campus Single Sign-On (SSO)</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Sign in to KhojSetu with your Campus Google Account
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              FoundBeacon connects students across campus. Sign in with your institutional Google Workspace
              account to post lost or found reports, verify ownership privately, and view explainable matches.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Zero Password Exposure</h4>
                <p className="text-xs text-slate-500">
                  Google SSO handles credentials securely. FoundBeacon never touches your campus password.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 border border-blue-100">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Private Ownership Shield</h4>
                <p className="text-xs text-slate-500">
                  Unique item identifiers (serial numbers, engraving, lock screen wallpapers) remain visible only to you and verified finders.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 border border-amber-100">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Explainable Match Radar</h4>
                <p className="text-xs text-slate-500">
                  Automated category, keyword, and PostGIS distance scoring highlights potential matches instantly.
                </p>
              </div>
            </div>
          </div>

          {isAuthenticated && currentUser && (
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs">
              <div className="font-bold text-blue-900">Currently signed in as:</div>
              <div className="text-blue-700 mt-0.5">{currentUser.name} ({currentUser.email})</div>
              <div className="mt-2 flex items-center gap-3">
                <Link
                  href="/"
                  className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>Go to Campus Board</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Authentication Card */}
        <div className="lg:col-span-6">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center border border-slate-200 shadow-2xs">
                  <GoogleLogo />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Google Workspace SSO</h3>
                  <p className="text-[11px] text-slate-500">University Identity Provider</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Active
              </span>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {error}
              </div>
            )}

            {/* Quick Campus Personas */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Choose Institutional Campus Account
              </span>

              <div className="space-y-2">
                {usersList.slice(0, 4).map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleQuickLogin(u)}
                    className={`w-full p-3 rounded-2xl border transition flex items-center justify-between text-left group ${
                      currentUser?.id === u.id
                        ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-500/20'
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
                Or Sign In with Any Campus Email
              </span>
            </div>

            {/* Custom Google Account Sign-In Form */}
            <form onSubmit={handleCustomLogin} className="space-y-3">
              <div>
                <label htmlFor="login-page-name" className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  id="login-page-name"
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Sanya Sharma"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label htmlFor="login-page-email" className="block text-xs font-semibold text-slate-700 mb-1">
                  Campus Google Workspace Email
                </label>
                <input
                  id="login-page-email"
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="sanya@campus.edu"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs flex items-center justify-center gap-2.5 transition active:scale-98"
              >
                <GoogleLogo />
                <span>Continue with Campus Google Account</span>
              </button>
            </form>

            <div className="pt-2 text-center text-[11px] text-slate-400">
              Institutional single sign-on powered by Google Workspace for Education.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}