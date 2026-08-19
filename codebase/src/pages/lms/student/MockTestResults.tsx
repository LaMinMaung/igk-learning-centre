import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/lms/DashboardLayout';
import pb from '../../../lib/pocketbase';
import {
  SECTION_CONFIGS, SUBJECT_ORDER,
  PASSING_THRESHOLD, COLLEGE_READY_THRESHOLD, HONORS_THRESHOLD,
  type SubjectId,
} from '../../../lib/gedConfig';
import { Trophy, CheckCircle, XCircle, Clock, ArrowLeft, RotateCcw, ChevronDown, ChevronUp, Library } from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Detail {
  questionId: string; topic: string; subject: string;
  isCorrect: boolean; userAnswer: string | string[]; correctAnswer: string | string[];
  explanation: string;
}

interface ResultData {
  subject: string;
  correct_count: number;
  total_questions: number;
  percentage: number;
  time_taken_seconds: number;
  passed: boolean;
  details: Detail[];
  sectionBreakdown: Record<string, { correct: number; total: number }>;
  created?: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
};

const SUBJECT_LABELS: Record<string, string> = {
  rla: 'RLA', math: 'Math', science: 'Science', social_studies: 'Social Studies', full_exam: 'Full Exam',
};

function getLevel(pct: number): { label: string; color: string; ring: string } {
  if (pct >= HONORS_THRESHOLD) return { label: 'Honors', color: 'text-purple-400', ring: '#c084fc' };
  if (pct >= COLLEGE_READY_THRESHOLD) return { label: 'College Ready', color: 'text-blue-400', ring: '#60a5fa' };
  if (pct >= PASSING_THRESHOLD) return { label: 'GED Ready', color: 'text-green-400', ring: '#4ade80' };
  return { label: 'Not Yet Passing', color: 'text-red-400', ring: '#f87171' };
}

function groupByTopic(details: Detail[]): Record<string, { correct: number; total: number }> {
  const map: Record<string, { correct: number; total: number }> = {};
  for (const d of details) {
    if (!map[d.topic]) map[d.topic] = { correct: 0, total: 0 };
    map[d.topic].total++;
    if (d.isCorrect) map[d.topic].correct++;
  }
  return map;
}

// ─── Score Circle ──────────────────────────────────────────────────────────────

const ScoreCircle: React.FC<{ pct: number; color: string }> = ({ pct, color }) => {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width="140" height="140" className="rotate-[-90deg]">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#1f2937" strokeWidth="10" />
      <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s ease-out' }}
      />
    </svg>
  );
};

// ─── Main Results Page ────────────────────────────────────────────────────────

const MockTestResults: React.FC = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    if (resultId === 'local') {
      // Fallback: use location state from failed DB save
      const s = location.state as any;
      if (s) {
        setData({
          subject: s.subject,
          correct_count: s.correct,
          total_questions: s.total,
          percentage: s.percentage,
          time_taken_seconds: s.timeTaken,
          passed: s.passed,
          details: s.details || [],
          sectionBreakdown: s.sectionBreakdown || {},
        });
      }
      setLoading(false);
      return;
    }

    pb.collection('ged_test_results').getOne(resultId!, { requestKey: null })
      .then(rec => {
        const dj = (rec.details_json as any) || {};
        setData({
          subject: rec.subject,
          correct_count: rec.correct_count,
          total_questions: rec.total_questions,
          percentage: rec.percentage,
          time_taken_seconds: rec.time_taken_seconds,
          passed: rec.passed,
          details: dj.details || [],
          sectionBreakdown: dj.sectionBreakdown || {},
          created: rec.created,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [resultId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto text-center py-20">
          <p className="text-gray-400 mb-4">Results not found.</p>
          <button onClick={() => navigate('/lms/student/mock-test')}
            className="text-amber-400 hover:text-amber-300 font-medium"
          >
            Back to Mock Test Hub
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const level = getLevel(data.percentage);
  const topicBreakdown = groupByTopic(data.details);
  const isFullExam = data.subject === 'full_exam';

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/lms/student/mock-test')}
            className="flex items-center gap-2 text-gray-400 hover:text-amber-400 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Hub
          </button>
          <span className="text-gray-700">|</span>
          <h1 className="text-2xl font-bold text-amber-300">
            {SUBJECT_LABELS[data.subject] ?? data.subject} — Results
          </h1>
        </div>

        {/* Score Hero */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border-2 border-gray-700 p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            {/* Circle */}
            <div className="relative shrink-0">
              <ScoreCircle pct={data.percentage} color={level.ring} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">{data.percentage}%</span>
                <span className="text-xs text-gray-400">{data.correct_count}/{data.total_questions}</span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-3 ${
                data.passed ? 'bg-green-900/40 text-green-400 border border-green-700' : 'bg-red-900/40 text-red-400 border border-red-700'
              }`}>
                {data.passed ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {level.label}
              </div>
              <h2 className="text-3xl font-bold text-white mb-1">
                {data.passed ? 'Congratulations!' : 'Keep Practicing'}
              </h2>
              <p className="text-gray-400 mb-4">
                {data.passed
                  ? `You scored ${data.percentage}% — above the ${PASSING_THRESHOLD}% passing threshold.`
                  : `You scored ${data.percentage}%. You need ${PASSING_THRESHOLD}% to pass. Keep going!`}
              </p>
              <div className="flex flex-wrap gap-4 justify-center sm:justify-start text-sm text-gray-400">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {fmt(data.time_taken_seconds)} taken</span>
                {data.created && (
                  <span>{new Date(data.created).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          </div>

          {/* Threshold bar */}
          <div className="mt-8">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>0%</span>
              <span className="text-amber-500">{PASSING_THRESHOLD}% Pass</span>
              <span className="text-blue-500">{COLLEGE_READY_THRESHOLD}% College</span>
              <span className="text-purple-500">{HONORS_THRESHOLD}% Honors</span>
              <span>100%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 relative overflow-visible">
              {/* Threshold markers */}
              {[PASSING_THRESHOLD, COLLEGE_READY_THRESHOLD, HONORS_THRESHOLD].map(t => (
                <div key={t} className="absolute top-0 bottom-0 w-0.5 bg-gray-500 z-10" style={{ left: `${t}%` }} />
              ))}
              <div className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${data.percentage}%`, background: level.ring }}
              />
            </div>
          </div>
        </div>

        {/* Section Breakdown (Full Exam) */}
        {isFullExam && Object.keys(data.sectionBreakdown).length > 0 && (
          <div className="bg-gray-800 rounded-2xl border-2 border-gray-700 p-6 mb-6">
            <h3 className="text-lg font-bold text-amber-300 mb-4">Section Breakdown</h3>
            <div className="space-y-3">
              {SUBJECT_ORDER.filter(id => data.sectionBreakdown[id]).map(id => {
                const sb = data.sectionBreakdown[id];
                const cfg = SECTION_CONFIGS[id as SubjectId];
                const pct = Math.round((sb.correct / sb.total) * 100);
                const passed = pct >= cfg.passPercentage;
                return (
                  <div key={id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${cfg.accentClass}`}>{cfg.label}</span>
                      <span className={`text-sm font-bold ${passed ? 'text-green-400' : 'text-red-400'}`}>
                        {pct}% ({sb.correct}/{sb.total})
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className={`h-full rounded-full ${passed ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Topic Breakdown */}
        {Object.keys(topicBreakdown).length > 0 && (
          <div className="bg-gray-800 rounded-2xl border-2 border-gray-700 p-6 mb-6">
            <h3 className="text-lg font-bold text-amber-300 mb-4">Performance by Topic</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(topicBreakdown).map(([topic, { correct, total }]) => {
                const pct = Math.round((correct / total) * 100);
                return (
                  <div key={topic} className="bg-gray-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300 text-sm font-medium">{topic}</span>
                      <span className={`text-sm font-bold ${pct >= 65 ? 'text-green-400' : 'text-red-400'}`}>
                        {correct}/{total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-1.5">
                      <div className={`h-full rounded-full ${pct >= 65 ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Answer Review */}
        {data.details.length > 0 && (
          <div className="bg-gray-800 rounded-2xl border-2 border-gray-700 mb-8 overflow-hidden">
            <button
              onClick={() => setShowReview(v => !v)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-700/40 transition-colors"
            >
              <h3 className="text-lg font-bold text-amber-300">Answer Review</h3>
              {showReview ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>

            {showReview && (
              <div className="border-t border-gray-700 divide-y divide-gray-700/50">
                {data.details.map((d, idx) => (
                  <div key={d.questionId} className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
                        d.isCorrect ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                      }`}>
                        {d.isCorrect ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-400 mb-1">Q{idx + 1} · {d.topic}</p>
                        {!d.isCorrect && (
                          <>
                            <p className="text-sm text-gray-400">
                              Your answer:{' '}
                              <span className="text-red-300">
                                {Array.isArray(d.userAnswer) ? d.userAnswer.join(' → ') : (d.userAnswer || 'No answer')}
                              </span>
                            </p>
                            <p className="text-sm text-gray-400">
                              Correct answer:{' '}
                              <span className="text-green-300">
                                {Array.isArray(d.correctAnswer) ? d.correctAnswer.join(' → ') : d.correctAnswer}
                              </span>
                            </p>
                          </>
                        )}
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{d.explanation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Related Resources */}
        {data.subject && data.subject !== 'full_exam' && (
          <div className="bg-gray-800 border border-amber-700/30 rounded-2xl p-5 mb-4">
            <div className="flex items-start gap-3">
              <Library className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-300 mb-1 text-sm">Study Related Material</h3>
                <p className="text-gray-400 text-xs mb-3">
                  Browse study guides, formula sheets, and vocab lists for topics covered in this test.
                </p>
                <button
                  onClick={() => navigate(`/lms/student/resources?subject=${data.subject}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  <Library className="w-4 h-4" /> Open Resource Library
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pb-8">
          <button
            onClick={() => navigate(`/lms/student/mock-test/session?subject=${data.subject}`)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold transition-colors"
          >
            <RotateCcw className="w-5 h-5" /> Retake Test
          </button>
          <button
            onClick={() => navigate('/lms/student/mock-test')}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Hub
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MockTestResults;
