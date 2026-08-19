import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/lms/DashboardLayout';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, PlayCircle, FileText, CheckCircle, Lock, BookOpen, Clock } from 'lucide-react';
import pb from '../../../lib/pocketbase';
import { useAuth } from '../../../lib/auth';

interface Lesson {
  id: string;
  title: string;
  type: string;
  duration_minutes?: number;
  order: number;
  status: string;
  completed?: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  level: string;
  duration_weeks?: number;
}

const CourseView = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!user || !courseId) return;

      try {
        // SECURITY: Verify student is enrolled in this course
        const enrollment = await pb.collection('enrollments').getFirstListItem(
          pb.filter('student = {:studentId} && course = {:courseId} && status = "active"', {
            studentId: user.id,
            courseId,
          }),
          { requestKey: null }
        );

        if (!enrollment) {
          navigate('/lms/unauthorized');
          return;
        }

        // Fetch course
        const courseData = await pb.collection('courses').getOne<Course>(courseId, {
          requestKey: null,
        });
        setCourse(courseData);

        // Fetch PUBLISHED lessons only
        const lessonsData = await pb.collection('lessons').getFullList<Lesson>({
          filter: pb.filter('course = {:id} && status = "published"', { id: courseId }),
          sort: 'order',
          requestKey: null,
        });

        // Fetch progress
        const progressData = await pb.collection('student_progress').getFullList({
          filter: pb.filter('student = {:studentId}', { studentId: user.id }),
          requestKey: null,
        });

        // Mark completed lessons
        const completedLessonIds = new Set(
          progressData.filter(p => p.completed).map(p => p.lesson)
        );

        const lessonsWithProgress = lessonsData.map(lesson => ({
          ...lesson,
          completed: completedLessonIds.has(lesson.id),
        }));

        setLessons(lessonsWithProgress);

        // Calculate progress percentage
        if (lessonsData.length > 0) {
          const completedCount = lessonsWithProgress.filter(l => l.completed).length;
          setProgress(Math.round((completedCount / lessonsData.length) * 100));
        }
      } catch (error) {
        console.error('Failed to fetch course data:', error);
        // If enrollment not found or any error, redirect
        navigate('/lms/unauthorized');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [user, courseId, navigate]);

  const getLessonIcon = (type: string, completed: boolean) => {
    if (completed) return <CheckCircle className="w-6 h-6 text-green-400" />;
    
    switch (type) {
      case 'video':
        return <PlayCircle className="w-6 h-6 text-amber-400" />;
      default:
        return <FileText className="w-6 h-6 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading course...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Course not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/lms/student/dashboard')}
          className="flex items-center text-gray-400 hover:text-amber-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>

        {/* Course Header */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border-2 border-gray-600 overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            {/* Thumbnail */}
            <div className="aspect-video lg:aspect-square bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center overflow-hidden">
              {course.thumbnail ? (
                <img
                  src={pb.files.getUrl(course, course.thumbnail)}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <BookOpen className="w-24 h-24 text-gray-500" />
              )}
            </div>

            {/* Course Info */}
            <div className="lg:col-span-2 p-8">
              <h1 className="text-3xl font-bold text-amber-300 mb-4">{course.title}</h1>
              <div
                className="text-gray-300 mb-6 prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: course.description }}
              />

              {/* Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-400">Your Progress</span>
                  <span className="text-sm font-bold text-amber-400">{progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-4">
                <div className="bg-gray-700/50 px-4 py-2 rounded-lg">
                  <span className="text-gray-400 text-sm">Lessons: </span>
                  <span className="font-bold text-white">
                    {lessons.filter(l => l.completed).length} / {lessons.length}
                  </span>
                </div>
                {course.duration_weeks && (
                  <div className="bg-gray-700/50 px-4 py-2 rounded-lg">
                    <span className="text-gray-400 text-sm">Duration: </span>
                    <span className="font-bold text-white">{course.duration_weeks} weeks</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Lessons List */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border-2 border-gray-600 p-8">
          <h2 className="text-2xl font-bold text-amber-300 mb-6 flex items-center">
            <BookOpen className="w-6 h-6 mr-3" />
            Course Lessons
          </h2>

          {lessons.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No lessons available yet</p>
              <p className="text-gray-500 text-sm mt-2">Your teacher will add lessons soon</p>
            </div>
          ) : (
            <div className="space-y-4">
              {lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  onClick={() => navigate(`/lms/student/lesson/${lesson.id}`)}
                  className={`
                    bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl p-6 border-2 
                    ${lesson.completed ? 'border-green-600 bg-green-900/10' : 'border-gray-600'}
                    hover:border-amber-400 transition-all duration-300 cursor-pointer
                    transform hover:-translate-y-1 hover:shadow-xl
                  `}
                >
                  <div className="flex items-center">
                    {/* Lesson Number */}
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0
                      ${lesson.completed ? 'bg-green-900/30 border-2 border-green-600' : 'bg-gray-600 border-2 border-gray-500'}
                    `}>
                      <span className={`font-bold ${lesson.completed ? 'text-green-400' : 'text-gray-300'}`}>
                        {index + 1}
                      </span>
                    </div>

                    {/* Lesson Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-amber-300 mb-1">{lesson.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center">
                          {getLessonIcon(lesson.type, lesson.completed)}
                          <span className="ml-2 capitalize">{lesson.type.replace('_', ' ')}</span>
                        </div>
                        {lesson.duration_minutes && (
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{lesson.duration_minutes} min</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center ml-4">
                      {lesson.completed ? (
                        <div className="bg-green-900/30 text-green-400 px-4 py-2 rounded-lg border border-green-600 font-semibold text-sm">
                          Completed ✓
                        </div>
                      ) : (
                        <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-amber-400 transition-colors" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completion Message */}
        {progress >= 100 && (
          <div className="mt-8 bg-gradient-to-r from-green-900/30 to-amber-900/30 rounded-2xl p-8 border-2 border-green-500 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-green-300 mb-2">
              🎉 Congratulations!
            </h3>
            <p className="text-gray-300 text-lg">
              You've completed all lessons in this course. Excellent work!
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export default CourseView;