import { type ReactNode } from 'react';
import { usePresentationStore } from '../../store/presentationStore';

interface CoachTargetProps {
  active: boolean;
  label?: string;
  position?: 'top' | 'bottom' | 'right' | 'left';
  align?: 'center' | 'start' | 'end';
  children: ReactNode;
  className?: string;
}

/**
 * Membungkus tombol, paket task, atau area interaktif yang perlu diklik pengguna.
 * Saat mode Pemandu aktif, menampilkan halo emas + badge berkait segitiga (caret)
 * dengan panah animasi yang SELALU menunjuk tepat ke arah targetnya (bukan menyerong).
 */
export function CoachTarget({
  active,
  label = 'Klik di sini',
  position = 'top',
  align = 'center',
  children,
  className = '',
}: CoachTargetProps) {
  const coachEnabled = usePresentationStore((s) => s.coachEnabled);
  const show = coachEnabled && active;

  const horizAlign =
    align === 'start'
      ? 'left-0'
      : align === 'end'
        ? 'right-0'
        : 'left-1/2 -translate-x-1/2';

  const caretHoriz =
    align === 'start'
      ? 'left-4'
      : align === 'end'
        ? 'right-4'
        : 'left-1/2 -translate-x-1/2';

  const badgePos =
    position === 'bottom'
      ? `top-full ${horizAlign} mt-2.5`
      : position === 'right'
        ? 'left-full top-1/2 -translate-y-1/2 ml-2.5'
        : position === 'left'
          ? 'right-full top-1/2 -translate-y-1/2 mr-2.5'
          : `bottom-full ${horizAlign} mb-2.5`;

  const bounceClass =
    position === 'bottom'
      ? 'coach-bounce-up'
      : position === 'right'
        ? 'coach-bounce-left'
        : position === 'left'
          ? 'coach-bounce-right'
          : 'coach-bounce-down';

  // Ikon panah jelas yang menunjuk tepat ke arah elemen target
  const arrowPath =
    position === 'bottom'
      ? 'M10 3v14M10 3l-5 5M10 3l5 5' // menunjuk KE ATAS (target ada di atas badge)
      : position === 'right'
        ? 'M3 10h14M3 10l5-5M3 10l5 5' // menunjuk KE KIRI (target ada di kiri badge)
        : position === 'left'
          ? 'M17 10H3M17 10l-5-5M17 10l-5 5' // menunjuk KE KANAN (target ada di kanan badge)
          : 'M10 17V3M10 17l-5-5M10 17l5-5'; // menunjuk KE BAWAH (target ada di bawah badge)

  return (
    <div className={`relative inline-flex ${className}`}>
      <div className={`w-full rounded-xl ${show ? 'coach-halo' : ''}`}>{children}</div>
      {show && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute z-30 ${badgePos}`}
        >
          <div
            className={`relative flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-extrabold shadow-lg ${bounceClass}`}
            style={{
              backgroundColor: 'var(--coach-gold)',
              color: 'var(--coach-ink)',
            }}
          >
            {/* Segitiga penghubung (caret) menempel di sisi badge yang menghadap target */}
            {position === 'top' && (
              <span
                className={`absolute -bottom-1.5 h-3 w-3 rotate-45 ${caretHoriz}`}
                style={{ backgroundColor: 'var(--coach-gold)' }}
              />
            )}
            {position === 'bottom' && (
              <span
                className={`absolute -top-1.5 h-3 w-3 rotate-45 ${caretHoriz}`}
                style={{ backgroundColor: 'var(--coach-gold)' }}
              />
            )}
            {position === 'right' && (
              <span
                className="absolute -left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rotate-45"
                style={{ backgroundColor: 'var(--coach-gold)' }}
              />
            )}
            {position === 'left' && (
              <span
                className="absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rotate-45"
                style={{ backgroundColor: 'var(--coach-gold)' }}
              />
            )}

            <svg
              width="13"
              height="13"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="relative z-10 shrink-0"
            >
              <path d={arrowPath} />
            </svg>
            <span className="relative z-10">{label}</span>
          </div>
        </div>
      )}
    </div>
  );
}

interface CoachMissionBannerProps {
  stepLabel: string;
  instruction: string;
  completed?: boolean;
  doneMessage?: string;
}

/**
 * Bilah instruksi pemandu di dalam adegan agar pendengar awam tidak pernah bingung
 * harus mengklik apa atau apa makna hasil yang baru saja terjadi.
 */
export function CoachMissionBanner({
  stepLabel,
  instruction,
  completed = false,
  doneMessage,
}: CoachMissionBannerProps) {
  const coachEnabled = usePresentationStore((s) => s.coachEnabled);
  if (!coachEnabled) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-wrap items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm"
      style={{
        borderColor: completed ? 'var(--ok-mint)' : 'var(--coach-gold)',
        backgroundColor: completed ? 'var(--ok-mint-soft)' : 'var(--bg-inset)',
      }}
    >
      <span
        className="font-mono-tabular inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold"
        style={{
          backgroundColor: completed ? 'var(--ok-mint)' : 'var(--coach-gold)',
          color: completed ? 'var(--on-mint)' : 'var(--coach-ink)',
        }}
      >
        {completed ? 'Selesai ✓' : stepLabel}
      </span>
      <span className="font-semibold leading-snug text-[var(--ink-primary)]">
        {completed && doneMessage ? doneMessage : instruction}
      </span>
    </div>
  );
}
