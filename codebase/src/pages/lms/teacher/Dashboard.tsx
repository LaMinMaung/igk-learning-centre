import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/lms/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, TrendingUp, ArrowRight, GraduationCap } from 'lucide-react';
import pb from '../../../lib/pocketbase';
import { useAuth } from '../../../lib/auth';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  level: string;
  status: string;
  studentCount?: number;
}

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
  });

  useEffect(() => {
    const fetchTeacherCourses = async () => {
      if (!user) return;

      try {
        // Fetch courses assigned to this teacher
        const assignments = await pb.collection('teacher_course_assignments').getFullList({
          filter: pb.filter('teacher = {:id}', { id: user.id }),
          expand: 'course',
          requestKey: null,
        });

        const coursesData: Course[] = [];
        let totalStudents = 0;

        for (const assignment of assignments) {
          const course = assignment.expand?.course;
          if (!course) continue;

          // Count enrolled students for this course
          const enrollments = await pb.collection('enrollments').getList(1, 1, {
            filter: pb.filter('course = {:id} && status = "active"', { id: course.id }),
            requestKey: null,
          });

          coursesData.push({
            ...course,
            studentCount: enrollments.totalItems,
          });

          totalStudents += enrollments.totalItems;
        }

        setCourses(coursesData);
        setStats({
          totalCourses: coursesData.length,
          totalStudents,
        });
      } catch (error) {
        console.error('Failed to fetch teacher courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherCourses();
  }, [user]);

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
            My Teaching Dashboard
          </h1>
          <p className="text-gray-400">Manage your courses and engage with your students.</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your courses...</p>
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
                <h3 className="text-3xl font-bold text-white mb-1">{stats.totalCourses}</h3>
                <p className="text-gray-400 text-sm">My Courses</p>
              </div>

              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border-2 border-gray-600">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-red-900/30 p-3 rounded-xl">
                    <Users className="w-6 h-6 text-red-400" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">{stats.totalStudents}</h3>
                <p className="text-gray-400 text-sm">Total Students</p>
              </div>

              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border-2 border-gray-600">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-amber-900/30 p-3 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-amber-400" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">
                  {stats.totalCourses > 0 ? Math.round(stats.totalStudents / stats.totalCourses) : 0}
                </h3>
                <p className="text-gray-400 text-sm">Avg Students/Course</p>
              </div>
            </div>

            {/* My Courses */}
            {courses.length === 0 ? (
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-12 border-2 border-gray-600 text-center">
                <GraduationCap className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-amber-300 mb-2">No Courses Assigned Yet</h2>
                <p className="text-gray-400 mb-6">
                  You haven't been assigned to any courses. Contact your administrator to get started.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-amber-300 mb-6">My Courses</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {courses.map((course) => {
                    const levelBadge = getLevelBadge(course.level);

                    return (
                      <div
                        key={course.id}
                        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border-2 border-gray-600 hover:border-amber-400 transition-all duration-300 overflow-hidden group hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-500/20 cursor-pointer"
                        onClick={() => navigate(`/lms/teacher/course/${course.id}`)}
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
                          <h3 className="text-xl font-bold text-amber-300 mb-3 line-clamp-2">
                            {course.title}
                          </h3>

                          <div
                            className="text-gray-400 text-sm mb-4 line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: course.description }}
                          />

                          <div className="flex items-center gap-2 mb-4">
                            <span className={`px-3 py-1 rounded-lg text-xs font-semibold border-2 ${levelBadge.color}`}>
                              {levelBadge.label}
                            </span>
                            <div className="flex items-center bg-gray-700/50 px-3 py-1 rounded-lg">
                              <Users className="w-4 h-4 text-amber-400 mr-2" />
                              <span className="text-gray-300 text-sm font-semibold">
                                {course.studentCount || 0} students
                              </span>
                            </div>
                          </div>

                          {/* Manage Course Button */}
                          <button
                            onClick={() => navigate(`/lms/teacher/course/${course.id}`)}
                            className="w-full bg-gradient-to-r from-red-700 to-red-600 text-white py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-500 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                          >
                            Manage Course
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Helpful Tips */}
            {courses.length > 0 && (
              <div className="mt-8 bg-gradient-to-r from-amber-900/30 to-red-900/30 rounded-2xl p-6 border-2 border-amber-500/50">
                <h3 className="text-xl font-bold text-amber-300 mb-3">Quick Tips 💡</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• Click on any course to add lessons, quizzes, and assignments</li>
                  <li>• Use "Draft" mode while preparing content, then "Publish" when ready</li>
                  <li>• Students can only see published lessons</li>
                  <li>• Upload files directly - no technical knowledge needed!</li>
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;