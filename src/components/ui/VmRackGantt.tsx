import { type CloudProblem, evaluateSchedule } from '../../lib/algorithms/cloudModel';
import { formatId } from '../../lib/algorithms/rng';
import { CoachTarget } from './GuidedCoach';

interface VmRackGanttProps {
  problem: CloudProblem;
  assignment: readonly number[];
  scaleMax?: number;
  highlightTasks?: readonly number[];
  coachTaskId?: number | null;
  coachTaskLabel?: string;
  interactive?: boolean;
  onTaskClick?: (taskId: number) => void;
  optimalBound?: number;
  compact?: boolean;
  title?: string;
  scanFlashKey?: number;
}

const VM_COLORS = [
  'var(--vm-0)',
  'var(--vm-1)',
  'var(--vm-2)',
  'var(--vm-3)',
  'var(--vm-4)',
  'var(--vm-5)',
];

function ServerTowerIcon({ hot, optimal, color }: { hot: boolean; optimal: boolean; color: string }) {
  return (
    <div className="relative flex h-9 w-7 shrink-0 items-center justify-center">
      {hot && (
        <svg
          width="24"
          height="16"
          viewBox="0 0 24 16"
          aria-hidden="true"
          className="pointer-events-none absolute -top-3.5 left-0.5"
        >
          <circle cx="8" cy="11" r="3" fill="var(--sa-heat)" className="steam-puff-1" />
          <circle cx="15" cy="12" r="2.5" fill="var(--sa-heat)" className="steam-puff-2" />
        </svg>
      )}
      <svg width="26" height="32" viewBox="0 0 26 32" aria-hidden="true">
        <rect
          x="2"
          y="2"
          width="22"
          height="28"
          rx="5"
          fill="var(--bg-inset)"
          stroke={hot ? 'var(--sa-heat)' : optimal ? 'var(--ok-mint)' : color}
          strokeWidth="2.2"
        />
        <rect x="6" y="7" width="14" height="3" rx="1.5" fill={hot ? 'var(--sa-heat)' : color} />
        <rect x="6" y="13" width="14" height="3" rx="1.5" fill={hot ? 'var(--sa-heat)' : color} opacity="0.7" />
        <circle cx="18" cy="24" r="2.2" fill={hot ? 'var(--sa-heat)' : 'var(--ok-mint)'} />
      </svg>
    </div>
  );
}

export function VmRackGantt({
  problem,
  assignment,
  scaleMax,
  highlightTasks = [],
  coachTaskId = null,
  coachTaskLabel = 'Klik paket ini',
  interactive = false,
  onTaskClick,
  optimalBound,
  compact = false,
  title,
  scanFlashKey = 0,
}: VmRackGanttProps) {
  const metrics = evaluateSchedule(problem, assignment);
  const axisMax = Math.max(scaleMax ?? metrics.makespan * 1.12, metrics.makespan, 1);
  const isAtOptimal = optimalBound !== undefined && metrics.makespan <= optimalBound + 1e-6;
  const manyTasks = problem.tasks.length > 10;

  return (
    <div
      className={`studio-panel relative flex flex-col gap-2.5 overflow-hidden ${
        compact ? 'p-3' : 'p-4'
      }`}
    >
      {/* Sinar pemindai cyan ketika 2-Opt baru memoles */}
      {scanFlashKey > 0 && (
        <div
          key={scanFlashKey}
          aria-hidden="true"
          className="twoopt-scan-beam pointer-events-none absolute inset-y-0 left-0 z-10 w-1/3"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.25), transparent)',
          }}
        />
      )}

      {title && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-[var(--ink-secondary)]">{title}</span>
          <div className="flex items-center gap-2">
            <span
              className="font-mono-tabular rounded-lg border px-2.5 py-0.5 text-xs font-bold"
              style={{
                borderColor: isAtOptimal ? 'var(--ok-mint)' : 'var(--sa-heat)',
                backgroundColor: isAtOptimal ? 'var(--ok-mint-soft)' : 'var(--sa-heat-soft)',
                color: isAtOptimal ? 'var(--ok-mint)' : 'var(--sa-heat)',
              }}
            >
              Makespan: {formatId(metrics.makespan, manyTasks ? 1 : 0)} s
            </span>
            {optimalBound !== undefined && (
              <span className="font-mono-tabular text-xs font-semibold text-[var(--ink-secondary)]">
                Target: {formatId(optimalBound, 0)} s
              </span>
            )}
          </div>
        </div>
      )}

      <div className={`relative flex flex-col ${interactive ? 'gap-3.5' : 'gap-2'}`}>
        {problem.vms.map((vm, vIdx) => {
          const isHot = !isAtOptimal && vIdx === metrics.bottleneckVm;
          const tasksOnVm: Array<{ taskId: number; name: string; dur: number; start: number }> = [];
          let cursor = 0;
          for (let t = 0; t < problem.tasks.length; t++) {
            if (assignment[t] === vIdx) {
              const dur = problem.etc[t][vIdx];
              tasksOnVm.push({ taskId: t, name: problem.tasks[t].name, dur, start: cursor });
              cursor += dur;
            }
          }

          return (
            <div
              key={vm.id}
              className="grid grid-cols-[100px_1fr_56px] items-center gap-2 rounded-xl border px-2.5 py-2 transition-colors duration-200"
              style={{
                borderColor: isHot
                  ? 'var(--sa-heat)'
                  : isAtOptimal
                    ? 'var(--ok-mint)'
                    : 'var(--border-line)',
                backgroundColor: isHot
                  ? 'var(--sa-heat-soft)'
                  : isAtOptimal
                    ? 'var(--ok-mint-soft)'
                    : 'var(--bg-inset)',
              }}
            >
              <div className="flex min-w-0 items-center gap-2">
                <ServerTowerIcon
                  hot={isHot}
                  optimal={isAtOptimal}
                  color={VM_COLORS[vIdx % VM_COLORS.length]}
                />
                <div className="min-w-0">
                  <div className="font-mono-tabular truncate text-xs font-bold leading-tight">
                    {vm.name}
                  </div>
                  <div className="truncate text-[10px] font-medium text-[var(--ink-secondary)]">
                    {vm.mips} MIPS
                  </div>
                </div>
              </div>

              <div className="relative h-10 w-full rounded-lg bg-[var(--bg-stage)]/80">
                {/* Garis putus-putus Makespan */}
                <div
                  className="pointer-events-none absolute top-0 bottom-0 z-10 border-l-2 border-dashed transition-all duration-300"
                  style={{
                    left: `${Math.min(100, (metrics.makespan / axisMax) * 100)}%`,
                    borderColor: isAtOptimal ? 'var(--ok-mint)' : 'var(--sa-heat)',
                  }}
                />

                {tasksOnVm.map((blk) => {
                  const leftPct = (blk.start / axisMax) * 100;
                  const widthPct = Math.max(1.8, (blk.dur / axisMax) * 100);
                  const isHighlighted = highlightTasks.includes(blk.taskId);
                  const isCoached = coachTaskId === blk.taskId;
                  const shortTag = `T${blk.taskId + 1}`;

                  if (interactive && onTaskClick) {
                    const btn = (
                      <button
                        type="button"
                        onClick={() => onTaskClick(blk.taskId)}
                        title={`Klik untuk pindahkan ${blk.name} (${formatId(blk.dur, 0)} s di ${vm.name})`}
                        className="font-mono-tabular flex h-8 w-full items-center justify-center overflow-hidden rounded-lg border text-xs font-extrabold transition-all duration-200 hover:-translate-y-0.5"
                        style={{
                          backgroundColor: isHighlighted
                            ? 'var(--coach-gold)'
                            : VM_COLORS[vIdx % VM_COLORS.length],
                          color: isHighlighted ? 'var(--coach-ink)' : 'var(--vm-block-ink)',
                          borderColor: 'rgba(15, 23, 42, 0.35)',
                        }}
                      >
                        <span className="truncate px-0.5 text-[11px]">
                          {shortTag}·{formatId(blk.dur, 0)}s
                        </span>
                      </button>
                    );

                    return (
                      <div
                        key={blk.taskId}
                        className="absolute top-1 z-20 transition-all duration-300"
                        style={{
                          left: `${leftPct}%`,
                          width: `calc(${widthPct}% - 3px)`,
                        }}
                      >
                        {isCoached ? (
                          <CoachTarget active label={coachTaskLabel} position="top" className="w-full">
                            {btn}
                          </CoachTarget>
                        ) : (
                          btn
                        )}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={blk.taskId}
                      title={`${blk.name}: ${formatId(blk.dur, 1)} s di ${vm.name}`}
                      className="font-mono-tabular absolute top-1 bottom-1 flex items-center justify-center overflow-hidden rounded-md text-[11px] font-extrabold transition-all duration-300"
                      style={{
                        left: `${leftPct}%`,
                        width: `calc(${widthPct}% - 2px)`,
                        backgroundColor: isHighlighted
                          ? 'var(--coach-gold)'
                          : VM_COLORS[vIdx % VM_COLORS.length],
                        color: isHighlighted ? 'var(--coach-ink)' : 'var(--vm-block-ink)',
                      }}
                    >
                      {!manyTasks && <span className="truncate px-0.5">{shortTag}</span>}
                    </div>
                  );
                })}
              </div>

              <div className="text-right">
                <div
                  className="font-mono-tabular text-xs font-bold"
                  style={{ color: isHot ? 'var(--sa-heat)' : 'var(--ink-primary)' }}
                >
                  {formatId(metrics.vmLoads[vIdx], manyTasks ? 1 : 0)}s
                </div>
                {isHot && (
                  <div
                    className="font-mono-tabular text-[10px] font-bold"
                    style={{ color: 'var(--sa-heat)' }}
                  >
                    Panas
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
