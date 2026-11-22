import { useEffect, useMemo, useState } from 'react';
import { PAPER_MENTION } from '../../data/content';
import { createCloudProblem } from '../../lib/algorithms/cloudModel';
import {
  HybridSa2OptEngine,
  type HybridStepSnapshot,
  type HybridTracePoint,
} from '../../lib/algorithms/hybridSa2Opt';
import { formatId } from '../../lib/algorithms/rng';
import { LrhOrbitCanvas } from '../ui/AnimatedCanvases';
import { ConvergenceSvg } from '../ui/ConvergenceSvg';
import { CoachMissionBanner, CoachTarget } from '../ui/GuidedCoach';
import { VmRackGantt } from '../ui/VmRackGantt';

interface Scene04Props {
  beat?: number;
  exploreAll?: boolean;
}

const LRH_STEPS = [
  {
    id: 0,
    title: '1. SA Perturb',
    role: 'Eksplorasi Global',
    color: 'var(--sa-heat)',
    desc: 'SA mengacak penempatan task untuk membuka wilayah solusi baru di luar zona nyaman.',
  },
  {
    id: 1,
    title: '2. 2-Opt Poles (LRH)',
    role: 'Eksploitasi Lokal',
    color: 'var(--opt-cyan)',
    desc: 'Di dalam inner loop SA, 2-Opt langsung menyisir VM bottleneck dan menukar pasangan task agar rata.',
  },
  {
    id: 2,
    title: '3. Cek Metropolis',
    role: 'Anti Jebakan Lokal',
    color: 'var(--ok-mint)',
    desc: 'Jika lebih cepat langsung diterima; jika lebih buruk tetap berpeluang diterima sebesar P = exp(-ΔE/T).',
  },
  {
    id: 3,
    title: '4. Cooling Schedule',
    role: 'Penguncian',
    color: 'var(--gold-text)',
    desc: 'Setelah inner loop selesai, suhu diturunkan (T = T × r) sampai solusi terbaik S_opt terkunci.',
  },
] as const;

const RACE_BUDGET = 320;

interface RaceEngines {
  sa: HybridSa2OptEngine;
  hyb: HybridSa2OptEngine;
}

function createRaceBundle(seed: number) {
  const problem = createCloudProblem(18, 4, seed);
  const shared = {
    problem,
    seed,
    adaptation: 'pairwise-swap' as const,
    initialTemp: 75,
    coolingRate: 0.91,
    minTemp: 0.01,
    outerLoops: 120,
    innerLoops: 6,
    maxEvaluations: RACE_BUDGET,
  };
  const sa = new HybridSa2OptEngine({ ...shared, enable2Opt: false });
  const hyb = new HybridSa2OptEngine({ ...shared, enable2Opt: true, twoOptSampleLimit: 5 });
  return { problem, engines: { sa, hyb } };
}

export function Scene04HybridRace({ beat = 0, exploreAll = false }: Scene04Props) {
  const [activeLrhStep, setActiveLrhStep] = useState(1);

  const [raceSeed, setRaceSeed] = useState(2026);
  const [bundle, setBundle] = useState(() => createRaceBundle(2026));
  const [running, setRunning] = useState(false);
  const [hasStartedRace, setHasStartedRace] = useState(false);
  const [scanFlash, setScanFlash] = useState(0);
  const [xAxis, setXAxis] = useState<'evals' | 'step'>('evals');
  const [saSnap, setSaSnap] = useState<HybridStepSnapshot>(() => bundle.engines.sa.snapshot());
  const [hybSnap, setHybSnap] = useState<HybridStepSnapshot>(() => bundle.engines.hyb.snapshot());
  const [saTrace, setSaTrace] = useState<HybridTracePoint[]>(() => [...bundle.engines.sa.trace]);
  const [hybTrace, setHybTrace] = useState<HybridTracePoint[]>(() => [
    ...bundle.engines.hyb.trace,
  ]);

  const resetRace = (nextSeed: number) => {
    setRunning(false);
    const fresh = createRaceBundle(nextSeed);
    setRaceSeed(nextSeed);
    setBundle(fresh);
    setSaSnap(fresh.engines.sa.snapshot());
    setHybSnap(fresh.engines.hyb.snapshot());
    setSaTrace([...fresh.engines.sa.trace]);
    setHybTrace([...fresh.engines.hyb.trace]);
  };

  const advanceRace = (engines: RaceEngines, steps = 1) => {
    const prevSwaps = engines.hyb.snapshot().twoOptSwapsTotal;
    for (let k = 0; k < steps; k++) {
      if (!engines.hyb.snapshot().done) engines.hyb.step();
      for (let j = 0; j < 5; j++) {
        if (!engines.sa.snapshot().done) engines.sa.step();
      }
    }
    const nextSa = engines.sa.snapshot();
    const nextHyb = engines.hyb.snapshot();
    if (nextHyb.twoOptSwapsTotal > prevSwaps) {
      setScanFlash((c) => c + 1);
    }
    setSaSnap(nextSa);
    setHybSnap(nextHyb);
    setSaTrace([...engines.sa.trace]);
    setHybTrace([...engines.hyb.trace]);
    if (nextSa.done && nextHyb.done) {
      setRunning(false);
    }
  };

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      advanceRace(bundle.engines, 2);
    }, 95);
    return () => window.clearInterval(timer);
  }, [running, bundle]);

  const scaleMax = useMemo(
    () => Math.max(saSnap.bestMakespan, hybSnap.bestMakespan, 1) * 1.12,
    [saSnap.bestMakespan, hybSnap.bestMakespan],
  );

  const bothDone = saSnap.done && hybSnap.done;
  const diffPct =
    saSnap.bestMakespan > 0
      ? ((saSnap.bestMakespan - hybSnap.bestMakespan) / saSnap.bestMakespan) * 100
      : 0;

  const showBeat0 = exploreAll || beat === 0;
  const showBeat1 = exploreAll || beat === 1;

  return (
    <div className="flex flex-col gap-5">
      {/* BEAT 0: Mention Ringkas Paper + Animasi Siklus 4 Stasiun LRH */}
      {showBeat0 && (
        <div className="flex flex-col gap-3.5">
          <div>
            <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
              Anatomi <span style={{ color: 'var(--opt-cyan)' }}>Hybrid SA + 2-Opt</span>
            </h2>
            <p className="mt-1 text-sm text-[var(--ink-secondary)]">
              Termasuk pola <strong className="text-[var(--ink-primary)]">{PAPER_MENTION.taxonomy}</strong>:
              2-Opt dipanggil langsung di dalam tiap langkah SA.
            </p>
          </div>

          <div
            className="studio-panel flex flex-col gap-1 p-3.5"
            style={{ backgroundColor: 'var(--opt-cyan-soft)', borderColor: 'var(--opt-cyan)' }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <strong style={{ color: 'var(--opt-cyan)' }}>
                Rujukan: {PAPER_MENTION.authors}
              </strong>
              <span className="font-mono-tabular text-[11px] text-[var(--ink-secondary)]">
                {PAPER_MENTION.venue}
              </span>
            </div>
            <p className="m-0 text-sm font-bold text-[var(--ink-primary)]">
              &ldquo;{PAPER_MENTION.title}&rdquo;
            </p>
            <p className="m-0 text-xs text-[var(--ink-secondary)]">{PAPER_MENTION.oneLineCore}</p>
          </div>

          {/* Animasi 60fps Bola Data Mengelilingi 4 Stasiun LRH */}
          <LrhOrbitCanvas activeStep={activeLrhStep} onStepSelect={setActiveLrhStep} />

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {LRH_STEPS.map((st) => {
              const active = activeLrhStep === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setActiveLrhStep(st.id)}
                  aria-pressed={active}
                  className="studio-panel flex min-h-[104px] flex-col justify-between p-3 text-left transition-transform duration-150 hover:-translate-y-0.5"
                  style={{
                    borderColor: active ? st.color : 'var(--border-line)',
                    backgroundColor: active ? 'var(--bg-inset)' : 'var(--bg-panel)',
                  }}
                >
                  <div>
                    <div className="text-[11px] font-bold" style={{ color: st.color }}>
                      {st.role}
                    </div>
                    <div className="font-display mt-0.5 text-sm font-extrabold">{st.title}</div>
                  </div>
                  <p className="m-0 mt-1.5 text-xs leading-snug text-[var(--ink-secondary)]">
                    {st.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* BEAT 1: Live Broadcast Race (SA Murni vs Hybrid SA + 2-Opt) */}
      {showBeat1 && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-xl font-extrabold sm:text-2xl">
                Siaran Langsung:{' '}
                <span style={{ color: 'var(--sa-heat)' }}>SA Murni</span> vs{' '}
                <span style={{ color: 'var(--opt-cyan)' }}>Hybrid SA + 2-Opt</span>
              </h2>
              <p className="font-mono-tabular m-0 text-xs text-[var(--ink-secondary)]">
                18 Task · 4 VM Heterogen · Seed {raceSeed} · Budget setara maks {RACE_BUDGET}{' '}
                evaluasi
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <CoachTarget
                active={!hasStartedRace && !running}
                label="Klik untuk mulai balapan!"
                position="top"
              >
                <button
                  type="button"
                  onClick={() => {
                    setHasStartedRace(true);
                    if (bothDone) resetRace(raceSeed);
                    setRunning((r) => !r);
                  }}
                  className="btn-studio btn-studio-gold text-xs"
                >
                  {running ? '❚❚ Jeda Race' : bothDone ? 'Putar Ulang' : '▶ Mulai Race Live'}
                </button>
              </CoachTarget>

              <button
                type="button"
                onClick={() => {
                  setHasStartedRace(true);
                  advanceRace(bundle.engines, 1);
                }}
                disabled={bothDone}
                className="btn-studio text-xs"
              >
                +1 Langkah
              </button>
              <button
                type="button"
                onClick={() => resetRace(((raceSeed * 1103515245 + 12345) >>> 0) % 9000 + 1000)}
                className="btn-studio text-xs"
              >
                Ganti Seed
              </button>
              <button
                type="button"
                onClick={() => setXAxis((x) => (x === 'evals' ? 'step' : 'evals'))}
                className="btn-studio text-xs"
              >
                Sumbu-X: {xAxis === 'evals' ? 'Evaluasi' : 'Langkah'}
              </button>
            </div>
          </div>

          <CoachMissionBanner
            stepLabel={running ? 'Siaran Berlangsung' : 'Pemandu · Live Race'}
            instruction={
              running
                ? 'Perhatikan sinar cyan 2-Opt menyapu rak kanan dan garis biru Hybrid menukik lebih tajam daripada garis oranye putus-putus SA Murni!'
                : "Klik tombol emas 'Mulai Race Live' untuk menyaksikan garis biru Hybrid SA + 2-Opt melesat turun jauh lebih cepat daripada SA Murni pada budget evaluasi yang sama."
            }
            completed={bothDone}
            doneMessage={`Race selesai pada budget ${RACE_BUDGET} evaluasi! Lihat bagaimana garis biru Hybrid langsung menukik tajam sejak awal.`}
          />

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <VmRackGantt
              problem={bundle.problem}
              assignment={saSnap.bestAssignment}
              scaleMax={scaleMax}
              compact
              title={`SA Murni · ${saSnap.evaluations} eval · T=${formatId(saSnap.temperature, 1)}`}
            />
            <VmRackGantt
              problem={bundle.problem}
              assignment={hybSnap.bestAssignment}
              scaleMax={scaleMax}
              compact
              scanFlashKey={scanFlash}
              title={`Hybrid SA + 2-Opt · ${hybSnap.evaluations} eval · ${hybSnap.twoOptSwapsTotal}× poles`}
            />
          </div>

          <ConvergenceSvg
            height={148}
            title="Kurva Penurunan Makespan Terbaik (Budget Evaluasi Setara)"
            xLabel={
              xAxis === 'evals'
                ? 'Jumlah Fitness Evaluation (SA + 2-Opt dihitung jujur)'
                : 'Jumlah Langkah Iterasi'
            }
            series={[
              {
                id: 'sa',
                label: 'SA Murni',
                color: 'var(--sa-heat)',
                dashed: true,
                points: saTrace.map((pt) => ({
                  x: xAxis === 'evals' ? pt.evaluations : pt.step,
                  y: pt.bestCost,
                })),
              },
              {
                id: 'hybrid',
                label: 'Hybrid SA + 2-Opt',
                color: 'var(--opt-cyan)',
                points: hybTrace.map((pt) => ({
                  x: xAxis === 'evals' ? pt.evaluations : pt.step,
                  y: pt.bestCost,
                })),
              },
            ]}
          />

          <div
            role="status"
            aria-live="polite"
            className="font-mono-tabular flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--border-line)] bg-[var(--bg-panel)] px-3.5 py-2 text-xs font-semibold"
          >
            <span>
              SA Murni: <strong>{formatId(saSnap.bestMakespan, 1)} s</strong> ({saSnap.evaluations}{' '}
              eval)
            </span>
            <span>
              Hybrid SA + 2-Opt:{' '}
              <strong style={{ color: 'var(--opt-cyan)' }}>
                {formatId(hybSnap.bestMakespan, 1)} s
              </strong>{' '}
              ({hybSnap.evaluations} eval)
            </span>
            <span style={{ color: diffPct >= 0 ? 'var(--ok-mint)' : 'var(--sa-heat)' }}>
              {diffPct >= 0
                ? `Hybrid lebih cepat ${formatId(diffPct, 1)}%`
                : `SA sementara unggul ${formatId(Math.abs(diffPct), 1)}%`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
