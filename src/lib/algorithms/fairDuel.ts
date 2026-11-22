/**
 * Runner perbandingan adil (budget evaluasi setara) dan uji multi-seed (mean ± std)
 * untuk Adegan 04 Split-Screen Race, Adegan 05 Comparison, dan Sandbox Q&A.
 */

import { runJaya, runRoundRobin, runSufferage } from './baselines';
import { type CloudProblem, type ScheduleMetrics } from './cloudModel';
import {
  type HybridAdaptation,
  type HybridRunResult,
  runHybridSa2Opt,
} from './hybridSa2Opt';

export interface FairDuelConfig {
  problem: CloudProblem;
  seed: number;
  adaptation: HybridAdaptation;
  initialTemp: number;
  coolingRate: number;
  innerLoops: number;
  maxEvaluations: number;
}

export interface FairDuelResult {
  hybrid: HybridRunResult;
  pureSa: HybridRunResult;
  sufferage: { assignment: number[]; metrics: ScheduleMetrics; evaluations: number };
  jaya: {
    assignment: number[];
    metrics: ScheduleMetrics;
    evaluations: number;
    curve: Array<{ step: number; evaluations: number; bestCost: number }>;
  };
  roundRobin: { assignment: number[]; metrics: ScheduleMetrics; evaluations: number };
}

export interface BatchStats {
  algorithm: string;
  runs: number;
  mean: number;
  std: number;
  min: number;
  max: number;
  avgEvaluations: number;
  avgAru: number;
  avgDoi: number;
  avgRuntimeMs: number;
}

export function runFairDuel(config: FairDuelConfig): FairDuelResult {
  const baseParams = {
    problem: config.problem,
    seed: config.seed,
    adaptation: config.adaptation,
    initialTemp: config.initialTemp,
    coolingRate: config.coolingRate,
    minTemp: 0.01,
    outerLoops: 250,
    innerLoops: config.innerLoops,
    maxEvaluations: config.maxEvaluations,
  };

  const hybrid = runHybridSa2Opt({ ...baseParams, enable2Opt: true, twoOptSampleLimit: 5 });
  const pureSa = runHybridSa2Opt({ ...baseParams, enable2Opt: false });
  const sufferage = runSufferage(config.problem);
  const jaya = runJaya(config.problem, config.seed, {
    popSize: 16,
    maxEvaluations: config.maxEvaluations,
  });
  const roundRobin = runRoundRobin(config.problem);

  return {
    hybrid,
    pureSa,
    sufferage: {
      assignment: sufferage.assignment,
      metrics: sufferage.metrics,
      evaluations: sufferage.evaluations,
    },
    jaya: {
      assignment: jaya.assignment,
      metrics: jaya.metrics,
      evaluations: jaya.evaluations,
      curve: jaya.curve ?? [],
    },
    roundRobin: {
      assignment: roundRobin.assignment,
      metrics: roundRobin.metrics,
      evaluations: roundRobin.evaluations,
    },
  };
}

function summarize(
  algorithm: string,
  samples: Array<{ makespan: number; evals: number; aru: number; doi: number; runtimeMs: number }>,
): BatchStats {
  const n = samples.length;
  const mean = samples.reduce((s, x) => s + x.makespan, 0) / n;
  const variance = samples.reduce((s, x) => s + (x.makespan - mean) ** 2, 0) / n;
  const std = Math.sqrt(variance);
  const min = Math.min(...samples.map((x) => x.makespan));
  const max = Math.max(...samples.map((x) => x.makespan));

  return {
    algorithm,
    runs: n,
    mean,
    std,
    min,
    max,
    avgEvaluations: samples.reduce((s, x) => s + x.evals, 0) / n,
    avgAru: samples.reduce((s, x) => s + x.aru, 0) / n,
    avgDoi: samples.reduce((s, x) => s + x.doi, 0) / n,
    avgRuntimeMs: samples.reduce((s, x) => s + x.runtimeMs, 0) / n,
  };
}

export function runMultiSeedBatch(
  config: Omit<FairDuelConfig, 'seed'> & { baseSeed: number; seedCount?: number },
): BatchStats[] {
  const seedCount = config.seedCount ?? 10;
  const hybridSamples: Array<{
    makespan: number;
    evals: number;
    aru: number;
    doi: number;
    runtimeMs: number;
  }> = [];
  const saSamples: typeof hybridSamples = [];
  const jayaSamples: typeof hybridSamples = [];

  for (let i = 0; i < seedCount; i++) {
    const seed = config.baseSeed + i * 37;
    const duel = runFairDuel({ ...config, seed });
    hybridSamples.push({
      makespan: duel.hybrid.metrics.makespan,
      evals: duel.hybrid.evaluations,
      aru: duel.hybrid.metrics.aru,
      doi: duel.hybrid.metrics.doi,
      runtimeMs: duel.hybrid.runtimeMs,
    });
    saSamples.push({
      makespan: duel.pureSa.metrics.makespan,
      evals: duel.pureSa.evaluations,
      aru: duel.pureSa.metrics.aru,
      doi: duel.pureSa.metrics.doi,
      runtimeMs: duel.pureSa.runtimeMs,
    });
    jayaSamples.push({
      makespan: duel.jaya.metrics.makespan,
      evals: duel.jaya.evaluations,
      aru: duel.jaya.metrics.aru,
      doi: duel.jaya.metrics.doi,
      runtimeMs: 0,
    });
  }

  const sufferage = runSufferage(config.problem);

  return [
    summarize('Hybrid SA + 2-Opt', hybridSamples),
    summarize('SA Murni', saSamples),
    summarize('JAYA', jayaSamples),
    summarize('Sufferage', [
      {
        makespan: sufferage.metrics.makespan,
        evals: sufferage.evaluations,
        aru: sufferage.metrics.aru,
        doi: sufferage.metrics.doi,
        runtimeMs: 0,
      },
    ]),
  ];
}
