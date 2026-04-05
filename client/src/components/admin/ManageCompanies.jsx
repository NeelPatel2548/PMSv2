import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, CheckCircle, XCircle, Trash2, UserX, UserCheck, Eye } from 'lucide-react';
import api from '../../services/api';
import Loader from '../common/Loader';

const ManageCompanies = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ isApproved: '', tier: '', search: '' });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.isApproved !== '') params.append('isApproved', filters.isApproved);
      if (filters.tier) params.append('tier', filters.tier);
      if (filters.search) params.append('search', filters.search);
      params.set('page', page);
      params.set('limit', 10);
      const res = await api.get(`/admin/companies?${params}`);
      if (res.data.success) {
        const data = res.data.data;
<<<<<<< HEAD
        setCompanies(data.results || data);
        if (data.pagination) setPagination(data.pagination);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
=======
        setCompanies(Array.isArray(data) ? data : (data.results || []));
        if (data.pagination) setPagination(data.pagination);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
>>>>>>> main
  };

  useEffect(() => { fetchCompanies(); }, [filters.isApproved, filters.tier, page]);

  const handleSearch = (e) => { e.preventDefault(); fetchCompanies(); };

  const toggleApproval = async (id, current) => {
    try {
      await api.put(`/admin/companies/${id}/approve`, { isApproved: !current });
      fetchCompanies();
    } catch {
      // ignore
    }
  };

  const toggleStatus = async (userId, isActive) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { isActive: !isActive });
      fetchCompanies();
    } catch {
      // ignore
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Delete this company and ALL related data (jobs, applications, interviews)?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchCompanies();
    } catch {
      // ignore
    }
  };

  const tierColors = {
    tier1: 'bg-amber-100 text-amber-700',
    tier2: 'bg-blue-100 text-blue-700',
    mass_recruiter: 'bg-green-100 text-green-700'
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Manage Companies</h1>
      </motion.div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-6 flex flex-wrap gap-3 items-end">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px] relative flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search companies..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>
          <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition">
            Search
          </button>
        </form>
        <select
          value={filters.isApproved}
          onChange={(e) => setFilters(prev => ({ ...prev, isApproved: e.target.value }))}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white outline-none"
        >
          <option value="">All</option>
          <option value="true">Approved</option>
          <option value="false">Pending</option>
        </select>
        <select
          value={filters.tier}
          onChange={(e) => setFilters(prev => ({ ...prev, tier: e.target.value }))}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white outline-none"
        >
          <option value="">All Tiers</option>
          <option value="tier1">Tier 1</option>
          <option value="tier2">Tier 2</option>
          <option value="mass_recruiter">Mass Recruiter</option>
        </select>
      </div>

      {loading ? <Loader /> : (
        <div className="grid gap-4">
          {companies.length === 0 && (
            <p className="text-center text-slate-400 py-8">No companies found.</p>
          )}
          {companies.map((c, i) => (
            <motion.div
              key={c._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Company logo with initials fallback */}
                  <div className="relative w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-600 overflow-hidden shrink-0">
                    {c.logo?.url ? (
                      <img
                        src={c.logo.url}
                        alt=""
                        className="w-full h-full object-contain p-1"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <span
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ display: c.logo?.url ? 'none' : 'flex' }}
                    >
                      {c.name?.charAt(0) || 'C'}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-800 truncate">{c.name}</h3>
                    <p className="text-sm text-slate-500 truncate">
                      {c.user?.email} • {c.industry || 'N/A'} • {c.location || 'N/A'}
                    </p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${tierColors[c.tier] || 'bg-slate-100 text-slate-600'}`}>
                        {c.tier?.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.isApproved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {c.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  {/* View Profile */}
                  <button
                    onClick={() => navigate(`/admin/companies/${c._id}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-600 transition"
                    title="View full profile"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Profile
                  </button>

                  {/* Approve/Reject */}
                  <button
                    onClick={() => toggleApproval(c._id, c.isApproved)}
                    className={`p-2 rounded-lg text-xs font-medium transition ${c.isApproved ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                    title={c.isApproved ? 'Revoke approval' : 'Approve company'}
                  >
                    {c.isApproved ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  </button>

                  {/* Suspend/Unsuspend */}
                  <button
                    onClick={() => toggleStatus(c.user?._id, c.user?.isActive)}
                    className={`p-2 rounded-lg transition ${c.user?.isActive ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                    title={c.user?.isActive ? 'Suspend account' : 'Unsuspend account'}
                  >
                    {c.user?.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => deleteUser(c.user?._id)}
                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition"
                    title="Delete company"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

<<<<<<< HEAD
      {/* Pagination Controls */}
      {pagination && (
        <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-slate-100">
=======
      {/* Pagination */}
      {pagination && !loading && (
        <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-slate-100 mt-4">
>>>>>>> main
          <p className="text-sm text-slate-500">
            Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex gap-2">
<<<<<<< HEAD
            <button disabled={!pagination.hasPrevPage} onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium disabled:opacity-40 hover:bg-slate-50 transition">Prev</button>
            <button disabled={!pagination.hasNextPage} onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium disabled:opacity-40 hover:bg-slate-50 transition">Next</button>
=======
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
>>>>>>> main
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCompanies;
