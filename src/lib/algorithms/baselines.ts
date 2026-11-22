/**
 * Algoritma pembanding baseline Kelompok 4:
 * - Brute-Force Optimal (untuk mini-challenge 6 task x 3 VM = 729 kombinasi)
 * - Round Robin
 * - Sufferage (Maheswaran et al., 1999)
 * - JAYA (Rao, 2016) dengan counter evaluasi eksplisit
 */

import { type CloudProblem, evaluateSchedule, type ScheduleMetrics } from './cloudModel';
import { clamp, mulberry32 } from './rng';

export interface BaselineRunResult {
  algorithm: 'BruteForce' | 'RoundRobin' | 'Sufferage' | 'JAYA';
  assignment: number[];
  metrics: ScheduleMetrics;
  evaluations: number;
  curve?: Array<{ step: number; evaluations: number; bestCost: number }>;
}

export function bruteForceOptimal(problem: CloudProblem): BaselineRunResult {
  const n = problem.tasks.length;
  const m = problem.vms.length;
  const totalCombos = Math.pow(m, n);
  const current = new Array<number>(n).fill(0);
  let bestAssignment = current.slice();
  let bestMakespan = Infinity;
  let evaluations = 0;

  for (let code = 0; code < totalCombos; code++) {
    let rem = code;
    for (let i = 0; i < n; i++) {
      current[i] = rem % m;
      rem = Math.floor(rem / m);
    }
    evaluations++;
    const metrics = evaluateSchedule(problem, current);
    if (metrics.makespan < bestMakespan) {
      bestMakespan = metrics.makespan;
      bestAssignment = current.slice();
    }
  }

  return {
    algorithm: 'BruteForce',
    assignment: bestAssignment,
    metrics: evaluateSchedule(problem, bestAssignment),
    evaluations,
  };
}

export function runRoundRobin(problem: CloudProblem): BaselineRunResult {
  const m = problem.vms.length;
  const assignment = problem.tasks.map((_, i) => i % m);
  return {
    algorithm: 'RoundRobin',
    assignment,
    metrics: evaluateSchedule(problem, assignment),
    evaluations: 1,
  };
}

/**
 * Heuristik Sufferage (Maheswaran et al., 1999):
 * Setiap putaran memprioritaskan task dengan selisih completion time terbesar
 * antara VM terbaik pertama dan kedua.
 */
export function runSufferage(problem: CloudProblem): BaselineRunResult {
  const n = problem.tasks.length;
  const m = problem.vms.length;
  const unmapped = new Set<number>(Array.from({ length: n }, (_, i) => i));
  const ready = new Array<number>(m).fill(0);
  const assignment = new Array<number>(n).fill(0);

  while (unmapped.size > 0) {
    const claimed = new Map<number, { task: number; sufferage: number; finish: number }>();

    for (const task of unmapped) {
      let bestVm = 0;
      let bestFinish = Infinity;
      let secondFinish = Infinity;

      for (let v = 0; v < m; v++) {
        const finish = ready[v] + problem.etc[task][v];
        if (finish < bestFinish) {
          secondFinish = bestFinish;
          bestFinish = finish;
          bestVm = v;
        } else if (finish < secondFinish) {
          secondFinish = finish;
        }
      }

      const sufferage = Number.isFinite(secondFinish) ? secondFinish - bestFinish : 0;
      const existing = claimed.get(bestVm);
      if (!existing || sufferage > existing.sufferage) {
        claimed.set(bestVm, { task, sufferage, finish: bestFinish });
      }
    }

    for (const [vm, winner] of claimed.entries()) {
      assignment[winner.task] = vm;
      ready[vm] = winner.finish;
      unmapped.delete(winner.task);
    }
  }

  return {
    algorithm: 'Sufferage',
    assignment,
    metrics: evaluateSchedule(problem, assignment),
    evaluations: 1,
  };
}

/**
 * Metaheuristik JAYA (Rao, 2016) dengan pembulatan ke indeks VM dan anggaran evaluasi terkendali.
 */
export function runJaya(
  problem: CloudProblem,
  seed: number,
  options?: { popSize?: number; maxEvaluations?: number },
): BaselineRunResult {
  const rng = mulberry32(seed ^ 0x517cc1b7);
  const n = problem.tasks.length;
  const m = problem.vms.length;
  const popSize = options?.popSize ?? 16;
  const maxEvaluations = options?.maxEvaluations ?? 600;

  const toDiscrete = (vec: readonly number[]) =>
    vec.map((val) => clamp(Math.round(val), 0, m - 1));

  let pop: number[][] = Array.from({ length: popSize }, () =>
    Array.from({ length: n }, () => rng() * (m - 1)),
  );
  let evaluations = 0;
  const fit: number[] = pop.map((vec) => {
    evaluations++;
    return evaluateSchedule(problem, toDiscrete(vec)).makespan;
  });

  const curve: Array<{ step: number; evaluations: number; bestCost: number }> = [];
  let bestIdx = 0;
  for (let i = 1; i < popSize; i++) {
    if (fit[i] < fit[bestIdx]) bestIdx = i;
  }
  let bestVec = pop[bestIdx].slice();
  let bestFit = fit[bestIdx];
  curve.push({ step: 0, evaluations, bestCost: bestFit });

  let iter = 0;
  while (evaluations < maxEvaluations) {
    iter++;
    let curBest = 0;
    let curWorst = 0;
    for (let i = 1; i < popSize; i++) {
      if (fit[i] < fit[curBest]) curBest = i;
      if (fit[i] > fit[curWorst]) curWorst = i;
    }

    const bestSnap = pop[curBest];
    const worstSnap = pop[curWorst];

    for (let p = 0; p < popSize && evaluations < maxEvaluations; p++) {
      const candidate = new Array<number>(n);
      for (let d = 0; d < n; d++) {
        const x = pop[p][d];
        const r1 = rng();
        const r2 = rng();
        const nextVal =
          x + r1 * (bestSnap[d] - Math.abs(x)) - r2 * (worstSnap[d] - Math.abs(x));
        candidate[d] = clamp(nextVal, 0, m - 1);
      }
      evaluations++;
      const candFit = evaluateSchedule(problem, toDiscrete(candidate)).makespan;
      if (candFit < fit[p]) {
        pop[p] = candidate;
        fit[p] = candFit;
        if (candFit < bestFit) {
          bestFit = candFit;
          bestVec = candidate.slice();
        }
      }
    }

    curve.push({ step: iter, evaluations, bestCost: bestFit });
  }

  const bestAssignment = toDiscrete(bestVec);
  return {
    algorithm: 'JAYA',
    assignment: bestAssignment,
    metrics: evaluateSchedule(problem, bestAssignment),
    evaluations,
    curve,
  };
}
