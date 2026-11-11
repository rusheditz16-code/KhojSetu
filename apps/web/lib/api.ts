export const API_BASE = '/api';

export function getActiveUserId(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('khojsetu_user_id') || '';
}

export function setActiveUserId(id: string) {
  if (typeof window !== 'undefined') {
    if (id) {
      localStorage.setItem('khojsetu_user_id', id);
    } else {
      localStorage.removeItem('khojsetu_user_id');
    }
  }
}

export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const activeUserId = getActiveUserId();
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
