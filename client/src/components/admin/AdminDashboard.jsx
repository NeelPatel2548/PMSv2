import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, Briefcase, TrendingUp, Award, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import Loader from '../common/Loader';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];

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
  if (!data) return <p className="text-center text-slate-500 mt-10">Failed to load dashboard.</p>;

  const { stats, branchWiseStats } = data;

  const statCards = [
    { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Placed', value: stats.placedStudents, icon: Award, color: 'from-emerald-500 to-green-500' },
    { label: 'Companies', value: stats.totalCompanies, icon: Building2, color: 'from-purple-500 to-violet-500' },
    { label: 'Active Jobs', value: stats.activeJobs, icon: Briefcase, color: 'from-amber-500 to-orange-500' },
    { label: 'Applications', value: stats.totalApplications, icon: TrendingUp, color: 'from-cyan-500 to-teal-500' },
    { label: 'Placement %', value: `${stats.placementRate}%`, icon: BarChart3, color: 'from-pink-500 to-rose-500' },
  ];

  const pieData = [
    { name: 'Placed', value: stats.placedStudents },
    { name: 'Unplaced', value: stats.unplacedStudents },
  ];

  const barData = branchWiseStats.filter(b => b.total > 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard 🛡️</h1>
        <p className="text-slate-500 mt-1">Platform-wide placement overview</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-2`}>
              <card.icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-xl font-bold text-slate-800">{card.value}</p>
            <p className="text-xs text-slate-500">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Placement Pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Placement Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Branch Bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Branch-wise Placements</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="branch" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="total" fill="#e2e8f0" name="Total" radius={[4, 4, 0, 0]} />
              <Bar dataKey="placed" fill="#3b82f6" name="Placed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
