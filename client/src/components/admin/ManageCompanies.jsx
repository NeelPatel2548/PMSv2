import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, XCircle, Trash2, UserX, UserCheck } from 'lucide-react';
import api from '../../services/api';
import Loader from '../common/Loader';

const ManageCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ isApproved: '', tier: '', search: '' });

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.isApproved !== '') params.append('isApproved', filters.isApproved);
      if (filters.tier) params.append('tier', filters.tier);
      if (filters.search) params.append('search', filters.search);
      const res = await api.get(`/admin/companies?${params}`);
      if (res.data.success) setCompanies(res.data.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchCompanies(); }, [filters.isApproved, filters.tier]);

  const handleSearch = (e) => { e.preventDefault(); fetchCompanies(); };

  const toggleApproval = async (id, current) => {
    try {
      await api.put(`/admin/companies/${id}/approve`, { isApproved: !current });
      fetchCompanies();
    } catch { /* ignore */ }
  };

  const toggleStatus = async (userId, isActive) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { isActive: !isActive });
      fetchCompanies();
    } catch { /* ignore */ }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Delete this company and ALL related data (jobs, applications, interviews)?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchCompanies();
    } catch { /* ignore */ }
  };

  const tierColors = { tier1: 'bg-amber-100 text-amber-700', tier2: 'bg-blue-100 text-blue-700', mass_recruiter: 'bg-green-100 text-green-700' };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Manage Companies</h1>
      </motion.div>

      <div className="bg-white rounded-2xl p-4 border border-slate-100 mb-6 flex flex-wrap gap-3 items-end">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={filters.search} onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            placeholder="Search companies..." className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm outline-none" />
        </form>
        <select value={filters.isApproved} onChange={(e) => setFilters(prev => ({ ...prev, isApproved: e.target.value }))}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white">
          <option value="">All</option>
          <option value="true">Approved</option>
          <option value="false">Pending</option>
        </select>
        <select value={filters.tier} onChange={(e) => setFilters(prev => ({ ...prev, tier: e.target.value }))}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white">
          <option value="">All Tiers</option>
          <option value="tier1">Tier 1</option>
          <option value="tier2">Tier 2</option>
          <option value="mass_recruiter">Mass Recruiter</option>
        </select>
      </div>

      {loading ? <Loader /> : (
        <div className="grid gap-4">
          {companies.length === 0 && <p className="text-center text-slate-400 py-8">No companies found.</p>}
          {companies.map((c, i) => (
            <motion.div key={c._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-600">
                    {c.name?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{c.name}</h3>
                    <p className="text-sm text-slate-500">{c.user?.email} • {c.industry || 'N/A'} • {c.location || 'N/A'}</p>
                    <div className="flex gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${tierColors[c.tier] || 'bg-slate-100'}`}>{c.tier?.replace('_', ' ')}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.isApproved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {c.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleApproval(c._id, c.isApproved)}
                    className={`p-2 rounded-lg text-xs font-medium ${c.isApproved ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}>
                    {c.isApproved ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  </button>
                  <button onClick={() => toggleStatus(c.user?._id, c.user?.isActive)}
                    className={`p-2 rounded-lg ${c.user?.isActive ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                    {c.user?.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  </button>
                  <button onClick={() => deleteUser(c.user?._id)} className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageCompanies;
