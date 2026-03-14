import { motion } from 'framer-motion';
import { MapPin, Clock, Briefcase, Award } from 'lucide-react';

const JobCard = ({ job, onApply, applying }) => {
  const tierColors = {
    tier1: 'bg-amber-100 text-amber-700',
    tier2: 'bg-blue-100 text-blue-700',
    mass_recruiter: 'bg-green-100 text-green-700',
  };

  const isExpired = job.deadline && new Date(job.deadline) < new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-lg transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-600 overflow-hidden">
            {job.company?.logo ? (
              <img src={job.company.logo} alt="" className="w-full h-full object-cover" />
            ) : (
              job.company?.name?.charAt(0) || 'C'
            )}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 group-hover:text-primary-600 transition-colors">{job.title}</h3>
            <p className="text-sm text-slate-500">{job.company?.name}</p>
          </div>
        </div>
        {job.company?.tier && (
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${tierColors[job.company.tier] || 'bg-slate-100 text-slate-600'}`}>
            {job.company.tier.replace('_', ' ')}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-3 text-xs text-slate-500">
        {job.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>}
        <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{job.jobType}</span>
        {job.package && <span className="flex items-center gap-1"><Award className="w-3 h-3" />{job.package}</span>}
        {job.deadline && (
          <span className={`flex items-center gap-1 ${isExpired ? 'text-red-500' : ''}`}>
            <Clock className="w-3 h-3" />{isExpired ? 'Expired' : `Deadline: ${new Date(job.deadline).toLocaleDateString()}`}
          </span>
        )}
      </div>

      {job.description && <p className="text-sm text-slate-500 line-clamp-2 mb-3">{job.description}</p>}

      {job.requiredSkills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.requiredSkills.slice(0, 5).map((skill, i) => (
            <span key={i} className="px-2 py-0.5 rounded-lg bg-slate-100 text-xs text-slate-600">{skill}</span>
          ))}
          {job.requiredSkills.length > 5 && <span className="text-xs text-slate-400">+{job.requiredSkills.length - 5}</span>}
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {job.openings} opening{job.openings > 1 ? 's' : ''} • Min CGPA: {job.minCGPA || 'None'}
        </span>
        <button
          onClick={() => onApply(job._id)}
          disabled={applying || isExpired}
          className="px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {applying ? 'Applying...' : isExpired ? 'Closed' : 'Apply Now'}
        </button>
      </div>
    </motion.div>
  );
};

export default JobCard;
