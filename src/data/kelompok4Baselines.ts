/**
 * Data eksperimen baseline terverifikasi milik Kelompok 4 Kelas C ITS
 * diekstrak langsung dari Metaheuristic_JAYA_SA_Algorithm/cloudsim-jaya/results/summary.csv
 * (352 run CloudSim Plus 8.0.0, 10 seed untuk SA & JAYA, 1 run deterministik Sufferage & RR).
 */

export interface VerifiedBaselineRow {
  algorithm: 'SA' | 'Sufferage' | 'JAYA' | 'RoundRobin';
  label: string;
  makespanMean: number;
  makespanStd: number;
  aruMean: number;
  doiMean: number;
  avgWaitingMean: number;
  runtimeMsMean: number;
}

export interface VerifiedScenario {
  id: string;
  name: string;
  dataset: 'gocj' | 'nasa';
  tasks: number;
  vms: number;
  note: string;
  rows: readonly VerifiedBaselineRow[];
}

export const KELOMPOK4_VERIFIED_BASELINES: readonly VerifiedScenario[] = [
  {
    id: 'tc1-500x50',
    name: 'GoCJ 500 Task × 50 VM',
    dataset: 'gocj',
    tasks: 500,
    vms: 50,
    note: 'SA murni unggul 27% atas Sufferage dan 61% atas JAYA, tetapi DOI masih 0,62.',
    rows: [
      {
        algorithm: 'SA',
        label: 'SA Murni (10 seed)',
        makespanMean: 716.9,
        makespanStd: 19.2,
        aruMean: 0.852,
        doiMean: 0.622,
        avgWaitingMean: 234.5,
        runtimeMsMean: 61.9,
      },
      {
        algorithm: 'Sufferage',
        label: 'Sufferage (Heuristik)',
        makespanMean: 986.6,
        makespanStd: 0,
        aruMean: 0.59,
        doiMean: 0.848,
        avgWaitingMean: 231.0,
        runtimeMsMean: 5.0,
      },
      {
        algorithm: 'JAYA',
        label: 'JAYA (10 seed)',
        makespanMean: 1821.6,
        makespanStd: 134.4,
        aruMean: 0.487,
        doiMean: 1.881,
        avgWaitingMean: 396.1,
        runtimeMsMean: 222.7,
      },
      {
        algorithm: 'RoundRobin',
        label: 'Round Robin (Baseline)',
        makespanMean: 6549.0,
        makespanStd: 0,
        aruMean: 0.181,
        doiMean: 5.222,
        avgWaitingMean: 500.2,
        runtimeMsMean: 0,
      },
    ],
  },
  {
    id: 'tc1-1000x50',
    name: 'GoCJ 1000 Task × 50 VM',
    dataset: 'gocj',
    tasks: 1000,
    vms: 50,
    note: 'Beban terpadat: SA murni masih menyisakan deviasi ±51,7 s dan DOI 0,43.',
    rows: [
      {
        algorithm: 'SA',
        label: 'SA Murni (10 seed)',
        makespanMean: 1438.5,
        makespanStd: 51.7,
        aruMean: 0.875,
        doiMean: 0.43,
        avgWaitingMean: 526.4,
        runtimeMsMean: 113.5,
      },
      {
        algorithm: 'Sufferage',
        label: 'Sufferage (Heuristik)',
        makespanMean: 1594.4,
        makespanStd: 0,
        aruMean: 0.751,
        doiMean: 0.43,
        avgWaitingMean: 520.0,
        runtimeMsMean: 17.0,
      },
      {
        algorithm: 'JAYA',
        label: 'JAYA (10 seed)',
        makespanMean: 3614.8,
        makespanStd: 176.0,
        aruMean: 0.498,
        doiMean: 1.875,
        avgWaitingMean: 890.0,
        runtimeMsMean: 429.4,
      },
      {
        algorithm: 'RoundRobin',
        label: 'Round Robin (Baseline)',
        makespanMean: 9837.0,
        makespanStd: 0,
        aruMean: 0.242,
        doiMean: 3.855,
        avgWaitingMean: 1088.8,
        runtimeMsMean: 0,
      },
    ],
  },
  {
    id: 'tc2-750x10',
    name: 'GoCJ 750 Task × 10 VM',
    dataset: 'gocj',
    tasks: 750,
    vms: 10,
    note: 'VM terbatas: SA murni nyaris menyentuh batas bawah teoretis (4.769 s), ARU 99,7%.',
    rows: [
      {
        algorithm: 'SA',
        label: 'SA Murni (10 seed)',
        makespanMean: 4781.0,
        makespanStd: 1.2,
        aruMean: 0.997,
        doiMean: 0.007,
        avgWaitingMean: 2343.3,
        runtimeMsMean: 90.4,
      },
      {
        algorithm: 'Sufferage',
        label: 'Sufferage (Heuristik)',
        makespanMean: 4915.8,
        makespanStd: 0,
        aruMean: 0.968,
        doiMean: 0.048,
        avgWaitingMean: 2420.1,
        runtimeMsMean: 4.0,
      },
      {
        algorithm: 'JAYA',
        label: 'JAYA (10 seed)',
        makespanMean: 9359.9,
        makespanStd: 877.1,
        aruMean: 0.717,
        doiMean: 1.15,
        avgWaitingMean: 3316.1,
        runtimeMsMean: 352.1,
      },
      {
        algorithm: 'RoundRobin',
        label: 'Round Robin (Baseline)',
        makespanMean: 20326.0,
        makespanStd: 0,
        aruMean: 0.417,
        doiMean: 2.114,
        avgWaitingMean: 4118.0,
        runtimeMsMean: 0,
      },
    ],
  },
  {
    id: 'nasa-750x50',
    name: 'NASA Ames 750 Job × 50 VM',
    dataset: 'nasa',
    tasks: 750,
    vms: 50,
    note: 'Celah utama SA murni: variansi tinggi (±66.963 s, terburuk 1.075.200 s) karena langkah tunggal acak.',
    rows: [
      {
        algorithm: 'JAYA',
        label: 'JAYA (10 seed)',
        makespanMean: 874160.0,
        makespanStd: 0,
        aruMean: 0.248,
        doiMean: 3.027,
        avgWaitingMean: 97357.1,
        runtimeMsMean: 348.1,
      },
      {
        algorithm: 'SA',
        label: 'SA Murni (10 seed)',
        makespanMean: 910358.8,
        makespanStd: 66963.2,
        aruMean: 0.263,
        doiMean: 2.947,
        avgWaitingMean: 91068.3,
        runtimeMsMean: 73.8,
      },
      {
        algorithm: 'Sufferage',
        label: 'Sufferage (Heuristik)',
        makespanMean: 924312.5,
        makespanStd: 0,
        aruMean: 0.13,
        doiMean: 5.047,
        avgWaitingMean: 23365.4,
        runtimeMsMean: 11.0,
      },
      {
        algorithm: 'RoundRobin',
        label: 'Round Robin (Baseline)',
        makespanMean: 1409838.0,
        makespanStd: 0,
        aruMean: 0.175,
        doiMean: 4.293,
        avgWaitingMean: 77436.4,
        runtimeMsMean: 0,
      },
    ],
  },
];
