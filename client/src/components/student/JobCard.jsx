import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Briefcase, Award, Target, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatTier } from '../common/TierSelector';

const JobCard = ({ job, onApply, applying, studentProfile }) => {
  const [applyError, setApplyError] = useState('');

  const isExpired = job.deadline && new Date(job.deadline) < new Date();
  const isVerified = studentProfile?.academicVerified === true;

  // Feature 5: Determine button state
  const hasPersonal = studentProfile?.user?.name && studentProfile?.phone && studentProfile?.gender && studentProfile?.dob && studentProfile?.address;
  const hasAcademic = studentProfile?.enrollmentNo && studentProfile?.branch && (studentProfile?.cgpa || studentProfile?.cgpa === 0) && studentProfile?.tenthPercentage && studentProfile?.twelfthPercentage && studentProfile?.passingYear && studentProfile?.currentSemester;
  const hasSkills = studentProfile?.skills?.length > 0;
  const profileComplete = hasPersonal && hasAcademic && hasSkills;

  let buttonText = 'Apply Now';
  let buttonDisabled = applying || isExpired;
  let buttonClass = 'bg-primary-600 text-white hover:bg-primary-700';

  if (isExpired) {
    buttonText = 'Closed';
  } else if (applying) {
    buttonText = 'Applying...';
  } else if (!isVerified) {
    buttonText = 'Verification Pending';
    buttonDisabled = true;
    buttonClass = 'bg-amber-100 text-amber-700 cursor-not-allowed';
  } else if (!profileComplete) {
    buttonText = 'Complete Profile';
    buttonDisabled = true;
    buttonClass = 'bg-slate-100 text-slate-500 cursor-not-allowed';
  }

  const handleApply = async (jobId) => {
    setApplyError('');
    if (!isVerified) {
      setApplyError('Academic verification required. Your records are pending admin approval. You can browse jobs but cannot apply until verified.');
      return;
    }
    if (!profileComplete) {
      return; // navigate handled by Link
    }
    try {
      await onApply(jobId);
    } catch (err) {
      setApplyError(err?.response?.data?.message || 'Failed to apply');
    }
  };

  // Feature 3: Match badge
  const matchBadge = job.matchLevel === 'strong' ? (
    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
      <Target className="w-3 h-3" /> Strong Match 🎯
    </span>
  ) : job.matchLevel === 'partial' ? (
    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
      Partial Match
    </span>
  ) : null;

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
        <div className="flex items-center gap-2">
          {matchBadge}
          {job.company?.tier && (() => {
            const t = formatTier(job.company.tier);
            return (
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${t.classes}`}>
                {t.label}
              </span>
            );
          })()}
        </div>
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

      {/* Feature 3: Skills with match highlighting */}
      {job.requiredSkills?.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1.5">
            {job.requiredSkills.map((skill, i) => {
              const isMatched = job.matchedSkills?.includes(skill);
              return (
                <span key={i} className={`px-2.5 py-0.5 rounded-lg text-xs font-medium border ${
                  isMatched
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}>
                  {skill} {isMatched ? '✓' : '✗'}
                </span>
              );
            })}
          </div>
          {job.matchScore !== undefined && job.matchScore > 0 && (
            <p className="text-xs text-slate-400 mt-1.5">
              {job.matchedSkills?.length} of {job.requiredSkills.length} required skills matched ({job.matchScore}%)
            </p>
          )}
        </div>
      )}

      {/* Apply error message */}
      {applyError && (
        <div className="mb-3 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p>{applyError}</p>
            <Link to="/student/profile" className="inline-flex items-center gap-1 mt-1 text-primary-600 font-medium text-xs hover:text-primary-700">
              Complete Profile <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {job.openings} opening{job.openings > 1 ? 's' : ''} • Min CGPA: {job.minCGPA || 'None'}
        </span>
        {!profileComplete && !isExpired && isVerified === false ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-amber-600" title="Your academic records must be verified by admin before you can apply">
              ⚠️ Verification needed
            </span>
          </div>
        ) : null}
        {!isVerified && !isExpired ? (
          <button
            onClick={() => handleApply(job._id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${buttonClass}`}
          >
            {buttonText}
          </button>
        ) : !profileComplete && isVerified && !isExpired ? (
          <Link to="/student/profile"
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors">
            Complete Profile to Apply
          </Link>
        ) : (
          <button
            onClick={() => handleApply(job._id)}
            disabled={buttonDisabled}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${buttonClass}`}
          >
            {applying ? 'Applying...' : isExpired ? 'Closed' : 'Apply Now'}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default JobCard;
