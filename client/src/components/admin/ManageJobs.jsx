import { useState, useEffect } from 'react';
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
    try { await api.put(`/admin/jobs/${id}`, { status }); fetchJobs(); } catch {}
  };

  const statusColors = {
    open: 'bg-bauhaus-blue text-white',
    closed: 'bg-bauhaus-red text-white',
    draft: 'bg-bauhaus-muted text-bauhaus-black/60'
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-black text-bauhaus-black mb-6 uppercase tracking-wider">Manage Jobs</h1>

      <div className="bg-white border-4 border-bauhaus-black p-4 mb-6 flex flex-wrap gap-3 items-end shadow-hard-sm">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bauhaus-black/30" />
          <input type="text" value={filters.search} onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            placeholder="Search jobs..." className="w-full pl-9 pr-4 py-2 border-2 border-bauhaus-black text-sm outline-none font-medium" />
        </form>
        <select value={filters.status} onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          className="px-3 py-2 border-2 border-bauhaus-black text-sm bg-white font-bold uppercase">
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="draft">Draft</option>
        </select>
        <select value={filters.jobType} onChange={(e) => setFilters(prev => ({ ...prev, jobType: e.target.value }))}
          className="px-3 py-2 border-2 border-bauhaus-black text-sm bg-white font-bold uppercase">
          <option value="">All Types</option>
          <option value="fulltime">Full Time</option>
          <option value="internship">Internship</option>
        </select>
      </div>

      {loading ? <Loader /> : (
        <div className="bg-white border-4 border-bauhaus-black overflow-hidden shadow-hard-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bauhaus-black text-white">
                <tr>
                  <th className="text-left p-3 font-black uppercase tracking-wider text-xs">Job</th>
                  <th className="text-left p-3 font-black uppercase tracking-wider text-xs">Company</th>
                  <th className="text-left p-3 font-black uppercase tracking-wider text-xs">Type</th>
                  <th className="text-left p-3 font-black uppercase tracking-wider text-xs">Package</th>
                  <th className="text-left p-3 font-black uppercase tracking-wider text-xs">Deadline</th>
                  <th className="text-left p-3 font-black uppercase tracking-wider text-xs">Status</th>
                  <th className="text-left p-3 font-black uppercase tracking-wider text-xs">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(j => (
                  <tr key={j._id} className="border-b-2 border-bauhaus-muted hover:bg-bauhaus-muted/30 transition-colors">
                    <td className="p-3 font-bold text-bauhaus-black">{j.title}</td>
                    <td className="p-3 text-bauhaus-black/60 font-medium">{j.company?.name || '—'}</td>
                    <td className="p-3 text-bauhaus-black/60 capitalize font-medium">{j.jobType}</td>
                    <td className="p-3 text-bauhaus-black/60 font-medium">{j.package || '—'}</td>
                    <td className="p-3 text-bauhaus-black/60 font-medium">{j.deadline ? new Date(j.deadline).toLocaleDateString() : '—'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-xs font-black uppercase border-2 border-bauhaus-black ${statusColors[j.status]}`}>{j.status}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {j.status === 'open' && (
                          <button onClick={() => updateJobStatus(j._id, 'closed')}
                            className="px-2 py-1 bg-bauhaus-red text-white text-xs font-black border-2 border-bauhaus-black hover:opacity-80 uppercase">Close</button>
                        )}
                        {j.status === 'closed' && (
                          <button onClick={() => updateJobStatus(j._id, 'open')}
                            className="px-2 py-1 bg-bauhaus-blue text-white text-xs font-black border-2 border-bauhaus-black hover:opacity-80 uppercase">Reopen</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {jobs.length === 0 && <p className="text-center text-bauhaus-black/40 py-8 font-bold uppercase">No jobs found.</p>}
        </div>
      )}
    </div>
  );
};

export default ManageJobs;
