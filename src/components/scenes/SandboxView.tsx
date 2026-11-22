import { formatId } from '../../lib/algorithms/rng';
import { usePresentationStore } from '../../store/presentationStore';
import { useSandboxStore } from '../../store/sandboxStore';
import { ConvergenceSvg } from '../ui/ConvergenceSvg';
import { CoachMissionBanner, CoachTarget } from '../ui/GuidedCoach';
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
  const bestMakespan = Math.min(
    duel.hybrid.metrics.makespan,
    duel.pureSa.metrics.makespan,
    duel.sufferage.metrics.makespan,
    duel.jaya.metrics.makespan,
  );

  return (
    <main className="mx-auto flex w-full max-w-[1320px] flex-1 flex-col gap-4 px-3 py-5 sm:px-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">
            Sandbox Q&A · Laboratorium Uji Hybrid SA + 2-Opt
          </h1>
          <p className="m-0 mt-0.5 text-sm text-[var(--ink-secondary)]">
            Ubah parameter, nyalakan/matikan 2-Opt (Ablation), dan uji kestabilan 10 seed langsung
            di browser.
          </p>
        </div>

        <button type="button" onClick={() => setViewMode('video')} className="btn-studio text-xs">
          ← Kembali ke Presentasi
        </button>
      </div>

      <CoachMissionBanner
        stepLabel="Pemandu · Sandbox"
        instruction="Coba klik 'Jalankan Uji 10 Seed (mean ± std)' di kiri untuk melihat bukti stabilitas multi-run, lalu bandingkan dengan mematikan saklar 2-Opt."
        completed={batchStats !== null}
        doneMessage="Tabel 10 seed sudah muncul di bawah! Perhatikan perbandingan mean ± std dan jumlah evaluasi setaranya."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[330px_1fr]">
        {/* Panel Kontrol Parameter */}
        <aside className="theater-stage flex flex-col gap-4 p-4 pb-11">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-[var(--ink-secondary)]">
              Ablation Toggle (2-Opt)
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => updateParam('enable2Opt', true)}
                aria-pressed={enable2Opt}
                className="min-h-[44px] rounded-xl border text-xs font-bold"
                style={{
                  borderColor: enable2Opt ? 'var(--opt-cyan)' : 'var(--border-line)',
                  backgroundColor: enable2Opt ? 'var(--opt-cyan)' : 'var(--bg-panel)',
                  color: enable2Opt ? 'var(--on-cyan)' : 'var(--ink-primary)',
                }}
              >
                2-Opt AKTIF
              </button>
              <button
                type="button"
                onClick={() => updateParam('enable2Opt', false)}
                aria-pressed={!enable2Opt}
                className="min-h-[44px] rounded-xl border text-xs font-bold"
                style={{
                  borderColor: !enable2Opt ? 'var(--sa-heat)' : 'var(--border-line)',
                  backgroundColor: !enable2Opt ? 'var(--sa-heat)' : 'var(--bg-panel)',
                  color: !enable2Opt ? 'var(--on-heat)' : 'var(--ink-primary)',
                }}
              >
                2-Opt MATI (SA)
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-[var(--ink-secondary)]">
              Mode Adaptasi Cloud
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => updateParam('adaptation', 'pairwise-swap')}
                className="min-h-[40px] rounded-xl border px-2 text-xs font-bold"
                style={{
                  borderColor:
                    adaptation === 'pairwise-swap' ? 'var(--coach-gold)' : 'var(--border-line)',
                  backgroundColor:
                    adaptation === 'pairwise-swap' ? 'var(--coach-gold)' : 'var(--bg-panel)',
                  color:
                    adaptation === 'pairwise-swap' ? 'var(--coach-ink)' : 'var(--ink-primary)',
                }}
              >
                Pairwise Swap
              </button>
              <button
                type="button"
                onClick={() => updateParam('adaptation', 'permutation-2opt')}
                className="min-h-[40px] rounded-xl border px-2 text-xs font-bold"
                style={{
                  borderColor:
                    adaptation === 'permutation-2opt'
                      ? 'var(--coach-gold)'
                      : 'var(--border-line)',
                  backgroundColor:
                    adaptation === 'permutation-2opt' ? 'var(--coach-gold)' : 'var(--bg-panel)',
                  color:
                    adaptation === 'permutation-2opt' ? 'var(--coach-ink)' : 'var(--ink-primary)',
                }}
              >
                Permutasi + EFT
              </button>
            </div>
          </div>

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
                className="studio-range"
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
                className="studio-range"
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
                className="studio-range"
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
                className="studio-range"
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
                className="studio-range"
              />
            </label>
          </div>

          <div className="flex flex-col gap-2.5 pt-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono-tabular text-xs font-bold text-[var(--ink-secondary)]">
                Seed aktif: {seed}
              </span>
              <button type="button" onClick={randomizeSeed} className="btn-studio !min-h-[38px] text-xs">
                Seed Baru
              </button>
            </div>
            <CoachTarget active={batchStats === null} label="Coba uji 10 seed!" position="bottom" className="w-full">
              <button
                type="button"
                onClick={runBatch10Seeds}
                className="btn-studio btn-studio-gold w-full text-xs"
              >
                Jalankan Uji 10 Seed (mean ± std)
              </button>
            </CoachTarget>
          </div>
        </aside>

        {/* Area Visualisasi & Hasil */}
        <section className="flex flex-col gap-4">
          {/* Hierarki KPI: Hybrid SA + 2-Opt sebagai kartu utama + 3 pembanding ringkas */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.35fr_1fr_1fr_1fr]">
            <div
              className="studio-panel p-3.5"
              style={{
                borderColor: 'var(--opt-cyan)',
                backgroundColor: 'var(--opt-cyan-soft)',
              }}
            >
              <div className="flex items-center justify-between gap-2 text-xs font-bold">
                <span style={{ color: 'var(--opt-cyan)' }}>Hybrid SA + 2-Opt</span>
                {duel.hybrid.metrics.makespan <= bestMakespan + 1e-6 && (
                  <span
                    className="font-mono-tabular rounded px-1.5 py-0.5 text-[10px]"
                    style={{ backgroundColor: 'var(--ok-mint)', color: 'var(--on-mint)' }}
                  >
                    Tercepat
                  </span>
                )}
              </div>
              <div className="font-mono-tabular mt-1 text-2xl font-extrabold">
                {formatId(duel.hybrid.metrics.makespan, 1)} s
              </div>
              <div className="font-mono-tabular text-[11px] text-[var(--ink-secondary)]">
                DOI {formatId(duel.hybrid.metrics.doi, 2)} · {duel.hybrid.evaluations} eval
              </div>
            </div>

            {[
              {
                name: 'SA Murni',
                color: 'var(--sa-heat)',
                mk: duel.pureSa.metrics.makespan,
                doi: duel.pureSa.metrics.doi,
                sub: `${duel.pureSa.evaluations} eval`,
              },
              {
                name: 'Sufferage',
                color: 'var(--ok-mint)',
                mk: duel.sufferage.metrics.makespan,
                doi: duel.sufferage.metrics.doi,
                sub: '1 pass',
              },
              {
                name: 'JAYA',
                color: 'var(--ink-secondary)',
                mk: duel.jaya.metrics.makespan,
                doi: duel.jaya.metrics.doi,
                sub: `${duel.jaya.evaluations} eval`,
              },
            ].map((item) => (
              <div key={item.name} className="studio-panel p-3">
                <div className="text-xs font-bold" style={{ color: item.color }}>
                  {item.name}
                </div>
                <div className="font-mono-tabular mt-1 text-xl font-extrabold">
                  {formatId(item.mk, 1)} s
                </div>
                <div className="font-mono-tabular text-[11px] text-[var(--ink-secondary)]">
                  DOI {formatId(item.doi, 2)} · {item.sub}
                </div>
              </div>
            ))}
          </div>

          <VmRackGantt
            problem={problem}
            assignment={activeRun.assignment}
            scaleMax={maxGantt}
            title={
              enable2Opt
                ? `Jadwal Aktif: Hybrid SA + 2-Opt (${activeRun.twoOptSwapsTotal}× poles 2-Opt)`
                : 'Jadwal Aktif: SA Murni (2-Opt Dimatikan)'
            }
          />

          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-[var(--ink-secondary)]">
                Bandingkan sumbu-X untuk melihat efek budget evaluasi 2-Opt:
              </span>
              <div className="inline-flex rounded-xl border border-[var(--border-line)] bg-[var(--bg-inset)] p-0.5">
                <button
                  type="button"
                  onClick={() => updateParam('xAxisMode', 'evals')}
                  className="min-h-[34px] rounded-lg px-2.5 text-xs font-bold"
                  style={{
                    backgroundColor: xAxisMode === 'evals' ? 'var(--opt-cyan)' : 'transparent',
                    color: xAxisMode === 'evals' ? 'var(--on-cyan)' : 'var(--ink-primary)',
                  }}
                >
                  Fitness Evaluation (Adil)
                </button>
                <button
                  type="button"
                  onClick={() => updateParam('xAxisMode', 'step')}
                  className="min-h-[34px] rounded-lg px-2.5 text-xs font-bold"
                  style={{
                    backgroundColor: xAxisMode === 'step' ? 'var(--opt-cyan)' : 'transparent',
                    color: xAxisMode === 'step' ? 'var(--on-cyan)' : 'var(--ink-primary)',
                  }}
                >
                  Jumlah Langkah
                </button>
              </div>
            </div>

            <ConvergenceSvg
              height={175}
              title="Kurva Konvergensi Live (Budget Evaluasi Setara)"
              xLabel={
                xAxisMode === 'evals'
                  ? 'Jumlah Fitness Evaluation (termasuk 2-Opt)'
                  : 'Jumlah Langkah Iterasi'
              }
              referenceLine={{
                label: 'Sufferage',
                value: duel.sufferage.metrics.makespan,
                color: 'var(--ok-mint)',
              }}
              series={[
                {
                  id: 'hybrid',
                  label: 'Hybrid SA + 2-Opt',
                  color: 'var(--opt-cyan)',
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

          <div className="studio-panel p-4">
            <div className="mb-2 text-xs font-bold text-[var(--ink-secondary)]">
              Hasil Uji Stabilitas 10 Seed (mean ± std)
            </div>
            {batchStats ? (
              <div className="overflow-x-auto">
                <table className="font-mono-tabular w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border-line)]">
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
                      <tr key={row.algorithm} className="border-b border-[var(--border-line)]/60">
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
