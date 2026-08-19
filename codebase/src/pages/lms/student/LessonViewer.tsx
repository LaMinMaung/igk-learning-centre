import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/lms/DashboardLayout';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Download, FileText, PlayCircle, AlertCircle } from 'lucide-react';
import pb from '../../../lib/pocketbase';
import { useAuth } from '../../../lib/auth';

interface Lesson {
  id: string;
  course: string;
  title: string;
  content: string;
  type: string;
  video_url?: string;
  attachments?: string[];
  duration_minutes?: number;
  status: string;
}

const LessonViewer = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      if (!user || !lessonId) return;

      try {
        // Fetch lesson
        const lessonData = await pb.collection('lessons').getOne<Lesson>(lessonId, {
          requestKey: null,
        });

        // SECURITY: Verify lesson is published
        if (lessonData.status !== 'published') {
          navigate('/lms/unauthorized');
          return;
        }

        // SECURITY: Verify student is enrolled in the course this lesson belongs to
        const enrollment = await pb.collection('enrollments').getFirstListItem(
          pb.filter('student = {:studentId} && course = {:courseId} && status = "active"', {
            studentId: user.id,
            courseId: lessonData.course,
          }),
          { requestKey: null }
        );

        if (!enrollment) {
          navigate('/lms/unauthorized');
          return;
        }

        setLesson(lessonData);

        // Check if completed
        const progressRecords = await pb.collection('student_progress').getFullList({
          filter: pb.filter('student = {:studentId} && lesson = {:lessonId}', {
            studentId: user.id,
            lessonId: lessonId,
          }),
          requestKey: null,
        });

        if (progressRecords.length > 0 && progressRecords[0].completed) {
          setCompleted(true);
        }
      } catch (error) {
        console.error('Failed to fetch lesson:', error);
        navigate('/lms/unauthorized');
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [user, lessonId, navigate]);

  const handleMarkComplete = async () => {
    if (!user || !lesson || completed) return;

    setMarking(true);

    try {
      // Check if progress record exists
      const existingProgress = await pb.collection('student_progress').getFullList({
        filter: pb.filter('student = {:studentId} && lesson = {:lessonId}', {
          studentId: user.id,
          lessonId: lesson.id,
        }),
        requestKey: null,
      });

      if (existingProgress.length > 0) {
        // Update existing
        await pb.collection('student_progress').update(existingProgress[0].id, {
          completed: true,
          completed_date: new Date().toISOString(),
        });
      } else {
        // Create new
        await pb.collection('student_progress').create({
          student: user.id,
          lesson: lesson.id,
          completed: true,
          completed_date: new Date().toISOString(),
        });
      }

      setCompleted(true);

      // Show success and redirect after delay
      setTimeout(() => {
        navigate(`/lms/student/course/${lesson.course}`);
      }, 2000);
    } catch (error) {
      console.error('Failed to mark complete:', error);
    } finally {
      setMarking(false);
    }
  };

  const getVideoEmbedUrl = (url: string) => {
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be') 
        ? url.split('youtu.be/')[1]?.split('?')[0]
        : url.split('v=')[1]?.split('&')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    
    // Vimeo
    if (url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }

    return null;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading lesson...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!lesson) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Lesson not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const embedUrl = lesson.video_url ? getVideoEmbedUrl(lesson.video_url) : null;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(`/lms/student/course/${lesson.course}`)}
          className="flex items-center text-gray-400 hover:text-amber-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Course
        </button>

        {/* Lesson Header */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border-2 border-gray-600 p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-amber-300 mb-2">{lesson.title}</h1>
              {lesson.duration_minutes && (
                <div className="flex items-center text-gray-400">
                  <PlayCircle className="w-5 h-5 mr-2" />
                  <span>Estimated time: {lesson.duration_minutes} minutes</span>
                </div>
              )}
            </div>
            {completed && (
              <div className="bg-green-900/30 border-2 border-green-600 text-green-300 px-4 py-2 rounded-xl flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="font-semibold">Completed</span>
              </div>
            )}
          </div>
        </div>

        {/* Lesson Content */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border-2 border-gray-600 p-8 mb-6">
          {/* Video */}
          {lesson.video_url && embedUrl && (
            <div className="mb-8">
              <div className="aspect-video bg-black rounded-xl overflow-hidden">
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Text Content */}
          {lesson.content && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-amber-300 mb-4 flex items-center">
                <FileText className="w-6 h-6 mr-2" />
                Lesson Content
              </h2>
              <div
                className="prose prose-invert max-w-none text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: lesson.content }}
              />
            </div>
          )}

          {/* Attachments */}
          {lesson.attachments && lesson.attachments.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-amber-300 mb-4 flex items-center">
                <Download className="w-6 h-6 mr-2" />
                Downloadable Resources
              </h2>
              <div className="space-y-3">
                {lesson.attachments.map((filename, index) => {
                  const fileUrl = pb.files.getUrl(lesson, filename);
                  
                  return (
                    <div
                      key={index}
                      className="bg-gray-700 rounded-xl p-4 flex items-center justify-between border-2 border-gray-600 hover:border-amber-400 transition-all"
                    >
                      <div className="flex items-center">
                        <FileText className="w-6 h-6 text-amber-400 mr-3" />
                        <span className="text-gray-200 font-medium">{filename}</span>
                      </div>
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        onClick={(e) => e.stopPropagation()}
                        className="bg-gradient-to-r from-red-700 to-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-red-600 hover:to-red-500 transition-all flex items-center"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Mark Complete Button */}
        {!completed && (
          <button
            onClick={handleMarkComplete}
            disabled={marking}
            className="w-full bg-gradient-to-r from-green-700 to-green-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg flex items-center justify-center"
          >
            {marking ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Marking Complete...
              </>
            ) : (
              <>
                <CheckCircle className="w-6 h-6 mr-2" />
                Mark Lesson as Complete
              </>
            )}
          </button>
        )}

        {/* Completion Success */}
        {completed && (
          <div className="bg-gradient-to-r from-green-900/30 to-amber-900/30 rounded-2xl p-6 border-2 border-green-500 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-xl text-green-300 font-semibold mb-2">
              ✓ Lesson Completed!
            </p>
            <p className="text-gray-300">
              Great job! Your progress has been saved.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LessonViewer;