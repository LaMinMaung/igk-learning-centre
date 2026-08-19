import React, { useState } from 'react';
import { X, BookOpen, AlertCircle, CheckCircle, Upload } from 'lucide-react';
import pb from '../../../lib/pocketbase';
import { useAuth } from '../../../lib/auth';

interface CreateCourseModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateCourseModal: React.FC<CreateCourseModalProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'primary' as 'nursery' | 'primary' | 'secondary' | 'exam_prep',
    status: 'draft' as 'draft' | 'published' | 'archived',
    duration_weeks: '',
  });
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Thumbnail must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) return 'Title is required';
    if (!formData.description.trim()) return 'Description is required';
    if (formData.duration_weeks && parseInt(formData.duration_weeks) < 1) {
      return 'Duration must be at least 1 week';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!user) {
      setError('You must be logged in to create a course');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const courseData = new FormData();
      courseData.append('title', formData.title.trim());
      courseData.append('description', formData.description.trim());
      courseData.append('level', formData.level);
      courseData.append('status', formData.status);
      courseData.append('created_by', user.id);
      
      if (formData.duration_weeks) {
        courseData.append('duration_weeks', formData.duration_weeks);
      }
      
      if (thumbnail) {
        courseData.append('thumbnail', thumbnail);
      }

      await pb.collection('courses').create(courseData);

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      console.error('Error creating course:', err);
      setError(err?.message || 'Failed to create course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border-2 border-gray-600 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-gray-800 to-gray-900 border-b-2 border-gray-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <BookOpen className="w-6 h-6 text-amber-400 mr-3" />
            <h2 className="text-2xl font-bold text-amber-300">Create New Course</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Success Message */}
          {success && (
            <div className="bg-green-900/30 border-2 border-green-500 text-green-300 px-4 py-3 rounded-xl flex items-start">
              <CheckCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold mb-1">Course Created Successfully!</p>
                <p className="text-sm">The new course has been added to the system.</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/30 border-2 border-red-500 text-red-300 px-4 py-3 rounded-xl flex items-start">
              <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-bold text-amber-300 mb-2">
              Course Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              disabled={loading || success}
              className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-gray-200 disabled:opacity-50"
              placeholder="e.g., Cambridge Primary Mathematics Year 3"
              maxLength={200}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-bold text-amber-300 mb-2">
              Course Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              disabled={loading || success}
              rows={5}
              className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-gray-200 disabled:opacity-50 resize-none"
              placeholder="Provide a detailed description of what students will learn..."
            />
            <p className="text-xs text-gray-400 mt-1">
              You can use basic HTML formatting if needed
            </p>
          </div>

          {/* Thumbnail Upload */}
          <div>
            <label className="block text-sm font-bold text-amber-300 mb-2">
              Course Thumbnail (Optional)
            </label>
            <div className="flex items-start gap-4">
              {thumbnailPreview ? (
                <div className="relative">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-32 h-32 object-cover rounded-xl border-2 border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setThumbnail(null);
                      setThumbnailPreview('');
                    }}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 bg-gray-700 border-2 border-dashed border-gray-600 rounded-xl flex items-center justify-center">
                  <Upload className="w-8 h-8 text-gray-500" />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  id="thumbnail"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  disabled={loading || success}
                  className="hidden"
                />
                <label
                  htmlFor="thumbnail"
                  className="inline-block bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-all duration-300 cursor-pointer disabled:opacity-50"
                >
                  Choose Image
                </label>
                <p className="text-xs text-gray-400 mt-2">
                  Recommended: 16:9 aspect ratio, max 5MB
                </p>
                <p className="text-xs text-gray-400">
                  Formats: JPG, PNG, WebP
                </p>
              </div>
            </div>
          </div>

          {/* Level and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="level" className="block text-sm font-bold text-amber-300 mb-2">
                Education Level <span className="text-red-500">*</span>
              </label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                required
                disabled={loading || success}
                className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-gray-200 disabled:opacity-50"
              >
                <option value="nursery">Nursery (Ages 2-6)</option>
                <option value="primary">Primary (Year 1-6)</option>
                <option value="secondary">Secondary (Year 7-9)</option>
                <option value="exam_prep">Exam Preparation</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-bold text-amber-300 mb-2">
                Publication Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                disabled={loading || success}
                className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-gray-200 disabled:opacity-50"
              >
                <option value="draft">Draft (Not visible to students)</option>
                <option value="published">Published (Visible to students)</option>
                <option value="archived">Archived (Read-only)</option>
              </select>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="duration_weeks" className="block text-sm font-bold text-amber-300 mb-2">
              Course Duration (Optional)
            </label>
            <input
              type="number"
              id="duration_weeks"
              name="duration_weeks"
              value={formData.duration_weeks}
              onChange={handleChange}
              min="1"
              disabled={loading || success}
              className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-gray-200 disabled:opacity-50"
              placeholder="Number of weeks (e.g., 12)"
            />
            <p className="text-xs text-gray-400 mt-1">
              How many weeks does this course typically take to complete?
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-700 text-white py-3 rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="flex-1 bg-gradient-to-r from-red-700 to-red-600 text-white py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg"
            >
              {loading ? 'Creating...' : success ? 'Created!' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourseModal;