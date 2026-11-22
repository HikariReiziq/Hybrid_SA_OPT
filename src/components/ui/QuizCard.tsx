import { type QuizQuestion } from '../../data/content';
import { usePresentationStore } from '../../store/presentationStore';
import { CoachMissionBanner } from './GuidedCoach';

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
      className={`studio-panel flex flex-col gap-3 ${compact ? 'p-4' : 'p-5 md:p-6'}`}
      aria-label={quiz.badge}
    >
      <CoachMissionBanner
        stepLabel={quiz.badge}
        instruction="Pilih salah satu kartu jawaban A, B, C, atau D untuk langsung melihat pembahasannya."
        completed={Boolean(selectedOption?.correct)}
        doneMessage="Mantap! Jawaban kamu benar dan poin sudah masuk ke skor akhir."
      />

      <h3 className="font-display text-lg font-extrabold leading-snug md:text-xl">
        {quiz.question}
      </h3>

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
              className="flex min-h-[50px] items-start gap-3 rounded-xl border-2 px-3.5 py-3 text-left transition-transform duration-150 hover:-translate-y-0.5"
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

      <div
        role="status"
        aria-live="polite"
        className="rounded-xl border px-3.5 py-2.5 text-sm leading-relaxed"
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
              {selectedOption.correct ? 'Benar. ' : 'Belum tepat. '}
            </strong>
            <span style={{ color: 'var(--ink-primary)' }}>{selectedOption.feedback}</span>
          </>
        ) : (
          'Klik salah satu opsi di atas untuk menguji pemahamanmu.'
        )}
      </div>
    </div>
  );
}
