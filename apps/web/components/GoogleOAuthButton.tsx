'use client';

import React, { useEffect, useState } from 'react';
import { GoogleLogo } from './GoogleSignInModal';

interface GoogleOAuthButtonProps {
  mode: 'signin' | 'signup';
  onCredential?: (credential: string) => Promise<void>;
  onStatusError?: (msg: string) => void;
  onFocusEmail?: () => void;
  returnTo?: string;
}

function sanitizeReturnTo(raw: string | null | undefined): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) {
    return '/';
  }
  return raw;
}

export default function GoogleOAuthButton({
  mode,
  returnTo: explicitReturnTo,
}: GoogleOAuthButtonProps) {
  const [returnTo, setReturnTo] = useState(() => sanitizeReturnTo(explicitReturnTo));
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (explicitReturnTo) {
      setReturnTo(sanitizeReturnTo(explicitReturnTo));
      return;
    }
    if (typeof window === 'undefined') return;

    const { pathname, search } = window.location;
    if (pathname === '/login' || pathname === '/signup') {
      const nextParam = new URLSearchParams(search).get('next');
      setReturnTo(sanitizeReturnTo(nextParam));
      return;
    }

    setReturnTo(sanitizeReturnTo(`${pathname}${search}`));
  }, [explicitReturnTo]);

  const params = new URLSearchParams({
    connection: 'google-oauth2',
    prompt: 'select_account',
    returnTo,
  });
  if (mode === 'signup') {
    params.set('screen_hint', 'signup');
  }

  const authHref = `/auth/login?${params.toString()}`;

  return (
    <a
      href={authHref}
      onClick={() => setConnecting(true)}
      className="w-full foundry-pill-outline py-2.5 sm:py-3 px-4 flex items-center justify-center gap-2.5 text-xs sm:text-sm font-medium bg-white hover:bg-neutral-50 border border-neutral-300 text-foundry-900 shadow-2xs transition active:scale-[0.99]"
    >
      <GoogleLogo />
      <span>
        {connecting
          ? 'Connecting to Google...'
          : mode === 'signup'
          ? 'Sign up with Google'
          : 'Continue with Google'}
      </span>
    </a>
  );
}
