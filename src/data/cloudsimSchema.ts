/**
 * Kontrak dan validator runtime untuk impor file JSON hasil CloudSim tim
 * (SA + 2-Opt dan opsional DJAYA + 2-Opt).
 */

export type CloudSimAlgoKey =
  | 'SA+2Opt'
  | 'DJAYA+2Opt'
  | 'SA'
  | 'JAYA'
  | 'Sufferage'
  | 'RoundRobin';

export interface CloudSimAlgoEntry {
  algorithm: CloudSimAlgoKey;
  makespanMean: number;
  makespanStd: number;
  aruMean: number;
  doiMean: number;
  avgWaitingMean: number;
  runtimeMsMean: number;
  verifiedCloudSim: boolean;
}

export interface CloudSimScenarioBlock {
  id: string;
  dataset: 'gocj' | 'nasa';
  tasks: number;
  vms: number;
  evaluationBudget: number;
  runs: number;
  results: CloudSimAlgoEntry[];
}

export interface CloudSimHybridDataset {
  sourceLabel: string;
  isPlaceholder: boolean;
  scenarios: CloudSimScenarioBlock[];
}

export type ValidationResult =
  | { ok: true; data: CloudSimHybridDataset }
  | { ok: false; error: string };

const ALLOWED_ALGOS = new Set<CloudSimAlgoKey>([
  'SA+2Opt',
  'DJAYA+2Opt',
  'SA',
  'JAYA',
  'Sufferage',
  'RoundRobin',
]);

function isFiniteNonNeg(val: unknown): val is number {
  return typeof val === 'number' && Number.isFinite(val) && val >= 0;
}

export function validateCloudSimHybridJson(raw: unknown): ValidationResult {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, error: 'Root JSON harus berupa objek dengan field sourceLabel, isPlaceholder, dan scenarios.' };
  }

  const obj = raw as Record<string, unknown>;
  if (typeof obj.sourceLabel !== 'string' || obj.sourceLabel.trim().length === 0) {
    return { ok: false, error: 'Field "sourceLabel" wajib berupa teks non-kosong.' };
  }
  if (typeof obj.isPlaceholder !== 'boolean') {
    return { ok: false, error: 'Field "isPlaceholder" wajib berupa boolean (true/false).' };
  }
  if (!Array.isArray(obj.scenarios) || obj.scenarios.length === 0) {
    return { ok: false, error: 'Field "scenarios" wajib berupa array minimal 1 skenario.' };
  }

  const scenarios: CloudSimScenarioBlock[] = [];
  for (let i = 0; i < obj.scenarios.length; i++) {
    const sc = obj.scenarios[i];
    if (!sc || typeof sc !== 'object' || Array.isArray(sc)) {
      return { ok: false, error: `Skenario ke-${i + 1} harus berupa objek.` };
    }
    const s = sc as Record<string, unknown>;
    if (typeof s.id !== 'string' || !s.id.trim()) {
      return { ok: false, error: `Skenario ke-${i + 1} tidak memiliki field "id" yang valid.` };
    }
    if (s.dataset !== 'gocj' && s.dataset !== 'nasa') {
      return { ok: false, error: `Skenario "${s.id}": field "dataset" harus "gocj" atau "nasa".` };
    }
    if (!isFiniteNonNeg(s.tasks) || s.tasks <= 0 || !isFiniteNonNeg(s.vms) || s.vms <= 0) {
      return { ok: false, error: `Skenario "${s.id}": "tasks" dan "vms" harus angka > 0.` };
    }
    if (!isFiniteNonNeg(s.evaluationBudget) || !isFiniteNonNeg(s.runs)) {
      return { ok: false, error: `Skenario "${s.id}": "evaluationBudget" dan "runs" wajib angka >= 0.` };
    }
    if (!Array.isArray(s.results)) {
      return { ok: false, error: `Skenario "${s.id}": field "results" wajib berupa array.` };
    }

    const results: CloudSimAlgoEntry[] = [];
    for (let j = 0; j < s.results.length; j++) {
      const r = s.results[j] as Record<string, unknown>;
      if (!r || typeof r !== 'object') {
        return { ok: false, error: `Skenario "${s.id}" baris hasil ke-${j + 1} bukan objek.` };
      }
      if (typeof r.algorithm !== 'string' || !ALLOWED_ALGOS.has(r.algorithm as CloudSimAlgoKey)) {
        return {
          ok: false,
          error: `Skenario "${s.id}": nama algoritma "${String(r.algorithm)}" tidak dikenal (gunakan SA+2Opt, DJAYA+2Opt, SA, JAYA, Sufferage, RoundRobin).`,
        };
      }
      if (
        !isFiniteNonNeg(r.makespanMean) ||
        !isFiniteNonNeg(r.makespanStd) ||
        !isFiniteNonNeg(r.aruMean) ||
        !isFiniteNonNeg(r.doiMean) ||
        !isFiniteNonNeg(r.avgWaitingMean) ||
        !isFiniteNonNeg(r.runtimeMsMean)
      ) {
        return {
          ok: false,
          error: `Skenario "${s.id}" algoritma "${r.algorithm}": semua metrik numerik wajib angka non-negatif.`,
        };
      }
      if (typeof r.verifiedCloudSim !== 'boolean') {
        return {
          ok: false,
          error: `Skenario "${s.id}" algoritma "${r.algorithm}": field "verifiedCloudSim" wajib boolean.`,
        };
      }

      results.push({
        algorithm: r.algorithm as CloudSimAlgoKey,
        makespanMean: r.makespanMean,
        makespanStd: r.makespanStd,
        aruMean: r.aruMean,
        doiMean: r.doiMean,
        avgWaitingMean: r.avgWaitingMean,
        runtimeMsMean: r.runtimeMsMean,
        verifiedCloudSim: r.verifiedCloudSim,
      });
    }

    scenarios.push({
      id: s.id,
      dataset: s.dataset,
      tasks: s.tasks,
      vms: s.vms,
      evaluationBudget: s.evaluationBudget,
      runs: s.runs,
      results,
    });
  }

  return {
    ok: true,
    data: {
      sourceLabel: obj.sourceLabel,
      isPlaceholder: obj.isPlaceholder,
      scenarios,
    },
  };
}
