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
import { CloudFactoryCanvas } from '../ui/AnimatedCanvases';
import { CoachMissionBanner, CoachTarget } from '../ui/GuidedCoach';
import { VmRackGantt } from '../ui/VmRackGantt';

interface Scene01Props {
  beat?: number;
  exploreAll?: boolean;
}

export function Scene01ProblemWhy({ beat = 0, exploreAll = false }: Scene01Props) {
  const setBeat = usePresentationStore((s) => s.setBeat);
  const toggleAutoPlay = usePresentationStore((s) => s.toggleAutoPlay);

  const [assignment, setAssignment] = useState<number[]>(() => [...MINI_DISPATCH_INITIAL]);
  const [moves, setMoves] = useState(0);

  const optimal = useMemo(() => bruteForceOptimal(MINI_DISPATCH_PROBLEM), []);
  const currentMetrics = useMemo(
    () => evaluateSchedule(MINI_DISPATCH_PROBLEM, assignment),
    [assignment],
  );
  const reachedOptimal = currentMetrics.makespan <= optimal.metrics.makespan;

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
    setMoves((m) => Math.max(1, m));
  };

  const showBeat0 = exploreAll || beat === 0;
  const showBeat1 = exploreAll || beat === 1;
  const showBeat2 = exploreAll || beat === 2;

  const gocj1000 = KELOMPOK4_VERIFIED_BASELINES[1];
  const nasa750 = KELOMPOK4_VERIFIED_BASELINES[3];

  // Tentukan task mana di VM bottleneck yang ditunjuk pemandu pada Beat 1
  const coachTaskId = useMemo(() => {
    if (reachedOptimal) return null;
    if (assignment[1] === 1) return 1; // T2 masih di VM 2 yang panas
    if (assignment[4] === 0) return 4; // T5 bisa dipindah ke VM 3
    return null;
  }, [assignment, reachedOptimal]);

  return (
    <div className="flex flex-col gap-6">
      {/* BEAT 0: Film Pembuka Cloud Factory 60fps */}
      {showBeat0 && (
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[1.1fr_1.05fr]">
          <div className="flex flex-col gap-4">
            <h1 className="font-display text-3xl font-extrabold leading-[1.08] sm:text-4xl lg:text-[44px]">
              Hybrid{' '}
              <span style={{ color: 'var(--sa-heat)' }}>SA</span> +{' '}
              <span style={{ color: 'var(--opt-cyan)' }}>2-Opt</span> untuk Penjadwalan Cloud
            </h1>
            <p className="m-0 max-w-xl text-sm leading-relaxed text-[var(--ink-secondary)] sm:text-base">
              Tonton animasi di kanan: <strong className="text-[var(--ink-primary)]">task cloud</strong>{' '}
              mengalir masuk ke server <strong className="text-[var(--ink-primary)]">DC Jakarta & Surabaya</strong>{' '}
              dengan kecepatan berbeda. Tugas algoritma penjadwalan adalah membagi beban seimbang agar{' '}
              <strong className="text-[var(--ink-primary)]">Makespan</strong> (waktu selesai VM terakhir)
              sekecil mungkin.
            </p>

            <CoachMissionBanner
              stepLabel="Pemandu · Mulai"
              instruction="Kamu bisa klik 'Putar Otomatis' di bawah seperti menonton video, atau langsung klik tombol emas untuk mencoba sendiri."
            />

            {!exploreAll && (
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <CoachTarget active label="Mulai dari sini!" position="bottom">
                  <button
                    type="button"
                    onClick={() => setBeat(1)}
                    className="btn-studio btn-studio-gold"
                  >
                    Coba Atur Server Sendiri (30 dtk)
                  </button>
                </CoachTarget>
                <button
                  type="button"
                  onClick={toggleAutoPlay}
                  className="btn-studio"
                >
                  ▶ Tonton Mode Video
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <CloudFactoryCanvas />

            <div className="studio-panel p-3.5">
              <div className="mb-2 text-xs font-bold text-[var(--ink-secondary)]">
                Kelompok 4 · SOKA Kelas C · Institut Teknologi Sepuluh Nopember
              </div>
              <ul className="m-0 grid list-none grid-cols-1 gap-x-6 gap-y-1.5 p-0 text-xs sm:grid-cols-2">
                {TEAM_MEMBERS.map((m) => (
                  <li key={m.nrp} className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold text-[var(--ink-primary)]">{m.name}</span>
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

      {/* BEAT 1: Mini-Game Dispatch dengan Pemandu Kursor */}
      {showBeat1 && (
        <div className="flex flex-col gap-3.5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
                Tantangan 30 Detik:{' '}
                <span style={{ color: 'var(--sa-heat)' }}>Dinginkan Server Berasap!</span>
              </h2>
              <p className="mt-1 text-sm text-[var(--ink-secondary)]">
                Server VM 2 sedang kepenuhan (14 detik). Pindahkan task dengan mengklik baloknya
                untuk mencapai target optimal <strong>{optimal.metrics.makespan} detik</strong>.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={resetMiniGame} className="btn-studio text-xs">
                Reset (14 s)
              </button>
              <CoachTarget
                active={!reachedOptimal && moves >= 2}
                label="Lihat kunci optimal"
                position="top"
              >
                <button
                  type="button"
                  onClick={applyOptimal}
                  className="btn-studio btn-studio-cyan text-xs"
                >
                  Lihat Optimal ({optimal.metrics.makespan} s)
                </button>
              </CoachTarget>
            </div>
          </div>

          <CoachMissionBanner
            stepLabel={moves === 0 ? 'Langkah 1 / 2' : 'Langkah 2 / 2'}
            instruction={
              moves === 0
                ? 'Arahkan kursor ke balok T2 (5s) di rak VM 2 yang berasap merah, lalu klik untuk memindahkannya.'
                : 'Bagus! Beban langsung berubah. Coba pindahkan task lain atau klik "Lihat Optimal (9 s)" untuk membandingkan.'
            }
            completed={reachedOptimal}
            doneMessage="Mantap! Semua server seimbang di 9 detik (optimal mutlak dari 729 kombinasi). Bayangkan kalau 1.000 task di 50 VM: mustahil manual!"
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.45fr_1fr]">
            <VmRackGantt
              problem={MINI_DISPATCH_PROBLEM}
              assignment={assignment}
              scaleMax={16}
              interactive
              onTaskClick={handleTaskClick}
              coachTaskId={coachTaskId}
              coachTaskLabel="Klik paket ini!"
              optimalBound={optimal.metrics.makespan}
              title={`Papan Dispatch Langsung (${moves} perpindahan)`}
            />

            <div className="studio-panel flex flex-col justify-between gap-3 p-4">
              <div>
                <div className="mb-2 text-xs font-bold text-[var(--ink-secondary)]">
                  Durasi Eksekusi per VM (Matriks ETC, detik)
                </div>
                <div className="overflow-x-auto">
                  <table className="font-mono-tabular w-full border-collapse text-center text-xs">
                    <thead>
                      <tr className="border-b border-[var(--border-line)]">
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
                        <tr key={task.id} className="border-b border-[var(--border-line)]/60">
                          <td className="py-1.5 text-left font-bold">T{tIdx + 1}</td>
                          {MINI_DISPATCH_PROBLEM.etc[tIdx].map((sec, vIdx) => {
                            const active = assignment[tIdx] === vIdx;
                            return (
                              <td
                                key={vIdx}
                                className="rounded py-1.5 font-semibold"
                                style={{
                                  backgroundColor: active ? 'var(--coach-gold)' : 'transparent',
                                  color: active ? 'var(--coach-ink)' : 'var(--ink-secondary)',
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

              <div className="font-mono-tabular rounded-xl bg-[var(--bg-inset)] px-3 py-2 text-xs text-[var(--ink-secondary)]">
                Makespan sekarang:{' '}
                <strong
                  style={{
                    color: reachedOptimal ? 'var(--ok-mint)' : 'var(--sa-heat)',
                  }}
                >
                  {currentMetrics.makespan} s
                </strong>{' '}
                · Optimal Brute-Force: <strong className="text-[var(--ok-mint)]">9 s</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BEAT 2: Kenapa Butuh Hybrid? (Bukti Data Riil Kelompok 4) */}
      {showBeat2 && (
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
              Kenapa <span style={{ color: 'var(--sa-heat)' }}>SA Murni</span> butuh partner{' '}
              <span style={{ color: 'var(--opt-cyan)' }}>2-Opt</span>?
            </h2>
            <p className="mt-1 text-sm text-[var(--ink-secondary)]">
              Dari eksperimen CloudSim Kelompok 4 minggu lalu, SA murni sudah kuat di GoCJ, tetapi
              masih menyisakan dua celah nyata yang tepat ditutup oleh 2-Opt.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="studio-panel p-3.5">
              <div className="text-xs font-bold text-[var(--ink-secondary)]">
                Heuristik (Sufferage)
              </div>
              <p className="mt-1 text-sm font-semibold">
                Sangat cepat sekali jalan, tetapi kaku karena keputusan awal tidak pernah direvisi.
              </p>
            </div>
            <div className="studio-panel p-3.5" style={{ borderColor: 'var(--sa-heat)' }}>
              <div className="text-xs font-bold" style={{ color: 'var(--sa-heat)' }}>
                Metaheuristik (JAYA & SA)
              </div>
              <p className="mt-1 text-sm font-semibold">
                Eksplorasi luas. SA menang di 14/15 kasus GoCJ kita, tetapi langkah akhirnya acak &
                kurang rapi.
              </p>
            </div>
            <div className="studio-panel p-3.5" style={{ borderColor: 'var(--opt-cyan)' }}>
              <div className="text-xs font-bold" style={{ color: 'var(--opt-cyan)' }}>
                Local Search (2-Opt)
              </div>
              <p className="mt-1 text-sm font-semibold">
                Cepat memoles beban timpang antar-VM, tetapi mudah terjebak lokal jika berjalan
                sendirian.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="studio-panel flex flex-col gap-2.5 p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-base font-extrabold">{gocj1000.name}</span>
                <span
                  className="font-mono-tabular rounded-md px-2 py-0.5 text-xs font-bold"
                  style={{
                    backgroundColor: 'var(--sa-heat-soft)',
                    color: 'var(--sa-heat)',
                  }}
                >
                  DOI SA = 0,43
                </span>
              </div>
              <div className="flex flex-col gap-2 text-xs">
                {gocj1000.rows.slice(0, 3).map((row) => (
                  <div
                    key={row.algorithm}
                    className="grid grid-cols-[110px_1fr_82px] items-center gap-2"
                  >
                    <span className="font-semibold">{row.algorithm}</span>
                    <div className="h-4 overflow-hidden rounded-full bg-[var(--bg-inset)]">
                      <div
                        className="h-full rounded-full transition-all duration-500"
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
                Pada 1000 task, SA murni masih memiliki simpangan ±51,7 s dan ketimpangan antar-VM
                (DOI 0,43).
              </p>
            </div>

            <div className="studio-panel flex flex-col gap-2.5 p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-base font-extrabold">{nasa750.name}</span>
                <span
                  className="font-mono-tabular rounded-md px-2 py-0.5 text-xs font-bold"
                  style={{
                    backgroundColor: 'var(--sa-heat-soft)',
                    color: 'var(--sa-heat)',
                  }}
                >
                  Std SA ±66.963 s
                </span>
              </div>
              <div className="flex flex-col gap-2 text-xs">
                {nasa750.rows.slice(0, 3).map((row) => (
                  <div
                    key={row.algorithm}
                    className="grid grid-cols-[110px_1fr_88px] items-center gap-2"
                  >
                    <span className="font-semibold">{row.algorithm}</span>
                    <div className="h-4 overflow-hidden rounded-full bg-[var(--bg-inset)]">
                      <div
                        className="h-full rounded-full transition-all duration-500"
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
                Di beban NASA, hasil SA murni naik-turun antar-seed (terburuk 1.075.200 s). Polesan
                2-Opt membantu menstabilkan hasil.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
