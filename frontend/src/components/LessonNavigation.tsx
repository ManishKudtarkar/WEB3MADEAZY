import { ArrowLeft, ArrowRight, Check, Code2, RotateCcw, Target, Trophy } from 'lucide-react';
import { stageNames } from './TeachingStage';
import { STAGE_MASTER, STAGE_PRACTICE } from './lessonConstants';

// Extended stage names for stages 8 and 9
const extendedStageNames = [...stageNames, 'Practice', 'Challenge'];

type Props = {
  scene: number;
  furthest: number;
  maxStage: number;
  completed: boolean;
  practiceCompleted: boolean;
  masterAttempted: boolean;
  canContinue: boolean;
  continueLabel: string;
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onContinue: () => void;
  onScene: (scene: number) => void;
  onReset: () => void;
  onDeepDive: () => void;
};

export function LessonNavigation({
  scene, furthest, maxStage, completed, practiceCompleted, masterAttempted,
  canContinue, continueLabel,
  hasPrevious, hasNext,
  onPrevious, onContinue, onScene, onReset, onDeepDive,
}: Props) {
  const totalVisible = maxStage + 1; // stages 0 … maxStage
  const lastCompleted = scene === maxStage && !hasNext && (completed || masterAttempted);

  return (
    <nav className="lesson-dock" aria-label="Lesson navigation">
      <div className="dock-position">
        <span>STAGE {scene + 1} / {totalVisible}</span>
        <strong>{extendedStageNames[scene] ?? extendedStageNames[7]}</strong>
      </div>

      <div className="scene-progress" aria-label="Lesson stages">
        {extendedStageNames.slice(0, totalVisible).map((name, index) => {
          const isPractice = index === STAGE_PRACTICE;
          const isMaster = index === STAGE_MASTER;
          const isDone = isPractice ? practiceCompleted : isMaster ? masterAttempted : index < scene;
          const isLocked = index > furthest;
          return (
            <button
              key={name}
              disabled={isLocked}
              className={`
                ${scene === index ? 'current' : ''}
                ${isDone ? 'past' : ''}
                ${isPractice ? 'stage-practice' : ''}
                ${isMaster ? 'stage-master' : ''}
              `.trim()}
              aria-label={`Stage ${index + 1}: ${name}`}
              aria-current={scene === index ? 'step' : undefined}
              onClick={() => onScene(index)}
              title={name}
            >
              <span>
                {isPractice && practiceCompleted
                  ? <Check size={11} />
                  : isMaster && masterAttempted
                    ? <Trophy size={11} />
                    : isDone
                      ? <Check size={12} />
                      : index + 1}
              </span>
            </button>
          );
        })}
      </div>

      <div className="dock-tools">
        {furthest >= 4 && scene <= 7 && (
          <button className="dock-tool" aria-label="Reset experiment" title="Reset experiment" onClick={onReset}>
            <RotateCcw size={16} /><span>Reset</span>
          </button>
        )}
        {scene >= 4 && scene <= 7 && (
          <button className="dock-tool" aria-label="Go deeper" title="Go deeper" onClick={onDeepDive}>
            <Code2 size={17} /><span>Go deeper</span>
          </button>
        )}
        {scene === STAGE_PRACTICE && (
          <span className="dock-tool dock-info">
            <Target size={16} /><span>5 questions</span>
          </span>
        )}
        {scene === STAGE_MASTER && (
          <span className="dock-tool dock-info">
            <Trophy size={16} /><span>One attempt</span>
          </span>
        )}
      </div>

      <div className="dock-movement">
        <button
          className="btn btn-secondary"
          disabled={!hasPrevious && scene === 0}
          onClick={onPrevious}
        >
          <ArrowLeft size={16} /><span>Previous</span>
        </button>
        <button
          className="btn btn-primary continue-control"
          disabled={!canContinue || lastCompleted}
          onClick={onContinue}
        >
          {continueLabel}
          {lastCompleted ? <Check size={16} /> : <ArrowRight size={16} />}
        </button>
      </div>
    </nav>
  );
}
