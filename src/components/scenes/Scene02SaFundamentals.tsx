import { useEffect, useMemo, useRef, useState } from 'react';
import { QUIZZES } from '../../data/content';
import { metropolisProbability } from '../../lib/algorithms/hybridSa2Opt';
import { formatId, mulberry32 } from '../../lib/algorithms/rng';
import {
  MetropolisDecisionCanvas,
  SaMountainPhysicsCanvas,
} from '../ui/AnimatedCanvases';
import { CoachMissionBanner, CoachTarget } from '../ui/GuidedCoach';
import { QuizCard } from '../ui/QuizCard';
import { Tex } from '../ui/Tex';

interface Scene02Props {
  beat?: number;
}

export function Scene02SaFundamentals({ beat = 0 }: Scene02Props) {
  const [coolingMode, setCoolingMode] = useState<'gradual' | 'fast'>('gradual');
  const [replayKey, setReplayKey] = useState(1);

  // Beat 1: Eksperimen Nyata Metropolis + Animasi Pendinginan Langsung di Kurva
  const [temperature, setTemperature] = useState(10);
  const [deltaE, setDeltaE] = useState(4);
  const [rollSeed, setRollSeed] = useState(1);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [rollSeq, setRollSeq] = useState(0);
  const [coolingAnim, setCoolingAnim] = useState(false);
  const [coachStage, setCoachStage] = useState<0 | 1 | 2 | 3>(0);
  const coolTimerRef = useRef<number | null>(null);

  const prob = metropolisProbability(deltaE, temperature);

  const stopCoolingAnim = () => {
    if (coolTimerRef.current !== null) {
      window.clearInterval(coolTimerRef.current);
      coolTimerRef.current = null;
    }
    setCoolingAnim(false);
  };

  useEffect(() => () => stopCoolingAnim(), []);

  const handleTestDecision = () => {
    stopCoolingAnim();
    const rng = mulberry32(rollSeed * 7919 + Math.round(temperature * 10) + Math.round(deltaE * 13));
    const r = Math.round(rng() * 1000) / 1000;
    setLastRoll(r);
    setRollSeed((s) => s + 1);
    setRollSeq((q) => q + 1);
    if (coachStage === 0) setCoachStage(1);
  };

  const handleSimulateCooling = () => {
    stopCoolingAnim();
    setCoolingAnim(true);
    setTemperature(25);
    setLastRoll(null);
    let currentT = 25;
    coolTimerRef.current = window.setInterval(() => {
      currentT = Math.max(0.8, Number((currentT * 0.87).toFixed(1)));
      setTemperature(currentT);
      if (currentT <= 1.0) {
        stopCoolingAnim();
        setCoachStage(3);
      }
    }, 150);
  };

  const curvePath = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 50; i++) {
      const tVal = 0.5 + (i / 50) * 24.5;
      const pVal = metropolisProbability(deltaE, tVal);
      const x = 44 + (tVal / 25) * 258;
      const y = 122 - pVal * 92;
      pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return pts.join(' ');
  }, [deltaE]);

  const activeX = 44 + (Math.min(25, temperature) / 25) * 258;
  const activeY = 122 - prob * 92;

  return (
    <div className="flex flex-col gap-5">
      {/* BAGIAN 1: Animasi Fisika 60fps Pegunungan SA + Termometer Suhu */}
      {beat === 0 && (
        <div className="grid grid-cols-1 items-center gap-5 lg:grid-cols-[1fr_1.15fr]">
          <div className="flex flex-col gap-3.5">
            <h2 className="font-display text-2xl font-extrabold leading-tight sm:text-3xl">
              Simulated Annealing:{' '}
              <span style={{ color: 'var(--sa-heat)' }}>panas untuk melompat</span>, dingin untuk
              mengunci.
            </h2>

            <div className="studio-panel flex flex-col gap-2 p-3.5 text-sm">
              <p className="m-0 leading-relaxed text-[var(--ink-secondary)]">
                <strong className="text-[var(--ink-primary)]">Bayangkan mencari lembah terdalam</strong>{' '}
                (Makespan terkecil = 9 detik):
              </p>
              <ul className="m-0 flex list-disc flex-col gap-1.5 pl-4 text-xs leading-relaxed text-[var(--ink-secondary)]">
                <li>
                  <strong className="text-[var(--ink-primary)]">Algoritma Biasa (Greedy):</strong>{' '}
                  hanya mau menerima langkah yang lebih baik → langsung{' '}
                  <strong style={{ color: 'var(--sa-heat)' }}>terjebak di lembah sempit 14 dtk</strong>.
                </li>
                <li>
                  <strong style={{ color: 'var(--sa-heat)' }}>Simulated Annealing (SA):</strong>{' '}
                  terinspirasi pendinginan logam (Kirkpatrick dkk., 1983). Saat{' '}
                  <strong className="text-[var(--ink-primary)]">Suhu T masih Panas</strong>, SA berani
                  melompat naik sementara demi menemukan lembah terdalam 9 dtk!
                </li>
                <li>
                  <strong style={{ color: 'var(--opt-cyan)' }}>Pendinginan (T = r × T):</strong>{' '}
                  suhu diturunkan pelan-pelan agar di akhir pencarian SA tidak melompat lagi dan
                  mengunci hasil terbaik.
                </li>
              </ul>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 pb-6">
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
                    ? 'Uji Pendinginan Terlalu Cepat (r = 0,55)'
                    : 'Kembalikan Pendinginan Bertahap (r = 0,90)'}
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
            <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-[var(--ink-secondary)]">
              <span>Bola abu-abu: Greedy biasa (macet di 14 dtk)</span>
              <span className="font-bold" style={{ color: 'var(--sa-heat)' }}>
                Bola oranye: SA ({coolingMode === 'gradual' ? 'Pelan → Lolos ke 9 dtk!' : 'Terlalu cepat → Beku di 14 dtk!'})
              </span>
            </div>
          </div>
        </div>
      )}

      {/* BAGIAN 2: Eksperimen Nyata Keputusan SA (Meteran Zona Hijau/Merah + Animasi Pendinginan di Grafik) */}
      {beat === 1 && (
        <div className="flex flex-col gap-3">
          <CoachMissionBanner
            stepLabel={`Eksperimen SA · Langkah ${Math.min(coachStage + 1, 3)} / 3`}
            instruction={
              coachStage === 0
                ? 'Langkah 1: Saat Suhu Panas (T=10), Zona Hijau lebar (67%). Klik "Uji Keputusan SA" untuk melempar jarum acak dan lihat apakah jadwal lebih lambat (+4s) diterima!'
                : coachStage === 1
                  ? 'Langkah 2: Sekarang klik "Akhir: Dingin (T=1)"! Lihat Zona Hijau langsung menyusut habis jadi 1,8% karena SA mulai ketat.'
                  : 'Langkah 3: Klik "▶ Simulasikan Pendinginan" di kanan untuk menonton titik kuning meluncur dari Panas (kanan) ke Dingin (kiri) sambil Zona Hijau mengecil!'
            }
            completed={coachStage === 3}
            doneMessage="Sekarang jelas kan! Makin panas Suhu T → Zona Hijau makin lebar (berani eksplorasi). Makin dingin → Zona Hijau habis (mengunci jawaban terbaik)."
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.22fr_1fr]">
            {/* Kiri: Animasi Meteran Zona Hijau/Merah + Kontrol Nyata */}
            <div className="studio-panel flex flex-col gap-3 p-4">
              <MetropolisDecisionCanvas
                temperature={temperature}
                deltaE={deltaE}
                prob={prob}
                rollValue={lastRoll}
                rollSeq={rollSeq}
              />

              <div className="flex flex-wrap items-center gap-2 pt-1 pb-5">
                <CoachTarget active={coachStage === 0} label="Klik 1: Lempar jarum!" position="bottom">
                  <button
                    type="button"
                    onClick={handleTestDecision}
                    className="btn-studio btn-studio-gold text-xs"
                  >
                    Uji Keputusan SA (Lempar Jarum)
                  </button>
                </CoachTarget>

                <button
                  type="button"
                  onClick={() => {
                    stopCoolingAnim();
                    setTemperature(10);
                    setDeltaE(4);
                  }}
                  className="btn-studio !min-h-[38px] text-xs"
                  style={{ borderColor: 'var(--sa-heat)', color: 'var(--sa-heat)' }}
                >
                  Awal: Panas (T=10)
                </button>

                <CoachTarget active={coachStage === 1} label="Klik 2: Coba dingin!" position="bottom">
                  <button
                    type="button"
                    onClick={() => {
                      stopCoolingAnim();
                      setTemperature(1);
                      setDeltaE(4);
                      if (coachStage <= 1) setCoachStage(2);
                    }}
                    className="btn-studio !min-h-[38px] text-xs"
                    style={{ borderColor: 'var(--opt-cyan)', color: 'var(--opt-cyan)' }}
                  >
                    Akhir: Dingin (T=1)
                  </button>
                </CoachTarget>
              </div>

              <div className="grid grid-cols-1 gap-3 border-t border-[var(--border-line)] pt-2.5 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-xs font-bold">
                  <span className="flex justify-between">
                    <span>Atur Suhu T (Dingin ↔ Panas)</span>
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
                    onChange={(e) => {
                      stopCoolingAnim();
                      setTemperature(Number(e.target.value));
                    }}
                    className="studio-range w-full"
                  />
                </label>

                <label className="flex flex-col gap-1 text-xs font-bold">
                  <span className="flex justify-between">
                    <span>Seberapa Lebih Lambat (ΔE)</span>
                    <span className="font-mono-tabular">+{formatId(deltaE, 1)} dtk</span>
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
            </div>

            {/* Kanan: Grafik Kurva + Panduan Cara Baca Eksplisit + Tombol Animasi Pendinginan */}
            <div className="studio-panel flex flex-col justify-between gap-3 p-4 pb-8">
              <div className="flex flex-col gap-2">
                <div className="text-xs font-bold text-[var(--ink-primary)]">
                  Cara Baca Grafik Peluang SA (Metropolis)
                </div>
                <div className="rounded-xl bg-[var(--bg-inset)] px-3 py-2 text-xs leading-relaxed text-[var(--ink-secondary)]">
                  <strong style={{ color: 'var(--sa-heat)' }}>Makin ke KANAN</strong> = Suhu T makin
                  panas → garis <strong className="text-[var(--ink-primary)]">NAIK</strong> (peluang
                  terima besar).{' '}
                  <strong style={{ color: 'var(--opt-cyan)' }}>Makin ke KIRI</strong> = Suhu T makin
                  dingin → garis <strong className="text-[var(--ink-primary)]">TURUN ke 0%</strong>{' '}
                  (SA hanya terima jadwal lebih cepat).
                </div>

                <svg
                  viewBox="0 0 320 148"
                  className="w-full rounded-xl border border-[var(--border-line)] bg-[var(--bg-stage)]"
                  role="img"
                  aria-label="Grafik hubungan Suhu T dengan peluang menerima jadwal lebih buruk"
                >
                  {/* Garis grid horizontal */}
                  <line x1="44" y1="30" x2="304" y2="30" stroke="var(--border-line)" strokeDasharray="3 3" />
                  <line x1="44" y1="76" x2="304" y2="76" stroke="var(--border-line)" strokeDasharray="3 3" />
                  <line x1="44" y1="30" x2="44" y2="122" stroke="var(--border-strong)" />
                  <line x1="44" y1="122" x2="304" y2="122" stroke="var(--border-strong)" />

                  {/* Label sumbu-Y */}
                  <text x="38" y="34" textAnchor="end" fontSize="10" fill="var(--ink-secondary)">
                    100%
                  </text>
                  <text x="38" y="80" textAnchor="end" fontSize="10" fill="var(--ink-secondary)">
                    50%
                  </text>
                  <text x="38" y="125" textAnchor="end" fontSize="10" fill="var(--ink-secondary)">
                    0%
                  </text>

                  {/* Label sumbu-X awam */}
                  <text x="48" y="139" textAnchor="start" fontSize="9.5" fontWeight="700" fill="var(--opt-cyan)">
                    ← Dingin (T=1)
                  </text>
                  <text x="174" y="139" textAnchor="middle" fontSize="9.5" fill="var(--ink-secondary)">
                    Suhu T
                  </text>
                  <text x="302" y="139" textAnchor="end" fontSize="9.5" fontWeight="700" fill="var(--sa-heat)">
                    Panas (T=25) →
                  </text>

                  {/* Kurva eksponensial */}
                  <path
                    d={curvePath}
                    fill="none"
                    stroke="var(--sa-heat)"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />

                  {/* Proyeksi titik aktif */}
                  <line
                    x1={activeX}
                    y1={activeY}
                    x2={activeX}
                    y2="122"
                    stroke="var(--coach-gold)"
                    strokeDasharray="3 3"
                  />
                  <line
                    x1="44"
                    y1={activeY}
                    x2={activeX}
                    y2={activeY}
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

                  {/* Anotasi angka langsung di grafik */}
                  <text
                    x={Math.min(200, Math.max(50, activeX - 42))}
                    y={Math.max(16, activeY - 14)}
                    fontSize="10.5"
                    fontWeight="800"
                    fontFamily="var(--font-mono)"
                    fill="var(--gold-text)"
                  >
                    T={formatId(temperature, 1)} → {formatId(prob * 100, 1)}%
                  </text>
                </svg>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between rounded-xl border border-[var(--border-line)] bg-[var(--bg-inset)] px-3 py-1.5 text-xs">
                  <span className="font-semibold text-[var(--ink-secondary)]">Rumus singkat:</span>
                  <Tex math="P = e^{-\Delta E / T},\;\; T_{\text{baru}} = 0{,}9 \cdot T" />
                </div>

                <CoachTarget
                  active={coachStage === 2}
                  label="Klik 3: Tonton pendinginan!"
                  position="bottom"
                  className="w-full"
                >
                  <button
                    type="button"
                    onClick={handleSimulateCooling}
                    disabled={coolingAnim}
                    className="btn-studio btn-studio-cyan w-full text-xs"
                  >
                    {coolingAnim
                      ? `Sedang Mendingin... T = ${formatId(temperature, 1)}`
                      : '▶ Simulasikan Pendinginan (T: 25 → 1)'}
                  </button>
                </CoachTarget>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BAGIAN 3: Cek Paham 2/3 di sela materi sebelum masuk Episode 3 (2-Opt) */}
      {beat === 2 && <QuizCard quiz={QUIZZES.q2} nextLabel="Lanjut ke Episode 3: Dasar 2-Opt →" />}
    </div>
  );
}
