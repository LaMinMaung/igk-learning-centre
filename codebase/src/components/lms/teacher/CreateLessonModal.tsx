import React, { useState } from 'react';
import { X, Plus, AlertCircle, CheckCircle, Upload, Link as LinkIcon, FileText, Video } from 'lucide-react';
import pb from '../../../lib/pocketbase';

interface CreateLessonModalProps {
  courseId: string;
  onClose: () => void;
  onSuccess: () => void;
  nextOrder: number;
}

const CreateLessonModal: React.FC<CreateLessonModalProps> = ({ courseId, onClose, onSuccess, nextOrder }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'mixed' as 'video' | 'pdf' | 'text' | 'mixed',
    video_url: '',
    duration_minutes: '',
    status: 'draft' as 'draft' | 'published',
  });
  const [attachments, setAttachments] = useState<File[]>([]);
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
    
    // Check file sizes
    for (const file of files) {
      if (file.size > 50 * 1024 * 1024) {
        setError(`File "${file.name}" is too large. Maximum size is 50MB.`);
        return;
      }
    }

    setAttachments([...attachments, ...files]);
    setError('');
  };

  const removeFile = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
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
      lessonData.append('course', courseId);
      lessonData.append('title', formData.title.trim());
      lessonData.append('type', formData.type);
      lessonData.append('order', nextOrder.toString());
      lessonData.append('status', formData.status);

      if (formData.content.trim()) {
        lessonData.append('content', formData.content.trim());
      }

      if (formData.video_url.trim()) {
        lessonData.append('video_url', formData.video_url.trim());
      }

      if (formData.duration_minutes) {
        lessonData.append('duration_minutes', formData.duration_minutes);
      }

      // Append all attachments
      attachments.forEach((file) => {
        lessonData.append('attachments', file);
      });

      await pb.collection('lessons').create(lessonData);

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      console.error('Error creating lesson:', err);
      setError(err?.message || 'Failed to create lesson. Please try again.');
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
            <Plus className="w-6 h-6 text-amber-400 mr-3" />
            <h2 className="text-2xl font-bold text-amber-300">Add New Lesson</h2>
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
                <p className="font-semibold mb-1">Lesson Created! ✓</p>
                <p className="text-sm">Your lesson has been added to the course.</p>
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
              placeholder="e.g., Introduction to Fractions"
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
            <p className="text-xs text-gray-400 mt-2">
              💡 Tip: Save as "Draft" while preparing, then "Publish" when ready
            </p>
          </div>

          {/* Video Link */}
          <div>
            <label htmlFor="video_url" className="block text-sm font-bold text-amber-300 mb-2">
              <Video className="w-4 h-4 inline mr-2" />
              Video Link (Optional)
            </label>
            <input
              type="url"
              id="video_url"
              name="video_url"
              value={formData.video_url}
              onChange={handleChange}
              disabled={loading || success}
              className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-gray-200 disabled:opacity-50"
              placeholder="Paste YouTube or Vimeo link here"
            />
            <p className="text-xs text-gray-400 mt-2">
              YouTube: https://www.youtube.com/watch?v=... or Vimeo: https://vimeo.com/...
            </p>
          </div>

          {/* Lesson Text Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-bold text-amber-300 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Lesson Text (Optional)
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              disabled={loading || success}
              rows={8}
              className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-gray-200 disabled:opacity-50 resize-none"
              placeholder="Write your lesson content here. You can include explanations, examples, instructions..."
            />
            <p className="text-xs text-gray-400 mt-2">
              You can use basic HTML formatting if needed (bold, lists, etc.)
            </p>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-bold text-amber-300 mb-2">
              <Upload className="w-4 h-4 inline mr-2" />
              Upload Files (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-600 rounded-xl p-6 bg-gray-700/30 hover:border-amber-400 transition-all">
              <input
                type="file"
                id="attachments"
                multiple
                onChange={handleFileChange}
                disabled={loading || success}
                accept=".pdf,.jpg,.jpeg,.png,.mp4"
                className="hidden"
              />
              <label
                htmlFor="attachments"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-12 h-12 text-gray-500 mb-3" />
                <p className="text-gray-300 font-semibold mb-1">Click to upload files</p>
                <p className="text-gray-500 text-sm">PDFs, images, or videos (max 50MB each)</p>
              </label>
            </div>

            {/* File List */}
            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                {attachments.map((file, index) => (
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
                      onClick={() => removeFile(index)}
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
              ⏱️ Estimated Time (Optional)
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
              placeholder="How many minutes to complete?"
            />
            <p className="text-xs text-gray-400 mt-2">
              Help students plan their study time
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
              {loading ? 'Adding Lesson...' : success ? 'Added!' : 'Add Lesson'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLessonModal;