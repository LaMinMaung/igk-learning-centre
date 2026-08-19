import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/lms/DashboardLayout';
import { GraduationCap, Search, Plus, Filter, Edit, Trash2, Eye } from 'lucide-react';
import pb from '../../../lib/pocketbase';
import CreateQuizModal from '../../../components/lms/admin/CreateQuizModal';

interface Quiz {
  id: string;
  title: string;
  instructions?: string;
  time_limit_minutes?: number;
  passing_score?: number;
  status: 'draft' | 'published';
  created: string;
  expand?: {
    course?: {
      title: string;
      level: string;
    };
    lesson?: {
      title: string;
    };
  };
}

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const records = await pb.collection('quizzes').getFullList<Quiz>({
        sort: '-created',
        expand: 'course,lesson',
        requestKey: null,
      });
      setQuizzes(records);
      setFilteredQuizzes(records);
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    let filtered = [...quizzes];

    if (statusFilter !== 'all') {
      filtered = filtered.filter((quiz) => quiz.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((quiz) =>
        quiz.title.toLowerCase().includes(query) ||
        quiz.expand?.course?.title.toLowerCase().includes(query)
      );
    }

    setFilteredQuizzes(filtered);
  }, [searchQuery, statusFilter, quizzes]);

  const handleQuizCreated = () => {
    setShowCreateModal(false);
    fetchQuizzes();
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-700 text-gray-300 border-gray-600',
      published: 'bg-green-900/30 text-green-400 border-green-600',
    };
    const labels = {
      draft: 'Draft',
      published: 'Published',
    };
    return { color: colors[status as keyof typeof colors], label: labels[status as keyof typeof labels] };
  };

  const stats = {
    total: quizzes.length,
    draft: quizzes.filter((q) => q.status === 'draft').length,
    published: quizzes.filter((q) => q.status === 'published').length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent mb-2">
                Quiz Management
              </h1>
              <p className="text-gray-400">Create and manage quizzes for your courses</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center bg-gradient-to-r from-red-700 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-500 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Quiz
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border-2 border-gray-600">
              <div className="text-2xl font-bold text-amber-400">{stats.total}</div>
              <div className="text-gray-400 text-sm">Total Quizzes</div>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border-2 border-gray-600">
              <div className="text-2xl font-bold text-gray-300">{stats.draft}</div>
              <div className="text-gray-400 text-sm">Draft</div>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border-2 border-gray-600">
              <div className="text-2xl font-bold text-green-400">{stats.published}</div>
              <div className="text-gray-400 text-sm">Published</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border-2 border-gray-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search quizzes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-gray-200"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-gray-200 appearance-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Quizzes List */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border-2 border-gray-600 overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading quizzes...</p>
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">No quizzes found</p>
              <p className="text-gray-500 text-sm">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Create your first quiz to get started'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {filteredQuizzes.map((quiz) => {
                const statusBadge = getStatusBadge(quiz.status);
                
                return (
                  <div
                    key={quiz.id}
                    className="p-6 hover:bg-gray-700/30 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-amber-300">{quiz.title}</h3>
                          <span className={`px-3 py-1 rounded-lg text-xs font-semibold border-2 ${statusBadge.color}`}>
                            {statusBadge.label}
                          </span>
                        </div>

                        <div className="text-gray-400 text-sm mb-3">
                          <span className="font-semibold">Course:</span> {quiz.expand?.course?.title || 'No course assigned'}
                          {quiz.expand?.lesson && (
                            <> • <span className="font-semibold">Lesson:</span> {quiz.expand.lesson.title}</>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm">
                          {quiz.time_limit_minutes && (
                            <div className="text-gray-400">
                              ⏱️ <span className="font-semibold">Time Limit:</span> {quiz.time_limit_minutes} min
                            </div>
                          )}
                          {quiz.passing_score && (
                            <div className="text-gray-400">
                              📊 <span className="font-semibold">Passing Score:</span> {quiz.passing_score}%
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <button
                          className="p-2 bg-blue-900/30 text-blue-400 rounded-lg hover:bg-blue-900/50 transition-all duration-300 border border-blue-600"
                          title="View Quiz"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          className="p-2 bg-amber-900/30 text-amber-400 rounded-lg hover:bg-amber-900/50 transition-all duration-300 border border-amber-600"
                          title="Edit Quiz"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          className="p-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 transition-all duration-300 border border-red-600"
                          title="Delete Quiz"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Quiz Modal */}
      {showCreateModal && (
        <CreateQuizModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleQuizCreated}
        />
      )}
    </DashboardLayout>
  );
};

export default Quizzes;