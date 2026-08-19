import React, { useState } from 'react';
import { X, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import pb from '../../../lib/pocketbase';

interface Lesson {
  id: string;
  title: string;
  type: string;
}

interface DeleteLessonModalProps {
  lesson: Lesson;
  onClose: () => void;
  onSuccess: () => void;
}

const DeleteLessonModal: React.FC<DeleteLessonModalProps> = ({ lesson, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await pb.collection('lessons').delete(lesson.id);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      console.error('Error deleting lesson:', err);
      setError(err?.message || 'Failed to delete lesson. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border-2 border-red-600 max-w-md w-full">
        {/* Header */}
        <div className="bg-red-900/30 border-b-2 border-red-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Trash2 className="w-6 h-6 text-red-400 mr-3" />
            <h2 className="text-2xl font-bold text-red-300">Delete Lesson</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Success Message */}
          {success && (
            <div className="bg-green-900/30 border-2 border-green-500 text-green-300 px-4 py-3 rounded-xl flex items-start">
              <CheckCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold mb-1">Lesson Deleted! ✓</p>
                <p className="text-sm">The lesson has been permanently removed.</p>
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

          {!success && (
            <>
              {/* Warning */}
              <div className="bg-red-900/20 border-2 border-red-600 rounded-xl p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-6 h-6 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-red-300 mb-2">⚠️ Warning: This cannot be undone!</h3>
                    <p className="text-red-200 text-sm mb-2">
                      You are about to permanently delete:
                    </p>
                    <div className="bg-gray-800/50 rounded-lg p-3 mt-3">
                      <p className="text-white font-semibold">{lesson.title}</p>
                      <p className="text-gray-400 text-xs mt-1 capitalize">Type: {lesson.type.replace('_', ' ')}</p>
                    </div>
                    <p className="text-red-200 text-sm mt-3">
                      This will also remove:
                    </p>
                    <ul className="text-red-200 text-sm mt-2 ml-4 list-disc space-y-1">
                      <li>All student progress for this lesson</li>
                      <li>Any quizzes attached to this lesson</li>
                      <li>All uploaded files and content</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Confirmation Input */}
              <div>
                <label htmlFor="confirmText" className="block text-sm font-bold text-amber-300 mb-2">
                  Type <span className="text-white font-mono bg-gray-700 px-2 py-1 rounded">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  id="confirmText"
                  value={confirmText}
                  onChange={(e) => {
                    setConfirmText(e.target.value);
                    setError('');
                  }}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all duration-300 text-gray-200 disabled:opacity-50 font-mono"
                  placeholder="Type DELETE here"
                  autoComplete="off"
                />
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-700 text-white py-3 rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300 disabled:opacity-50"
            >
              {success ? 'Close' : 'Cancel'}
            </button>
            {!success && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading || confirmText !== 'DELETE'}
                className="flex-1 bg-gradient-to-r from-red-700 to-red-600 text-white py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg"
              >
                {loading ? 'Deleting...' : 'Delete Lesson'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteLessonModal;