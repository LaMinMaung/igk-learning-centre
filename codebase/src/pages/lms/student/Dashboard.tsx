import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/lms/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { BookOpen, TrendingUp, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import pb from '../../../lib/pocketbase';
import { useAuth } from '../../../lib/auth';

interface Enrollment {
  id: string;
  progress_percentage: number;
  status: string;
  expand?: {
    course?: {
      id: string;
      title: string;
      description: string;
      thumbnail?: string;
      level: string;
    };
  };
}

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!user) return;
      
      try {
        const records = await pb.collection('enrollments').getFullList<Enrollment>({
          filter: pb.filter('student = {:id} && status = "active"', { id: user.id }),
          expand: 'course',
          sort: '-created',
          requestKey: null,
        });
        setEnrollments(records);
      } catch (error) {
        console.error('Failed to fetch enrollments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [user]);

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-400';
    if (progress >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  const getLevelBadge = (level: string) => {
    const colors = {
      nursery: 'bg-green-900/30 text-green-400 border-green-600',
      primary: 'bg-blue-900/30 text-blue-400 border-blue-600',
      secondary: 'bg-purple-900/30 text-purple-400 border-purple-600',
      exam_prep: 'bg-red-900/30 text-red-400 border-red-600',
    };
    const labels = {
      nursery: 'Nursery',
      primary: 'Primary',
      secondary: 'Secondary',
      exam_prep: 'Exam Prep',
    };
    return { color: colors[level as keyof typeof colors], label: labels[level as keyof typeof labels] };
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent mb-2">
            My Learning Dashboard
          </h1>
          <p className="text-gray-400">Welcome back! Continue your learning journey.</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your courses...</p>
          </div>
        ) : enrollments.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-12 border-2 border-gray-600 text-center">
            <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-amber-300 mb-2">No Courses Yet</h2>
            <p className="text-gray-400 mb-6">
              You haven't been enrolled in any courses. Contact your administrator to get started.
            </p>
          </div>
        ) : (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border-2 border-gray-600">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-amber-900/30 p-3 rounded-xl">
                    <BookOpen className="w-6 h-6 text-amber-400" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">{enrollments.length}</h3>
                <p className="text-gray-400 text-sm">Active Courses</p>
              </div>

              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border-2 border-gray-600">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-900/30 p-3 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">
                  {enrollments.filter(e => (e.progress_percentage || 0) >= 100).length}
                </h3>
                <p className="text-gray-400 text-sm">Completed Courses</p>
              </div>

              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border-2 border-gray-600">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-red-900/30 p-3 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-red-400" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">
                  {Math.round(enrollments.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) / enrollments.length) || 0}%
                </h3>
                <p className="text-gray-400 text-sm">Average Progress</p>
              </div>
            </div>

            {/* Enrolled Courses */}
            <div>
              <h2 className="text-2xl font-bold text-amber-300 mb-6">My Courses</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {enrollments.map((enrollment) => {
                  const course = enrollment.expand?.course;
                  if (!course) return null;

                  const progress = enrollment.progress_percentage || 0;
                  const levelBadge = getLevelBadge(course.level);

                  return (
                    <div
                      key={enrollment.id}
                      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border-2 border-gray-600 hover:border-amber-400 transition-all duration-300 overflow-hidden group hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-500/20 cursor-pointer"
                      onClick={() => navigate(`/lms/student/course/${course.id}`)}
                    >
                      {/* Thumbnail */}
                      <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center overflow-hidden">
                        {course.thumbnail ? (
                          <img
                            src={pb.files.getUrl(course, course.thumbnail)}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <BookOpen className="w-16 h-16 text-gray-500" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-bold text-amber-300 line-clamp-2 flex-1">
                            {course.title}
                          </h3>
                        </div>

                        <div
                          className="text-gray-400 text-sm mb-4 line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: course.description }}
                        />

                        <div className="flex items-center gap-2 mb-4">
                          <span className={`px-3 py-1 rounded-lg text-xs font-semibold border-2 ${levelBadge.color}`}>
                            {levelBadge.label}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Progress</span>
                            <span className={`text-sm font-bold ${getProgressColor(progress)}`}>
                              {Math.round(progress)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Continue Button */}
                        <button
                          onClick={() => navigate(`/lms/student/course/${course.id}`)}
                          className="w-full bg-gradient-to-r from-red-700 to-red-600 text-white py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-500 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                        >
                          {progress >= 100 ? 'Review Course' : 'Continue Learning'}
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Motivational Message */}
            {enrollments.length > 0 && (
              <div className="mt-8 bg-gradient-to-r from-amber-900/30 to-red-900/30 rounded-2xl p-6 border-2 border-amber-500/50 text-center">
                <CheckCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                <p className="text-xl text-amber-300 font-semibold mb-2">
                  Keep Going! You're Making Great Progress 🎓
                </p>
                <p className="text-gray-300">
                  Every lesson completed brings you closer to your goals.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;