import { formatId } from '../../lib/algorithms/rng';
import { usePresentationStore } from '../../store/presentationStore';
import { useSandboxStore } from '../../store/sandboxStore';
import { ConvergenceSvg } from '../ui/ConvergenceSvg';
import { VmRackGantt } from '../ui/VmRackGantt';

export function SandboxView() {
  const setViewMode = usePresentationStore((s) => s.setViewMode);

  const taskCount = useSandboxStore((s) => s.taskCount);
  const vmCount = useSandboxStore((s) => s.vmCount);
  const seed = useSandboxStore((s) => s.seed);
  const initialTemp = useSandboxStore((s) => s.initialTemp);
  const coolingRate = useSandboxStore((s) => s.coolingRate);
  const maxEvaluations = useSandboxStore((s) => s.maxEvaluations);
  const adaptation = useSandboxStore((s) => s.adaptation);
  const enable2Opt = useSandboxStore((s) => s.enable2Opt);
  const xAxisMode = useSandboxStore((s) => s.xAxisMode);
  const problem = useSandboxStore((s) => s.problem);
  const duel = useSandboxStore((s) => s.duel);
  const batchStats = useSandboxStore((s) => s.batchStats);

  const updateParam = useSandboxStore((s) => s.updateParam);
  const randomizeSeed = useSandboxStore((s) => s.randomizeSeed);
  const runBatch10Seeds = useSandboxStore((s) => s.runBatch10Seeds);

  const activeRun = enable2Opt ? duel.hybrid : duel.pureSa;
  const maxGantt = Math.max(duel.pureSa.metrics.makespan, duel.hybrid.metrics.makespan) * 1.12;

  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-5 px-3 py-5 sm:px-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="font-mono-tabular inline-block rounded bg-[var(--focus-signal)] px-2 py-0.5 text-xs font-bold text-[var(--focus-signal-ink)]">
            SANDBOX Q&A · EKSPERIMEN LIVE
          </span>
          <h1 className="font-display mt-1 text-2xl font-extrabold sm:text-3xl">
            Laboratorium Uji Hybrid SA + 2-Opt
          </h1>
          <p className="m-0 text-sm text-[var(--ink-secondary)]">
            Ubah parameter, matikan/nyalakan 2-Opt (Ablation), dan uji kestabilan 10 seed secara
            langsung di browser.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setViewMode('deck')}
          className="btn-transit text-xs"
        >
          ← Kembali ke Presentasi
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[330px_1fr]">
        {/* Panel Kontrol Parameter */}
        <aside className="transit-surface flex flex-col gap-4 p-4">
          {/* Saklar Ablation ON/OFF 2-Opt */}
          <div className="flex flex-col gap-1.5">
            <span className="font-mono-tabular text-xs font-bold uppercase text-[var(--ink-secondary)]">
              Ablation Toggle (2-Opt)
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => updateParam('enable2Opt', true)}
                aria-pressed={enable2Opt}
                className="min-h-[44px] rounded-lg border-2 text-xs font-bold"
                style={{
                  borderColor: enable2Opt ? 'var(--opt-rail)' : 'var(--border-subtle)',
                  backgroundColor: enable2Opt ? 'var(--opt-rail)' : 'var(--bg-elevated)',
                  color: enable2Opt ? '#ffffff' : 'var(--ink-primary)',
                }}
              >
                2-Opt AKTIF
              </button>
              <button
                type="button"
                onClick={() => updateParam('enable2Opt', false)}
                aria-pressed={!enable2Opt}
                className="min-h-[44px] rounded-lg border-2 text-xs font-bold"
                style={{
                  borderColor: !enable2Opt ? 'var(--sa-heat)' : 'var(--border-subtle)',
                  backgroundColor: !enable2Opt ? 'var(--sa-heat)' : 'var(--bg-elevated)',
                  color: !enable2Opt ? '#ffffff' : 'var(--ink-primary)',
                }}
              >
                2-Opt MATI (SA)
              </button>
            </div>
          </div>

          {/* Pilihan Adaptasi Cloud 2-Opt */}
          <div className="flex flex-col gap-1.5">
            <span className="font-mono-tabular text-xs font-bold uppercase text-[var(--ink-secondary)]">
              Mode Adaptasi Cloud
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => updateParam('adaptation', 'pairwise-swap')}
                className="min-h-[40px] rounded-lg border-2 px-2 text-xs font-bold"
                style={{
                  borderColor:
                    adaptation === 'pairwise-swap' ? 'var(--border-ink)' : 'var(--border-subtle)',
                  backgroundColor:
                    adaptation === 'pairwise-swap' ? 'var(--focus-signal)' : 'var(--bg-elevated)',
                  color:
                    adaptation === 'pairwise-swap'
                      ? 'var(--focus-signal-ink)'
                      : 'var(--ink-primary)',
                }}
              >
                Pairwise Swap
              </button>
              <button
                type="button"
                onClick={() => updateParam('adaptation', 'permutation-2opt')}
                className="min-h-[40px] rounded-lg border-2 px-2 text-xs font-bold"
                style={{
                  borderColor:
                    adaptation === 'permutation-2opt'
                      ? 'var(--border-ink)'
                      : 'var(--border-subtle)',
                  backgroundColor:
                    adaptation === 'permutation-2opt'
                      ? 'var(--focus-signal)'
                      : 'var(--bg-elevated)',
                  color:
                    adaptation === 'permutation-2opt'
                      ? 'var(--focus-signal-ink)'
                      : 'var(--ink-primary)',
                }}
              >
                Permutasi + EFT
              </button>
            </div>
          </div>

          {/* Sliders */}
          <div className="flex flex-col gap-3 text-xs font-bold">
            <label className="flex flex-col gap-1">
              <span className="flex justify-between">
                <span>Jumlah Task</span>
                <span className="font-mono-tabular">{taskCount}</span>
              </span>
              <input
                type="range"
                min={12}
                max={40}
                step={2}
                value={taskCount}
                onChange={(e) => updateParam('taskCount', Number(e.target.value))}
                className="transit-range"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="flex justify-between">
                <span>Jumlah VM Heterogen</span>
                <span className="font-mono-tabular">{vmCount}</span>
              </span>
              <input
                type="range"
                min={3}
                max={6}
                step={1}
                value={vmCount}
                onChange={(e) => updateParam('vmCount', Number(e.target.value))}
                className="transit-range"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="flex justify-between">
                <span>Suhu Awal (T₀)</span>
                <span className="font-mono-tabular">{initialTemp}</span>
              </span>
              <input
                type="range"
                min={20}
                max={200}
                step={10}
                value={initialTemp}
                onChange={(e) => updateParam('initialTemp', Number(e.target.value))}
                className="transit-range"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="flex justify-between">
                <span>Cooling Rate (r)</span>
                <span className="font-mono-tabular">{formatId(coolingRate, 2)}</span>
              </span>
              <input
                type="range"
                min={0.8}
                max={0.98}
                step={0.01}
                value={coolingRate}
                onChange={(e) => updateParam('coolingRate', Number(e.target.value))}
                className="transit-range"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="flex justify-between">
                <span>Budget Evaluasi Setara</span>
                <span className="font-mono-tabular">{maxEvaluations}</span>
              </span>
              <input
                type="range"
                min={200}
                max={1000}
                step={50}
                value={maxEvaluations}
                onChange={(e) => updateParam('maxEvaluations', Number(e.target.value))}
                className="transit-range"
              />
            </label>
          </div>

          {/* Seed & Batch 10 Seed */}
          <div className="flex flex-col gap-2 pt-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono-tabular text-xs font-bold text-[var(--ink-secondary)]">
                Seed aktif: {seed}
              </span>
              <button type="button" onClick={randomizeSeed} className="btn-transit !min-h-[38px] text-xs">
                Seed Baru
              </button>
            </div>
            <button
              type="button"
              onClick={runBatch10Seeds}
              className="btn-transit btn-transit-primary w-full text-xs"
            >
              Jalankan Uji 10 Seed (mean ± std)
            </button>
          </div>
        </aside>

        {/* Area Visualisasi & Hasil */}
        <section className="flex flex-col gap-4">
          {/* KPI Ringkas */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="transit-card p-3">
              <div className="font-mono-tabular text-[11px] font-bold text-[var(--opt-rail)]">
                Hybrid SA + 2-Opt
              </div>
              <div className="font-mono-tabular mt-0.5 text-xl font-extrabold">
                {formatId(duel.hybrid.metrics.makespan, 1)} s
              </div>
              <div className="font-mono-tabular text-[11px] text-[var(--ink-secondary)]">
                DOI {formatId(duel.hybrid.metrics.doi, 2)} · {duel.hybrid.evaluations} eval
              </div>
            </div>
            <div className="transit-card p-3">
              <div className="font-mono-tabular text-[11px] font-bold text-[var(--sa-heat)]">
                SA Murni
              </div>
              <div className="font-mono-tabular mt-0.5 text-xl font-extrabold">
                {formatId(duel.pureSa.metrics.makespan, 1)} s
              </div>
              <div className="font-mono-tabular text-[11px] text-[var(--ink-secondary)]">
                DOI {formatId(duel.pureSa.metrics.doi, 2)} · {duel.pureSa.evaluations} eval
              </div>
            </div>
            <div className="transit-card p-3">
              <div className="font-mono-tabular text-[11px] font-bold text-[var(--ok-balance)]">
                Sufferage
              </div>
              <div className="font-mono-tabular mt-0.5 text-xl font-extrabold">
                {formatId(duel.sufferage.metrics.makespan, 1)} s
              </div>
              <div className="font-mono-tabular text-[11px] text-[var(--ink-secondary)]">
                DOI {formatId(duel.sufferage.metrics.doi, 2)} · 1 pass
              </div>
            </div>
            <div className="transit-card p-3">
              <div className="font-mono-tabular text-[11px] font-bold text-[var(--ink-secondary)]">
                JAYA
              </div>
              <div className="font-mono-tabular mt-0.5 text-xl font-extrabold">
                {formatId(duel.jaya.metrics.makespan, 1)} s
              </div>
              <div className="font-mono-tabular text-[11px] text-[var(--ink-secondary)]">
                DOI {formatId(duel.jaya.metrics.doi, 2)} · {duel.jaya.evaluations} eval
              </div>
            </div>
          </div>

          <VmRackGantt
            problem={problem}
            assignment={activeRun.assignment}
            scaleMax={maxGantt}
            title={
              enable2Opt
                ? `Gantt Jadwal Aktif: Hybrid SA + 2-Opt (${activeRun.twoOptSwapsTotal}× poles 2-Opt)`
                : 'Gantt Jadwal Aktif: SA Murni (2-Opt Dimatikan)'
            }
          />

          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono-tabular text-xs font-bold text-[var(--ink-secondary)]">
                Bandingkan sumbu-X untuk melihat efek budget evaluasi 2-Opt:
              </span>
              <div className="inline-flex rounded-lg border-2 border-[var(--border-ink)] bg-[var(--bg-muted)] p-0.5">
                <button
                  type="button"
                  onClick={() => updateParam('xAxisMode', 'evals')}
                  className="min-h-[34px] rounded px-2.5 text-xs font-bold"
                  style={{
                    backgroundColor:
                      xAxisMode === 'evals' ? 'var(--ink-primary)' : 'transparent',
                    color: xAxisMode === 'evals' ? 'var(--bg-surface)' : 'var(--ink-primary)',
                  }}
                >
                  Fitness Evaluation (Adil)
                </button>
                <button
                  type="button"
                  onClick={() => updateParam('xAxisMode', 'step')}
                  className="min-h-[34px] rounded px-2.5 text-xs font-bold"
                  style={{
                    backgroundColor:
                      xAxisMode === 'step' ? 'var(--ink-primary)' : 'transparent',
                    color: xAxisMode === 'step' ? 'var(--bg-surface)' : 'var(--ink-primary)',
                  }}
                >
                  Jumlah Langkah
                </button>
              </div>
            </div>

            <ConvergenceSvg
              height={185}
              title="Kurva Konvergensi Live (Budget Evaluasi Setara)"
              xLabel={
                xAxisMode === 'evals'
                  ? 'Jumlah Fitness Evaluation (termasuk 2-Opt)'
                  : 'Jumlah Langkah Iterasi'
              }
              referenceLine={{
                label: 'Sufferage',
                value: duel.sufferage.metrics.makespan,
                color: 'var(--ok-balance)',
              }}
              series={[
                {
                  id: 'hybrid',
                  label: 'Hybrid SA + 2-Opt',
                  color: 'var(--opt-rail)',
                  points: duel.hybrid.trace.map((pt) => ({
                    x: xAxisMode === 'evals' ? pt.evaluations : pt.step,
                    y: pt.bestCost,
                  })),
                },
                {
                  id: 'sa',
                  label: 'SA Murni',
                  color: 'var(--sa-heat)',
                  dashed: true,
                  points: duel.pureSa.trace.map((pt) => ({
                    x: xAxisMode === 'evals' ? pt.evaluations : pt.step,
                    y: pt.bestCost,
                  })),
                },
                {
                  id: 'jaya',
                  label: 'JAYA',
                  color: 'var(--ink-secondary)',
                  dashed: true,
                  points: duel.jaya.curve.map((pt) => ({
                    x: xAxisMode === 'evals' ? pt.evaluations : pt.step,
                    y: pt.bestCost,
                  })),
                },
              ]}
            />
          </div>

          {/* Tabel Hasil Uji 10 Seed */}
          <div className="transit-card p-4">
            <div className="font-mono-tabular mb-2 text-xs font-bold uppercase text-[var(--ink-secondary)]">
              Hasil Uji Stabilitas 10 Seed (mean ± std)
            </div>
            {batchStats ? (
              <div className="overflow-x-auto">
                <table className="font-mono-tabular w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b-2 border-[var(--border-ink)]">
                      <th className="py-2 pr-3">Algoritma</th>
                      <th className="py-2 pr-3 text-right">Makespan (mean ± std)</th>
                      <th className="py-2 pr-3 text-right">Terbaik</th>
                      <th className="py-2 pr-3 text-right">ARU</th>
                      <th className="py-2 pr-3 text-right">DOI</th>
                      <th className="py-2 text-right">Avg Eval</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchStats.map((row) => (
                      <tr key={row.algorithm} className="border-b border-[var(--border-subtle)]">
                        <td className="py-2 pr-3 font-sans font-bold">{row.algorithm}</td>
                        <td className="py-2 pr-3 text-right font-bold">
                          {formatId(row.mean, 1)} ± {formatId(row.std, 1)} s
                        </td>
                        <td className="py-2 pr-3 text-right">{formatId(row.min, 1)} s</td>
                        <td className="py-2 pr-3 text-right">{formatId(row.avgAru * 100, 1)}%</td>
                        <td className="py-2 pr-3 text-right">{formatId(row.avgDoi, 2)}</td>
                        <td className="py-2 text-right">{formatId(row.avgEvaluations, 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="m-0 text-xs text-[var(--ink-secondary)]">
                Belum dijalankan untuk konfigurasi ini. Klik{' '}
                <strong>Jalankan Uji 10 Seed (mean ± std)</strong> di panel kiri untuk membandingkan
                stabilitas 10 random seed.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
