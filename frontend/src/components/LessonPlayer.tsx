import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, BookOpen, Check, ChevronRight, Clock3, FlaskConical, Info, Maximize2, Minimize2, RotateCcw, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Lesson } from '../content/types';
import { lessonById, storySequence, worlds } from '../content/curriculum';
import { practiceQuestions, masterChallenges } from '../content/assessments';
import { simulations } from '../simulations/registry';
import { DeepDiveDialog } from './DeepDiveDialog';
import { TeachingStage } from './TeachingStage';
import { DepthSections } from './DepthSections';
import { PracticeQuiz } from './PracticeQuiz';
import { MasterChallenge } from './MasterChallenge';
import { teachingByLessonId } from '../content/theoryLessons';
import { LessonNavigation } from './LessonNavigation';
import type { Progress } from '../lib/storage';
import { STAGE_MASTER, STAGE_PRACTICE, TOTAL_STAGES } from './lessonConstants';
import '../learning-layout.css';

// Re-export for backwards compatibility with any other importers
export { STAGE_MASTER, STAGE_PRACTICE, TOTAL_STAGES };

type Props = {
  lesson: Lesson;
  mode: string;
  studentId?: string | null;
  progress: Progress;
  onScene: (id: string, scene: number) => void;
  onComplete: (id: string) => void;
  onPracticeComplete: (id: string) => void;
  onMasterResult: (id: string, correct: boolean) => void;
  onNavigate: (id: string) => void;
  /** World ID verified status — required before Master Challenge */
  isVerified?: boolean;
  verificationLoading?: boolean;
  onRequestVerification?: () => void;
};

export function LessonPlayer({
  lesson, mode, studentId, progress,
  onScene, onComplete, onPracticeComplete, onMasterResult, onNavigate,
  isVerified = false,
  verificationLoading = false,
  onRequestVerification = () => {},
}: Props) {
  const [scene, setScene] = useState(progress.scenes[lesson.id] || 0);
  const [furthest, setFurthest] = useState(() => {
    if (progress.masterResults[lesson.id] !== undefined) return STAGE_MASTER;
    if (progress.practiceCompleted.includes(lesson.id)) return STAGE_MASTER;
    if (progress.completed.includes(lesson.id)) return STAGE_PRACTICE;
    return progress.scenes[lesson.id] || 0;
  });
  const [started, setStarted] = useState((progress.scenes[lesson.id] || 0) >= 4);
  const [guideStep, setGuideStep] = useState(0);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [answer, setAnswer] = useState<number | null>(null);
  const [reset, setReset] = useState(0);
  const [discovery, setDiscovery] = useState('');
  const [deepDive, setDeepDive] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [prereqDismissed, setPrereqDismissed] = useState(false);
  const [navigationTick, setNavigationTick] = useState(0);
  const [practicePassed, setPracticePassed] = useState(() => progress.practiceCompleted.includes(lesson.id));

  const guideRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const stageHeadingRef = useRef<HTMLHeadingElement>(null);

  const Simulation = simulations[lesson.simulation];
  const teaching = teachingByLessonId[lesson.id];
  const lessonPracticeQs = practiceQuestions[lesson.id] ?? [];
  const lessonMasterChallenge = masterChallenges[lesson.id];

  const hasPractice = lessonPracticeQs.length > 0;
  const hasMaster = !!lessonMasterChallenge;

  const showStage = scene === 4 || scene === 5;
  const world = worlds.find(item => item.id === lesson.worldId)!;
  const sequence = mode === 'story' ? storySequence : worlds.flatMap(item => item.lessonIds);
  const index = sequence.indexOf(lesson.id);
  const previous = sequence[index - 1];
  const next = sequence[index + 1];

  const completed = progress.completed.includes(lesson.id);
  const practiceCompleted = practicePassed || progress.practiceCompleted.includes(lesson.id);
  const masterAttempted = progress.masterResults[lesson.id] !== undefined;
  const masterPassed = progress.masterResults[lesson.id] === true;
  const missing = lesson.prerequisites.filter(id => !progress.completed.includes(id));

  // The final teaching stage depends on whether practice/master exist
  const lastTeachingStage = 7;
  const maxStage = hasMaster ? STAGE_MASTER : hasPractice ? STAGE_PRACTICE : lastTeachingStage;

  useEffect(() => {
    if (navigationTick === 0) return;
    if (guideRef.current) guideRef.current.scrollTop = 0;
    headingRef.current?.focus({ preventScroll: true });
    guideRef.current?.scrollIntoView?.({ block: 'start', behavior: 'instant' });
  }, [navigationTick]);

  const changeScene = (value: number) => {
    setScene(value);
    // Only save scenes for the 0–7 core teaching stages to storage
    if (value <= 7) onScene(lesson.id, value);
    setExpanded(false);
    setFurthest(current => Math.max(current, value));
    if (value >= 4) setStarted(true);
    setNavigationTick(v => v + 1);
  };

  const resetExperiment = () => { setReset(v => v + 1); setDiscovery(''); setGuideStep(0); };

  const replay = () => {
    resetExperiment();
    setPrediction(null);
    setAnswer(null);
    setStarted(false);
    changeScene(0);
  };

  const handlePracticeAllPassed = () => {
    setPracticePassed(true);
    onPracticeComplete(lesson.id);
    // Unlock master challenge stage
    setFurthest(current => Math.max(current, STAGE_MASTER));
  };

  const handleMasterSubmit = useCallback(async (lessonId: string, optionIndex: number): Promise<boolean> => {
    // Generate idempotency key if not already generated for this attempt
    const idempotencyKey = `${lessonId}-${Date.now()}-${crypto.randomUUID()}`;
    
    try {
      // Submit to backend API
      const { api } = await import('../lib/api.ts');
      const result = await api.submitMasterChallenge(
        { lessonId, mode: mode as 'developer' | 'explorer', selectedOption: optionIndex, idempotencyKey },
        idempotencyKey,
      );
      
      // Update local state
      onMasterResult(lesson.id, result.correct);
      return result.correct;
    } catch (err) {
      console.error('Master challenge submission failed:', err);
      // Fall back to client-side evaluation in dev mode
      const correct = lessonMasterChallenge ? optionIndex === lessonMasterChallenge.answer : false;
      onMasterResult(lesson.id, correct);
      return correct;
    }
  }, [lessonMasterChallenge, lesson.id, onMasterResult, mode]);

  const continueLesson = () => {
    if (scene < lastTeachingStage) {
      changeScene(scene + 1);
    } else if (scene === lastTeachingStage) {
      // Stage 7 → mark teaching done, move to practice (or next lesson)
      if (answer === lesson.check.answer || completed) {
        onComplete(lesson.id);
      }
      if (hasPractice && !practiceCompleted) {
        changeScene(STAGE_PRACTICE);
      } else if (next) {
        onNavigate(next);
      }
    } else if (scene === STAGE_PRACTICE && practiceCompleted) {
      changeScene(STAGE_MASTER);
    } else if (scene === STAGE_MASTER || masterAttempted) {
      if (next) onNavigate(next);
    }
  };

  const showExperiment = () => {
    stageHeadingRef.current?.focus({ preventScroll: true });
    stageRef.current?.scrollIntoView?.({ block: 'start', behavior: 'instant' });
  };

  // Can the Continue button be pressed?
  const canContinue = (() => {
    if (scene === 6) return answer === lesson.check.answer || completed;
    if (scene === STAGE_PRACTICE) return practiceCompleted;
    if (scene === STAGE_MASTER) return masterAttempted;
    return true;
  })();

  // Is there a next stage at all?
  const hasNext = !!next;
  const hasPrevious = !!previous;

  const continueLabel = (() => {
    if (scene === 3) return 'Start experiment';
    if (scene === 7 && hasNext) return 'Next discovery';
    if (scene === lastTeachingStage && hasPractice) return 'Go to Practice';
    if (scene === lastTeachingStage && !hasPractice && hasNext) return 'Next lesson';
    if (scene === STAGE_PRACTICE) return practiceCompleted ? 'Master Challenge' : 'Complete practice first';
    if (scene === STAGE_MASTER) return masterAttempted ? (hasNext ? 'Next lesson' : 'Finish') : 'Submit to continue';
    if (scene === 7 && !hasNext) return completed ? 'Lesson complete' : 'Finish lesson';
    return 'Continue';
  })();

  return (
    <article className="learning-player" aria-labelledby="lesson-title">
      <header className="lesson-heading">
        <div className="breadcrumb">
          <span>{mode === 'story' ? 'THE JOURNEY' : 'EXPLORE'}</span>
          <ChevronRight size={12} />
          <span>WORLD {lesson.worldId}</span>
          <ChevronRight size={12} />
          <span>{world.title}</span>
        </div>
        <div className="heading-main">
          <div>
            <h1 tabIndex={-1} id="lesson-title">{lesson.title}</h1>
            <p>{lesson.summary}</p>
          </div>
          <div className="lesson-meta">
            <span><Clock3 size={14} />{lesson.duration} min</span>
            <span>{index + 1} / {sequence.length} lessons</span>
            {practiceCompleted && (
              <span className="meta-badge meta-practice-done">
                <Check size={12} /> Practice done
              </span>
            )}
            {masterPassed && (
              <span className="meta-badge meta-master-done">
                <Trophy size={12} /> Challenge passed
              </span>
            )}
          </div>
        </div>
      </header>

      {mode === 'explore' && missing.length > 0 && !prereqDismissed && (
        <div className="prerequisite-banner">
          <BookOpen size={17} />
          <span>
            A little context helps:{' '}
            {missing.map((id, i) => (
              <span key={id}>
                {i > 0 && ', '}
                <Link to={`/explore/${id}`}>{lessonById[id].shortTitle}</Link>
              </span>
            ))}
            . You can also dive straight in.
          </span>
          <button onClick={() => setPrereqDismissed(true)}>Got it</button>
        </div>
      )}

      {/* ── Core teaching stages 0–7 ───────────────────────────────────────── */}
      {scene <= lastTeachingStage && (
        <div className={`lesson-workbench ${!showStage ? 'theory-only' : ''} ${expanded ? 'experiment-expanded' : ''}`}>
          <aside className="context-column" aria-label="Lesson guide" ref={guideRef} hidden={expanded}>
            <TeachingStage
              teaching={teaching}
              stage={scene}
              prediction={lesson.question}
              predicted={prediction}
              onPredict={setPrediction}
              checks={[lesson.check]}
              answers={[answer]}
              onAnswer={(_, value) => {
                setAnswer(value);
                if (value === lesson.check.answer) onComplete(lesson.id);
              }}
              summary={lesson.reveal}
              takeaways={[lesson.mentalModel]}
              discovery={discovery}
              step={guideStep}
              onStep={setGuideStep}
              onExperiment={showExperiment}
              onReview={() => changeScene(2)}
              headingRef={headingRef}
              nextQuestion={lesson.nextQuestion}
              deeper={
                <DepthSections
                  sections={lesson.deepDive}
                  sources={lesson.sources}
                  boundary={lesson.boundary}
                />
              }
            />
          </aside>
          <section
            className="experiment-column"
            aria-label="Interactive experiment"
            ref={stageRef}
            hidden={!showStage}
          >
            <div className="section-heading">
              <div>
                <FlaskConical size={18} />
                <h2 ref={stageHeadingRef} tabIndex={-1}>The playground</h2>
                <span className="section-tag">LOCAL SIMULATION</span>
              </div>
              <button
                className="text-button expand-experiment"
                aria-pressed={expanded}
                onClick={() => {
                  if (expanded) { setExpanded(false); setNavigationTick(v => v + 1); }
                  else setExpanded(true);
                }}
              >
                {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                {expanded ? 'Show guide' : 'Expand experiment'}
              </button>
            </div>
            <div className="experiment-frame">
              {started && <Simulation key={reset} onDiscover={setDiscovery} />}
            </div>
            <details className="boundary-details">
              <summary><Info size={14} />Where this model stops<ChevronRight size={14} /></summary>
              <p>{lesson.boundary}</p>
            </details>
          </section>
        </div>
      )}

      {/* ── Stage 8: Practice Quiz ─────────────────────────────────────────── */}
      {scene === STAGE_PRACTICE && hasPractice && (
        <div className="lesson-workbench theory-only">
          <div className="context-column">
            <div className="guide-scene-label">
              <span>STAGE {STAGE_PRACTICE + 1} OF {TOTAL_STAGES}</span>
              <span>Practice Questions</span>
            </div>
            <h2 ref={headingRef} tabIndex={-1} id="scene-heading">
              Check your understanding
            </h2>
            <p className="guide-copy">
              Answer all five questions correctly to unlock the Master Challenge.
              You can retry any question as many times as you need — there's no penalty.
            </p>
            <PracticeQuiz
              questions={lessonPracticeQs}
              onAllPassed={handlePracticeAllPassed}
            />
            {practiceCompleted && hasMaster && (
              <div className="practice-unlock-notice" role="status" aria-live="polite">
                <Trophy size={16} />
                Master Challenge unlocked — use Continue to begin your one-attempt challenge.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Stage 9: Master Challenge ──────────────────────────────────────── */}
      {scene === STAGE_MASTER && hasMaster && (
        <div className="lesson-workbench theory-only">
          <div className="context-column">
            <div className="guide-scene-label">
              <span>STAGE {STAGE_MASTER + 1} OF {TOTAL_STAGES}</span>
              <span>Master Challenge</span>
            </div>
            <h2 ref={headingRef} tabIndex={-1} id="scene-heading">
              Prove your mastery
            </h2>
            <MasterChallenge
              challenge={lessonMasterChallenge}
              lessonId={lesson.id}
              studentId={studentId ?? undefined}
              mode={mode as 'developer' | 'explorer'}
              isVerified={isVerified}
              verificationLoading={verificationLoading}
              hasAttempted={masterAttempted}
              previousResult={progress.masterResults[lesson.id]}
              onRequestVerification={onRequestVerification}
              onSubmit={handleMasterSubmit}
            />
          </div>
        </div>
      )}

      {/* ── Lesson utility bar ─────────────────────────────────────────────── */}
      <div className="lesson-utility">
        <button className="text-button" onClick={replay}>
          <RotateCcw size={14} />Replay lesson
        </button>
        <span>
          {completed
            ? <><Check size={14} />Lesson completed</>
            : 'Progress saved on this device'}
        </span>
        {next
          ? <button className="text-button" onClick={() => onNavigate(next)}>
              Skip to next<ArrowRight size={14} />
            </button>
          : <button className="text-button" onClick={() => onNavigate(sequence[0])}>
              Back to the beginning<ArrowRight size={14} />
            </button>
        }
      </div>

      <details className="related-disclosure">
        <summary>Connect this idea to other lessons<ChevronRight size={16} /></summary>
        <div className="related-links">
          {lesson.related.map(id => (
            <Link key={id} to={`/${mode}/${id}`}>
              <span>
                <strong>{lessonById[id].shortTitle}</strong>
                <small>{lesson.relatedWhy?.[id] || lessonById[id].summary}</small>
              </span>
              <ArrowRight size={17} />
            </Link>
          ))}
        </div>
      </details>

      <LessonNavigation
        scene={scene}
        furthest={furthest}
        maxStage={maxStage}
        completed={completed}
        practiceCompleted={practiceCompleted}
        masterAttempted={masterAttempted}
        canContinue={canContinue}
        continueLabel={continueLabel}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        onPrevious={() => {
          if (scene > 0) changeScene(scene - 1);
          else if (previous) onNavigate(previous);
        }}
        onContinue={continueLesson}
        onScene={changeScene}
        onReset={resetExperiment}
        onDeepDive={() => setDeepDive(true)}
      />
      {deepDive && <DeepDiveDialog lesson={lesson} mode={mode} onClose={() => setDeepDive(false)} />}
    </article>
  );
}
