import { type QuizQuestion } from '../../data/content';
import { usePresentationStore } from '../../store/presentationStore';
import { CoachMissionBanner, CoachTarget } from './GuidedCoach';

interface QuizCardProps {
  quiz: QuizQuestion;
  nextLabel?: string;
}

export function QuizCard({ quiz, nextLabel = 'Lanjut ke Materi Berikutnya →' }: QuizCardProps) {
  const record = usePresentationStore((s) => s.quizzes[quiz.id]);
  const answerQuiz = usePresentationStore((s) => s.answerQuiz);
  const nextStep = usePresentationStore((s) => s.nextStep);
  const setAutoPlay = usePresentationStore((s) => s.setAutoPlay);

  const selectedOption = quiz.options.find((opt) => opt.key === record.selectedKey) ?? null;

  return (
    <div className="studio-panel flex flex-col gap-3.5 p-5 md:p-6" aria-label={quiz.badge}>
      <CoachMissionBanner
        stepLabel={quiz.badge}
        instruction="Pilih jawaban A, B, C, atau D untuk mengecek pemahaman sebelum lanjut ke materi berikutnya."
        completed={Boolean(selectedOption?.correct)}
        doneMessage="Mantap, pemahamanmu sudah pas! Klik tombol lanjut untuk masuk ke episode selanjutnya."
      />

      <div>
        <div className="text-xs font-bold text-[var(--ink-secondary)]">{quiz.checkpointLabel}</div>
        <h3 className="font-display mt-1 text-lg font-extrabold leading-snug md:text-xl">
          {quiz.question}
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
        {quiz.options.map((opt) => {
          const isPicked = record.selectedKey === opt.key;
          const borderStyle = isPicked
            ? opt.correct
              ? 'var(--ok-mint)'
              : 'var(--sa-heat)'
            : 'var(--border-line)';
          const bgStyle = isPicked
            ? opt.correct
              ? 'var(--ok-mint-soft)'
              : 'var(--sa-heat-soft)'
            : 'var(--bg-inset)';

          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => answerQuiz(quiz.id, opt.key, opt.correct)}
              aria-pressed={isPicked}
              className="flex min-h-[54px] items-start gap-3 rounded-xl border-2 px-3.5 py-3 text-left transition-transform duration-150 hover:-translate-y-0.5"
              style={{
                borderColor: borderStyle,
                backgroundColor: bgStyle,
                color: 'var(--ink-primary)',
              }}
            >
              <span
                className="font-mono-tabular mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-extrabold"
                style={{
                  backgroundColor: isPicked ? borderStyle : 'var(--bg-panel)',
                  color: isPicked
                    ? opt.correct
                      ? 'var(--on-mint)'
                      : 'var(--on-heat)'
                    : 'var(--ink-primary)',
                }}
              >
                {opt.key}
              </span>
              <span className="text-sm font-semibold leading-snug">{opt.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="status"
          aria-live="polite"
          className="flex-1 rounded-xl border px-3.5 py-2.5 text-sm leading-relaxed"
          style={{
            borderColor: selectedOption
              ? selectedOption.correct
                ? 'var(--ok-mint)'
                : 'var(--sa-heat)'
              : 'var(--border-line)',
            backgroundColor: 'var(--bg-stage)',
            color: 'var(--ink-secondary)',
          }}
        >
          {selectedOption ? (
            <>
              <strong
                style={{
                  color: selectedOption.correct ? 'var(--ok-mint)' : 'var(--sa-heat)',
                }}
              >
                {selectedOption.correct ? 'Benar! ' : 'Belum tepat. '}
              </strong>
              <span style={{ color: 'var(--ink-primary)' }}>{selectedOption.feedback}</span>
            </>
          ) : (
            'Klik salah satu opsi di atas untuk langsung melihat penjelasannya.'
          )}
        </div>

        {selectedOption?.correct && (
          <CoachTarget active label="Siap lanjut!" position="top" align="end">
            <button
              type="button"
              onClick={() => {
                setAutoPlay(false);
                nextStep();
              }}
              className="btn-studio btn-studio-gold shrink-0 text-xs"
            >
              {nextLabel}
            </button>
          </CoachTarget>
        )}
      </div>
    </div>
  );
}
