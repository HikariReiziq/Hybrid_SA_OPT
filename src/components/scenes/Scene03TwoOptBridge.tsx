import { useMemo, useState } from 'react';
import { QUIZZES } from '../../data/content';
import {
  decodePermutationToAssignment,
  evaluateSchedule,
  MINI_DISPATCH_PROBLEM,
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
import { CloudSwapAnimCanvas, TwoOptMorphCanvas } from '../ui/AnimatedCanvases';
import { CoachMissionBanner, CoachTarget } from '../ui/GuidedCoach';
import { QuizCard } from '../ui/QuizCard';
import { Tex } from '../ui/Tex';
import { VmRackGantt } from '../ui/VmRackGantt';

interface Scene03Props {
  beat?: number;
}

const INITIAL_PERM = [5, 0, 1, 2, 3, 4];

export function Scene03TwoOptBridge({ beat = 0 }: Scene03Props) {
  const [mapMode, setMapMode] = useState<'4-classic' | '8-network'>('4-classic');
  const [tour4, setTour4] = useState<number[]>([...CLASSIC_4_CROSSED_TOUR]);
  const [tour8, setTour8] = useState<number[]>([...NETWORK_8_CROSSED_TOUR]);

  const [cloudMode, setCloudMode] = useState<'pairwise' | 'permutation'>('pairwise');
  const [swapped, setSwapped] = useState(false);
  const [permReversed, setPermReversed] = useState(false);
  const [scanFlash, setScanFlash] = useState(0);

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

  return (
    <div className="flex flex-col gap-5">
      {/* BAGIAN 1: Fundamental 2-Opt dari Nol (Kabel Bersilangan X) */}
      {beat === 0 && (
        <div className="flex flex-col gap-3.5">
          <CoachMissionBanner
            stepLabel="Pemandu · Coba 2-Opt"
            instruction="Perhatikan dua kabel oranye yang menyilang huruf X. Klik 'Putus & Luruskan Jalur' atau klik langsung gambar kanvas untuk melihat animasi 2-Opt!"
            completed={crossings === 0}
            doneMessage="Berhasil! Kabel berayun lurus, total jarak turun dari 922 jadi 704 tanpa menambah simpul apa pun. Kamu juga bisa coba Peta 8 Simpul."
          />

          <div className="grid grid-cols-1 items-center gap-5 lg:grid-cols-[1.05fr_1fr]">
            <div className="flex flex-col gap-3">
              <h2 className="font-display text-2xl font-extrabold leading-tight sm:text-3xl">
                2-Opt: <span style={{ color: 'var(--opt-cyan)' }}>putus jalur silang</span>, sambung
                lurus!
              </h2>
              <p className="m-0 text-sm leading-relaxed text-[var(--ink-secondary)]">
                Diperkenalkan Croes (1958) sebagai <strong className="text-[var(--ink-primary)]">Local Search</strong>{' '}
                yang sangat sederhana: kalau ada dua rute yang saling menyilang membentuk huruf{' '}
                <strong className="text-[var(--ink-primary)]">X</strong>, cukup putus keduanya lalu
                sambung sejajar. Hasilnya <strong className="text-[var(--ink-primary)]">pasti lebih pendek</strong>!
              </p>

              <div className="studio-panel p-3.5">
                <div className="mb-1 text-xs font-bold" style={{ color: 'var(--opt-cyan)' }}>
                  Aturan Cek 2-Opt (Persamaan 1 di Paper)
                </div>
                <Tex math="d(A,B) + d(C,D) < d(A,D) + d(B,C)" block />
                <div className="font-mono-tabular mt-1 text-xs font-semibold text-[var(--ink-secondary)]">
                  Artinya: panjang lurus{' '}
                  <strong style={{ color: 'var(--ok-mint)' }}>
                    {formatId(classicEq.swappedPairDist, 0)}
                  </strong>{' '}
                  &lt; panjang silang{' '}
                  <strong style={{ color: 'var(--sa-heat)' }}>
                    {formatId(classicEq.currentPairDist, 0)}
                  </strong>{' '}
                  → langsung ditukar!
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1 pb-6">
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
                <span>{crossings > 0 ? 'Klik kanvas atau tombol biru' : 'Rapi & lebih pendek!'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BAGIAN 2: Animasi 60fps 2-Opt di Server Cloud (Tukar 2 Task Antar-VM) */}
      {beat === 1 && (
        <div className="flex flex-col gap-3.5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
                2-Opt di Server Cloud:{' '}
                <span style={{ color: 'var(--opt-cyan)' }}>Tukar 2 Task Antar-VM!</span>
              </h2>
              <p className="mt-1 text-sm text-[var(--ink-secondary)]">
                Kalau di peta kota 2-Opt menukar 2 jalur, di Cloud Scheduling 2-Opt menukar{' '}
                <strong className="text-[var(--ink-primary)]">2 task di server yang salah tempat</strong>.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCloudMode((m) => (m === 'pairwise' ? 'permutation' : 'pairwise'))}
              className="btn-studio !min-h-[38px] text-xs"
            >
              {cloudMode === 'pairwise'
                ? 'Intip Variasi 2: Balik Urutan Antrean'
                : '← Kembali ke Animasi Tukar 2 Task'}
            </button>
          </div>

          <CoachMissionBanner
            stepLabel="Pemandu · Animasi 2-Opt Cloud"
            instruction={
              cloudMode === 'pairwise'
                ? 'Tonton animasinya: klik "Jalankan 2-Opt Swap (T1 ↔ T2)" di kanan untuk melihat balok T1 dan T2 terbang bertukar server dan mendinginkan VM 2!'
                : 'Klik "Balik Segmen Tengah" untuk melihat cara kedua (ala urutan TSP): membalik urutan prioritas task lalu memasukkannya ke VM tercepat.'
            }
            completed={cloudMode === 'pairwise' ? swapped : permReversed}
            doneMessage={
              cloudMode === 'pairwise'
                ? 'Langsung kelihatan! Hanya dalam 1 kali tukar, T1 (6s → 2s) dan T2 (7s → 2s) pindah ke server yang pas, sehingga Makespan anjlok dari 15 dtk ke 10 dtk (-33%)!'
                : 'Urutan prioritas task dibalik dan decoder EFT otomatis menghitung pembagian VM yang lebih rata.'
            }
          />

          {cloudMode === 'pairwise' ? (
            <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-[1.35fr_1fr]">
              <CloudSwapAnimCanvas swapped={swapped} />

              <div className="studio-panel flex flex-col gap-3 p-4 pb-10">
                <div className="text-xs font-bold" style={{ color: 'var(--opt-cyan)' }}>
                  Kenapa 1 Kali Tukar Bisa Memangkas 33%?
                </div>
                <ul className="m-0 flex list-disc flex-col gap-1.5 pl-4 text-xs leading-relaxed text-[var(--ink-secondary)]">
                  <li>
                    <strong className="text-[var(--ink-primary)]">Kondisi Awal (15 dtk):</strong> T1
                    butuh 6s di VM 1, dan T2 butuh 7s di VM 2 (keduanya tidak cocok di VM itu).
                  </li>
                  <li>
                    <strong className="text-[var(--ink-primary)]">Aksi 2-Opt Swap:</strong> tukar
                    T1 ↔ T2 antar-VM. Di server pasangannya, keduanya selesai hanya dalam{' '}
                    <strong style={{ color: 'var(--ok-mint)' }}>2 detik</strong>!
                  </li>
                </ul>
                <div className="font-mono-tabular rounded-xl bg-[var(--bg-inset)] p-2.5 text-xs">
                  Makespan: <strong>15 dtk</strong> →{' '}
                  <strong style={{ color: swapped ? 'var(--ok-mint)' : 'var(--sa-heat)' }}>
                    {swapped ? '10 dtk (Turun 33%!)' : '15 dtk (Belum ditukar)'}
                  </strong>
                </div>
                <CoachTarget active={!swapped} label="Klik untuk tukar!" position="bottom" className="w-full">
                  <button
                    type="button"
                    onClick={() => setSwapped((s) => !s)}
                    className={`btn-studio w-full text-xs ${swapped ? '' : 'btn-studio-cyan'}`}
                  >
                    {swapped
                      ? 'Kembalikan ke Kondisi Awal (15 dtk)'
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
                title={`Variasi 2 · Hasil Decoder EFT (Makespan ${formatId(permMetrics.makespan, 0)} s)`}
              />

              <div className="studio-panel flex flex-col gap-3 p-4 pb-10">
                <div className="text-xs font-bold" style={{ color: 'var(--opt-cyan)' }}>
                  Variasi 2 · Balik Urutan Prioritas Task (Ala TSP)
                </div>
                <p className="m-0 text-xs leading-relaxed text-[var(--ink-secondary)]">
                  Solusi disimpan sebagai antrean urutan task. 2-Opt membalik potongan tengah antrean,
                  lalu tiap task otomatis dimasukkan ke VM yang paling cepat selesai (EFT).
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
                          backgroundColor: inSlice ? 'var(--opt-cyan-soft)' : 'var(--bg-inset)',
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

      {/* BAGIAN 3: Cek Paham 3/3 di sela materi sebelum masuk Episode 4 (Hybrid Live) */}
      {beat === 2 && <QuizCard quiz={QUIZZES.q3} nextLabel="Lanjut ke Episode 4: Hybrid Live →" />}
    </div>
  );
}
