import { type ChangeEvent, useEffect, useState } from 'react';
import {
  type CloudSimHybridDataset,
  validateCloudSimHybridJson,
} from '../../data/cloudsimSchema';
import { FAIR_CHECKLIST, QUIZZES, REFERENCES } from '../../data/content';
import { KELOMPOK4_VERIFIED_BASELINES } from '../../data/kelompok4Baselines';
import { formatId } from '../../lib/algorithms/rng';
import { usePresentationStore } from '../../store/presentationStore';
import { QuizCard } from '../ui/QuizCard';

interface Scene05Props {
  beat?: number;
  exploreAll?: boolean;
}

type ImportState =
  | { status: 'loading' }
  | { status: 'placeholder'; dataset: CloudSimHybridDataset }
  | { status: 'loaded'; dataset: CloudSimHybridDataset }
  | { status: 'error'; message: string };

export function Scene05CompareClosing({ beat = 0, exploreAll = false }: Scene05Props) {
  const setViewMode = usePresentationStore((s) => s.setViewMode);
  const quizzes = usePresentationStore((s) => s.quizzes);

  const [scenarioId, setScenarioId] = useState(KELOMPOK4_VERIFIED_BASELINES[0].id);
  const [checkedIds, setCheckedIds] = useState<string[]>(['ablation', 'budget']);
  const [importState, setImportState] = useState<ImportState>({ status: 'loading' });

  // Memuat file bawaan public/data/cloudsim-hybrid.json (menghormati base path GitHub Pages)
  const loadBundledJson = async () => {
    setImportState({ status: 'loading' });
    try {
      const url = `${import.meta.env.BASE_URL}data/cloudsim-hybrid.json`;
      const resp = await fetch(url);
      if (!resp.ok) {
        setImportState({
          status: 'error',
          message: `Gagal memuat file data bawaan (HTTP ${resp.status}). Anda tetap bisa mengunggah JSON lokal.`,
        });
        return;
      }
      const raw: unknown = await resp.json();
      const validated = validateCloudSimHybridJson(raw);
      if (!validated.ok) {
        setImportState({ status: 'error', message: validated.error });
        return;
      }
      setImportState({
        status: validated.data.isPlaceholder ? 'placeholder' : 'loaded',
        dataset: validated.data,
      });
    } catch {
      setImportState({
        status: 'error',
        message:
          'Tidak dapat membaca file data CloudSim bawaan. Gunakan tombol "Impor JSON CloudSim" untuk memuat hasil tim.',
      });
    }
  };

  useEffect(() => {
    void loadBundledJson();
  }, []);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportState({ status: 'loading' });
    try {
      const text = await file.text();
      const parsed: unknown = JSON.parse(text);
      const validated = validateCloudSimHybridJson(parsed);
      if (!validated.ok) {
        setImportState({ status: 'error', message: validated.error });
      } else {
        setImportState({
          status: validated.data.isPlaceholder ? 'placeholder' : 'loaded',
          dataset: validated.data,
        });
      }
    } catch {
      setImportState({
        status: 'error',
        message:
          'Format JSON tidak valid. Pastikan file merupakan JSON hasil CloudSim yang sesuai skema.',
      });
    } finally {
      e.target.value = '';
    }
  };

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const activeBaseline =
    KELOMPOK4_VERIFIED_BASELINES.find((s) => s.id === scenarioId) ??
    KELOMPOK4_VERIFIED_BASELINES[0];

  const loadedScenario =
    importState.status === 'loaded' || importState.status === 'placeholder'
      ? importState.dataset.scenarios.find((s) => s.id === scenarioId)
      : undefined;

  const hybridRows = loadedScenario?.results.filter(
    (r) => r.algorithm === 'SA+2Opt' || r.algorithm === 'DJAYA+2Opt',
  );

  // Gabungkan baris untuk tampilan perbandingan
  const displayRows = [
    ...(hybridRows ?? []).map((r) => ({
      key: r.algorithm,
      label: `${r.algorithm} (CloudSim Tim)`,
      makespanMean: r.makespanMean,
      makespanStd: r.makespanStd,
      aruMean: r.aruMean,
      doiMean: r.doiMean,
      runtimeMsMean: r.runtimeMsMean,
      isHybrid: true,
    })),
    ...activeBaseline.rows.map((r) => ({
      key: r.algorithm,
      label: r.label,
      makespanMean: r.makespanMean,
      makespanStd: r.makespanStd,
      aruMean: r.aruMean,
      doiMean: r.doiMean,
      runtimeMsMean: r.runtimeMsMean,
      isHybrid: false,
    })),
  ];

  const maxMakespan = Math.max(...displayRows.map((r) => r.makespanMean), 1);

  const scoreCount = [quizzes.q1.firstAttemptCorrect, quizzes.q2.firstAttemptCorrect].filter(
    (v) => v === true,
  ).length;

  const showBeat0 = exploreAll || beat === 0;
  const showBeat1 = exploreAll || beat === 1;

  return (
    <div className="flex flex-col gap-6">
      {/* BEAT 0: Perbandingan Fair + Slot Impor JSON CloudSim Tim */}
      {showBeat0 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
                Perbandingan: <span className="marker-highlight">Hybrid vs Metode Sebelumnya</span>
              </h2>
              <p className="mt-1 text-sm text-[var(--ink-secondary)]">
                Baseline nyata dari eksperimen CloudSim Kelompok 4 (Sufferage, JAYA, SA Murni) +
                slot siap muat untuk hasil Hybrid tim.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="btn-transit btn-transit-rail cursor-pointer text-xs">
                Impor JSON CloudSim
                <input
                  type="file"
                  accept="application/json,.json"
                  onChange={handleFileUpload}
                  className="sr-only"
                />
              </label>
              {importState.status === 'loaded' && (
                <button
                  type="button"
                  onClick={() => void loadBundledJson()}
                  className="btn-transit text-xs"
                >
                  Reset Data Bawaan
                </button>
              )}
            </div>
          </div>

          {/* Pemilih Skenario Minggu 3 Kelompok 4 */}
          <div className="flex flex-wrap gap-1.5">
            {KELOMPOK4_VERIFIED_BASELINES.map((sc) => {
              const active = sc.id === scenarioId;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => setScenarioId(sc.id)}
                  className="font-mono-tabular min-h-[38px] rounded-lg border-2 px-3 py-1 text-xs font-bold"
                  style={{
                    borderColor: active ? 'var(--border-ink)' : 'var(--border-subtle)',
                    backgroundColor: active ? 'var(--focus-signal)' : 'var(--bg-elevated)',
                    color: active ? 'var(--focus-signal-ink)' : 'var(--ink-primary)',
                  }}
                >
                  {sc.name}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.35fr_1fr]">
            {/* Tabel & Bar Perbandingan */}
            <div className="transit-card flex flex-col gap-3 p-4">
              {/* Status Slot Data CloudSim Hybrid (Loading / Placeholder / Error / Loaded) */}
              {importState.status === 'loading' && (
                <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-xs font-semibold">
                  Memuat berkas hasil CloudSim Hybrid...
                </div>
              )}
              {importState.status === 'error' && (
                <div
                  role="alert"
                  className="rounded-lg border-2 px-3 py-2 text-xs font-semibold"
                  style={{
                    borderColor: 'var(--sa-heat)',
                    backgroundColor: 'var(--sa-heat-soft)',
                    color: 'var(--sa-heat)',
                  }}
                >
                  Gagal validasi JSON: {importState.message}
                </div>
              )}
              {importState.status === 'placeholder' && (
                <div
                  className="rounded-lg border-2 border-dashed px-3 py-2 text-xs leading-relaxed"
                  style={{
                    borderColor: 'var(--opt-rail)',
                    backgroundColor: 'var(--opt-rail-soft)',
                  }}
                >
                  <strong className="font-mono-tabular text-[var(--opt-rail)]">
                    [MENUNGGU DATA CLOUDSIM TIM]
                  </strong>{' '}
                  Angka CloudSim untuk <strong>SA + 2-Opt</strong> & <strong>DJAYA + 2-Opt</strong>{' '}
                  tidak dikarang. Begitu simulasi Java selesai, unggah file JSON lewat tombol{' '}
                  <em>Impor JSON CloudSim</em> di atas (uji langsung versi live-nya ada di Sandbox
                  Q&A).
                </div>
              )}
              {importState.status === 'loaded' && (
                <div
                  className="rounded-lg border-2 px-3 py-2 text-xs font-semibold"
                  style={{
                    borderColor: 'var(--ok-balance)',
                    backgroundColor: 'var(--ok-balance-soft)',
                    color: 'var(--ok-balance)',
                  }}
                >
                  Data CloudSim aktif: {importState.dataset.sourceLabel}
                </div>
              )}

              {/* Grafik Bar Horizontal Makespan + ARU/DOI */}
              <div className="flex flex-col gap-2">
                {displayRows.map((row) => (
                  <div
                    key={row.key}
                    className="grid grid-cols-[140px_1fr_102px] items-center gap-2 text-xs"
                  >
                    <span className="truncate font-bold">{row.label}</span>
                    <div className="h-5 overflow-hidden rounded-md bg-[var(--bg-muted)]">
                      <div
                        className="h-full rounded-md transition-all duration-300"
                        style={{
                          width: `${Math.max(4, (row.makespanMean / maxMakespan) * 100)}%`,
                          backgroundColor: row.isHybrid
                            ? 'var(--ok-balance)'
                            : row.key === 'SA'
                              ? 'var(--sa-heat)'
                              : row.key === 'Sufferage'
                                ? 'var(--opt-rail)'
                                : 'var(--ink-secondary)',
                        }}
                      />
                    </div>
                    <span className="font-mono-tabular text-right font-bold">
                      {formatId(row.makespanMean, 1)} s
                      {row.makespanStd > 0 && (
                        <span className="block text-[10px] font-medium text-[var(--ink-secondary)]">
                          ±{formatId(row.makespanStd, 1)} · DOI {formatId(row.doiMean, 2)}
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <p className="m-0 text-xs text-[var(--ink-secondary)]">{activeBaseline.note}</p>
            </div>

            {/* 4 Checklist Evaluasi Adil (Ringkas dari Slide 12 Dosen) */}
            <div className="transit-card flex flex-col justify-between gap-3 p-4">
              <div>
                <div className="font-mono-tabular mb-2 text-xs font-bold uppercase text-[var(--ink-secondary)]">
                  Checklist Eksperimen Adil (SOKA)
                </div>
                <div className="flex flex-col gap-2">
                  {FAIR_CHECKLIST.map((item) => {
                    const on = checkedIds.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleCheck(item.id)}
                        aria-pressed={on}
                        className="flex min-h-[44px] items-start gap-2.5 rounded-lg border-2 p-2.5 text-left transition-colors"
                        style={{
                          borderColor: on ? 'var(--ok-balance)' : 'var(--border-subtle)',
                          backgroundColor: on ? 'var(--ok-balance-soft)' : 'var(--bg-surface)',
                        }}
                      >
                        <span
                          className="font-mono-tabular mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs font-bold"
                          style={{
                            borderColor: 'var(--border-ink)',
                            backgroundColor: on ? 'var(--focus-signal)' : 'var(--bg-elevated)',
                            color: 'var(--focus-signal-ink)',
                          }}
                        >
                          {on ? '✓' : ''}
                        </span>
                        <span>
                          <strong className="block text-xs">{item.title}</strong>
                          <span className="text-[11px] text-[var(--ink-secondary)]">
                            {item.desc}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BEAT 1: Quiz 2/2 + Skor + Referensi Ringkas + CTA Sandbox Q&A */}
      {showBeat1 && (
        <div className="flex flex-col gap-4">
          <QuizCard quiz={QUIZZES.q2} compact />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[0.85fr_1.4fr]">
            {/* Rekap Skor & CTA Sandbox */}
            <div className="transit-card flex flex-col justify-between gap-3 p-4">
              <div>
                <div className="font-mono-tabular text-xs font-bold uppercase text-[var(--ink-secondary)]">
                  Rekap Skor Kuis (Percobaan 1)
                </div>
                <div className="font-display mt-1 text-5xl font-extrabold">
                  {scoreCount}
                  <span className="text-2xl text-[var(--ink-secondary)]"> / 2</span>
                </div>
                <ul className="mt-2 flex list-disc flex-col gap-1 pl-4 text-xs font-semibold text-[var(--ink-secondary)]">
                  <li>
                    <strong className="text-[var(--sa-heat)]">SA</strong> membuka eksplorasi global
                    lewat suhu panas.
                  </li>
                  <li>
                    <strong className="text-[var(--opt-rail)]">2-Opt</strong> merapikan silangan &
                    VM bottleneck di tiap langkah.
                  </li>
                  <li>
                    <strong className="text-[var(--ok-balance)]">Evaluasi adil</strong> wajib
                    menyamakan budget evaluasi & multi-seed.
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => setViewMode('sandbox')}
                className="btn-transit btn-transit-signal w-full text-sm"
              >
                Buka Sandbox Q&A (Otak-Atik Parameter) →
              </button>
            </div>

            {/* Kartu Referensi Ringkas */}
            <div className="transit-card flex flex-col gap-2.5 p-4">
              <div className="font-mono-tabular text-xs font-bold uppercase text-[var(--ink-secondary)]">
                Referensi Ilmiah Utama
              </div>
              <div className="flex flex-col gap-2">
                {REFERENCES.map((ref) => (
                  <div
                    key={ref.tag}
                    className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-xs leading-snug"
                  >
                    <span className="font-mono-tabular mr-2 inline-block rounded bg-[var(--ink-primary)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--bg-surface)]">
                      {ref.tag}
                    </span>
                    <span>{ref.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
