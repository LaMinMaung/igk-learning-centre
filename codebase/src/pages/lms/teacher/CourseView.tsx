import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/lms/DashboardLayout';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Plus, Edit, Trash2, GripVertical, PlayCircle, FileText, Eye, EyeOff } from 'lucide-react';
import pb from '../../../lib/pocketbase';
import { useAuth } from '../../../lib/auth';
import CreateLessonModal from '../../../components/lms/teacher/CreateLessonModal';
import EditLessonModal from '../../../components/lms/teacher/EditLessonModal';
import DeleteLessonModal from '../../../components/lms/teacher/DeleteLessonModal';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  level: string;
}

interface Lesson {
  id: string;
  title: string;
  content?: string;
  type: string;
  video_url?: string;
  attachments?: string[];
  order: number;
  duration_minutes?: number;
  status: 'draft' | 'published';
}

const TeacherCourseView = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'lessons' | 'quizzes' | 'assignments'>('lessons');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    fetchCourseData();
  }, [user, courseId]);

  const fetchCourseData = async () => {
    if (!user || !courseId) return;

    try {
      // Verify teacher has access to this course
      const assignments = await pb.collection('teacher_course_assignments').getFullList({
        filter: pb.filter('teacher = {:teacherId} && course = {:courseId}', {
          teacherId: user.id,
          courseId,
        }),
        requestKey: null,
      });

      if (assignments.length === 0) {
        navigate('/lms/unauthorized');
        return;
      }

      // Fetch course
      const courseData = await pb.collection('courses').getOne<Course>(courseId, {
        requestKey: null,
      });
      setCourse(courseData);

      // Fetch lessons
      await fetchLessons();
    } catch (error) {
      console.error('Failed to fetch course data:', error);
      navigate('/lms/teacher/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async () => {
    if (!courseId) return;

    try {
      const lessonsData = await pb.collection('lessons').getFullList<Lesson>({
        filter: pb.filter('course = {:id}', { id: courseId }),
        sort: 'order',
        requestKey: null,
      });
      setLessons(lessonsData);
    } catch (error) {
      console.error('Failed to fetch lessons:', error);
    }
  };

  const handleLessonCreated = () => {
    setShowCreateModal(false);
    fetchLessons();
  };

  const handleLessonUpdated = () => {
    setShowEditModal(false);
    setSelectedLesson(null);
    fetchLessons();
  };

  const handleLessonDeleted = () => {
    setShowDeleteModal(false);
    setSelectedLesson(null);
    fetchLessons();
  };

  const handleEditLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setShowEditModal(true);
  };

  const handleDeleteLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setShowDeleteModal(true);
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <PlayCircle className="w-5 h-5 text-amber-400" />;
      default:
        return <FileText className="w-5 h-5 text-gray-400" />;
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
          onClick={() => navigate('/lms/teacher/dashboard')}
          className="flex items-center text-gray-400 hover:text-amber-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>

        {/* Course Header */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border-2 border-gray-600 p-8 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-amber-300 mb-2">{course.title}</h1>
              <div
                className="text-gray-300 mb-4 prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: course.description }}
              />
            </div>
            {course.thumbnail && (
              <img
                src={pb.files.getUrl(course, course.thumbnail)}
                alt={course.title}
                className="w-32 h-32 object-cover rounded-xl border-2 border-gray-600 ml-6"
              />
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border-2 border-gray-600 mb-6">
          <div className="flex border-b-2 border-gray-700">
            <button
              onClick={() => setActiveTab('lessons')}
              className={`flex-1 px-6 py-4 font-semibold transition-all duration-300 ${
                activeTab === 'lessons'
                  ? 'bg-amber-900/30 text-amber-300 border-b-4 border-amber-500'
                  : 'text-gray-400 hover:text-amber-400 hover:bg-gray-700/30'
              }`}
            >
              📚 Lessons ({lessons.length})
            </button>
            <button
              onClick={() => setActiveTab('quizzes')}
              className={`flex-1 px-6 py-4 font-semibold transition-all duration-300 ${
                activeTab === 'quizzes'
                  ? 'bg-amber-900/30 text-amber-300 border-b-4 border-amber-500'
                  : 'text-gray-400 hover:text-amber-400 hover:bg-gray-700/30'
              }`}
            >
              📝 Quizzes (Coming Soon)
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`flex-1 px-6 py-4 font-semibold transition-all duration-300 ${
                activeTab === 'assignments'
                  ? 'bg-amber-900/30 text-amber-300 border-b-4 border-amber-500'
                  : 'text-gray-400 hover:text-amber-400 hover:bg-gray-700/30'
              }`}
            >
              📋 Assignments (Coming Soon)
            </button>
          </div>

          {/* Lessons Tab */}
          {activeTab === 'lessons' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-amber-300">Course Lessons</h2>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center bg-gradient-to-r from-red-700 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-500 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Lesson
                </button>
              </div>

              {lessons.length === 0 ? (
                <div className="text-center py-12 bg-gray-700/30 rounded-xl border-2 border-gray-600">
                  <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg mb-2">No lessons yet</p>
                  <p className="text-gray-500 text-sm mb-6">Click "Add Lesson" to create your first lesson</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-amber-500 to-amber-400 text-gray-900 px-6 py-3 rounded-xl font-semibold hover:from-amber-400 hover:to-amber-300 transition-all duration-300 transform hover:scale-105"
                  >
                    Get Started
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl p-4 border-2 border-gray-600 hover:border-amber-400 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        {/* Drag Handle */}
                        <div className="cursor-move text-gray-500 hover:text-amber-400">
                          <GripVertical className="w-5 h-5" />
                        </div>

                        {/* Order Number */}
                        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0 font-bold text-gray-300">
                          {index + 1}
                        </div>

                        {/* Lesson Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-amber-300 truncate">{lesson.title}</h3>
                            {lesson.status === 'draft' && (
                              <div className="flex items-center bg-gray-600 px-2 py-1 rounded text-xs font-semibold text-gray-300">
                                <EyeOff className="w-3 h-3 mr-1" />
                                Draft
                              </div>
                            )}
                            {lesson.status === 'published' && (
                              <div className="flex items-center bg-green-900/30 px-2 py-1 rounded text-xs font-semibold text-green-400 border border-green-600">
                                <Eye className="w-3 h-3 mr-1" />
                                Published
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center">
                              {getLessonIcon(lesson.type)}
                              <span className="ml-2 capitalize">{lesson.type.replace('_', ' ')}</span>
                            </div>
                            {lesson.duration_minutes && (
                              <span>⏱️ {lesson.duration_minutes} min</span>
                            )}
                            {lesson.video_url && <span>🎥 Video</span>}
                            {lesson.attachments && lesson.attachments.length > 0 && (
                              <span>📎 {lesson.attachments.length} file(s)</span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditLesson(lesson)}
                            className="p-2 bg-amber-900/30 text-amber-400 rounded-lg hover:bg-amber-900/50 transition-all duration-300 border border-amber-600"
                            title="Edit Lesson"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteLesson(lesson)}
                            className="p-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 transition-all duration-300 border border-red-600"
                            title="Delete Lesson"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quizzes Tab */}
          {activeTab === 'quizzes' && (
            <div className="p-6 text-center py-12">
              <p className="text-gray-400">Quiz builder coming in next update...</p>
            </div>
          )}

          {/* Assignments Tab */}
          {activeTab === 'assignments' && (
            <div className="p-6 text-center py-12">
              <p className="text-gray-400">Assignment manager coming in next update...</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && courseId && (
        <CreateLessonModal
          courseId={courseId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleLessonCreated}
          nextOrder={lessons.length}
        />
      )}

      {showEditModal && selectedLesson && (
        <EditLessonModal
          lesson={selectedLesson}
          onClose={() => {
            setShowEditModal(false);
            setSelectedLesson(null);
          }}
          onSuccess={handleLessonUpdated}
        />
      )}

      {showDeleteModal && selectedLesson && (
        <DeleteLessonModal
          lesson={selectedLesson}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedLesson(null);
          }}
          onSuccess={handleLessonDeleted}
        />
      )}
    </DashboardLayout>
  );
};

export default TeacherCourseView;