import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/lms/DashboardLayout';
import { Users, BookOpen, GraduationCap, TrendingUp, Award, AlertCircle } from 'lucide-react';
import pb from '../../../lib/pocketbase';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalQuizzes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, courses, enrollments, quizzes] = await Promise.all([
          pb.collection('users').getList(1, 1, { requestKey: null }),
          pb.collection('courses').getList(1, 1, { requestKey: null }),
          pb.collection('enrollments').getList(1, 1, { filter: 'status = "active"', requestKey: null }),
          pb.collection('quizzes').getList(1, 1, { requestKey: null }),
        ]);

        setStats({
          totalUsers: users.totalItems,
          totalCourses: courses.totalItems,
          totalEnrollments: enrollments.totalItems,
          totalQuizzes: quizzes.totalItems,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      icon: Users,
      label: 'Total Users',
      value: stats.totalUsers,
      iconBg: 'bg-amber-900/30',
      iconColor: 'text-amber-400',
    },
    {
      icon: BookOpen,
      label: 'Total Courses',
      value: stats.totalCourses,
      iconBg: 'bg-red-900/30',
      iconColor: 'text-red-400',
    },
    {
      icon: GraduationCap,
      label: 'Active Enrollments',
      value: stats.totalEnrollments,
      iconBg: 'bg-amber-900/30',
      iconColor: 'text-amber-400',
    },
    {
      icon: TrendingUp,
      label: 'Total Quizzes',
      value: stats.totalQuizzes,
      iconBg: 'bg-red-900/30',
      iconColor: 'text-red-400',
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-400">Welcome back! Here's an overview of your learning platform.</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border-2 border-gray-600 hover:border-amber-400 transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.iconBg} p-3 rounded-xl`}>
                      <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions + Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-2xl border-2 border-gray-600">
                <h2 className="text-2xl font-bold text-amber-300 mb-6 flex items-center">
                  <Award className="w-6 h-6 mr-3" />
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/lms/admin/courses')}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-400 text-gray-900 py-3 rounded-xl font-semibold hover:from-amber-400 hover:to-amber-300 transition-all duration-300 transform hover:scale-105 text-left px-5"
                  >
                    📚 Create New Course
                  </button>
                  <button
                    onClick={() => navigate('/lms/admin/users')}
                    className="w-full bg-gradient-to-r from-red-700 to-red-600 text-white py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-500 transition-all duration-300 transform hover:scale-105 text-left px-5"
                  >
                    👤 Add New User
                  </button>
                  <button
                    onClick={() => navigate('/lms/admin/quizzes')}
                    className="w-full bg-gray-700 text-white py-3 rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300 text-left px-5"
                  >
                    📝 Manage Quizzes
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-2xl border-2 border-gray-600">
                <h2 className="text-2xl font-bold text-amber-300 mb-6 flex items-center">
                  <AlertCircle className="w-6 h-6 mr-3" />
                  System Summary
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-700">
                    <span className="text-gray-400">Total Users</span>
                    <span className="font-bold text-amber-400 text-xl">{stats.totalUsers}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-700">
                    <span className="text-gray-400">Total Courses</span>
                    <span className="font-bold text-red-400 text-xl">{stats.totalCourses}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-700">
                    <span className="text-gray-400">Active Enrollments</span>
                    <span className="font-bold text-amber-400 text-xl">{stats.totalEnrollments}</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-400">Total Quizzes</span>
                    <span className="font-bold text-red-400 text-xl">{stats.totalQuizzes}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Getting Started Guide */}
            <div className="bg-gradient-to-r from-amber-900/30 to-red-900/30 rounded-2xl p-8 border-2 border-amber-500/50">
              <h2 className="text-2xl font-bold text-amber-300 mb-4">🎓 Getting Started with IGK LMS</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-300">
                <div
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => navigate('/lms/admin/users')}
                >
                  <h3 className="font-bold text-amber-400 mb-2">1. Add Users →</h3>
                  <p className="text-sm">Create accounts for teachers, students, and parents with appropriate roles.</p>
                </div>
                <div
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => navigate('/lms/admin/courses')}
                >
                  <h3 className="font-bold text-red-400 mb-2">2. Create Courses →</h3>
                  <p className="text-sm">Set up courses with lessons, quizzes, and assignments for your students.</p>
                </div>
                <div
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => navigate('/lms/admin/quizzes')}
                >
                  <h3 className="font-bold text-amber-400 mb-2">3. Build Quizzes →</h3>
                  <p className="text-sm">Create quizzes with multiple choice, true/false, and short answer questions.</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;