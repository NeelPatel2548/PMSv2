import { useState, useEffect } from 'react';
import { Users, Building2, Briefcase, TrendingUp, Award, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import Loader from '../common/Loader';

const COLORS = ['#1A1A1A', '#D02020', '#FFD600', '#2563EB'];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        if (res.data.success) setData(res.data.data);
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <Loader />;
  if (!data) return <p className="text-center text-bauhaus-black/50 mt-10 font-bold uppercase">Failed to load dashboard.</p>;

  const { stats, branchWiseStats } = data;

  const statCards = [
    { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'bg-bauhaus-blue' },
    { label: 'Placed', value: stats.placedStudents, icon: Award, color: 'bg-bauhaus-yellow' },
    { label: 'Companies', value: stats.totalCompanies, icon: Building2, color: 'bg-bauhaus-red' },
    { label: 'Active Jobs', value: stats.activeJobs, icon: Briefcase, color: 'bg-bauhaus-black' },
    { label: 'Applications', value: stats.totalApplications, icon: TrendingUp, color: 'bg-bauhaus-blue' },
    { label: 'Placement %', value: `${stats.placementRate}%`, icon: BarChart3, color: 'bg-bauhaus-red' },
  ];

  const pieData = [
    { name: 'Placed', value: stats.placedStudents },
    { name: 'Unplaced', value: stats.unplacedStudents },
  ];

  const barData = branchWiseStats.filter(b => b.total > 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-bauhaus-black uppercase tracking-wider">Admin Dashboard 🛡️</h1>
        <p className="text-bauhaus-black/50 mt-1 font-medium">Platform-wide placement overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white border-4 border-bauhaus-black p-4 shadow-hard-sm hover:-translate-y-0.5 transition-transform">
            <div className={`w-14 h-14 ${card.color} flex items-center justify-center mb-3 border-2 border-bauhaus-black ${card.color === 'bg-bauhaus-yellow' ? 'text-bauhaus-black' : 'text-white'}`}>
              <card.icon className="w-7 h-7" />
            </div>
            <p className="text-2xl font-black text-bauhaus-black">{card.value}</p>
            <p className="text-xs font-bold text-bauhaus-black/50 uppercase tracking-wider">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Placement Pie */}
        <div className="bg-white border-4 border-bauhaus-black p-6 shadow-hard-sm">
          <h2 className="text-lg font-black text-bauhaus-black mb-4 uppercase tracking-wider border-b-2 border-bauhaus-black pb-2">Placement Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ border: '2px solid #1A1A1A', borderRadius: '0', boxShadow: '3px 3px 0 #1A1A1A', fontSize: '12px', fontWeight: 700 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Branch Bar */}
        <div className="bg-white border-4 border-bauhaus-black p-6 shadow-hard-sm">
          <h2 className="text-lg font-black text-bauhaus-black mb-4 uppercase tracking-wider border-b-2 border-bauhaus-black pb-2">Branch-wise Placements</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
              <XAxis dataKey="branch" tick={{ fontSize: 12, fontWeight: 700 }} />
              <YAxis tick={{ fontSize: 12, fontWeight: 700 }} />
              <Tooltip contentStyle={{ border: '2px solid #1A1A1A', borderRadius: '0', boxShadow: '3px 3px 0 #1A1A1A', fontSize: '12px', fontWeight: 700 }} />
              <Bar dataKey="total" fill="#E5E5E5" name="Total" radius={0} />
              <Bar dataKey="placed" fill="#1A1A1A" name="Placed" radius={0} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
