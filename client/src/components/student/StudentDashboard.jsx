import { useState, useEffect } from 'react';
import { Briefcase, FileCheck, Clock, Award, XCircle, TrendingUp, ArrowRight, CheckCircle, AlertTriangle, User, BookOpen, Wrench, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import Loader from '../common/Loader';

const getColor = (score) => {
  if (score <= 40) return '#D02020';
  if (score <= 70) return '#F0C020';
  if (score <= 99) return '#1040C0';
  return '#1D9E75';
};

const getStatus = (score) => {
  if (score <= 40) return '';
  if (score <= 70) return '';
  if (score <= 99) return '';
  return '';
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
  if (!data) return <p className="text-center text-bauhaus-black/50 mt-10 font-bold uppercase tracking-wider">Failed to load dashboard.</p>;

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
    { label: 'Total Applied', value: stats.totalApplications, icon: Briefcase, color: 'bg-bauhaus-blue' },
    { label: 'Shortlisted', value: stats.shortlisted, icon: FileCheck, color: 'bg-bauhaus-yellow' },
    { label: 'Interviews', value: stats.interviews, icon: Clock, color: 'bg-bauhaus-red' },
    { label: 'Selected', value: stats.selected, icon: Award, color: 'bg-bauhaus-black' },
    { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'bg-bauhaus-muted' },
  ];

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-bauhaus-black uppercase tracking-wider">Welcome, {student?.user?.name} 👋</h1>
        <p className="text-bauhaus-black/50 mt-1 font-medium">
          {student?.placementStatus === 'placed'
            ? '🎉 Congratulations! You have been placed!'
            : 'Track your placement journey here.'}
        </p>
      </div>

      {/* Profile Completion Banner */}
      {completionScore < 100 && (
        <div className="bg-bauhaus-yellow border-4 border-bauhaus-black p-5 shadow-hard-sm">
          <div className="flex items-start gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-bauhaus-black mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-black text-bauhaus-black uppercase">Complete your profile to apply for jobs</h3>
              <p className="text-sm text-bauhaus-black/60 mt-0.5 font-medium">You must complete all requirements below before applying to placement drives.</p>
            </div>
          </div>
          <Link to="/student/profile"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-bauhaus-black text-white text-sm font-bold uppercase tracking-wider hover:opacity-90 transition border-2 border-bauhaus-black">
            Complete Profile <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map((card, i) => (
          <div key={card.label} className="bg-white border-4 border-bauhaus-black p-5 shadow-hard-sm hover:-translate-y-0.5 transition-transform">
            <div className={`w-10 h-10 ${card.color} flex items-center justify-center mb-3 border-2 border-bauhaus-black ${card.color === 'bg-bauhaus-yellow' || card.color === 'bg-bauhaus-muted' ? 'text-bauhaus-black' : 'text-white'}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-bauhaus-black">{card.value}</p>
            <p className="text-xs font-bold text-bauhaus-black/50 uppercase tracking-wider">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Profile Completion Chart */}
      <div className="bg-white border-4 border-bauhaus-black p-6 shadow-hard-md">
        <h2 className="text-lg font-black text-bauhaus-black mb-5 uppercase tracking-wider">Profile Completion</h2>
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
                  cornerRadius={0}
                  background={{ fill: '#E0E0E0' }}
                  isAnimationActive={true}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black" style={{ color: chartColor }}>{completionScore}%</span>
              <span className="text-xs text-bauhaus-black/40 mt-0.5 font-bold uppercase">{getStatus(completionScore)}</span>
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
                      ? <CheckCircle className="w-4 h-4 text-bauhaus-blue flex-shrink-0" />
                      : <XCircle className="w-4 h-4 text-bauhaus-red flex-shrink-0" />}
                    <section.icon className="w-4 h-4 text-bauhaus-black/40 flex-shrink-0" />
                    <span className={`text-sm font-bold ${isFull ? 'text-bauhaus-black' : 'text-bauhaus-black/50'}`}>{section.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-bauhaus-muted overflow-hidden hidden sm:block border border-bauhaus-black">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${section.max > 0 ? (section.score / section.max) * 100 : 0}%`,
                          backgroundColor: isFull ? '#1040C0' : section.score > 0 ? '#F0C020' : '#D02020'
                        }}
                      />
                    </div>
                    <span className={`text-xs font-black tabular-nums min-w-[52px] text-right ${isFull ? 'text-bauhaus-blue' : 'text-bauhaus-black/40'}`}>
                      {section.score ?? 0} / {section.max ?? 0}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {completionScore < 100 && (
          <div className="mt-5 flex items-center gap-2 p-3 bg-bauhaus-muted border-2 border-bauhaus-black text-sm text-bauhaus-black/60 font-medium">
            <AlertTriangle className="w-4 h-4 text-bauhaus-yellow flex-shrink-0" />
            Complete your profile to unlock job applications.
            <Link to="/student/profile" className="text-bauhaus-blue font-black ml-auto hover:text-bauhaus-red flex items-center gap-1 uppercase text-xs tracking-wider">
              Go to Profile <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>

      {/* Active Jobs */}
      <div className="bg-white border-4 border-bauhaus-black p-6 shadow-hard-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-bauhaus-black uppercase tracking-wider">Active Jobs For You</h2>
          <Link to="/student/jobs" className="text-sm text-bauhaus-blue hover:text-bauhaus-red font-black flex items-center gap-1 uppercase tracking-wider">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {eligibleJobs.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="w-10 h-10 mx-auto mb-2 text-bauhaus-muted" />
            {completionScore < 100 ? (
              <>
                <p className="text-bauhaus-black/40 font-bold">Complete your profile to see matching jobs</p>
                <Link to="/student/profile" className="text-bauhaus-blue text-sm font-black mt-1 inline-block uppercase">Go to Profile →</Link>
              </>
            ) : (
              <p className="text-bauhaus-black/40 font-bold">No eligible jobs available right now. Check back later.</p>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {eligibleJobs.map(job => (
              <div key={job._id} className="p-4 bg-bauhaus-white border-2 border-bauhaus-black hover:shadow-hard-sm transition-all">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-bauhaus-blue font-black uppercase">{job.company?.name}</p>
                  {job.matchLevel === 'strong' && <span className="text-[10px] px-1.5 py-0.5 bg-bauhaus-yellow text-bauhaus-black font-black border border-bauhaus-black">🎯 Match</span>}
                </div>
                <p className="font-bold text-bauhaus-black truncate">{job.title}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-bauhaus-black/50 font-medium">
                  {job.package && <span>📦 {job.package}</span>}
                  <span className="capitalize">{job.jobType}</span>
                </div>
                {job.deadline && (
                  <p className="text-xs text-bauhaus-black/40 mt-1 font-medium">Deadline: {new Date(job.deadline).toLocaleDateString()}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Interviews */}
      <div className="bg-white border-4 border-bauhaus-black p-6 shadow-hard-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-bauhaus-black uppercase tracking-wider">Upcoming Interviews</h2>
          <Link to="/student/interviews" className="text-sm text-bauhaus-blue hover:text-bauhaus-red font-black uppercase tracking-wider">View All</Link>
        </div>
        {upcomingInterviews?.length === 0 ? (
          <p className="text-center text-bauhaus-black/40 py-6 font-bold">No upcoming interviews.</p>
        ) : (
          <div className="space-y-3">
            {upcomingInterviews?.map(int => {
              const d = new Date(int.scheduledAt);
              return (
                <div key={int._id} className="flex items-center gap-4 p-3 bg-bauhaus-white border-2 border-bauhaus-black hover:shadow-hard-sm transition-all">
                  <div className="bg-bauhaus-black min-w-[56px] h-[56px] flex flex-col items-center justify-center text-white flex-shrink-0 border-2 border-bauhaus-black">
                    <span className="text-[10px] uppercase font-black opacity-80">{months[d.getMonth()]}</span>
                    <span className="text-xl font-black leading-tight">{d.getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-bauhaus-black truncate">{int.job?.title}</p>
                    <p className="text-xs text-bauhaus-black/50 truncate font-medium">{int.company?.name} • {int.roundName}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-black text-bauhaus-blue">{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Offers */}
      {offers?.length > 0 && (
        <div className="bg-bauhaus-yellow border-4 border-bauhaus-black p-6 shadow-hard-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-bauhaus-black uppercase tracking-wider">🎉 Your Offers</h2>
            <Link to="/student/applications" className="text-sm text-bauhaus-black/70 hover:text-bauhaus-black font-black uppercase tracking-wider">
              Manage Offers →
            </Link>
          </div>
          <div className="space-y-2">
            {offers.map(offer => {
              const offerBadge = {
                pending: { bg: 'bg-white text-bauhaus-black border-2 border-bauhaus-black', label: '⏳ Pending Response' },
                accepted: { bg: 'bg-bauhaus-blue text-white border-2 border-bauhaus-black', label: '✅ Accepted' },
                declined: { bg: 'bg-bauhaus-red text-white border-2 border-bauhaus-black', label: '❌ Declined' },
              };
              const badge = offerBadge[offer.offerStatus] || offerBadge.pending;
              return (
                <div key={offer._id} className={`p-4 border-2 border-bauhaus-black ${
                  offer.offerStatus === 'accepted' ? 'bg-white' : 'bg-white/60'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-black text-bauhaus-black uppercase">{offer.job?.title || 'Offer'}</p>
                      {offer.offeredPackage && <p className="text-sm text-bauhaus-black/60 mt-0.5 font-medium">📦 Package: {offer.offeredPackage}</p>}
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-black ${badge.bg}`}>
                      {badge.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
