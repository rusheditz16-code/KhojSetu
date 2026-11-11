'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldAlert, CheckCircle2, History, Package, Eye, X } from 'lucide-react';
import { apiRequest, formatTimeAgo } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function ModeratorPage() {
  const { isModerator, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'flagged' | 'items' | 'audit'>('flagged');

  const [stats, setStats] = useState<any | null>(null);
  const [flaggedItems, setFlaggedItems] = useState<any[]>([]);
  const [allItems, setAllItems] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Return modal
  const [returnItemTarget, setReturnItemTarget] = useState<any | null>(null);
  const [handoverName, setHandoverName] = useState('');
  const [returnNotes, setReturnNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchModerationData = async () => {
    try {
      setLoading(true);
      const [statsData, flaggedData, itemsData, auditData] = await Promise.all([
        apiRequest('/moderation/stats').catch(() => null),
        apiRequest('/moderation/flagged').catch(() => ({ flaggedItems: [] })),
        apiRequest('/items?limit=100').catch(() => ({ items: [] })),
        apiRequest('/moderation/audit-logs').catch(() => ({ auditLogs: [] })),
      ]);

      setStats(statsData);
      setFlaggedItems(flaggedData.flaggedItems || []);
      setAllItems(itemsData.items || []);
      setAuditLogs(auditData.auditLogs || []);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isModerator) {
      fetchModerationData();
    }
  }, [isModerator]);

  const handleResolveFlag = async (itemId: string, action: string) => {
    try {
      await apiRequest(`/moderation/flagged/${itemId}/resolve`, {
        method: 'POST',
        body: JSON.stringify({
          action,
          resolutionNotes: `Resolved by ${currentUser?.name} as ${action}`,
        }),
      });
      await fetchModerationData();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleConfirmReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnItemTarget) return;

    try {
      setIsSubmitting(true);
      await apiRequest(`/moderation/items/${returnItemTarget.id}/mark-returned`, {
        method: 'POST',
        body: JSON.stringify({
          handedToName: handoverName.trim(),
          notes: returnNotes.trim(),
        }),
      });

      setReturnItemTarget(null);
      setHandoverName('');
      setReturnNotes('');
      await fetchModerationData();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isModerator) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Campus Proctor Access Required</h2>
        <p className="text-xs text-slate-500">
          This command center is restricted to authorized campus proctors and staff members.
        </p>
        <Link
          href="/login"
          className="mt-2 py-2.5 px-5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-md transition inline-flex items-center gap-2"
        >
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Sign In as Campus Proctor</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full mb-2 border border-amber-400/20">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Campus Proctor Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Moderator Dashboard</h1>
            <p className="text-xs text-slate-300 mt-1">
              Review flagged reports, oversee item handovers, and inspect immutable audit history logs.
            </p>
          </div>

          <div className="text-xs bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 font-medium">
            Proctor: <strong className="text-white">{currentUser?.name}</strong>
          </div>
        </div>

        {stats && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Total Reports</span>
              <span className="text-xl font-black text-white mt-0.5 block">{stats.totalReports}</span>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Open Lost</span>
              <span className="text-xl font-black text-rose-400 mt-0.5 block">{stats.openLost}</span>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Open Found</span>
              <span className="text-xl font-black text-emerald-400 mt-0.5 block">{stats.openFound}</span>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Returned</span>
              <span className="text-xl font-black text-purple-400 mt-0.5 block">{stats.returnedCount}</span>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Pending Claims</span>
              <span className="text-xl font-black text-blue-400 mt-0.5 block">{stats.pendingClaims}</span>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
              <span className="text-[10px] text-amber-400 font-semibold uppercase block">Flagged Posts</span>
              <span className="text-xl font-black text-amber-400 mt-0.5 block">{stats.flaggedCount}</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 flex gap-1 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('flagged')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'flagged' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Flagged Posts Queue ({flaggedItems.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('items')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'items' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Campus Item Registry</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'audit' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit History Log</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-2">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500">Loading moderation records...</p>
        </div>
      ) : activeTab === 'flagged' ? (
        <div className="space-y-4">
          {flaggedItems.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-500 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">All Clear!</h3>
              <p className="text-xs text-slate-400">No items currently require community or safety review.</p>
            </div>
          ) : (
            flaggedItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border-2 border-amber-300 p-5 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white bg-amber-600">
                      FLAGGED REPORT
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                  </div>
                  <span className="text-xs text-slate-400">Reported {formatTimeAgo(item.createdAt)}</span>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950">
                  <span className="font-bold block mb-0.5 uppercase tracking-wider text-[10px]">Flag Reason:</span>
                  <p>{item.flagReason || 'Flagged for proctor inspection.'}</p>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">{item.description}</p>

                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
                  <Link
                    href={`/items/${item.id}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                  >
                    Inspect Post
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleResolveFlag(item.id, 'unflag')}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
                  >
                    Dismiss Flag (Approve)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResolveFlag(item.id, 'close')}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
                  >
                    Close Report
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResolveFlag(item.id, 'remove')}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200"
                  >
                    Remove Post
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : activeTab === 'items' ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 text-xs text-slate-500 font-semibold flex items-center justify-between">
            <span>All Campus Lost & Found Postings ({allItems.length})</span>
            <span>Campus Proctor Controls</span>
          </div>

          <div className="divide-y divide-slate-100">
            {allItems.map((item) => (
              <div
                key={item.id}
                className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white ${
                        item.type === 'LOST' ? 'bg-rose-600' : 'bg-emerald-600'
                      }`}
                    >
                      {item.type}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 truncate">{item.title}</h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        item.status === 'RETURNED'
                          ? 'bg-purple-100 text-purple-800'
                          : item.status === 'CLAIM_PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 mt-1">{item.campusArea}</div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/items/${item.id}`}
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </Link>

                  {item.status !== 'RETURNED' && (
                    <button
                      type="button"
                      onClick={() => setReturnItemTarget(item)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs"
                    >
                      Mark Returned
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 text-xs text-slate-500 font-semibold flex items-center justify-between">
            <span>Audit History Log (Compliance & Accountability)</span>
            <span className="text-[11px] text-slate-400">Total Entries: {auditLogs.length}</span>
          </div>

          <div className="divide-y divide-slate-100">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 text-xs space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-900 text-white">
                      {log.action}
                    </span>
                    <span className="font-bold text-slate-800">
                      {log.actor_name || 'Proctor'} ({log.actorRole})
                    </span>
                  </div>
                  <span className="text-slate-400 text-[11px]">{new Date(log.createdAt).toLocaleString()}</span>
                </div>

                <div className="text-slate-600 font-mono text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  Target: <span className="font-bold">{log.targetType} ({log.targetId})</span>
                  {log.details && <span className="ml-2 text-slate-500">| Details: {log.details}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Return Modal */}
      {returnItemTarget && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Record Verified Return</h3>
              <button
                type="button"
                onClick={() => setReturnItemTarget(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Marking <strong className="text-slate-900">"{returnItemTarget.title}"</strong> as returned. An immutable audit record will be created.
            </p>

            <form onSubmit={handleConfirmReturn} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Handed Over To (Student Name / ID)
                </label>
                <input
                  type="text"
                  required
                  value={handoverName}
                  onChange={(e) => setHandoverName(e.target.value)}
                  placeholder="e.g. Priya Sharma (CS-2023-042)"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Verification Notes
                </label>
                <textarea
                  rows={2}
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="e.g. Verified student badge and serial tag on device."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReturnItemTarget(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs"
                >
                  {isSubmitting ? 'Recording...' : 'Record Return in Audit Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
