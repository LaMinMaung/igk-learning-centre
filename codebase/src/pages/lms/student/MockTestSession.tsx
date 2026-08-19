import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../lib/auth';
import pb from '../../../lib/pocketbase';
import { getQuestions, type Question } from '../../../lib/gedQuestions';
import {
  SECTION_CONFIGS, SUBJECT_ORDER,
  PASSING_THRESHOLD, TIMER_WARNING_MINUTES,
  type SubjectId, type ExamMode,
} from '../../../lib/gedConfig';
import {
  Flag, Grid3X3, ChevronLeft, ChevronRight, Clock,
  AlertTriangle, Coffee, GripVertical, X, CheckCircle2,
} from 'lucide-react';

// ─── Utilities ─────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

interface Detail {
  questionId: string; topic: string; subject: string;
  isCorrect: boolean; userAnswer: string | string[]; correctAnswer: string | string[];
  explanation: string;
}

function scoreSession(questions: Question[], answers: Record<string, string | string[]>) {
  let correct = 0;
  const details: Detail[] = [];
  const sectionBreakdown: Record<string, { correct: number; total: number }> = {};

  for (const q of questions) {
    if (!sectionBreakdown[q.subject]) sectionBreakdown[q.subject] = { correct: 0, total: 0 };
    sectionBreakdown[q.subject].total++;

    const userAnswer = answers[q.id] ?? '';
    let isCorrect = false;
    let correctAnswer: string | string[] = '';

    if (q.type === 'multiple_choice' || q.type === 'dropdown') {
      correctAnswer = q.correctAnswer!;
      isCorrect = userAnswer === q.correctAnswer;
    } else if (q.type === 'fill_blank') {
      correctAnswer = q.correctAnswer!;
      const norm = String(userAnswer).trim().toLowerCase();
      const cNorm = q.correctAnswer!.trim().toLowerCase();
      const accepted = (q.acceptedAnswers || []).map(a => a.trim().toLowerCase());
      isCorrect = q.numeric
        ? parseFloat(norm) === parseFloat(cNorm)
        : norm === cNorm || accepted.includes(norm);
    } else if (q.type === 'drag_drop') {
      correctAnswer = q.correctOrder!;
      isCorrect = JSON.stringify(userAnswer) === JSON.stringify(q.correctOrder);
    }

    if (isCorrect) { correct++; sectionBreakdown[q.subject].correct++; }
    details.push({ questionId: q.id, topic: q.topic, subject: q.subject, isCorrect, userAnswer, correctAnswer, explanation: q.explanation });
  }

  return { correct, total: questions.length, details, sectionBreakdown };
}

// ─── Question Renderer ─────────────────────────────────────────────────────────

const QuestionRenderer: React.FC<{
  question: Question;
  answer: string | string[] | undefined;
  onChange: (val: string | string[]) => void;
}> = ({ question: q, answer, onChange }) => {
  const dragIdx = useRef<number | null>(null);
  const currentOrder = (answer as string[]) || q.items || [];

  if (q.type === 'multiple_choice') {
    const labels = ['A', 'B', 'C', 'D', 'E'];
    return (
      <div className="space-y-3">
        {(q.options || []).map((opt, i) => {
          const selected = answer === opt;
          return (
            <button key={i} onClick={() => onChange(opt)}
              className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all duration-150 ${
                selected ? 'border-amber-500 bg-amber-900/20 text-amber-100' : 'border-gray-600 bg-gray-800/60 text-gray-300 hover:border-gray-500 hover:bg-gray-700/60'
              }`}
            >
              <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${
                selected ? 'bg-amber-500 text-gray-900' : 'bg-gray-700 text-gray-400'
              }`}>
                {labels[i]}
              </span>
              <span className="flex-1 mt-0.5 leading-relaxed">{opt}</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (q.type === 'dropdown') {
    return (
      <select value={(answer as string) || ''} onChange={e => onChange(e.target.value)}
        className="w-full bg-gray-800 border-2 border-gray-600 focus:border-amber-500 text-gray-200 rounded-xl px-4 py-3 text-base outline-none transition-colors"
      >
        <option value="" disabled>Select an answer...</option>
        {(q.options || []).map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
      </select>
    );
  }

  if (q.type === 'fill_blank') {
    return (
      <input type={q.numeric ? 'number' : 'text'} value={(answer as string) || ''}
        onChange={e => onChange(e.target.value)}
        placeholder="Type your answer here..."
        className="w-full bg-gray-800 border-2 border-gray-600 focus:border-amber-500 text-gray-200 rounded-xl px-4 py-3 text-base outline-none transition-colors placeholder-gray-600"
      />
    );
  }

  if (q.type === 'drag_drop') {
    const handleDragStart = (e: React.DragEvent, idx: number) => { dragIdx.current = idx; e.dataTransfer.effectAllowed = 'move'; };
    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
    const handleDrop = (e: React.DragEvent, targetIdx: number) => {
      e.preventDefault();
      if (dragIdx.current === null || dragIdx.current === targetIdx) return;
      const next = [...currentOrder];
      const [moved] = next.splice(dragIdx.current, 1);
      next.splice(targetIdx, 0, moved);
      dragIdx.current = null;
      onChange(next);
    };
    return (
      <div className="space-y-2">
        <p className="text-sm text-gray-400 mb-3">{q.dragInstruction || 'Drag items to reorder'}</p>
        {currentOrder.map((item, idx) => (
          <div key={item} draggable
            onDragStart={e => handleDragStart(e, idx)}
            onDragOver={handleDragOver}
            onDrop={e => handleDrop(e, idx)}
            className="flex items-center gap-3 bg-gray-800 border-2 border-gray-600 hover:border-amber-500/50 rounded-xl p-4 cursor-grab active:cursor-grabbing active:opacity-60 transition-all"
          >
            <GripVertical className="w-5 h-5 text-gray-500 shrink-0" />
            <span className="w-7 h-7 rounded-lg bg-gray-700 flex items-center justify-center text-amber-400 text-sm font-bold shrink-0">{idx + 1}</span>
            <span className="text-gray-200 flex-1 text-sm leading-relaxed">{item}</span>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

// ─── Grid Overlay ──────────────────────────────────────────────────────────────

const GridOverlay: React.FC<{
  questions: Question[];
  answers: Record<string, string | string[]>;
  flagged: Set<string>;
  currentIndex: number;
  onJump: (i: number) => void;
  onClose: () => void;
  onSubmit: () => void;
}> = ({ questions, answers, flagged, currentIndex, onJump, onClose, onSubmit }) => {
  const answeredCount = questions.filter(q => {
    const a = answers[q.id];
    return a !== undefined && a !== '' && !(q.type === 'drag_drop' && JSON.stringify(a) === JSON.stringify(q.items));
  }).length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end" onClick={onClose}>
      <div className="h-full w-72 bg-gray-900 border-l border-gray-700 shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="px-4 py-4 border-b border-gray-700 flex items-center justify-between shrink-0">
          <h3 className="font-bold text-white">Question Overview</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-700 text-gray-400"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-4 py-2 border-b border-gray-800 flex flex-wrap gap-3 text-xs text-gray-400 shrink-0">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500 inline-block" />Answered</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-600 inline-block" />Flagged</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-600 inline-block" />Unanswered</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const answered = answers[q.id] !== undefined && answers[q.id] !== '' &&
                !(q.type === 'drag_drop' && JSON.stringify(answers[q.id]) === JSON.stringify(q.items));
              const isFlagged = flagged.has(q.id);
              const isCurrent = idx === currentIndex;
              let cls = 'aspect-square flex items-center justify-center text-xs font-bold rounded-lg transition-colors cursor-pointer border-2 ';
              if (isCurrent) cls += 'border-white '; else cls += 'border-transparent ';
              if (isFlagged) cls += 'bg-red-700 text-white';
              else if (answered) cls += 'bg-amber-600 text-gray-900';
              else cls += 'bg-gray-700 text-gray-400 hover:bg-gray-600';
              return (
                <button key={q.id} className={cls} onClick={() => { onJump(idx); onClose(); }} title={`Q${idx + 1}${isFlagged ? ' (Flagged)' : ''}`}>
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
        <div className="px-4 py-3 border-t border-gray-800 space-y-3 shrink-0">
          <p className="text-sm text-gray-400">{answeredCount}/{questions.length} answered · {flagged.size} flagged</p>
          <button onClick={onSubmit}
            className="w-full py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold text-sm transition-colors"
          >
            Submit Test
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Break Modal ───────────────────────────────────────────────────────────────

const BreakModal: React.FC<{ breakTimeLeft: number; onResume: () => void }> = ({ breakTimeLeft, onResume }) => (
  <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
    <div className="bg-gray-800 border-2 border-amber-600/50 rounded-2xl p-8 max-w-md w-full text-center">
      <Coffee className="w-14 h-14 text-amber-400 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-white mb-2">Scheduled Break</h2>
      <p className="text-gray-400 mb-6 leading-relaxed">
        You have reached the 10-minute break in the Reasoning Through Language Arts section. Step away and rest before continuing.
      </p>
      <div className="text-5xl font-mono font-bold text-amber-400 mb-6">{formatTime(breakTimeLeft)}</div>
      <p className="text-gray-500 text-sm mb-5">Break ends automatically when the timer reaches zero.</p>
      <button onClick={onResume}
        className="bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold py-3 px-8 rounded-xl transition-colors"
      >
        Resume Early
      </button>
    </div>
  </div>
);

// ─── Main Session ──────────────────────────────────────────────────────────────

const VALID_MODES: string[] = ['rla', 'math', 'science', 'social_studies', 'full_exam'];

const MockTestSession: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const subject = searchParams.get('subject') as ExamMode;

  useEffect(() => {
    if (!subject || !VALID_MODES.includes(subject)) navigate('/lms/student/mock-test');
  }, [subject, navigate]);

  const questions = useMemo(() => getQuestions(subject), [subject]);

  const totalMinutes = subject === 'full_exam'
    ? SUBJECT_ORDER.reduce((s, id) => s + SECTION_CONFIGS[id].durationMinutes, 0)
    : (SECTION_CONFIGS[subject as SubjectId]?.durationMinutes ?? 90);
  const totalSeconds = totalMinutes * 60;

  const rlaCfg = SECTION_CONFIGS['rla'];
  const hasBreak = subject === 'rla' || subject === 'full_exam';
  const breakTriggerSeconds = hasBreak ? totalSeconds - rlaCfg.breakAfterMinutes! * 60 : -1;
  const breakDuration = (rlaCfg.breakDurationMinutes ?? 10) * 60;

  const sectionLabel = subject === 'full_exam'
    ? 'Full GED Exam'
    : SECTION_CONFIGS[subject as SubjectId]?.shortLabel ?? '';

  // ─── State ─────────────────────────────────────────────────────────────────

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [showGrid, setShowGrid] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [breakActive, setBreakActive] = useState(false);
  const [breakTimeLeft, setBreakTimeLeft] = useState(breakDuration);
  const [breakShown, setBreakShown] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Refs for stable access in intervals
  const timeLeftRef = useRef(totalSeconds);
  const breakActiveRef = useRef(false);
  const submittedRef = useRef(false);
  const answersRef = useRef<Record<string, string | string[]>>({});

  const updateAnswer = (id: string, val: string | string[]) => {
    answersRef.current = { ...answersRef.current, [id]: val };
    setAnswers(prev => ({ ...prev, [id]: val }));
  };

  // Initialize drag-drop answers
  useEffect(() => {
    const init: Record<string, string | string[]> = {};
    for (const q of questions) {
      if (q.type === 'drag_drop') init[q.id] = [...(q.items || [])];
    }
    answersRef.current = { ...init };
    setAnswers(init);
  }, [questions]);

  // Submit handler (reads from refs to avoid stale closures)
  const doSubmit = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitted(true);
    setSubmitting(true);
    setShowConfirm(false);
    setShowGrid(false);

    const { correct, total, details, sectionBreakdown } = scoreSession(questions, answersRef.current);
    const percentage = Math.round((correct / total) * 100);
    const passed = percentage >= PASSING_THRESHOLD;
    const timeTaken = totalSeconds - timeLeftRef.current;

    try {
      const result = await pb.collection('ged_test_results').create({
        student: user!.id,
        subject,
        correct_count: correct,
        total_questions: total,
        percentage,
        time_taken_seconds: Math.max(0, timeTaken),
        passed,
        details_json: { details, sectionBreakdown },
      });
      navigate(`/lms/student/mock-test/results/${result.id}`);
    } catch (err) {
      console.error('Could not save result:', err);
      navigate('/lms/student/mock-test/results/local', {
        state: { correct, total, percentage, passed, timeTaken, subject, details, sectionBreakdown },
      });
    }
  }, [questions, user, subject, totalSeconds, navigate]);

  const doSubmitRef = useRef(doSubmit);
  useEffect(() => { doSubmitRef.current = doSubmit; }, [doSubmit]);

  // Main timer
  useEffect(() => {
    if (submitted) return;
    const id = setInterval(() => {
      if (submittedRef.current || breakActiveRef.current) return;
      const newTime = timeLeftRef.current - 1;
      timeLeftRef.current = newTime;
      setTimeLeft(newTime);

      if (newTime === TIMER_WARNING_MINUTES * 60) setShowWarning(true);

      if (hasBreak && !breakShown && newTime === breakTriggerSeconds) {
        breakActiveRef.current = true;
        setBreakActive(true);
        setBreakShown(true);
      }

      if (newTime <= 0) doSubmitRef.current();
    }, 1000);
    return () => clearInterval(id);
  }, [submitted, breakShown, hasBreak, breakTriggerSeconds]);

  // Break timer
  useEffect(() => {
    if (!breakActive) return;
    const id = setInterval(() => {
      setBreakTimeLeft(prev => {
        if (prev <= 1) {
          setBreakActive(false);
          breakActiveRef.current = false;
          return breakDuration;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [breakActive, breakDuration]);

  const handleResume = () => {
    setBreakActive(false);
    breakActiveRef.current = false;
    setBreakTimeLeft(breakDuration);
  };

  const toggleFlag = () => {
    setFlagged(prev => {
      const next = new Set(prev);
      if (next.has(currentQ.id)) next.delete(currentQ.id); else next.add(currentQ.id);
      return next;
    });
  };

  if (!questions.length || !subject || !VALID_MODES.includes(subject)) return null;

  const currentQ = questions[currentIndex];
  const answeredCount = questions.filter(q => {
    const a = answers[q.id];
    return a !== undefined && a !== '' && !(q.type === 'drag_drop' && JSON.stringify(a) === JSON.stringify(q.items));
  }).length;

  const timerClass = timeLeft <= 60
    ? 'text-red-400 animate-pulse'
    : timeLeft <= TIMER_WARNING_MINUTES * 60
    ? 'text-amber-400 animate-pulse'
    : 'text-amber-300';

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">

      {/* ── Warning Banner ────────────────────────────────────────────────── */}
      {showWarning && (
        <div className="bg-amber-900/80 border-b border-amber-700/60 px-4 py-2 flex items-center justify-between text-sm z-40">
          <span className="flex items-center gap-2 text-amber-300">
            <AlertTriangle className="w-4 h-4" />
            {TIMER_WARNING_MINUTES} minutes remaining — finish up!
          </span>
          <button onClick={() => setShowWarning(false)} className="text-amber-500 hover:text-amber-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Top Bar ───────────────────────────────────────────────────────── */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-30 px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left */}
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-amber-400 font-bold text-sm shrink-0">{sectionLabel}</span>
            <span className="text-gray-600 hidden sm:block text-sm">|</span>
            <span className="text-gray-400 text-sm hidden sm:block">Q {currentIndex + 1} of {questions.length}</span>
          </div>

          {/* Center: progress bar */}
          <div className="flex-1 hidden md:flex flex-col items-center max-w-xs mx-auto">
            <div className="w-full bg-gray-800 rounded-full h-1.5">
              <div
                className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.round((answeredCount / questions.length) * 100)}%` }}
              />
            </div>
            <p className="text-gray-500 text-xs mt-1">{answeredCount} of {questions.length} answered</p>
          </div>

          {/* Right: controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={toggleFlag}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                flagged.has(currentQ.id)
                  ? 'bg-red-800/40 text-red-400 border-red-700'
                  : 'bg-gray-800 text-gray-400 hover:text-amber-400 border-gray-700'
              }`}
              title="Flag for review"
            >
              <Flag className="w-4 h-4" />
              <span className="hidden sm:block">{flagged.has(currentQ.id) ? 'Flagged' : 'Flag'}</span>
            </button>

            <button onClick={() => setShowGrid(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-800 text-gray-400 hover:text-amber-400 border border-gray-700 transition-colors"
              title="Question overview"
            >
              <Grid3X3 className="w-4 h-4" />
              <span className="hidden sm:block">Overview</span>
            </button>

            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 font-mono text-sm font-bold ${timerClass}`}>
              <Clock className="w-4 h-4" />
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </header>

      {/* ── Question Area ─────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8">

          {/* Q label + topic */}
          <div className="flex items-center flex-wrap gap-2 mb-6">
            <span className="bg-amber-600 text-gray-900 px-3 py-1 rounded-lg text-sm font-bold">
              Question {currentIndex + 1}
            </span>
            <span className="text-gray-500 text-sm">{currentQ.topic}</span>
            {flagged.has(currentQ.id) && (
              <span className="flex items-center gap-1 text-red-400 text-xs font-semibold">
                <Flag className="w-3 h-3" /> Flagged
              </span>
            )}
          </div>

          {/* Passage */}
          {currentQ.passage && (
            <div className="bg-gray-800/80 border border-gray-700 rounded-xl p-5 mb-6 max-h-60 overflow-y-auto">
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{currentQ.passage}</p>
            </div>
          )}

          {/* Question text */}
          <p className="text-gray-100 text-lg leading-relaxed mb-8 whitespace-pre-line">{currentQ.question}</p>

          {/* Answer */}
          <QuestionRenderer
            question={currentQ}
            answer={answers[currentQ.id]}
            onChange={val => updateAnswer(currentQ.id, val)}
          />
        </div>
      </main>

      {/* ── Bottom Nav ───────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 border-t border-gray-800 px-4 py-3 z-20">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <ChevronLeft className="w-5 h-5" /> Previous
          </button>

          <span className="text-gray-500 text-sm select-none">{currentIndex + 1} / {questions.length}</span>

          {currentIndex < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIndex(i => Math.min(questions.length - 1, i + 1))}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors font-medium"
            >
              Next <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold transition-colors disabled:opacity-50"
            >
              Submit Test <CheckCircle2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </footer>

      {/* ── Overlays ─────────────────────────────────────────────────────── */}

      {showGrid && (
        <GridOverlay
          questions={questions} answers={answers} flagged={flagged}
          currentIndex={currentIndex}
          onJump={setCurrentIndex}
          onClose={() => setShowGrid(false)}
          onSubmit={() => { setShowGrid(false); setShowConfirm(true); }}
        />
      )}

      {breakActive && (
        <BreakModal breakTimeLeft={breakTimeLeft} onResume={handleResume} />
      )}

      {/* Confirm Submit */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-gray-800 border-2 border-gray-700 rounded-2xl p-8 max-w-sm w-full text-center">
            <CheckCircle2 className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Submit Test?</h3>
            <p className="text-gray-400 mb-1">
              You have answered <span className="text-white font-bold">{answeredCount}</span> of{' '}
              <span className="text-white font-bold">{questions.length}</span> questions.
            </p>
            {flagged.size > 0 && (
              <p className="text-amber-400 text-sm mt-2">
                {flagged.size} question{flagged.size > 1 ? 's are' : ' is'} flagged for review.
              </p>
            )}
            <p className="text-gray-500 text-sm mt-3 mb-6">Unanswered questions will be marked incorrect.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-gray-700 text-gray-300 hover:bg-gray-600 font-medium transition-colors"
              >
                Go Back
              </button>
              <button onClick={doSubmit} disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold transition-colors disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockTestSession;
