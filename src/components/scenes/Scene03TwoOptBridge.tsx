import { useMemo, useState } from 'react';
import { QUIZZES } from '../../data/content';
import {
  decodePermutationToAssignment,
  evaluateSchedule,
  MINI_DISPATCH_PROBLEM,
  MORPH_SWAP_INITIAL,
  MORPH_SWAP_PROBLEM,
} from '../../lib/algorithms/cloudModel';
import { formatId } from '../../lib/algorithms/rng';
import {
  apply2OptReverse,
  CLASSIC_4_CITIES,
  CLASSIC_4_CROSSED_TOUR,
  countCrossings,
  evaluate2OptInequality,
  findBest2OptMove,
  NETWORK_8_CITIES,
  NETWORK_8_CROSSED_TOUR,
  tourDistance,
} from '../../lib/algorithms/tsp2Opt';
import { TwoOptMorphCanvas } from '../ui/AnimatedCanvases';
import { CoachMissionBanner, CoachTarget } from '../ui/GuidedCoach';
import { QuizCard } from '../ui/QuizCard';
import { Tex } from '../ui/Tex';
import { VmRackGantt } from '../ui/VmRackGantt';

interface Scene03Props {
  beat?: number;
  exploreAll?: boolean;
}

const INITIAL_PERM = [5, 0, 1, 2, 3, 4];

export function Scene03TwoOptBridge({ beat = 0, exploreAll = false }: Scene03Props) {
  const [mapMode, setMapMode] = useState<'4-classic' | '8-network'>('4-classic');
  const [tour4, setTour4] = useState<number[]>([...CLASSIC_4_CROSSED_TOUR]);
  const [tour8, setTour8] = useState<number[]>([...NETWORK_8_CROSSED_TOUR]);

  const [cloudMode, setCloudMode] = useState<'pairwise' | 'permutation'>('pairwise');
  const [swapped, setSwapped] = useState(false);
  const [scanFlash, setScanFlash] = useState(0);
  const [permReversed, setPermReversed] = useState(false);

  const cities = mapMode === '4-classic' ? CLASSIC_4_CITIES : NETWORK_8_CITIES;
  const activeTour = mapMode === '4-classic' ? tour4 : tour8;
  const setActiveTour = mapMode === '4-classic' ? setTour4 : setTour8;

  const crossings = useMemo(() => countCrossings(cities, activeTour), [cities, activeTour]);
  const bestMove = useMemo(() => findBest2OptMove(cities, activeTour), [cities, activeTour]);
  const currentDist = useMemo(() => tourDistance(cities, activeTour), [cities, activeTour]);
  const classicEq = useMemo(
    () => evaluate2OptInequality(CLASSIC_4_CITIES, 0, 3, 2, 1),
    [],
  );

  const handleApply2Opt = () => {
    if (!bestMove) return;
    setActiveTour(apply2OptReverse(activeTour, bestMove.edgeAIndex + 1, bestMove.edgeBIndex));
  };

  const handleResetMap = () => {
    if (mapMode === '4-classic') setTour4([...CLASSIC_4_CROSSED_TOUR]);
    else setTour8([...NETWORK_8_CROSSED_TOUR]);
  };

  const morphAssignment = useMemo(() => {
    const base = [...MORPH_SWAP_INITIAL];
    if (swapped) {
      const tmp = base[0];
      base[0] = base[1];
      base[1] = tmp;
    }
    return base;
  }, [swapped]);

  const morphMetrics = useMemo(
    () => evaluateSchedule(MORPH_SWAP_PROBLEM, morphAssignment),
    [morphAssignment],
  );

  const activePerm = useMemo(
    () => (permReversed ? apply2OptReverse(INITIAL_PERM, 1, 4) : INITIAL_PERM),
    [permReversed],
  );
  const permAssignment = useMemo(
    () => decodePermutationToAssignment(MINI_DISPATCH_PROBLEM, activePerm),
    [activePerm],
  );
  const permMetrics = useMemo(
    () => evaluateSchedule(MINI_DISPATCH_PROBLEM, permAssignment),
    [permAssignment],
  );

  const showBeat0 = exploreAll || beat === 0;
  const showBeat1 = exploreAll || beat === 1;
  const showBeat2 = exploreAll || beat === 2;

  return (
    <div className="flex flex-col gap-6">
      {/* BEAT 0: Animasi 60fps 2-Opt Wire Uncrosser */}
      {showBeat0 && (
        <div className="flex flex-col gap-3.5">
          <CoachMissionBanner
            stepLabel="Pemandu · Coba 2-Opt"
            instruction="Perhatikan dua kabel merah yang menyilang X. Klik tombol 'Putus & Luruskan' atau klik langsung gambar kanvasnya untuk menonton animasi 2-Opt!"
            completed={crossings === 0}
            doneMessage="Berhasil! Kabel langsung berayun lurus, jarak turun dari 922 ke 704. Kamu juga bisa klik 'Coba Peta 8 Simpul' untuk latihan lebih seru."
          />

          <div className="grid grid-cols-1 items-center gap-5 lg:grid-cols-[1.05fr_1fr]">
            <div className="flex flex-col gap-3">
              <h2 className="font-display text-2xl font-extrabold leading-tight sm:text-3xl">
                2-Opt:{' '}
                <span style={{ color: 'var(--opt-cyan)' }}>putus jalur silang</span>, sambung lurus!
              </h2>
              <p className="m-0 text-sm leading-relaxed text-[var(--ink-secondary)]">
                Diperkenalkan Croes (1958): jika dua jalur saling menyilang membentuk huruf{' '}
                <strong className="text-[var(--ink-primary)]">X</strong>, memutus lalu menyambungnya
                ulang secara sejajar otomatis memperpendek total rute.
              </p>

              <div className="studio-panel p-3.5">
                <div className="mb-1 text-xs font-bold" style={{ color: 'var(--opt-cyan)' }}>
                  Syarat 2-Opt (Persamaan 1 Paper)
                </div>
                <Tex math="d(A,B) + d(C,D) < d(A,D) + d(B,C)" block />
                <div className="font-mono-tabular mt-1 text-xs font-semibold text-[var(--ink-secondary)]">
                  Kasus 4 simpul: lurus{' '}
                  <strong style={{ color: 'var(--ok-mint)' }}>
                    {formatId(classicEq.swappedPairDist, 0)}
                  </strong>{' '}
                  &lt; silang{' '}
                  <strong style={{ color: 'var(--sa-heat)' }}>
                    {formatId(classicEq.currentPairDist, 0)}
                  </strong>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <CoachTarget active={bestMove !== null} label="Klik untuk meluruskan!" position="bottom">
                  <button
                    type="button"
                    onClick={handleApply2Opt}
                    disabled={!bestMove}
                    className="btn-studio btn-studio-cyan text-xs"
                  >
                    {bestMove ? 'Putus & Luruskan Jalur (2-Opt)' : 'Semua Jalur Sudah Lurus!'}
                  </button>
                </CoachTarget>

                <button type="button" onClick={handleResetMap} className="btn-studio text-xs">
                  Ulangi Kusut
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setMapMode((m) => (m === '4-classic' ? '8-network' : '4-classic'))
                  }
                  className="btn-studio text-xs"
                >
                  {mapMode === '4-classic' ? 'Coba Peta 8 Simpul' : 'Kembali 4 Simpul'}
                </button>
              </div>
            </div>

            <div className="studio-panel flex flex-col gap-2 p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-[var(--ink-secondary)]">
                  Animasi Peta Jalur (Bisa Diklik)
                </span>
                <span
                  className="font-mono-tabular rounded-lg border px-2 py-0.5 text-xs font-bold"
                  style={{
                    borderColor: crossings > 0 ? 'var(--sa-heat)' : 'var(--ok-mint)',
                    backgroundColor:
                      crossings > 0 ? 'var(--sa-heat-soft)' : 'var(--ok-mint-soft)',
                    color: crossings > 0 ? 'var(--sa-heat)' : 'var(--ok-mint)',
                  }}
                >
                  {crossings > 0 ? `${crossings} Silangan · ` : 'Lurus · '}
                  Total: {formatId(currentDist, 0)}
                </span>
              </div>

              <TwoOptMorphCanvas
                cities={cities}
                tour={activeTour}
                highlightEdgeIndices={
                  bestMove ? [bestMove.edgeAIndex, bestMove.edgeBIndex] : null
                }
                isOptimal={crossings === 0}
                onCanvasClick={handleApply2Opt}
              />

              <div className="font-mono-tabular flex items-center justify-between text-xs text-[var(--ink-secondary)]">
                <span>Urutan: [{activeTour.map((id) => cities[id].label).join(' → ')}]</span>
                <span>{crossings > 0 ? 'Klik kanvas atau tombol biru' : 'Optimal lokal tercapai'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BEAT 1: Jembatan Adaptasi 2-Opt ke Cloud VM */}
      {showBeat1 && (
        <div className="flex flex-col gap-3.5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
                Jembatan ke Cloud: 2-Opt pada{' '}
                <span style={{ color: 'var(--opt-cyan)' }}>Server VM</span>
              </h2>
              <p className="mt-1 text-sm text-[var(--ink-secondary)]">
                Dari rute kota di paper, ini dua cara mengadaptasi 2-Opt ke Cloud Task Scheduling:
              </p>
            </div>

            <div className="inline-flex rounded-xl border border-[var(--border-line)] bg-[var(--bg-inset)] p-0.5">
              <button
                type="button"
                onClick={() => setCloudMode('pairwise')}
                className="min-h-[38px] rounded-lg px-3 py-1 text-xs font-bold"
                style={{
                  backgroundColor:
                    cloudMode === 'pairwise' ? 'var(--opt-cyan)' : 'transparent',
                  color: cloudMode === 'pairwise' ? 'var(--on-cyan)' : 'var(--ink-primary)',
                }}
              >
                1. Tukar 2 Task (Pairwise)
              </button>
              <button
                type="button"
                onClick={() => setCloudMode('permutation')}
                className="min-h-[38px] rounded-lg px-3 py-1 text-xs font-bold"
                style={{
                  backgroundColor:
                    cloudMode === 'permutation' ? 'var(--opt-cyan)' : 'transparent',
                  color: cloudMode === 'permutation' ? 'var(--on-cyan)' : 'var(--ink-primary)',
                }}
              >
                2. Balik Urutan + Decoder
              </button>
            </div>
          </div>

          <CoachMissionBanner
            stepLabel="Pemandu · Jembatan Cloud"
            instruction={
              cloudMode === 'pairwise'
                ? 'Klik "Jalankan 2-Opt Swap (T1 ↔ T2)" untuk melihat sinar pemindai 2-Opt menukar dua task dan mendinginkan VM 2 seketika!'
                : 'Klik "Balik Segmen Tengah" untuk melihat pembalikan urutan task ala TSP mengubah pembagian VM.'
            }
            completed={cloudMode === 'pairwise' ? swapped : permReversed}
            doneMessage={
              cloudMode === 'pairwise'
                ? 'Makespan langsung anjlok dari 15 s ke 10 s (-33%) hanya dalam 1 kali 2-Opt Swap! Kamu juga bisa intip tab "2. Balik Urutan + Decoder".'
                : 'Urutan task terbalik dan decoder EFT langsung menghitung penempatan baru.'
            }
          />

          {cloudMode === 'pairwise' ? (
            <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-[1.35fr_1fr]">
              <VmRackGantt
                problem={MORPH_SWAP_PROBLEM}
                assignment={morphAssignment}
                scaleMax={16}
                highlightTasks={[0, 1]}
                optimalBound={10}
                scanFlashKey={scanFlash}
                title={
                  swapped
                    ? 'Sesudah 2-Opt Swap (T1 ↔ T2): Server Seimbang di 10 s!'
                    : 'Sebelum 2-Opt: Server VM 2 Panas di 15 s'
                }
              />

              <div className="studio-panel flex flex-col gap-3 p-4 pb-10">
                <div className="text-xs font-bold" style={{ color: 'var(--opt-cyan)' }}>
                  Adaptasi A · Pairwise 2-Opt Swap antar-VM
                </div>
                <p className="m-0 text-sm leading-relaxed text-[var(--ink-secondary)]">
                  Tukar 1 task dari server panas (T2 di VM 2: 7 s) dengan 1 task di server lain (T1
                  di VM 1: 6 s). Di server pasangannya, keduanya sama-sama selesai dalam 2 s!
                </p>
                <div className="font-mono-tabular rounded-xl bg-[var(--bg-inset)] p-2.5 text-xs">
                  Makespan: <strong>15 s</strong> →{' '}
                  <strong style={{ color: 'var(--ok-mint)' }}>
                    {formatId(morphMetrics.makespan, 0)} s
                  </strong>{' '}
                  {swapped && '(turun 33% dalam 1 tukar!)'}
                </div>
                <CoachTarget active={!swapped} label="Klik untuk tukar!" position="bottom" className="w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setSwapped((s) => !s);
                      setScanFlash((k) => k + 1);
                    }}
                    className={`btn-studio w-full text-xs ${
                      swapped ? '' : 'btn-studio-cyan'
                    }`}
                  >
                    {swapped
                      ? 'Kembalikan ke Kondisi Awal (15 s)'
                      : 'Jalankan 2-Opt Swap (T1 ↔ T2)'}
                  </button>
                </CoachTarget>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-[1.35fr_1fr]">
              <VmRackGantt
                problem={MINI_DISPATCH_PROBLEM}
                assignment={permAssignment}
                scaleMax={15}
                optimalBound={9}
                scanFlashKey={scanFlash}
                title={`Hasil Decoder EFT (Makespan ${formatId(permMetrics.makespan, 0)} s)`}
              />

              <div className="studio-panel flex flex-col gap-3 p-4 pb-10">
                <div className="text-xs font-bold" style={{ color: 'var(--opt-cyan)' }}>
                  Adaptasi B · Permutasi Urutan + Reverse Segmen
                </div>
                <p className="m-0 text-sm leading-relaxed text-[var(--ink-secondary)]">
                  Persis struktur TSP: simpan solusi sebagai urutan prioritas task, balik satu
                  segmen dengan 2-Opt, lalu masukkan tiap task ke VM yang paling cepat selesai (EFT).
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  {activePerm.map((tId, idx) => {
                    const inSlice = idx >= 1 && idx <= 4;
                    return (
                      <span
                        key={tId}
                        className="font-mono-tabular rounded-lg border px-2.5 py-1 text-xs font-bold"
                        style={{
                          borderColor: inSlice ? 'var(--opt-cyan)' : 'var(--border-line)',
                          backgroundColor: inSlice
                            ? 'var(--opt-cyan-soft)'
                            : 'var(--bg-inset)',
                          color: inSlice ? 'var(--opt-cyan)' : 'var(--ink-primary)',
                        }}
                      >
                        T{tId + 1}
                      </span>
                    );
                  })}
                </div>
                <CoachTarget active={!permReversed} label="Klik balik segmen!" position="bottom" className="w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setPermReversed((r) => !r);
                      setScanFlash((k) => k + 1);
                    }}
                    className="btn-studio btn-studio-cyan w-full text-xs"
                  >
                    {permReversed
                      ? 'Kembalikan Urutan Awal'
                      : 'Balik Segmen Tengah [2..5] (2-Opt Reverse)'}
                  </button>
                </CoachTarget>
              </div>
            </div>
          )}
        </div>
      )}

      {/* BEAT 2: Quiz 1/2 */}
      {showBeat2 && <QuizCard quiz={QUIZZES.q1} />}
    </div>
  );
}
