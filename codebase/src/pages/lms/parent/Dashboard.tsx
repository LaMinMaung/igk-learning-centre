import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/lms/DashboardLayout';
import { Users, BookOpen, Calendar, TrendingUp, Award, Bell, UserCheck, GraduationCap, CheckCircle, Clock } from 'lucide-react';
import pb from '../../../lib/pocketbase';
import { useAuth } from '../../../lib/auth';

interface Child {
  id: string;
  name: string;
  email: string;
  relationship: string;
}

interface Enrollment {
  id: string;
  progress_percentage: number;
  status: string;
  expand?: {
    course?: {
      id: string;
      title: string;
      level: string;
      thumbnail?: string;
    };
  };
}

interface AttendanceRecord {
  date: string;
  status: string;
  expand?: {
    course?: {
      title: string;
    };
  };
}

const ParentDashboard = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    averageProgress: 0,
    attendanceRate: 0,
    completedCourses: 0,
  });

  useEffect(() => {
    fetchChildren();
  }, [user]);

  useEffect(() => {
    if (selectedChild) {
      fetchChildData(selectedChild.id);
    }
  }, [selectedChild]);

  const fetchChildren = async () => {
    if (!user) return;

    try {
      const links = await pb.collection('parent_student_links').getFullList({
        filter: pb.filter('parent = {:id}', { id: user.id }),
        expand: 'student',
        requestKey: null,
      });

      const childrenData: Child[] = links.map((link: any) => ({
        id: link.expand?.student?.id || '',
        name: link.expand?.student?.name || '',
        email: link.expand?.student?.email || '',
        relationship: link.relationship,
      }));

      setChildren(childrenData);
      
      // Auto-select first child
      if (childrenData.length > 0) {
        setSelectedChild(childrenData[0]);
      }
    } catch (error) {
      console.error('Failed to fetch children:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChildData = async (childId: string) => {
    try {
      // Fetch enrollments
      const enrollmentsData = await pb.collection('enrollments').getFullList<Enrollment>({
        filter: pb.filter('student = {:id} && status = "active"', { id: childId }),
        expand: 'course',
        sort: '-created',
        requestKey: null,
      });
      setEnrollments(enrollmentsData);

      // Fetch recent attendance
      const attendanceData = await pb.collection('attendance').getFullList<AttendanceRecord>({
        filter: pb.filter('student = {:id}', { id: childId }),
        expand: 'course',
        sort: '-date',
        limit: 10,
        requestKey: null,
      });
      setAttendance(attendanceData);

      // Calculate stats
      const totalCourses = enrollmentsData.length;
      const averageProgress = totalCourses > 0
        ? Math.round(enrollmentsData.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) / totalCourses)
        : 0;
      const completedCourses = enrollmentsData.filter(e => (e.progress_percentage || 0) >= 100).length;
      
      // Calculate attendance rate (last 10 records)
      const presentCount = attendanceData.filter(a => a.status === 'present').length;
      const attendanceRate = attendanceData.length > 0
        ? Math.round((presentCount / attendanceData.length) * 100)
        : 0;

      setStats({
        totalCourses,
        averageProgress,
        attendanceRate,
        completedCourses,
      });
    } catch (error) {
      console.error('Failed to fetch child data:', error);
    }
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

  const getAttendanceColor = (status: string) => {
    const colors = {
      present: 'text-green-400',
      absent: 'text-red-400',
      late: 'text-amber-400',
      excused: 'text-blue-400',
    };
    return colors[status as keyof typeof colors] || 'text-gray-400';
  };

  const getAttendanceIcon = (status: string) => {
    switch (status) {
      case 'present':
        return '✅';
      case 'absent':
        return '❌';
      case 'late':
        return '⏰';
      case 'excused':
        return '📝';
      default:
        return '•';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading parent dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (children.length === 0) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-12 border-2 border-gray-600 text-center">
            <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-amber-300 mb-2">No Children Linked</h2>
            <p className="text-gray-400 mb-6">
              You don't have any children linked to your parent account yet.
            </p>
            <p className="text-gray-400">
              Please contact the school administrator to link your child's account.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent mb-2">
            Parent Dashboard
          </h1>
          <p className="text-gray-400">Monitor your {children.length === 1 ? "child's" : "children's"} learning progress and attendance</p>
        </div>

        {/* Child Selector */}
        {children.length > 1 && (
          <div className="mb-8">
            <label className="block text-sm font-bold text-amber-300 mb-3">
              Select Child:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChild(child)}
                  className={`
                    p-6 rounded-xl border-2 transition-all duration-300 text-left
                    ${selectedChild?.id === child.id
                      ? 'bg-gradient-to-br from-amber-900/30 to-red-900/30 border-amber-500 shadow-lg'
                      : 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600 hover:border-amber-400'}
                  `}
                >
                  <div className="flex items-center">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-amber-400 flex items-center justify-center text-gray-900 font-bold text-xl mr-4">
                      {child.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-amber-300 text-lg">{child.name}</h3>
                      <p className="text-gray-400 text-sm capitalize">{child.relationship}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Single Child Header */}
        {children.length === 1 && selectedChild && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border-2 border-amber-500 mb-8">
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-400 flex items-center justify-center text-gray-900 font-bold text-2xl mr-4">
                {selectedChild.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-amber-300">{selectedChild.name}</h2>
                <p className="text-gray-400 capitalize">Your {selectedChild.relationship}</p>
              </div>
            </div>
          </div>
        )}

        {selectedChild && (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border-2 border-gray-600">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-amber-900/30 p-3 rounded-xl">
                    <BookOpen className="w-6 h-6 text-amber-400" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">{stats.totalCourses}</h3>
                <p className="text-gray-400 text-sm">Enrolled Courses</p>
              </div>

              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border-2 border-gray-600">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-red-900/30 p-3 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-red-400" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">{stats.averageProgress}%</h3>
                <p className="text-gray-400 text-sm">Average Progress</p>
              </div>

              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border-2 border-gray-600">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-amber-900/30 p-3 rounded-xl">
                    <UserCheck className="w-6 h-6 text-amber-400" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">{stats.attendanceRate}%</h3>
                <p className="text-gray-400 text-sm">Attendance Rate</p>
              </div>

              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border-2 border-gray-600">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-red-900/30 p-3 rounded-xl">
                    <GraduationCap className="w-6 h-6 text-red-400" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">{stats.completedCourses}</h3>
                <p className="text-gray-400 text-sm">Completed Courses</p>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Courses & Progress */}
              <div className="lg:col-span-2 space-y-8">
                {/* Enrolled Courses */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border-2 border-gray-600 p-8">
                  <h2 className="text-2xl font-bold text-amber-300 mb-6 flex items-center">
                    <BookOpen className="w-6 h-6 mr-3" />
                    {selectedChild.name}'s Courses
                  </h2>

                  {enrollments.length === 0 ? (
                    <div className="text-center py-12">
                      <GraduationCap className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">No active course enrollments</p>
                      <p className="text-gray-500 text-sm mt-2">Contact the school to enroll</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {enrollments.map((enrollment) => {
                        const course = enrollment.expand?.course;
                        if (!course) return null;

                        const progress = enrollment.progress_percentage || 0;
                        const levelBadge = getLevelBadge(course.level);

                        return (
                          <div
                            key={enrollment.id}
                            className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl p-6 border-2 border-gray-600 hover:border-amber-400 transition-all duration-300"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-amber-300 mb-2">{course.title}</h3>
                                <span className={`px-3 py-1 rounded-lg text-xs font-semibold border-2 ${levelBadge.color}`}>
                                  {levelBadge.label}
                                </span>
                              </div>
                              {course.thumbnail && (
                                <img
                                  src={pb.files.getUrl(course, course.thumbnail)}
                                  alt={course.title}
                                  className="w-20 h-20 object-cover rounded-xl border-2 border-gray-600 ml-4"
                                />
                              )}
                            </div>

                            {/* Progress Bar */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-400">Learning Progress</span>
                                <span className={`text-sm font-bold ${getProgressColor(progress)}`}>
                                  {Math.round(progress)}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>

                            {/* Status */}
                            {progress >= 100 && (
                              <div className="mt-4 flex items-center text-green-400">
                                <CheckCircle className="w-5 h-5 mr-2" />
                                <span className="font-semibold">Course Completed! 🎉</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Recent Attendance */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border-2 border-gray-600 p-8">
                  <h2 className="text-2xl font-bold text-amber-300 mb-6 flex items-center">
                    <Calendar className="w-6 h-6 mr-3" />
                    Recent Attendance
                  </h2>

                  {attendance.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400">No attendance records yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {attendance.map((record, index) => (
                        <div
                          key={index}
                          className="bg-gray-700 rounded-xl p-4 border-2 border-gray-600 flex items-center justify-between"
                        >
                          <div className="flex items-center flex-1">
                            <div className="text-2xl mr-4">
                              {getAttendanceIcon(record.status)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-200">
                                {record.expand?.course?.title || 'Course'}
                              </p>
                              <p className="text-sm text-gray-400">{formatDate(record.date)}</p>
                            </div>
                          </div>
                          <div>
                            <span className={`font-bold capitalize ${getAttendanceColor(record.status)}`}>
                              {record.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Summary & Actions */}
              <div className="space-y-8">
                {/* Progress Summary */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border-2 border-gray-600 p-8">
                  <h3 className="text-xl font-bold text-amber-300 mb-6 flex items-center">
                    <Award className="w-6 h-6 mr-2" />
                    Progress Summary
                  </h3>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="relative inline-flex items-center justify-center mb-4">
                        <svg className="w-32 h-32 transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="text-gray-700"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 56}`}
                            strokeDashoffset={`${2 * Math.PI * 56 * (1 - stats.averageProgress / 100)}`}
                            className="text-amber-400 transition-all duration-1000"
                          />
                        </svg>
                        <div className="absolute">
                          <div className="text-3xl font-bold text-white">{stats.averageProgress}%</div>
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm">Overall Progress</p>
                    </div>

                    <div className="border-t-2 border-gray-700 pt-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total Courses:</span>
                        <span className="font-bold text-white">{stats.totalCourses}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Completed:</span>
                        <span className="font-bold text-green-400">{stats.completedCourses}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">In Progress:</span>
                        <span className="font-bold text-amber-400">
                          {stats.totalCourses - stats.completedCourses}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Attendance Rate:</span>
                        <span className="font-bold text-green-400">{stats.attendanceRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Insights */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border-2 border-gray-600 p-8">
                  <h3 className="text-xl font-bold text-amber-300 mb-4 flex items-center">
                    <TrendingUp className="w-6 h-6 mr-2" />
                    Performance
                  </h3>
                  <div className="space-y-4">
                    {stats.averageProgress >= 80 && (
                      <div className="bg-green-900/30 border-2 border-green-600 rounded-xl p-4">
                        <div className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-1" />
                          <div>
                            <p className="font-semibold text-green-300 mb-1">Excellent Progress!</p>
                            <p className="text-green-200 text-sm">
                              {selectedChild.name} is doing great with {stats.averageProgress}% completion.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {stats.averageProgress >= 50 && stats.averageProgress < 80 && (
                      <div className="bg-amber-900/30 border-2 border-amber-600 rounded-xl p-4">
                        <div className="flex items-start">
                          <Clock className="w-5 h-5 text-amber-400 mr-3 mt-1" />
                          <div>
                            <p className="font-semibold text-amber-300 mb-1">Good Progress</p>
                            <p className="text-amber-200 text-sm">
                              {selectedChild.name} is making steady progress at {stats.averageProgress}%.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {stats.averageProgress < 50 && stats.totalCourses > 0 && (
                      <div className="bg-red-900/30 border-2 border-red-600 rounded-xl p-4">
                        <div className="flex items-start">
                          <Bell className="w-5 h-5 text-red-400 mr-3 mt-1" />
                          <div>
                            <p className="font-semibold text-red-300 mb-1">Needs Attention</p>
                            <p className="text-red-200 text-sm">
                              Consider encouraging {selectedChild.name} to complete more lessons.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {stats.attendanceRate >= 90 && (
                      <div className="bg-green-900/30 border-2 border-green-600 rounded-xl p-4">
                        <div className="flex items-start">
                          <UserCheck className="w-5 h-5 text-green-400 mr-3 mt-1" />
                          <div>
                            <p className="font-semibold text-green-300 mb-1">Perfect Attendance!</p>
                            <p className="text-green-200 text-sm">
                              {stats.attendanceRate}% attendance rate is excellent.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {stats.attendanceRate < 70 && attendance.length > 0 && (
                      <div className="bg-amber-900/30 border-2 border-amber-600 rounded-xl p-4">
                        <div className="flex items-start">
                          <Calendar className="w-5 h-5 text-amber-400 mr-3 mt-1" />
                          <div>
                            <p className="font-semibold text-amber-300 mb-1">Attendance Alert</p>
                            <p className="text-amber-200 text-sm">
                              {stats.attendanceRate}% attendance. Please ensure regular attendance.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact School */}
                <div className="bg-gradient-to-r from-amber-900/30 to-red-900/30 rounded-2xl border-2 border-amber-500/50 p-6 text-center">
                  <h3 className="font-bold text-amber-300 mb-3">Need to Discuss Progress?</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Contact the school to schedule a parent-teacher meeting
                  </p>
                  <div className="space-y-2">
                    <a
                      href="tel:082-354-5362"
                      className="block bg-gradient-to-r from-red-700 to-red-600 text-white py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-500 transition-all duration-300"
                    >
                      📞 Call School
                    </a>
                    <a
                      href="mailto:info@igklearningcentre.com"
                      className="block bg-gray-700 text-white py-3 rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300"
                    >
                      📧 Email School
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievement Banner */}
            {stats.completedCourses > 0 && (
              <div className="mt-8 bg-gradient-to-r from-green-900/30 to-amber-900/30 rounded-2xl p-6 border-2 border-green-500 text-center">
                <Award className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                <p className="text-xl text-amber-300 font-semibold mb-2">
                  🏆 {stats.completedCourses} Course{stats.completedCourses > 1 ? 's' : ''} Completed!
                </p>
                <p className="text-gray-300">
                  {selectedChild.name} is doing an excellent job. Keep up the great work!
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

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

export default ParentDashboard;