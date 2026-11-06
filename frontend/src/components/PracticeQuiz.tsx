import { useState } from 'react';
import { ArrowRight, Check, CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import type { Question } from '../content/types';

type QuizState = {
  selected: (number | null)[];
  submitted: boolean[];
  showExplanation: boolean[];
};

type Props = {
  questions: Question[];
  onAllPassed: () => void;
};

/**
 * Five retryable practice MCQs. A learner must answer every question correctly
 * before the Master Challenge unlocks. Wrong answers show the explanation and
 * allow unlimited retries — there is no penalty for incorrect practice answers.
 */
export function PracticeQuiz({ questions, onAllPassed }: Props) {
  const [state, setState] = useState<QuizState>({
    selected: questions.map(() => null),
    submitted: questions.map(() => false),
    showExplanation: questions.map(() => false),
  });
  const [allPassedFired, setAllPassedFired] = useState(false);

  const correct = state.submitted.map((sub, i) =>
    sub && state.selected[i] === questions[i].answer
  );
  const allCorrect = correct.every(Boolean) && correct.length === questions.length;

  const select = (qIndex: number, optIndex: number) => {
    if (state.submitted[qIndex] && correct[qIndex]) return; // locked after correct
    setState(prev => {
      const selected = [...prev.selected];
      selected[qIndex] = optIndex;
      return { ...prev, selected };
    });
  };

  const submit = (qIndex: number) => {
    if (state.selected[qIndex] === null) return;
    setState(prev => {
      const submitted = [...prev.submitted];
      const showExplanation = [...prev.showExplanation];
      submitted[qIndex] = true;
      showExplanation[qIndex] = true;
      const next = { ...prev, submitted, showExplanation };

      // Check if all are now correct and fire the callback once
      const allNowCorrect = submitted.every((s, i) => s && (i === qIndex ? prev.selected[i] === questions[i].answer : prev.selected[i] === questions[i].answer));
      if (allNowCorrect && !allPassedFired) {
        setAllPassedFired(true);
        onAllPassed();
      }
      return next;
    });
  };

  const retry = (qIndex: number) => {
    setState(prev => {
      const selected = [...prev.selected];
      const submitted = [...prev.submitted];
      const showExplanation = [...prev.showExplanation];
      selected[qIndex] = null;
      submitted[qIndex] = false;
      showExplanation[qIndex] = false;
      return { ...prev, selected, submitted, showExplanation };
    });
  };

  const passedCount = correct.filter(Boolean).length;

  return (
    <div className="practice-quiz">
      <div className="practice-quiz-header">
        <span className="section-eyebrow">PRACTICE · {passedCount} / {questions.length} CORRECT</span>
        {allCorrect && (
          <div className="practice-complete" role="status" aria-live="polite">
            <CheckCircle2 size={16} />
            All questions answered correctly — Master Challenge unlocked!
          </div>
        )}
      </div>

      <div className="practice-questions">
        {questions.map((q, qIndex) => {
          const isSubmitted = state.submitted[qIndex];
          const isCorrect = correct[qIndex];
          const chosen = state.selected[qIndex];

          return (
            <div
              key={qIndex}
              className={`practice-question ${isSubmitted ? (isCorrect ? 'pq-correct' : 'pq-wrong') : ''}`}
              aria-label={`Practice question ${qIndex + 1} of ${questions.length}`}
            >
              <div className="pq-header">
                <span className="pq-number">Q{qIndex + 1}</span>
                {isSubmitted && (
                  isCorrect
                    ? <span className="pq-status pq-ok" aria-label="Correct"><Check size={13} /> Correct</span>
                    : <span className="pq-status pq-fail" aria-label="Incorrect"><XCircle size={13} /> Try again</span>
                )}
              </div>

              <p className="pq-prompt">{q.prompt}</p>

              <div className="question-options">
                {q.options.map((option, i) => {
                  const isChosen = chosen === i;
                  const lockCorrect = isSubmitted && isCorrect;
                  const showWrong = isSubmitted && isChosen && !isCorrect;
                  const showRight = isSubmitted && i === q.answer && !isCorrect;

                  return (
                    <button
                      key={i}
                      className={`question-option
                        ${isChosen ? 'chosen' : ''}
                        ${showWrong ? 'incorrect' : ''}
                        ${(lockCorrect && isChosen) || showRight ? 'correct' : ''}
                      `.trim()}
                      aria-pressed={isChosen}
                      disabled={lockCorrect}
                      onClick={() => select(qIndex, i)}
                    >
                      <span className="option-letter">
                        {(lockCorrect && isChosen) ? <Check size={12} /> : String.fromCharCode(65 + i)}
                      </span>
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>

              {state.showExplanation[qIndex] && (
                <div className={`question-feedback ${isCorrect ? '' : 'try-again'}`} role="status">
                  <p>
                    {isCorrect ? '✓ ' : '✗ '}
                    {q.explanation}
                  </p>
                </div>
              )}

              <div className="pq-actions">
                {!isSubmitted && (
                  <button
                    className="btn btn-secondary pq-submit"
                    disabled={chosen === null}
                    onClick={() => submit(qIndex)}
                  >
                    Check answer <ArrowRight size={14} />
                  </button>
                )}
                {isSubmitted && !isCorrect && (
                  <button className="btn btn-secondary pq-retry" onClick={() => retry(qIndex)}>
                    <RotateCcw size={14} /> Try again
                  </button>
                )}
                {isSubmitted && isCorrect && (
                  <span className="pq-locked" aria-label="Answer locked in">
                    <CheckCircle2 size={14} /> Locked in
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
