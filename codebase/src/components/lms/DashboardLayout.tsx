import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  FileText,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  GraduationCap,
  ClipboardList,
  BarChart3,
  UserCheck,
  Calendar,
  MessageSquare,
  Timer,
  Bot,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/lms/login');
  };

  if (!user) return null;

  const navigationItems = {
    admin: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/lms/admin/dashboard' },
      { icon: Users, label: 'Users', path: '/lms/admin/users' },
      { icon: BookOpen, label: 'Courses', path: '/lms/admin/courses' },
      { icon: GraduationCap, label: 'Quizzes', path: '/lms/admin/quizzes' },
      { icon: FileText, label: 'Content', path: '/lms/admin/content' },
      { icon: BarChart3, label: 'Analytics', path: '/lms/admin/analytics' },
      { icon: Bell, label: 'Announcements', path: '/lms/admin/announcements' },
      { icon: Settings, label: 'Settings', path: '/lms/admin/settings' },
    ],
    teacher: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/lms/teacher/dashboard' },
      { icon: BookOpen, label: 'My Courses', path: '/lms/teacher/courses' },
      { icon: FileText, label: 'Lessons', path: '/lms/teacher/lessons' },
      { icon: ClipboardList, label: 'Assignments', path: '/lms/teacher/assignments' },
      { icon: GraduationCap, label: 'Quizzes', path: '/lms/teacher/quizzes' },
      { icon: Users, label: 'Students', path: '/lms/teacher/students' },
      { icon: UserCheck, label: 'Attendance', path: '/lms/teacher/attendance' },
      { icon: MessageSquare, label: 'Messages', path: '/lms/teacher/messages' },
    ],
    student: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/lms/student/dashboard' },
      { icon: BookOpen, label: 'My Courses', path: '/lms/student/courses' },
      { icon: Timer, label: 'Mock Test', path: '/lms/student/mock-test' },
      { icon: Bot, label: 'AI Tutor', path: '/lms/student/ai-tutor' },
      { icon: BookOpen, label: 'Resources', path: '/lms/student/resources' },
      { icon: FileText, label: 'Lessons', path: '/lms/student/lessons' },
      { icon: ClipboardList, label: 'Assignments', path: '/lms/student/assignments' },
      { icon: GraduationCap, label: 'Quizzes', path: '/lms/student/quizzes' },
      { icon: BarChart3, label: 'Progress', path: '/lms/student/progress' },
      { icon: Calendar, label: 'Schedule', path: '/lms/student/schedule' },
      { icon: Bell, label: 'Notifications', path: '/lms/student/notifications' },
    ],
    parent: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/lms/parent/dashboard' },
      { icon: Users, label: 'My Children', path: '/lms/parent/children' },
      { icon: BookOpen, label: 'Courses', path: '/lms/parent/courses' },
      { icon: BarChart3, label: 'Progress', path: '/lms/parent/progress' },
      { icon: UserCheck, label: 'Attendance', path: '/lms/parent/attendance' },
      { icon: FileText, label: 'Grades', path: '/lms/parent/grades' },
      { icon: Bell, label: 'Notifications', path: '/lms/parent/notifications' },
      { icon: MessageSquare, label: 'Messages', path: '/lms/parent/messages' },
    ],
  };

  const navItems = navigationItems[user.role] || [];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Top Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Menu Toggle */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-700 transition-colors mr-2"
              >
                {sidebarOpen ? (
                  <X className="w-6 h-6 text-amber-400" />
                ) : (
                  <Menu className="w-6 h-6 text-amber-400" />
                )}
              </button>
              
              <Link to="/" className="flex items-center">
                <img
                  src="/public_582d_8769138177dc4f61b94ad786acaa8d4a.png"
                  alt="IGK Logo"
                  className="w-10 h-10 rounded-full ring-2 ring-amber-400 mr-3"
                />
                <div>
                  <span className="text-lg font-bold bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
                    IGK LMS
                  </span>
                  <p className="text-xs text-gray-400 capitalize">{user.role} Portal</p>
                </div>
              </Link>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-amber-300">{user.name}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
              
              {user.avatar && (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full border-2 border-amber-500"
                />
              )}
              
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors text-red-400 hover:text-red-300"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar & Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-30 w-64 bg-gray-800 border-r border-gray-700
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
          style={{ top: '64px' }}
        >
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-amber-400 transition-all duration-300 group"
              >
                <item.icon className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;