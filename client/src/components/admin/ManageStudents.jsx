import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trash2, UserX, UserCheck, Eye, X, AlertCircle, GraduationCap } from 'lucide-react';
import api from '../../services/api';
import Loader from '../common/Loader';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ search: '', branch: '', passingYear: '' });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Modal state
  const [viewStudent, setViewStudent] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.branch) params.set('branch', filters.branch);
      if (filters.passingYear) params.set('passingYear', filters.passingYear);
      params.set('page', page);
      params.set('limit', 10);

      const res = await api.get(`/admin/students?${params}`);
      console.log('[ManageStudents] API response shape:', res.data);

      if (res.data.success) {
        const data = res.data.data;
        // Handle both { results, pagination } and plain array shapes
        setStudents(Array.isArray(data) ? data : (data.results || []));
        if (data.pagination) setPagination(data.pagination);
      } else {
        setError('Failed to load students. Unexpected response format.');
      }
    } catch (err) {
      console.error('[ManageStudents] Fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load students. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [filters.branch, filters.passingYear, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const res = await api.put(`/admin/users/${id}/status`, { isActive: !currentStatus });
      if (res.data.success) {
        setStudents(prev =>
          prev.map(s =>
            s.user?._id === id
              ? { ...s, user: { ...s.user, isActive: !currentStatus } }
              : s
          )
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Permanently delete ${name}? This cannot be undone.`)) return;
    try {
      const res = await api.delete(`/admin/users/${id}`);
      if (res.data.success) {
        setStudents(prev => prev.filter(s => s.user?._id !== id));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete student');
    }
  };

  const handleView = async (id) => {
    try {
      const res = await api.get(`/admin/students/${id}`);
      if (res.data.success) {
        setViewStudent(res.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to fetch student details');
    }
  };

  const inputClass = "w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manage Students</h1>
          <p className="text-slate-500 text-sm mt-1">View, suspend, or delete student accounts</p>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
          <button
            onClick={fetchStudents}
            className="ml-auto text-xs font-semibold underline hover:opacity-80"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-wrap gap-4 items-center">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px] relative flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
            />
          </div>
          <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition">
            Search
          </button>
        </form>
        <select
          value={filters.branch}
          onChange={(e) => { setFilters(prev => ({ ...prev, branch: e.target.value })); setPage(1); }}
          className="px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm transition-all"
        >
          <option value="">All Branches</option>
          <option value="CSE">CSE</option>
          <option value="IT">IT</option>
          <option value="ECE">ECE</option>
          <option value="EE">EE</option>
          <option value="ME">ME</option>
          <option value="CE">CE</option>
        </select>
        <select
          value={filters.passingYear}
          onChange={(e) => { setFilters(prev => ({ ...prev, passingYear: e.target.value })); setPage(1); }}
          className="px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm transition-all"
        >
          <option value="">All Years</option>
          {[2024, 2025, 2026, 2027, 2028].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-sm text-slate-500">Loading students...</p>
            </div>
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
            <GraduationCap className="w-12 h-12 text-slate-200" />
            <p className="text-sm font-medium">No students registered yet</p>
            <p className="text-xs text-slate-300">Students who complete registration will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                  <th className="px-6 py-4 font-medium">Student</th>
                  <th className="px-6 py-4 font-medium">Academics</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => (
                  <tr
                    key={student._id}
                    className={`hover:bg-slate-50 transition-colors ${!student.user?.isActive ? 'opacity-60' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar with profile picture or initials fallback */}
                        <div className="relative w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm overflow-hidden shrink-0">
                          {student.profilePicture?.url ? (
                            <img
                              src={student.profilePicture.url}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <span
                            className="absolute inset-0 flex items-center justify-center"
                            style={{ display: student.profilePicture?.url ? 'none' : 'flex' }}
                          >
                            {student.user?.name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{student.user?.name || '—'}</p>
                          <p className="text-xs text-slate-500">{student.user?.email || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-700">{student.branch || '—'}</p>
                      <p className="text-xs text-slate-500">
                        CGPA: {student.cgpa != null ? student.cgpa : '—'} • Enr: {student.enrollmentNo || '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {student.user?.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                          Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(student._id)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="View Full Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(student.user?._id, student.user?.isActive)}
                          className={`p-2 rounded-lg transition ${student.user?.isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`}
                          title={student.user?.isActive ? 'Suspend User' : 'Unsuspend User'}
                        >
                          {student.user?.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(student.user?._id, student.user?.name)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && !loading && (
        <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-slate-100">
          <p className="text-sm text-slate-500">
            Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex gap-2">
            <button
              disabled={!pagination.hasPrevPage}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium disabled:opacity-40 hover:bg-slate-50 transition"
            >
              Prev
            </button>
            <button
              disabled={!pagination.hasNextPage}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium disabled:opacity-40 hover:bg-slate-50 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* View Student Modal */}
      <AnimatePresence>
        {viewStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between z-10">
                <h2 className="text-xl font-bold text-slate-800">Student Profile</h2>
                <button onClick={() => setViewStudent(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-8">
                {/* Personal */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase mb-4">Personal Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div><p className="text-xs text-slate-500">Name</p><p className="font-medium">{viewStudent.user?.name || '—'}</p></div>
                    <div className="overflow-hidden"><p className="text-xs text-slate-500">Email</p><p className="font-medium break-all">{viewStudent.user?.email || '—'}</p></div>
                    <div><p className="text-xs text-slate-500">Phone</p><p className="font-medium">{viewStudent.phone || '—'}</p></div>
                    <div><p className="text-xs text-slate-500">DOB</p><p className="font-medium">{viewStudent.dob ? new Date(viewStudent.dob).toLocaleDateString() : '—'}</p></div>
                    <div><p className="text-xs text-slate-500">Gender</p><p className="font-medium capitalize">{viewStudent.gender || '—'}</p></div>
                    <div className="sm:col-span-2 md:col-span-1"><p className="text-xs text-slate-500">Address</p><p className="font-medium">{viewStudent.address || '—'}</p></div>
                  </div>
                </div>

                {/* Academic — admin editable */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase">Academic Records</h3>
                    {viewStudent.academicVerified ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Verified</span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Pending</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Enrollment No</p>
                      <input type="text" value={viewStudent.enrollmentNo || ''} onChange={(e) => setViewStudent({ ...viewStudent, enrollmentNo: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Branch</p>
                      <select value={viewStudent.branch || ''} onChange={(e) => setViewStudent({ ...viewStudent, branch: e.target.value })} className={inputClass}>
                        <option value="">Select</option>
                        <option value="CSE">CSE</option>
                        <option value="IT">IT</option>
                        <option value="ECE">ECE</option>
                        <option value="EE">EE</option>
                        <option value="ME">ME</option>
                        <option value="CE">CE</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Passing Year</p>
                      <input type="number" min="2020" max="2030" value={viewStudent.passingYear || ''} onChange={(e) => setViewStudent({ ...viewStudent, passingYear: parseInt(e.target.value) || '' })} className={inputClass} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Current Sem</p>
                      <input type="number" min="1" max="8" value={viewStudent.currentSemester || ''} onChange={(e) => setViewStudent({ ...viewStudent, currentSemester: parseInt(e.target.value) || '' })} className={inputClass} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">CGPA</p>
                      <input type="number" step="0.01" min="0" max="10" value={viewStudent.cgpa ?? ''} onChange={(e) => setViewStudent({ ...viewStudent, cgpa: parseFloat(e.target.value) || '' })} className={inputClass} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">10th %</p>
                      <input type="number" step="0.01" min="0" max="100" value={viewStudent.tenthPercentage ?? ''} onChange={(e) => setViewStudent({ ...viewStudent, tenthPercentage: parseFloat(e.target.value) || '' })} className={inputClass} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">12th %</p>
                      <input type="number" step="0.01" min="0" max="100" value={viewStudent.twelfthPercentage ?? ''} onChange={(e) => setViewStudent({ ...viewStudent, twelfthPercentage: parseFloat(e.target.value) || '' })} className={inputClass} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Active Backlogs</p>
                      <input type="number" min="0" value={viewStudent.activeBacklogs ?? ''} onChange={(e) => setViewStudent({ ...viewStudent, activeBacklogs: parseInt(e.target.value) || 0 })} className={inputClass} />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={async () => {
                        try {
                          const res = await api.put(`/admin/students/${viewStudent._id}/academic`, {
                            enrollmentNo: viewStudent.enrollmentNo,
                            branch: viewStudent.branch,
                            passingYear: viewStudent.passingYear,
                            cgpa: viewStudent.cgpa,
                            tenthPercentage: viewStudent.tenthPercentage,
                            twelfthPercentage: viewStudent.twelfthPercentage,
                            activeBacklogs: viewStudent.activeBacklogs
                          });
                          if (res.data.success) {
                            setViewStudent(res.data.data);
                            fetchStudents();
                            alert('Records updated. Verification has been reset.');
                          }
                        } catch (err) {
                          alert(err.response?.data?.message || 'Failed to save');
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition shadow-sm"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const res = await api.put(`/admin/students/${viewStudent._id}/verify-academic`);
                          if (res.data.success) {
                            setViewStudent(res.data.data);
                            fetchStudents();
                            alert('Academic records verified successfully');
                          }
                        } catch (err) {
                          alert(err.response?.data?.message || 'Failed to verify');
                        }
                      }}
                      disabled={!viewStudent.enrollmentNo && !viewStudent.branch && viewStudent.cgpa == null}
                      className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Verify Records
                    </button>
                  </div>
                </div>

                {/* Placement */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase mb-4">Placement Info</h3>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-sm">
                      Status: <strong className="capitalize text-slate-800">{viewStudent.placementStatus || '—'}</strong>
                    </p>
                    {viewStudent.placedIn && (
                      <p className="text-sm">
                        Company: <strong className="text-slate-800">{viewStudent.placedIn.name}</strong>
                      </p>
                    )}
                  </div>
                </div>

                {/* Links & Resume */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase mb-4">Links & Resume</h3>
                  <div className="flex flex-wrap gap-4">
                    {viewStudent.linkedin && (
                      <a href={viewStudent.linkedin} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 hover:underline">LinkedIn</a>
                    )}
                    {viewStudent.github && (
                      <a href={viewStudent.github} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 hover:underline">GitHub</a>
                    )}
                    {viewStudent.resumeUrl && (
                      <a href={viewStudent.resumeUrl} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 hover:underline font-bold">View Resume PDF</a>
                    )}
                    {!viewStudent.linkedin && !viewStudent.github && !viewStudent.resumeUrl && (
                      <p className="text-sm text-slate-500">No links provided</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageStudents;
