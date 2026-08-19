import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Type, Image, BookOpen, GraduationCap,
  Users, BookMarked, ClipboardList, Megaphone, Settings2,
  LogOut, X, CheckCircle, AlertCircle, Menu,
} from 'lucide-react';
import { useAuth } from '../../../lib/auth';

// ── Tab components ────────────────────────────────────────────────────────────
import Overview      from './tabs/Overview';
import TextContent   from './tabs/TextContent';
import Photos        from './tabs/Photos';
import Programs      from './tabs/Programs';
import Students      from './tabs/Students';
import Teachers      from './tabs/Teachers';
import Courses       from './tabs/Courses';
import Enrollments   from './tabs/Enrollments';
import Announcements from './tabs/Announcements';
import Settings      from './tabs/Settings';

// ── Types ─────────────────────────────────────────────────────────────────────
type TabId = 'overview'|'text'|'photos'|'programs'|'students'|'teachers'|'courses'|'enrollments'|'announcements'|'settings';
interface Toast { type: 'success'|'error'; message: string }

// ── Nav config ────────────────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: 'Website',
    items: [
      { id: 'overview'     as TabId, label: 'Overview',       icon: LayoutDashboard },
      { id: 'text'         as TabId, label: 'Website Words',  icon: Type            },
      { id: 'photos'       as TabId, label: 'Photos',         icon: Image           },
      { id: 'programs'     as TabId, label: 'Programs',       icon: BookOpen        },
    ],
  },
  {
    label: 'School Management',
    items: [
      { id: 'students'     as TabId, label: 'Students',       icon: GraduationCap   },
      { id: 'teachers'     as TabId, label: 'Teachers',       icon: Users           },
      { id: 'courses'      as TabId, label: 'Courses',        icon: BookMarked      },
      { id: 'enrollments'  as TabId, label: 'Enrollments',    icon: ClipboardList   },
      { id: 'announcements'as TabId, label: 'Announcements',  icon: Megaphone       },
    ],
  },
  {
    label: 'Settings',
    items: [
      { id: 'settings'     as TabId, label: 'School Settings', icon: Settings2      },
    ],
  },
];
const ALL_ITEMS = NAV_GROUPS.flatMap(g => g.items);

// ── Toast ─────────────────────────────────────────────────────────────────────
function ToastBanner({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl max-w-sm
      ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'} text-white`}>
      {toast.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
      <span className="text-sm font-medium flex-1">{toast.message}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100"><X className="w-4 h-4" /></button>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function OwnerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>('overview');
  const [toast, setToast] = useState<Toast | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const handleLogout = () => { logout(); navigate('/lms/login'); };
  const handleNavigate = (t: string) => { setTab(t as TabId); setSidebarOpen(false); };

  const renderTab = () => {
    const props = { onToast: setToast };
    switch (tab) {
      case 'overview':      return <Overview      {...props} onNavigate={handleNavigate} userName={firstName} />;
      case 'text':          return <TextContent   {...props} />;
      case 'photos':        return <Photos        {...props} />;
      case 'programs':      return <Programs      {...props} />;
      case 'students':      return <Students      {...props} />;
      case 'teachers':      return <Teachers      {...props} />;
      case 'courses':       return <Courses       {...props} />;
      case 'enrollments':   return <Enrollments   {...props} />;
      case 'announcements': return <Announcements {...props} />;
      case 'settings':      return <Settings      {...props} />;
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-4">
      {/* School identity */}
      <div className="px-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-gray-900 font-black text-xs">IGK</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">IGK Learning Centre</p>
            <p className="text-gray-500 text-xs">Site Manager</p>
          </div>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 px-2 space-y-5 overflow-y-auto">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-2 mb-1">{group.label}</p>
            {group.items.map(item => (
              <button key={item.id} onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5
                  ${tab === item.id
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white border border-transparent'}`}>
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-4 pt-4 border-t border-gray-800 mt-4">
        <p className="text-xs text-gray-500 mb-2 truncate">{user?.email}</p>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors">
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {toast && <ToastBanner toast={toast} onClose={() => setToast(null)} />}

      {/* Top header */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between z-30 sticky top-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <p className="text-white font-bold text-sm leading-tight hidden sm:block">
              {ALL_ITEMS.find(i => i.id === tab)?.label ?? 'Dashboard'}
            </p>
            <p className="text-xs text-gray-500 hidden sm:block">Site Manager · {firstName}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-lg transition-colors">
          <LogOut className="w-4 h-4" /><span className="hidden sm:inline">Sign out</span>
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-gray-900 border-r border-gray-800 overflow-y-auto">
          <SidebarContent />
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <div className="relative w-64 bg-gray-900 border-r border-gray-800 h-full overflow-y-auto">
              <button onClick={() => setSidebarOpen(false)} className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </div>
          </div>
        )}

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
            {renderTab()}
          </div>
        </main>
      </div>
    </div>
  );
}
