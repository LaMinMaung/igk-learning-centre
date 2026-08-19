import React, { useState, useEffect } from 'react';
import { X, Link as LinkIcon, AlertCircle, CheckCircle, UserMinus } from 'lucide-react';
import pb from '../../../lib/pocketbase';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
}

interface LinkedStudent extends Student {
  linkId: string;
  relationship: string;
}

interface LinkParentModalProps {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

const LinkParentModal: React.FC<LinkParentModalProps> = ({ user, onClose, onSuccess }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [linkedStudents, setLinkedStudents] = useState<LinkedStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [relationship, setRelationship] = useState<'mother' | 'father' | 'guardian'>('mother');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user.id]);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      
      // Fetch all students
      const allStudents = await pb.collection('users').getFullList<Student>({
        filter: 'role = "student"',
        sort: 'name',
        requestKey: null,
      });
      setStudents(allStudents);

      // Fetch linked students
      const links = await pb.collection('parent_student_links').getFullList({
        filter: `parent = "${user.id}"`,
        expand: 'student',
        requestKey: null,
      });

      const linked = links.map((link: any) => ({
        id: link.expand?.student?.id || '',
        name: link.expand?.student?.name || '',
        email: link.expand?.student?.email || '',
        linkId: link.id,
        relationship: link.relationship,
      }));

      setLinkedStudents(linked);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load student data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleLinkStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudent) {
      setError('Please select a student');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await pb.collection('parent_student_links').create({
        parent: user.id,
        student: selectedStudent,
        relationship,
      });

      setSuccess(true);
      setSelectedStudent('');
      setRelationship('mother');
      
      // Refresh linked students
      await fetchData();
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('Error linking student:', err);
      if (err?.message?.includes('duplicate')) {
        setError('This student is already linked to this parent');
      } else {
        setError(err?.message || 'Failed to link student. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkStudent = async (linkId: string) => {
    if (!confirm('Are you sure you want to remove this link?')) {
      return;
    }

    try {
      await pb.collection('parent_student_links').delete(linkId);
      await fetchData();
    } catch (err: any) {
      console.error('Error unlinking student:', err);
      setError('Failed to remove link. Please try again.');
    }
  };

  const availableStudents = students.filter(
    (student) => !linkedStudents.some((linked) => linked.id === student.id)
  );

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border-2 border-gray-600 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-gray-800 to-gray-900 border-b-2 border-gray-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <LinkIcon className="w-6 h-6 text-green-400 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-amber-300">Link Students to Parent</h2>
              <p className="text-sm text-gray-400 mt-1">{user.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
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
                <p className="font-semibold mb-1">Student Linked Successfully!</p>
                <p className="text-sm">The parent can now view this student's progress.</p>
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

          {/* Currently Linked Students */}
          <div>
            <h3 className="text-lg font-bold text-amber-300 mb-4">
              Currently Linked Students ({linkedStudents.length})
            </h3>
            
            {loadingData ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-400">Loading linked students...</p>
              </div>
            ) : linkedStudents.length === 0 ? (
              <div className="bg-gray-700/30 rounded-xl p-6 text-center border-2 border-gray-600">
                <p className="text-gray-400">No students linked yet</p>
                <p className="text-gray-500 text-sm mt-1">Add students using the form below</p>
              </div>
            ) : (
              <div className="space-y-3">
                {linkedStudents.map((student) => (
                  <div
                    key={student.id}
                    className="bg-gray-700 rounded-xl p-4 border-2 border-gray-600 flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center text-white font-bold mr-3">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-200">{student.name}</p>
                        <p className="text-sm text-gray-400">{student.email}</p>
                        <p className="text-xs text-gray-500 mt-1 capitalize">
                          Relationship: {student.relationship}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUnlinkStudent(student.linkId)}
                      className="p-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 transition-all duration-300 border border-red-600"
                      title="Remove Link"
                    >
                      <UserMinus className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Link Form */}
          <div className="border-t-2 border-gray-700 pt-6">
            <h3 className="text-lg font-bold text-amber-300 mb-4">Link New Student</h3>
            
            {availableStudents.length === 0 ? (
              <div className="bg-gray-700/30 rounded-xl p-6 text-center border-2 border-gray-600">
                <p className="text-gray-400">All students are already linked</p>
              </div>
            ) : (
              <form onSubmit={handleLinkStudent} className="space-y-4">
                <div>
                  <label htmlFor="student" className="block text-sm font-bold text-amber-300 mb-2">
                    Select Student <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="student"
                    value={selectedStudent}
                    onChange={(e) => {
                      setSelectedStudent(e.target.value);
                      setError('');
                    }}
                    required
                    disabled={loading || loadingData}
                    className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-gray-200 disabled:opacity-50"
                  >
                    <option value="">Choose a student...</option>
                    {availableStudents.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name} ({student.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="relationship" className="block text-sm font-bold text-amber-300 mb-2">
                    Relationship <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="relationship"
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value as 'mother' | 'father' | 'guardian')}
                    required
                    disabled={loading || loadingData}
                    className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-gray-200 disabled:opacity-50"
                  >
                    <option value="mother">Mother</option>
                    <option value="father">Father</option>
                    <option value="guardian">Guardian</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading || !selectedStudent || loadingData}
                  className="w-full bg-gradient-to-r from-green-700 to-green-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg"
                >
                  {loading ? 'Linking...' : 'Link Student'}
                </button>
              </form>
            )}
          </div>

          {/* Close Button */}
          <div className="border-t-2 border-gray-700 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-gray-700 text-white py-3 rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkParentModal;