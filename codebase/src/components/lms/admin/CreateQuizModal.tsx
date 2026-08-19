import React, { useState, useEffect } from 'react';
import { X, GraduationCap, AlertCircle, CheckCircle, Plus, Trash2 } from 'lucide-react';
import pb from '../../../lib/pocketbase';

interface Course {
  id: string;
  title: string;
}

interface Lesson {
  id: string;
  title: string;
}

interface Question {
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correct_answer: string;
  points: number;
}

interface CreateQuizModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateQuizModal: React.FC<CreateQuizModalProps> = ({ onClose, onSuccess }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [formData, setFormData] = useState({
    course: '',
    lesson: '',
    title: '',
    instructions: '',
    time_limit_minutes: '',
    passing_score: '70',
    randomize_questions: false,
    status: 'draft' as 'draft' | 'published',
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    question_text: '',
    question_type: 'multiple_choice',
    options: ['', '', '', ''],
    correct_answer: '',
    points: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (formData.course) {
      fetchLessons(formData.course);
    } else {
      setLessons([]);
    }
  }, [formData.course]);

  const fetchCourses = async () => {
    try {
      const records = await pb.collection('courses').getFullList<Course>({
        sort: 'title',
        fields: 'id,title',
        requestKey: null,
      });
      setCourses(records);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const fetchLessons = async (courseId: string) => {
    try {
      const records = await pb.collection('lessons').getFullList<Lesson>({
        filter: pb.filter('course = {:id} && status = "published"', { id: courseId }),
        sort: 'order',
        fields: 'id,title',
        requestKey: null,
      });
      setLessons(records);
    } catch (error) {
      console.error('Failed to fetch lessons:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
    setError('');
  };

  const handleQuestionChange = (field: string, value: any) => {
    setCurrentQuestion({
      ...currentQuestion,
      [field]: value,
    });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(currentQuestion.options || [])];
    newOptions[index] = value;
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions,
    });
  };

  const addQuestion = () => {
    if (!currentQuestion.question_text.trim()) {
      setError('Question text is required');
      return;
    }

    if (currentQuestion.question_type === 'multiple_choice') {
      const validOptions = (currentQuestion.options || []).filter(o => o.trim());
      if (validOptions.length < 2) {
        setError('Multiple choice needs at least 2 options');
        return;
      }
      if (!currentQuestion.correct_answer) {
        setError('Please select the correct answer');
        return;
      }
    }

    if (!currentQuestion.correct_answer.trim()) {
      setError('Correct answer is required');
      return;
    }

    setQuestions([...questions, { ...currentQuestion }]);
    setCurrentQuestion({
      question_text: '',
      question_type: 'multiple_choice',
      options: ['', '', '', ''],
      correct_answer: '',
      points: 1,
    });
    setError('');
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.course) return 'Please select a course';
    if (!formData.title.trim()) return 'Quiz title is required';
    if (questions.length === 0) return 'Add at least one question';
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
      // Create quiz
      const quizData: any = {
        course: formData.course,
        title: formData.title.trim(),
        status: formData.status,
        randomize_questions: formData.randomize_questions,
      };

      if (formData.lesson) quizData.lesson = formData.lesson;
      if (formData.instructions.trim()) quizData.instructions = formData.instructions.trim();
      if (formData.time_limit_minutes) quizData.time_limit_minutes = parseInt(formData.time_limit_minutes);
      if (formData.passing_score) quizData.passing_score = parseInt(formData.passing_score);

      const quiz = await pb.collection('quizzes').create(quizData);

      // Create questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        await pb.collection('quiz_questions').create({
          quiz: quiz.id,
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.question_type === 'multiple_choice' ? q.options : null,
          correct_answer: q.correct_answer,
          points: q.points,
          order: i,
        });
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      console.error('Error creating quiz:', err);
      setError(err?.message || 'Failed to create quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border-2 border-gray-600 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-gray-800 to-gray-900 border-b-2 border-gray-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <GraduationCap className="w-6 h-6 text-amber-400 mr-3" />
            <h2 className="text-2xl font-bold text-amber-300">Create New Quiz</h2>
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
                <p className="font-semibold mb-1">Quiz Created Successfully!</p>
                <p className="text-sm">The quiz has been added with {questions.length} questions.</p>
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

          {/* Quiz Settings */}
          <div className="bg-gray-700/30 rounded-xl p-6 border-2 border-gray-600">
            <h3 className="text-xl font-bold text-amber-300 mb-4">Quiz Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Course */}
              <div>
                <label htmlFor="course" className="block text-sm font-bold text-amber-300 mb-2">
                  Course <span className="text-red-500">*</span>
                </label>
                <select
                  id="course"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  required
                  disabled={loading || success}
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-gray-200 disabled:opacity-50"
                >
                  <option value="">Select a course...</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lesson (Optional) */}
              <div>
                <label htmlFor="lesson" className="block text-sm font-bold text-amber-300 mb-2">
                  Lesson (Optional)
                </label>
                <select
                  id="lesson"
                  name="lesson"
                  value={formData.lesson}
                  onChange={handleChange}
                  disabled={loading || success || !formData.course}
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-gray-200 disabled:opacity-50"
                >
                  <option value="">No specific lesson</option>
                  {lessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quiz Title */}
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-bold text-amber-300 mb-2">
                Quiz Title <span className="text-red-500">*</span>
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
                placeholder="e.g., Chapter 1 Quiz - Introduction to Fractions"
                maxLength={200}
              />
            </div>

            {/* Instructions */}
            <div className="mb-4">
              <label htmlFor="instructions" className="block text-sm font-bold text-amber-300 mb-2">
                Instructions (Optional)
              </label>
              <textarea
                id="instructions"
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                disabled={loading || success}
                rows={3}
                className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-gray-200 disabled:opacity-50 resize-none"
                placeholder="Provide instructions for students..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Time Limit */}
              <div>
                <label htmlFor="time_limit_minutes" className="block text-sm font-bold text-amber-300 mb-2">
                  Time Limit (min)
                </label>
                <input
                  type="number"
                  id="time_limit_minutes"
                  name="time_limit_minutes"
                  value={formData.time_limit_minutes}
                  onChange={handleChange}
                  min="1"
                  disabled={loading || success}
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-gray-200 disabled:opacity-50"
                  placeholder="30"
                />
              </div>

              {/* Passing Score */}
              <div>
                <label htmlFor="passing_score" className="block text-sm font-bold text-amber-300 mb-2">
                  Passing Score (%)
                </label>
                <input
                  type="number"
                  id="passing_score"
                  name="passing_score"
                  value={formData.passing_score}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  disabled={loading || success}
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-gray-200 disabled:opacity-50"
                />
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-bold text-amber-300 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={loading || success}
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-gray-200 disabled:opacity-50"
                >
                  <option value="draft">📝 Draft</option>
                  <option value="published">✅ Published</option>
                </select>
              </div>
            </div>

            {/* Randomize Questions */}
            <div className="mt-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="randomize_questions"
                  checked={formData.randomize_questions}
                  onChange={handleChange}
                  disabled={loading || success}
                  className="w-5 h-5 text-amber-500 bg-gray-700 border-2 border-gray-600 rounded focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
                />
                <span className="ml-3 text-gray-300">🔀 Randomize question order for each student</span>
              </label>
            </div>
          </div>

          {/* Question Builder */}
          <div className="bg-gray-700/30 rounded-xl p-6 border-2 border-gray-600">
            <h3 className="text-xl font-bold text-amber-300 mb-4">Add Questions ({questions.length})</h3>

            {/* Question Type */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-amber-300 mb-2">Question Type</label>
              <select
                value={currentQuestion.question_type}
                onChange={(e) => handleQuestionChange('question_type', e.target.value)}
                disabled={loading || success}
                className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-gray-200 disabled:opacity-50"
              >
                <option value="multiple_choice">Multiple Choice</option>
                <option value="true_false">True/False</option>
                <option value="short_answer">Short Answer</option>
              </select>
            </div>

            {/* Question Text */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-amber-300 mb-2">Question Text</label>
              <textarea
                value={currentQuestion.question_text}
                onChange={(e) => handleQuestionChange('question_text', e.target.value)}
                disabled={loading || success}
                rows={3}
                className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-gray-200 disabled:opacity-50 resize-none"
                placeholder="Enter your question..."
              />
            </div>

            {/* Options for Multiple Choice */}
            {currentQuestion.question_type === 'multiple_choice' && (
              <div className="mb-4">
                <label className="block text-sm font-bold text-amber-300 mb-2">Answer Options</label>
                <div className="space-y-2">
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correct_option"
                        checked={currentQuestion.correct_answer === (currentQuestion.options?.[index] || '')}
                        onChange={() => handleQuestionChange('correct_answer', currentQuestion.options?.[index] || '')}
                        className="w-5 h-5 text-green-500"
                      />
                      <input
                        type="text"
                        value={currentQuestion.options?.[index] || ''}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        disabled={loading || success}
                        className="flex-1 px-4 py-2 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-gray-200 disabled:opacity-50"
                        placeholder={`Option ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">Select the correct answer by clicking the radio button</p>
              </div>
            )}

            {/* True/False Options */}
            {currentQuestion.question_type === 'true_false' && (
              <div className="mb-4">
                <label className="block text-sm font-bold text-amber-300 mb-2">Correct Answer</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => handleQuestionChange('correct_answer', 'true')}
                    className={`flex-1 py-3 rounded-xl font-semibold border-2 transition-all duration-300 ${
                      currentQuestion.correct_answer === 'true'
                        ? 'bg-green-900/30 text-green-400 border-green-600'
                        : 'bg-gray-700 text-gray-300 border-gray-600 hover:border-amber-400'
                    }`}
                  >
                    ✓ True
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuestionChange('correct_answer', 'false')}
                    className={`flex-1 py-3 rounded-xl font-semibold border-2 transition-all duration-300 ${
                      currentQuestion.correct_answer === 'false'
                        ? 'bg-green-900/30 text-green-400 border-green-600'
                        : 'bg-gray-700 text-gray-300 border-gray-600 hover:border-amber-400'
                    }`}
                  >
                    ✗ False
                  </button>
                </div>
              </div>
            )}

            {/* Short Answer */}
            {currentQuestion.question_type === 'short_answer' && (
              <div className="mb-4">
                <label className="block text-sm font-bold text-amber-300 mb-2">Correct Answer (exact match)</label>
                <input
                  type="text"
                  value={currentQuestion.correct_answer}
                  onChange={(e) => handleQuestionChange('correct_answer', e.target.value)}
                  disabled={loading || success}
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-gray-200 disabled:opacity-50"
                  placeholder="Expected answer"
                />
                <p className="text-xs text-gray-400 mt-1">Student's answer must match exactly</p>
              </div>
            )}

            {/* Points */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-amber-300 mb-2">Points</label>
              <input
                type="number"
                value={currentQuestion.points}
                onChange={(e) => handleQuestionChange('points', parseInt(e.target.value) || 1)}
                min="1"
                disabled={loading || success}
                className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-gray-200 disabled:opacity-50"
              />
            </div>

            <button
              type="button"
              onClick={addQuestion}
              disabled={loading || success}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-400 text-gray-900 py-3 rounded-xl font-semibold hover:from-amber-400 hover:to-amber-300 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Add Question to Quiz
            </button>
          </div>

          {/* Questions List */}
          {questions.length > 0 && (
            <div className="bg-gray-700/30 rounded-xl p-6 border-2 border-gray-600">
              <h3 className="text-xl font-bold text-amber-300 mb-4">Questions Added ({questions.length})</h3>
              <div className="space-y-3">
                {questions.map((q, index) => (
                  <div
                    key={index}
                    className="bg-gray-700 rounded-xl p-4 border-2 border-gray-600 flex items-start justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-amber-400">Q{index + 1}.</span>
                        <span className="text-gray-300">{q.question_text}</span>
                      </div>
                      <div className="text-xs text-gray-400 flex gap-4">
                        <span>Type: {q.question_type.replace('_', ' ')}</span>
                        <span>Points: {q.points}</span>
                        <span className="text-green-400">Answer: {q.correct_answer}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="ml-4 p-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 transition-all border border-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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
              disabled={loading || success || questions.length === 0}
              className="flex-1 bg-gradient-to-r from-red-700 to-red-600 text-white py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg"
            >
              {loading ? 'Creating...' : success ? 'Created!' : `Create Quiz (${questions.length} questions)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuizModal;