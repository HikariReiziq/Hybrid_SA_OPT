import { type ReactNode } from 'react';
import { usePresentationStore } from '../../store/presentationStore';

interface CoachTargetProps {
  active: boolean;
  label?: string;
  position?: 'top' | 'bottom' | 'right';
  children: ReactNode;
  className?: string;
}

/**
 * Membungkus tombol, paket task, atau area interaktif yang perlu diklik pengguna.
 * Saat mode Pemandu aktif, menampilkan halo emas lembut + ikon kursor animasi
 * yang secara fisik mengarahkan mata dan kursor audiens awam ke target berikutnya.
 */
export function CoachTarget({
  active,
  label = 'Klik di sini',
  position = 'top',
  children,
  className = '',
}: CoachTargetProps) {
  const coachEnabled = usePresentationStore((s) => s.coachEnabled);
  const show = coachEnabled && active;

  const badgePos =
    position === 'bottom'
      ? 'top-full left-1/2 -translate-x-1/2 mt-2'
      : position === 'right'
        ? 'left-full top-1/2 -translate-y-1/2 ml-2'
        : 'bottom-full left-1/2 -translate-x-1/2 mb-2';

  return (
    <div className={`relative inline-flex ${className}`}>
      <div className={`w-full rounded-xl ${show ? 'coach-halo' : ''}`}>{children}</div>
      {show && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute z-30 flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-extrabold shadow-lg ${badgePos}`}
          style={{
            backgroundColor: 'var(--coach-gold)',
            color: 'var(--coach-ink)',
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 20 20"
            className="coach-pointer shrink-0"
            fill="currentColor"
          >
            <path d="M4 2.5L16.5 9.5L10.8 11.2L8.6 17L4 2.5Z" />
          </svg>
          <span>{label}</span>
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
