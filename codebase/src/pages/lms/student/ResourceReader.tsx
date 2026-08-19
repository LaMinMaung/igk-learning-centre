import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../lib/auth';
import pb from '../../../lib/pocketbase';
import DashboardLayout from '../../../components/lms/DashboardLayout';
import { marked } from 'marked';
import {
  ArrowLeft, Bookmark, BookmarkCheck, Printer, Loader2,
  BookOpen, Calculator, FlaskConical, Globe, GraduationCap,
  BookCopy, Layers, ListChecks, FileText,
} from 'lucide-react';

// ─── Config ───────────────────────────────────────────────────────────────────

const SUBJECT_CONFIG: Record<string, { label: string; short: string; color: string; Icon: React.ElementType }> = {
  rla:            { label: 'Reasoning Through Language Arts', short: 'RLA',          color: 'text-blue-400',   Icon: BookOpen     },
  math:           { label: 'Mathematical Reasoning',          short: 'Math',         color: 'text-green-400',  Icon: Calculator   },
  science:        { label: 'Science',                         short: 'Science',      color: 'text-purple-400', Icon: FlaskConical },
  social_studies: { label: 'Social Studies',                  short: 'Soc. Studies', color: 'text-amber-400',  Icon: Globe        },
};

const TYPE_CONFIG: Record<string, { label: string; badge: string; Icon: React.ElementType }> = {
  study_guide:   { label: 'Study Guide',   badge: 'text-blue-400 bg-blue-900/30 border-blue-700/50',    Icon: BookCopy   },
  formula_sheet: { label: 'Formula Sheet', badge: 'text-green-400 bg-green-900/30 border-green-700/50', Icon: Layers     },
  vocab_list:    { label: 'Vocab List',    badge: 'text-amber-400 bg-amber-900/30 border-amber-700/50', Icon: ListChecks },
  breakdown:     { label: 'Breakdown',     badge: 'text-purple-400 bg-purple-900/30 border-purple-700/50', Icon: FileText },
};

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

// ─── Component ────────────────────────────────────────────────────────────────

const ResourceReader: React.FC = () => {
  const { resourceId } = useParams<{ resourceId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [resource,    setResource]    = useState<Resource | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [bookmarkId,  setBookmarkId]  = useState<string | null>(null);
  const [bookmarking, setBookmarking] = useState(false);

  // ── Load resource ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!resourceId) return;
    setLoading(true);
    pb.collection('resources').getOne<Resource>(resourceId, { requestKey: null })
      .then(setResource)
      .catch(() => navigate('/lms/student/resources'))
      .finally(() => setLoading(false));
  }, [resourceId]);

  // ── Load bookmark status ──────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !resourceId) return;
    pb.collection('resource_bookmarks').getFirstListItem(
      pb.filter('student = {:s} && resource = {:r}', { s: user.id, r: resourceId }),
      { requestKey: null }
    ).then(bm => setBookmarkId(bm.id)).catch(() => setBookmarkId(null));
  }, [user, resourceId]);

  // ── Toggle bookmark ───────────────────────────────────────────────────────
  const handleBookmark = useCallback(async () => {
    if (!user || !resourceId || bookmarking) return;
    setBookmarking(true);
    try {
      if (bookmarkId) {
        await pb.collection('resource_bookmarks').delete(bookmarkId);
        setBookmarkId(null);
      } else {
        const bm = await pb.collection('resource_bookmarks').create<{ id: string }>(
          { student: user.id, resource: resourceId }
        );
        setBookmarkId(bm.id);
      }
    } catch (e) { console.error(e); }
    finally { setBookmarking(false); }
  }, [user, resourceId, bookmarkId, bookmarking]);

  // ── Print handler ─────────────────────────────────────────────────────────
  const handlePrint = () => {
    if (!resource) return;
    const html = marked.parse(resource.content || '') as string;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${resource.title}</title>
<style>
  body{font-family:Georgia,serif;max-width:800px;margin:40px auto;padding:0 24px;color:#111;line-height:1.75;font-size:15px}
  h1{font-size:1.9em;border-bottom:2px solid #333;padding-bottom:10px;margin-bottom:1rem}
  h2{font-size:1.3em;margin-top:1.8rem;margin-bottom:.5rem;color:#1a1a2e}
  h3{font-size:1.05em;margin-top:1.3rem;margin-bottom:.4rem;color:#333}
  p{margin-bottom:.9rem}
  ul,ol{padding-left:1.6rem;margin-bottom:.9rem}
  li{margin-bottom:.3rem}
  strong{font-weight:700}
  em{font-style:italic}
  table{width:100%;border-collapse:collapse;margin:1rem 0;font-size:.875rem}
  th,td{padding:8px 12px;border:1px solid #ccc;text-align:left}
  th{background:#f4f4f4;font-weight:700}
  tr:nth-child(even) td{background:#fafafa}
  code{background:#f4f4f4;padding:1px 5px;border-radius:3px;font-size:.87em;font-family:monospace}
  hr{border:none;border-top:1px solid #ddd;margin:1.5rem 0}
  .meta{color:#666;font-size:.8rem;margin-bottom:1.5rem;padding-bottom:.75rem;border-bottom:1px solid #eee}
  @media print{body{margin:20px 24px}}
</style>
</head>
<body>
<div class="meta">${resource.topic} · ${TYPE_CONFIG[resource.type]?.label ?? resource.type}</div>
${html}
</body>
</html>`);
    win.document.close();
    win.print();
  };

  // ── Render markdown ───────────────────────────────────────────────────────
  const htmlContent = resource ? marked.parse(resource.content || '') as string : '';

  const subjConf = resource ? SUBJECT_CONFIG[resource.subject] : null;
  const typeConf = resource ? (TYPE_CONFIG[resource.type] ?? TYPE_CONFIG.study_guide) : null;

  // Back nav: prefer search params context, fallback to subject
  const backUrl = resource
    ? `/lms/student/resources?subject=${resource.subject}&topic=${encodeURIComponent(resource.topic)}`
    : '/lms/student/resources';

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    </DashboardLayout>
  );

  if (!resource) return null;

  const TypeIcon  = typeConf?.Icon  ?? BookCopy;
  const SubjIcon  = subjConf?.Icon  ?? GraduationCap;

  return (
    <DashboardLayout>

      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <button onClick={() => navigate(backUrl)}
          className="flex items-center gap-2 text-gray-400 hover:text-amber-400 text-sm font-medium transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to library
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 bg-gray-800 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white text-sm rounded-xl transition-colors"
          >
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>
          <button
            onClick={handleBookmark}
            disabled={bookmarking}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-medium transition-colors ${
              bookmarkId
                ? 'bg-amber-600/20 border-amber-600/60 text-amber-400 hover:bg-amber-600/30'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-amber-400 hover:border-amber-600/50'
            }`}
          >
            {bookmarkId ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            {bookmarkId ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* ── Resource header ──────────────────────────────────────── */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {typeConf && (
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border ${typeConf.badge}`}>
              <TypeIcon className="w-3.5 h-3.5" />{typeConf.label}
            </span>
          )}
          {subjConf && (
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-700 border border-gray-600 ${subjConf.color}`}>
              <SubjIcon className="w-3.5 h-3.5" />{subjConf.short}
            </span>
          )}
          <span className="text-xs text-gray-500">{resource.topic}</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">{resource.title}</h1>
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6 sm:p-8 mb-8">
        <div
          className="ged-prose"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>

      {/* ── Footer actions ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 pb-4">
        <button onClick={handlePrint}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium transition-colors"
        >
          <Printer className="w-4 h-4" /> Print / Save as PDF
        </button>
        <button onClick={() => navigate('/lms/student/resources')}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Library
        </button>
      </div>
    </DashboardLayout>
  );
};

export default ResourceReader;
