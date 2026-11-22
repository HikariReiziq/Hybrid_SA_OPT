import { formatId } from '../../lib/algorithms/rng';

export interface ConvergenceSeries {
  id: string;
  label: string;
  color: string;
  dashed?: boolean;
  points: ReadonlyArray<{ x: number; y: number }>;
}

interface ConvergenceSvgProps {
  series: readonly ConvergenceSeries[];
  referenceLine?: { label: string; value: number; color: string };
  xLabel: string;
  height?: number;
  title?: string;
  readingHint?: string;
}

export function ConvergenceSvg({
  series,
  referenceLine,
  xLabel,
  height = 175,
  title,
  readingHint = 'Cara baca: Makin ke BAWAH = Makespan makin kecil (Makin CEPAT!)',
}: ConvergenceSvgProps) {
  const W = 920;
  const H = height;
  const L = 74;
  const R = 18;
  const T = 16;
  const B = 34;

  const allX = series.flatMap((s) => s.points.map((p) => p.x));
  const allY = series
    .flatMap((s) => s.points.map((p) => p.y))
    .concat(referenceLine ? [referenceLine.value] : []);

  const maxX = Math.max(1, ...allX);
  const minYRaw = allY.length > 0 ? Math.min(...allY) : 0;
  const maxYRaw = allY.length > 0 ? Math.max(...allY) : 100;
  const pad = Math.max(1, (maxYRaw - minYRaw) * 0.12);
  const loY = Math.max(0, minYRaw - pad);
  const hiY = maxYRaw + pad;

  const toX = (x: number) => L + (x / maxX) * (W - L - R);
  const toY = (y: number) => T + ((hiY - y) / Math.max(1e-6, hiY - loY)) * (H - T - B);
  const ticks = [0, 1, 2, 3].map((k) => loY + ((hiY - loY) * k) / 3);

  return (
    <div className="studio-panel flex flex-col gap-2 p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {title && <span className="text-xs font-bold text-[var(--ink-primary)]">{title}</span>}
          <span
            className="font-mono-tabular rounded-md px-2 py-0.5 text-[11px] font-bold"
            style={{
              backgroundColor: 'var(--ok-mint-soft)',
              color: 'var(--ok-mint)',
            }}
          >
            ↓ {readingHint}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
          {series.map((s) => {
            const last = s.points[s.points.length - 1];
            return (
              <span key={s.id} className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block h-1 w-4 rounded-full"
                  style={{
                    backgroundColor: s.color,
                    borderBottom: s.dashed ? `2px dashed ${s.color}` : undefined,
                  }}
                />
                <span>{s.label}</span>
                {last && (
                  <strong className="font-mono-tabular" style={{ color: s.color }}>
                    {formatId(last.y, 1)}s
                  </strong>
                )}
              </span>
            );
          })}
          {referenceLine && (
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-0.5 w-4"
                style={{ borderTop: `2px dotted ${referenceLine.color}` }}
              />
              <span>{referenceLine.label}</span>
              <strong className="font-mono-tabular" style={{ color: referenceLine.color }}>
                {formatId(referenceLine.value, 1)}s
              </strong>
            </span>
          )}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full overflow-visible"
        role="img"
        aria-label={title ?? 'Grafik konvergensi makespan'}
      >
        {ticks.map((val, idx) => (
          <g key={idx}>
            <line
              x1={L}
              x2={W - R}
              y1={toY(val)}
              y2={toY(val)}
              stroke="var(--border-line)"
              strokeWidth="1"
            />
            <text
              x={L - 8}
              y={toY(val) + 4}
              textAnchor="end"
              fill="var(--ink-secondary)"
              fontSize="11"
              fontFamily="var(--font-mono)"
            >
              {formatId(val, 0)}s
            </text>
          </g>
        ))}

        {/* Label bantuan sumbu-Y: Lambat vs Cepat */}
        <text
          x={L + 6}
          y={T + 11}
          fill="var(--sa-heat)"
          fontSize="10"
          fontWeight="700"
          fontFamily="var(--font-mono)"
        >
          ↑ Lebih Lambat
        </text>
        <text
          x={L + 6}
          y={H - B - 5}
          fill="var(--ok-mint)"
          fontSize="10"
          fontWeight="700"
          fontFamily="var(--font-mono)"
        >
          ↓ Lebih Cepat (Bagus!)
        </text>

        {referenceLine && (
          <line
            x1={L}
            x2={W - R}
            y1={toY(referenceLine.value)}
            y2={toY(referenceLine.value)}
            stroke={referenceLine.color}
            strokeWidth="2"
            strokeDasharray="4 4"
          />
        )}

        {series.map((s) => {
          if (s.points.length === 0) return null;
          const d = s.points
            .map((pt, i) => `${i === 0 ? 'M' : 'L'}${toX(pt.x).toFixed(1)} ${toY(pt.y).toFixed(1)}`)
            .join(' ');
          const last = s.points[s.points.length - 1];
          return (
            <g key={s.id}>
              <path
                d={d}
                fill="none"
                stroke={s.color}
                strokeWidth="3.2"
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeDasharray={s.dashed ? '8 5' : undefined}
              />
              <circle
                cx={toX(last.x)}
                cy={toY(last.y)}
                r="5"
                fill={s.color}
                stroke="var(--bg-panel)"
                strokeWidth="2"
              />
            </g>
          );
        })}

        <text
          x={L}
          y={H - 8}
          fill="var(--ink-secondary)"
          fontSize="11"
          fontFamily="var(--font-mono)"
        >
          0
        </text>
        <text
          x={(L + W - R) / 2}
          y={H - 8}
          textAnchor="middle"
          fill="var(--ink-secondary)"
          fontSize="11"
          fontFamily="var(--font-mono)"
        >
          {xLabel}
        </text>
        <text
          x={W - R}
          y={H - 8}
          textAnchor="end"
          fill="var(--ink-secondary)"
          fontSize="11"
          fontFamily="var(--font-mono)"
        >
          {formatId(maxX, 0)}
        </text>
      </svg>
    </div>
  );
}
