import { useState, useEffect } from 'react';
import { FileText, XCircle, CheckCircle, ThumbsDown, Loader2 } from 'lucide-react';
import api from '../../services/api';
import Loader from '../common/Loader';

const statusColors = {
  applied: 'bg-bauhaus-blue text-white',
  shortlisted: 'bg-bauhaus-yellow text-bauhaus-black',
  interview: 'bg-bauhaus-red text-white',
  selected: 'bg-bauhaus-blue text-white',
  rejected: 'bg-bauhaus-muted text-bauhaus-black/60',
  withdrawn: 'bg-bauhaus-muted text-bauhaus-black/40',
};

const offerStatusColors = {
  pending: 'bg-bauhaus-yellow text-bauhaus-black border-2 border-bauhaus-black',
  accepted: 'bg-bauhaus-blue text-white border-2 border-bauhaus-black',
  declined: 'bg-bauhaus-red text-white border-2 border-bauhaus-black',
};

const timelineSteps = ['applied', 'shortlisted', 'interview', 'selected'];

const getStepState = (currentStatus, stepStatus) => {
  if (currentStatus === 'rejected' || currentStatus === 'withdrawn') {
    const idx = timelineSteps.indexOf(stepStatus);
    const curIdx = Math.max(timelineSteps.indexOf(currentStatus), 0);
    return idx <= curIdx ? 'completed' : 'pending';
  }
  const currentIdx = timelineSteps.indexOf(currentStatus);
  const stepIdx = timelineSteps.indexOf(stepStatus);
  if (stepIdx < currentIdx) return 'completed';
  if (stepIdx === currentIdx) return 'current';
  return 'pending';
};

const ApplicationTracker = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(null);
  const [responding, setResponding] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/student/applications');
        if (res.data.success) setApplications(res.data.data);
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleWithdraw = async (id) => {
    if (!confirm('Withdraw this application?')) return;
    setWithdrawing(id);
    try {
      await api.put(`/student/applications/${id}/withdraw`);
      setApplications(prev => prev.map(a => a._id === id ? { ...a, status: 'withdrawn' } : a));
    } catch { /* ignore */ } finally { setWithdrawing(null); }
  };

  const handleOfferResponse = async () => {
    if (!confirmModal) return;
    const { id, action } = confirmModal;
    setResponding(id);
    setConfirmModal(null);
    try {
      const res = await api.put(`/student/applications/${id}/offer`, { offerStatus: action });
      if (res.data.success) {
        setApplications(prev =>
          prev.map(a => a._id === id ? { ...a, offerStatus: action } : a)
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to respond to offer');
    } finally {
      setResponding(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-bauhaus-black mb-1 uppercase tracking-wider">My Applications</h1>
        <p className="text-bauhaus-black/50 text-sm mb-6 font-medium">Track your job application progress</p>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-16 text-bauhaus-black/40">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-black uppercase">No applications yet</p>
          <p className="text-sm mt-1 font-medium">Browse eligible jobs and start applying</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app, i) => (
            <div
              key={app._id}
              className={`bg-white border-4 p-5 shadow-hard-sm hover:-translate-y-0.5 transition-all ${
                app.status === 'selected' ? 'border-bauhaus-blue' : 'border-bauhaus-black'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-black text-bauhaus-black uppercase">{app.job?.title || 'Job'}</h3>
                  <p className="text-sm text-bauhaus-black/50 font-medium">{app.company?.name || app.job?.company?.name || ''}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={`px-2.5 py-0.5 text-xs font-black uppercase border-2 border-bauhaus-black ${statusColors[app.status] || 'bg-bauhaus-muted'}`}>
                      {app.status}
                    </span>
                    {app.currentRound && <span className="text-xs text-bauhaus-black/40 font-bold">Round: {app.currentRound}</span>}
                    {app.offeredPackage && <span className="text-xs text-bauhaus-blue font-black">📦 Package: {app.offeredPackage}</span>}
                    {app.status === 'selected' && app.offerStatus && (
                      <span className={`px-2.5 py-0.5 text-xs font-black uppercase ${offerStatusColors[app.offerStatus] || offerStatusColors.pending}`}>
                        Offer: {app.offerStatus}
                      </span>
                    )}
                  </div>
                  {app.remarks && <p className="text-xs text-bauhaus-black/40 mt-1 font-medium">{app.remarks}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {app.status === 'selected' && (!app.offerStatus || app.offerStatus === 'pending') && (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setConfirmModal({ id: app._id, action: 'accepted', jobTitle: app.job?.title })}
                        disabled={responding === app._id}
                        className="text-xs font-black text-white bg-bauhaus-blue px-3 py-1.5 border-2 border-bauhaus-black hover:opacity-90 transition-all flex items-center gap-1 disabled:opacity-50 uppercase"
                        id={`accept-offer-${app._id}`}
                      >
                        {responding === app._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        Accept
                      </button>
                      <button
                        onClick={() => setConfirmModal({ id: app._id, action: 'declined', jobTitle: app.job?.title })}
                        disabled={responding === app._id}
                        className="text-xs font-black text-white bg-bauhaus-red px-3 py-1.5 border-2 border-bauhaus-black hover:opacity-90 transition-all flex items-center gap-1 disabled:opacity-50 uppercase"
                        id={`decline-offer-${app._id}`}
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        Decline
                      </button>
                    </div>
                  )}
                  {!['selected', 'rejected', 'withdrawn'].includes(app.status) && (
                    <button
                      onClick={() => handleWithdraw(app._id)}
                      disabled={withdrawing === app._id}
                      className="text-xs text-bauhaus-red hover:bg-bauhaus-red/10 font-black flex items-center gap-1 px-2.5 py-1.5 border-2 border-bauhaus-red transition-all uppercase"
                    >
                      <XCircle className="w-3.5 h-3.5" />{withdrawing === app._id ? 'Withdrawing...' : 'Withdraw'}
                    </button>
                  )}
                </div>
              </div>

              {/* Timeline Stepper */}
              <div className="mt-4 pt-4 border-t-2 border-bauhaus-muted">
                <div className="flex items-center justify-between">
                  {timelineSteps.map((step, idx) => {
                    const state = getStepState(app.status, step);
                    return (
                      <div key={step} className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                          <div className={`w-4 h-4 flex-shrink-0 border-2 border-bauhaus-black ${
                            state === 'completed' ? 'bg-bauhaus-yellow' :
                            state === 'current' ? 'bg-bauhaus-blue' :
                            'bg-white'
                          }`} />
                          <span className={`text-[10px] mt-1.5 font-black capitalize uppercase tracking-wider ${
                            state === 'completed' ? 'text-bauhaus-black' :
                            state === 'current' ? 'text-bauhaus-blue' :
                            'text-bauhaus-black/30'
                          }`}>{step}</span>
                        </div>
                        {idx < timelineSteps.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-1.5 ${
                            getStepState(app.status, timelineSteps[idx + 1]) !== 'pending'
                              ? 'bg-bauhaus-yellow'
                              : 'bg-bauhaus-muted'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <p className="text-xs text-bauhaus-black/30 mt-3 font-bold">Applied: {new Date(app.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bauhaus-black/80">
          <div className="bg-white border-4 border-bauhaus-black shadow-hard-lg w-full max-w-md p-6">
            <h3 className="text-lg font-black text-bauhaus-black mb-2 uppercase">
              {confirmModal.action === 'accepted' ? '✅ Accept Offer' : '❌ Decline Offer'}
            </h3>
            <p className="text-sm text-bauhaus-black/70 mb-1 font-medium">
              {confirmModal.action === 'accepted'
                ? `Are you sure you want to accept the offer for "${confirmModal.jobTitle}"?`
                : `Are you sure you want to decline the offer for "${confirmModal.jobTitle}"?`}
            </p>
            <p className="text-xs text-bauhaus-black/40 mb-6 font-medium">
              {confirmModal.action === 'accepted'
                ? 'You will be marked as placed. You can only hold one accepted offer at a time.'
                : 'Your placement status will be reset if this was your only accepted offer.'}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 bg-white border-2 border-bauhaus-black text-bauhaus-black text-sm font-black hover:bg-bauhaus-muted transition uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={handleOfferResponse}
                className={`px-4 py-2 text-white text-sm font-black border-2 border-bauhaus-black shadow-hard-sm hover:opacity-90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition uppercase tracking-wider ${
                  confirmModal.action === 'accepted' ? 'bg-bauhaus-blue' : 'bg-bauhaus-red'
                }`}
              >
                {confirmModal.action === 'accepted' ? 'Accept' : 'Decline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationTracker;
