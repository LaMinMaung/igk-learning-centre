import { useState, useEffect } from 'react';
import { Globe, ExternalLink, Users, BookOpen, Megaphone, GraduationCap } from 'lucide-react';
import pb from '../../../../lib/pocketbase';

interface Props { onNavigate: (tab: string) => void; userName: string }

export default function Overview({ onNavigate, userName }: Props) {
  const [stats, setStats] = useState({ students: 0, teachers: 0, courses: 0, announcements: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      pb.collection('users').getList(1, 1, { filter: "role='student'", requestKey: null }),
      pb.collection('users').getList(1, 1, { filter: "role='teacher'", requestKey: null }),
      pb.collection('courses').getList(1, 1, { requestKey: null }),
      pb.collection('announcements').getList(1, 1, { requestKey: null }),
    ]).then(([s, t, c, a]) => {
      setStats({ students: s.totalItems, teachers: t.totalItems, courses: c.totalItems, announcements: a.totalItems });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const stats_config = [
    { label: 'Students',      value: stats.students,     icon: GraduationCap, color: 'text-amber-400',  bg: 'bg-amber-500/10',  tab: 'students'      },
    { label: 'Teachers',      value: stats.teachers,     icon: Users,         color: 'text-blue-400',   bg: 'bg-blue-500/10',   tab: 'teachers'      },
    { label: 'Courses',       value: stats.courses,      icon: BookOpen,      color: 'text-emerald-400',bg: 'bg-emerald-500/10',tab: 'courses'       },
    { label: 'Announcements', value: stats.announcements,icon: Megaphone,     color: 'text-purple-400', bg: 'bg-purple-500/10', tab: 'announcements' },
  ];

  const quickActions = [
    { label: '+ Add a student',      tab: 'students',      desc: 'Register a new student' },
    { label: '+ Post announcement',  tab: 'announcements', desc: 'Notify students & teachers' },
    { label: '+ Create a course',    tab: 'courses',       desc: 'Add a new course' },
    { label: '✏️ Edit website text', tab: 'text',          desc: 'Update homepage content' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-1">Welcome back, {userName}! 👋</h2>
        <p className="text-gray-300 text-sm mb-4">You have full control of the school website and management system from here.</p>
        <a href="/" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold rounded-xl text-sm transition-colors">
          <Globe className="w-4 h-4" /> View Your Website <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats_config.map(s => (
          <button key={s.tab} onClick={() => onNavigate(s.tab)}
            className="bg-gray-800/60 border border-gray-700 hover:border-gray-500 rounded-xl p-4 text-left transition-all group">
            <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className={`text-2xl font-black ${loading ? 'text-gray-600' : 'text-white'}`}>
              {loading ? '…' : s.value}
            </p>
            <p className="text-xs text-gray-400 mt-0.5 group-hover:text-gray-300 transition-colors">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Quick actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {quickActions.map(a => (
            <button key={a.tab} onClick={() => onNavigate(a.tab)}
              className="flex items-center gap-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-gray-500
                         rounded-xl px-4 py-3 text-left transition-all">
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{a.label}</p>
                <p className="text-xs text-gray-500">{a.desc}</p>
              </div>
              <span className="text-gray-600 text-sm">→</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Tips</h3>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex gap-2"><span className="text-amber-400 shrink-0">•</span>Use <strong className="text-gray-300">Website Text</strong> to change any words on your homepage.</li>
          <li className="flex gap-2"><span className="text-amber-400 shrink-0">•</span>Use <strong className="text-gray-300">Photos</strong> to upload or replace images on the website.</li>
          <li className="flex gap-2"><span className="text-amber-400 shrink-0">•</span>Use <strong className="text-gray-300">School Settings</strong> to update your contact info and social media links.</li>
          <li className="flex gap-2"><span className="text-amber-400 shrink-0">•</span>Always click <strong className="text-gray-300">Save</strong> after making any change.</li>
        </ul>
      </div>
    </div>
  );
}
