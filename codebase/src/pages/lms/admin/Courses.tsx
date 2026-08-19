import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/lms/DashboardLayout';
import { BookOpen, Search, Plus, Filter, Edit, Trash2, Eye } from 'lucide-react';
import pb from '../../../lib/pocketbase';
import CreateCourseModal from '../../../components/lms/admin/CreateCourseModal';
import EditCourseModal from '../../../components/lms/admin/EditCourseModal';
import DeleteCourseModal from '../../../components/lms/admin/DeleteCourseModal';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  level: 'nursery' | 'primary' | 'secondary' | 'exam_prep';
  status: 'draft' | 'published' | 'archived';
  created_by: string;
  duration_weeks?: number;
  created: string;
  updated: string;
  expand?: {
    created_by?: {
      name: string;
      email: string;
    };
  };
}

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const records = await pb.collection('courses').getFullList<Course>({
        sort: '-created',
        expand: 'created_by',
        requestKey: null,
      });
      setCourses(records);
      setFilteredCourses(records);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    let filtered = [...courses];

    if (levelFilter !== 'all') {
      filtered = filtered.filter((course) => course.level === levelFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((course) => course.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((course) =>
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query)
      );
    }

    setFilteredCourses(filtered);
  }, [searchQuery, levelFilter, statusFilter, courses]);

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setShowEditModal(true);
  };

  const handleDeleteCourse = (course: Course) => {
    setSelectedCourse(course);
    setShowDeleteModal(true);
  };

  const handleCourseCreated = () => {
    setShowCreateModal(false);
    fetchCourses();
  };

  const handleCourseUpdated = () => {
    setShowEditModal(false);
    setSelectedCourse(null);
    fetchCourses();
  };

  const handleCourseDeleted = () => {
    setShowDeleteModal(false);
    setSelectedCourse(null);
    fetchCourses();
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

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-700 text-gray-300 border-gray-600',
      published: 'bg-green-900/30 text-green-400 border-green-600',
      archived: 'bg-amber-900/30 text-amber-400 border-amber-600',
    };
    const labels = {
      draft: 'Draft',
      published: 'Published',
      archived: 'Archived',
    };
    return { color: colors[status as keyof typeof colors], label: labels[status as keyof typeof labels] };
  };

  const stats = {
    total: courses.length,
    nursery: courses.filter((c) => c.level === 'nursery').length,
    primary: courses.filter((c) => c.level === 'primary').length,
    secondary: courses.filter((c) => c.level === 'secondary').length,
    exam_prep: courses.filter((c) => c.level === 'exam_prep').length,
    draft: courses.filter((c) => c.status === 'draft').length,
    published: courses.filter((c) => c.status === 'published').length,
    archived: courses.filter((c) => c.status === 'archived').length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent mb-2">
                Course Management
              </h1>
              <p className="text-gray-400">Create, manage, and organize all educational courses</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center bg-gradient-to-r from-red-700 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-500 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Course
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border-2 border-gray-600">
              <div className="text-2xl font-bold text-amber-400">{stats.total}</div>
              <div className="text-gray-400 text-sm">Total</div>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border-2 border-gray-600">
              <div className="text-2xl font-bold text-green-400">{stats.nursery}</div>
              <div className="text-gray-400 text-sm">Nursery</div>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border-2 border-gray-600">
              <div className="text-2xl font-bold text-blue-400">{stats.primary}</div>
              <div className="text-gray-400 text-sm">Primary</div>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border-2 border-gray-600">
              <div className="text-2xl font-bold text-purple-400">{stats.secondary}</div>
              <div className="text-gray-400 text-sm">Secondary</div>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border-2 border-gray-600">
              <div className="text-2xl font-bold text-red-400">{stats.exam_prep}</div>
              <div className="text-gray-400 text-sm">Exam Prep</div>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border-2 border-gray-600">
              <div className="text-2xl font-bold text-gray-300">{stats.draft}</div>
              <div className="text-gray-400 text-sm">Draft</div>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border-2 border-gray-600">
              <div className="text-2xl font-bold text-green-400">{stats.published}</div>
              <div className="text-gray-400 text-sm">Published</div>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border-2 border-gray-600">
              <div className="text-2xl font-bold text-amber-400">{stats.archived}</div>
              <div className="text-gray-400 text-sm">Archived</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border-2 border-gray-600">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-gray-200"
                />
              </div>

              {/* Level Filter */}
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-gray-200 appearance-none cursor-pointer"
                >
                  <option value="all">All Levels</option>
                  <option value="nursery">Nursery</option>
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                  <option value="exam_prep">Exam Prep</option>
                </select>
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
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border-2 border-gray-600 overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading courses...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">No courses found</p>
              <p className="text-gray-500 text-sm">
                {searchQuery || levelFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Create your first course to get started'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredCourses.map((course) => {
                const levelBadge = getLevelBadge(course.level);
                const statusBadge = getStatusBadge(course.status);
                
                return (
                  <div
                    key={course.id}
                    className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl border-2 border-gray-600 hover:border-amber-400 transition-all duration-300 overflow-hidden group hover:-translate-y-2 hover:shadow-2xl"
                  >
                    {/* Thumbnail */}
                    <div className="aspect-video bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center overflow-hidden">
                      {course.thumbnail ? (
                        <img
                          src={pb.files.getUrl(course, course.thumbnail)}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <BookOpen className="w-16 h-16 text-gray-500" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-amber-300 line-clamp-2 flex-1">
                          {course.title}
                        </h3>
                      </div>

                      <div
                        className="text-gray-400 text-sm mb-4 line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: course.description }}
                      />

                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold border-2 ${levelBadge.color}`}>
                          {levelBadge.label}
                        </span>
                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold border-2 ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                        {course.duration_weeks && (
                          <span className="px-3 py-1 rounded-lg text-xs font-semibold border-2 bg-gray-600 text-gray-300 border-gray-500">
                            {course.duration_weeks} weeks
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-gray-500 mb-4">
                        Created by: {course.expand?.created_by?.name || 'Unknown'}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditCourse(course)}
                          className="flex-1 flex items-center justify-center bg-amber-900/30 text-amber-400 py-2 rounded-lg hover:bg-amber-900/50 transition-all duration-300 border border-amber-600"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course)}
                          className="flex-1 flex items-center justify-center bg-red-900/30 text-red-400 py-2 rounded-lg hover:bg-red-900/50 transition-all duration-300 border border-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Result Summary */}
        {!loading && filteredCourses.length > 0 && (
          <div className="mt-4 text-center text-gray-400">
            Showing {filteredCourses.length} of {courses.length} courses
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateCourseModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCourseCreated}
        />
      )}

      {showEditModal && selectedCourse && (
        <EditCourseModal
          course={selectedCourse}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCourse(null);
          }}
          onSuccess={handleCourseUpdated}
        />
      )}

      {showDeleteModal && selectedCourse && (
        <DeleteCourseModal
          course={selectedCourse}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedCourse(null);
          }}
          onSuccess={handleCourseDeleted}
        />
      )}
    </DashboardLayout>
  );
};

export default Courses;