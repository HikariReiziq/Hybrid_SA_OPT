import { create } from 'zustand';
import { type CloudProblem, createCloudProblem } from '../lib/algorithms/cloudModel';
import {
  type BatchStats,
  type FairDuelResult,
  runFairDuel,
  runMultiSeedBatch,
} from '../lib/algorithms/fairDuel';
import { type HybridAdaptation } from '../lib/algorithms/hybridSa2Opt';

export type XAxisMode = 'evals' | 'step';

interface SandboxState {
  taskCount: number;
  vmCount: number;
  seed: number;
  initialTemp: number;
  coolingRate: number;
  innerLoops: number;
  maxEvaluations: number;
  adaptation: HybridAdaptation;
  enable2Opt: boolean;
  xAxisMode: XAxisMode;

  problem: CloudProblem;
  duel: FairDuelResult;
  batchStats: BatchStats[] | null;

  updateParam: <
    K extends
      | 'taskCount'
      | 'vmCount'
      | 'seed'
      | 'initialTemp'
      | 'coolingRate'
      | 'innerLoops'
      | 'maxEvaluations'
      | 'adaptation'
      | 'enable2Opt'
      | 'xAxisMode',
  >(
    key: K,
    value: SandboxState[K],
  ) => void;
  randomizeSeed: () => void;
  runBatch10Seeds: () => void;
}

const INITIAL_PARAMS = {
  taskCount: 24,
  vmCount: 4,
  seed: 2026,
  initialTemp: 80,
  coolingRate: 0.92,
  innerLoops: 8,
  maxEvaluations: 500,
  adaptation: 'pairwise-swap' as HybridAdaptation,
  enable2Opt: true,
  xAxisMode: 'evals' as XAxisMode,
};

function computeDuel(params: typeof INITIAL_PARAMS) {
  const problem = createCloudProblem(params.taskCount, params.vmCount, params.seed);
  const duel = runFairDuel({
    problem,
    seed: params.seed,
    adaptation: params.adaptation,
    initialTemp: params.initialTemp,
    coolingRate: params.coolingRate,
    innerLoops: params.innerLoops,
    maxEvaluations: params.maxEvaluations,
  });
  return { problem, duel };
}

const initialComputed = computeDuel(INITIAL_PARAMS);

export const useSandboxStore = create<SandboxState>((set, get) => ({
  ...INITIAL_PARAMS,
  problem: initialComputed.problem,
  duel: initialComputed.duel,
  batchStats: null,

  updateParam: (key, value) => {
    const next = {
      taskCount: get().taskCount,
      vmCount: get().vmCount,
      seed: get().seed,
      initialTemp: get().initialTemp,
      coolingRate: get().coolingRate,
      innerLoops: get().innerLoops,
      maxEvaluations: get().maxEvaluations,
      adaptation: get().adaptation,
      enable2Opt: get().enable2Opt,
      xAxisMode: get().xAxisMode,
      [key]: value,
    };

    if (key === 'xAxisMode' || key === 'enable2Opt') {
      set({ [key]: value } as Partial<SandboxState>);
      return;
    }

    const computed = computeDuel(next);
    set({
      ...next,
      problem: computed.problem,
      duel: computed.duel,
      batchStats: null,
    });
  },

  randomizeSeed: () => {
    const nextSeed = ((get().seed * 1664525 + 1013904223) >>> 0) % 90000 + 1000;
    get().updateParam('seed', nextSeed);
  },

  runBatch10Seeds: () => {
    const state = get();
    const stats = runMultiSeedBatch({
      problem: state.problem,
      baseSeed: state.seed,
      seedCount: 10,
      adaptation: state.adaptation,
      initialTemp: state.initialTemp,
      coolingRate: state.coolingRate,
      innerLoops: state.innerLoops,
      maxEvaluations: state.maxEvaluations,
    });
    set({ batchStats: stats });
  },
}));
