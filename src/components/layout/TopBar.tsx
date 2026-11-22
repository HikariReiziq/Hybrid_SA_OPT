import { SCENES } from '../../data/content';
import { usePresentationStore, type ViewMode } from '../../store/presentationStore';

export function TopBar() {
  const viewMode = usePresentationStore((s) => s.viewMode);
  const sceneIndex = usePresentationStore((s) => s.sceneIndex);
  const theme = usePresentationStore((s) => s.theme);
  const coachEnabled = usePresentationStore((s) => s.coachEnabled);
  const quizzes = usePresentationStore((s) => s.quizzes);

  const setViewMode = usePresentationStore((s) => s.setViewMode);
  const setScene = usePresentationStore((s) => s.setScene);
  const toggleTheme = usePresentationStore((s) => s.toggleTheme);
  const toggleCoach = usePresentationStore((s) => s.toggleCoach);

  const scoreCount = [
    quizzes.q1.firstAttemptCorrect,
    quizzes.q2.firstAttemptCorrect,
    quizzes.q3.firstAttemptCorrect,
  ].filter((v) => v === true).length;

  const modes: Array<{ id: ViewMode; label: string }> = [
    { id: 'video', label: 'Presentasi' },
    { id: 'sandbox', label: 'Sandbox Q&A' },
  ];

  const epShort = ['1 · Masalah', '2 · Dasar SA', '3 · Dasar 2-Opt', '4 · Hybrid Live', '5 · Hasil'];

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{
        backgroundColor: 'var(--bg-stage)',
        borderColor: 'var(--border-line)',
      }}
    >
      <div className="mx-auto flex max-w-[1380px] flex-wrap items-center justify-between gap-2 px-3 py-2 sm:px-5 xl:flex-nowrap">
        {/* Identitas Presentasi */}
        <button
          type="button"
          onClick={() => {
            setViewMode('video');
            setScene(0, 0);
          }}
          className="flex min-h-[42px] shrink-0 items-center gap-2.5 rounded-xl px-1 text-left"
        >
          <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true" className="shrink-0">
            <rect width="32" height="32" rx="10" fill="var(--bg-inset)" />
            <path d="M7 11 H25" stroke="var(--sa-heat)" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M7 21 H25" stroke="var(--opt-cyan)" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="11" cy="11" r="3" fill="var(--coach-gold)" />
            <circle cx="21" cy="21" r="3" fill="var(--ok-mint)" />
          </svg>
          <div>
            <div className="font-display text-sm font-extrabold leading-tight">
              Hybrid SA + 2-Opt
            </div>
            <div className="font-mono-tabular text-[10px] font-medium text-[var(--ink-secondary)]">
              SOKA Kelompok 4 · 10 mnt
            </div>
          </div>
        </button>

        {/* Chapter Episodes (desktop) */}
        {viewMode === 'video' && (
          <nav aria-label="Daftar Episode" className="hidden items-center gap-1 lg:flex">
            {SCENES.map((sc, idx) => {
              const active = sceneIndex === idx;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => setScene(idx, 0)}
                  className="min-h-[34px] whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-bold transition-colors"
                  style={{
                    backgroundColor: active ? 'var(--opt-cyan-soft)' : 'transparent',
                    color: active ? 'var(--opt-cyan)' : 'var(--ink-secondary)',
                    border: active ? '1px solid var(--opt-cyan)' : '1px solid transparent',
                  }}
                >
                  {epShort[idx] ?? `Ep ${idx + 1}`}
                </button>
              );
            })}
          </nav>
        )}

        {/* Kontrol Kanan: 2 Mode Fokus + Toggle Pemandu + Skor 3 Cek Paham + Theme */}
        <div className="flex flex-wrap items-center gap-1.5 xl:shrink-0">
          <div
            role="tablist"
            aria-label="Mode tampilan"
            className="inline-flex rounded-xl border p-0.5"
            style={{
              borderColor: 'var(--border-line)',
              backgroundColor: 'var(--bg-inset)',
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
                  className="min-h-[34px] rounded-lg px-3 py-1 text-xs font-bold transition-colors"
                  style={{
                    backgroundColor: active ? 'var(--opt-cyan)' : 'transparent',
                    color: active ? 'var(--on-cyan)' : 'var(--ink-primary)',
                  }}
                >
                  {m.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={toggleCoach}
            aria-pressed={coachEnabled}
            className="min-h-[38px] rounded-xl border px-2.5 py-1 text-xs font-bold transition-colors"
            style={{
              borderColor: coachEnabled ? 'var(--coach-gold)' : 'var(--border-line)',
              backgroundColor: coachEnabled ? 'var(--coach-gold)' : 'var(--bg-panel)',
              color: coachEnabled ? 'var(--coach-ink)' : 'var(--ink-secondary)',
            }}
          >
            Pemandu: {coachEnabled ? 'ON' : 'OFF'}
          </button>

          <span
            className="font-mono-tabular hidden rounded-xl border px-2.5 py-1.5 text-xs font-bold sm:inline-block"
            style={{
              borderColor: 'var(--border-line)',
              backgroundColor: 'var(--bg-panel)',
              color: 'var(--ink-primary)',
            }}
          >
            Skor {scoreCount}/3
          </span>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Pindah ke mode terang' : 'Pindah ke mode gelap'}
            className="btn-studio !min-h-[38px] !px-3 !py-1 text-xs"
          >
            {theme === 'dark' ? 'Terang' : 'Gelap'}
          </button>
        </div>
      </div>
    </header>
  );
}
