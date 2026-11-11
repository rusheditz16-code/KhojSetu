'use client';

import React, { useEffect, useRef } from 'react';
import { GoogleLogo } from './GoogleSignInModal';

interface GoogleOAuthButtonProps {
  mode: 'signin' | 'signup';
  onCredential: (credential: string) => Promise<void>;
  onStatusError: (msg: string) => void;
  onFocusEmail?: () => void;
}

export default function GoogleOAuthButton({
  mode,
  onCredential,
  onStatusError,
  onFocusEmail,
}: GoogleOAuthButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);
  onCredentialRef.current = onCredential;
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || '';

  useEffect(() => {
    if (!clientId) return;

    const initGis = () => {
      const google = (window as any).google;
      if (google?.accounts?.id && containerRef.current) {
        try {
          google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response: any) => {
              if (response?.credential) {
                await onCredentialRef.current(response.credential);
              }
            },
            auto_select: false,
          });

          containerRef.current.innerHTML = '';
          google.accounts.id.renderButton(containerRef.current, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            shape: 'pill',
            text: mode === 'signup' ? 'signup_with' : 'continue_with',
            width: 320,
            logo_alignment: 'left',
          });
        } catch (err) {
          console.warn('Google Identity Services init note:', err);
        }
      }
    };

    initGis();
    const timer = setTimeout(initGis, 600);
    return () => clearTimeout(timer);
  }, [clientId, mode]);

  if (!clientId) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => {
            onStatusError(
              'Google OAuth is awaiting a Google Cloud Client ID (NEXT_PUBLIC_GOOGLE_CLIENT_ID) in Vercel. Please sign in or create an account with your email below.'
            );
            onFocusEmail?.();
          }}
          className="w-full foundry-pill-outline py-2.5 px-4 flex items-center justify-center gap-2.5 text-xs sm:text-sm font-medium hover:bg-neutral-50 transition"
        >
          <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0">
            <GoogleLogo />
          </div>
          <span>{mode === 'signup' ? 'Sign up with Google' : 'Continue with Google'}</span>
        </button>
        <p className="text-[10px] text-center text-neutral-400 font-light">
          Use your Gmail or campus email below for instant access
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-center w-full min-h-[44px]" ref={containerRef}>
        <button
          type="button"
          onClick={() => {
            const google = (window as any).google;
            if (google?.accounts?.id) {
              google.accounts.id.prompt();
            } else {
              onStatusError('Google Sign-In is still loading. Please try again in a moment or use email below.');
            }
          }}
          className="w-full foundry-pill-outline py-2.5 px-4 flex items-center justify-center gap-2.5 text-xs sm:text-sm font-medium hover:bg-neutral-50 transition"
        >
          <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0">
            <GoogleLogo />
          </div>
          <span>{mode === 'signup' ? 'Sign up with Google' : 'Continue with Google'}</span>
        </button>
      </div>
      <p className="text-[10px] text-center text-neutral-400 font-light">
        One-click authentication via Google Identity Services
      </p>
    </div>
  );
}
