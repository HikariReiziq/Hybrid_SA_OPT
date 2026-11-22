/**
 * Model TSP 2D Euclidean dan operasi lokal 2-Opt (Croes, 1958; Gunawan & Iryanto, 2023).
 * Dipakai pada Adegan 03 untuk memperlihatkan secara interaktif bagaimana 2-Opt
 * melepas dua jalur bersilangan (Eq. 1) sebelum bertransformasi ke Cloud Scheduling.
 */

export interface CityNode {
  id: number;
  label: string;
  x: number;
  y: number;
}

export interface CrossingPair {
  edgeAIndex: number;
  edgeBIndex: number;
  a: number;
  b: number;
  c: number;
  d: number;
  beforeDist: number;
  afterDist: number;
  improvement: number;
}

/**
 * 4 simpul klasik sesuai Fig. 1 Gunawan & Iryanto (2023):
 * Rute awal [0, 3, 2, 1] membentuk silangan X antara A-D dan C-B.
 */
export const CLASSIC_4_CITIES: readonly CityNode[] = [
  { id: 0, label: 'A', x: 96, y: 58 },
  { id: 1, label: 'B', x: 304, y: 58 },
  { id: 2, label: 'C', x: 96, y: 202 },
  { id: 3, label: 'D', x: 304, y: 202 },
];

export const CLASSIC_4_CROSSED_TOUR: readonly number[] = [0, 3, 2, 1];

/**
 * 8 simpul peta transit ala Mini Metro dengan 2 persilangan awal yang jelas.
 */
export const NETWORK_8_CITIES: readonly CityNode[] = [
  { id: 0, label: 'A', x: 70, y: 62 },
  { id: 1, label: 'B', x: 165, y: 38 },
  { id: 2, label: 'C', x: 265, y: 52 },
  { id: 3, label: 'D', x: 335, y: 118 },
  { id: 4, label: 'E', x: 310, y: 204 },
  { id: 5, label: 'F', x: 212, y: 224 },
  { id: 6, label: 'G', x: 108, y: 210 },
  { id: 7, label: 'H', x: 56, y: 142 },
];

export const NETWORK_8_CROSSED_TOUR: readonly number[] = [0, 2, 1, 3, 5, 4, 6, 7];

export function euclideanDistance(a: CityNode, b: CityNode): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function tourDistance(cities: readonly CityNode[], tour: readonly number[]): number {
  let total = 0;
  const n = tour.length;
  for (let i = 0; i < n; i++) {
    const from = cities[tour[i]];
    const to = cities[tour[(i + 1) % n]];
    total += euclideanDistance(from, to);
  }
  return total;
}

/**
 * Mengevaluasi Persamaan (1) Gunawan & Iryanto (2023):
 * d(A, B) + d(C, D) < d(A, D) + d(B, C)
 */
export function evaluate2OptInequality(
  cities: readonly CityNode[],
  aIdx: number,
  dIdx: number,
  cIdx: number,
  bIdx: number,
): {
  currentPairDist: number;
  swappedPairDist: number;
  improves: boolean;
} {
  const currentPairDist =
    euclideanDistance(cities[aIdx], cities[dIdx]) +
    euclideanDistance(cities[cIdx], cities[bIdx]);
  const swappedPairDist =
    euclideanDistance(cities[aIdx], cities[bIdx]) +
    euclideanDistance(cities[cIdx], cities[dIdx]);
  return {
    currentPairDist,
    swappedPairDist,
    improves: swappedPairDist + 1e-9 < currentPairDist,
  };
}

/**
 * Membalik segmen tour[i..j] secara inklusif (operasi inti 2-Opt).
 */
export function apply2OptReverse(tour: readonly number[], i: number, j: number): number[] {
  const start = Math.min(i, j);
  const end = Math.max(i, j);
  const next = tour.slice();
  let l = start;
  let r = end;
  while (l < r) {
    const tmp = next[l];
    next[l] = next[r];
    next[r] = tmp;
    l++;
    r--;
  }
  return next;
}

function orientation(p: CityNode, q: CityNode, r: CityNode): number {
  return (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
}

export function segmentsIntersect(p1: CityNode, p2: CityNode, q1: CityNode, q2: CityNode): boolean {
  const o1 = orientation(p1, p2, q1);
  const o2 = orientation(p1, p2, q2);
  const o3 = orientation(q1, q2, p1);
  const o4 = orientation(q1, q2, p2);
  return o1 * o2 < 0 && o3 * o4 < 0;
}

/**
 * Menemukan pasangan sisi dalam tour yang saling bersilangan atau dapat diperpendek oleh 2-Opt.
 */
export function findBest2OptMove(
  cities: readonly CityNode[],
  tour: readonly number[],
): CrossingPair | null {
  const n = tour.length;
  let best: CrossingPair | null = null;

  for (let i = 0; i < n - 1; i++) {
    const a = tour[i];
    const b = tour[i + 1];
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue;
      const c = tour[j];
      const d = tour[(j + 1) % n];

      const beforeDist =
        euclideanDistance(cities[a], cities[b]) + euclideanDistance(cities[c], cities[d]);
      const afterDist =
        euclideanDistance(cities[a], cities[c]) + euclideanDistance(cities[b], cities[d]);
      const improvement = beforeDist - afterDist;

      if (improvement > 1e-6 && (!best || improvement > best.improvement)) {
        best = {
          edgeAIndex: i,
          edgeBIndex: j,
          a,
          b,
          c,
          d,
          beforeDist,
          afterDist,
          improvement,
        };
      }
    }
  }

  return best;
}

export function countCrossings(cities: readonly CityNode[], tour: readonly number[]): number {
  const n = tour.length;
  let crossings = 0;
  for (let i = 0; i < n; i++) {
    const a = cities[tour[i]];
    const b = cities[tour[(i + 1) % n]];
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue;
      const c = cities[tour[j]];
      const d = cities[tour[(j + 1) % n]];
      if (segmentsIntersect(a, b, c, d)) {
        crossings++;
      }
    }
  }
  return crossings;
}
