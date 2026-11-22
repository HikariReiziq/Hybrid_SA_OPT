import { type QuizQuestion } from '../../data/content';
import { usePresentationStore } from '../../store/presentationStore';

interface QuizCardProps {
  quiz: QuizQuestion;
  compact?: boolean;
}

export function QuizCard({ quiz, compact = false }: QuizCardProps) {
  const record = usePresentationStore((s) => s.quizzes[quiz.id]);
  const answerQuiz = usePresentationStore((s) => s.answerQuiz);

  const selectedOption = quiz.options.find((opt) => opt.key === record.selectedKey) ?? null;

  return (
    <div
      className={`transit-card flex flex-col gap-3 ${compact ? 'p-4' : 'p-5 md:p-6'}`}
      aria-label={quiz.badge}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span
          className="font-mono-tabular inline-block rounded-md px-2.5 py-1 text-xs font-bold tracking-wide"
          style={{
            backgroundColor: 'var(--ink-primary)',
            color: 'var(--bg-surface)',
          }}
        >
          {quiz.badge}
        </span>
        {record.firstAttemptCorrect !== null && (
          <span
            className="font-mono-tabular rounded-md border px-2 py-0.5 text-xs font-bold"
            style={{
              borderColor: record.firstAttemptCorrect
                ? 'var(--ok-balance)'
                : 'var(--sa-heat)',
              backgroundColor: record.firstAttemptCorrect
                ? 'var(--ok-balance-soft)'
                : 'var(--sa-heat-soft)',
              color: record.firstAttemptCorrect ? 'var(--ok-balance)' : 'var(--sa-heat)',
            }}
          >
            {record.firstAttemptCorrect
              ? 'Percobaan 1: Benar'
              : 'Percobaan 1: Masih mencoba'}
          </span>
        )}
      </div>

      <h3 className="font-display text-lg font-extrabold leading-snug md:text-xl">
        {quiz.question}
      </h3>

      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
        {quiz.options.map((opt) => {
          const isPicked = record.selectedKey === opt.key;
          const borderStyle = isPicked
            ? opt.correct
              ? 'var(--ok-balance)'
              : 'var(--sa-heat)'
            : 'var(--border-ink)';
          const bgStyle = isPicked
            ? opt.correct
              ? 'var(--ok-balance-soft)'
              : 'var(--sa-heat-soft)'
            : 'var(--bg-surface)';

          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => answerQuiz(quiz.id, opt.key, opt.correct)}
              aria-pressed={isPicked}
              className="flex min-h-[48px] items-start gap-3 rounded-xl border-2 px-3.5 py-3 text-left transition-transform duration-150 hover:-translate-y-0.5"
              style={{
                borderColor: borderStyle,
                backgroundColor: bgStyle,
                color: 'var(--ink-primary)',
              }}
            >
              <span
                className="font-mono-tabular mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs font-bold"
                style={{
                  borderColor: borderStyle,
                  backgroundColor: isPicked ? borderStyle : 'var(--bg-elevated)',
                  color: isPicked ? '#ffffff' : 'var(--ink-primary)',
                }}
              >
                {opt.key}
              </span>
              <span className="text-sm font-semibold leading-snug">{opt.label}</span>
            </button>
          );
        })}
      </div>

      <div
        role="status"
        aria-live="polite"
        className="rounded-lg border px-3.5 py-2.5 text-sm leading-relaxed"
        style={{
          borderColor: selectedOption
            ? selectedOption.correct
              ? 'var(--ok-balance)'
              : 'var(--sa-heat)'
            : 'var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
          color: 'var(--ink-secondary)',
        }}
      >
        {selectedOption ? (
          <>
            <strong
              style={{
                color: selectedOption.correct ? 'var(--ok-balance)' : 'var(--sa-heat)',
              }}
            >
              {selectedOption.correct ? 'Benar. ' : 'Belum tepat. '}
            </strong>
            <span style={{ color: 'var(--ink-primary)' }}>{selectedOption.feedback}</span>
          </>
        ) : (
          'Pilih salah satu jawaban A, B, C, atau D untuk langsung melihat penjelasan.'
        )}
      </div>
    </div>
  );
}
