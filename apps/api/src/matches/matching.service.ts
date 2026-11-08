import { Injectable } from '@nestjs/common';
import { Item } from '@prisma/client';

export interface MatchFactor {
  factor: string;
  points: number;
  maxPoints: number;
  description: string;
  passed: boolean;
}

export interface MatchResult {
  score: number;
  confidenceTier: 'high' | 'medium' | 'low';
  explanationSummary: string;
  factors: MatchFactor[];
  distanceMeters?: number;
  vectorSimilarity?: number;
}

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
  'any', 'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below',
  'between', 'both', 'but', 'by', 'can', 'did', 'do', 'does', 'doing', 'down',
  'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have',
  'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his',
  'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me',
  'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off',
  'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out',
  'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that',
  'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these',
  'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up',
  'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while',
  'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 'yourself',
  'lost', 'found', 'please', 'help', 'item', 'campus', 'room'
]);

@Injectable()
export class MatchingService {
  /**
   * Tokenize and remove stop words
   */
  private tokenize(text: string): Set<string> {
    if (!text) return new Set();
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
    return new Set(words);
  }

  /**
   * PostGIS Approximate Distance Calculation (Spherical Haversine)
   * Operates on rounded coordinates (~100m radius) to preserve user privacy
   */
  private computeDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
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

  /**
   * Explainable Match Scoring Algorithm (100-Point Formula)
   */
  computeMatch(itemA: Item, itemB: Item): MatchResult {
    const factors: MatchFactor[] = [];
    let totalScore = 0;

    // 1. Category Match (Max 35 points)
    let catScore = 0;
    let catDesc = '';
    if (itemA.category === itemB.category) {
      catScore = 35;
      catDesc = `Exact category match (${itemA.category.replace(/_/g, ' ')})`;
    } else if (itemA.category === 'other' || itemB.category === 'other') {
      catScore = 10;
      catDesc = 'Partial match with miscellaneous category';
    } else {
      catScore = 0;
      catDesc = `Different categories (${itemA.category} vs ${itemB.category})`;
    }
    totalScore += catScore;
    factors.push({
      factor: 'Category',
      points: catScore,
      maxPoints: 35,
      description: catDesc,
      passed: catScore > 0,
    });

    // 2. Keyword & Text Similarity (Max 25 points)
    const tokensA = this.tokenize(`${itemA.title} ${itemA.description}`);
    const tokensB = this.tokenize(`${itemB.title} ${itemB.description}`);
    const matchedKeywords: string[] = [];
    for (const token of tokensA) {
      if (tokensB.has(token)) {
        matchedKeywords.push(token);
      }
    }

    let keywordScore = 0;
    let keywordDesc = '';
    if (matchedKeywords.length >= 4) {
      keywordScore = 25;
      keywordDesc = `High keyword overlap: "${matchedKeywords.slice(0, 4).join(', ')}"`;
    } else if (matchedKeywords.length === 3) {
      keywordScore = 20;
      keywordDesc = `Good keyword overlap: "${matchedKeywords.join(', ')}"`;
    } else if (matchedKeywords.length === 2) {
      keywordScore = 15;
      keywordDesc = `Matched terms: "${matchedKeywords.join(', ')}"`;
    } else if (matchedKeywords.length === 1) {
      keywordScore = 8;
      keywordDesc = `Single term matched: "${matchedKeywords[0]}"`;
    } else {
      keywordScore = 0;
      keywordDesc = 'No distinctive keywords in common';
    }
    totalScore += keywordScore;
    factors.push({
      factor: 'Keywords & Description',
      points: keywordScore,
      maxPoints: 25,
      description: keywordDesc,
      passed: keywordScore > 0,
    });

    // 3. PostGIS / Geospatial & Zone Proximity (Max 25 points)
    let locScore = 0;
    let locDesc = '';
    let distanceMeters: number | undefined;

    if (itemA.latitude && itemA.longitude && itemB.latitude && itemB.longitude) {
      distanceMeters = this.computeDistanceMeters(
        itemA.latitude,
        itemA.longitude,
        itemB.latitude,
        itemB.longitude,
      );
      if (distanceMeters <= 200) {
        locScore = 25;
        locDesc = `Immediate vicinity (${distanceMeters}m via PostGIS coordinates)`;
      } else if (distanceMeters <= 500) {
        locScore = 18;
        locDesc = `Same campus quadrant (~${distanceMeters}m away)`;
      } else if (distanceMeters <= 1000) {
        locScore = 12;
        locDesc = `Within campus walking radius (~${distanceMeters}m)`;
      } else {
        locScore = 4;
        locDesc = `Across campus (~${distanceMeters}m)`;
      }
    } else if (itemA.zone && itemB.zone && itemA.zone === itemB.zone) {
      locScore = 25;
      locDesc = `Same campus zone (${itemA.zone.replace(/_/g, ' ')})`;
    } else {
      locScore = 0;
      locDesc = 'Different campus locations';
    }
    totalScore += locScore;
    factors.push({
      factor: 'PostGIS Location Proximity',
      points: locScore,
      maxPoints: 25,
      description: locDesc,
      passed: locScore > 0,
    });

    // 4. Incident Time Proximity (Max 15 points)
    const timeA = new Date(itemA.incidentDate).getTime();
    const timeB = new Date(itemB.incidentDate).getTime();
    const diffHours = Math.abs(timeA - timeB) / (1000 * 60 * 60);

    let timeScore = 0;
    let timeDesc = '';
    if (diffHours <= 24) {
      timeScore = 15;
      timeDesc = `Reported within ${Math.round(diffHours)} hours of each other`;
    } else if (diffHours <= 72) {
      timeScore = 10;
      timeDesc = `Reported within ${Math.round(diffHours / 24)} days of each other`;
    } else if (diffHours <= 168) {
      timeScore = 6;
      timeDesc = 'Reported within the same week';
    } else {
      timeScore = 0;
      timeDesc = 'Reported more than a week apart';
    }
    totalScore += timeScore;
    factors.push({
      factor: 'Time Window',
      points: timeScore,
      maxPoints: 15,
      description: timeDesc,
      passed: timeScore > 0,
    });

    // Summary generator
    const keyHighlights: string[] = [];
    if (catScore === 35) keyHighlights.push(`same category (${itemA.category.replace(/_/g, ' ')})`);
    if (matchedKeywords.length > 0) keyHighlights.push(`matching keywords (${matchedKeywords.slice(0, 3).join(', ')})`);
    if (locScore >= 18) keyHighlights.push('reported in close campus proximity');
    if (timeScore >= 10) keyHighlights.push('reported within a close timeframe');

    const explanationSummary =
      keyHighlights.length > 0
        ? `Matches because of ${keyHighlights.join(', ')}.`
        : 'Low correlation between these reports.';

    let confidenceTier: 'high' | 'medium' | 'low' = 'low';
    if (totalScore >= 75) confidenceTier = 'high';
    else if (totalScore >= 45) confidenceTier = 'medium';

    return {
      score: totalScore,
      confidenceTier,
      explanationSummary,
      factors,
      distanceMeters,
    };
  }

  /**
   * Rank candidate items against a target item
   */
  rankMatches(targetItem: Item, candidates: Item[], minScore = 30): Array<{ item: Item } & MatchResult> {
    const oppositeType = targetItem.type === 'LOST' ? 'FOUND' : 'LOST';

    return candidates
      .filter((c) => c.id !== targetItem.id && c.type === oppositeType && c.status !== 'CLOSED' && c.status !== 'RETURNED')
      .map((c) => {
        const result = this.computeMatch(targetItem, c);
        return {
          item: c,
          ...result,
        };
      })
      .filter((m) => m.score >= minScore)
      .sort((a, b) => b.score - a.score);
  }
}
