import { type ReactNode, useEffect, useState } from 'react';
import { SCENES } from '../../data/content';
import { usePresentationStore } from '../../store/presentationStore';

interface VideoTheaterShellProps {
  children: ReactNode;
}

/**
 * Kerangka pemutar "Film Animasi Interaktif" bergaya video player modern:
 * - Panggung widescreen tanpa kotak slide bergaris hitam ala presentasi statis.
 * - Subtitle narasi sinematik di bagian bawah panggung.
 * - Timeline chapter scrubbable (Ep 1 s.d. Ep 5) + tombol Putar Otomatis / Jeda.
 */
export function VideoTheaterShell({ children }: VideoTheaterShellProps) {
  const sceneIndex = usePresentationStore((s) => s.sceneIndex);
  const beatIndex = usePresentationStore((s) => s.beatIndex);
  const autoPlay = usePresentationStore((s) => s.autoPlay);
  const setScene = usePresentationStore((s) => s.setScene);
  const nextStep = usePresentationStore((s) => s.nextStep);
  const prevStep = usePresentationStore((s) => s.prevStep);
  const toggleAutoPlay = usePresentationStore((s) => s.toggleAutoPlay);
  const setAutoPlay = usePresentationStore((s) => s.setAutoPlay);

  const [beatProgress, setBeatProgress] = useState(0);

  const scene = SCENES[sceneIndex];
  const caption = scene.beats[beatIndex] ?? '';
  const durationMs = scene.beatDurationMs[beatIndex] ?? 10000;

  const isFirst = sceneIndex === 0 && beatIndex === 0;
  const isLast = sceneIndex === SCENES.length - 1 && beatIndex === scene.beats.length - 1;

  // Flat list semua chapter-beat untuk scrubber bergaya YouTube
  const timelineSlots = SCENES.flatMap((sc, sIdx) =>
    sc.beats.map((_, bIdx) => ({
      sIdx,
      bIdx,
      label: `Ep ${sIdx + 1} · Bagian ${bIdx + 1}`,
    })),
  );
  const activeSlotIdx =
    SCENES.slice(0, sceneIndex).reduce((sum, sc) => sum + sc.beats.length, 0) + beatIndex;

  // Estimasi stempel waktu presentasi 8 menit (480 detik)
  const estSec = Math.round(((activeSlotIdx + 1) / timelineSlots.length) * 480);
  const estTimeStr = `${String(Math.floor(estSec / 60)).padStart(2, '0')}:${String(
    estSec % 60,
  ).padStart(2, '0')}`;

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName ?? '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        setAutoPlay(false);
        nextStep();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setAutoPlay(false);
        prevStep();
      } else if (e.key === ' ' && tag !== 'BUTTON' && tag !== 'A') {
        e.preventDefault();
        toggleAutoPlay();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [nextStep, prevStep, toggleAutoPlay, setAutoPlay]);

  // Auto-play timer (berjalan layaknya pemutar video animasi)
  useEffect(() => {
    setBeatProgress(0);
    if (!autoPlay) return;
    if (isLast) {
      setAutoPlay(false);
      return;
    }

    const startedAt = performance.now();
    const tick = window.setInterval(() => {
      const pct = Math.min(100, ((performance.now() - startedAt) / durationMs) * 100);
      setBeatProgress(pct);
      if (pct >= 100) {
        window.clearInterval(tick);
        nextStep();
      }
    }, 100);

    return () => window.clearInterval(tick);
  }, [autoPlay, sceneIndex, beatIndex, durationMs, isLast, nextStep, setAutoPlay]);

  return (
    <div className="mx-auto flex w-full max-w-[1320px] flex-1 flex-col gap-3 px-3 py-3 sm:px-5 sm:py-4">
      {/* Panggung Teater Film Interaktif */}
      <main
        key={`${scene.id}-${beatIndex}`}
        className="theater-stage stage-enter flex flex-1 flex-col justify-between gap-4 p-4 sm:p-6 md:p-7"
        aria-label={`Episode ${sceneIndex + 1}: ${scene.shortTitle}`}
      >
        {/* Info Episode Minimalis di Pojok Atas */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 text-xs font-bold text-[var(--ink-secondary)]">
            <span
              className="font-mono-tabular rounded-md px-2 py-0.5 text-[11px] font-bold"
              style={{
                backgroundColor: 'var(--opt-cyan-soft)',
                color: 'var(--opt-cyan)',
              }}
            >
              Episode {sceneIndex + 1} / 5
            </span>
            <span>{scene.shortTitle}</span>
            <span className="font-mono-tabular opacity-75">· {scene.minutes}</span>
          </div>

          <div className="font-mono-tabular text-xs font-semibold text-[var(--ink-secondary)]">
            Adegan {beatIndex + 1} dari {scene.beats.length}
          </div>
        </div>

        {/* Area Animasi & Interaksi */}
        <div className="flex flex-1 flex-col justify-center">{children}</div>

        {/* Subtitle Narasi Gaya Film Dokumenter (1-satunya elemen translucent di halaman) */}
        <div
          className="rounded-xl border px-4 py-2.5 backdrop-blur-sm"
          style={{
            borderColor: 'var(--border-line)',
            backgroundColor: 'var(--bg-panel)',
          }}
        >
          <p className="m-0 text-center text-sm font-semibold leading-snug sm:text-[15px]">
            {caption}
          </p>
        </div>
      </main>

      {/* Bilah Pemutar Video (Timeline Chapters + Play/Pause Auto-Demo + Prev/Next) */}
      <footer className="studio-panel flex flex-col gap-2.5 px-4 py-3">
        {/* Segmented Chapter Scrubber */}
        <div className="flex items-center gap-1" role="group" aria-label="Timeline episode">
          {timelineSlots.map((slot, idx) => {
            const isPast = idx < activeSlotIdx;
            const isActive = idx === activeSlotIdx;
            return (
              <button
                key={`${slot.sIdx}-${slot.bIdx}`}
                type="button"
                title={slot.label}
                aria-label={slot.label}
                aria-current={isActive ? 'step' : undefined}
                onClick={() => {
                  setAutoPlay(false);
                  setScene(slot.sIdx, slot.bIdx);
                }}
                className="group relative h-3 flex-1 overflow-hidden rounded-full bg-[var(--bg-inset)]"
              >
                <span
                  className="block h-full rounded-full transition-all duration-150"
                  style={{
                    width: isPast ? '100%' : isActive ? `${autoPlay ? beatProgress : 100}%` : '0%',
                    backgroundColor: isActive ? 'var(--coach-gold)' : 'var(--opt-cyan)',
                  }}
                />
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleAutoPlay}
              className={`btn-studio !min-h-[40px] text-xs ${
                autoPlay ? 'btn-studio-gold' : 'btn-studio-cyan'
              }`}
            >
              {autoPlay ? '❚❚ Jeda Film' : '▶ Putar Otomatis'}
            </button>

            <button
              type="button"
              onClick={() => {
                setAutoPlay(false);
                prevStep();
              }}
              disabled={isFirst}
              className="btn-studio !min-h-[40px] text-xs"
            >
              ← Mundur
            </button>

            <button
              type="button"
              onClick={() => {
                setAutoPlay(false);
                nextStep();
              }}
              disabled={isLast}
              className="btn-studio !min-h-[40px] text-xs"
            >
              Lanjut →
            </button>
          </div>

          <div className="font-mono-tabular flex items-center gap-3 text-xs text-[var(--ink-secondary)]">
            <span>
              {estTimeStr} / 08:00
            </span>
            <span className="hidden sm:inline">
              Spasi: Putar/Jeda · Panah ← / →: Pindah adegan
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
