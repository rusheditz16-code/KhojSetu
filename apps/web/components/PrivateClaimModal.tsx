'use client';

import React, { useState } from 'react';
import { X, Lock, ShieldCheck, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '../lib/api';

export default function PrivateClaimModal({
  item,
  onClose,
  onSuccess,
}: {
  item: any;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [proofDetail, setProofDetail] = useState('');
  const [proofPhoto, setProofPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!item) return null;

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setError('OWASP Alert: Only JPG, PNG, and WebP images are permitted.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('OWASP Alert: File size exceeds the 5MB limit.');
      return;
    }

    setError(null);
    setProofPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofDetail.trim() || proofDetail.trim().length < 8) {
      setError('Please provide at least 8 characters describing your confidential proof.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const formData = new FormData();
      formData.append('itemId', item.id);
      formData.append('privateProofDetail', proofDetail.trim());
      if (proofPhoto) {
        formData.append('proof_photo', proofPhoto);
      }

      const res = await apiRequest('/claims', {
        method: 'POST',
        body: formData,
      });

      setSuccessMsg(res.message);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err.message || 'Failed to submit claim');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="claim-modal-title"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 id="claim-modal-title" className="text-base font-bold">
                Private Ownership Verification
              </h2>
              <p className="text-xs text-slate-300">
                Claim item: <span className="font-semibold text-white">{item.title}</span>
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Privacy Shield Banner */}
        <div className="bg-blue-50/80 border-b border-blue-100 px-6 py-2.5 flex items-start gap-2.5 text-xs text-blue-900">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <strong>Confidentiality Shield:</strong> Your verification detail is{' '}
            <span className="font-bold underline">never made public</span>. Only the item reporter and campus proctors can review it.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2" role="alert">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2" role="alert">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Claim Submitted!</strong>
                <span>{successMsg}</span>
              </div>
            </div>
          )}

          {item.secretPrompt ? (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs">
              <span className="font-bold text-amber-900 uppercase tracking-wider text-[10px] block mb-1">
                Reporter's Secret Question:
              </span>
              <p className="text-amber-950 font-semibold italic">"{item.secretPrompt}"</p>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Verification Instruction:</span>
              <p className="mt-0.5">
                Describe identifying details not visible in public photos (e.g. lockscreen picture, specific scratches, or interior contents).
              </p>
            </div>
          )}

          <div>
            <label htmlFor="proof-text" className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Your Private Ownership Proof <span className="text-red-500">*</span>
            </label>
            <p id="proof-hint" className="text-[11px] text-slate-500 mb-1.5">
              Answer the question above or provide secret verifiable details.
            </p>
            <textarea
              id="proof-text"
              name="proof-text"
              aria-describedby="proof-hint"
              required
              rows={4}
              value={proofDetail}
              onChange={(e) => setProofDetail(e.target.value)}
              placeholder="e.g. On the back lid there is an Octocat sticker. The laptop sleeve has an Anker charger with a black cable."
              className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none bg-slate-50/50"
            />
          </div>

          {/* Optional Proof Photo */}
          <div>
            <label htmlFor="proof-file" className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Optional Supporting Image / Receipt (Max 5MB)
            </label>
            <div className="flex items-center gap-3">
              <label
                htmlFor="proof-file"
                className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>{proofPhoto ? 'Change Photo' : 'Attach Photo'}</span>
              </label>
              <input
                id="proof-file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoSelect}
                className="sr-only"
              />

              {preview && (
                <div className="flex items-center gap-2">
                  <img src={preview} alt="Proof" className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
                  <span className="text-xs text-slate-600 truncate max-w-[140px]">{proofPhoto?.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setProofPhoto(null);
                      setPreview(null);
                    }}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition shadow-md shadow-blue-500/20"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Private Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
