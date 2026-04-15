import { useState, useEffect } from 'react';
import { Search, Trash2, UserX, UserCheck, Eye, X, AlertCircle, GraduationCap, Download } from 'lucide-react';
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

  const inputClass = "bauhaus-input";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-bauhaus-black uppercase tracking-wider">Manage Students</h1>
          <p className="text-bauhaus-black/50 text-sm mt-1 font-medium">View, suspend, or delete student accounts</p>
        </div>
        <button
          onClick={async () => {
            try {
              const params = new URLSearchParams();
              if (filters.branch) params.set('branch', filters.branch);
              if (filters.passingYear) params.set('passingYear', filters.passingYear);
              const res = await api.get(`/admin/students/export/unplaced?${params}`, { responseType: 'blob' });
              const url = window.URL.createObjectURL(new Blob([res.data]));
              const a = document.createElement('a');
              a.href = url;
              a.download = `unplaced_students.csv`;
              document.body.appendChild(a);
              a.click();
              a.remove();
              window.URL.revokeObjectURL(url);
            } catch {
              alert('Failed to export');
            }
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-bauhaus-yellow text-bauhaus-black text-sm font-black border-2 border-bauhaus-black hover:opacity-90 transition whitespace-nowrap uppercase tracking-wider"
          id="export-unplaced-btn"
        >
          <Download className="w-4 h-4" />Export Unplaced
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-bauhaus-red text-white border-2 border-bauhaus-black text-sm font-bold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
          <button onClick={fetchStudents} className="ml-auto text-xs font-black underline hover:opacity-80 uppercase">Retry</button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 border-4 border-bauhaus-black flex flex-wrap gap-4 items-center shadow-hard-sm">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px] relative flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bauhaus-black/30" />
            <input type="text" placeholder="Search by name or email..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-9 pr-4 py-2 border-2 border-bauhaus-black outline-none text-sm font-medium" />
          </div>
          <button type="submit" className="px-4 py-2 bg-bauhaus-blue text-white text-sm font-black border-2 border-bauhaus-black hover:opacity-90 transition uppercase">Search</button>
        </form>
        <select value={filters.branch}
          onChange={(e) => { setFilters(prev => ({ ...prev, branch: e.target.value })); setPage(1); }}
          className="px-4 py-2 border-2 border-bauhaus-black outline-none text-sm font-bold uppercase">
          <option value="">All Branches</option>
          <option value="CSE">CSE</option><option value="IT">IT</option><option value="ECE">ECE</option>
          <option value="EE">EE</option><option value="ME">ME</option><option value="CE">CE</option>
        </select>
        <select value={filters.passingYear}
          onChange={(e) => { setFilters(prev => ({ ...prev, passingYear: e.target.value })); setPage(1); }}
          className="px-4 py-2 border-2 border-bauhaus-black outline-none text-sm font-bold uppercase">
          <option value="">All Years</option>
          {[2024, 2025, 2026, 2027, 2028].map(y => (<option key={y} value={y}>{y}</option>))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border-4 border-bauhaus-black overflow-hidden shadow-hard-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="bauhaus-loader"><div></div><div></div><div></div></div>
              <p className="text-sm text-bauhaus-black/50 font-bold uppercase">Loading students...</p>
            </div>
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-bauhaus-black/40 gap-3">
            <GraduationCap className="w-12 h-12 opacity-30" />
            <p className="text-sm font-black uppercase">No students registered yet</p>
            <p className="text-xs text-bauhaus-black/30 font-medium">Students who complete registration will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bauhaus-black text-white text-xs">
                  <th className="px-6 py-4 font-black uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 font-black uppercase tracking-wider">Academics</th>
                  <th className="px-6 py-4 font-black uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 font-black uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id}
                    className={`border-b-2 border-bauhaus-muted hover:bg-bauhaus-muted/30 transition-colors ${!student.user?.isActive ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 bg-bauhaus-blue text-white font-black flex items-center justify-center text-sm overflow-hidden shrink-0 border-2 border-bauhaus-black">
                          {student.profilePicture?.url ? (
                            <img src={student.profilePicture.url} alt="" className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }} />
                          ) : null}
                          <span className="absolute inset-0 flex items-center justify-center" style={{ display: student.profilePicture?.url ? 'none' : 'flex' }}>
                            {student.user?.name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-bauhaus-black">{student.user?.name || '—'}</p>
                          <p className="text-xs text-bauhaus-black/50 font-medium">{student.user?.email || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-bauhaus-black">{student.branch || '—'}</p>
                      <p className="text-xs text-bauhaus-black/50 font-medium">
                        CGPA: {student.cgpa != null ? student.cgpa : '—'} • Enr: {student.enrollmentNo || '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-black uppercase border-2 border-bauhaus-black ${
                        student.user?.isActive ? 'bg-bauhaus-blue text-white' : 'bg-bauhaus-red text-white'
                      }`}>
                        {student.user?.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleView(student._id)}
                          className="p-2 text-bauhaus-black/40 hover:text-bauhaus-blue hover:bg-bauhaus-blue/10 transition-all border-2 border-transparent hover:border-bauhaus-blue"
                          title="View Full Profile">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleToggleStatus(student.user?._id, student.user?.isActive)}
                          className={`p-2 border-2 border-transparent transition ${student.user?.isActive ? 'text-bauhaus-yellow hover:border-bauhaus-yellow hover:bg-bauhaus-yellow/10' : 'text-bauhaus-blue hover:border-bauhaus-blue hover:bg-bauhaus-blue/10'}`}
                          title={student.user?.isActive ? 'Suspend User' : 'Unsuspend User'}>
                          {student.user?.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleDelete(student.user?._id, student.user?.name)}
                          className="p-2 text-bauhaus-red hover:bg-bauhaus-red/10 border-2 border-transparent hover:border-bauhaus-red transition"
                          title="Delete User">
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
        <div className="flex items-center justify-between bg-white border-4 border-bauhaus-black p-4">
          <p className="text-sm text-bauhaus-black/50 font-bold">
            Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex gap-2">
            <button disabled={!pagination.hasPrevPage} onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 border-2 border-bauhaus-black text-sm font-black disabled:opacity-40 hover:bg-bauhaus-muted transition uppercase">Prev</button>
            <button disabled={!pagination.hasNextPage} onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 border-2 border-bauhaus-black text-sm font-black disabled:opacity-40 hover:bg-bauhaus-muted transition uppercase">Next</button>
          </div>
        </div>
      )}

      {/* View Student Modal */}
      {viewStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bauhaus-black/60">
          <div className="bg-white border-4 border-bauhaus-black shadow-hard-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b-4 border-bauhaus-black p-6 flex items-center justify-between z-10">
              <h2 className="text-xl font-black text-bauhaus-black uppercase tracking-wider">Student Profile</h2>
              <button onClick={() => setViewStudent(null)} className="p-2 text-bauhaus-black/40 hover:bg-bauhaus-muted transition border-2 border-bauhaus-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Personal */}
              <div>
                <h3 className="text-xs font-black text-bauhaus-black/40 tracking-widest uppercase mb-4 border-b-2 border-bauhaus-black pb-2">Personal Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div><p className="text-xs text-bauhaus-black/40 font-bold uppercase">Name</p><p className="font-bold text-bauhaus-black">{viewStudent.user?.name || '—'}</p></div>
                  <div className="overflow-hidden"><p className="text-xs text-bauhaus-black/40 font-bold uppercase">Email</p><p className="font-bold text-bauhaus-black break-all">{viewStudent.user?.email || '—'}</p></div>
                  <div><p className="text-xs text-bauhaus-black/40 font-bold uppercase">Phone</p><p className="font-bold text-bauhaus-black">{viewStudent.phone || '—'}</p></div>
                  <div><p className="text-xs text-bauhaus-black/40 font-bold uppercase">DOB</p><p className="font-bold text-bauhaus-black">{viewStudent.dob ? new Date(viewStudent.dob).toLocaleDateString() : '—'}</p></div>
                  <div><p className="text-xs text-bauhaus-black/40 font-bold uppercase">Gender</p><p className="font-bold text-bauhaus-black capitalize">{viewStudent.gender || '—'}</p></div>
                  <div className="sm:col-span-2 md:col-span-1"><p className="text-xs text-bauhaus-black/40 font-bold uppercase">Address</p><p className="font-bold text-bauhaus-black">{viewStudent.address || '—'}</p></div>
                </div>
              </div>

              {/* Academic */}
              <div>
                <div className="flex items-center gap-3 mb-4 border-b-2 border-bauhaus-black pb-2">
                  <h3 className="text-xs font-black text-bauhaus-black/40 tracking-widest uppercase">Academic Records</h3>
                  <span className={`px-2.5 py-0.5 text-xs font-black uppercase border-2 border-bauhaus-black ${
                    viewStudent.academicVerified ? 'bg-bauhaus-blue text-white' : 'bg-bauhaus-yellow text-bauhaus-black'
                  }`}>
                    {viewStudent.academicVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div><p className="text-xs text-bauhaus-black/40 font-bold uppercase mb-1">Enrollment No</p><input type="text" value={viewStudent.enrollmentNo || ''} onChange={(e) => setViewStudent({ ...viewStudent, enrollmentNo: e.target.value })} className={inputClass} /></div>
                  <div><p className="text-xs text-bauhaus-black/40 font-bold uppercase mb-1">Branch</p>
                    <select value={viewStudent.branch || ''} onChange={(e) => setViewStudent({ ...viewStudent, branch: e.target.value })} className={inputClass}>
                      <option value="">Select</option><option value="CSE">CSE</option><option value="IT">IT</option><option value="ECE">ECE</option><option value="EE">EE</option><option value="ME">ME</option><option value="CE">CE</option><option value="Other">Other</option>
                    </select>
                  </div>
                  <div><p className="text-xs text-bauhaus-black/40 font-bold uppercase mb-1">Passing Year</p><input type="number" min="2020" max="2030" value={viewStudent.passingYear || ''} onChange={(e) => setViewStudent({ ...viewStudent, passingYear: parseInt(e.target.value) || '' })} className={inputClass} /></div>
                  <div><p className="text-xs text-bauhaus-black/40 font-bold uppercase mb-1">Current Sem</p><input type="number" min="1" max="8" value={viewStudent.currentSemester || ''} onChange={(e) => setViewStudent({ ...viewStudent, currentSemester: parseInt(e.target.value) || '' })} className={inputClass} /></div>
                  <div><p className="text-xs text-bauhaus-black/40 font-bold uppercase mb-1">CGPA</p><input type="number" step="0.01" min="0" max="10" value={viewStudent.cgpa ?? ''} onChange={(e) => setViewStudent({ ...viewStudent, cgpa: parseFloat(e.target.value) || '' })} className={inputClass} /></div>
                  <div><p className="text-xs text-bauhaus-black/40 font-bold uppercase mb-1">10th %</p><input type="number" step="0.01" min="0" max="100" value={viewStudent.tenthPercentage ?? ''} onChange={(e) => setViewStudent({ ...viewStudent, tenthPercentage: parseFloat(e.target.value) || '' })} className={inputClass} /></div>
                  <div><p className="text-xs text-bauhaus-black/40 font-bold uppercase mb-1">12th %</p><input type="number" step="0.01" min="0" max="100" value={viewStudent.twelfthPercentage ?? ''} onChange={(e) => setViewStudent({ ...viewStudent, twelfthPercentage: parseFloat(e.target.value) || '' })} className={inputClass} /></div>
                  <div><p className="text-xs text-bauhaus-black/40 font-bold uppercase mb-1">Active Backlogs</p><input type="number" min="0" value={viewStudent.activeBacklogs ?? ''} onChange={(e) => setViewStudent({ ...viewStudent, activeBacklogs: parseInt(e.target.value) || 0 })} className={inputClass} /></div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      try {
                        const res = await api.put(`/admin/students/${viewStudent._id}/academic`, {
                          enrollmentNo: viewStudent.enrollmentNo, branch: viewStudent.branch,
                          passingYear: viewStudent.passingYear, cgpa: viewStudent.cgpa,
                          tenthPercentage: viewStudent.tenthPercentage, twelfthPercentage: viewStudent.twelfthPercentage,
                          activeBacklogs: viewStudent.activeBacklogs
                        });
                        if (res.data.success) { setViewStudent(res.data.data); fetchStudents(); alert('Records updated. Verification has been reset.'); }
                      } catch (err) { alert(err.response?.data?.message || 'Failed to save'); }
                    }}
                    className="px-4 py-2 bg-bauhaus-blue text-white text-sm font-black border-2 border-bauhaus-black hover:opacity-90 transition uppercase">
                    Save Changes
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const res = await api.put(`/admin/students/${viewStudent._id}/verify-academic`);
                        if (res.data.success) { setViewStudent(res.data.data); fetchStudents(); alert('Academic records verified successfully'); }
                      } catch (err) { alert(err.response?.data?.message || 'Failed to verify'); }
                    }}
                    disabled={!viewStudent.enrollmentNo && !viewStudent.branch && viewStudent.cgpa == null}
                    className="px-4 py-2 bg-bauhaus-yellow text-bauhaus-black text-sm font-black border-2 border-bauhaus-black hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed uppercase">
                    Verify Records
                  </button>
                </div>
              </div>

              {/* Placement */}
              <div>
                <h3 className="text-xs font-black text-bauhaus-black/40 tracking-widest uppercase mb-4 border-b-2 border-bauhaus-black pb-2">Placement Info</h3>
                <div className="flex items-center gap-4 p-4 border-2 border-bauhaus-black bg-bauhaus-muted">
                  <p className="text-sm font-bold">
                    Status: <strong className="capitalize text-bauhaus-black">{viewStudent.placementStatus || '—'}</strong>
                  </p>
                  {viewStudent.placedIn && (
                    <p className="text-sm font-bold">
                      Company: <strong className="text-bauhaus-black">{viewStudent.placedIn.name}</strong>
                    </p>
                  )}
                </div>
              </div>

              {/* Links */}
              <div>
                <h3 className="text-xs font-black text-bauhaus-black/40 tracking-widest uppercase mb-4 border-b-2 border-bauhaus-black pb-2">Links & Resume</h3>
                <div className="flex flex-wrap gap-4">
                  {viewStudent.linkedin && <a href={viewStudent.linkedin} target="_blank" rel="noreferrer" className="text-sm text-bauhaus-blue hover:underline font-bold uppercase">LinkedIn</a>}
                  {viewStudent.github && <a href={viewStudent.github} target="_blank" rel="noreferrer" className="text-sm text-bauhaus-blue hover:underline font-bold uppercase">GitHub</a>}
                  {viewStudent.resumeUrl && <a href={viewStudent.resumeUrl} target="_blank" rel="noreferrer" className="text-sm text-bauhaus-red hover:underline font-black uppercase">View Resume PDF</a>}
                  {!viewStudent.linkedin && !viewStudent.github && !viewStudent.resumeUrl && (
                    <p className="text-sm text-bauhaus-black/40 font-medium">No links provided</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStudents;
