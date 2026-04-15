import { useState, useEffect } from 'react';
import { Briefcase, Users, PlusCircle, TrendingUp, Building2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Loader from '../common/Loader';

const CompanyDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/company/dashboard');
        if (res.data.success) setData(res.data.data);
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    fetchDashboard();
  }, []);

  if (loading) return <Loader />;
  if (!data) return <p className="text-center text-bauhaus-black/50 mt-10 font-bold uppercase tracking-wider">Failed to load dashboard.</p>;

  const { company, stats, recentJobs } = data;

  const statCards = [
    { label: 'Active Jobs', value: stats?.activeJobs || 0, icon: Briefcase, color: 'bg-bauhaus-blue' },
    { label: 'Total Applicants', value: stats?.totalApplicants || 0, icon: Users, color: 'bg-bauhaus-red' },
    { label: 'Selected', value: stats?.selected || 0, icon: TrendingUp, color: 'bg-bauhaus-yellow' },
    { label: 'Pending', value: stats?.pending || 0, icon: Building2, color: 'bg-bauhaus-black' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-bauhaus-black uppercase tracking-wider">Welcome, {company?.name} 🏢</h1>
          <p className="text-bauhaus-black/50 mt-1 font-medium">
            {company?.isApproved ? 'Manage your recruitment drives' : '⏳ Your company is pending approval'}
          </p>
        </div>
        <button onClick={() => navigate('/company/post-job')}
          className="px-6 py-3 bg-bauhaus-red text-white font-black border-2 border-bauhaus-black shadow-hard-sm hover:opacity-90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-sm flex items-center gap-2 uppercase tracking-wider">
          <PlusCircle className="w-4 h-4" /> Post New Job
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white border-4 border-bauhaus-black p-5 shadow-hard-sm hover:-translate-y-0.5 transition-transform">
            <div className={`w-10 h-10 ${card.color} flex items-center justify-center mb-3 border-2 border-bauhaus-black ${card.color === 'bg-bauhaus-yellow' ? 'text-bauhaus-black' : 'text-white'}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-bauhaus-black">{card.value}</p>
            <p className="text-xs font-bold text-bauhaus-black/50 uppercase tracking-wider">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Jobs */}
      <div className="bg-white border-4 border-bauhaus-black p-6 shadow-hard-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-bauhaus-black uppercase tracking-wider">Recent Jobs</h2>
          <Link to="/company/jobs" className="text-sm text-bauhaus-blue hover:text-bauhaus-red font-black uppercase tracking-wider">View All →</Link>
        </div>
        {recentJobs?.length === 0 ? (
          <p className="text-center text-bauhaus-black/40 py-6 font-bold uppercase">No jobs posted yet</p>
        ) : (
          <div className="space-y-3">
            {recentJobs?.map(job => (
              <div key={job._id} className="flex items-center justify-between p-4 border-2 border-bauhaus-black hover:shadow-hard-sm transition-all bg-bauhaus-white">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-bauhaus-black uppercase">{job.title}</h3>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-bauhaus-black/50 font-medium">
                    <span className="capitalize">{job.jobType}</span>
                    {job.package && <span>📦 {job.package}</span>}
                    <span>🎯 {job.openings} opening{job.openings > 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <span className={`px-2.5 py-0.5 text-xs font-black uppercase border-2 border-bauhaus-black ${
                    job.status === 'open' ? 'bg-bauhaus-blue text-white' : 'bg-bauhaus-red text-white'
                  }`}>
                    {job.status === 'open' ? 'Active' : 'Closed'}
                  </span>
                  <Link to={`/company/jobs/${job._id}/applicants`}
                    className="px-3 py-1.5 text-xs font-black text-bauhaus-blue border-2 border-bauhaus-blue hover:bg-bauhaus-blue hover:text-white transition-colors uppercase">
                    Applicants
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDashboard;
