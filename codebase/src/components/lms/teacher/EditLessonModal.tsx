import React, { useState } from 'react';
import { X, Edit, AlertCircle, CheckCircle, Upload, FileText, Video } from 'lucide-react';
import pb from '../../../lib/pocketbase';

interface Lesson {
  id: string;
  title: string;
  content?: string;
  type: string;
  video_url?: string;
  attachments?: string[];
  duration_minutes?: number;
  status: 'draft' | 'published';
}

interface EditLessonModalProps {
  lesson: Lesson;
  onClose: () => void;
  onSuccess: () => void;
}

const EditLessonModal: React.FC<EditLessonModalProps> = ({ lesson, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: lesson.title,
    content: lesson.content || '',
    video_url: lesson.video_url || '',
    duration_minutes: lesson.duration_minutes?.toString() || '',
    status: lesson.status,
  });
  const [newAttachments, setNewAttachments] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<string[]>(lesson.attachments || []);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    for (const file of files) {
      if (file.size > 50 * 1024 * 1024) {
        setError(`File "${file.name}" is too large. Maximum size is 50MB.`);
        return;
      }
    }

    setNewAttachments([...newAttachments, ...files]);
    setError('');
  };

  const removeNewFile = (index: number) => {
    setNewAttachments(newAttachments.filter((_, i) => i !== index));
  };

  const removeExistingFile = (filename: string) => {
    setExistingAttachments(existingAttachments.filter((f) => f !== filename));
  };

  const validateForm = () => {
    if (!formData.title.trim()) return 'Lesson title is required';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const lessonData = new FormData();
      lessonData.append('title', formData.title.trim());
      lessonData.append('status', formData.status);

      if (formData.content.trim()) {
        lessonData.append('content', formData.content.trim());
      } else {
        lessonData.append('content', '');
      }

      if (formData.video_url.trim()) {
        lessonData.append('video_url', formData.video_url.trim());
      } else {
        lessonData.append('video_url', '');
      }

      if (formData.duration_minutes) {
        lessonData.append('duration_minutes', formData.duration_minutes);
      }

      // Keep existing attachments
      existingAttachments.forEach((filename) => {
        lessonData.append('attachments', filename);
      });

      // Add new attachments
      newAttachments.forEach((file) => {
        lessonData.append('attachments', file);
      });

      await pb.collection('lessons').update(lesson.id, lessonData);

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      console.error('Error updating lesson:', err);
      setError(err?.message || 'Failed to update lesson. Please try again.');
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
            <Edit className="w-6 h-6 text-amber-400 mr-3" />
            <h2 className="text-2xl font-bold text-amber-300">Edit Lesson</h2>
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
                <p className="font-semibold mb-1">Lesson Updated! ✓</p>
                <p className="text-sm">Your changes have been saved.</p>
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

          {/* Lesson Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-bold text-amber-300 mb-2">
              Lesson Title <span className="text-red-500">*</span>
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
              maxLength={200}
            />
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-bold text-amber-300 mb-2">
              Lesson Status <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={loading || success}
              className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-gray-200 disabled:opacity-50"
            >
              <option value="draft">📝 Draft (Only you can see it)</option>
              <option value="published">✅ Published (Students can see it)</option>
            </select>
          </div>

          {/* Video Link */}
          <div>
            <label htmlFor="video_url" className="block text-sm font-bold text-amber-300 mb-2">
              <Video className="w-4 h-4 inline mr-2" />
              Video Link
            </label>
            <input
              type="url"
              id="video_url"
              name="video_url"
              value={formData.video_url}
              onChange={handleChange}
              disabled={loading || success}
              className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-gray-200 disabled:opacity-50"
              placeholder="YouTube or Vimeo link"
            />
          </div>

          {/* Lesson Text Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-bold text-amber-300 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Lesson Text
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              disabled={loading || success}
              rows={8}
              className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-gray-200 disabled:opacity-50 resize-none"
              placeholder="Lesson content..."
            />
          </div>

          {/* Existing Files */}
          {existingAttachments.length > 0 && (
            <div>
              <label className="block text-sm font-bold text-amber-300 mb-2">Current Files</label>
              <div className="space-y-2">
                {existingAttachments.map((filename, index) => (
                  <div
                    key={index}
                    className="bg-gray-700 rounded-lg p-3 flex items-center justify-between border-2 border-gray-600"
                  >
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-amber-400 mr-3" />
                      <span className="text-gray-200 text-sm">{filename}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExistingFile(filename)}
                      className="text-red-400 hover:text-red-300 p-1"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New File Upload */}
          <div>
            <label className="block text-sm font-bold text-amber-300 mb-2">
              <Upload className="w-4 h-4 inline mr-2" />
              Add More Files
            </label>
            <div className="border-2 border-dashed border-gray-600 rounded-xl p-6 bg-gray-700/30 hover:border-amber-400 transition-all">
              <input
                type="file"
                id="new-attachments"
                multiple
                onChange={handleFileChange}
                disabled={loading || success}
                accept=".pdf,.jpg,.jpeg,.png,.mp4"
                className="hidden"
              />
              <label htmlFor="new-attachments" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-8 h-8 text-gray-500 mb-2" />
                <p className="text-gray-400 text-sm">Click to add more files</p>
              </label>
            </div>

            {newAttachments.length > 0 && (
              <div className="mt-4 space-y-2">
                {newAttachments.map((file, index) => (
                  <div
                    key={index}
                    className="bg-gray-700 rounded-lg p-3 flex items-center justify-between border-2 border-gray-600"
                  >
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-amber-400 mr-3" />
                      <span className="text-gray-200 text-sm">{file.name}</span>
                      <span className="text-gray-500 text-xs ml-3">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeNewFile(index)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="duration_minutes" className="block text-sm font-bold text-amber-300 mb-2">
              ⏱️ Estimated Time
            </label>
            <input
              type="number"
              id="duration_minutes"
              name="duration_minutes"
              value={formData.duration_minutes}
              onChange={handleChange}
              min="1"
              disabled={loading || success}
              className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-gray-200 disabled:opacity-50"
              placeholder="Minutes"
            />
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
              {loading ? 'Saving...' : success ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLessonModal;