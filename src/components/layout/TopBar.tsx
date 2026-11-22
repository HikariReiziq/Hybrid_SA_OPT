import { SCENES } from '../../data/content';
import { usePresentationStore, type ViewMode } from '../../store/presentationStore';

export function TopBar() {
  const viewMode = usePresentationStore((s) => s.viewMode);
  const sceneIndex = usePresentationStore((s) => s.sceneIndex);
  const theme = usePresentationStore((s) => s.theme);
  const quizzes = usePresentationStore((s) => s.quizzes);
  const setViewMode = usePresentationStore((s) => s.setViewMode);
  const setScene = usePresentationStore((s) => s.setScene);
  const toggleTheme = usePresentationStore((s) => s.toggleTheme);

  const scoreCount = [quizzes.q1.firstAttemptCorrect, quizzes.q2.firstAttemptCorrect].filter(
    (v) => v === true,
  ).length;

  const modes: Array<{ id: ViewMode; label: string }> = [
    { id: 'deck', label: 'Presentasi' },
    { id: 'explore', label: 'Eksplorasi' },
    { id: 'sandbox', label: 'Sandbox Q&A' },
  ];

  return (
    <header
      className="sticky top-0 z-40 border-b-2"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-ink)',
      }}
    >
      <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-2 px-3 py-2 sm:px-5 xl:flex-nowrap">
        {/* Identitas Mini Metro 2-Rail */}
        <button
          type="button"
          onClick={() => {
            setViewMode('deck');
            setScene(0, 0);
          }}
          className="flex min-h-[42px] shrink-0 items-center gap-2 rounded-lg px-1 text-left"
        >
          <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true" className="shrink-0">
            <rect width="32" height="32" rx="8" fill="var(--ink-primary)" />
            <path d="M7 11 H25" stroke="var(--sa-heat)" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M7 21 H25" stroke="var(--opt-rail)" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="11" cy="11" r="3" fill="var(--bg-surface)" />
            <circle cx="21" cy="21" r="3" fill="var(--focus-signal)" />
          </svg>
          <div>
            <div className="font-display text-sm font-extrabold leading-tight">
              Hybrid SA + 2-Opt
            </div>
            <div className="font-mono-tabular text-[10px] font-medium text-[var(--ink-secondary)]">
              SOKA · Kelompok 4 · ~8 mnt
            </div>
          </div>
        </button>

        {/* Pintasan 5 Adegan (khusus desktop saat bukan sandbox) */}
        {viewMode !== 'sandbox' && (
          <nav aria-label="Daftar 5 Adegan" className="hidden items-center gap-0.5 xl:flex">
            {SCENES.map((sc, idx) => {
              const active = viewMode === 'deck' && sceneIndex === idx;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => {
                    if (viewMode === 'explore') {
                      const el = document.getElementById(`scene-${sc.id}`);
                      el?.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      setScene(idx, 0);
                    }
                  }}
                  className="font-mono-tabular min-h-[34px] whitespace-nowrap rounded-lg border-2 px-2 py-1 text-[11px] font-bold transition-colors"
                  style={{
                    borderColor: active ? 'var(--border-ink)' : 'transparent',
                    backgroundColor: active ? 'var(--focus-signal)' : 'transparent',
                    color: active ? 'var(--focus-signal-ink)' : 'var(--ink-secondary)',
                  }}
                >
                  {sc.number} {sc.shortTitle}
                </button>
              );
            })}
          </nav>
        )}

        {/* Mode Switcher + Skor + Theme Toggle */}
        <div className="flex flex-wrap items-center gap-1.5 xl:shrink-0">
          <div
            role="tablist"
            aria-label="Mode tampilan"
            className="inline-flex rounded-xl border-2 p-0.5"
            style={{
              borderColor: 'var(--border-ink)',
              backgroundColor: 'var(--bg-muted)',
            }}
          >
            {modes.map((m) => {
              const active = viewMode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setViewMode(m.id)}
                  className="min-h-[36px] rounded-lg px-2.5 py-1 text-xs font-bold transition-colors sm:px-3"
                  style={{
                    backgroundColor: active ? 'var(--ink-primary)' : 'transparent',
                    color: active ? 'var(--bg-surface)' : 'var(--ink-primary)',
                  }}
                >
                  {m.label}
                </button>
              );
            })}
          </div>

          <span
            className="font-mono-tabular hidden rounded-lg border-2 px-2.5 py-1.5 text-xs font-bold sm:inline-block"
            style={{
              borderColor: 'var(--border-subtle)',
              backgroundColor: 'var(--bg-elevated)',
              color: 'var(--ink-primary)',
            }}
            title="Skor Kuis (percobaan pertama)"
          >
            Kuis {scoreCount}/2
          </span>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Aktifkan mode gelap' : 'Aktifkan mode terang'}
            className="btn-transit !min-h-[40px] !px-3 !py-1 text-xs"
          >
            {theme === 'light' ? 'Gelap' : 'Terang'}
          </button>
        </div>
      </div>
    </header>
  );
}
