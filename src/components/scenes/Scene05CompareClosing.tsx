import { type ChangeEvent, useEffect, useState } from 'react';
import {
  type CloudSimHybridDataset,
  validateCloudSimHybridJson,
} from '../../data/cloudsimSchema';
import { FAIR_CHECKLIST, REFERENCES } from '../../data/content';
import { KELOMPOK4_VERIFIED_BASELINES } from '../../data/kelompok4Baselines';
import { formatId } from '../../lib/algorithms/rng';
import { usePresentationStore } from '../../store/presentationStore';
import { CoachMissionBanner, CoachTarget } from '../ui/GuidedCoach';

interface Scene05Props {
  beat?: number;
}

type ImportState =
  | { status: 'loading' }
  | { status: 'placeholder'; dataset: CloudSimHybridDataset }
  | { status: 'loaded'; dataset: CloudSimHybridDataset }
  | { status: 'error'; message: string };

export function Scene05CompareClosing({ beat = 0 }: Scene05Props) {
  const setViewMode = usePresentationStore((s) => s.setViewMode);
  const quizzes = usePresentationStore((s) => s.quizzes);

  const [scenarioId, setScenarioId] = useState(KELOMPOK4_VERIFIED_BASELINES[0].id);
  const [checkedIds, setCheckedIds] = useState<string[]>(['ablation', 'budget']);
  const [importState, setImportState] = useState<ImportState>({ status: 'loading' });

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
        message: 'Format JSON tidak valid. Pastikan file sesuai skema hasil CloudSim tim.',
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

  const scoreCount = [
    quizzes.q1.firstAttemptCorrect,
    quizzes.q2.firstAttemptCorrect,
    quizzes.q3.firstAttemptCorrect,
  ].filter((v) => v === true).length;

  return (
    <div className="flex flex-col gap-5">
      {/* BAGIAN 1: Perbandingan Fair + Cara Baca Angka + Impor JSON CloudSim */}
      {beat === 0 && (
        <div className="flex flex-col gap-3.5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
                Perbandingan:{' '}
                <span style={{ color: 'var(--ok-mint)' }}>Hybrid vs Metode Sebelumnya</span>
              </h2>
              <p className="mt-1 text-sm text-[var(--ink-secondary)]">
                Baseline asli CloudSim Kelompok 4 (Sufferage, JAYA, SA Murni) + impor JSON untuk
                hasil simulasi Hybrid tim.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="btn-studio btn-studio-cyan cursor-pointer text-xs">
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
                  className="btn-studio text-xs"
                >
                  Reset Data Bawaan
                </button>
              )}
            </div>
          </div>

          <CoachMissionBanner
            stepLabel="Pemandu · Bandingkan Skenario"
            instruction="Ingat cara bacanya: batang makin PENDEK = makin cepat. Coba klik 'NASA Ames 750 Job × 50 VM' untuk melihat hasil SA murni yang goyang besar!"
            completed={scenarioId === 'nasa-750x50'}
            doneMessage="Terlihat jelas! Di NASA, simpangan (± std) SA murni mencapai ±66.963 s. Begitu tim selesai run CloudSim, unggah file JSON lewat tombol biru."
          />

          <div className="mt-4 flex flex-wrap gap-2">
            {KELOMPOK4_VERIFIED_BASELINES.map((sc) => {
              const active = sc.id === scenarioId;
              const isNasaGuide = sc.id === 'nasa-750x50' && scenarioId !== 'nasa-750x50';
              const btn = (
                <button
                  type="button"
                  onClick={() => setScenarioId(sc.id)}
                  className="font-mono-tabular min-h-[38px] rounded-xl border px-3 py-1 text-xs font-bold transition-colors"
                  style={{
                    borderColor: active ? 'var(--opt-cyan)' : 'var(--border-line)',
                    backgroundColor: active ? 'var(--opt-cyan-soft)' : 'var(--bg-panel)',
                    color: active ? 'var(--opt-cyan)' : 'var(--ink-primary)',
                  }}
                >
                  {sc.name}
                </button>
              );

              return isNasaGuide ? (
                <CoachTarget key={sc.id} active label="Coba cek NASA" position="top" align="end">
                  {btn}
                </CoachTarget>
              ) : (
                <div key={sc.id}>{btn}</div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.35fr_1fr]">
            <div className="studio-panel flex flex-col gap-3 p-4">
              {/* Panduan mini cara baca metrik */}
              <div className="rounded-xl bg-[var(--bg-inset)] px-3 py-2 text-[11px] leading-snug text-[var(--ink-secondary)]">
                <strong className="text-[var(--ink-primary)]">Cara baca angka:</strong>{' '}
                <strong>Makespan (s)</strong> makin kecil makin cepat ·{' '}
                <strong>± std</strong> makin kecil makin stabil ·{' '}
                <strong>DOI</strong> makin dekat 0 makin merata beban antar-VM.
              </div>

              {importState.status === 'loading' && (
                <div className="rounded-xl bg-[var(--bg-inset)] px-3 py-2 text-xs font-semibold">
                  Memuat berkas hasil CloudSim Hybrid...
                </div>
              )}
              {importState.status === 'error' && (
                <div
                  role="alert"
                  className="rounded-xl border px-3 py-2 text-xs font-semibold"
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
                  className="rounded-xl border border-dashed px-3 py-2 text-xs leading-relaxed"
                  style={{
                    borderColor: 'var(--opt-cyan)',
                    backgroundColor: 'var(--opt-cyan-soft)',
                  }}
                >
                  <strong className="font-mono-tabular" style={{ color: 'var(--opt-cyan)' }}>
                    [MENUNGGU DATA CLOUDSIM TIM]
                  </strong>{' '}
                  Angka CloudSim untuk <strong>SA + 2-Opt</strong> & <strong>DJAYA + 2-Opt</strong>{' '}
                  tidak dikarang. Unggah file JSON hasil Java tim lewat tombol{' '}
                  <em>Impor JSON CloudSim</em> kapan saja.
                </div>
              )}
              {importState.status === 'loaded' && (
                <div
                  className="rounded-xl border px-3 py-2 text-xs font-semibold"
                  style={{
                    borderColor: 'var(--ok-mint)',
                    backgroundColor: 'var(--ok-mint-soft)',
                    color: 'var(--ok-mint)',
                  }}
                >
                  Data CloudSim aktif: {importState.dataset.sourceLabel}
                </div>
              )}

              <div className="flex flex-col gap-2.5">
                {displayRows.map((row) => (
                  <div
                    key={row.key}
                    className="grid grid-cols-[140px_1fr_108px] items-center gap-2 text-xs"
                  >
                    <span className="truncate font-bold">{row.label}</span>
                    <div className="h-5 overflow-hidden rounded-full bg-[var(--bg-inset)]">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(4, (row.makespanMean / maxMakespan) * 100)}%`,
                          backgroundColor: row.isHybrid
                            ? 'var(--ok-mint)'
                            : row.key === 'SA'
                              ? 'var(--sa-heat)'
                              : row.key === 'Sufferage'
                                ? 'var(--opt-cyan)'
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

            <div className="studio-panel flex flex-col gap-2.5 p-4">
              <div className="text-xs font-bold text-[var(--ink-secondary)]">
                Syarat Perbandingan Ilmiah yang Adil
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
                      className="flex min-h-[44px] items-start gap-2.5 rounded-xl border p-2.5 text-left transition-colors"
                      style={{
                        borderColor: on ? 'var(--ok-mint)' : 'var(--border-line)',
                        backgroundColor: on ? 'var(--ok-mint-soft)' : 'var(--bg-inset)',
                      }}
                    >
                      <span
                        className="font-mono-tabular mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-bold"
                        style={{
                          backgroundColor: on ? 'var(--ok-mint)' : 'var(--bg-panel)',
                          color: on ? 'var(--on-mint)' : 'var(--ink-secondary)',
                        }}
                      >
                        {on ? '✓' : ''}
                      </span>
                      <span>
                        <strong className="block text-xs">{item.title}</strong>
                        <span className="text-[11px] text-[var(--ink-secondary)]">{item.desc}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BAGIAN 2: Ringkasan Fundamental 30 Detik + Skor 3 Cek Paham + Referensi + CTA Sandbox */}
      {beat === 1 && (
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
              Ringkasan Utama:{' '}
              <span style={{ color: 'var(--opt-cyan)' }}>3 Hal yang Perlu Diingat</span>
            </h2>
            <p className="mt-1 text-sm text-[var(--ink-secondary)]">
              Inti cara kerja Hybrid SA + 2-Opt dalam tiga kalimat sederhana sebelum masuk sesi tanya jawab:
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="studio-panel p-4" style={{ borderColor: 'var(--sa-heat)' }}>
              <div className="text-xs font-bold" style={{ color: 'var(--sa-heat)' }}>
                1. Peran Simulated Annealing (SA)
              </div>
              <p className="m-0 mt-1.5 text-sm font-semibold leading-snug">
                Membuka jelajah luas dengan berani menerima langkah mundur sementara saat suhu panas,
                sehingga lolos dari jebakan local optimum.
              </p>
            </div>
            <div className="studio-panel p-4" style={{ borderColor: 'var(--opt-cyan)' }}>
              <div className="text-xs font-bold" style={{ color: 'var(--opt-cyan)' }}>
                2. Peran 2-Opt (Local Search)
              </div>
              <p className="m-0 mt-1.5 text-sm font-semibold leading-snug">
                Dipanggil di dalam tiap putaran SA (LRH) untuk langsung menukar pasangan task antar-VM
                dan mendinginkan server bottleneck.
              </p>
            </div>
            <div className="studio-panel p-4" style={{ borderColor: 'var(--ok-mint)' }}>
              <div className="text-xs font-bold" style={{ color: 'var(--ok-mint)' }}>
                3. Kenapa Lebih Unggul
              </div>
              <p className="m-0 mt-1.5 text-sm font-semibold leading-snug">
                Konvergensi jauh lebih cepat dan hasil lebih stabil daripada SA murni pada jatah
                evaluasi yang sama, sekaligus mengungguli heuristik kaku.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[0.88fr_1.35fr]">
            <div className="studio-panel flex flex-col justify-between gap-3 p-4 pb-10">
              <div>
                <div className="text-xs font-bold text-[var(--ink-secondary)]">
                  Skor Cek Paham (Percobaan Pertama)
                </div>
                <div className="font-display mt-1 text-5xl font-extrabold">
                  {scoreCount}
                  <span className="text-2xl text-[var(--ink-secondary)]"> / 3</span>
                </div>
                <p className="m-0 mt-2 text-xs leading-relaxed text-[var(--ink-secondary)]">
                  Punya pertanyaan atau ingin menguji langsung jumlah task, suhu awal, dan uji 10 seed?
                  Buka Sandbox Q&A di bawah ini!
                </p>
              </div>

              <CoachTarget active label="Buka lab tanya jawab!" position="bottom" className="w-full">
                <button
                  type="button"
                  onClick={() => setViewMode('sandbox')}
                  className="btn-studio btn-studio-gold w-full text-sm"
                >
                  Buka Sandbox Q&A (Otak-Atik Parameter)
                </button>
              </CoachTarget>
            </div>

            <div className="studio-panel flex flex-col gap-2 p-4">
              <div className="text-xs font-bold text-[var(--ink-secondary)]">
                Referensi Ilmiah Utama
              </div>
              <div className="flex flex-col gap-2">
                {REFERENCES.map((ref) => (
                  <div
                    key={ref.tag}
                    className="rounded-xl border border-[var(--border-line)] bg-[var(--bg-inset)] px-3 py-2 text-xs leading-snug"
                  >
                    <span
                      className="font-mono-tabular mr-2 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold"
                      style={{
                        backgroundColor: 'var(--opt-cyan-soft)',
                        color: 'var(--opt-cyan)',
                      }}
                    >
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
