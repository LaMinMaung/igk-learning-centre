import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../../lib/auth';
import pb from '../../../lib/pocketbase';
import {
  Plus, Send, BookOpen, Calculator, FlaskConical, Globe,
  Languages, Menu, X, LogOut, Bot, User, ChevronDown,
  Trash2, MessageSquare, Loader2, GraduationCap, ArrowLeft,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Conversation {
  id: string;
  subject: string;
  title: string;
  language: string;
  updated: string;
  created: string;
}

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  created?: string;
}

type Lang = 'auto' | 'en' | 'my';

// ─── Subject config ─────────────────────────────────────────────────────────────

const SUBJECTS = [
  { id: 'rla',            short: 'RLA',           label: 'Reasoning Through Language Arts', Icon: BookOpen,     color: 'text-blue-400',   bg: 'bg-blue-900/30 border-blue-700/60'   },
  { id: 'math',           short: 'Math',          label: 'Mathematical Reasoning',          Icon: Calculator,   color: 'text-green-400',  bg: 'bg-green-900/30 border-green-700/60' },
  { id: 'science',        short: 'Science',       label: 'Science',                         Icon: FlaskConical, color: 'text-purple-400', bg: 'bg-purple-900/30 border-purple-700/60'},
  { id: 'social_studies', short: 'Social Studies',label: 'Social Studies',                  Icon: Globe,        color: 'text-amber-400',  bg: 'bg-amber-900/30 border-amber-700/60' },
  { id: 'general',        short: 'General',       label: 'General GED',                     Icon: GraduationCap,color: 'text-gray-400',   bg: 'bg-gray-700/60 border-gray-600'      },
];

const getSubject = (id: string) => SUBJECTS.find(s => s.id === id) ?? SUBJECTS[4];

const LANG_LABELS: Record<Lang, string> = { auto: 'Auto-detect', en: 'English', my: 'Burmese' };
const LANG_SHORT:  Record<Lang, string> = { auto: 'Auto', en: 'EN', my: 'မြန်မာ' };

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Typing indicator ──────────────────────────────────────────────────────────

const TypingIndicator: React.FC = () => (
  <div className="flex items-start gap-3 px-4 py-2">
    <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center shrink-0 mt-0.5">
      <Bot className="w-4 h-4 text-gray-900" />
    </div>
    <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3">
      <div className="flex items-center gap-1.5 h-5">
        {[0, 1, 2].map(i => (
          <span key={i} className="w-2 h-2 bg-gray-400 rounded-full inline-block"
            style={{ animation: 'bounce 0.9s infinite', animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  </div>
);

// ─── Message bubble ─────────────────────────────────────────────────────────────

const MessageBubble: React.FC<{ msg: Message; index: number }> = ({ msg, index }) => {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex items-start gap-3 px-4 py-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
        isUser ? 'bg-red-700' : 'bg-amber-600'
      }`}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-gray-900" />}
      </div>
      <div className={`max-w-[82%] lg:max-w-[72%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words ${
        isUser
          ? 'bg-red-900/30 border border-red-700/40 rounded-2xl rounded-tr-sm text-gray-100'
          : 'bg-gray-800 border border-gray-700 rounded-2xl rounded-tl-sm text-gray-200'
      }`}>
        {msg.content}
        {msg.created && (
          <p className={`text-xs mt-2 ${isUser ? 'text-right text-red-400/50' : 'text-gray-600'}`}>
            {relativeTime(msg.created)}
          </p>
        )}
      </div>
    </div>
  );
};

// ─── Main component ─────────────────────────────────────────────────────────────

const AITutor: React.FC = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [language, setLanguage] = useState<Lang>('auto');
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [langDropdown, setLangDropdown] = useState(false);
  const [creatingConv, setCreatingConv] = useState(false);
  const [contextHandled, setContextHandled] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // From Mock Test "Ask Tutor" navigation
  const locationState = location.state as { autoStart?: boolean; subject?: string; context?: string } | null;

  // ── Load conversations ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    pb.collection('ai_conversations').getFullList<Conversation>({
      filter: pb.filter('student = {:id}', { id: user.id }),
      sort: '-updated',
      requestKey: null,
    }).then(setConversations).catch(console.error);
  }, [user]);

  // ── Load messages for active conversation ──────────────────────────────────
  useEffect(() => {
    if (!conversationId) { setMessages([]); return; }
    setLoadingMsgs(true);
    pb.collection('ai_messages').getFullList<Message>({
      filter: pb.filter('conversation = {:id}', { id: conversationId }),
      sort: 'created',
      requestKey: null,
    }).then(setMessages).catch(console.error).finally(() => setLoadingMsgs(false));

    const conv = conversations.find(c => c.id === conversationId);
    if (conv?.language && ['auto', 'en', 'my'].includes(conv.language)) {
      setLanguage(conv.language as Lang);
    }
  }, [conversationId]);

  // ── Auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // ── Handle context from Mock Test ──────────────────────────────────────────
  useEffect(() => {
    if (!locationState?.autoStart || contextHandled || !user) return;
    setContextHandled(true);
    const subj = locationState.subject || 'general';
    const ctx = locationState.context || '';
    createConversation(subj, ctx);
  }, [locationState, user]);

  // ── Create conversation ────────────────────────────────────────────────────
  const createConversation = async (subjectId: string, prefill = '') => {
    if (!user) return;
    setCreatingConv(true);
    setShowSubjectPicker(false);
    try {
      const conv = await pb.collection('ai_conversations').create<Conversation>({
        student: user.id,
        subject: subjectId,
        title: 'New conversation',
        language: 'auto',
      });
      setConversations(prev => [conv, ...prev]);
      navigate(`/lms/student/ai-tutor/${conv.id}`, { replace: true });
      if (prefill) {
        setInput(prefill);
        setTimeout(() => textareaRef.current?.focus(), 200);
      }
    } catch (err) {
      console.error('Failed to create conversation:', err);
    } finally {
      setCreatingConv(false);
    }
  };

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const msg = input.trim();
    if (!msg || !conversationId || isLoading) return;

    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsLoading(true);

    // Optimistic user bubble
    const userMsg: Message = { role: 'user', content: msg, created: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);

    try {
      const data = await pb.send('/api/ai-tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, message: msg, language }),
      }) as { reply: string };

      const aiMsg: Message = { role: 'assistant', content: data.reply, created: new Date().toISOString() };
      setMessages(prev => [...prev, aiMsg]);

      // Update sidebar title if still default
      setConversations(prev => prev.map(c =>
        c.id === conversationId
          ? { ...c, title: c.title === 'New conversation' ? (msg.length > 55 ? msg.slice(0, 55) + '…' : msg) : c.title, updated: new Date().toISOString() }
          : c
      ));
    } catch (err: any) {
      // Surface the real error from the hook for easier debugging
      const errData = err?.response?.data ?? err?.data ?? {};
      const errText = [errData?.error, errData?.detail].filter(Boolean).join(' — ')
        || err?.message
        || 'Something went wrong. Please try again.';
      console.error('[AI Tutor] send error:', errData);
      setMessages(prev => [...prev, { role: 'assistant', content: errText, created: new Date().toISOString() }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [input, conversationId, language, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDelete = async (convId: string, ev: React.MouseEvent) => {
    ev.stopPropagation();
    if (!confirm('Delete this conversation? This cannot be undone.')) return;
    try {
      await pb.collection('ai_conversations').delete(convId);
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (conversationId === convId) navigate('/lms/student/ai-tutor', { replace: true });
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const activeConv = conversations.find(c => c.id === conversationId);
  const subj = activeConv ? getSubject(activeConv.subject) : null;

  const placeholder = language === 'my'
    ? 'မေးခွန်းကို ဒီနေရာမှာ ရေးပါ... (Shift+Enter အသစ်တောင်း)'
    : 'Ask a question, paste a practice problem… (Shift+Enter for new line)';

  return (
    <div className="h-screen bg-gray-950 flex flex-col overflow-hidden">

      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <header className="h-14 bg-gray-900 border-b border-gray-800 px-4 flex items-center justify-between shrink-0 z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(v => !v)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-700 text-amber-400 transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link to="/lms/student/dashboard" className="flex items-center gap-2 group">
            <img src="/public_582d_8769138177dc4f61b94ad786acaa8d4a.png" alt="IGK"
              className="w-8 h-8 rounded-full ring-2 ring-amber-400" />
            <span className="font-bold text-amber-400 hidden sm:block text-sm">AI Tutor</span>
          </Link>
          {subj && (
            <>
              <span className="text-gray-700 hidden sm:block">|</span>
              <span className={`hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border ${subj.bg} ${subj.color}`}>
                <subj.Icon className="w-3.5 h-3.5" /> {subj.short}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <div className="relative">
            <button onClick={() => setLangDropdown(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-amber-400 text-sm transition-colors"
            >
              <Languages className="w-4 h-4" />
              <span>{LANG_SHORT[language]}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {langDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setLangDropdown(false)} />
                <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 py-1 w-44">
                  {(Object.keys(LANG_LABELS) as Lang[]).map(l => (
                    <button key={l} onClick={() => { setLanguage(l); setLangDropdown(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        language === l ? 'text-amber-400 bg-amber-900/20' : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {LANG_LABELS[l]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <span className="hidden sm:block text-sm text-amber-300 font-medium">{user?.name}</span>
          <button onClick={() => { logout(); navigate('/lms/login'); }}
            className="p-2 rounded-lg hover:bg-gray-700 text-red-400 transition-colors" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* ── Sidebar ───────────────────────────────────────────────────── */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 top-14 z-30 w-64 bg-gray-900 border-r border-gray-800
          flex flex-col shrink-0 transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>

          {/* New Chat button */}
          <div className="p-3 border-b border-gray-800">
            <button onClick={() => setShowSubjectPicker(v => !v)} disabled={creatingConv}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white font-semibold text-sm transition-colors disabled:opacity-50"
            >
              {creatingConv ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              New Chat
            </button>
          </div>

          {/* Subject picker */}
          {showSubjectPicker && (
            <div className="p-3 border-b border-gray-800 bg-gray-800/60 space-y-1.5">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2 px-1">Select Subject</p>
              {SUBJECTS.map(s => (
                <button key={s.id} onClick={() => createConversation(s.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${s.bg} ${s.color} hover:opacity-80`}
                >
                  <s.Icon className="w-4 h-4 shrink-0" /> {s.short}
                </button>
              ))}
            </div>
          )}

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto py-2">
            {conversations.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <MessageSquare className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No conversations yet</p>
                <p className="text-gray-600 text-xs mt-1">Click "New Chat" to begin</p>
              </div>
            ) : (
              conversations.map(conv => {
                const s = getSubject(conv.subject);
                const isActive = conv.id === conversationId;
                return (
                  <div key={conv.id}
                    className={`group flex items-start gap-2 px-2.5 py-2.5 mx-1.5 rounded-lg cursor-pointer transition-colors ${
                      isActive ? 'bg-gray-700/80' : 'hover:bg-gray-800'
                    }`}
                    onClick={() => { navigate(`/lms/student/ai-tutor/${conv.id}`); setSidebarOpen(false); }}
                  >
                    <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${s.bg}`}>
                      <s.Icon className={`w-3.5 h-3.5 ${s.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-200 text-sm truncate leading-tight">{conv.title}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{relativeTime(conv.updated)}</p>
                    </div>
                    <button onClick={e => handleDelete(conv.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-red-400 text-gray-500 transition-all shrink-0 mt-0.5"
                      title="Delete conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Dashboard link */}
          <div className="p-3 border-t border-gray-800">
            <Link to="/lms/student/dashboard"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:text-amber-400 hover:bg-gray-800 text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Student Dashboard
            </Link>
          </div>
        </aside>

        {/* ── Chat area ─────────────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col min-h-0 min-w-0 bg-gray-950">

          {!conversationId ? (
            /* ── Welcome screen ─────────────────────────────────────────── */
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="max-w-lg w-full text-center">
                <div className="w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Bot className="w-8 h-8 text-gray-900" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Bilingual GED AI Tutor</h2>
                <p className="text-gray-400 mb-2 leading-relaxed text-sm">
                  Your patient GED study partner. Ask questions in English or Burmese — I'll walk through problems step by step and help you understand, not just give answers.
                </p>
                <p className="text-gray-600 text-xs mb-8">မြန်မာဘာသာဖြင့် ပေးပိုႏိုင်သည်</p>
                <p className="text-gray-500 text-sm mb-4 font-medium">Choose a subject to start:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {SUBJECTS.map(s => (
                    <button key={s.id} onClick={() => createConversation(s.id)} disabled={creatingConv}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all hover:scale-105 disabled:opacity-50 ${s.bg} ${s.color}`}
                    >
                      <s.Icon className="w-4 h-4 shrink-0" /> {s.short}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          ) : loadingMsgs ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            </div>

          ) : (
            <>
              {/* ── Messages ────────────────────────────────────────────── */}
              <div className="flex-1 overflow-y-auto py-4">
                {messages.length === 0 && (
                  <div className="text-center py-16 px-4">
                    {subj && (
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-medium mb-4 ${subj.bg} ${subj.color}`}>
                        <subj.Icon className="w-4 h-4" /> {subj.label}
                      </div>
                    )}
                    <p className="text-gray-400 text-sm mb-2">Start by asking a question or pasting a practice problem.</p>
                    <p className="text-gray-600 text-xs">I'll guide you through it step by step, in English or Burmese.</p>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <MessageBubble key={msg.id ?? i} msg={msg} index={i} />
                ))}

                {isLoading && <TypingIndicator />}
                <div ref={bottomRef} className="h-2" />
              </div>

              {/* ── Input area ─────────────────────────────────────────── */}
              <div className="border-t border-gray-800 bg-gray-900 px-4 py-3 shrink-0">
                <div className="max-w-3xl mx-auto flex items-end gap-3">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    placeholder={placeholder}
                    rows={1}
                    className="flex-1 bg-gray-800 border border-gray-700 focus:border-amber-500/70 rounded-xl px-4 py-3 text-gray-200 text-sm resize-none outline-none transition-colors placeholder-gray-600"
                    style={{ minHeight: '44px', maxHeight: '130px' }}
                    onInput={e => {
                      const t = e.currentTarget;
                      t.style.height = 'auto';
                      t.style.height = Math.min(t.scrollHeight, 130) + 'px';
                    }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="w-11 h-11 shrink-0 bg-red-700 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors"
                  >
                    {isLoading
                      ? <Loader2 className="w-5 h-5 animate-spin" />
                      : <Send className="w-5 h-5" />
                    }
                  </button>
                </div>
                <p className="text-center text-xs text-gray-700 mt-1.5">
                  Enter to send · Shift+Enter for new line · Language: <span className="text-gray-500">{LANG_LABELS[language]}</span>
                </p>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden mt-14" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
};

export default AITutor;
