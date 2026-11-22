import { useMemo, useState } from 'react';
import {
  coolTemperature,
  metropolisProbability,
} from '../../lib/algorithms/hybridSa2Opt';
import { formatId, mulberry32 } from '../../lib/algorithms/rng';
import { Tex } from '../ui/Tex';

interface Scene02Props {
  beat?: number;
  exploreAll?: boolean;
}

export function Scene02SaFundamentals({ beat = 0, exploreAll = false }: Scene02Props) {
  const [temperature, setTemperature] = useState(10);
  const [deltaE, setDeltaE] = useState(4);
  const [rollSeed, setRollSeed] = useState(1);
  const [lastRoll, setLastRoll] = useState<number | null>(0.34);
  const [coolingMode, setCoolingMode] = useState<'gradual' | 'fast'>('gradual');

  const prob = metropolisProbability(deltaE, temperature);
  const accepted = lastRoll !== null ? lastRoll < prob : null;

  const handleDiceRoll = () => {
    const rng = mulberry32(rollSeed * 7919 + Math.round(temperature * 10));
    const r = Math.round(rng() * 1000) / 1000;
    setLastRoll(r);
    setRollSeed((s) => s + 1);
  };

  // Kurva P(T) terhadap T dari 0.2 sampai 25 untuk ΔE aktif
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

  // Contoh 3 langkah pendinginan dengan r = 0.9 vs r = 0.55
  const coolingRate = coolingMode === 'gradual' ? 0.9 : 0.55;
  const t1 = coolTemperature(100, coolingRate);
  const t2 = coolTemperature(t1, coolingRate);
  const t3 = coolTemperature(t2, coolingRate);

  const showBeat0 = exploreAll || beat === 0;
  const showBeat1 = exploreAll || beat === 1;

  return (
    <div className="flex flex-col gap-6">
      {/* BEAT 0: Definisi & Intuisi Visual SA (Panas -> Dingin) */}
      {showBeat0 && (
        <div className="grid grid-cols-1 items-center gap-5 lg:grid-cols-[1.15fr_1fr]">
          <div className="flex flex-col gap-3.5">
            <h2 className="font-display text-2xl font-extrabold leading-tight sm:text-3xl">
              Simulated Annealing: <span className="marker-highlight">berani mundur</span> saat
              panas demi lompat dari jebakan.
            </h2>
            <p className="m-0 text-sm leading-relaxed text-[var(--ink-secondary)] sm:text-base">
              Diperkenalkan Kirkpatrick dkk. (1983) dari proses pendinginan logam (
              <strong className="text-[var(--ink-primary)]">metalurgi</strong>). Kalau algoritma
              biasa selalu menolak solusi yang lebih buruk, SA sengaja memberi peluang untuk mundur
              sementara supaya bisa melewati bukit dan menemukan lembah terdalam.
            </p>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <div className="transit-card p-3.5">
                <div className="font-mono-tabular text-xs font-bold uppercase text-[var(--sa-heat)]">
                  1 · Kriteria Metropolis
                </div>
                <Tex math="P = e^{-\Delta E / T}" block className="my-1" />
                <p className="m-0 text-xs text-[var(--ink-secondary)]">
                  Bila beban naik (<Tex math="\Delta E > 0" />), solusi buruk tetap diterima jika
                  angka acak <Tex math="r < P" />.
                </p>
              </div>
              <div className="transit-card p-3.5">
                <div className="font-mono-tabular text-xs font-bold uppercase text-[var(--opt-rail)]">
                  2 · Jadwal Pendinginan
                </div>
                <Tex math="T_{\text{baru}} = r \cdot T_{\text{lama}}" block className="my-1" />
                <p className="m-0 text-xs text-[var(--ink-secondary)]">
                  Di tiap outer loop, suhu diturunkan (misal <Tex math="r = 0{,}9" />). Makin
                  dingin, SA makin fokus mengunci hasil terbaik.
                </p>
              </div>
            </div>
          </div>

          {/* Ilustrasi Lanskap 1D: Kenapa SA Lolos dari Local Optimum */}
          <div className="transit-card flex flex-col gap-2 p-4">
            <div className="font-mono-tabular text-xs font-bold uppercase text-[var(--ink-secondary)]">
              Ilustrasi: Jebakan Local Optimum vs Lompatan SA
            </div>
            <svg
              viewBox="0 0 420 200"
              className="w-full"
              role="img"
              aria-label="Lanskap biaya menunjukkan pencarian biasa terjebak di lembah dangkal sedangkan SA melompat melewati bukit menuju lembah terdalam"
            >
              {/* Kurva lembah */}
              <path
                d="M 16 42 C 58 140 112 142 146 112 C 180 82 214 68 242 96 C 276 130 302 178 342 174 C 378 170 392 98 408 58"
                fill="none"
                stroke="var(--ink-primary)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Garis lompatan SA */}
              <path
                d="M 96 132 Q 198 18 318 164"
                fill="none"
                stroke="var(--sa-heat)"
                strokeWidth="3.5"
                strokeDasharray="7 5"
              />
              <polygon points="322,167 311,164 319,156" fill="var(--sa-heat)" />

              {/* Titik jebakan lokal */}
              <circle
                cx="96"
                cy="132"
                r="9"
                fill="var(--bg-elevated)"
                stroke="var(--ink-secondary)"
                strokeWidth="3.5"
              />
              <text
                x="96"
                y="162"
                textAnchor="middle"
                fill="var(--ink-secondary)"
                fontSize="11.5"
                fontWeight="700"
                fontFamily="var(--font-mono)"
              >
                Local Optimum
              </text>
              <text
                x="96"
                y="177"
                textAnchor="middle"
                fill="var(--ink-secondary)"
                fontSize="10.5"
              >
                (Greedy berhenti di sini)
              </text>

              {/* Label lompatan panas */}
              <rect
                x="148"
                y="22"
                width="138"
                height="24"
                rx="6"
                fill="var(--sa-heat)"
              />
              <text
                x="217"
                y="38"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="11"
                fontWeight="700"
                fontFamily="var(--font-mono)"
              >
                T Panas: Lompat!
              </text>

              {/* Titik Global Optimum */}
              <circle
                cx="332"
                cy="173"
                r="10"
                fill="var(--ok-balance)"
                stroke="var(--border-ink)"
                strokeWidth="3"
              />
              <text
                x="332"
                y="196"
                textAnchor="middle"
                fill="var(--ok-balance)"
                fontSize="11.5"
                fontWeight="800"
                fontFamily="var(--font-mono)"
              >
                Global Optimum
              </text>
            </svg>
          </div>
        </div>
      )}

      {/* BEAT 1: Lab Termostat Metropolis Interaktif + Pendinginan Cepat vs Bertahap */}
      {showBeat1 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="transit-card flex flex-col gap-3.5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono-tabular text-xs font-bold uppercase text-[var(--ink-secondary)]">
                Lab Interaktif: Termostat Metropolis
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setTemperature(10);
                    setDeltaE(4);
                  }}
                  className="font-mono-tabular min-h-[34px] rounded-md border border-[var(--border-ink)] bg-[var(--sa-heat-soft)] px-2.5 py-1 text-xs font-bold text-[var(--sa-heat)]"
                >
                  Panas (T=10)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTemperature(1);
                    setDeltaE(4);
                  }}
                  className="font-mono-tabular min-h-[34px] rounded-md border border-[var(--border-ink)] bg-[var(--opt-rail-soft)] px-2.5 py-1 text-xs font-bold text-[var(--opt-rail)]"
                >
                  Dingin (T=1)
                </button>
              </div>
            </div>

            {/* Slider T dan ΔE */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs font-bold">
                <span className="flex justify-between">
                  <span>Suhu (T)</span>
                  <span className="font-mono-tabular text-[var(--sa-heat)]">
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
                  className="transit-range w-full"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs font-bold">
                <span className="flex justify-between">
                  <span>Kenaikan Beban (ΔE)</span>
                  <span className="font-mono-tabular text-[var(--ink-primary)]">
                    +{formatId(deltaE, 1)} s
                  </span>
                </span>
                <input
                  type="range"
                  min={1}
                  max={15}
                  step={0.5}
                  value={deltaE}
                  onChange={(e) => setDeltaE(Number(e.target.value))}
                  className="transit-range w-full"
                />
              </label>
            </div>

            {/* Kurva P(T) + Hasil Lempar Dadu r */}
            <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[1.25fr_1fr]">
              <svg
                viewBox="0 0 320 132"
                className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]"
                role="img"
                aria-label="Kurva probabilitas penerimaan Metropolis terhadap suhu T"
              >
                <line x1="36" y1="20" x2="36" y2="114" stroke="var(--border-subtle)" />
                <line x1="36" y1="114" x2="306" y2="114" stroke="var(--border-subtle)" />
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
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <line
                  x1={activeX}
                  y1={activeY}
                  x2={activeX}
                  y2="114"
                  stroke="var(--border-ink)"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={activeX}
                  cy={activeY}
                  r="6"
                  fill="var(--focus-signal)"
                  stroke="var(--border-ink)"
                  strokeWidth="2.5"
                />
              </svg>

              <div className="flex flex-col gap-2">
                <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2.5 text-center">
                  <div className="font-mono-tabular text-[11px] font-semibold text-[var(--ink-secondary)]">
                    Peluang Terima Buruk (P)
                  </div>
                  <div className="font-mono-tabular text-2xl font-extrabold text-[var(--sa-heat)]">
                    {formatId(prob * 100, 1)}%
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDiceRoll}
                  className="btn-transit btn-transit-heat w-full text-xs"
                >
                  Lempar Dadu r (0..1)
                </button>

                {lastRoll !== null && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="font-mono-tabular rounded-lg border-2 px-2.5 py-1.5 text-center text-xs font-bold"
                    style={{
                      borderColor: accepted ? 'var(--ok-balance)' : 'var(--sa-heat)',
                      backgroundColor: accepted
                        ? 'var(--ok-balance-soft)'
                        : 'var(--sa-heat-soft)',
                      color: accepted ? 'var(--ok-balance)' : 'var(--sa-heat)',
                    }}
                  >
                    r = {formatId(lastRoll, 2)} {accepted ? '<' : '≥'} P = {formatId(prob, 2)} ·{' '}
                    {accepted ? 'DITERIMA' : 'DITOLAK'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pendinginan Cepat vs Bertahap */}
          <div className="transit-card flex flex-col justify-between gap-3 p-4">
            <div className="flex flex-col gap-2">
              <span className="font-mono-tabular text-xs font-bold uppercase text-[var(--ink-secondary)]">
                Efek Laju Pendinginan (r)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCoolingMode('gradual')}
                  className="min-h-[42px] rounded-lg border-2 px-2.5 py-1.5 text-xs font-bold"
                  style={{
                    borderColor:
                      coolingMode === 'gradual' ? 'var(--ok-balance)' : 'var(--border-subtle)',
                    backgroundColor:
                      coolingMode === 'gradual' ? 'var(--ok-balance-soft)' : 'var(--bg-surface)',
                    color:
                      coolingMode === 'gradual' ? 'var(--ok-balance)' : 'var(--ink-primary)',
                  }}
                >
                  Bertahap (r = 0,90)
                </button>
                <button
                  type="button"
                  onClick={() => setCoolingMode('fast')}
                  className="min-h-[42px] rounded-lg border-2 px-2.5 py-1.5 text-xs font-bold"
                  style={{
                    borderColor:
                      coolingMode === 'fast' ? 'var(--sa-heat)' : 'var(--border-subtle)',
                    backgroundColor:
                      coolingMode === 'fast' ? 'var(--sa-heat-soft)' : 'var(--bg-surface)',
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
                <div key={step.label} className="grid grid-cols-[72px_1fr_54px] items-center gap-2">
                  <span className="font-mono-tabular text-xs font-bold">{step.label}</span>
                  <div className="h-3.5 overflow-hidden rounded-full bg-[var(--bg-muted)]">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${step.val}%`,
                        backgroundColor:
                          step.val > 50 ? 'var(--sa-heat)' : 'var(--opt-rail)',
                      }}
                    />
                  </div>
                  <span className="font-mono-tabular text-right text-xs font-bold">
                    {formatId(step.val, 1)}
                  </span>
                </div>
              ))}
            </div>

            <p className="m-0 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2.5 text-xs leading-relaxed text-[var(--ink-secondary)]">
              {coolingMode === 'gradual' ? (
                <>
                  <strong className="text-[var(--ok-balance)]">Pendinginan bertahap</strong> memberi
                  waktu eksplorasi cukup sebelum mengunci solusi. Kelemahannya: tanpa bantuan local
                  search, tahap akhir SA murni butuh banyak langkah acak untuk merapikan sisa beban.
                </>
              ) : (
                <>
                  <strong className="text-[var(--sa-heat)]">Pendinginan terlalu cepat</strong> bikin
                  suhu langsung anjlok dalam 3 langkah. SA berubah jadi greedy biasa dan cepat
                  terjebak di local optimum.
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
