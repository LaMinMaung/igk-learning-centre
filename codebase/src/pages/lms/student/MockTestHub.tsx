import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/lms/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../lib/auth';
import pb from '../../../lib/pocketbase';
import {
  SECTION_CONFIGS, SUBJECT_ORDER,
  type SubjectId, type ExamMode,
} from '../../../lib/gedConfig';
import {
  Clock, BookOpen, Calculator, FlaskConical, Globe, Play,
  ChevronRight, Trophy, CheckCircle, XCircle, RotateCcw,
} from 'lucide-react';

interface TestResult {
  id: string;
  subject: string;
  percentage: number;
  correct_count: number;
  total_questions: number;
  passed: boolean;
  time_taken_seconds: number;
  created: string;
}

const SUBJECT_ICONS: Record<SubjectId, React.ElementType> = {
  rla: BookOpen,
  math: Calculator,
  science: FlaskConical,
  social_studies: Globe,
};

const SUBJECT_LABELS: Record<string, string> = {
  rla: 'RLA',
  math: 'Math',
  science: 'Science',
  social_studies: 'Social Studies',
  full_exam: 'Full Exam',
};

const fmt = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

const fmtDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
};

const MockTestHub: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    pb.collection('ged_test_results')
      .getList<TestResult>(1, 8, {
        filter: pb.filter('student = {:id}', { id: user.id }),
        sort: '-created',
        requestKey: null,
      })
      .then(res => setResults(res.items))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const startTest = (mode: ExamMode) => navigate(`/lms/student/mock-test/session?subject=${mode}`);

  const totalMinutes = SUBJECT_ORDER.reduce((s, id) => s + SECTION_CONFIGS[id].durationMinutes, 0);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent mb-2">
            GED Mock Test Center
          </h1>
          <p className="text-gray-400 text-lg">
            Select a section to practice, or take the full timed simulation.
          </p>
        </div>

        {/* Section Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
          {SUBJECT_ORDER.map(id => {
            const cfg = SECTION_CONFIGS[id];
            const Icon = SUBJECT_ICONS[id];
            return (
              <button
                key={id}
                onClick={() => startTest(id)}
                className={`bg-gradient-to-br ${cfg.colorClass} border-2 ${cfg.borderClass} rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group`}
              >
                <div className="flex items-start justify-between mb-4">
                  <Icon className={`w-8 h-8 ${cfg.accentClass}`} />
                  <span className={`text-sm font-medium ${cfg.accentClass} flex items-center gap-1.5`}>
                    <Clock className="w-4 h-4" />
                    {fmtDuration(cfg.durationMinutes)}
                    {cfg.hasBreak && (
                      <span className="text-xs text-gray-500 ml-1">+ break</span>
                    )}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{cfg.label}</h3>
                <p className="text-gray-400 text-sm mb-5 leading-relaxed">{cfg.description}</p>
                <div className={`flex items-center gap-2 text-sm font-semibold ${cfg.accentClass} group-hover:gap-3 transition-all duration-200`}>
                  <Play className="w-4 h-4" />
                  Start Practice
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Full Exam Banner */}
        <button
          onClick={() => startTest('full_exam')}
          className="w-full bg-gradient-to-r from-amber-900/30 to-red-900/30 border-2 border-amber-600/50 hover:border-amber-400 rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group mb-10"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <Trophy className="w-9 h-9 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Full Simulated Exam</h3>
                <p className="text-gray-400 text-sm">All four sections back-to-back — the closest experience to the real GED test.</p>
              </div>
            </div>
            <div className="flex items-center gap-6 shrink-0 pl-14 sm:pl-0">
              <div>
                <p className="text-2xl font-bold text-amber-400">{fmtDuration(totalMinutes + 10)}</p>
                <p className="text-xs text-gray-500">incl. RLA break</p>
              </div>
              <div className="flex items-center gap-2 text-amber-400 font-semibold group-hover:gap-3 transition-all duration-200">
                <Play className="w-5 h-5" />
                Begin Exam
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        </button>

        {/* Recent Results */}
        <div>
          <h2 className="text-2xl font-bold text-amber-300 mb-4">Recent Results</h2>

          {loading ? (
            <div className="text-gray-400 py-10 text-center">
              <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading history...
            </div>
          ) : results.length === 0 ? (
            <div className="bg-gray-800 rounded-2xl p-10 border-2 border-gray-700 text-center">
              <RotateCcw className="w-10 h-10 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">No tests taken yet. Complete a mock test above to track your progress.</p>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-2xl border-2 border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left px-5 py-3 text-gray-400 text-sm font-semibold">Date</th>
                    <th className="text-left px-5 py-3 text-gray-400 text-sm font-semibold">Subject</th>
                    <th className="text-left px-5 py-3 text-gray-400 text-sm font-semibold">Score</th>
                    <th className="text-left px-5 py-3 text-gray-400 text-sm font-semibold">Result</th>
                    <th className="text-left px-5 py-3 text-gray-400 text-sm font-semibold hidden sm:table-cell">Time</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {results.map(r => (
                    <tr key={r.id} className="border-b border-gray-700/40 hover:bg-gray-700/30 transition-colors">
                      <td className="px-5 py-4 text-gray-400 text-sm">
                        {new Date(r.created).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-amber-300 text-sm font-medium">
                        {SUBJECT_LABELS[r.subject] ?? r.subject}
                      </td>
                      <td className="px-5 py-4 font-bold text-white">
                        {r.percentage}%{' '}
                        <span className="text-gray-500 font-normal text-sm">
                          ({r.correct_count}/{r.total_questions})
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {r.passed ? (
                          <span className="flex items-center gap-1.5 text-green-400 text-sm font-semibold">
                            <CheckCircle className="w-4 h-4" /> Pass
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-red-400 text-sm font-semibold">
                            <XCircle className="w-4 h-4" /> Not Yet
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-gray-400 text-sm hidden sm:table-cell">
                        {fmt(r.time_taken_seconds)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => navigate(`/lms/student/mock-test/results/${r.id}`)}
                          className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MockTestHub;
