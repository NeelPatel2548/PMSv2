import { useState, useEffect } from 'react';
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
        if (res.data.success) setJob(res.data.data);
      } catch (err) { console.error('Failed to fetch job', err); }
      finally { setLoading(false); }
    };
    fetchJob();
  }, [id]);

  if (loading) return <Loader />;
  if (!job) return <p className="text-center text-bauhaus-black/50 mt-10 font-bold uppercase">Job not found.</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/company/dashboard')} className="p-2 -ml-2 text-bauhaus-black/40 hover:text-bauhaus-black hover:bg-bauhaus-muted transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-bauhaus-black flex items-center gap-3 uppercase tracking-wider">
            {job.title}
            <span className={`text-xs px-2 py-1 font-black border-2 border-bauhaus-black uppercase ${
              job.status === 'open' ? 'bg-bauhaus-blue text-white' : 'bg-bauhaus-red text-white'
            }`}>{job.status === 'open' ? 'Active' : 'Closed'}</span>
          </h1>
          <p className="text-bauhaus-black/50 mt-1 capitalize text-sm font-medium">{job.jobType} • Posted recently</p>
        </div>
        <div className="ml-auto flex gap-3">
          <Link to={`/company/jobs/${job._id}/applicants`}
            className="px-4 py-2 border-2 border-bauhaus-black text-sm font-black text-bauhaus-black hover:bg-bauhaus-muted transition uppercase">
            Manage Applicants ({job.applicationCount || 0})
          </Link>
          <Link to={`/company/jobs/${job._id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-bauhaus-blue text-white font-black border-2 border-bauhaus-black shadow-hard-sm hover:opacity-90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition text-sm uppercase">
            <Edit2 className="w-4 h-4" /> Edit Job
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border-4 border-bauhaus-black p-6 shadow-hard-sm">
            <h2 className="text-lg font-black text-bauhaus-black mb-4 uppercase tracking-wider border-b-2 border-bauhaus-black pb-2">Job Description</h2>
            <div className="prose prose-sm max-w-none text-bauhaus-black/70 whitespace-pre-wrap font-medium">{job.description}</div>

            <h3 className="text-xs font-black text-bauhaus-black/60 mt-6 mb-3 uppercase tracking-widest">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills?.map((skill, i) => (
                <span key={i} className="px-3 py-1.5 bg-bauhaus-blue/10 text-bauhaus-blue text-sm font-bold border-2 border-bauhaus-blue">{skill}</span>
              ))}
            </div>

            <h3 className="text-xs font-black text-bauhaus-black/60 mt-6 mb-3 uppercase tracking-widest">Eligible Branches</h3>
            <div className="flex flex-wrap gap-2">
              {job.eligibleBranches?.length > 0 ? job.eligibleBranches.map((branch, i) => (
                <span key={i} className="px-3 py-1.5 bg-bauhaus-muted text-bauhaus-black text-sm font-bold border-2 border-bauhaus-black/20">{branch}</span>
              )) : <span className="text-sm text-bauhaus-black/50 font-medium">All Branches Eligible</span>}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border-4 border-bauhaus-black p-6 shadow-hard-sm space-y-4">
            <h3 className="font-black text-bauhaus-black mb-2 uppercase tracking-wider">Job Highlights</h3>
            {[
              { icon: DollarSign, label: 'Compensation', value: `${job.package || 'Not specified'}${job.stipend ? ` (+ ${job.stipend} stipend)` : ''}`, color: 'bg-bauhaus-yellow' },
              { icon: MapPin, label: 'Location', value: job.location || 'Remote/Not specified', color: 'bg-bauhaus-blue' },
              { icon: Clock, label: 'Deadline', value: job.deadline ? new Date(job.deadline).toLocaleDateString() : 'No deadline', color: 'bg-bauhaus-red' },
              { icon: Users, label: 'Openings', value: `${job.openings} vacancies`, color: 'bg-bauhaus-black' },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-3">
                <div className={`p-2 ${item.color} border-2 border-bauhaus-black ${item.color === 'bg-bauhaus-yellow' ? 'text-bauhaus-black' : 'text-white'}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-bauhaus-black">{item.label}</p>
                  <p className="text-xs text-bauhaus-black/50 font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border-4 border-bauhaus-black p-6 shadow-hard-sm space-y-4">
            <h3 className="font-black text-bauhaus-black mb-2 uppercase tracking-wider">Eligibility Criteria</h3>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-bauhaus-muted border-2 border-bauhaus-black text-bauhaus-black"><GraduationCap className="w-5 h-5" /></div>
              <div><p className="text-sm font-black text-bauhaus-black">Minimum CGPA</p><p className="text-xs text-bauhaus-black/50 font-medium">{job.minCGPA || 0}</p></div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-bauhaus-muted border-2 border-bauhaus-black text-bauhaus-black"><CheckCircle className="w-5 h-5" /></div>
              <div><p className="text-sm font-black text-bauhaus-black">Max Active Backlogs</p><p className="text-xs text-bauhaus-black/50 font-medium">{job.maxBacklogs || 0}</p></div>
            </div>
            {job.bondPeriod && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-bauhaus-muted border-2 border-bauhaus-black text-bauhaus-black"><Clock className="w-5 h-5" /></div>
                <div><p className="text-sm font-black text-bauhaus-black">Bond Period</p><p className="text-xs text-bauhaus-black/50 font-medium">{job.bondPeriod}</p></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
