import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, FileCheck, Clock, Award, XCircle, TrendingUp, ArrowRight, CheckCircle, AlertTriangle, User, BookOpen, Wrench, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import Loader from '../common/Loader';

const getColor = (score) => {
  if (score <= 40) return '#E24B4A';
  if (score <= 70) return '#EF9F27';
  if (score <= 99) return '#378ADD';
  return '#1D9E75';
};

const getStatus = (score) => {
  if (score <= 40) return 'Just started';
  if (score <= 70) return 'Almost there';
  if (score <= 99) return 'Looking good!';
  return 'Profile Complete! 🎉';
};

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

  const { student, stats, upcomingInterviews, offers, completionScore = 0, completionBreakdown = {} } = data;

  const chartColor = getColor(completionScore);
  const chartData = [{ name: 'completion', value: completionScore, fill: chartColor }];

  const breakdownSections = [
    { label: 'Personal Info', icon: User, ...completionBreakdown.personal },
    { label: 'Academic Records', icon: BookOpen, ...completionBreakdown.academic },
    { label: 'Skills', icon: Wrench, ...completionBreakdown.skills },
    { label: 'Verification', icon: ShieldCheck, ...completionBreakdown.verified },
    { label: 'Resume & Links', icon: TrendingUp, ...completionBreakdown.extras },
  ];

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

      {/* Profile Completion Banner — only show if incomplete */}
      {completionScore < 100 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200">
          <div className="flex items-start gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-800">Complete your profile to apply for jobs</h3>
              <p className="text-sm text-amber-600 mt-0.5">You must complete all requirements below before applying to placement drives.</p>
            </div>
          </div>
          <Link to="/student/profile"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition">
            Complete Profile <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      )}

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

      {/* ═══════════════ Profile Completion Chart ═══════════════ */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl p-6 border border-slate-100">
        <h2 className="text-lg font-semibold text-slate-800 mb-5">Profile Completion</h2>
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Donut Chart */}
          <div className="relative flex-shrink-0" style={{ width: 180, height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="65%"
                outerRadius="90%"
                data={chartData}
                startAngle={90}
                endAngle={90 - (completionScore / 100) * 360}
                barSize={16}
              >
                <RadialBar
                  dataKey="value"
                  cornerRadius={8}
                  background={{ fill: '#f1f5f9' }}
                  isAnimationActive={true}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold" style={{ color: chartColor }}>{completionScore}%</span>
              <span className="text-xs text-slate-400 mt-0.5">{getStatus(completionScore)}</span>
            </div>
          </div>

          {/* Section Breakdown */}
          <div className="flex-1 w-full space-y-2.5">
            {breakdownSections.map((section) => {
              const isFull = section.score === section.max;
              return (
                <div key={section.label} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {isFull
                      ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                    <section.icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className={`text-sm font-medium ${isFull ? 'text-slate-700' : 'text-slate-500'}`}>{section.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Mini progress bar */}
                    <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden hidden sm:block">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${section.max > 0 ? (section.score / section.max) * 100 : 0}%`,
                          backgroundColor: isFull ? '#1D9E75' : section.score > 0 ? '#378ADD' : '#E24B4A'
                        }}
                      />
                    </div>
                    <span className={`text-xs font-semibold tabular-nums min-w-[52px] text-right ${isFull ? 'text-green-600' : 'text-slate-400'}`}>
                      {section.score ?? 0} / {section.max ?? 0}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tip message */}
        {completionScore < 100 && (
          <div className="mt-5 flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-500">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            Complete your profile to unlock job applications.
            <Link to="/student/profile" className="text-primary-600 font-medium ml-auto hover:text-primary-700 flex items-center gap-1">
              Go to Profile <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </motion.div>

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
            {completionScore < 100 ? (
              <>
                <p className="text-slate-400">Complete your profile to see matching jobs</p>
                <Link to="/student/profile" className="text-primary-600 text-sm font-medium mt-1 inline-block">Go to Profile →</Link>
              </>
            ) : (
              <p className="text-slate-400">No eligible jobs available right now. Check back later.</p>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {eligibleJobs.map(job => (
              <div key={job._id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-primary-600 font-semibold">{job.company?.name}</p>
                  {job.matchLevel === 'strong' && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">🎯 Match</span>}
                </div>
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
