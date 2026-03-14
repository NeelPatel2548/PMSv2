import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trash2, UserX, UserCheck, Eye, X } from 'lucide-react';
import api from '../../services/api';
import Loader from '../common/Loader';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', branch: '', passingYear: '' });
  
  // Modal state
  const [viewStudent, setViewStudent] = useState(null);

  const fetchStudents = async () => {
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await api.get(`/admin/students?${params}`);
      if (res.data.success) {
        setStudents(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch students', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [filters]);

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const res = await api.put(`/admin/users/${id}/status`, { isActive: !currentStatus });
      if (res.data.success) {
        setStudents(prev => prev.map(s => 
          s.user._id === id ? { ...s, user: { ...s.user, isActive: !currentStatus } } : s
        ));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${name}? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await api.delete(`/admin/users/${id}`);
      if (res.data.success) {
        setStudents(prev => prev.filter(s => s.user._id !== id));
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

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manage Students</h1>
          <p className="text-slate-500 text-sm mt-1">View, suspend, or delete student accounts</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        <select
          value={filters.branch}
          onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
          className="px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 outline-none"
        >
          <option value="">All Branches</option>
          <option value="CSE">CSE</option>
          <option value="IT">IT</option>
          <option value="ECE">ECE</option>
          <option value="ME">ME</option>
          <option value="CE">CE</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                <th className="px-6 py-4 font-medium">Student</th>
                <th className="px-6 py-4 font-medium">Academics</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 flex justify-end font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student) => (
                <tr key={student._id} className={`hover:bg-slate-50/50 transition ${!student.user.isActive ? 'opacity-60' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center">
                        {student.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{student.user.name}</p>
                        <p className="text-xs text-slate-500">{student.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-700">{student.branch || '—'}</p>
                    <p className="text-xs text-slate-500">CGPA: {student.cgpa || '—'} • Enr: {student.enrollmentNo || '—'}</p>
                  </td>
                  <td className="px-6 py-4">
                    {student.user.isActive ? (
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
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(student.user._id, student.user.isActive)}
                        className={`p-2 rounded-lg transition ${student.user.isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`}
                        title={student.user.isActive ? "Suspend User" : "Unsuspend User"}
                      >
                        {student.user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(student.user._id, student.user.name)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
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
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div><p className="text-xs text-slate-500">Name</p><p className="font-medium">{viewStudent.user?.name}</p></div>
                    <div><p className="text-xs text-slate-500">Email</p><p className="font-medium">{viewStudent.user?.email}</p></div>
                    <div><p className="text-xs text-slate-500">Phone</p><p className="font-medium">{viewStudent.phone || '—'}</p></div>
                    <div><p className="text-xs text-slate-500">DOB</p><p className="font-medium">{viewStudent.dob ? new Date(viewStudent.dob).toLocaleDateString() : '—'}</p></div>
                    <div><p className="text-xs text-slate-500">Gender</p><p className="font-medium capitalize">{viewStudent.gender || '—'}</p></div>
                    <div className="col-span-2"><p className="text-xs text-slate-500">Address</p><p className="font-medium">{viewStudent.address || '—'}</p></div>
                  </div>
                </div>

                {/* Academics */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase mb-4">Academic Records</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div><p className="text-xs text-slate-500">Enrollment No</p><p className="font-medium">{viewStudent.enrollmentNo || '—'}</p></div>
                    <div><p className="text-xs text-slate-500">Branch</p><p className="font-medium">{viewStudent.branch || '—'}</p></div>
                    <div><p className="text-xs text-slate-500">Passing Year</p><p className="font-medium">{viewStudent.passingYear || '—'}</p></div>
                    <div><p className="text-xs text-slate-500">Current Sem</p><p className="font-medium">{viewStudent.currentSemester || '—'}</p></div>
                    <div><p className="text-xs text-slate-500">CGPA</p><p className="font-medium text-emerald-600 font-semibold">{viewStudent.cgpa || '—'}</p></div>
                    <div><p className="text-xs text-slate-500">10th %</p><p className="font-medium">{viewStudent.tenthPercentage || '—'}</p></div>
                    <div><p className="text-xs text-slate-500">12th %</p><p className="font-medium">{viewStudent.twelfthPercentage || '—'}</p></div>
                    <div><p className="text-xs text-slate-500">Active Backlogs</p><p className="font-medium text-red-500 font-semibold">{viewStudent.activeBacklogs || 0}</p></div>
                  </div>
                </div>

                {/* Placement */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase mb-4">Placement Info</h3>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-sm">Status: <strong className="capitalize text-slate-800">{viewStudent.placementStatus}</strong></p>
                    {viewStudent.placedIn && <p className="text-sm">Company: <strong className="text-slate-800">{viewStudent.placedIn.name}</strong></p>}
                  </div>
                </div>

                {/* Links */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase mb-4">Links & Resume</h3>
                  <div className="flex flex-wrap gap-4">
                    {viewStudent.linkedin && <a href={viewStudent.linkedin} target="_blank" rel="noreferrer" className="text-sm text-primary-600 hover:underline">LinkedIn</a>}
                    {viewStudent.github && <a href={viewStudent.github} target="_blank" rel="noreferrer" className="text-sm text-primary-600 hover:underline">GitHub</a>}
                    {viewStudent.resumeUrl && <a href={viewStudent.resumeUrl} target="_blank" rel="noreferrer" className="text-sm text-primary-600 hover:underline font-bold">View Resume PDF</a>}
                    {!viewStudent.linkedin && !viewStudent.github && !viewStudent.resumeUrl && <p className="text-sm text-slate-500">No links provided</p>}
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
