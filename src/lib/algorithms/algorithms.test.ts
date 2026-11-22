import { describe, expect, it } from 'vitest';
import {
  bruteForceOptimal,
  runJaya,
  runRoundRobin,
  runSufferage,
} from './baselines';
import {
  createCloudProblem,
  decodePermutationToAssignment,
  evaluateSchedule,
  MINI_DISPATCH_INITIAL,
  MINI_DISPATCH_PROBLEM,
  MORPH_SWAP_INITIAL,
  MORPH_SWAP_PROBLEM,
} from './cloudModel';
import { runFairDuel, runMultiSeedBatch } from './fairDuel';
import {
  coolTemperature,
  HybridSa2OptEngine,
  metropolisProbability,
  runHybridSa2Opt,
} from './hybridSa2Opt';
import { formatId, mulberry32 } from './rng';
import {
  apply2OptReverse,
  CLASSIC_4_CITIES,
  CLASSIC_4_CROSSED_TOUR,
  countCrossings,
  evaluate2OptInequality,
  findBest2OptMove,
  NETWORK_8_CITIES,
  NETWORK_8_CROSSED_TOUR,
  tourDistance,
} from './tsp2Opt';

describe('RNG & Indonesian number formatter', () => {
  it('mulberry32 is deterministic for identical seeds', () => {
    const a = mulberry32(2026);
    const b = mulberry32(2026);
    expect(Array.from({ length: 8 }, () => a())).toEqual(
      Array.from({ length: 8 }, () => b()),
    );
  });

  it('formats numbers with Indonesian decimal comma and typographic minus', () => {
    expect(formatId(1438.5, 1)).toBe('1.438,5');
    expect(formatId(-4.25, 2)).toBe('−4,25');
  });
});

describe('2-Opt TSP geometry (Gunawan & Iryanto 2023 Fig. 1 & Eq. 1)', () => {
  it('detects crossing on classic 4-node square and shortens tour when uncrossed', () => {
    expect(countCrossings(CLASSIC_4_CITIES, CLASSIC_4_CROSSED_TOUR)).toBe(1);
    const eq1 = evaluate2OptInequality(CLASSIC_4_CITIES, 0, 3, 2, 1);
    expect(eq1.improves).toBe(true);
    expect(eq1.swappedPairDist).toBeLessThan(eq1.currentPairDist);

    const before = tourDistance(CLASSIC_4_CITIES, CLASSIC_4_CROSSED_TOUR);
    const uncrossed = apply2OptReverse(CLASSIC_4_CROSSED_TOUR, 1, 2);
    const after = tourDistance(CLASSIC_4_CITIES, uncrossed);
    expect(countCrossings(CLASSIC_4_CITIES, uncrossed)).toBe(0);
    expect(after).toBeLessThan(before);
  });

  it('iteratively removes all crossings on 8-node Mini Metro network', () => {
    let tour = NETWORK_8_CROSSED_TOUR.slice();
    expect(countCrossings(NETWORK_8_CITIES, tour)).toBeGreaterThan(0);
    for (let guard = 0; guard < 10; guard++) {
      const move = findBest2OptMove(NETWORK_8_CITIES, tour);
      if (!move) break;
      tour = apply2OptReverse(tour, move.edgeAIndex + 1, move.edgeBIndex);
    }
    expect(countCrossings(NETWORK_8_CITIES, tour)).toBe(0);
  });
});

describe('Cloud scheduling model, mini-challenge & baselines', () => {
  it('verifies Scene 01 mini-challenge initial bottleneck (14s) and brute-force optimal (9s)', () => {
    const initial = evaluateSchedule(MINI_DISPATCH_PROBLEM, MINI_DISPATCH_INITIAL);
    expect(initial.vmLoads).toEqual([5, 14, 4]);
    expect(initial.makespan).toBe(14);
    expect(initial.bottleneckVm).toBe(1);

    const optimal = bruteForceOptimal(MINI_DISPATCH_PROBLEM);
    expect(optimal.evaluations).toBe(729);
    expect(optimal.metrics.makespan).toBe(9);
  });

  it('verifies Scene 03 pairwise 2-Opt swap drops makespan from 15s to 10s', () => {
    const before = evaluateSchedule(MORPH_SWAP_PROBLEM, MORPH_SWAP_INITIAL);
    expect(before.makespan).toBe(15);

    const swapped = MORPH_SWAP_INITIAL.slice();
    const tmp = swapped[0];
    swapped[0] = swapped[1];
    swapped[1] = tmp;

    const after = evaluateSchedule(MORPH_SWAP_PROBLEM, swapped);
    expect(after.makespan).toBe(10);
  });

  it('computes valid assignments for Sufferage, JAYA, Round Robin, and EFT decoder', () => {
    const problem = createCloudProblem(16, 4, 42);
    const rr = runRoundRobin(problem);
    const suf = runSufferage(problem);
    const jaya = runJaya(problem, 42, { popSize: 12, maxEvaluations: 240 });
    const decoded = decodePermutationToAssignment(
      problem,
      Array.from({ length: 16 }, (_, i) => i),
    );

    for (const assign of [rr.assignment, suf.assignment, jaya.assignment, decoded]) {
      expect(assign).toHaveLength(16);
      expect(assign.every((v) => v >= 0 && v < 4)).toBe(true);
    }
    expect(suf.metrics.makespan).toBeLessThanOrEqual(rr.metrics.makespan);
    expect(jaya.evaluations).toBeLessThanOrEqual(240);
  });
});

describe('Simulated Annealing & Hybrid SA + 2-Opt engine', () => {
  it('matches exact Metropolis probabilities and geometric cooling schedule', () => {
    expect(metropolisProbability(4, 10)).toBeCloseTo(0.67032, 4);
    expect(metropolisProbability(4, 1)).toBeCloseTo(0.018316, 4);
    expect(metropolisProbability(-3, 0.1)).toBe(1);
    expect(coolTemperature(1000, 0.9)).toBeCloseTo(900, 6);
  });

  it('keeps bestMakespan non-increasing and obeys evaluation budget in both Cloud adaptations', () => {
    const problem = createCloudProblem(20, 4, 101);
    for (const adaptation of ['pairwise-swap', 'permutation-2opt'] as const) {
      const budget = 350;
      const resA = runHybridSa2Opt({
        problem,
        seed: 77,
        enable2Opt: true,
        adaptation,
        initialTemp: 80,
        coolingRate: 0.92,
        minTemp: 0.01,
        outerLoops: 80,
        innerLoops: 10,
        maxEvaluations: budget,
      });
      const resB = runHybridSa2Opt({
        problem,
        seed: 77,
        enable2Opt: true,
        adaptation,
        initialTemp: 80,
        coolingRate: 0.92,
        minTemp: 0.01,
        outerLoops: 80,
        innerLoops: 10,
        maxEvaluations: budget,
      });

      expect(resA.metrics.makespan).toBe(resB.metrics.makespan);
      expect(resA.evaluations).toBeLessThanOrEqual(budget);
      expect(resA.assignment.every((v) => v >= 0 && v < 4)).toBe(true);
      for (let i = 1; i < resA.trace.length; i++) {
        expect(resA.trace[i].bestCost).toBeLessThanOrEqual(resA.trace[i - 1].bestCost + 1e-9);
      }
    }
  });

  it('counts 2-Opt evaluations honestly and runs fair duel + 10-seed batch cleanly', () => {
    const problem = createCloudProblem(20, 4, 2026);
    const engineWith2Opt = new HybridSa2OptEngine({
      problem,
      seed: 12,
      enable2Opt: true,
      adaptation: 'pairwise-swap',
      initialTemp: 80,
      coolingRate: 0.9,
      minTemp: 0.01,
      outerLoops: 20,
      innerLoops: 8,
      maxEvaluations: 500,
    });
    const snap1 = engineWith2Opt.step();
    // 1 initial eval + 1 SA perturb + up to sampleLimit 2-Opt evals => strictly > 2
    expect(snap1.evaluations).toBeGreaterThan(2);

    const duel = runFairDuel({
      problem,
      seed: 2026,
      adaptation: 'pairwise-swap',
      initialTemp: 80,
      coolingRate: 0.92,
      innerLoops: 8,
      maxEvaluations: 400,
    });
    expect(duel.hybrid.evaluations).toBeLessThanOrEqual(400);
    expect(duel.pureSa.evaluations).toBeLessThanOrEqual(400);
    expect(duel.jaya.evaluations).toBeLessThanOrEqual(400);

    const batch = runMultiSeedBatch({
      problem,
      baseSeed: 100,
      seedCount: 10,
      adaptation: 'pairwise-swap',
      initialTemp: 80,
      coolingRate: 0.92,
      innerLoops: 8,
      maxEvaluations: 250,
    });
    expect(batch).toHaveLength(4);
    expect(batch[0].runs).toBe(10);
    expect(Number.isFinite(batch[0].std)).toBe(true);
  });
});
