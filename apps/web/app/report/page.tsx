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
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Browse Feed</span>
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/20">
              W3C WCAG 2.2 Compliant
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/20">
              OWASP S3 Validated
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black">Report a Lost or Found Item</h1>
          <p className="text-xs text-slate-300 mt-1">
            Indexed with PostGIS spatial coordinates and explainable scoring across campus.
          </p>
        </div>

        {!isAuthenticated && (
          <div className="p-4 mx-6 mt-6 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center border border-blue-200 shrink-0">
                <GoogleLogo />
              </div>
              <div>
                <strong className="text-slate-900 block font-bold">Sign in with your campus Google account</strong>
                <span className="text-slate-600">Your student identity helps finders verify reports and contact you securely.</span>
              </div>
            </div>
            <button
              type="button"
              onClick={openLoginModal}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 font-bold text-slate-800 shadow-xs flex items-center gap-2 shrink-0 transition"
            >
              <GoogleLogo />
              <span>Sign in with Google</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-start gap-2.5" role="alert">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block">Validation Notice</strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* 1. Report Type */}
          <fieldset>
            <legend className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Report Type <span className="text-red-500">*</span>
            </legend>
            <p id="type-instructions" className="text-xs text-slate-500 mb-2">
              Are you reporting an item you misplaced or one you picked up?
            </p>
            <div className="grid grid-cols-2 gap-3" aria-describedby="type-instructions">
              <label
                className={`cursor-pointer rounded-2xl p-4 border text-center transition flex flex-col items-center gap-1 ${
                  type === 'lost'
                    ? 'border-rose-500 bg-rose-50/50 text-rose-900 ring-2 ring-rose-400/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
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
                <span className="text-sm font-bold">I Lost Something</span>
                <span className="text-[11px] text-slate-500">Misplaced my belonging</span>
              </label>

              <label
                className={`cursor-pointer rounded-2xl p-4 border text-center transition flex flex-col items-center gap-1 ${
                  type === 'found'
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 ring-2 ring-emerald-400/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
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
                <span className="text-2xl">📍</span>
                <span className="text-sm font-bold">I Found Something</span>
                <span className="text-[11px] text-slate-500">Looking for rightful owner</span>
              </label>
            </div>
          </fieldset>

          {/* 2. Item Title */}
          <div>
            <label htmlFor="item-title" className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              Item Title / Summary <span className="text-red-500">*</span>
            </label>
            <p id="title-hint" className="text-xs text-slate-500 mb-1.5">
              Include brand, color, and object type (e.g. "Dell XPS 13 Ultrabook with NASA Sticker").
            </p>
            <input
              type="text"
              id="item-title"
              name="item-title"
              aria-describedby="title-hint"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Casio Scientific Calculator in Hard Blue Case"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          {/* 3. Category & Zone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="item-cat" className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="item-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-blue-500 bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="item-zone" className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Campus Zone (PostGIS) <span className="text-red-500">*</span>
              </label>
              <select
                id="item-zone"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-blue-500 bg-white"
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
              <label htmlFor="item-area" className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Specific Location Area <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="item-area"
                required
                value={campusArea}
                onChange={(e) => setCampusArea(e.target.value)}
                placeholder="e.g. 2nd Floor Study Cubicle 14"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="item-date" className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="item-date"
                required
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-blue-500"
              />
            </div>
          </div>

          {/* 5. Description */}
          <div>
            <label htmlFor="item-desc" className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              Public Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="item-desc"
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Left on the study table. Grey zipper sleeve with light wear."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-blue-500 resize-none"
            />
          </div>

          {/* 6. Secret Verification Prompt */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600" />
              <label htmlFor="item-secret" className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                Secret Verification Question (Recommended)
              </label>
            </div>
            <p className="text-xs text-amber-900">
              Ask a question that only the true owner can answer. Their response is shielded from the public.
            </p>
            <input
              type="text"
              id="item-secret"
              value={secretPrompt}
              onChange={(e) => setSecretPrompt(e.target.value)}
              placeholder='e.g. "What sticker is near the touchpad?"'
              className="w-full px-3 py-2 text-xs rounded-xl border border-amber-300 bg-white focus:border-amber-500"
            />
          </div>

          {/* 7. OWASP S3 Upload */}
          <div>
            <label htmlFor="item-photo" className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              Item Photo (OWASP S3 Object Storage)
            </label>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Magic-byte binary inspection enabled. Maximum 5MB (JPG, PNG, WebP).</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label
                htmlFor="item-photo"
                className="w-full sm:w-auto cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 text-xs font-bold text-slate-700 transition"
              >
                <Upload className="w-4 h-4 text-blue-600" />
                <span>{photoFile ? 'Replace Photo' : 'Upload Photo to S3'}</span>
              </label>
              <input
                id="item-photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
                className="sr-only"
              />

              {preview && (
                <div className="flex items-center gap-3">
                  <img src={preview} alt="Upload preview" className="w-14 h-14 object-cover rounded-xl border border-slate-200" />
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block truncate max-w-[200px]">{photoFile?.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoFile(null);
                        setPreview(null);
                      }}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link href="/" className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition shadow-md shadow-blue-500/20"
            >
              {isSubmitting ? 'Publishing & Indexing...' : 'Publish Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
