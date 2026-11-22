import { useMemo, useState } from 'react';
import {
  coolTemperature,
  metropolisProbability,
} from '../../lib/algorithms/hybridSa2Opt';
import { formatId, mulberry32 } from '../../lib/algorithms/rng';
import { SaMountainPhysicsCanvas } from '../ui/AnimatedCanvases';
import { CoachMissionBanner, CoachTarget } from '../ui/GuidedCoach';
import { Tex } from '../ui/Tex';

interface Scene02Props {
  beat?: number;
  exploreAll?: boolean;
}

export function Scene02SaFundamentals({ beat = 0, exploreAll = false }: Scene02Props) {
  const [coolingMode, setCoolingMode] = useState<'gradual' | 'fast'>('gradual');
  const [replayKey, setReplayKey] = useState(1);

  // Beat 1 guided state (Langkah 1: Dingin -> Langkah 2: Panas -> Langkah 3: Lempar Dadu)
  const [temperature, setTemperature] = useState(10);
  const [deltaE, setDeltaE] = useState(4);
  const [rollSeed, setRollSeed] = useState(1);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [coachStage, setCoachStage] = useState<0 | 1 | 2 | 3>(0);

  const prob = metropolisProbability(deltaE, temperature);
  const accepted = lastRoll !== null ? lastRoll < prob : null;

  const handleDiceRoll = () => {
    const rng = mulberry32(rollSeed * 7919 + Math.round(temperature * 10));
    const r = Math.round(rng() * 1000) / 1000;
    setLastRoll(r);
    setRollSeed((s) => s + 1);
    setCoachStage(3);
  };

  const curvePath = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 50; i++) {
      const tVal = 0.2 + (i / 50) * 24.8;
      const pVal = metropolisProbability(deltaE, tVal);
      const x = 36 + (tVal / 25) * 270;
      const y = 114 - pVal * 94;
      pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return pts.join(' ');
  }, [deltaE]);

  const activeX = 36 + (Math.min(25, temperature) / 25) * 270;
  const activeY = 114 - prob * 94;

  const coolingRate = coolingMode === 'gradual' ? 0.9 : 0.55;
  const t1 = coolTemperature(100, coolingRate);
  const t2 = coolTemperature(t1, coolingRate);
  const t3 = coolTemperature(t2, coolingRate);

  const showBeat0 = exploreAll || beat === 0;
  const showBeat1 = exploreAll || beat === 1;

  return (
    <div className="flex flex-col gap-6">
      {/* BEAT 0: Animasi Fisika 60fps Bola SA Melompati Bukit */}
      {showBeat0 && (
        <div className="grid grid-cols-1 items-center gap-5 lg:grid-cols-[1fr_1.15fr]">
          <div className="flex flex-col gap-3.5">
            <h2 className="font-display text-2xl font-extrabold leading-tight sm:text-3xl">
              Simulated Annealing:{' '}
              <span style={{ color: 'var(--sa-heat)' }}>panas untuk melompat</span>, dingin untuk
              mengunci.
            </h2>
            <p className="m-0 text-sm leading-relaxed text-[var(--ink-secondary)]">
              Terinspirasi dari pendinginan logam (Kirkpatrick dkk., 1983). Perhatikan animasi bola
              di kanan: pencarian biasa langsung macet di lembah dangkal, sedangkan SA berani
              menerima langkah naik sementara agar lolos ke lembah terdalam.
            </p>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <div className="studio-panel p-3">
                <div className="text-xs font-bold" style={{ color: 'var(--sa-heat)' }}>
                  Kriteria Metropolis
                </div>
                <Tex math="P = e^{-\Delta E / T}" block className="my-1" />
                <p className="m-0 text-xs text-[var(--ink-secondary)]">
                  Bila beban naik (<Tex math="\Delta E > 0" />), diterima jika <Tex math="r < P" />.
                </p>
              </div>
              <div className="studio-panel p-3">
                <div className="text-xs font-bold" style={{ color: 'var(--opt-cyan)' }}>
                  Jadwal Pendinginan
                </div>
                <Tex math="T_{\text{baru}} = r \cdot T_{\text{lama}}" block className="my-1" />
                <p className="m-0 text-xs text-[var(--ink-secondary)]">
                  Suhu turun bertahap tiap outer loop (<Tex math="r = 0{,}9" />).
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <CoachTarget
                active={coolingMode === 'gradual'}
                label="Coba lihat jika terlalu cepat dingin!"
                position="bottom"
              >
                <button
                  type="button"
                  onClick={() => {
                    setCoolingMode((m) => (m === 'gradual' ? 'fast' : 'gradual'));
                    setReplayKey((k) => k + 1);
                  }}
                  className={`btn-studio text-xs ${
                    coolingMode === 'fast' ? 'btn-studio-cyan' : 'btn-studio-heat'
                  }`}
                >
                  {coolingMode === 'gradual'
                    ? 'Uji Pendinginan Terlalu Cepat (r=0,55)'
                    : 'Kembalikan Pendinginan Bertahap (r=0,90)'}
                </button>
              </CoachTarget>
              <button
                type="button"
                onClick={() => setReplayKey((k) => k + 1)}
                className="btn-studio text-xs"
              >
                Putar Ulang Bola
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <SaMountainPhysicsCanvas coolingMode={coolingMode} replayKey={replayKey} />
            <div className="flex items-center justify-between px-1 text-xs text-[var(--ink-secondary)]">
              <span>Bola abu-abu: Greedy biasa (cepat terjebak)</span>
              <span style={{ color: 'var(--sa-heat)' }}>
                Bola oranye: SA ({coolingMode === 'gradual' ? 'Bertahap → Lolos!' : 'Cepat → Beku!'})
              </span>
            </div>
          </div>
        </div>
      )}

      {/* BEAT 1: Lab Termostat Metropolis Interaktif + Pemandu 3 Langkah */}
      {showBeat1 && (
        <div className="flex flex-col gap-3.5">
          <CoachMissionBanner
            stepLabel={`Pemandu · Langkah ${Math.min(coachStage + 1, 3)} / 3`}
            instruction={
              coachStage === 0
                ? 'Langkah 1: Klik tombol "Dingin (T=1)" untuk melihat betapa kecil peluang SA menerima solusi buruk saat dingin.'
                : coachStage === 1
                  ? 'Langkah 2: Sekarang klik "Panas (T=10)"! Lihat peluang penerimaan melonjak dari 1,8% ke 67,0%.'
                  : 'Langkah 3: Klik "Lempar Dadu r" untuk mensimulasikan keputusan Metropolis menerima atau menolak langkah mundur.'
            }
            completed={coachStage === 3}
            doneMessage="Keren! Kamu sudah paham inti Simulated Annealing. Kamu bebas menggeser slider Suhu T dan ΔE sepuasnya."
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.25fr_1fr]">
            <div className="studio-panel flex flex-col gap-3.5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-[var(--ink-secondary)]">
                  Termostat Metropolis Interaktif
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <CoachTarget active={coachStage === 0} label="Klik 1: Suhu Dingin" position="top">
                    <button
                      type="button"
                      onClick={() => {
                        setTemperature(1);
                        setDeltaE(4);
                        if (coachStage === 0) setCoachStage(1);
                      }}
                      className="btn-studio !min-h-[36px] !px-3 !py-1 text-xs"
                      style={{
                        borderColor: 'var(--opt-cyan)',
                        color: 'var(--opt-cyan)',
                      }}
                    >
                      Dingin (T=1)
                    </button>
                  </CoachTarget>

                  <CoachTarget active={coachStage === 1} label="Klik 2: Suhu Panas" position="top">
                    <button
                      type="button"
                      onClick={() => {
                        setTemperature(10);
                        setDeltaE(4);
                        if (coachStage <= 1) setCoachStage(2);
                      }}
                      className="btn-studio !min-h-[36px] !px-3 !py-1 text-xs"
                      style={{
                        borderColor: 'var(--sa-heat)',
                        color: 'var(--sa-heat)',
                      }}
                    >
                      Panas (T=10)
                    </button>
                  </CoachTarget>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-xs font-bold">
                  <span className="flex justify-between">
                    <span>Suhu (T)</span>
                    <span className="font-mono-tabular" style={{ color: 'var(--sa-heat)' }}>
                      {formatId(temperature, 1)}
                    </span>
                  </span>
                  <input
                    type="range"
                    min={0.5}
                    max={25}
                    step={0.5}
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="studio-range w-full"
                  />
                </label>

                <label className="flex flex-col gap-1 text-xs font-bold">
                  <span className="flex justify-between">
                    <span>Kenaikan Beban (ΔE)</span>
                    <span className="font-mono-tabular">+{formatId(deltaE, 1)} s</span>
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={15}
                    step={0.5}
                    value={deltaE}
                    onChange={(e) => setDeltaE(Number(e.target.value))}
                    className="studio-range w-full"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[1.25fr_1fr]">
                <svg
                  viewBox="0 0 320 132"
                  className="w-full rounded-xl border border-[var(--border-line)] bg-[var(--bg-stage)]"
                  role="img"
                  aria-label="Kurva probabilitas penerimaan Metropolis terhadap suhu T"
                >
                  <line x1="36" y1="20" x2="36" y2="114" stroke="var(--border-line)" />
                  <line x1="36" y1="114" x2="306" y2="114" stroke="var(--border-line)" />
                  <text x="30" y="24" textAnchor="end" fontSize="10" fill="var(--ink-secondary)">
                    100%
                  </text>
                  <text x="30" y="116" textAnchor="end" fontSize="10" fill="var(--ink-secondary)">
                    0%
                  </text>
                  <text x="170" y="128" textAnchor="middle" fontSize="10" fill="var(--ink-secondary)">
                    Suhu T (0,5 sampai 25)
                  </text>

                  <path
                    d={curvePath}
                    fill="none"
                    stroke="var(--sa-heat)"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />
                  <line
                    x1={activeX}
                    y1={activeY}
                    x2={activeX}
                    y2="114"
                    stroke="var(--coach-gold)"
                    strokeDasharray="3 3"
                  />
                  <circle
                    cx={activeX}
                    cy={activeY}
                    r="6.5"
                    fill="var(--coach-gold)"
                    stroke="var(--bg-stage)"
                    strokeWidth="2.5"
                  />
                </svg>

                <div className="flex flex-col gap-2">
                  <div className="rounded-xl border border-[var(--border-line)] bg-[var(--bg-inset)] p-2.5 text-center">
                    <div className="text-[11px] font-semibold text-[var(--ink-secondary)]">
                      Peluang Terima Buruk (P)
                    </div>
                    <div
                      className="font-mono-tabular text-2xl font-extrabold"
                      style={{ color: 'var(--sa-heat)' }}
                    >
                      {formatId(prob * 100, 1)}%
                    </div>
                  </div>

                  <CoachTarget active={coachStage === 2} label="Klik 3: Uji Dadu!" position="bottom" className="w-full">
                    <button
                      type="button"
                      onClick={handleDiceRoll}
                      className="btn-studio btn-studio-heat w-full text-xs"
                    >
                      Lempar Dadu r (0..1)
                    </button>
                  </CoachTarget>

                  {lastRoll !== null && (
                    <div
                      role="status"
                      aria-live="polite"
                      className="font-mono-tabular rounded-xl border px-2.5 py-1.5 text-center text-xs font-bold"
                      style={{
                        borderColor: accepted ? 'var(--ok-mint)' : 'var(--sa-heat)',
                        backgroundColor: accepted ? 'var(--ok-mint-soft)' : 'var(--sa-heat-soft)',
                        color: accepted ? 'var(--ok-mint)' : 'var(--sa-heat)',
                      }}
                    >
                      r = {formatId(lastRoll, 2)} {accepted ? '<' : '≥'} P = {formatId(prob, 2)} ·{' '}
                      {accepted ? 'DITERIMA' : 'DITOLAK'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="studio-panel flex flex-col justify-between gap-3 p-4">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-[var(--ink-secondary)]">
                  Penurunan Suhu Bertahap vs Cepat
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCoolingMode('gradual')}
                    className="min-h-[42px] rounded-xl border px-2.5 py-1.5 text-xs font-bold"
                    style={{
                      borderColor:
                        coolingMode === 'gradual' ? 'var(--ok-mint)' : 'var(--border-line)',
                      backgroundColor:
                        coolingMode === 'gradual' ? 'var(--ok-mint-soft)' : 'var(--bg-inset)',
                      color: coolingMode === 'gradual' ? 'var(--ok-mint)' : 'var(--ink-primary)',
                    }}
                  >
                    Bertahap (r = 0,90)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoolingMode('fast')}
                    className="min-h-[42px] rounded-xl border px-2.5 py-1.5 text-xs font-bold"
                    style={{
                      borderColor:
                        coolingMode === 'fast' ? 'var(--sa-heat)' : 'var(--border-line)',
                      backgroundColor:
                        coolingMode === 'fast' ? 'var(--sa-heat-soft)' : 'var(--bg-inset)',
                      color: coolingMode === 'fast' ? 'var(--sa-heat)' : 'var(--ink-primary)',
                    }}
                  >
                    Terlalu Cepat (r = 0,55)
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {[
                  { label: 'T₀ (Awal)', val: 100 },
                  { label: 'T₁', val: t1 },
                  { label: 'T₂', val: t2 },
                  { label: 'T₃', val: t3 },
                ].map((step) => (
                  <div
                    key={step.label}
                    className="grid grid-cols-[72px_1fr_54px] items-center gap-2"
                  >
                    <span className="font-mono-tabular text-xs font-bold">{step.label}</span>
                    <div className="h-3.5 overflow-hidden rounded-full bg-[var(--bg-inset)]">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${step.val}%`,
                          backgroundColor: step.val > 50 ? 'var(--sa-heat)' : 'var(--opt-cyan)',
                        }}
                      />
                    </div>
                    <span className="font-mono-tabular text-right text-xs font-bold">
                      {formatId(step.val, 1)}
                    </span>
                  </div>
                ))}
              </div>

              <p className="m-0 rounded-xl bg-[var(--bg-inset)] p-3 text-xs leading-relaxed text-[var(--ink-secondary)]">
                {coolingMode === 'gradual'
                  ? 'Pendinginan bertahap memberi cukup waktu eksplorasi sebelum mengunci solusi. Namun di tahap akhir, SA murni masih lambat memoles detail beban tanpa 2-Opt.'
                  : 'Pendinginan terlalu cepat membuat suhu anjlok dalam 3 langkah. SA segera berhenti menerima langkah mundur dan rawan terjebak di local optimum.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
