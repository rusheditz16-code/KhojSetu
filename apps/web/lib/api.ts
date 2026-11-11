export const API_BASE = '/api';

const LOCAL_ITEMS_KEY = 'khojsetu_local_items';
const DELETED_ITEMS_KEY = 'khojsetu_deleted_item_ids';
const LOCAL_CLAIMS_KEY = 'khojsetu_local_claims';

export function getActiveUserId(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem('khojsetu_user_id') || '';
  } catch {
    return '';
  }
}

export function setActiveUserId(id: string) {
  if (typeof window === 'undefined') return;
  try {
    if (id) {
      localStorage.setItem('khojsetu_user_id', id);
    } else {
      localStorage.removeItem('khojsetu_user_id');
    }
  } catch {}
}

function readLocalJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocalJson(key: string, value: any) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // If quota exceeded due to large base64 photos, trim oldest item photos and retry
    try {
      if (key === LOCAL_ITEMS_KEY && Array.isArray(value) && value.length > 1) {
        const trimmed = value.slice(0, 10).map((it: any, idx: number) =>
          idx >= 3 && it?.photoUrl?.startsWith('data:') ? { ...it, photoUrl: null } : it
        );
        localStorage.setItem(key, JSON.stringify(trimmed));
      }
    } catch {}
  }
}

function saveLocalItem(item: any) {
  if (!item?.id) return;
  const current = readLocalJson<any[]>(LOCAL_ITEMS_KEY, []);
  const filtered = current.filter((i) => i.id !== item.id);
  writeLocalJson(LOCAL_ITEMS_KEY, [item, ...filtered]);
}

function markLocalItemDeleted(id: string) {
  const current = readLocalJson<any[]>(LOCAL_ITEMS_KEY, []);
  writeLocalJson(
    LOCAL_ITEMS_KEY,
    current.filter((i) => i.id !== id)
  );
  const deleted = readLocalJson<string[]>(DELETED_ITEMS_KEY, []);
  if (!deleted.includes(id)) {
    writeLocalJson(DELETED_ITEMS_KEY, [id, ...deleted].slice(0, 50));
  }
}

function filterMergedItems(itemsList: any[], queryStr?: string) {
  const params = new URLSearchParams(queryStr || '');
  const type = params.get('type');
  const category = params.get('category');
  const zone = params.get('zone');
  const status = params.get('status');
  const search = params.get('search');

  return itemsList.filter((item) => {
    if (!item) return false;
    if (type && type !== 'all' && String(item.type).toUpperCase() !== type.toUpperCase()) return false;
    if (category && item.category !== category) return false;
    if (zone && item.zone !== zone) return false;
    if (status && String(item.status).toUpperCase() !== status.toUpperCase()) return false;
    if (search) {
      const q = search.toLowerCase();
      const t = (item.title || '').toLowerCase().includes(q);
      const d = (item.description || '').toLowerCase().includes(q);
      const a = (item.campusArea || '').toLowerCase().includes(q);
      if (!t && !d && !a) return false;
    }
    return true;
  });
}

function computeClientMatches(source: any, pool: any[], minScore = 30) {
  if (!source) return [];
  const stopWords = new Set(['the', 'and', 'with', 'for', 'left', 'found', 'lost', 'near', 'on', 'in', 'at']);
  const extractWords = (txt: string) =>
    (txt || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));

  return pool
    .filter((other) => other && other.id !== source.id && other.type !== source.type)
    .map((target) => {
      const categoryMatch = source.category === target.category;
      const categoryScore = categoryMatch ? 35 : 0;

      const wordsA = new Set([...extractWords(source.title), ...extractWords(source.description)]);
      const wordsB = new Set([...extractWords(target.title), ...extractWords(target.description)]);
      const matchedKeywords: string[] = [];
      wordsA.forEach((w) => {
        if (wordsB.has(w)) matchedKeywords.push(w);
      });
      const keywordScore = Math.round(Math.min(matchedKeywords.length / 3, 1.0) * 25);

      const locationScore = source.zone === target.zone ? 25 : 10;
      const distanceExplanation = source.zone === target.zone ? 'same campus zone' : 'across campus';

      const diffHours =
        Math.abs(new Date(source.incidentDate || Date.now()).getTime() - new Date(target.incidentDate || Date.now()).getTime()) /
        3600000;
      const timeScore = diffHours <= 6 ? 15 : diffHours <= 24 ? 10 : diffHours <= 72 ? 5 : 2;
      const timeExplanation = diffHours <= 24 ? 'reported within 24 hours' : 'reported recently';

      const totalScore = categoryScore + keywordScore + locationScore + timeScore;
      const tier = totalScore >= 70 ? 'HIGH' : totalScore >= 45 ? 'MEDIUM' : 'LOW';
      const reasons: string[] = [];
      if (categoryMatch) reasons.push(`same category (${source.category})`);
      if (matchedKeywords.length > 0) reasons.push(`matching keywords (${matchedKeywords.slice(0, 3).join(', ')})`);
      reasons.push(distanceExplanation, timeExplanation);

      return {
        item: target,
        candidateItem: target,
        score: totalScore,
        confidence: tier,
        confidenceTier: tier,
        explanationSummary: `Matches because of ${reasons.join(', ')}.`,
        factors: [
          { factor: 'Category', points: categoryScore, maxPoints: 35, matched: categoryMatch },
          { factor: 'Keywords', points: keywordScore, maxPoints: 25, keywords: matchedKeywords },
          { factor: 'Spatial', points: locationScore, maxPoints: 25, explanation: distanceExplanation },
          { factor: 'Timing', points: timeScore, maxPoints: 15, explanation: timeExplanation },
        ],
      };
    })
    .filter((m) => m.score >= minScore)
    .sort((a, b) => b.score - a.score);
}

export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const activeUserId = getActiveUserId();
  const method = (options.method || 'GET').toUpperCase();
  const headers: Record<string, string> = {
    'x-user-id': activeUserId,
    ...((options.headers as Record<string, string>) || {}),
  };

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  // Client-side cross-lambda resilience layer for Vercel deployments
  if (typeof window !== 'undefined') {
    const [cleanPath, queryStr] = endpoint.split('?');

    // 1. After publishing item, persist locally so isolated lambdas never 404 on redirect
    if (cleanPath === '/items' && method === 'POST' && res.ok && data?.item) {
      saveLocalItem(data.item);
      return data;
    }

    // 2. Merge local items with server catalog on GET /items
    if (cleanPath === '/items' && method === 'GET' && res.ok) {
      const serverItems: any[] = data?.items || [];
      const localItems = readLocalJson<any[]>(LOCAL_ITEMS_KEY, []);
      const deletedIds = new Set(readLocalJson<string[]>(DELETED_ITEMS_KEY, []));

      const mergedMap = new Map<string, any>();
      localItems.forEach((it) => {
        if (it?.id && !deletedIds.has(it.id)) mergedMap.set(it.id, it);
      });
      serverItems.forEach((it) => {
        if (it?.id && !deletedIds.has(it.id) && !mergedMap.has(it.id)) {
          mergedMap.set(it.id, it);
        }
      });

      const mergedList = filterMergedItems(Array.from(mergedMap.values()), queryStr);
      return { ...data, items: mergedList, count: mergedList.length } as T;
    }

    // 3. Single item fetch fallback if isolated Vercel lambda doesn't have the item
    if (cleanPath.startsWith('/items/') && !cleanPath.endsWith('/flag') && !cleanPath.endsWith('/status')) {
      const itemId = cleanPath.replace('/items/', '');
      if (method === 'GET') {
        const localItems = readLocalJson<any[]>(LOCAL_ITEMS_KEY, []);
        const localMatch = localItems.find((i) => i.id === itemId);
        if (!res.ok && localMatch) {
          return { item: localMatch } as T;
        }
        if (res.ok && data?.item && localMatch) {
          return { item: localMatch } as T;
        }
      } else if (method === 'DELETE' && (res.ok || res.status === 404)) {
        markLocalItemDeleted(itemId);
        return { success: true, message: 'Item deleted' } as T;
      }
    }

    // 4. Status update sync
    if (cleanPath.match(/^\/items\/[^/]+\/status$/) && method === 'PATCH') {
      const itemId = cleanPath.split('/')[2];
      const localItems = readLocalJson<any[]>(LOCAL_ITEMS_KEY, []);
      const idx = localItems.findIndex((i) => i.id === itemId);
      if (idx !== -1 && options.body && typeof options.body === 'string') {
        try {
          const parsedBody = JSON.parse(options.body);
          localItems[idx] = { ...localItems[idx], status: parsedBody.status || localItems[idx].status };
          writeLocalJson(LOCAL_ITEMS_KEY, localItems);
          if (!res.ok) return { item: localItems[idx] } as T;
        } catch {}
      }
    }

    // 5. Match radar fallback for locally persisted items
    if (cleanPath.startsWith('/matches/') && !cleanPath.includes('/dashboard/') && method === 'GET') {
      const itemId = cleanPath.replace('/matches/', '');
      const localItems = readLocalJson<any[]>(LOCAL_ITEMS_KEY, []);
      const localTarget = localItems.find((i) => i.id === itemId);
      if (localTarget && (!res.ok || !data?.matches?.length)) {
        const params = new URLSearchParams(queryStr || '');
        const minScore = parseInt(params.get('minScore') || '30', 10);
        const serverPoolRes = await fetch(`${API_BASE}/items`).then((r) => r.json()).catch(() => ({ items: [] }));
        const poolMap = new Map<string, any>();
        [...localItems, ...(serverPoolRes?.items || [])].forEach((i) => {
          if (i?.id) poolMap.set(i.id, i);
        });
        const computed = computeClientMatches(localTarget, Array.from(poolMap.values()), minScore);
        return { matches: computed } as T;
      }
    }

    // 6. Claim persistence mirror
    if (cleanPath === '/claims' && method === 'POST' && res.ok && data?.claim) {
      const currentClaims = readLocalJson<any[]>(LOCAL_CLAIMS_KEY, []);
      writeLocalJson(LOCAL_CLAIMS_KEY, [data.claim, ...currentClaims]);
    }

    if (cleanPath === '/claims/my' && method === 'GET' && res.ok) {
      const serverClaims: any[] = data?.claims || [];
      const localClaims = readLocalJson<any[]>(LOCAL_CLAIMS_KEY, []).filter(
        (c) => !activeUserId || c.claimantId === activeUserId
      );
      const localItems = readLocalJson<any[]>(LOCAL_ITEMS_KEY, []);
      const claimMap = new Map<string, any>();
      [...serverClaims, ...localClaims].forEach((c) => {
        if (c?.id && !claimMap.has(c.id)) {
          claimMap.set(c.id, {
            ...c,
            item: c.item || localItems.find((i) => i.id === c.itemId) || null,
          });
        }
      });
      return { claims: Array.from(claimMap.values()) } as T;
    }
  }

  if (!res.ok) {
    const errorMsg = data.message || data.error || `Request failed with status ${res.status}`;
    const err: any = new Error(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg);
    err.status = res.status;
    throw err;
  }
  return data;
}

export function formatTimeAgo(dateString?: string | Date): string {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDays = Math.floor(diffHour / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export const CATEGORIES = [
  { id: 'electronics', label: 'Electronics & Gadgets' },
  { id: 'id_cards', label: 'ID Cards & Badges' },
  { id: 'wallets_bags', label: 'Wallets, Purses & Bags' },
  { id: 'keys', label: 'Keys & Keychains' },
  { id: 'clothing', label: 'Clothing & Jackets' },
  { id: 'books', label: 'Books & Stationery' },
  { id: 'bottles', label: 'Bottles & Mugs' },
  { id: 'other', label: 'Other Miscellaneous' },
];

export const CAMPUS_ZONES = [
  { id: 'library', name: 'Central Library' },
  { id: 'eng_block', name: 'Engineering Block' },
  { id: 'science_block', name: 'Science Complex' },
  { id: 'cafeteria', name: 'Student Cafeteria' },
  { id: 'sports_complex', name: 'Sports Complex' },
  { id: 'hostels', name: 'Hostel Quads' },
  { id: 'admin_building', name: 'Admin Building' },
  { id: 'other', name: 'Other Campus Area' },
];

export function getCategoryLabel(id?: string): string {
  const found = CATEGORIES.find((c) => c.id === id);
  return found ? found.label : (id?.replace(/_/g, ' ') || 'General');
}

export function getZoneLabel(id?: string): string {
  const found = CAMPUS_ZONES.find((z) => z.id === id);
  return found ? found.name : (id?.replace(/_/g, ' ') || 'Campus');
}
