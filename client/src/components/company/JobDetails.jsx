import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, MapPin, DollarSign, Clock, Users, GraduationCap, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import Loader from '../common/Loader';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/company/jobs/${id}`);
        if (res.data.success) {
          setJob(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch job', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  if (loading) return <Loader />;
  if (!job) return <p className="text-center text-slate-500 mt-10">Job not found.</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/company/dashboard')} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            {job.title}
            {job.status === 'open' 
              ? <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">Active</span>
              : <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium">Closed</span>}
          </h1>
          <p className="text-slate-500 mt-1 capitalize text-sm">{job.jobType} • Posted recently</p>
        </div>
        <div className="ml-auto flex gap-3">
          <Link
            to={`/company/jobs/${job._id}/applicants`}
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Manage Applicants ({job.applicationCount || 0})
          </Link>
          <Link
            to={`/company/jobs/${job._id}/edit`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold hover:shadow-lg hover:shadow-primary-500/30 transition text-sm"
          >
            <Edit2 className="w-4 h-4" /> Edit Job
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Col: Details */}
        <div className="md:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Job Description</h2>
            <div className="prose prose-sm max-w-none text-slate-600 whitespace-pre-wrap">
              {job.description}
            </div>
            
            <h3 className="text-sm font-semibold text-slate-800 mt-6 mb-3">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills?.map((skill, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 text-sm font-medium border border-primary-100">
                  {skill}
                </span>
              ))}
            </div>

            <h3 className="text-sm font-semibold text-slate-800 mt-6 mb-3">Eligible Branches</h3>
            <div className="flex flex-wrap gap-2">
              {job.eligibleBranches?.length > 0 ? job.eligibleBranches.map((branch, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium">
                  {branch}
                </span>
              )) : <span className="text-sm text-slate-500">All Branches Eligible</span>}
            </div>
          </motion.div>
        </div>

        {/* Right Col: Highlights */}
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} delay={0.1} className="bg-white rounded-2xl p-6 border border-slate-100 space-y-4">
            <h3 className="font-semibold text-slate-800 mb-2">Job Highlights</h3>
            
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-green-50 text-green-600"><DollarSign className="w-5 h-5" /></div>
              <div>
                <p className="text-sm font-medium text-slate-800">Compensation</p>
                <p className="text-xs text-slate-500">{job.package || 'Not specified'}{job.stipend ? ` (+ ${job.stipend} stipend)` : ''}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600"><MapPin className="w-5 h-5" /></div>
              <div>
                <p className="text-sm font-medium text-slate-800">Location</p>
                <p className="text-xs text-slate-500">{job.location || 'Remote/Not specified'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600"><Clock className="w-5 h-5" /></div>
              <div>
                <p className="text-sm font-medium text-slate-800">Deadline</p>
                <p className="text-xs text-slate-500">{job.deadline ? new Date(job.deadline).toLocaleDateString() : 'No deadline'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600"><Users className="w-5 h-5" /></div>
              <div>
                <p className="text-sm font-medium text-slate-800">Openings</p>
                <p className="text-xs text-slate-500">{job.openings} vacancies</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} delay={0.2} className="bg-white rounded-2xl p-6 border border-slate-100 space-y-4">
            <h3 className="font-semibold text-slate-800 mb-2">Eligibility Criteria</h3>
            
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-slate-50 text-slate-600"><GraduationCap className="w-5 h-5" /></div>
              <div>
                <p className="text-sm font-medium text-slate-800">Minimum CGPA</p>
                <p className="text-xs text-slate-500">{job.minCGPA || 0}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-slate-50 text-slate-600"><CheckCircle className="w-5 h-5" /></div>
              <div>
                <p className="text-sm font-medium text-slate-800">Max Active Backlogs</p>
                <p className="text-xs text-slate-500">{job.maxBacklogs || 0}</p>
              </div>
            </div>

            {job.bondPeriod && (
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-slate-50 text-slate-600"><Clock className="w-5 h-5" /></div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Bond Period</p>
                  <p className="text-xs text-slate-500">{job.bondPeriod}</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
