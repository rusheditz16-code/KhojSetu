// Comprehensive In-Memory Campus Database & Explainable Matching Engine for KhojSetu on Vercel
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  studentId?: string;
  phoneContact?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Item {
  id: string;
  type: 'LOST' | 'FOUND';
  title: string;
  category: string;
  description: string;
  campusArea: string;
  zone: string;
  latitude: number;
  longitude: number;
  incidentDate: string;
  photoUrl?: string | null;
  photoKey?: string | null;
  secretPrompt?: string | null;
  status: 'OPEN' | 'CLAIM_PENDING' | 'RETURNED';
  userId: string;
  isFlagged: boolean;
  flagReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Claim {
  id: string;
  itemId: string;
  claimantId: string;
  privateProofDetail: string;
  privateProofPhotoUrl?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewerNotes?: string | null;
  pickupInstructions?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  linkUrl?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  createdAt: string;
}

// Initial Seed Data
const INITIAL_USERS: User[] = [
  {
    id: 'usr-priya-01',
    name: 'Priya Sharma',
    email: 'priya.sharma@campus.edu',
    role: 'STUDENT',
    studentId: 'CS-2023-042',
    phoneContact: '+91 98765 43210',
    createdAt: new Date('2026-11-01T08:00:00Z').toISOString(),
  },
  {
    id: 'usr-rahul-02',
    name: 'Rahul Verma',
    email: 'rahul.verma@campus.edu',
    role: 'STUDENT',
    studentId: 'ME-2022-115',
    phoneContact: '+91 98765 43211',
    createdAt: new Date('2026-11-01T08:30:00Z').toISOString(),
  },
  {
    id: 'usr-ananya-03',
    name: 'Ananya Patel',
    email: 'ananya.patel@campus.edu',
    role: 'STUDENT',
    studentId: 'EC-2024-089',
    phoneContact: '+91 98765 43212',
    createdAt: new Date('2026-11-02T09:00:00Z').toISOString(),
  },
  {
    id: 'usr-arjun-04',
    name: 'Arjun Nair',
    email: 'arjun.nair@campus.edu',
    role: 'STUDENT',
    studentId: 'CE-2023-018',
    phoneContact: '+91 98765 43213',
    createdAt: new Date('2026-11-02T10:00:00Z').toISOString(),
  },
  {
    id: 'usr-moderator-01',
    name: 'Prof. Vikram Sen (Campus Proctor)',
    email: 'vikram.sen@campus.edu',
    role: 'MODERATOR',
    studentId: 'FAC-MOD-01',
    phoneContact: '+91 98765 43299',
    createdAt: new Date('2026-10-15T00:00:00Z').toISOString(),
  },
];

const INITIAL_ITEMS: Item[] = [
  {
    id: 'itm-lost-laptop-01',
    type: 'LOST',
    title: 'Blue Dell XPS 13 Ultrabook with Stickers',
    category: 'electronics',
    description: 'Lost my dark blue Dell XPS 13 laptop in a grey felt sleeve. Left it on desk 14 in Central Library 2nd floor.',
    campusArea: 'Central Library, 2nd Floor Quiet Section',
    zone: 'library',
    latitude: 12.9716,
    longitude: 77.5946,
    incidentDate: new Date('2026-11-07T14:30:00Z').toISOString(),
    photoUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80',
    secretPrompt: 'Name the specific stickers on the lid and what charger brand is in the pocket.',
    status: 'CLAIM_PENDING',
    userId: 'usr-priya-01',
    isFlagged: false,
    createdAt: new Date('2026-11-07T15:00:00Z').toISOString(),
    updatedAt: new Date('2026-11-07T15:00:00Z').toISOString(),
  },
  {
    id: 'itm-fnd-laptop-02',
    type: 'FOUND',
    title: 'Found Dell Laptop in Grey Sleeve',
    category: 'electronics',
    description: 'Found a dark blue Dell laptop left unattended on table 7 in the library reference section. Handed in at desk.',
    campusArea: 'Central Library, 2nd Floor Near Reference',
    zone: 'library',
    latitude: 12.9717,
    longitude: 77.5947,
    incidentDate: new Date('2026-11-07T16:00:00Z').toISOString(),
    photoUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
    secretPrompt: 'Describe the stickers on the shell or the lock screen wallpaper.',
    status: 'OPEN',
    userId: 'usr-rahul-02',
    isFlagged: false,
    createdAt: new Date('2026-11-07T16:30:00Z').toISOString(),
    updatedAt: new Date('2026-11-07T16:30:00Z').toISOString(),
  },
  {
    id: 'itm-lost-wallet-03',
    type: 'LOST',
    title: 'Brown Leather Fossil Bi-Fold Wallet',
    category: 'wallets_bags',
    description: 'Lost brown leather wallet during lunch break. Contains Metro card, student ID, and library pass.',
    campusArea: 'Student Cafeteria, Corner Booth 4',
    zone: 'cafeteria',
    latitude: 12.9730,
    longitude: 77.5960,
    incidentDate: new Date('2026-11-06T13:00:00Z').toISOString(),
    photoUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
    secretPrompt: 'What photo card is inside the transparent ID window?',
    status: 'OPEN',
    userId: 'usr-ananya-03',
    isFlagged: false,
    createdAt: new Date('2026-11-06T13:45:00Z').toISOString(),
    updatedAt: new Date('2026-11-06T13:45:00Z').toISOString(),
  },
  {
    id: 'itm-fnd-wallet-04',
    type: 'FOUND',
    title: "Men's Brown Leather Wallet",
    category: 'wallets_bags',
    description: 'Found brown leather wallet dropped beneath table #6 near the juice counter after afternoon lunch.',
    campusArea: 'Student Cafeteria, Table 6',
    zone: 'cafeteria',
    latitude: 12.9731,
    longitude: 77.5961,
    incidentDate: new Date('2026-11-06T13:30:00Z').toISOString(),
    photoUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
    secretPrompt: 'State the name on the ID card inside or the exact currency denominations.',
    status: 'OPEN',
    userId: 'usr-arjun-04',
    isFlagged: false,
    createdAt: new Date('2026-11-06T14:00:00Z').toISOString(),
    updatedAt: new Date('2026-11-06T14:00:00Z').toISOString(),
  },
  {
    id: 'itm-lost-id-05',
    type: 'LOST',
    title: 'University Student ID Card - Rahul Verma',
    category: 'id_cards',
    description: 'Misplaced university lanyard and RFID card somewhere between badminton arena and locker room.',
    campusArea: 'Sports Complex, Indoor Badminton Arena',
    zone: 'sports_complex',
    latitude: 12.9750,
    longitude: 77.5980,
    incidentDate: new Date('2026-11-07T10:00:00Z').toISOString(),
    photoUrl: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=600&auto=format&fit=crop&q=80',
    secretPrompt: 'Confirm my Department and Student Roll Number.',
    status: 'OPEN',
    userId: 'usr-rahul-02',
    isFlagged: false,
    createdAt: new Date('2026-11-07T10:30:00Z').toISOString(),
    updatedAt: new Date('2026-11-07T10:30:00Z').toISOString(),
  },
  {
    id: 'itm-flagged-06',
    type: 'FOUND',
    title: 'Unmarked sealed box left behind bushes',
    category: 'other',
    description: 'Cardboard box left unattended in flower beds near administration building.',
    campusArea: 'Administrative Center, Garden perimeter',
    zone: 'admin_building',
    latitude: 12.9700,
    longitude: 77.5920,
    incidentDate: new Date('2026-11-05T09:00:00Z').toISOString(),
    photoUrl: null,
    secretPrompt: 'Describe contents',
    status: 'OPEN',
    userId: 'usr-arjun-04',
    isFlagged: true,
    flagReason: 'Flagged by student: Potential safety hazard, requires proctor review.',
    createdAt: new Date('2026-11-05T09:30:00Z').toISOString(),
    updatedAt: new Date('2026-11-05T09:30:00Z').toISOString(),
  },
];

const INITIAL_CLAIMS: Claim[] = [
  {
    id: 'clm-laptop-01',
    itemId: 'itm-fnd-laptop-02',
    claimantId: 'usr-priya-01',
    privateProofDetail: 'Dell XPS 13 (9310). Lid has a round NASA Meatball sticker and a purple GitHub Octocat. Inside the felt sleeve is an Anker 65W GaN adapter with braided black cord.',
    status: 'PENDING',
    createdAt: new Date('2026-11-07T17:00:00Z').toISOString(),
    updatedAt: new Date('2026-11-07T17:00:00Z').toISOString(),
  },
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-01',
    userId: 'usr-priya-01',
    type: 'MATCH_FOUND',
    title: '🎯 High-Confidence Match (95%): Dell Laptop',
    message: 'A found report "Found Dell Laptop in Grey Sleeve" at Central Library closely matches your lost report!',
    linkUrl: '/items/itm-fnd-laptop-02',
    isRead: false,
    createdAt: new Date('2026-11-07T16:35:00Z').toISOString(),
  },
  {
    id: 'notif-02',
    userId: 'usr-rahul-02',
    type: 'CLAIM_SUBMITTED',
    title: '📩 New Ownership Claim Received',
    message: 'Priya Sharma submitted private verification proof for your found item "Found Dell Laptop in Grey Sleeve".',
    linkUrl: '/my-posts',
    isRead: false,
    createdAt: new Date('2026-11-07T17:01:00Z').toISOString(),
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-01',
    actorId: 'usr-moderator-01',
    actorRole: 'MODERATOR',
    action: 'SYSTEM_BOOT',
    targetType: 'system',
    targetId: 'khojsetu-v2',
    details: JSON.stringify({ message: 'Next.js App Router serverless backend initialized.' }),
    createdAt: new Date('2026-11-01T00:00:00Z').toISOString(),
  },
];

// Global Singleton Store (persists across hot reloads and lambda invocations)
declare global {
  var __KHOJSETU_USERS: User[] | undefined;
  var __KHOJSETU_ITEMS: Item[] | undefined;
  var __KHOJSETU_CLAIMS: Claim[] | undefined;
  var __KHOJSETU_NOTIFS: Notification[] | undefined;
  var __KHOJSETU_AUDITS: AuditLog[] | undefined;
}

globalThis.__KHOJSETU_USERS = globalThis.__KHOJSETU_USERS || [...INITIAL_USERS];
globalThis.__KHOJSETU_ITEMS = globalThis.__KHOJSETU_ITEMS || [...INITIAL_ITEMS];
globalThis.__KHOJSETU_CLAIMS = globalThis.__KHOJSETU_CLAIMS || [...INITIAL_CLAIMS];
globalThis.__KHOJSETU_NOTIFS = globalThis.__KHOJSETU_NOTIFS || [...INITIAL_NOTIFICATIONS];
globalThis.__KHOJSETU_AUDITS = globalThis.__KHOJSETU_AUDITS || [...INITIAL_AUDIT_LOGS];

const users = globalThis.__KHOJSETU_USERS;
const items = globalThis.__KHOJSETU_ITEMS;
const claims = globalThis.__KHOJSETU_CLAIMS;
const notifications = globalThis.__KHOJSETU_NOTIFS;
const auditLogs = globalThis.__KHOJSETU_AUDITS;

// Distance calculation (Haversine PostGIS simulation)
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// 100-Point Explainable Scoring Algorithm
function computeMatch(source: Item, target: Item) {
  const isOpposite = source.type !== target.type;
  if (!isOpposite) return null;

  // 1. Category (35%)
  const categoryMatch = source.category === target.category;
  const categoryScore = categoryMatch ? 35 : 0;

  // 2. Keywords (25%)
  const stopWords = new Set(['the', 'and', 'with', 'for', 'left', 'found', 'lost', 'near', 'on', 'in', 'at']);
  const extractWords = (txt: string) =>
    (txt || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));

  const wordsA = new Set([...extractWords(source.title), ...extractWords(source.description)]);
  const wordsB = new Set([...extractWords(target.title), ...extractWords(target.description)]);

  const matchedKeywords: string[] = [];
  wordsA.forEach((w) => {
    if (wordsB.has(w)) matchedKeywords.push(w);
  });

  const keywordFraction = Math.min(matchedKeywords.length / 3, 1.0);
  const keywordScore = Math.round(keywordFraction * 25);

  // 3. PostGIS Campus Distance (25%)
  const distanceMeters = calculateDistanceMeters(
    source.latitude,
    source.longitude,
    target.latitude,
    target.longitude
  );

  let locationScore = 0;
  let distanceExplanation = '';
  if (distanceMeters <= 50) {
    locationScore = 25;
    distanceExplanation = 'same exact campus spot (~' + distanceMeters + 'm)';
  } else if (distanceMeters <= 150) {
    locationScore = 20;
    distanceExplanation = 'within ~' + distanceMeters + 'm walking distance';
  } else if (distanceMeters <= 400) {
    locationScore = 12;
    distanceExplanation = 'same general campus quadrant (~' + distanceMeters + 'm)';
  } else {
    locationScore = 5;
    distanceExplanation = 'across campus (~' + distanceMeters + 'm)';
  }

  // 4. Time Proximity (15%)
  const timeDiffHours = Math.abs(
    new Date(source.incidentDate).getTime() - new Date(target.incidentDate).getTime()
  ) / (1000 * 60 * 60);

  let timeScore = 0;
  let timeExplanation = '';
  if (timeDiffHours <= 6) {
    timeScore = 15;
    timeExplanation = 'reported within 6 hours of incident';
  } else if (timeDiffHours <= 24) {
    timeScore = 10;
    timeExplanation = 'reported within 24 hours';
  } else if (timeDiffHours <= 72) {
    timeScore = 5;
    timeExplanation = 'reported within 3 days';
  } else {
    timeScore = 2;
    timeExplanation = 'reported within same week';
  }

  const totalScore = categoryScore + keywordScore + locationScore + timeScore;

  const reasons: string[] = [];
  if (categoryMatch) reasons.push('same category (' + source.category + ')');
  if (matchedKeywords.length > 0) reasons.push('matching keywords (' + matchedKeywords.slice(0, 3).join(', ') + ')');
  reasons.push(distanceExplanation);
  reasons.push(timeExplanation);

  return {
    candidateItem: target,
    score: totalScore,
    confidence: totalScore >= 70 ? 'HIGH' : totalScore >= 45 ? 'MEDIUM' : 'LOW',
    explanationSummary: 'Matches because of ' + reasons.join(', ') + '.',
    factors: {
      categoryMatch: { score: categoryScore, max: 35, matched: categoryMatch },
      keywordMatch: { score: keywordScore, max: 25, keywords: matchedKeywords },
      spatialProximity: { score: locationScore, max: 25, distanceMeters, explanation: distanceExplanation },
      timeProximity: { score: timeScore, max: 15, timeDiffHours: Math.round(timeDiffHours), explanation: timeExplanation },
    },
  };
}

export const serverStore = {
  // Users
  getUsers: () => users,
  getUserById: (id: string) => users.find((u) => u.id === id) || null,
  getUserByEmail: (email: string) => users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null,
  upsertGoogleUser: (data: { email: string; name: string; avatarUrl?: string; role?: string }) => {
    const existing = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      if (data.name && existing.name !== data.name) existing.name = data.name;
      return existing;
    }
    const isProctor = data.email.includes('proctor') || data.email.includes('mod') || data.email.includes('admin');
    const newUser: User = {
      id: 'usr-google-' + uuidv4().substring(0, 8),
      name: data.name || data.email.split('@')[0],
      email: data.email,
      role: data.role || (isProctor ? 'MODERATOR' : 'STUDENT'),
      studentId: isProctor ? 'FAC-PROCTOR' : 'STU-' + Math.floor(1000 + Math.random() * 9000),
      avatarUrl: data.avatarUrl,
      createdAt: new Date().toISOString(),
    };
    users.unshift(newUser);
    return newUser;
  },

  // Items
  getItems: (filters: { type?: string; category?: string; zone?: string; status?: string; search?: string } = {}) => {
    return items.filter((item) => {
      if (filters.type && filters.type !== 'all' && item.type.toUpperCase() !== filters.type.toUpperCase()) return false;
      if (filters.category && item.category !== filters.category) return false;
      if (filters.zone && item.zone !== filters.zone) return false;
      if (filters.status && item.status.toUpperCase() !== filters.status.toUpperCase()) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesArea = item.campusArea.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesArea) return false;
      }
      return true;
    });
  },
  getItemById: (id: string) => items.find((i) => i.id === id) || null,
  createItem: (itemData: Partial<Item> & { userId: string; title: string; type: 'LOST' | 'FOUND' }) => {
    const newItem: Item = {
      id: 'itm-' + uuidv4().substring(0, 8),
      type: itemData.type,
      title: itemData.title,
      category: itemData.category || 'other',
      description: itemData.description || '',
      campusArea: itemData.campusArea || 'Campus Area',
      zone: itemData.zone || 'library',
      latitude: itemData.latitude || 12.9716,
      longitude: itemData.longitude || 77.5946,
      incidentDate: itemData.incidentDate || new Date().toISOString(),
      photoUrl: itemData.photoUrl || null,
      secretPrompt: itemData.secretPrompt || null,
      status: 'OPEN',
      userId: itemData.userId,
      isFlagged: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    items.unshift(newItem);

    // Auto-create matching alert for other students
    const matches = items
      .filter((other) => other.id !== newItem.id && other.type !== newItem.type)
      .map((other) => computeMatch(newItem, other))
      .filter(Boolean) as any[];

    const highScoreMatch = matches.find((m) => m.score >= 60);
    if (highScoreMatch) {
      notifications.unshift({
        id: 'notif-' + uuidv4().substring(0, 8),
        userId: newItem.userId,
        type: 'MATCH_FOUND',
        title: '🎯 Potential Match (' + highScoreMatch.score + '%): ' + highScoreMatch.candidateItem.title,
        message: highScoreMatch.explanationSummary,
        linkUrl: '/items/' + highScoreMatch.candidateItem.id,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    return newItem;
  },
  updateItemStatus: (id: string, status: 'OPEN' | 'CLAIM_PENDING' | 'RETURNED') => {
    const it = items.find((i) => i.id === id);
    if (!it) return null;
    it.status = status;
    it.updatedAt = new Date().toISOString();
    return it;
  },
  deleteItem: (id: string) => {
    const idx = items.findIndex((i) => i.id === id);
    if (idx !== -1) {
      items.splice(idx, 1);
      return true;
    }
    return false;
  },

  // Match Radar
  getMatches: (id: string, minScore = 30) => {
    const source = items.find((i) => i.id === id);
    if (!source) return [];
    return items
      .filter((other) => other.id !== id && other.type !== source.type)
      .map((other) => computeMatch(source, other))
      .filter((m): m is NonNullable<typeof m> => m !== null && m.score >= minScore)
      .sort((a, b) => b.score - a.score);
  },
  getHighlights: () => {
    const lostItems = items.filter((i) => i.type === 'LOST' && i.status !== 'RETURNED');
    const foundItems = items.filter((i) => i.type === 'FOUND' && i.status !== 'RETURNED');
    const pairings: any[] = [];

    lostItems.forEach((lost) => {
      foundItems.forEach((found) => {
        const m = computeMatch(lost, found);
        if (m && m.score >= 50) {
          pairings.push({
            score: m.score,
            lostItem: lost,
            foundItem: found,
            explanationSummary: m.explanationSummary,
          });
        }
      });
    });

    return pairings.sort((a, b) => b.score - a.score).slice(0, 4);
  },

  // Claims with Strict Privacy Shield
  createClaim: (claimData: { itemId: string; claimantId: string; privateProofDetail: string; privateProofPhotoUrl?: string }) => {
    const it = items.find((i) => i.id === claimData.itemId);
    if (!it) throw new Error('Item not found');

    const newClaim: Claim = {
      id: 'clm-' + uuidv4().substring(0, 8),
      itemId: claimData.itemId,
      claimantId: claimData.claimantId,
      privateProofDetail: claimData.privateProofDetail,
      privateProofPhotoUrl: claimData.privateProofPhotoUrl || null,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    claims.unshift(newClaim);
    it.status = 'CLAIM_PENDING';

    // Alert finder/owner
    notifications.unshift({
      id: 'notif-' + uuidv4().substring(0, 8),
      userId: it.userId,
      type: 'CLAIM_SUBMITTED',
      title: '📩 New Ownership Claim: ' + it.title,
      message: 'A student submitted private ownership verification proof for your report.',
      linkUrl: '/my-posts',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return newClaim;
  },
  getClaimsByItem: (itemId: string, requesterId: string, isModerator = false) => {
    const it = items.find((i) => i.id === itemId);
    if (!it) return [];

    // Privacy shield: only owner or proctor can see proofs
    if (it.userId !== requesterId && !isModerator) {
      throw new Error('403 Forbidden: Ownership proofs are private to post author and campus proctors.');
    }

    return claims
      .filter((c) => c.itemId === itemId)
      .map((c) => ({
        ...c,
        claimant: users.find((u) => u.id === c.claimantId) || { name: 'Student', email: 'verified@campus.edu' },
      }));
  },
  getMyClaims: (claimantId: string) => {
    return claims
      .filter((c) => c.claimantId === claimantId)
      .map((c) => ({
        ...c,
        item: items.find((i) => i.id === c.itemId) || null,
      }));
  },
  reviewClaim: (claimId: string, status: 'APPROVED' | 'REJECTED', notes?: string, pickupInstructions?: string) => {
    const clm = claims.find((c) => c.id === claimId);
    if (!clm) throw new Error('Claim not found');
    clm.status = status;
    clm.reviewerNotes = notes || null;
    clm.pickupInstructions = pickupInstructions || null;
    clm.updatedAt = new Date().toISOString();

    const it = items.find((i) => i.id === clm.itemId);
    if (status === 'APPROVED' && it) {
      it.status = 'RETURNED';
    } else if (status === 'REJECTED' && it) {
      const otherPending = claims.some((c) => c.itemId === it.id && c.id !== clm.id && c.status === 'PENDING');
      it.status = otherPending ? 'CLAIM_PENDING' : 'OPEN';
    }

    // Alert claimant
    notifications.unshift({
      id: 'notif-' + uuidv4().substring(0, 8),
      userId: clm.claimantId,
      type: 'CLAIM_REVIEWED',
      title: status === 'APPROVED' ? '✅ Ownership Claim Approved!' : '❌ Claim Update',
      message:
        status === 'APPROVED'
          ? 'Your claim was verified! Pickup: ' + (pickupInstructions || 'Coordinate with desk.')
          : 'Your claim could not be verified by the finder.',
      linkUrl: '/my-posts',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return clm;
  },

  // Moderation
  flagItem: (itemId: string, reason: string) => {
    const it = items.find((i) => i.id === itemId);
    if (!it) return null;
    it.isFlagged = true;
    it.flagReason = reason;
    return it;
  },
  resolveFlag: (itemId: string, action: string, notes?: string) => {
    const it = items.find((i) => i.id === itemId);
    if (!it) return null;
    it.isFlagged = false;
    it.flagReason = null;
    if (action === 'dismiss' || action === 'remove') {
      serverStore.deleteItem(itemId);
    }
    auditLogs.unshift({
      id: 'aud-' + uuidv4().substring(0, 8),
      actorId: 'usr-moderator-01',
      actorRole: 'MODERATOR',
      action: 'RESOLVE_FLAG_' + action.toUpperCase(),
      targetType: 'item',
      targetId: itemId,
      details: JSON.stringify({ action, notes }),
      createdAt: new Date().toISOString(),
    });
    return it;
  },
  markReturned: (itemId: string, handedToName: string, notes?: string) => {
    const it = items.find((i) => i.id === itemId);
    if (!it) return null;
    it.status = 'RETURNED';
    it.updatedAt = new Date().toISOString();
    auditLogs.unshift({
      id: 'aud-' + uuidv4().substring(0, 8),
      actorId: 'usr-moderator-01',
      actorRole: 'MODERATOR',
      action: 'ITEM_HANDOVER_CONFIRMED',
      targetType: 'item',
      targetId: itemId,
      details: JSON.stringify({ handedToName, notes }),
      createdAt: new Date().toISOString(),
    });
    return it;
  },
  getModerationStats: () => {
    return {
      totalItems: items.length,
      flaggedCount: items.filter((i) => i.isFlagged).length,
      returnedCount: items.filter((i) => i.status === 'RETURNED').length,
      openClaimsCount: claims.filter((c) => c.status === 'PENDING').length,
    };
  },
  getFlaggedItems: () => items.filter((i) => i.isFlagged),
  getAuditLogs: () => auditLogs.slice(0, 50),

  // Notifications
  getNotifications: (userId: string) => notifications.filter((n) => n.userId === userId),
  markNotificationRead: (id: string) => {
    const notif = notifications.find((n) => n.id === id);
    if (notif) notif.isRead = true;
    return notif;
  },
  markAllNotificationsRead: (userId: string) => {
    notifications.filter((n) => n.userId === userId).forEach((n) => (n.isRead = true));
    return true;
  },
};
