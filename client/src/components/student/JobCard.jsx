import { useState } from 'react';
import { MapPin, Clock, Briefcase, Award, Target, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatTier } from '../common/TierSelector';

const JobCard = ({ job, onApply, applying, studentProfile }) => {
  const [applyError, setApplyError] = useState('');

  const isExpired = job.deadline && new Date(job.deadline) < new Date();
  const isVerified = studentProfile?.academicVerified === true;

  const hasPersonal = studentProfile?.user?.name && studentProfile?.phone && studentProfile?.gender && studentProfile?.dob && studentProfile?.address;
  const hasAcademic = studentProfile?.enrollmentNo && studentProfile?.branch && (studentProfile?.cgpa || studentProfile?.cgpa === 0) && studentProfile?.tenthPercentage && studentProfile?.twelfthPercentage && studentProfile?.passingYear && studentProfile?.currentSemester;
  const hasSkills = studentProfile?.skills?.length > 0;
  const profileComplete = hasPersonal && hasAcademic && hasSkills;

  let buttonText = 'Apply Now';
  let buttonDisabled = applying || isExpired;
  let buttonClass = 'bg-bauhaus-red text-white border-2 border-bauhaus-black shadow-hard-sm hover:opacity-90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none';

  if (isExpired) {
    buttonText = 'Closed';
    buttonClass = 'bg-bauhaus-muted text-bauhaus-black/50 border-2 border-bauhaus-black cursor-not-allowed';
  } else if (applying) {
    buttonText = 'Applying...';
  } else if (!isVerified) {
    buttonText = 'Verification Pending';
    buttonDisabled = true;
    buttonClass = 'bg-bauhaus-yellow text-bauhaus-black border-2 border-bauhaus-black cursor-not-allowed';
  } else if (!profileComplete) {
    buttonText = 'Complete Profile';
    buttonDisabled = true;
    buttonClass = 'bg-bauhaus-muted text-bauhaus-black/50 border-2 border-bauhaus-black cursor-not-allowed';
  }

  const handleApply = async (jobId) => {
    setApplyError('');
    if (!isVerified) {
      setApplyError('Academic verification required. Your records are pending admin approval. You can browse jobs but cannot apply until verified.');
      return;
    }
    if (!profileComplete) {
      return;
    }
    try {
      await onApply(jobId);
    } catch (err) {
      setApplyError(err?.response?.data?.message || 'Failed to apply');
    }
  };

  const matchBadge = job.matchLevel === 'strong' ? (
    <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-black bg-bauhaus-yellow text-bauhaus-black border-2 border-bauhaus-black uppercase">
      <Target className="w-3 h-3" /> Strong Match 🎯
    </span>
  ) : job.matchLevel === 'partial' ? (
    <span className="px-2.5 py-1 text-xs font-black bg-bauhaus-muted text-bauhaus-black border-2 border-bauhaus-black uppercase">
      Partial Match
    </span>
  ) : null;

  const firstLetter = (job.company?.name?.charAt(0) || 'C').toUpperCase();

  return (
    <div className="bg-white border-4 border-bauhaus-black p-5 shadow-hard-md hover:-translate-y-0.5 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-bauhaus-black flex items-center justify-center text-lg font-black text-white overflow-hidden border-2 border-bauhaus-black">
            {job.company?.logo?.url ? (
              <img
                src={job.company.logo.url}
                alt=""
                className="w-full h-full object-contain bg-white p-0.5"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }}
              />
            ) : null}
            <span className="flex items-center justify-center w-full h-full" style={{ display: job.company?.logo?.url ? 'none' : 'flex' }}>
              {firstLetter}
            </span>
          </div>
          <div>
            <h3 className="font-black text-bauhaus-black group-hover:text-bauhaus-blue transition-colors uppercase">{job.title}</h3>
            <p className="text-sm text-bauhaus-black/50 font-medium">{job.company?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {matchBadge}
          {job.company?.tier && (() => {
            const t = formatTier(job.company.tier);
            return (
              <span className={`px-2 py-0.5 text-xs font-black uppercase ${t.classes}`}>
                {t.label}
              </span>
            );
          })()}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3 text-xs text-bauhaus-black/50 font-bold">
        {job.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>}
        <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{job.jobType}</span>
        {job.package && <span className="flex items-center gap-1"><Award className="w-3 h-3" />{job.package}</span>}
        {job.deadline && (
          <span className={`flex items-center gap-1 ${isExpired ? 'text-bauhaus-red' : ''}`}>
            <Clock className="w-3 h-3" />{isExpired ? 'Expired' : `Deadline: ${new Date(job.deadline).toLocaleDateString()}`}
          </span>
        )}
      </div>

      {job.description && <p className="text-sm text-bauhaus-black/50 line-clamp-2 mb-3 font-medium">{job.description}</p>}

      {job.requiredSkills?.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1.5">
            {job.requiredSkills.map((skill, i) => {
              const isMatched = job.matchedSkills?.includes(skill);
              return (
                <span key={i} className={`px-2.5 py-0.5 text-xs font-bold border-2 ${
                  isMatched
                    ? 'bg-bauhaus-blue/10 text-bauhaus-blue border-bauhaus-blue'
                    : 'bg-bauhaus-muted text-bauhaus-black/50 border-bauhaus-black/20'
                }`}>
                  {skill} {isMatched ? '✓' : '✗'}
                </span>
              );
            })}
          </div>
          {job.matchScore !== undefined && job.matchScore > 0 && (
            <p className="text-xs text-bauhaus-black/40 mt-1.5 font-medium">
              {job.matchedSkills?.length} of {job.requiredSkills.length} required skills matched ({job.matchScore}%)
            </p>
          )}
        </div>
      )}

      {applyError && (
        <div className="mb-3 p-3 bg-bauhaus-red text-white text-sm border-2 border-bauhaus-black flex items-start gap-2 font-bold">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p>{applyError}</p>
            <Link to="/student/profile" className="inline-flex items-center gap-1 mt-1 text-bauhaus-yellow font-black text-xs hover:underline uppercase">
              Complete Profile <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-bauhaus-black/40 font-bold">
          {job.openings} opening{job.openings > 1 ? 's' : ''} • Min CGPA: {job.minCGPA || 'None'}
        </span>
        {!profileComplete && !isExpired && isVerified === false ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-bauhaus-yellow font-black" title="Your academic records must be verified by admin before you can apply">
              ⚠️ Verification needed
            </span>
          </div>
        ) : null}
        {!isVerified && !isExpired ? (
          <button
            onClick={() => handleApply(job._id)}
            className={`px-4 py-2 text-sm font-black transition-all uppercase tracking-wider ${buttonClass}`}
          >
            {buttonText}
          </button>
        ) : !profileComplete && isVerified && !isExpired ? (
          <Link to="/student/profile"
            className="px-4 py-2 bg-bauhaus-muted text-bauhaus-black text-sm font-black border-2 border-bauhaus-black hover:bg-bauhaus-yellow transition-colors uppercase tracking-wider">
            Complete Profile to Apply
          </Link>
        ) : (
          <button
            onClick={() => handleApply(job._id)}
            disabled={buttonDisabled}
            className={`px-4 py-2 text-sm font-black transition-all uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed ${buttonClass}`}
          >
            {applying ? 'Applying...' : isExpired ? 'Closed' : 'Apply Now'}
          </button>
        )}
      </div>
    </div>
  );
};

export default JobCard;
