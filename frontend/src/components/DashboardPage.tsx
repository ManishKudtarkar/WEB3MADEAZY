import { ArrowRight, Award, BookOpen, CheckCircle2, Circle, LockKeyhole, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Progress } from '../lib/storage';
import { lessonById, lessons, worlds, storySequence } from '../content/curriculum';

type Props = { progress: Progress };

export function DashboardPage({ progress }: Props) {
  const completed = new Set(progress.completed);
  const practiceCount = Object.keys(progress.masterResults).length;
  const completedCount = progress.completed.filter(id => lessonById[id]).length;
  const exploredWorldCount = worlds.filter(world => world.lessonIds.some(id => completed.has(id))).length;
  const percent = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0;
  const currentId = lessonById[progress.lastLesson] ? progress.lastLesson : storySequence[0];
  const nextLesson = storySequence.find(id => !completed.has(id));
  const currentWorld = worlds.find(world => world.lessonIds.some(id => id === (nextLesson || currentId)));

  return <div className="dashboard-page">
    <div className="dashboard-hero">
      <div>
        <span className="section-eyebrow"><Sparkles size={13} /> YOUR LEARNING DASHBOARD</span>
        <h1>Keep your curiosity moving.</h1>
        <p>One small experiment at a time, you are building a durable mental model of Ethereum.</p>
      </div>
      <div className="dashboard-progress-ring" style={{ background: `conic-gradient(var(--accent) ${percent * 3.6}deg, #263126 0deg)` }} aria-label={`${percent}% of lessons completed`}>
        <strong>{percent}%</strong>
        <span>complete</span>
      </div>
    </div>

    <div className="dashboard-stats" aria-label="Learning summary">
      <div><BookOpen size={18} /><span><strong>{completedCount}</strong><small>lessons completed</small></span></div>
      <div><CheckCircle2 size={18} /><span><strong>{practiceCount}</strong><small>challenge attempts</small></span></div>
      <div><Award size={18} /><span><strong>{exploredWorldCount}</strong><small>worlds explored</small></span></div>
    </div>

    <section className="dashboard-continue" aria-labelledby="continue-heading">
      <div>
        <span className="section-eyebrow">CONTINUE YOUR PATH</span>
        <h2 id="continue-heading">{nextLesson ? 'Your next discovery is waiting.' : 'You have explored the whole story.'}</h2>
        <p>{nextLesson ? currentWorld?.description : 'Try Explore mode to revisit a concept or follow a new thread.'}</p>
      </div>
      <Link className="btn btn-primary" to={`/story/${nextLesson || currentId}`}>
        {nextLesson ? 'Continue learning' : 'Revisit the story'} <ArrowRight size={16} />
      </Link>
    </section>

    <section className="dashboard-section" aria-labelledby="worlds-heading">
      <div className="dashboard-section-heading">
        <div><span className="section-eyebrow">THE MAP</span><h2 id="worlds-heading">Your learning path</h2></div>
        <span className="dashboard-count">{completedCount} / {lessons.length} lessons</span>
      </div>
      <div className="dashboard-world-grid">
        {worlds.map(world => {
          const worldCompleted = world.lessonIds.filter(id => completed.has(id)).length;
          const worldDone = worldCompleted === world.lessonIds.length;
          return <Link className={`dashboard-world-card ${worldDone ? 'is-complete' : ''}`} key={world.id} to={`/story/${world.lessonIds[0]}`}>
            <div className="dashboard-world-top"><span className="world-number">{String(world.order).padStart(2, '0')}</span>{worldDone ? <CheckCircle2 size={16} /> : <span>{worldCompleted}/{world.lessonIds.length}</span>}</div>
            <h3>{world.title}</h3>
            <p>{world.description}</p>
            <div className="dashboard-world-bar"><span style={{ width: `${world.lessonIds.length ? (worldCompleted / world.lessonIds.length) * 100 : 0}%` }} /></div>
          </Link>;
        })}
      </div>
    </section>

    <section className="dashboard-section dashboard-details" aria-labelledby="milestones-heading">
      <div className="dashboard-section-heading"><div><span className="section-eyebrow">MILESTONES</span><h2 id="milestones-heading">A few signals of progress</h2></div></div>
      <div className="dashboard-milestones">
        <div className={completedCount >= 1 ? 'unlocked' : ''}><span className="milestone-icon">{completedCount >= 1 ? <CheckCircle2 size={18} /> : <LockKeyhole size={17} />}</span><span><strong>First step</strong><small>Complete your first lesson</small></span></div>
        <div className={completedCount >= 5 ? 'unlocked' : ''}><span className="milestone-icon">{completedCount >= 5 ? <CheckCircle2 size={18} /> : <Circle size={17} />}</span><span><strong>Pattern finder</strong><small>Complete five lessons</small></span></div>
        <div className={practiceCount >= 3 ? 'unlocked' : ''}><span className="milestone-icon">{practiceCount >= 3 ? <CheckCircle2 size={18} /> : <Circle size={17} />}</span><span><strong>Hands-on learner</strong><small>Attempt three Master Challenges</small></span></div>
      </div>
    </section>
  </div>;
}
