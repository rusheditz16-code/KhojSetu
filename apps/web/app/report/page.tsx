'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Upload, Lock, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import { CATEGORIES, CAMPUS_ZONES, apiRequest } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogo } from '../../components/GoogleSignInModal';

const ZONE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  library: { lat: 12.9716, lng: 77.5946 },
  eng_block: { lat: 12.9722, lng: 77.5950 },
  science_block: { lat: 12.9728, lng: 77.5955 },
  cafeteria: { lat: 12.9730, lng: 77.5960 },
  sports_complex: { lat: 12.9750, lng: 77.5980 },
  hostels: { lat: 12.9740, lng: 77.5930 },
  admin_building: { lat: 12.9700, lng: 77.5920 },
  other: { lat: 12.9716, lng: 77.5946 },
};

export default function ReportPage() {
  const router = useRouter();
  const { isAuthenticated, currentUser, openLoginModal } = useAuth();
  const [type, setType] = useState<'lost' | 'found'>('lost');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('electronics');
  const [zone, setZone] = useState('library');
  const [campusArea, setCampusArea] = useState('');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().substring(0, 16));
  const [description, setDescription] = useState('');
  const [secretPrompt, setSecretPrompt] = useState('');

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setError('OWASP File Alert: Only .jpg, .png, and .webp images are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('OWASP File Alert: Image file exceeds 5MB size limit.');
      return;
    }

    setError(null);
    setPhotoFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    if (!title.trim() || title.trim().length < 3) {
      setError('Title must be at least 3 characters.');
      return;
    }
    if (!campusArea.trim()) {
      setError('Please provide a specific room or campus area.');
      return;
    }
    if (!description.trim() || description.trim().length < 5) {
      setError('Description must be at least 5 characters.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const coords = ZONE_COORDINATES[zone] || ZONE_COORDINATES.library;

      const formData = new FormData();
      formData.append('type', type.toUpperCase());
      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('location_zone', zone);
      formData.append('location_campus_area', campusArea.trim());
      formData.append('latitude', coords.lat.toString());
      formData.append('longitude', coords.lng.toString());
      formData.append('incident_date', new Date(incidentDate).toISOString());
      formData.append('description', description.trim());
      if (secretPrompt.trim()) {
        formData.append('secret_verification_prompt', secretPrompt.trim());
      }
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      const res = await apiRequest('/items', {
        method: 'POST',
        body: formData,
      });

      router.push(`/items/${res.item.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-2">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold text-neutral-500 hover:text-foundry-900 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Catalog</span>
      </Link>

      <div className="bg-white rounded-xl border border-neutral-200/80 shadow-foundry-frame overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 bg-foundry-900 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="editorial-kicker text-neutral-400">
              Campus Spatial Archive Index
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal">Archive a Possession</h1>
          <p className="text-xs text-neutral-400 mt-1 font-light leading-relaxed">
            Indexed into the PostGIS spatial matrix for explainable verification across campus.
          </p>
        </div>

        {!isAuthenticated && (
          <div className="p-4 mx-6 mt-6 bg-neutral-50 border border-neutral-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-neutral-200 shrink-0">
                <GoogleLogo />
              </div>
              <div>
                <strong className="text-foundry-900 block font-semibold text-xs">Sign in with campus Google account</strong>
                <span className="text-neutral-500 text-[11px]">Your student identity verifies claims and enables private handovers.</span>
              </div>
            </div>
            <button
              type="button"
              onClick={openLoginModal}
              className="foundry-pill-outline px-4 py-1.5 text-[10px]"
            >
              Sign In
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5" role="alert">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block uppercase tracking-wider text-[10px]">Validation Notice</strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* 1. Report Type */}
          <fieldset>
            <legend className="editorial-kicker text-foundry-900 mb-2">
              Report Classification <span className="text-rose-500">*</span>
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`cursor-pointer rounded-xl p-4 border text-center transition flex flex-col items-center gap-1.5 ${
                  type === 'lost'
                    ? 'border-foundry-900 bg-neutral-50 text-foundry-950 font-semibold ring-1 ring-foundry-900'
                    : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                }`}
              >
                <input
                  type="radio"
                  name="item-type"
                  value="lost"
                  checked={type === 'lost'}
                  onChange={() => setType('lost')}
                  className="sr-only"
                />
                <span className="text-2xl">🔍</span>
                <span className="text-xs uppercase tracking-wider font-semibold">I Lost Something</span>
                <span className="text-[10px] text-neutral-400">Misplaced belonging</span>
              </label>

              <label
                className={`cursor-pointer rounded-xl p-4 border text-center transition flex flex-col items-center gap-1.5 ${
                  type === 'found'
                    ? 'border-foundry-900 bg-neutral-50 text-foundry-950 font-semibold ring-1 ring-foundry-900'
                    : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                }`}
              >
                <input
                  type="radio"
                  name="item-type"
                  value="found"
                  checked={type === 'found'}
                  onChange={() => setType('found')}
                  className="sr-only"
                />
                <span className="text-2xl">📦</span>
                <span className="text-xs uppercase tracking-wider font-semibold">I Found Something</span>
                <span className="text-[10px] text-neutral-400">Looking for owner</span>
              </label>
            </div>
          </fieldset>

          {/* 2. Item Title */}
          <div>
            <label htmlFor="item-title" className="editorial-kicker text-foundry-900 block mb-1">
              Title &amp; Summary <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="item-title"
              name="item-title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. MacBook Pro 14&quot; in Dark Leather Sleeve"
              className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-neutral-200 focus:border-foundry-900 transition outline-none"
            />
          </div>

          {/* 3. Category & Zone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="item-cat" className="editorial-kicker text-foundry-900 block mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                id="item-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 focus:border-foundry-900 bg-white outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="item-zone" className="editorial-kicker text-foundry-900 block mb-1">
                Campus Zone (PostGIS) <span className="text-rose-500">*</span>
              </label>
              <select
                id="item-zone"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 focus:border-foundry-900 bg-white outline-none"
              >
                {CAMPUS_ZONES.map((z) => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Area & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="item-area" className="editorial-kicker text-foundry-900 block mb-1">
                Specific Location Area <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="item-area"
                required
                value={campusArea}
                onChange={(e) => setCampusArea(e.target.value)}
                placeholder="e.g. 2nd Floor Study Cubicle 14"
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 focus:border-foundry-900 outline-none"
              />
            </div>

            <div>
              <label htmlFor="item-date" className="editorial-kicker text-foundry-900 block mb-1">
                Date &amp; Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="item-date"
                required
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 focus:border-foundry-900 outline-none"
              />
            </div>
          </div>

          {/* 5. Description */}
          <div>
            <label htmlFor="item-desc" className="editorial-kicker text-foundry-900 block mb-1">
              Public Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="item-desc"
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Left on the study table. Space Grey finish with subtle edge mark."
              className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-neutral-200 focus:border-foundry-900 resize-none outline-none"
            />
          </div>

          {/* 6. Secret Verification Prompt */}
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-khoj-orange" />
              <label htmlFor="item-secret" className="editorial-kicker text-foundry-900">
                Private Verification Prompt (Recommended)
              </label>
            </div>
            <p className="text-[11px] text-neutral-500 font-light">
              Pose a question only the legitimate owner can answer. The answer is verified privately.
            </p>
            <input
              type="text"
              id="item-secret"
              value={secretPrompt}
              onChange={(e) => setSecretPrompt(e.target.value)}
              placeholder='e.g. "What is inscribed on the inner clasp?"'
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 bg-white focus:border-foundry-900 outline-none"
            />
          </div>

          {/* 7. S3 Upload with Matting */}
          <div>
            <label htmlFor="item-photo" className="editorial-kicker text-foundry-900 block mb-1">
              Item Exhibition Visual (OWASP Object Storage)
            </label>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-neutral-400 mb-2">
              <ShieldCheck className="w-3 h-3 text-khoj-orange" />
              <span>Magic-byte binary inspection • Max 5MB (JPG, PNG, WebP)</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label
                htmlFor="item-photo"
                className="w-full sm:w-auto cursor-pointer inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-neutral-300 hover:border-foundry-900 text-xs font-semibold text-foundry-900 transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{photoFile ? 'Replace Visual' : 'Upload Image'}</span>
              </label>
              <input
                id="item-photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
                className="sr-only"
              />

              {preview && (
                <div className="flex items-center gap-3 foundry-matting p-2 rounded-lg">
                  <img src={preview} alt="Upload preview" className="w-12 h-12 object-cover rounded border border-neutral-200" />
                  <div>
                    <span className="text-xs font-medium text-foundry-900 block truncate max-w-[200px]">{photoFile?.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoFile(null);
                        setPreview(null);
                      }}
                      className="text-[10px] uppercase tracking-wider text-rose-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
            <Link href="/" className="text-[11px] uppercase tracking-wider font-semibold text-neutral-500 hover:text-foundry-900 px-4 py-2">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="foundry-pill-primary px-6 py-2.5 disabled:opacity-50"
            >
              {isSubmitting ? 'Indexing...' : 'Publish to Archive'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
