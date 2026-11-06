import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, ArrowRight, GripVertical, Lock, Target } from 'lucide-react';
import type { MasterChallenge as MasterChallengeType } from '../content/types';
import { CHAPTER_REWARD_AMOUNTS } from '@ethereum-explorer/shared';
import { RewardClaimButton } from '../features/rewards/components/RewardClaimButton.tsx';

type Phase =
  | 'pre'          // about to begin — show explanation that this is one-attempt
  | 'active'       // dragging/selecting in progress
  | 'confirming'   // answer chosen, showing confirm dialog
  | 'submitting'   // waiting for server
  | 'correct'      // server confirmed correct
  | 'incorrect';   // server confirmed incorrect (reward permanently unavailable)

type Props = {
  challenge: MasterChallengeType;
  lessonId: string;
  studentId?: string;
  mode: 'developer' | 'explorer';
  isVerified: boolean;          // World ID verified
  verificationLoading?: boolean;
  hasAttempted: boolean;        // already submitted once (from server)
  previousResult?: boolean;     // previous attempt result if hasAttempted
  onRequestVerification: () => void;
  onSubmit: (lessonId: string, optionIndex: number) => Promise<boolean>;
};

/**
 * Drag-and-drop Master Challenge — exactly one submission attempt per verified learner.
 * The answer index is never validated client-side; the server is the authority.
 *
 * Interaction model:
 *  1. Drag an option token onto the drop zone (or keyboard: focus token → Enter to pick,
 *     then Tab to drop zone → Enter to place).
 *  2. A confirmation dialog prevents accidental submission.
 *  3. On confirm → POST to server; server checks answer and records atomically.
 *  4. Result state is permanent — no retry button is rendered after submission.
 */
export function MasterChallenge({
  challenge,
  lessonId,
  studentId,
  mode,
  isVerified,
  verificationLoading = false,
  hasAttempted,
  previousResult,
  onRequestVerification,
  onSubmit,
}: Props) {
  const [phase, setPhase] = useState<Phase>(() =>
    hasAttempted ? (previousResult ? 'correct' : 'incorrect') : 'pre'
  );
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [droppedIndex, setDroppedIndex] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  // Keyboard accessibility: which token is "held" by the keyboard
  const [keyboardHeld, setKeyboardHeld] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLDialogElement>(null);

  // Sync if parent updates hasAttempted after render
  useEffect(() => {
    if (hasAttempted && phase === 'active') {
      setPhase(previousResult ? 'correct' : 'incorrect');
    }
  }, [hasAttempted, previousResult, phase]);

  // ── Drag handlers ────────────────────────────────────────────────────────────

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragEnd = () => setDraggedIndex(null);

  const handleDropZoneDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDropZoneDragLeave = () => setIsDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const idx = Number(e.dataTransfer.getData('text/plain'));
    if (!Number.isNaN(idx) && idx >= 0 && idx < challenge.options.length) {
      setDroppedIndex(idx);
    }
    setDraggedIndex(null);
  };

  // ── Keyboard accessibility ────────────────────────────────────────────────────

  const handleTokenKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setKeyboardHeld(prev => prev === index ? null : index);
    }
  };

  const handleDropZoneKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && keyboardHeld !== null) {
      e.preventDefault();
      setDroppedIndex(keyboardHeld);
      setKeyboardHeld(null);
      dropZoneRef.current?.focus();
    }
  };

  // Remove from drop zone (click on placed token)
  const handleRemoveDropped = () => {
    setDroppedIndex(null);
    setKeyboardHeld(null);
  };

  // ── Submission flow ───────────────────────────────────────────────────────────

  const handleSubmitRequest = () => {
    if (droppedIndex === null) return;
    setPhase('confirming');
    setTimeout(() => confirmRef.current?.showModal(), 50);
  };

  const handleConfirm = useCallback(async () => {
    if (droppedIndex === null) return;
    confirmRef.current?.close();
    setPhase('submitting');
    setError(null);
    try {
      const correct = await onSubmit(lessonId, droppedIndex);
      setPhase(correct ? 'correct' : 'incorrect');
    } catch {
      setPhase('active');
      setError('Something went wrong submitting your answer. Please try again.');
    }
  }, [droppedIndex, lessonId, onSubmit]);

  const handleCancelConfirm = () => {
    confirmRef.current?.close();
    setPhase('active');
  };

  // ── Render helpers ────────────────────────────────────────────────────────────

  const chosenLabel = droppedIndex !== null ? challenge.options[droppedIndex] : null;

  if (phase === 'pre') {
    return (
      <div className="master-challenge master-challenge-pre">
        <div className="mc-header">
          <Target size={20} />
          <h3>Master Challenge</h3>
          <span className="mc-badge">ONE ATTEMPT</span>
        </div>
        <p className="mc-intro">
          You've completed all five practice questions. The Master Challenge tests your
          understanding of the core concept in this chapter.
        </p>
        <ul className="mc-rules">
          <li><Lock size={13} /> You have exactly <strong>one submission attempt</strong>.</li>
          <li><AlertTriangle size={13} /> An incorrect answer permanently removes reward eligibility for this chapter.</li>
          <li><ArrowRight size={13} /> A failed challenge never blocks you from continuing to learn.</li>
          <li><Lock size={13} /> To prevent reward farming, you need to verify your identity with World ID before beginning.</li>
        </ul>
        {verificationLoading ? (
          <div className="mc-verify-gate" role="status">Checking your World ID verification status...</div>
        ) : !isVerified ? (
          <div className="mc-verify-gate">
            <p>Verify your identity once to unlock Master Challenges across all chapters.</p>
            <button className="btn btn-primary" onClick={onRequestVerification}>
              Verify with World ID <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          <button className="btn btn-primary mc-begin" onClick={() => setPhase('active')}>
            Begin Master Challenge <ArrowRight size={15} />
          </button>
        )}
      </div>
    );
  }

  if (phase === 'correct') {
    return (
      <div className="master-challenge mc-result mc-result-correct" role="status" aria-live="polite">
        <Target size={32} />
        <h3>Correct!</h3>
        <p>You've mastered this chapter's core concept. You are now eligible to claim your ERC-20 learning reward.</p>
        {studentId ? (
          <RewardClaimButton
            lessonId={lessonId}
            mode={mode}
            studentId={studentId}
            tokenAmount={CHAPTER_REWARD_AMOUNTS[lessonId] || '10'}
            onClaimed={() => {}}
          />
        ) : (
          <p className="mc-reward-note">Your session is still loading. Refresh before claiming.</p>
        )}
      </div>
    );
  }

  if (phase === 'incorrect') {
    return (
      <div className="master-challenge mc-result mc-result-incorrect" role="status" aria-live="polite">
        <AlertTriangle size={32} />
        <h3>Not quite</h3>
        <p>{challenge.explanation}</p>
        <p className="mc-no-retry">
          The reward for this chapter is no longer available. Your World ID verification
          remains valid, so you can continue to the next chapter and earn its separate reward.
        </p>
      </div>
    );
  }

  return (
    <div className={`master-challenge master-challenge-active ${phase === 'submitting' ? 'mc-submitting' : ''}`}>
      <div className="mc-header">
        <Target size={20} />
        <h3>Master Challenge</h3>
        <span className="mc-badge">ONE ATTEMPT</span>
      </div>

      <p className="mc-prompt">{challenge.prompt}</p>

      {/* Drop zone */}
      <div
        ref={dropZoneRef}
        role="region"
        aria-label="Drop zone — place your answer here"
        className={`mc-drop-zone ${isDragOver ? 'mc-dz-hover' : ''} ${droppedIndex !== null ? 'mc-dz-filled' : ''}`}
        tabIndex={keyboardHeld !== null ? 0 : -1}
        onDragOver={handleDropZoneDragOver}
        onDragLeave={handleDropZoneDragLeave}
        onDrop={handleDrop}
        onKeyDown={handleDropZoneKeyDown}
        aria-describedby="mc-dz-instructions"
      >
        {droppedIndex !== null ? (
          <button
            className="mc-dropped-token"
            onClick={handleRemoveDropped}
            aria-label={`Remove ${chosenLabel} from drop zone`}
            title="Click to remove and choose again"
          >
            <GripVertical size={14} />
            <span>{chosenLabel}</span>
          </button>
        ) : (
          <span className="mc-dz-placeholder" aria-hidden="true">
            {keyboardHeld !== null
              ? 'Press Enter to place your selection here'
              : challenge.dropZoneHint}
          </span>
        )}
      </div>
      <p id="mc-dz-instructions" className="sr-only">
        Drag one of the options below and drop it here, or press Enter on an option to select it,
        then Tab to this zone and press Enter to place it.
      </p>

      {/* Option tokens */}
      <div className="mc-options" role="list" aria-label="Answer options — drag one to the drop zone">
        {challenge.options.map((option, i) => {
          const isPlaced = droppedIndex === i;
          const isHeld = keyboardHeld === i;
          const isDragging = draggedIndex === i;
          return (
            <div
              key={i}
              role="listitem"
              draggable={!isPlaced}
              className={`mc-option-token
                ${isPlaced ? 'mc-token-placed' : ''}
                ${isHeld ? 'mc-token-held' : ''}
                ${isDragging ? 'mc-token-dragging' : ''}
              `.trim()}
              tabIndex={isPlaced ? -1 : 0}
              aria-grabbed={isDragging}
              aria-label={`Option: ${option}${isPlaced ? ' (placed in drop zone)' : ''}${isHeld ? ' (selected — Tab to drop zone and press Enter)' : ''}`}
              onDragStart={e => handleDragStart(e, i)}
              onDragEnd={handleDragEnd}
              onKeyDown={e => handleTokenKeyDown(e, i)}
            >
              <GripVertical size={14} className="mc-grip" aria-hidden="true" />
              <span>{option}</span>
              {isHeld && <span className="mc-held-badge" aria-hidden="true">Selected</span>}
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mc-error" role="alert">
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      <div className="mc-submit-row">
        <button
          className="btn btn-primary mc-submit-btn"
          disabled={droppedIndex === null || phase === 'submitting'}
          onClick={handleSubmitRequest}
        >
          {phase === 'submitting' ? 'Submitting…' : 'Submit final answer'}
          <ArrowRight size={15} />
        </button>
        <p className="mc-warning">
          <Lock size={12} /> This is your one attempt. You cannot undo a submission.
        </p>
      </div>

      {/* Confirmation dialog — native <dialog> for accessibility */}
      <dialog
        ref={confirmRef}
        className="mc-confirm-dialog"
        aria-labelledby="mc-confirm-title"
        aria-describedby="mc-confirm-desc"
        onClose={handleCancelConfirm}
      >
        <h2 id="mc-confirm-title">Submit your answer?</h2>
        <p id="mc-confirm-desc">
          You are about to submit <strong>"{chosenLabel}"</strong> as your final answer.
          This cannot be undone — you have one attempt per chapter.
        </p>
        <div className="mc-confirm-actions">
          <button className="btn btn-warning" onClick={handleConfirm} autoFocus>
            Submit — I'm sure
          </button>
          <button className="btn btn-secondary" onClick={handleCancelConfirm}>
            Go back
          </button>
        </div>
      </dialog>
    </div>
  );
}
