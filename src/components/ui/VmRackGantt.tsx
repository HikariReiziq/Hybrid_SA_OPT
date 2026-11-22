import { type CloudProblem, evaluateSchedule } from '../../lib/algorithms/cloudModel';
import { formatId } from '../../lib/algorithms/rng';

interface VmRackGanttProps {
  problem: CloudProblem;
  assignment: readonly number[];
  scaleMax?: number;
  highlightTasks?: readonly number[];
  interactive?: boolean;
  onTaskClick?: (taskId: number) => void;
  optimalBound?: number;
  compact?: boolean;
  title?: string;
}

const VM_COLORS = [
  'var(--vm-0)',
  'var(--vm-1)',
  'var(--vm-2)',
  'var(--vm-3)',
  'var(--vm-4)',
  'var(--vm-5)',
];

/** Ikon stasiun geometris ala Mini Metro untuk membedakan tiap jalur VM tanpa bergantung pada warna saja */
function StationShape({ index }: { index: number }) {
  const shape = index % 4;
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className="shrink-0">
      {shape === 0 && (
        <circle
          cx="8"
          cy="8"
          r="5.5"
          fill="var(--bg-elevated)"
          stroke={VM_COLORS[index % VM_COLORS.length]}
          strokeWidth="3"
        />
      )}
      {shape === 1 && (
        <rect
          x="3"
          y="3"
          width="10"
          height="10"
          rx="1.5"
          fill="var(--bg-elevated)"
          stroke={VM_COLORS[index % VM_COLORS.length]}
          strokeWidth="3"
        />
      )}
      {shape === 2 && (
        <polygon
          points="8,2.2 14,13.2 2,13.2"
          fill="var(--bg-elevated)"
          stroke={VM_COLORS[index % VM_COLORS.length]}
          strokeWidth="2.6"
        />
      )}
      {shape === 3 && (
        <polygon
          points="8,2 14,8 8,14 2,8"
          fill="var(--bg-elevated)"
          stroke={VM_COLORS[index % VM_COLORS.length]}
          strokeWidth="2.6"
        />
      )}
    </svg>
  );
}

export function VmRackGantt({
  problem,
  assignment,
  scaleMax,
  highlightTasks = [],
  interactive = false,
  onTaskClick,
  optimalBound,
  compact = false,
  title,
}: VmRackGanttProps) {
  const metrics = evaluateSchedule(problem, assignment);
  const axisMax = Math.max(scaleMax ?? metrics.makespan * 1.12, metrics.makespan, 1);
  const isAtOptimal =
    optimalBound !== undefined && metrics.makespan <= optimalBound + 1e-6;
  const manyTasks = problem.tasks.length > 10;

  return (
    <div className={`transit-card flex flex-col gap-2.5 ${compact ? 'p-3' : 'p-4'}`}>
      {title && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono-tabular text-xs font-bold uppercase tracking-wider text-[var(--ink-secondary)]">
            {title}
          </span>
          <div className="flex items-center gap-2">
            <span
              className="font-mono-tabular rounded-md border px-2 py-0.5 text-xs font-bold"
              style={{
                borderColor: isAtOptimal ? 'var(--ok-balance)' : 'var(--sa-heat)',
                backgroundColor: isAtOptimal
                  ? 'var(--ok-balance-soft)'
                  : 'var(--sa-heat-soft)',
                color: isAtOptimal ? 'var(--ok-balance)' : 'var(--sa-heat)',
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

      <div className="relative flex flex-col gap-2">
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
              className={`grid grid-cols-[92px_1fr_54px] items-center gap-2 rounded-xl border-2 px-2.5 py-2 transition-colors duration-200 ${
                isHot ? 'vm-rack-hot' : isAtOptimal ? 'vm-rack-cool' : ''
              }`}
              style={{
                borderColor: isHot
                  ? 'var(--sa-heat)'
                  : isAtOptimal
                    ? 'var(--ok-balance)'
                    : 'var(--border-subtle)',
                backgroundColor:
                  isHot || isAtOptimal ? undefined : 'var(--bg-surface)',
              }}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <StationShape index={vIdx} />
                <div className="min-w-0">
                  <div className="font-mono-tabular truncate text-xs font-bold leading-tight">
                    {vm.name}
                  </div>
                  <div className="truncate text-[10px] font-medium text-[var(--ink-secondary)]">
                    {vm.mips} MIPS
                  </div>
                </div>
              </div>

              <div className="relative h-9 w-full rounded-lg bg-[var(--bg-muted)]/70">
                {/* Garis rel latar ala Mini Metro */}
                <div
                  className="pointer-events-none absolute top-1/2 left-0 right-0 h-[3px] -translate-y-1/2 rounded-full opacity-35"
                  style={{ backgroundColor: VM_COLORS[vIdx % VM_COLORS.length] }}
                />

                {/* Garis putus-putus Makespan */}
                <div
                  className="pointer-events-none absolute top-0 bottom-0 z-10 border-l-2 border-dashed"
                  style={{
                    left: `${Math.min(100, (metrics.makespan / axisMax) * 100)}%`,
                    borderColor: isAtOptimal ? 'var(--ok-balance)' : 'var(--sa-heat)',
                  }}
                />

                {/* Blok Task */}
                {tasksOnVm.map((blk) => {
                  const leftPct = (blk.start / axisMax) * 100;
                  const widthPct = Math.max(1.5, (blk.dur / axisMax) * 100);
                  const isHighlighted = highlightTasks.includes(blk.taskId);
                  const shortTag = `T${blk.taskId + 1}`;

                  if (interactive && onTaskClick) {
                    return (
                      <button
                        key={blk.taskId}
                        type="button"
                        onClick={() => onTaskClick(blk.taskId)}
                        title={`Klik untuk pindahkan ${blk.name} (${formatId(blk.dur, 0)} s di ${vm.name})`}
                        className="font-mono-tabular absolute top-1 bottom-1 z-20 flex items-center justify-center overflow-hidden rounded-md border-2 text-xs font-bold transition-all duration-200 hover:-translate-y-0.5"
                        style={{
                          left: `${leftPct}%`,
                          width: `calc(${widthPct}% - 2px)`,
                          backgroundColor: isHighlighted
                            ? 'var(--focus-signal)'
                            : VM_COLORS[vIdx % VM_COLORS.length],
                          color: isHighlighted ? 'var(--focus-signal-ink)' : '#ffffff',
                          borderColor: 'var(--border-ink)',
                        }}
                      >
                        <span className="truncate px-1">
                          {shortTag} ({formatId(blk.dur, 0)}s)
                        </span>
                      </button>
                    );
                  }

                  return (
                    <div
                      key={blk.taskId}
                      title={`${blk.name}: ${formatId(blk.dur, 1)} s di ${vm.name}`}
                      className="font-mono-tabular absolute top-1 bottom-1 flex items-center justify-center overflow-hidden rounded border text-[11px] font-bold transition-all duration-200"
                      style={{
                        left: `${leftPct}%`,
                        width: `calc(${widthPct}% - 1.5px)`,
                        backgroundColor: isHighlighted
                          ? 'var(--focus-signal)'
                          : VM_COLORS[vIdx % VM_COLORS.length],
                        color: isHighlighted ? 'var(--focus-signal-ink)' : '#ffffff',
                        borderColor: 'var(--border-ink)',
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
                    className="font-mono-tabular text-[9px] font-bold uppercase"
                    style={{ color: 'var(--sa-heat)' }}
                  >
                    panas
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
