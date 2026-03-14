import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, FileCheck, Clock, Award, XCircle, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Loader from '../common/Loader';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [eligibleJobs, setEligibleJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [dashRes, jobsRes] = await Promise.all([
          api.get('/student/dashboard'),
          api.get('/student/jobs')
        ]);
        if (dashRes.data.success) setData(dashRes.data.data);
        if (jobsRes.data.success) setEligibleJobs(jobsRes.data.data.slice(0, 5));
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  if (loading) return <Loader />;
  if (!data) return <p className="text-center text-slate-500 mt-10">Failed to load dashboard.</p>;

  const { student, stats, upcomingInterviews, offers } = data;

  const statCards = [
    { label: 'Total Applied', value: stats.totalApplications, icon: Briefcase, color: 'from-blue-500 to-blue-600' },
    { label: 'Shortlisted', value: stats.shortlisted, icon: FileCheck, color: 'from-amber-500 to-orange-500' },
    { label: 'Interviews', value: stats.interviews, icon: Clock, color: 'from-purple-500 to-violet-500' },
    { label: 'Selected', value: stats.selected, icon: Award, color: 'from-emerald-500 to-green-500' },
    { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'from-red-400 to-red-500' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800">Welcome, {student?.user?.name} 👋</h1>
        <p className="text-slate-500 mt-1">
          {student?.placementStatus === 'placed'
            ? '🎉 Congratulations! You have been placed!'
            : 'Track your placement journey here.'}
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{card.value}</p>
            <p className="text-sm text-slate-500">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Active Jobs For You */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="bg-white rounded-2xl p-6 border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Active Jobs For You</h2>
          <Link to="/student/jobs" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {eligibleJobs.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-slate-400">Complete your profile to see matching jobs</p>
            <Link to="/student/profile" className="text-primary-600 text-sm font-medium mt-1 inline-block">Go to Profile →</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {eligibleJobs.map(job => (
              <div key={job._id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:shadow-sm transition-shadow">
                <p className="text-xs text-primary-600 font-semibold mb-1">{job.company?.name}</p>
                <p className="font-medium text-slate-800 truncate">{job.title}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                  {job.package && <span>📦 {job.package}</span>}
                  <span className="capitalize">{job.jobType}</span>
                </div>
                {job.deadline && (
                  <p className="text-xs text-slate-400 mt-1">Deadline: {new Date(job.deadline).toLocaleDateString()}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Upcoming Interviews */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Upcoming Interviews</h2>
          <Link to="/student/interviews" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View All</Link>
        </div>
        {upcomingInterviews?.length === 0 ? (
          <p className="text-center text-slate-400 py-6">No upcoming interviews.</p>
        ) : (
          <div className="space-y-3">
            {upcomingInterviews?.map(int => (
              <div key={int._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <div>
                  <p className="font-medium text-slate-700">{int.job?.title}</p>
                  <p className="text-xs text-slate-400">{int.company?.name} • {int.roundName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary-600">{new Date(int.scheduledAt).toLocaleDateString()}</p>
                  <p className="text-xs text-slate-400">{new Date(int.scheduledAt).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Offers */}
      {offers?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6 border border-green-100">
          <h2 className="text-lg font-semibold text-green-800 mb-4">🎉 Your Offers</h2>
          <div className="space-y-2">
            {offers.map(offer => (
              <div key={offer._id} className="p-3 rounded-xl bg-white/60 border border-green-100">
                <p className="font-medium text-green-800">{offer.job?.title || 'Offer'}</p>
                {offer.offeredPackage && <p className="text-sm text-green-600">Package: {offer.offeredPackage}</p>}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StudentDashboard;
