import { useMemo, useState } from 'react';
import { TEAM_MEMBERS } from '../../data/content';
import { KELOMPOK4_VERIFIED_BASELINES } from '../../data/kelompok4Baselines';
import { bruteForceOptimal } from '../../lib/algorithms/baselines';
import {
  evaluateSchedule,
  MINI_DISPATCH_INITIAL,
  MINI_DISPATCH_PROBLEM,
} from '../../lib/algorithms/cloudModel';
import { formatId } from '../../lib/algorithms/rng';
import { usePresentationStore } from '../../store/presentationStore';
import { VmRackGantt } from '../ui/VmRackGantt';

interface Scene01Props {
  beat?: number;
  exploreAll?: boolean;
}

export function Scene01ProblemWhy({ beat = 0, exploreAll = false }: Scene01Props) {
  const setBeat = usePresentationStore((s) => s.setBeat);
  const [assignment, setAssignment] = useState<number[]>(() => [...MINI_DISPATCH_INITIAL]);
  const [moves, setMoves] = useState(0);

  const optimal = useMemo(() => bruteForceOptimal(MINI_DISPATCH_PROBLEM), []);
  const currentMetrics = useMemo(
    () => evaluateSchedule(MINI_DISPATCH_PROBLEM, assignment),
    [assignment],
  );

  const handleTaskClick = (taskId: number) => {
    setAssignment((prev) => {
      const next = prev.slice();
      next[taskId] = (next[taskId] + 1) % MINI_DISPATCH_PROBLEM.vms.length;
      return next;
    });
    setMoves((m) => m + 1);
  };

  const resetMiniGame = () => {
    setAssignment([...MINI_DISPATCH_INITIAL]);
    setMoves(0);
  };

  const applyOptimal = () => {
    setAssignment([...optimal.assignment]);
  };

  const showBeat0 = exploreAll || beat === 0;
  const showBeat1 = exploreAll || beat === 1;
  const showBeat2 = exploreAll || beat === 2;

  const gocj1000 = KELOMPOK4_VERIFIED_BASELINES[1];
  const nasa750 = KELOMPOK4_VERIFIED_BASELINES[3];

  return (
    <div className="flex flex-col gap-6">
      {/* BEAT 0: Sampul + Anatomi 2-Rail Mini Metro */}
      {showBeat0 && (
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[1.25fr_1fr]">
          <div className="flex flex-col gap-4">
            <h1 className="font-display text-3xl font-extrabold leading-[1.06] sm:text-4xl lg:text-5xl">
              Hybrid <span className="marker-highlight">SA + 2-Opt</span> untuk Penjadwalan Cloud.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-[var(--ink-secondary)] sm:text-lg">
              Bayangkan <strong className="text-[var(--ink-primary)]">task cloud</strong> sebagai paket
              dan <strong className="text-[var(--ink-primary)]">VM server</strong> (DC Jakarta &
              Surabaya) sebagai jalur kurir dengan kecepatan berbeda. Tujuannya satu: perkecil{' '}
              <strong className="text-[var(--ink-primary)]">Makespan</strong> (waktu selesai VM yang
              paling akhir).
            </p>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <div
                className="transit-card flex flex-col gap-1 p-3.5"
                style={{ borderColor: 'var(--sa-heat)' }}
              >
                <span
                  className="font-mono-tabular text-xs font-bold uppercase"
                  style={{ color: 'var(--sa-heat)' }}
                >
                  Jalur 1 · Simulated Annealing
                </span>
                <p className="m-0 text-sm font-semibold">
                  Menjelajah solusi luas saat suhu panas agar tidak terjebak di hasil tanggung.
                </p>
              </div>
              <div
                className="transit-card flex flex-col gap-1 p-3.5"
                style={{ borderColor: 'var(--opt-rail)' }}
              >
                <span
                  className="font-mono-tabular text-xs font-bold uppercase"
                  style={{ color: 'var(--opt-rail)' }}
                >
                  Jalur 2 · 2-Opt Local Search
                </span>
                <p className="m-0 text-sm font-semibold">
                  Langsung merapikan jalur bersilangan dan menukar beban timpang antar-VM.
                </p>
              </div>
            </div>

            {!exploreAll && (
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setBeat(1)}
                  className="btn-transit btn-transit-signal"
                >
                  Coba Mini-Game Dispatch (30 dtk) →
                </button>
              </div>
            )}
          </div>

          {/* Diagram Peta Jaringan Mini Metro + Identitas Kelompok 4 */}
          <div className="flex flex-col gap-3">
            <div className="transit-card p-4">
              <div className="font-mono-tabular mb-2 text-xs font-bold uppercase text-[var(--ink-secondary)]">
                Alur Kerja Hybrid (Pola LRH)
              </div>
              <svg
                viewBox="0 0 420 190"
                className="w-full"
                role="img"
                aria-label="Diagram alur dua jalur: SA menjelajah lalu 2-Opt merapikan beban VM"
              >
                {/* Rel SA (Heat) */}
                <path
                  d="M 36 52 H 158 C 192 52 192 96 226 96 H 380"
                  fill="none"
                  stroke="var(--sa-heat)"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                {/* Rel 2-Opt (Cobalt) */}
                <path
                  d="M 36 140 H 158 C 192 140 192 96 226 96"
                  fill="none"
                  stroke="var(--opt-rail)"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                {/* Segmen akhir Seimbang (Emerald) */}
                <path
                  d="M 275 96 H 382"
                  fill="none"
                  stroke="var(--ok-balance)"
                  strokeWidth="7"
                  strokeLinecap="round"
                />

                {/* Simpul 1: SA */}
                <circle
                  cx="56"
                  cy="52"
                  r="13"
                  fill="var(--bg-elevated)"
                  stroke="var(--sa-heat)"
                  strokeWidth="5"
                />
                <text
                  x="56"
                  y="27"
                  textAnchor="middle"
                  fill="var(--ink-primary)"
                  fontSize="12"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                >
                  SA (Global)
                </text>

                {/* Simpul 2: 2-Opt */}
                <rect
                  x="43"
                  y="127"
                  width="26"
                  height="26"
                  rx="4"
                  fill="var(--bg-elevated)"
                  stroke="var(--opt-rail)"
                  strokeWidth="5"
                />
                <text
                  x="56"
                  y="174"
                  textAnchor="middle"
                  fill="var(--ink-primary)"
                  fontSize="12"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                >
                  2-Opt (Lokal)
                </text>

                {/* Simpul Gabung: Hybrid */}
                <circle
                  cx="226"
                  cy="96"
                  r="16"
                  fill="var(--focus-signal)"
                  stroke="var(--border-ink)"
                  strokeWidth="4"
                />
                <text
                  x="226"
                  y="66"
                  textAnchor="middle"
                  fill="var(--ink-primary)"
                  fontSize="12"
                  fontWeight="800"
                  fontFamily="var(--font-mono)"
                >
                  HYBRID
                </text>

                {/* Simpul Finis: Jadwal Optimal */}
                <circle
                  cx="364"
                  cy="96"
                  r="14"
                  fill="var(--ok-balance)"
                  stroke="var(--border-ink)"
                  strokeWidth="4"
                />
                <text
                  x="364"
                  y="134"
                  textAnchor="middle"
                  fill="var(--ok-balance)"
                  fontSize="12"
                  fontWeight="800"
                  fontFamily="var(--font-mono)"
                >
                  VM Rata
                </text>
              </svg>
            </div>

            <div className="transit-card p-3.5">
              <div className="font-mono-tabular mb-2 text-xs font-bold uppercase text-[var(--ink-secondary)]">
                Kelompok 4 · SOKA Kelas C · ITS
              </div>
              <ul className="m-0 flex list-none flex-col gap-1 p-0 text-xs">
                {TEAM_MEMBERS.map((m) => (
                  <li key={m.nrp} className="flex items-baseline justify-between gap-3">
                    <span className="font-semibold">{m.name}</span>
                    <span className="font-mono-tabular shrink-0 text-[11px] text-[var(--ink-secondary)]">
                      {m.nrp}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* BEAT 1: Mini-Game Cloud Dispatch (6 Task x 3 VM) */}
      {showBeat1 && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
                Tantangan 30 Detik: <span className="marker-highlight">Dinginkan VM Bottleneck!</span>
              </h2>
              <p className="mt-1 text-sm text-[var(--ink-secondary)]">
                Klik balok task mana saja pada jalur VM di bawah untuk memindahkannya ke VM
                berikutnya. Kejar target optimal <strong>{optimal.metrics.makespan} detik</strong>{' '}
                (dari total 729 kombinasi).
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={resetMiniGame} className="btn-transit text-xs">
                Reset (14 s)
              </button>
              <button
                type="button"
                onClick={applyOptimal}
                className="btn-transit btn-transit-rail text-xs"
              >
                Lihat Optimal ({optimal.metrics.makespan} s)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.45fr_1fr]">
            <VmRackGantt
              problem={MINI_DISPATCH_PROBLEM}
              assignment={assignment}
              scaleMax={16}
              interactive
              onTaskClick={handleTaskClick}
              optimalBound={optimal.metrics.makespan}
              title={`Papan Dispatch Interaktif (${moves} kali pindah)`}
            />

            <div className="transit-card flex flex-col justify-between gap-3 p-3.5">
              <div>
                <div className="font-mono-tabular mb-2 text-xs font-bold uppercase text-[var(--ink-secondary)]">
                  Waktu Eksekusi per VM (Matriks ETC, detik)
                </div>
                <div className="overflow-x-auto">
                  <table className="font-mono-tabular w-full border-collapse text-center text-xs">
                    <thead>
                      <tr className="border-b-2 border-[var(--border-ink)]">
                        <th className="py-1.5 text-left">Task</th>
                        {MINI_DISPATCH_PROBLEM.vms.map((v) => (
                          <th key={v.id} className="py-1.5">
                            {v.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {MINI_DISPATCH_PROBLEM.tasks.map((task, tIdx) => (
                        <tr key={task.id} className="border-b border-[var(--border-subtle)]">
                          <td className="py-1.5 text-left font-bold">T{tIdx + 1}</td>
                          {MINI_DISPATCH_PROBLEM.etc[tIdx].map((sec, vIdx) => {
                            const active = assignment[tIdx] === vIdx;
                            return (
                              <td
                                key={vIdx}
                                className="py-1.5 font-semibold"
                                style={{
                                  backgroundColor: active ? 'var(--focus-signal)' : 'transparent',
                                  color: active
                                    ? 'var(--focus-signal-ink)'
                                    : 'var(--ink-secondary)',
                                  fontWeight: active ? 800 : 500,
                                }}
                              >
                                {sec}s
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div
                role="status"
                aria-live="polite"
                className="rounded-lg border-2 px-3 py-2 text-xs font-semibold"
                style={{
                  borderColor:
                    currentMetrics.makespan <= optimal.metrics.makespan
                      ? 'var(--ok-balance)'
                      : 'var(--border-subtle)',
                  backgroundColor:
                    currentMetrics.makespan <= optimal.metrics.makespan
                      ? 'var(--ok-balance-soft)'
                      : 'var(--bg-surface)',
                }}
              >
                {currentMetrics.makespan <= optimal.metrics.makespan ? (
                  <span style={{ color: 'var(--ok-balance)' }}>
                    Berhasil! Semua rak seimbang di {currentMetrics.makespan} s (optimal mutlak).
                    Bayangkan kalau task-nya 1.000 di 50 VM: kombinasinya 50^1000, mustahil manual!
                  </span>
                ) : (
                  <span>
                    Makespan saat ini <strong>{currentMetrics.makespan} s</strong> (selisih +
                    {currentMetrics.makespan - optimal.metrics.makespan} s dari optimal). Coba
                    pindahkan T2 atau T5!
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BEAT 2: Kenapa Butuh Hybrid? (Data Nyata Kelompok 4) */}
      {showBeat2 && (
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
              Kenapa <span className="marker-highlight">SA Murni</span> masih butuh partner?
            </h2>
            <p className="mt-1 text-sm text-[var(--ink-secondary)]">
              Kilas balik 3 strategi Kelompok 4 plus bukti celah nyata dari hasil CloudSim Plus kita
              minggu lalu.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="transit-card p-3.5">
              <div className="font-mono-tabular text-xs font-bold uppercase text-[var(--ink-secondary)]">
                1 · Heuristik (Sufferage)
              </div>
              <p className="mt-1 text-sm font-semibold">
                Cepat sekali jalan (hitungan ms), tetapi kaku: keputusan awal tidak pernah direvisi.
              </p>
            </div>
            <div
              className="transit-card p-3.5"
              style={{ borderColor: 'var(--sa-heat)' }}
            >
              <div
                className="font-mono-tabular text-xs font-bold uppercase"
                style={{ color: 'var(--sa-heat)' }}
              >
                2 · Metaheuristik (JAYA & SA)
              </div>
              <p className="mt-1 text-sm font-semibold">
                Eksplorasi luas. SA menang di 14/15 kasus GoCJ kita, tetapi polesan akhirnya acak &
                bisa goyang.
              </p>
            </div>
            <div
              className="transit-card p-3.5"
              style={{ borderColor: 'var(--opt-rail)' }}
            >
              <div
                className="font-mono-tabular text-xs font-bold uppercase"
                style={{ color: 'var(--opt-rail)' }}
              >
                3 · Local Search (2-Opt)
              </div>
              <p className="mt-1 text-sm font-semibold">
                Tajam memoles sekitar solusi dengan cepat, tetapi jika sendirian mudah terjebak di
                local optimum.
              </p>
            </div>
          </div>

          {/* Bukti Nyata Celah SA Murni dari summary.csv Kelompok 4 */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="transit-card flex flex-col gap-2 p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-base font-extrabold">{gocj1000.name}</span>
                <span className="font-mono-tabular rounded bg-[var(--sa-heat-soft)] px-2 py-0.5 text-xs font-bold text-[var(--sa-heat)]">
                  DOI SA = 0,43
                </span>
              </div>
              <div className="flex flex-col gap-1.5 text-xs">
                {gocj1000.rows.slice(0, 3).map((row) => (
                  <div key={row.algorithm} className="grid grid-cols-[120px_1fr_82px] items-center gap-2">
                    <span className="font-semibold">{row.algorithm}</span>
                    <div className="h-4 overflow-hidden rounded bg-[var(--bg-muted)]">
                      <div
                        className="h-full rounded"
                        style={{
                          width: `${(row.makespanMean / 3700) * 100}%`,
                          backgroundColor:
                            row.algorithm === 'SA' ? 'var(--sa-heat)' : 'var(--ink-secondary)',
                        }}
                      />
                    </div>
                    <span className="font-mono-tabular text-right font-bold">
                      {formatId(row.makespanMean, 0)} s
                    </span>
                  </div>
                ))}
              </div>
              <p className="m-0 text-xs text-[var(--ink-secondary)]">
                Di 1000 task, SA murni masih menyisakan deviasi ±51,7 s antar-seed dan beban antar-VM
                belum sepenuhnya rata.
              </p>
            </div>

            <div className="transit-card flex flex-col gap-2 p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-base font-extrabold">{nasa750.name}</span>
                <span className="font-mono-tabular rounded bg-[var(--sa-heat-soft)] px-2 py-0.5 text-xs font-bold text-[var(--sa-heat)]">
                  Std SA ±66.963 s
                </span>
              </div>
              <div className="flex flex-col gap-1.5 text-xs">
                {nasa750.rows.slice(0, 3).map((row) => (
                  <div key={row.algorithm} className="grid grid-cols-[120px_1fr_88px] items-center gap-2">
                    <span className="font-semibold">{row.algorithm}</span>
                    <div className="h-4 overflow-hidden rounded bg-[var(--bg-muted)]">
                      <div
                        className="h-full rounded"
                        style={{
                          width: `${(row.makespanMean / 960000) * 100}%`,
                          backgroundColor:
                            row.algorithm === 'SA' ? 'var(--sa-heat)' : 'var(--ink-secondary)',
                        }}
                      />
                    </div>
                    <span className="font-mono-tabular text-right font-bold">
                      {formatId(row.makespanMean, 0)} s
                    </span>
                  </div>
                ))}
              </div>
              <p className="m-0 text-xs text-[var(--ink-secondary)]">
                Pada beban ekstrem NASA, perpindahan acak tunggal SA tidak selalu sempat memoles
                hasil (terburuk 1.075.200 s). Gabungan SA + 2-Opt menutup celah ini.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
