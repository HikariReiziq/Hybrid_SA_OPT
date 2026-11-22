/**
 * Mesin Simulated Annealing (SA) Murni & Hybrid SA + 2-Opt (Low-level Relay Hybrid / LRH)
 * mengikuti Algorithm 1 Gunawan & Iryanto (2023):
 *   Outer loop -> Inner loop -> SA update -> (opsional) 2-Opt polish -> Metropolis -> Cooling.
 *
 * Setiap evaluasi (di SA maupun di dalam 2-Opt) dihitung secara jujur pada `evaluations`
 * sehingga perbandingan dengan anggaran evaluasi setara benar-benar adil.
 */

import {
  type CloudProblem,
  decodePermutationToAssignment,
  evaluateSchedule,
  type ScheduleMetrics,
} from './cloudModel';
import { mulberry32, randInt, type Rng, shuffle } from './rng';
import { apply2OptReverse } from './tsp2Opt';

export type HybridAdaptation = 'pairwise-swap' | 'permutation-2opt';

export type StepDecision =
  | 'init'
  | 'improve'
  | 'equal'
  | 'worse-accepted'
  | 'worse-rejected';

export interface HybridSaConfig {
  problem: CloudProblem;
  seed: number;
  enable2Opt: boolean;
  adaptation: HybridAdaptation;
  initialTemp: number;
  coolingRate: number;
  minTemp: number;
  outerLoops: number;
  innerLoops: number;
  maxEvaluations: number;
  /** Jumlah maksimal uji tetangga 2-Opt per langkah inner loop agar budget terkontrol */
  twoOptSampleLimit?: number;
}

export interface HybridTracePoint {
  step: number;
  evaluations: number;
  temperature: number;
  currentCost: number;
  bestCost: number;
}

export interface HybridStepSnapshot {
  outerStep: number;
  innerStep: number;
  totalSteps: number;
  temperature: number;
  evaluations: number;
  currentAssignment: number[];
  bestAssignment: number[];
  currentMakespan: number;
  bestMakespan: number;
  lastDelta: number;
  lastProbability: number;
  lastRoll: number;
  decision: StepDecision;
  twoOptImprovedInStep: boolean;
  twoOptSwapsTotal: number;
  bottleneckVm: number;
  done: boolean;
}

export interface HybridRunResult {
  assignment: number[];
  metrics: ScheduleMetrics;
  evaluations: number;
  twoOptSwapsTotal: number;
  acceptedWorseTotal: number;
  trace: HybridTracePoint[];
  finalSnapshot: HybridStepSnapshot;
  runtimeMs: number;
}

export function metropolisProbability(delta: number, temperature: number): number {
  if (delta <= 0) return 1;
  if (temperature <= 1e-12) return 0;
  return Math.exp(-delta / temperature);
}

export function coolTemperature(temperature: number, coolingRate: number): number {
  return temperature * coolingRate;
}

export class HybridSa2OptEngine {
  private readonly cfg: HybridSaConfig;
  private readonly rng: Rng;
  private readonly sampleLimit: number;

  private currentState: number[];
  private currentAssignment: number[];
  private currentCost: number;
  private bestAssignment: number[];
  private bestCost: number;

  private temperature: number;
  private outerStep = 0;
  private innerStep = 0;
  private totalSteps = 0;
  private evaluations = 0;
  private twoOptSwapsTotal = 0;
  private acceptedWorseTotal = 0;
  private done = false;

  private lastDelta = 0;
  private lastProbability = 1;
  private lastRoll = 0;
  private lastDecision: StepDecision = 'init';
  private lastTwoOptImproved = false;

  public readonly trace: HybridTracePoint[] = [];

  constructor(config: HybridSaConfig) {
    this.cfg = config;
    this.rng = mulberry32(config.seed);
    this.sampleLimit = config.twoOptSampleLimit ?? 6;
    this.temperature = config.initialTemp;

    const n = config.problem.tasks.length;
    const m = config.problem.vms.length;

    if (config.adaptation === 'permutation-2opt') {
      this.currentState = shuffle(
        Array.from({ length: n }, (_, i) => i),
        this.rng,
      );
      this.currentAssignment = decodePermutationToAssignment(config.problem, this.currentState);
    } else {
      this.currentState = Array.from({ length: n }, () => randInt(this.rng, 0, m));
      this.currentAssignment = this.currentState.slice();
    }

    this.currentCost = this.scoreAssignment(this.currentAssignment);
    this.bestAssignment = this.currentAssignment.slice();
    this.bestCost = this.currentCost;

    this.trace.push({
      step: 0,
      evaluations: this.evaluations,
      temperature: this.temperature,
      currentCost: this.currentCost,
      bestCost: this.bestCost,
    });
  }

  private scoreAssignment(assignment: readonly number[]): number {
    this.evaluations++;
    return evaluateSchedule(this.cfg.problem, assignment).makespan;
  }

  private perturbState(): { state: number[]; assignment: number[]; cost: number } {
    const n = this.cfg.problem.tasks.length;
    const m = this.cfg.problem.vms.length;

    if (this.cfg.adaptation === 'permutation-2opt') {
      const next = this.currentState.slice();
      if (n >= 2) {
        const a = randInt(this.rng, 0, n);
        let b = randInt(this.rng, 0, n - 1);
        if (b >= a) b += 1;
        const tmp = next[a];
        next[a] = next[b];
        next[b] = tmp;
      }
      const assignment = decodePermutationToAssignment(this.cfg.problem, next);
      const cost = this.scoreAssignment(assignment);
      return { state: next, assignment, cost };
    }

    // Mode pairwise-swap: perturbasi SA memindahkan 1 task acak ke VM baru
    const next = this.currentState.slice();
    const taskIdx = randInt(this.rng, 0, n);
    const oldVm = next[taskIdx];
    let newVm = randInt(this.rng, 0, Math.max(1, m - 1));
    if (m > 1 && newVm >= oldVm) newVm += 1;
    next[taskIdx] = newVm;
    const cost = this.scoreAssignment(next);
    return { state: next, assignment: next, cost };
  }

  /**
   * Prosedur 2-Opt Local Search di dalam inner loop SA (LRH):
   * - Pada mode `pairwise-swap`: mencari pasangan task dari VM bottleneck untuk
   *   ditukar (pairwise swap) atau dipindah ke VM ringan jika menurunkan makespan.
   * - Pada mode `permutation-2opt`: menerapkan pembalikan segmen reverse(i..j) pada
   *   urutan task (identik 2-Opt TSP) lalu mendecode via EFT.
   */
  private apply2OptLocalSearch(
    state: number[],
    assignment: number[],
    baseCost: number,
  ): { state: number[]; assignment: number[]; cost: number; improved: boolean } {
    const n = this.cfg.problem.tasks.length;
    const m = this.cfg.problem.vms.length;
    let bestState = state;
    let bestAssign = assignment;
    let bestCost = baseCost;
    let improved = false;

    if (this.cfg.adaptation === 'permutation-2opt') {
      if (n < 3) return { state, assignment, cost: baseCost, improved: false };
      for (let attempt = 0; attempt < this.sampleLimit; attempt++) {
        if (this.evaluations >= this.cfg.maxEvaluations) break;
        const i = randInt(this.rng, 0, n - 1);
        const j = randInt(this.rng, i + 1, n);
        const reversed = apply2OptReverse(bestState, i, j);
        const decoded = decodePermutationToAssignment(this.cfg.problem, reversed);
        const cost = this.scoreAssignment(decoded);
        if (cost < bestCost) {
          bestState = reversed;
          bestAssign = decoded;
          bestCost = cost;
          improved = true;
        }
      }
      return { state: bestState, assignment: bestAssign, cost: bestCost, improved };
    }

    // Mode pairwise-swap: fokuskan perbaikan lokal pada VM bottleneck
    const metrics = evaluateSchedule(this.cfg.problem, bestAssign);
    const hotVm = metrics.bottleneckVm;
    let lightVm = 0;
    for (let v = 1; v < m; v++) {
      if (metrics.vmLoads[v] < metrics.vmLoads[lightVm]) lightVm = v;
    }

    const hotTasks: number[] = [];
    const otherTasks: number[] = [];
    for (let t = 0; t < n; t++) {
      if (bestAssign[t] === hotVm) hotTasks.push(t);
      else otherTasks.push(t);
    }

    if (hotTasks.length === 0) {
      return { state: bestState, assignment: bestAssign, cost: bestCost, improved: false };
    }

    for (let attempt = 0; attempt < this.sampleLimit; attempt++) {
      if (this.evaluations >= this.cfg.maxEvaluations) break;
      const tHot = hotTasks[randInt(this.rng, 0, hotTasks.length)];
      const candidate = bestAssign.slice();

      if (otherTasks.length > 0 && attempt % 2 === 0) {
        // 2-Opt Pairwise Swap antara 1 task di VM bottleneck dan 1 task di VM lain
        const tOther = otherTasks[randInt(this.rng, 0, otherTasks.length)];
        const otherVm = candidate[tOther];
        candidate[tHot] = otherVm;
        candidate[tOther] = hotVm;
      } else if (lightVm !== hotVm) {
        // Rebalance langsung ke VM paling longgar
        candidate[tHot] = lightVm;
      } else {
        continue;
      }

      const cost = this.scoreAssignment(candidate);
      if (cost < bestCost) {
        bestState = candidate;
        bestAssign = candidate;
        bestCost = cost;
        improved = true;
      }
    }

    return { state: bestState, assignment: bestAssign, cost: bestCost, improved };
  }

  public step(): HybridStepSnapshot {
    if (this.done) return this.snapshot();

    if (
      this.evaluations >= this.cfg.maxEvaluations ||
      this.outerStep >= this.cfg.outerLoops ||
      this.temperature < this.cfg.minTemp
    ) {
      this.done = true;
      return this.snapshot();
    }

    // 1. SA Perturbation
    let candidate = this.perturbState();
    this.lastTwoOptImproved = false;

    // 2. LRH 2-Opt Local Search di dalam inner loop SA
    if (this.cfg.enable2Opt && this.evaluations < this.cfg.maxEvaluations) {
      const polished = this.apply2OptLocalSearch(
        candidate.state,
        candidate.assignment,
        candidate.cost,
      );
      if (polished.improved) {
        this.twoOptSwapsTotal++;
        this.lastTwoOptImproved = true;
      }
      candidate = {
        state: polished.state,
        assignment: polished.assignment,
        cost: polished.cost,
      };
    }

    // 3. Evaluasi Delta & Kriteria Metropolis
    const delta = candidate.cost - this.currentCost;
    const prob = metropolisProbability(delta, this.temperature);
    const roll = this.rng();

    this.lastDelta = delta;
    this.lastProbability = prob;
    this.lastRoll = roll;

    let accepted = false;
    if (delta < 0) {
      accepted = true;
      this.lastDecision = 'improve';
    } else if (delta === 0) {
      accepted = true;
      this.lastDecision = 'equal';
    } else if (roll < prob) {
      accepted = true;
      this.acceptedWorseTotal++;
      this.lastDecision = 'worse-accepted';
    } else {
      this.lastDecision = 'worse-rejected';
    }

    if (accepted) {
      this.currentState = candidate.state;
      this.currentAssignment = candidate.assignment;
      this.currentCost = candidate.cost;
      if (this.currentCost < this.bestCost) {
        this.bestCost = this.currentCost;
        this.bestAssignment = this.currentAssignment.slice();
      }
    }

    this.innerStep++;
    this.totalSteps++;

    // 4. Cooling schedule saat inner loop selesai
    if (this.innerStep >= this.cfg.innerLoops) {
      this.innerStep = 0;
      this.outerStep++;
      this.temperature = coolTemperature(this.temperature, this.cfg.coolingRate);
    }

    this.trace.push({
      step: this.totalSteps,
      evaluations: this.evaluations,
      temperature: this.temperature,
      currentCost: this.currentCost,
      bestCost: this.bestCost,
    });

    if (
      this.evaluations >= this.cfg.maxEvaluations ||
      this.outerStep >= this.cfg.outerLoops ||
      this.temperature < this.cfg.minTemp
    ) {
      this.done = true;
    }

    return this.snapshot();
  }

  public snapshot(): HybridStepSnapshot {
    const metrics = evaluateSchedule(this.cfg.problem, this.bestAssignment);
    return {
      outerStep: this.outerStep,
      innerStep: this.innerStep,
      totalSteps: this.totalSteps,
      temperature: this.temperature,
      evaluations: this.evaluations,
      currentAssignment: this.currentAssignment.slice(),
      bestAssignment: this.bestAssignment.slice(),
      currentMakespan: this.currentCost,
      bestMakespan: this.bestCost,
      lastDelta: this.lastDelta,
      lastProbability: this.lastProbability,
      lastRoll: this.lastRoll,
      decision: this.lastDecision,
      twoOptImprovedInStep: this.lastTwoOptImproved,
      twoOptSwapsTotal: this.twoOptSwapsTotal,
      bottleneckVm: metrics.bottleneckVm,
      done: this.done,
    };
  }

  public runToCompletion(): HybridRunResult {
    const t0 = performance.now();
    while (!this.done) {
      this.step();
    }
    const runtimeMs = performance.now() - t0;
    return {
      assignment: this.bestAssignment.slice(),
      metrics: evaluateSchedule(this.cfg.problem, this.bestAssignment),
      evaluations: this.evaluations,
      twoOptSwapsTotal: this.twoOptSwapsTotal,
      acceptedWorseTotal: this.acceptedWorseTotal,
      trace: this.trace.slice(),
      finalSnapshot: this.snapshot(),
      runtimeMs,
    };
  }
}

export function runHybridSa2Opt(config: HybridSaConfig): HybridRunResult {
  const engine = new HybridSa2OptEngine(config);
  return engine.runToCompletion();
}
