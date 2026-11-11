'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error caught by boundary:', error);
  }, [error]);

  return (
    <div className="max-w-lg mx-auto py-16 px-4 text-center space-y-5">
      <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
        <AlertCircle className="w-6 h-6" />
      </div>

      <div className="space-y-2">
        <span className="editorial-kicker text-neutral-400">Workspace Recovery</span>
        <h2 className="text-2xl font-serif font-normal text-foundry-950">
          Something interrupted this view
        </h2>
        <p className="text-xs text-neutral-500 font-light leading-relaxed">
          {error?.message || 'An unexpected interface error occurred. Your session and data remain safe.'}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => reset()}
          className="foundry-pill-primary px-5 py-2 flex items-center gap-2 text-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>

        <Link
          href="/"
          className="foundry-pill-outline px-5 py-2 flex items-center gap-2 text-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Catalog</span>
        </Link>
      </div>
    </div>
  );
}
