import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Briefcase } from 'lucide-react';
import api from '../../services/api';
import Loader from '../common/Loader';

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', jobType: '', search: '' });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.jobType) params.append('jobType', filters.jobType);
      if (filters.search) params.append('search', filters.search);
      const res = await api.get(`/admin/jobs?${params}`);
      if (res.data.success) setJobs(res.data.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchJobs(); }, [filters.status, filters.jobType]);

  const handleSearch = (e) => { e.preventDefault(); fetchJobs(); };

  const updateJobStatus = async (id, status) => {
    try {
      await api.put(`/admin/jobs/${id}`, { status });
      fetchJobs();
    } catch { /* ignore */ }
  };

  const statusColors = { open: 'bg-green-100 text-green-700', closed: 'bg-red-100 text-red-700', draft: 'bg-slate-100 text-slate-600' };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Manage Jobs</h1>
      </motion.div>

      <div className="bg-white rounded-2xl p-4 border border-slate-100 mb-6 flex flex-wrap gap-3 items-end">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={filters.search} onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            placeholder="Search jobs..." className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm outline-none" />
        </form>
        <select value={filters.status} onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white">
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="draft">Draft</option>
        </select>
        <select value={filters.jobType} onChange={(e) => setFilters(prev => ({ ...prev, jobType: e.target.value }))}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white">
          <option value="">All Types</option>
          <option value="fulltime">Full Time</option>
          <option value="internship">Internship</option>
        </select>
      </div>

      {loading ? <Loader /> : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left p-3 font-semibold text-slate-600">Job</th>
                  <th className="text-left p-3 font-semibold text-slate-600">Company</th>
                  <th className="text-left p-3 font-semibold text-slate-600">Type</th>
                  <th className="text-left p-3 font-semibold text-slate-600">Package</th>
                  <th className="text-left p-3 font-semibold text-slate-600">Deadline</th>
                  <th className="text-left p-3 font-semibold text-slate-600">Status</th>
                  <th className="text-left p-3 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(j => (
                  <tr key={j._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-medium text-slate-800">{j.title}</td>
                    <td className="p-3 text-slate-600">{j.company?.name || '—'}</td>
                    <td className="p-3 text-slate-600 capitalize">{j.jobType}</td>
                    <td className="p-3 text-slate-600">{j.package || '—'}</td>
                    <td className="p-3 text-slate-600">{j.deadline ? new Date(j.deadline).toLocaleDateString() : '—'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[j.status]}`}>{j.status}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {j.status === 'open' && (
                          <button onClick={() => updateJobStatus(j._id, 'closed')}
                            className="px-2 py-1 rounded-lg bg-red-100 text-red-600 text-xs hover:bg-red-200">Close</button>
                        )}
                        {j.status === 'closed' && (
                          <button onClick={() => updateJobStatus(j._id, 'open')}
                            className="px-2 py-1 rounded-lg bg-green-100 text-green-600 text-xs hover:bg-green-200">Reopen</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {jobs.length === 0 && <p className="text-center text-slate-400 py-8">No jobs found.</p>}
        </div>
      )}
    </div>
  );
};

export default ManageJobs;
