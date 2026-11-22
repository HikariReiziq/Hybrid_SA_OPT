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
import { QuizCard } from '../ui/QuizCard';
import { Tex } from '../ui/Tex';
import { VmRackGantt } from '../ui/VmRackGantt';

interface Scene03Props {
  beat?: number;
  exploreAll?: boolean;
}

const INITIAL_PERM = [5, 0, 1, 2, 3, 4];

export function Scene03TwoOptBridge({ beat = 0, exploreAll = false }: Scene03Props) {
  // Beat 0: Mini Metro TSP Crossing Untangle
  const [mapMode, setMapMode] = useState<'4-classic' | '8-network'>('4-classic');
  const [tour4, setTour4] = useState<number[]>([...CLASSIC_4_CROSSED_TOUR]);
  const [tour8, setTour8] = useState<number[]>([...NETWORK_8_CROSSED_TOUR]);

  // Beat 1: Jembatan Cloud Scheduling (2 adaptasi)
  const [cloudMode, setCloudMode] = useState<'pairwise' | 'permutation'>('pairwise');
  const [swapped, setSwapped] = useState(false);
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

  // Cloud Pairwise Swap assignment
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

  // Cloud Permutation 2-Opt Reverse + EFT Decoder
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
      {/* BEAT 0: Interactive Mini Metro Crossing Untangle */}
      {showBeat0 && (
        <div className="grid grid-cols-1 items-center gap-5 lg:grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col gap-3">
            <h2 className="font-display text-2xl font-extrabold leading-tight sm:text-3xl">
              2-Opt: <span className="marker-highlight">putus dua jalur silang</span>, sambung lurus!
            </h2>
            <p className="m-0 text-sm leading-relaxed text-[var(--ink-secondary)]">
              Idenya super sederhana (Croes, 1958): jika dua jalur saling menyilang membentuk huruf{' '}
              <strong className="text-[var(--ink-primary)]">X</strong>, memutus keduanya lalu
              menyambung ulang secara sejajar pasti memperpendek total rute.
            </p>

            <div className="transit-card p-3.5">
              <div className="font-mono-tabular mb-1 text-xs font-bold uppercase text-[var(--opt-rail)]">
                Syarat 2-Opt (Pers. 1 Paper)
              </div>
              <Tex math="d(A,B) + d(C,D) < d(A,D) + d(B,C)" block />
              <div className="font-mono-tabular mt-1 text-xs font-semibold text-[var(--ink-secondary)]">
                Kasus 4 simpul: lurus{' '}
                <strong className="text-[var(--ok-balance)]">
                  {formatId(classicEq.swappedPairDist, 0)}
                </strong>{' '}
                &lt; silang{' '}
                <strong className="text-[var(--sa-heat)]">
                  {formatId(classicEq.currentPairDist, 0)}
                </strong>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleApply2Opt}
                disabled={!bestMove}
                className="btn-transit btn-transit-rail text-xs"
              >
                {bestMove ? 'Putus & Luruskan Jalur (2-Opt)' : 'Semua Jalur Sudah Lurus!'}
              </button>
              <button type="button" onClick={handleResetMap} className="btn-transit text-xs">
                Ulangi Kusut
              </button>
              <button
                type="button"
                onClick={() =>
                  setMapMode((m) => (m === '4-classic' ? '8-network' : '4-classic'))
                }
                className="btn-transit text-xs"
              >
                {mapMode === '4-classic' ? 'Coba Peta 8 Simpul' : 'Kembali 4 Simpul'}
              </button>
            </div>
          </div>

          {/* Peta SVG ala Mini Metro yang bisa diklik langsung */}
          <div className="transit-card flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono-tabular text-xs font-bold uppercase text-[var(--ink-secondary)]">
                Peta Jalur Interaktif (Klik Jalur Merah!)
              </span>
              <span
                className="font-mono-tabular rounded-md border px-2 py-0.5 text-xs font-bold"
                style={{
                  borderColor: crossings > 0 ? 'var(--sa-heat)' : 'var(--ok-balance)',
                  backgroundColor:
                    crossings > 0 ? 'var(--sa-heat-soft)' : 'var(--ok-balance-soft)',
                  color: crossings > 0 ? 'var(--sa-heat)' : 'var(--ok-balance)',
                }}
              >
                {crossings > 0 ? `${crossings} Silangan · ` : 'Lurus · '}
                Total: {formatId(currentDist, 0)}
              </span>
            </div>

            <svg
              viewBox="0 0 400 260"
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]"
              role="img"
              aria-label="Peta rute interaktif 2-Opt; klik jalur bersilangan untuk meluruskan"
            >
              {/* Render setiap sisi tour */}
              {activeTour.map((fromId, idx) => {
                const toId = activeTour[(idx + 1) % activeTour.length];
                const p1 = cities[fromId];
                const p2 = cities[toId];
                const isTargetEdge =
                  bestMove !== null &&
                  (idx === bestMove.edgeAIndex || idx === bestMove.edgeBIndex);

                return (
                  <g key={`${fromId}-${toId}`}>
                    <line
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke={
                        isTargetEdge
                          ? 'var(--sa-heat)'
                          : crossings === 0
                            ? 'var(--ok-balance)'
                            : 'var(--opt-rail)'
                      }
                      strokeWidth={isTargetEdge ? 7 : 5}
                      strokeLinecap="round"
                      style={{ cursor: isTargetEdge ? 'pointer' : 'default' }}
                      onClick={isTargetEdge ? handleApply2Opt : undefined}
                    />
                  </g>
                );
              })}

              {/* Simpul stasiun */}
              {cities.map((c) => (
                <g key={c.id}>
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r="16"
                    fill="var(--bg-elevated)"
                    stroke={crossings === 0 ? 'var(--ok-balance)' : 'var(--border-ink)'}
                    strokeWidth="4"
                  />
                  <text
                    x={c.x}
                    y={c.y + 4.5}
                    textAnchor="middle"
                    fill="var(--ink-primary)"
                    fontSize="13"
                    fontWeight="800"
                    fontFamily="var(--font-mono)"
                  >
                    {c.label}
                  </text>
                </g>
              ))}
            </svg>

            <div className="font-mono-tabular flex items-center justify-between text-xs text-[var(--ink-secondary)]">
              <span>Urutan rute: [{activeTour.map((id) => cities[id].label).join(' → ')}]</span>
              <span>{crossings > 0 ? 'Klik garis merah!' : 'Optimal lokal tercapai'}</span>
            </div>
          </div>
        </div>
      )}

      {/* BEAT 1: Jembatan Adaptasi 2-Opt ke Cloud Task Scheduling */}
      {showBeat1 && (
        <div className="flex flex-col gap-3.5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
                Jembatan ke Cloud: bagaimana 2-Opt bekerja di{' '}
                <span className="marker-highlight">VM Server</span>?
              </h2>
              <p className="mt-1 text-sm text-[var(--ink-secondary)]">
                Karena paper aslinya berbasis rute (TSP), di Cloud Scheduling ada dua adaptasi utama
                yang mudah dipahami:
              </p>
            </div>

            <div className="inline-flex rounded-xl border-2 border-[var(--border-ink)] bg-[var(--bg-muted)] p-0.5">
              <button
                type="button"
                onClick={() => setCloudMode('pairwise')}
                className="min-h-[38px] rounded-lg px-3 py-1 text-xs font-bold"
                style={{
                  backgroundColor:
                    cloudMode === 'pairwise' ? 'var(--opt-rail)' : 'transparent',
                  color: cloudMode === 'pairwise' ? '#ffffff' : 'var(--ink-primary)',
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
                    cloudMode === 'permutation' ? 'var(--opt-rail)' : 'transparent',
                  color: cloudMode === 'permutation' ? '#ffffff' : 'var(--ink-primary)',
                }}
              >
                2. Balik Urutan + Decoder
              </button>
            </div>
          </div>

          {cloudMode === 'pairwise' ? (
            <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-[1.35fr_1fr]">
              <VmRackGantt
                problem={MORPH_SWAP_PROBLEM}
                assignment={morphAssignment}
                scaleMax={16}
                highlightTasks={[0, 1]}
                optimalBound={10}
                title={
                  swapped
                    ? 'Sesudah 2-Opt Swap (T1 ↔ T2): Makespan 10 s!'
                    : 'Sebelum 2-Opt: VM 2 Bottleneck di 15 s'
                }
              />

              <div className="transit-card flex flex-col gap-3 p-4">
                <div className="font-mono-tabular text-xs font-bold uppercase text-[var(--opt-rail)]">
                  Adaptasi A · Pairwise 2-Opt Swap antar-VM
                </div>
                <p className="m-0 text-sm leading-relaxed text-[var(--ink-secondary)]">
                  Pilih 1 task dari VM <strong className="text-[var(--sa-heat)]">bottleneck</strong>{' '}
                  (T2 di VM2: 7 s) dan tukar langsung dengan task di VM lain (T1 di VM1: 6 s). Di VM
                  barunya, keduanya jauh lebih cocok (masing-masing jadi 2 s)!
                </p>
                <div className="font-mono-tabular rounded-lg bg-[var(--bg-surface)] p-2.5 text-xs">
                  Makespan: <strong>15 s</strong> →{' '}
                  <strong className="text-[var(--ok-balance)]">
                    {formatId(morphMetrics.makespan, 0)} s
                  </strong>{' '}
                  {swapped && '(turun 33% dalam 1 kali tukar!)'}
                </div>
                <button
                  type="button"
                  onClick={() => setSwapped((s) => !s)}
                  className={`btn-transit w-full text-xs ${
                    swapped ? '' : 'btn-transit-rail'
                  }`}
                >
                  {swapped
                    ? 'Kembalikan ke Kondisi Awal (15 s)'
                    : 'Jalankan 2-Opt Swap (T1 ↔ T2)'}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-[1.35fr_1fr]">
              <VmRackGantt
                problem={MINI_DISPATCH_PROBLEM}
                assignment={permAssignment}
                scaleMax={15}
                optimalBound={9}
                title={`Hasil Decoder EFT (Makespan ${formatId(permMetrics.makespan, 0)} s)`}
              />

              <div className="transit-card flex flex-col gap-3 p-4">
                <div className="font-mono-tabular text-xs font-bold uppercase text-[var(--opt-rail)]">
                  Adaptasi B · Permutasi Urutan + Reverse Segmen
                </div>
                <p className="m-0 text-sm leading-relaxed text-[var(--ink-secondary)]">
                  Setia 100% pada struktur TSP: simpan solusi sebagai{' '}
                  <strong className="text-[var(--ink-primary)]">urutan prioritas task</strong>,
                  balik satu segmen dengan 2-Opt, lalu alokasikan tiap task ke VM yang selesai
                  paling cepat (EFT).
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  {activePerm.map((tId, idx) => {
                    const inSlice = idx >= 1 && idx <= 4;
                    return (
                      <span
                        key={tId}
                        className="font-mono-tabular rounded-md border-2 px-2 py-1 text-xs font-bold"
                        style={{
                          borderColor: inSlice ? 'var(--opt-rail)' : 'var(--border-subtle)',
                          backgroundColor: inSlice
                            ? 'var(--opt-rail-soft)'
                            : 'var(--bg-surface)',
                        }}
                      >
                        T{tId + 1}
                      </span>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => setPermReversed((r) => !r)}
                  className="btn-transit btn-transit-rail w-full text-xs"
                >
                  {permReversed
                    ? 'Kembalikan Urutan Awal'
                    : 'Balik Segmen Tengah [2..5] (2-Opt Reverse)'}
                </button>
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
