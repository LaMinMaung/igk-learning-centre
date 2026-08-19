import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../lib/auth';
import pb from '../../../lib/pocketbase';
import DashboardLayout from '../../../components/lms/DashboardLayout';
import {
  BookOpen, Calculator, FlaskConical, Globe, Search,
  Bookmark, BookmarkCheck, ChevronRight, GraduationCap,
  FileText, ListChecks, BookCopy, Layers, Loader2, X, Filter,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────────

interface Resource {
  id: string;
  subject: string;
  topic: string;
  type: string;
  title: string;
  content: string;
  file_url?: string;
  updated: string;
}

// ─── Config ──────────────────────────────────────────────────────────────────────

const SUBJECTS = [
  {
    id: 'rla', short: 'RLA', label: 'Reasoning Through Language Arts', Icon: BookOpen,
    color: 'text-blue-400', bg: 'bg-blue-950/40', border: 'border-blue-700/50',
    accent: 'border-l-blue-500', iconBg: 'bg-blue-900/40 border-blue-700/60',
    topics: ['Reading Comprehension', 'Writing & Language', 'Literary Analysis', 'Extended Response'],
  },
  {
    id: 'math', short: 'Math', label: 'Mathematical Reasoning', Icon: Calculator,
    color: 'text-green-400', bg: 'bg-green-950/40', border: 'border-green-700/50',
    accent: 'border-l-green-500', iconBg: 'bg-green-900/40 border-green-700/60',
    topics: ['Algebra', 'Geometry', 'Data Analysis', 'Number Sense'],
  },
  {
    id: 'science', short: 'Science', label: 'Science', Icon: FlaskConical,
    color: 'text-purple-400', bg: 'bg-purple-950/40', border: 'border-purple-700/50',
    accent: 'border-l-purple-500', iconBg: 'bg-purple-900/40 border-purple-700/60',
    topics: ['Life Science', 'Physical Science', 'Earth & Space Science'],
  },
  {
    id: 'social_studies', short: 'Social Studies', label: 'Social Studies', Icon: Globe,
    color: 'text-amber-400', bg: 'bg-amber-950/40', border: 'border-amber-700/50',
    accent: 'border-l-amber-500', iconBg: 'bg-amber-900/40 border-amber-700/60',
    topics: ['US History', 'Civics & Government', 'Economics', 'Geography'],
  },
];

const TYPE_CONFIG: Record<string, { label: string; badge: string; Icon: React.ElementType }> = {
  study_guide:   { label: 'Study Guide',   badge: 'text-blue-400 bg-blue-900/30 border-blue-700/50',   Icon: BookCopy   },
  formula_sheet: { label: 'Formula Sheet', badge: 'text-green-400 bg-green-900/30 border-green-700/50', Icon: Layers     },
  vocab_list:    { label: 'Vocab List',    badge: 'text-amber-400 bg-amber-900/30 border-amber-700/50', Icon: ListChecks },
  breakdown:     { label: 'Breakdown',     badge: 'text-purple-400 bg-purple-900/30 border-purple-700/50', Icon: FileText },
};

const getSubject = (id: string) => SUBJECTS.find(s => s.id === id);

// ─── Resource card ────────────────────────────────────────────────────────────────

const ResourceCard: React.FC<{
  resource: Resource;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
}> = ({ resource, isBookmarked, onToggleBookmark }) => {
  const navigate = useNavigate();
  const subj = getSubject(resource.subject);
  const typeConf = TYPE_CONFIG[resource.type] ?? TYPE_CONFIG.study_guide;
  const TypeIcon = typeConf.Icon;

  return (
    <div
      onClick={() => navigate(`/lms/student/resources/read/${resource.id}`)}
      className={`bg-gray-800 border border-gray-700 border-l-4 ${subj?.accent ?? 'border-l-gray-500'}
        rounded-xl p-4 cursor-pointer hover:bg-gray-750 hover:border-gray-600 transition-colors group`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md border ${typeConf.badge}`}>
            <TypeIcon className="w-3 h-3" />{typeConf.label}
          </span>
          {subj && (
            <span className={`text-xs font-medium ${subj.color}`}>{subj.short}</span>
          )}
        </div>
        <button
          onClick={e => { e.stopPropagation(); onToggleBookmark(resource.id); }}
          className={`shrink-0 p-1.5 rounded-lg transition-colors ${
            isBookmarked ? 'text-amber-400 hover:text-amber-300' : 'text-gray-600 hover:text-gray-400'
          }`}
          title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
        >
          {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>
      </div>
      <h3 className="text-sm font-semibold text-white leading-snug mb-1 group-hover:text-amber-300 transition-colors">
        {resource.title}
      </h3>
      <p className="text-xs text-gray-500">{resource.topic}</p>
      <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${subj?.color ?? 'text-gray-400'} opacity-0 group-hover:opacity-100 transition-opacity`}>
        Open resource <ChevronRight className="w-3.5 h-3.5" />
      </div>
    </div>
  );
};

// ─── Type filter bar ───────────────────────────────────────────────────────────────

const TypeFilterBar: React.FC<{ activeType: string; onChange: (t: string) => void }> = ({ activeType, onChange }) => (
  <div className="flex items-center gap-2 mb-5 flex-wrap">
    <Filter className="w-3.5 h-3.5 text-gray-500 shrink-0" />
    {(['', ...Object.keys(TYPE_CONFIG)] as string[]).map(t => (
      <button key={t} onClick={() => onChange(t)}
        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
          activeType === t
            ? 'bg-amber-600 border-amber-500 text-white'
            : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300'
        }`}
      >
        {t ? TYPE_CONFIG[t].label : 'All Types'}
      </button>
    ))}
  </div>
);

// ─── Main component ────────────────────────────────────────────────────────────────

const ResourceLibrary: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const subject       = searchParams.get('subject') ?? '';
  const topic         = searchParams.get('topic') ?? '';
  const showBookmarks = searchParams.get('bookmarks') === '1';
  const searchQuery   = searchParams.get('search') ?? '';

  const [resources,   setResources]   = useState<Resource[]>([]);
  const [bookmarkMap, setBookmarkMap] = useState<Record<string, string>>({}); // resourceId → bookmarkRecordId
  const [loading,     setLoading]     = useState(true);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [activeType,  setActiveType]  = useState('');

  // Load all resources once
  useEffect(() => {
    pb.collection('resources').getFullList<Resource>({ sort: 'subject,topic,title', requestKey: null })
      .then(setResources).catch(console.error).finally(() => setLoading(false));
  }, []);

  // Load bookmarks
  useEffect(() => {
    if (!user) return;
    pb.collection('resource_bookmarks').getFullList<{ id: string; resource: string }>({
      filter: pb.filter('student = {:id}', { id: user.id }),
      fields: 'id,resource',
      requestKey: null,
    }).then(bms => {
      const map: Record<string, string> = {};
      bms.forEach(b => { map[b.resource] = b.id; });
      setBookmarkMap(map);
    }).catch(console.error);
  }, [user]);

  // Compute filtered list
  const filtered = useMemo(() => {
    let r = resources;
    if (showBookmarks) { r = r.filter(x => bookmarkMap[x.id]); }
    else {
      if (subject) r = r.filter(x => x.subject === subject);
      if (topic)   r = r.filter(x => x.topic === topic);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      r = r.filter(x => x.title.toLowerCase().includes(q) || x.topic.toLowerCase().includes(q));
    }
    if (activeType) r = r.filter(x => x.type === activeType);
    return r;
  }, [resources, subject, topic, showBookmarks, searchQuery, activeType, bookmarkMap]);

  // Topics with counts for subject view
  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    resources.filter(r => r.subject === subject).forEach(r => {
      counts[r.topic] = (counts[r.topic] ?? 0) + 1;
    });
    return counts;
  }, [resources, subject]);

  const handleToggleBookmark = useCallback(async (resourceId: string) => {
    if (!user) return;
    const existing = bookmarkMap[resourceId];
    if (existing) {
      try {
        await pb.collection('resource_bookmarks').delete(existing);
        setBookmarkMap(prev => { const n = { ...prev }; delete n[resourceId]; return n; });
      } catch (e) { console.error(e); }
    } else {
      try {
        const bm = await pb.collection('resource_bookmarks').create<{ id: string; resource: string }>(
          { student: user.id, resource: resourceId }
        );
        setBookmarkMap(prev => ({ ...prev, [resourceId]: bm.id }));
      } catch (e) { console.error(e); }
    }
  }, [user, bookmarkMap]);

  const handleSearch = (q: string) => {
    setLocalSearch(q);
    const p = new URLSearchParams();
    if (q) p.set('search', q);
    setSearchParams(p);
    setActiveType('');
  };

  const goToHub     = () => { setSearchParams({}); setLocalSearch(''); setActiveType(''); };
  const goToSubject = (s: string) => setSearchParams({ subject: s });
  const activSubj   = getSubject(subject);
  const bookmarkCount = Object.keys(bookmarkMap).length;

  // Breadcrumb
  const Breadcrumb = () => (
    <nav className="flex items-center flex-wrap gap-1 text-sm text-gray-500 mb-6">
      <button onClick={goToHub} className="hover:text-amber-400 transition-colors">Resources</button>
      {showBookmarks && <><ChevronRight className="w-3.5 h-3.5" /><span className="text-gray-300">Saved</span></>}
      {subject && !showBookmarks && <>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => goToSubject(subject)} className={`hover:text-amber-400 transition-colors ${activSubj?.color}`}>
          {activSubj?.short}
        </button>
      </>}
      {topic && <><ChevronRight className="w-3.5 h-3.5" /><span className="text-gray-300">{topic}</span></>}
      {searchQuery && <><ChevronRight className="w-3.5 h-3.5" /><span className="text-gray-300">Search: "{searchQuery}"</span></>}
    </nav>
  );

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl font-bold text-white">Resource Library</h1>
            <p className="text-gray-400 text-sm mt-1">Study guides, formula sheets, and vocab lists for every GED subject.</p>
          </div>
          <button
            onClick={() => { setSearchParams({ bookmarks: '1' }); setLocalSearch(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold shrink-0 transition-colors ${
              showBookmarks
                ? 'bg-amber-600 border-amber-500 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:text-amber-400 hover:border-amber-600'
            }`}
          >
            <BookmarkCheck className="w-4 h-4" />
            Saved ({bookmarkCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={localSearch}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search resources by title or topic…"
            className="w-full bg-gray-800 border border-gray-700 focus:border-amber-500/60 rounded-xl pl-11 pr-10 py-3 text-sm text-gray-200 placeholder-gray-600 outline-none transition-colors"
          />
          {localSearch && (
            <button onClick={() => handleSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-300 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Views ─────────────────────────────────────────────────── */}

      {searchQuery ? (
        /* ── Search results ───────────────────────────────────────── */
        <>
          <Breadcrumb />
          <TypeFilterBar activeType={activeType} onChange={setActiveType} />
          <p className="text-sm text-gray-400 mb-4">{filtered.length} result{filtered.length !== 1 ? 's' : ''} for "<span className="text-white">{searchQuery}</span>"</p>
          {filtered.length === 0
            ? <div className="text-center py-16"><Search className="w-10 h-10 text-gray-700 mx-auto mb-3" /><p className="text-gray-400">No resources match your search.</p></div>
            : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(r => <ResourceCard key={r.id} resource={r} isBookmarked={!!bookmarkMap[r.id]} onToggleBookmark={handleToggleBookmark} />)}
              </div>
          }
        </>

      ) : showBookmarks ? (
        /* ── Bookmarks ────────────────────────────────────────────── */
        <>
          <Breadcrumb />
          <TypeFilterBar activeType={activeType} onChange={setActiveType} />
          {filtered.length === 0
            ? <div className="text-center py-16">
                <Bookmark className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-400 mb-1">No saved resources yet.</p>
                <p className="text-gray-600 text-sm">Click the bookmark icon on any resource card to save it here.</p>
              </div>
            : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(r => <ResourceCard key={r.id} resource={r} isBookmarked={!!bookmarkMap[r.id]} onToggleBookmark={handleToggleBookmark} />)}
              </div>
          }
        </>

      ) : !subject ? (
        /* ── Hub: 4 subject cards ─────────────────────────────────── */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {SUBJECTS.map(s => {
            const count  = resources.filter(r => r.subject === s.id).length;
            const topics = [...new Set(resources.filter(r => r.subject === s.id).map(r => r.topic))];
            return (
              <button key={s.id} onClick={() => goToSubject(s.id)}
                className={`text-left rounded-2xl border ${s.border} ${s.bg} p-6 hover:scale-[1.015] active:scale-100 transition-transform group`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl border ${s.iconBg} flex items-center justify-center`}>
                    <s.Icon className={`w-6 h-6 ${s.color}`} />
                  </div>
                  <span className="text-gray-500 text-xs">{count} resource{count !== 1 ? 's' : ''}</span>
                </div>
                <p className={`text-xl font-black ${s.color} mb-0.5`}>{s.short}</p>
                <p className="text-gray-400 text-sm mb-4">{s.label}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {topics.map(t => (
                    <span key={t} className="text-xs bg-gray-900/60 text-gray-400 px-2 py-0.5 rounded-md">{t}</span>
                  ))}
                </div>
                <div className={`flex items-center gap-1.5 text-sm font-semibold ${s.color} group-hover:gap-2.5 transition-all`}>
                  Browse <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>

      ) : !topic ? (
        /* ── Subject view: topic list ─────────────────────────────── */
        <>
          <Breadcrumb />
          <div className="flex items-center gap-3 mb-6">
            {activSubj && <activSubj.Icon className={`w-6 h-6 ${activSubj.color}`} />}
            <h2 className="text-xl font-bold text-white">{activSubj?.label}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
            {(activSubj?.topics ?? []).map(t => {
              const count = topicCounts[t] ?? 0;
              if (!count) return null;
              return (
                <button key={t} onClick={() => setSearchParams({ subject, topic: t })}
                  className="flex items-center justify-between p-4 bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-xl transition-colors text-left group"
                >
                  <div>
                    <p className="text-white font-semibold text-sm group-hover:text-amber-300 transition-colors">{t}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{count} resource{count !== 1 ? 's' : ''}</p>
                  </div>
                  <ChevronRight className={`w-5 h-5 ${activSubj?.color} opacity-40 group-hover:opacity-100 transition-opacity`} />
                </button>
              );
            })}
          </div>

          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">All {activSubj?.short} Resources</h3>
          <TypeFilterBar activeType={activeType} onChange={setActiveType} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(r => <ResourceCard key={r.id} resource={r} isBookmarked={!!bookmarkMap[r.id]} onToggleBookmark={handleToggleBookmark} />)}
          </div>
        </>

      ) : (
        /* ── Topic view: resource list ────────────────────────────── */
        <>
          <Breadcrumb />
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-white">{topic}</h2>
              <p className="text-gray-500 text-sm mt-0.5">{filtered.length} resource{filtered.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <TypeFilterBar activeType={activeType} onChange={setActiveType} />
          {filtered.length === 0
            ? <div className="text-center py-16"><GraduationCap className="w-10 h-10 text-gray-700 mx-auto mb-3" /><p className="text-gray-400">No resources match this filter.</p></div>
            : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(r => <ResourceCard key={r.id} resource={r} isBookmarked={!!bookmarkMap[r.id]} onToggleBookmark={handleToggleBookmark} />)}
              </div>
          }
        </>
      )}
    </DashboardLayout>
  );
};

export default ResourceLibrary;
