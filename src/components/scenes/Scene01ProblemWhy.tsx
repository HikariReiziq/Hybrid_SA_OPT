import { useMemo, useState } from 'react';
import { QUIZZES, TEAM_MEMBERS } from '../../data/content';
import { bruteForceOptimal } from '../../lib/algorithms/baselines';
import {
  evaluateSchedule,
  MINI_DISPATCH_INITIAL,
  MINI_DISPATCH_PROBLEM,
} from '../../lib/algorithms/cloudModel';
import { usePresentationStore } from '../../store/presentationStore';
import { CloudFactoryCanvas } from '../ui/AnimatedCanvases';
import { CoachMissionBanner, CoachTarget } from '../ui/GuidedCoach';
import { QuizCard } from '../ui/QuizCard';
import { VmRackGantt } from '../ui/VmRackGantt';

interface Scene01Props {
  beat?: number;
}

export function Scene01ProblemWhy({ beat = 0 }: Scene01Props) {
  const setBeat = usePresentationStore((s) => s.setBeat);

  // Beat 0: Toggle animasi Bagi Asal (14 dtk macet) vs Bagi Cerdas (9 dtk rata)
  const [factoryMode, setFactoryMode] = useState<'naive' | 'smart'>('naive');
  const [sawSmartMode, setSawSmartMode] = useState(false);

  // Beat 1: Eksperimen papan dispatch 6 Task x 3 VM
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

  // Pastikan hanya 1 panah pemandu aktif di Beat 1
  const coachTaskId = useMemo(() => {
    if (reachedOptimal || moves >= 2) return null;
    if (assignment[1] === 1 && currentMetrics.bottleneckVm === 1) return 1;
    const hotTask = assignment.findIndex((vmIdx) => vmIdx === currentMetrics.bottleneckVm);
    return hotTask >= 0 ? hotTask : null;
  }, [assignment, currentMetrics.bottleneckVm, moves, reachedOptimal]);

  return (
    <div className="flex flex-col gap-5">
      {/* BAGIAN 1: Fundamental Masalah Cloud & Arti Makespan */}
      {beat === 0 && (
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[1.08fr_1.05fr]">
          <div className="flex flex-col gap-3.5">
            <h1 className="font-display text-3xl font-extrabold leading-[1.08] sm:text-4xl lg:text-[42px]">
              Hybrid <span style={{ color: 'var(--sa-heat)' }}>SA</span> +{' '}
              <span style={{ color: 'var(--opt-cyan)' }}>2-Opt</span> untuk Penjadwalan Cloud
            </h1>

            <div className="studio-panel flex flex-col gap-2 p-3.5 text-sm">
              <div className="text-xs font-bold" style={{ color: 'var(--opt-cyan)' }}>
                2 Istilah Dasar yang Wajib Paham Dulu:
              </div>
              <p className="m-0 leading-relaxed text-[var(--ink-secondary)]">
                <strong className="text-[var(--ink-primary)]">1. Cloud Task Scheduling:</strong>{' '}
                membagi banyak tugas ke beberapa server (VM) yang kecepatannya berbeda-beda.
              </p>
              <p className="m-0 leading-relaxed text-[var(--ink-secondary)]">
                <strong className="text-[var(--ink-primary)]">2. Makespan:</strong> waktu sampai{' '}
                <strong style={{ color: 'var(--sa-heat)' }}>server terakhir selesai bekerja</strong>.
                Jika VM 2 macet di 14 dtk, semua sistem tetap harus menunggu 14 dtk!
              </p>
            </div>

            <CoachMissionBanner
              stepLabel="Pemandu · Bandingkan Animasi"
              instruction="Lihat animasi kanan: saat dibagi asal, VM 2 macet merah (14 dtk). Klik tombol biru untuk melihat perbedaannya saat dibagi cerdas!"
              completed={sawSmartMode}
              doneMessage="Kelihatan bedanya! Pembagian cerdas membuat ketiga server selesai hampir bersamaan di 9 detik (-36% lebih cepat). Lanjut coba bagi sendiri!"
            />

            <div className="flex flex-wrap items-center gap-2.5 pt-1 pb-6">
              <button
                type="button"
                onClick={() => setFactoryMode('naive')}
                className={`btn-studio text-xs ${factoryMode === 'naive' ? 'btn-studio-heat' : ''}`}
              >
                Bagi Asal (Macet 14s)
              </button>

              <CoachTarget active={!sawSmartMode} label="Klik lihat bedanya!" position="bottom">
                <button
                  type="button"
                  onClick={() => {
                    setFactoryMode('smart');
                    setSawSmartMode(true);
                  }}
                  className={`btn-studio text-xs ${factoryMode === 'smart' ? 'btn-studio-cyan' : ''}`}
                >
                  Bagi Cerdas SA + 2-Opt (9s)
                </button>
              </CoachTarget>

              {sawSmartMode && (
                <CoachTarget active label="Lanjut coba praktik!" position="bottom">
                  <button
                    type="button"
                    onClick={() => setBeat(1)}
                    className="btn-studio btn-studio-gold text-xs"
                  >
                    Coba Atur Server Sendiri →
                  </button>
                </CoachTarget>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <CloudFactoryCanvas mode={factoryMode} />

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

      {/* BAGIAN 2: Eksperimen Dispatch + Kenapa Butuh Hybrid (Bukan 1 Metode Saja) */}
      {beat === 1 && (
        <div className="flex flex-col gap-3.5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
                Coba Sendiri:{' '}
                <span style={{ color: 'var(--sa-heat)' }}>Dinginkan VM 2 yang Macet!</span>
              </h2>
              <p className="mt-1 text-sm text-[var(--ink-secondary)]">
                Klik balok task untuk memindahkannya ke server lain. Target tercepat (optimal):{' '}
                <strong className="text-[var(--ink-primary)]">{optimal.metrics.makespan} detik</strong>.
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
                align="end"
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
            stepLabel={moves < 2 ? 'Langkah 1 / 2' : 'Langkah 2 / 2'}
            instruction={
              coachTaskId !== null
                ? `Klik balok T${coachTaskId + 1} di dalam rak VM ${assignment[coachTaskId] + 1} yang berasap merah untuk mengurangi bebannya.`
                : 'Bagus! Sekarang klik tombol biru "Lihat Optimal (9 s)" di kanan atas untuk melihat pembagian terbaiknya.'
            }
            completed={reachedOptimal}
            doneMessage="Mantap! Untuk 6 task saja ada 729 kombinasi. Di CloudSim tugas kita (1.000 task × 50 VM), kombinasinya tak terhitung sehingga kita wajib pakai algoritma optimasi!"
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.45fr_1fr]">
            <VmRackGantt
              problem={MINI_DISPATCH_PROBLEM}
              assignment={assignment}
              scaleMax={16}
              interactive
              onTaskClick={handleTaskClick}
              coachTaskId={coachTaskId}
              coachTaskLabel={coachTaskId !== null ? `Klik T${coachTaskId + 1} ini!` : 'Klik paket ini!'}
              optimalBound={optimal.metrics.makespan}
              title={`Papan Eksperimen Dispatch (${moves} perpindahan)`}
            />

            <div className="studio-panel flex flex-col justify-between gap-2.5 p-3.5">
              <div className="text-xs font-bold text-[var(--ink-secondary)]">
                Kenapa Minggu Ini Kita Pakai Hybrid (Gabungan)?
              </div>
              <div className="flex flex-col gap-2 text-xs leading-snug">
                <div className="rounded-xl bg-[var(--bg-inset)] p-2.5">
                  <strong className="text-[var(--ink-primary)]">Heuristik (Sufferage):</strong>{' '}
                  <span className="text-[var(--ink-secondary)]">
                    Cepat sekali jalan, tapi kaku karena keputusan awal tidak pernah diperbaiki lagi.
                  </span>
                </div>
                <div
                  className="rounded-xl border p-2.5"
                  style={{ borderColor: 'var(--sa-heat)', backgroundColor: 'var(--sa-heat-soft)' }}
                >
                  <strong style={{ color: 'var(--sa-heat)' }}>Metaheuristik (SA Murni):</strong>{' '}
                  <span className="text-[var(--ink-primary)]">
                    Menang di GoCJ kita, tapi di 1000 task masih timpang (DOI 0,43) & di NASA hasilnya
                    goyang (±66.963 s).
                  </span>
                </div>
                <div
                  className="rounded-xl border p-2.5"
                  style={{ borderColor: 'var(--opt-cyan)', backgroundColor: 'var(--opt-cyan-soft)' }}
                >
                  <strong style={{ color: 'var(--opt-cyan)' }}>Local Search (2-Opt):</strong>{' '}
                  <span className="text-[var(--ink-primary)]">
                    Sangat cepat merapikan beban antar-VM, tapi mudah macet kalau berjalan sendiri.
                  </span>
                </div>
              </div>
              <div className="font-mono-tabular text-xs font-semibold text-[var(--ink-secondary)]">
                Solusi: <strong style={{ color: 'var(--ok-mint)' }}>Gabungkan SA + 2-Opt!</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BAGIAN 3: Cek Paham 1/3 di sela materi sebelum masuk Episode 2 (SA) */}
      {beat === 2 && <QuizCard quiz={QUIZZES.q1} nextLabel="Lanjut ke Episode 2: Dasar SA →" />}
    </div>
  );
}
