import { type ReactNode, useEffect } from 'react';
import { SCENES } from '../../data/content';
import { usePresentationStore } from '../../store/presentationStore';

interface DeckStageProps {
  children: ReactNode;
}

export function DeckStage({ children }: DeckStageProps) {
  const sceneIndex = usePresentationStore((s) => s.sceneIndex);
  const beatIndex = usePresentationStore((s) => s.beatIndex);
  const setBeat = usePresentationStore((s) => s.setBeat);
  const nextStep = usePresentationStore((s) => s.nextStep);
  const prevStep = usePresentationStore((s) => s.prevStep);

  const scene = SCENES[sceneIndex];
  const caption = scene.beats[beatIndex] ?? '';
  const isFirst = sceneIndex === 0 && beatIndex === 0;
  const isLast = sceneIndex === SCENES.length - 1 && beatIndex === scene.beats.length - 1;

  // Hitung progres total seluruh beats
  const totalBeats = SCENES.reduce((acc, s) => acc + s.beats.length, 0);
  const passedBeats =
    SCENES.slice(0, sceneIndex).reduce((acc, s) => acc + s.beats.length, 0) + beatIndex + 1;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName ?? '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        nextStep();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prevStep();
      } else if (e.key === ' ' && tag !== 'BUTTON' && tag !== 'A') {
        e.preventDefault();
        nextStep();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [nextStep, prevStep]);

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-3 px-3 py-3 sm:px-5 sm:py-4">
      {/* Panggung Utama */}
      <main
        key={`${scene.id}-${beatIndex}`}
        className="transit-surface scene-enter flex flex-1 flex-col justify-between gap-4 p-4 sm:p-6 md:p-7"
        aria-label={`Adegan ${scene.number}: ${scene.shortTitle}`}
      >
        {/* Header Adegan + Indikator Beat */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className="font-mono-tabular rounded-md px-2.5 py-1 text-xs font-bold"
              style={{
                backgroundColor: 'var(--focus-signal)',
                color: 'var(--focus-signal-ink)',
              }}
            >
              ADEGAN {scene.number} / 05
            </span>
            <span className="font-mono-tabular text-xs font-semibold text-[var(--ink-secondary)]">
              {scene.shortTitle} · estimasi {scene.minutes}
            </span>
          </div>

          <div className="flex items-center gap-1.5" aria-label="Langkah dalam adegan">
            {scene.beats.map((_, bIdx) => {
              const isCurrent = bIdx === beatIndex;
              const isDone = bIdx < beatIndex;
              return (
                <button
                  key={bIdx}
                  type="button"
                  onClick={() => setBeat(bIdx)}
                  aria-label={`Langkah ${bIdx + 1} dari ${scene.beats.length}`}
                  aria-current={isCurrent ? 'step' : undefined}
                  className="font-mono-tabular flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors"
                  style={{
                    borderColor: 'var(--border-ink)',
                    backgroundColor: isCurrent
                      ? 'var(--focus-signal)'
                      : isDone
                        ? 'var(--ink-primary)'
                        : 'transparent',
                    color: isCurrent
                      ? 'var(--focus-signal-ink)'
                      : isDone
                        ? 'var(--bg-surface)'
                        : 'var(--ink-primary)',
                  }}
                >
                  {bIdx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Konten Adegan Aktif */}
        <div className="flex flex-1 flex-col justify-center">{children}</div>

        {/* Bilah Narasi Beat */}
        <div
          className="flex flex-wrap items-center gap-3 rounded-xl border-2 px-4 py-3"
          style={{
            borderColor: 'var(--border-subtle)',
            backgroundColor: 'var(--bg-elevated)',
          }}
        >
          <span className="font-mono-tabular shrink-0 text-xs font-bold text-[var(--ink-secondary)]">
            {String(passedBeats).padStart(2, '0')} / {String(totalBeats).padStart(2, '0')}
          </span>
          <p className="m-0 text-sm font-semibold leading-snug sm:text-base">{caption}</p>
        </div>
      </main>

      {/* Kontrol Navigasi Bawah */}
      <footer className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={prevStep}
          disabled={isFirst}
          className="btn-transit"
        >
          ← Sebelumnya
        </button>

        <div className="flex flex-1 flex-col items-center gap-1.5 px-2">
          <div
            className="h-2 w-full max-w-md overflow-hidden rounded-full border"
            style={{
              borderColor: 'var(--border-ink)',
              backgroundColor: 'var(--bg-elevated)',
            }}
          >
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${(passedBeats / totalBeats) * 100}%`,
                backgroundColor: 'var(--opt-rail)',
              }}
            />
          </div>
          <span className="font-mono-tabular hidden text-[11px] font-medium text-[var(--ink-secondary)] sm:inline">
            Keyboard: ← / → atau Spasi untuk pindah langkah
          </span>
        </div>

        <button
          type="button"
          onClick={nextStep}
          disabled={isLast}
          className="btn-transit btn-transit-primary"
        >
          Berikutnya →
        </button>
      </footer>
    </div>
  );
}
