import { useState, useEffect } from 'react';
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
        setCompanies(Array.isArray(data) ? data : (data.results || []));
        if (data.pagination) setPagination(data.pagination);
      }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchCompanies(); }, [filters.isApproved, filters.tier, page]);

  const handleSearch = (e) => { e.preventDefault(); fetchCompanies(); };

  const toggleApproval = async (id, current) => {
    try { await api.put(`/admin/companies/${id}/approve`, { isApproved: !current }); fetchCompanies(); } catch {}
  };

  const toggleStatus = async (userId, isActive) => {
    try { await api.put(`/admin/users/${userId}/status`, { isActive: !isActive }); fetchCompanies(); } catch {}
  };

  const deleteUser = async (userId) => {
    if (!confirm('Delete this company and ALL related data (jobs, applications, interviews)?')) return;
    try { await api.delete(`/admin/users/${userId}`); fetchCompanies(); } catch {}
  };

  const tierColors = {
    tier1: 'bg-bauhaus-yellow text-bauhaus-black',
    tier2: 'bg-bauhaus-blue text-white',
    mass_recruiter: 'bg-bauhaus-red text-white'
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-black text-bauhaus-black mb-6 uppercase tracking-wider">Manage Companies</h1>

      {/* Filters */}
      <div className="bg-white border-4 border-bauhaus-black p-4 shadow-hard-sm mb-6 flex flex-wrap gap-3 items-end">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px] relative flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bauhaus-black/30" />
            <input type="text" value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search companies..."
              className="w-full pl-9 pr-4 py-2 border-2 border-bauhaus-black text-sm outline-none font-medium" />
          </div>
          <button type="submit" className="px-4 py-2 bg-bauhaus-blue text-white text-sm font-black border-2 border-bauhaus-black hover:opacity-90 transition uppercase">
            Search
          </button>
        </form>
        <select value={filters.isApproved} onChange={(e) => setFilters(prev => ({ ...prev, isApproved: e.target.value }))}
          className="px-3 py-2 border-2 border-bauhaus-black text-sm bg-white font-bold uppercase">
          <option value="">All</option>
          <option value="true">Approved</option>
          <option value="false">Pending</option>
        </select>
        <select value={filters.tier} onChange={(e) => setFilters(prev => ({ ...prev, tier: e.target.value }))}
          className="px-3 py-2 border-2 border-bauhaus-black text-sm bg-white font-bold uppercase">
          <option value="">All Tiers</option>
          <option value="tier1">Tier 1</option>
          <option value="tier2">Tier 2</option>
          <option value="mass_recruiter">Mass Recruiter</option>
        </select>
      </div>

      {loading ? <Loader /> : (
        <div className="grid gap-4">
          {companies.length === 0 && (
            <p className="text-center text-bauhaus-black/40 py-8 font-bold uppercase">No companies found.</p>
          )}
          {companies.map((c) => (
            <div key={c._id} className="bg-white border-4 border-bauhaus-black p-5 shadow-hard-sm hover:-translate-y-0.5 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Company logo */}
                  <div className="relative w-12 h-12 bg-bauhaus-muted flex items-center justify-center text-lg font-black text-bauhaus-black/60 overflow-hidden shrink-0 border-2 border-bauhaus-black">
                    {c.logo?.url ? (
                      <img src={c.logo.url} alt="" className="w-full h-full object-contain p-1"
                        onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }} />
                    ) : null}
                    <span className="absolute inset-0 flex items-center justify-center" style={{ display: c.logo?.url ? 'none' : 'flex' }}>
                      {c.name?.charAt(0) || 'C'}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-black text-bauhaus-black truncate uppercase">{c.name}</h3>
                    <p className="text-sm text-bauhaus-black/50 truncate font-medium">
                      {c.user?.email} • {c.industry || 'N/A'} • {c.location || 'N/A'}
                    </p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <span className={`px-2 py-0.5 text-xs font-black uppercase border-2 border-bauhaus-black ${tierColors[c.tier] || 'bg-bauhaus-muted text-bauhaus-black/60'}`}>
                        {c.tier?.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-black uppercase border-2 border-bauhaus-black ${c.isApproved ? 'bg-bauhaus-blue text-white' : 'bg-bauhaus-yellow text-bauhaus-black'}`}>
                        {c.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  <button onClick={() => navigate(`/admin/companies/${c._id}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-bauhaus-black text-bauhaus-black text-xs font-black hover:bg-bauhaus-muted transition uppercase"
                    title="View full profile">
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                  <button onClick={() => toggleApproval(c._id, c.isApproved)}
                    className={`p-2 border-2 border-bauhaus-black text-xs font-black transition ${c.isApproved ? 'bg-bauhaus-red text-white hover:opacity-80' : 'bg-bauhaus-blue text-white hover:opacity-80'}`}
                    title={c.isApproved ? 'Revoke approval' : 'Approve company'}>
                    {c.isApproved ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  </button>
                  <button onClick={() => toggleStatus(c.user?._id, c.user?.isActive)}
                    className={`p-2 border-2 border-bauhaus-black transition ${c.user?.isActive ? 'bg-bauhaus-yellow text-bauhaus-black hover:opacity-80' : 'bg-bauhaus-blue text-white hover:opacity-80'}`}
                    title={c.user?.isActive ? 'Suspend account' : 'Unsuspend account'}>
                    {c.user?.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  </button>
                  <button onClick={() => deleteUser(c.user?._id)}
                    className="p-2 bg-bauhaus-red text-white border-2 border-bauhaus-black hover:opacity-80 transition"
                    title="Delete company">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && !loading && (
        <div className="flex items-center justify-between bg-white border-4 border-bauhaus-black p-4 mt-4">
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
    </div>
  );
};

export default ManageCompanies;
