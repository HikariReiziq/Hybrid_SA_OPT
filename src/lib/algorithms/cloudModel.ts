/**
 * Model Cloud Task Scheduling: Task, VM heterogen (mengadopsi profil Kelompok 4
 * DC Jakarta & DC Surabaya), matriks ETC, dan kalkulasi metrik Makespan, ARU, DOI.
 */

import { mulberry32 } from './rng';

export interface VmSpec {
  id: number;
  name: string;
  datacenter: 'DC-Jakarta' | 'DC-Surabaya';
  mips: number;
  tier: string;
}

export interface TaskSpec {
  id: number;
  name: string;
  lengthMi: number;
}

export interface CloudProblem {
  id: string;
  title: string;
  vms: readonly VmSpec[];
  tasks: readonly TaskSpec[];
  /** etc[taskIndex][vmIndex] = waktu eksekusi (detik) */
  etc: readonly (readonly number[])[];
}

export interface ScheduleMetrics {
  vmLoads: number[];
  makespan: number;
  bottleneckVm: number;
  aru: number;
  doi: number;
  avgWaiting: number;
  throughput: number;
  totalExecTime: number;
}

/**
 * Skenario Mini-Game Dispatch Adegan 01 (6 Task x 3 VM Heterogen):
 * S0 = [2, 1, 0, 2, 0, 1] -> VM1 = 5s, VM2 = 14s (bottleneck!), VM3 = 4s -> Makespan = 14s.
 * Optimal Brute-Force = 9s (VM1 = 7s, VM2 = 9s, VM3 = 9s).
 */
export const MINI_DISPATCH_PROBLEM: CloudProblem = {
  id: 'mini-6x3',
  title: 'Mini-Challenge: 6 Task · 3 VM Heterogen',
  vms: [
    { id: 0, name: 'VM 1', datacenter: 'DC-Jakarta', mips: 500, tier: 'V1 · Kecil' },
    { id: 1, name: 'VM 2', datacenter: 'DC-Surabaya', mips: 1000, tier: 'V3 · Sedang' },
    { id: 2, name: 'VM 3', datacenter: 'DC-Jakarta', mips: 1600, tier: 'V5 · Cepat' },
  ],
  tasks: [
    { id: 0, name: 'T1 · Auth', lengthMi: 3200 },
    { id: 1, name: 'T2 · Resize', lengthMi: 5000 },
    { id: 2, name: 'T3 · Logs', lengthMi: 1800 },
    { id: 3, name: 'T4 · PDF', lengthMi: 3600 },
    { id: 4, name: 'T5 · Sync', lengthMi: 2800 },
    { id: 5, name: 'T6 · Batch', lengthMi: 9000 },
  ],
  etc: [
    [4, 7, 2],
    [5, 5, 6],
    [2, 4, 8],
    [8, 9, 2],
    [3, 7, 5],
    [12, 9, 10],
  ],
};

export const MINI_DISPATCH_INITIAL: readonly number[] = [2, 1, 0, 2, 0, 1];

/**
 * Kasus khusus Adegan 03 (Morph 2-Opt ke Cloud):
 * Menunjukkan 1 kali Pairwise 2-Opt Swap (T1 <-> T2) memangkas Makespan dari 15s ke 10s,
 * lebih tajam dibanding sekadar memindah 1 task saja!
 */
export const MORPH_SWAP_PROBLEM: CloudProblem = {
  id: 'morph-4x2',
  title: 'Jembatan 2-Opt di Cloud: 4 Task · 2 VM',
  vms: [
    { id: 0, name: 'VM 1', datacenter: 'DC-Jakarta', mips: 800, tier: 'V2 · Reguler' },
    { id: 1, name: 'VM 2', datacenter: 'DC-Surabaya', mips: 1300, tier: 'V4 · Kencang' },
  ],
  tasks: [
    { id: 0, name: 'T1 · Video', lengthMi: 4800 },
    { id: 1, name: 'T2 · Query', lengthMi: 5200 },
    { id: 2, name: 'T3 · Cache', lengthMi: 2400 },
    { id: 3, name: 'T4 · Report', lengthMi: 6400 },
  ],
  etc: [
    [6, 2],
    [2, 7],
    [3, 6],
    [10, 8],
  ],
};

/** Awal: T1,T3 di VM1 (9s), T2,T4 di VM2 (15s). Swap T1 <-> T2 -> VM1=5s, VM2=10s! */
export const MORPH_SWAP_INITIAL: readonly number[] = [0, 1, 0, 1];

const VM_PROFILES = [
  { mips: 500, tier: 'V1' },
  { mips: 800, tier: 'V2' },
  { mips: 1000, tier: 'V3' },
  { mips: 1300, tier: 'V4' },
  { mips: 1600, tier: 'V5' },
] as const;

/**
 * Membangkitkan workload Cloud heterogen terinspirasi GoCJ untuk Adegan 04 Race & Sandbox Q&A.
 */
export function createCloudProblem(
  taskCount: number,
  vmCount: number,
  seed: number,
): CloudProblem {
  const rng = mulberry32(seed ^ 0x9e3779b9);

  const vms: VmSpec[] = Array.from({ length: vmCount }, (_, i) => {
    const profile = VM_PROFILES[i % VM_PROFILES.length];
    return {
      id: i,
      name: `VM ${i + 1}`,
      datacenter: i % 2 === 0 ? 'DC-Jakarta' : 'DC-Surabaya',
      mips: profile.mips,
      tier: `${profile.tier} · ${profile.mips}`,
    };
  });

  // Distribusi panjang task terinspirasi GoCJ (kecil, sedang, besar)
  const tiers = [15000, 30000, 59000, 110000, 220000, 450000];
  const tasks: TaskSpec[] = Array.from({ length: taskCount }, (_, i) => {
    const baseMi = tiers[Math.floor(rng() * tiers.length)];
    const jitter = 0.75 + rng() * 0.5;
    const lengthMi = Math.round((baseMi * jitter) / 100) * 100;
    return {
      id: i,
      name: `T${i + 1}`,
      lengthMi,
    };
  });

  // Matriks ETC dengan faktor afinitas heterogen realistis (I/O, memori, CPU)
  const etc: number[][] = tasks.map((task) =>
    vms.map((vm) => {
      const affinity = 0.65 + rng() * 0.7;
      return Math.round(((task.lengthMi / vm.mips) * affinity) * 10) / 10;
    }),
  );

  return {
    id: `gocj-mini-${taskCount}x${vmCount}-s${seed}`,
    title: `${taskCount} Task · ${vmCount} VM Heterogen`,
    vms,
    tasks,
    etc,
  };
}

export function evaluateSchedule(
  problem: CloudProblem,
  assignment: readonly number[],
): ScheduleMetrics {
  const m = problem.vms.length;
  const n = problem.tasks.length;
  const vmLoads = new Array<number>(m).fill(0);
  let totalWait = 0;
  let totalExecTime = 0;

  for (let i = 0; i < n; i++) {
    const vmIdx = assignment[i];
    const exec = problem.etc[i][vmIdx];
    totalWait += vmLoads[vmIdx];
    vmLoads[vmIdx] += exec;
    totalExecTime += exec;
  }

  let makespan = 0;
  let bottleneckVm = 0;
  let minLoad = Infinity;
  let sumLoad = 0;

  for (let v = 0; v < m; v++) {
    const ld = vmLoads[v];
    sumLoad += ld;
    if (ld > makespan) {
      makespan = ld;
      bottleneckVm = v;
    }
    if (ld < minLoad) {
      minLoad = ld;
    }
  }

  const avgLoad = m > 0 ? sumLoad / m : 0;
  const aru = makespan > 0 && m > 0 ? sumLoad / (m * makespan) : 0;
  const doi = avgLoad > 0 ? (makespan - minLoad) / avgLoad : 0;
  const avgWaiting = n > 0 ? totalWait / n : 0;
  const throughput = makespan > 0 ? n / makespan : 0;

  return {
    vmLoads,
    makespan,
    bottleneckVm,
    aru,
    doi,
    avgWaiting,
    throughput,
    totalExecTime,
  };
}

/**
 * Mengonversi permutasi urutan task menjadi penugasan VM menggunakan
 * Earliest Finish Time (EFT) List Decoder (Adaptasi B: Permutasi 2-Opt -> Cloud).
 */
export function decodePermutationToAssignment(
  problem: CloudProblem,
  permutation: readonly number[],
): number[] {
  const m = problem.vms.length;
  const n = problem.tasks.length;
  const ready = new Array<number>(m).fill(0);
  const assignment = new Array<number>(n).fill(0);

  for (let idx = 0; idx < permutation.length; idx++) {
    const t = permutation[idx];
    let bestVm = 0;
    let bestFinish = Infinity;
    for (let v = 0; v < m; v++) {
      const finish = ready[v] + problem.etc[t][v];
      if (finish < bestFinish) {
        bestFinish = finish;
        bestVm = v;
      }
    }
    assignment[t] = bestVm;
    ready[bestVm] = bestFinish;
  }

  return assignment;
}
