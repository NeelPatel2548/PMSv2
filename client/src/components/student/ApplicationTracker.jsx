import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, XCircle, CheckCircle, ThumbsDown, Loader2 } from 'lucide-react';
import api from '../../services/api';
import Loader from '../common/Loader';

const statusColors = {
  applied: 'bg-blue-100 text-blue-700',
  shortlisted: 'bg-amber-100 text-amber-700',
  interview: 'bg-purple-100 text-purple-700',
  selected: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-slate-100 text-slate-500',
};

const offerStatusColors = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  declined: 'bg-red-50 text-red-600 border-red-200',
};

// Timeline steps in order
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
  const [responding, setResponding] = useState(null); // tracks which app is being accepted/declined
  const [confirmModal, setConfirmModal] = useState(null); // { id, action: 'accepted'|'declined', jobTitle }

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
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">My Applications</h1>
        <p className="text-slate-500 text-sm mb-6">Track your job application progress</p>
      </motion.div>

      {applications.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">No applications yet</p>
          <p className="text-sm mt-1">Browse eligible jobs and start applying</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app, i) => (
            <motion.div
              key={app._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition-shadow ${
                app.status === 'selected' ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">{app.job?.title || 'Job'}</h3>
                  <p className="text-sm text-slate-500">{app.company?.name || app.job?.company?.name || ''}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[app.status] || 'bg-slate-100'}`}>
                      {app.status}
                    </span>
                    {app.currentRound && <span className="text-xs text-slate-400">Round: {app.currentRound}</span>}
                    {app.offeredPackage && <span className="text-xs text-green-600 font-medium">📦 Package: {app.offeredPackage}</span>}
                    {/* Show offer status badge when selected */}
                    {app.status === 'selected' && app.offerStatus && (
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${offerStatusColors[app.offerStatus] || offerStatusColors.pending}`}>
                        Offer: {app.offerStatus}
                      </span>
                    )}
                  </div>
                  {app.remarks && <p className="text-xs text-slate-400 mt-1">{app.remarks}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {/* Offer Accept/Decline buttons — only for selected + pending */}
                  {app.status === 'selected' && (!app.offerStatus || app.offerStatus === 'pending') && (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setConfirmModal({ id: app._id, action: 'accepted', jobTitle: app.job?.title })}
                        disabled={responding === app._id}
                        className="text-xs font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 disabled:opacity-50"
                        id={`accept-offer-${app._id}`}
                      >
                        {responding === app._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        Accept
                      </button>
                      <button
                        onClick={() => setConfirmModal({ id: app._id, action: 'declined', jobTitle: app.job?.title })}
                        disabled={responding === app._id}
                        className="text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 disabled:opacity-50"
                        id={`decline-offer-${app._id}`}
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        Decline
                      </button>
                    </div>
                  )}
                  {/* Withdraw button — only for non-final statuses */}
                  {!['selected', 'rejected', 'withdrawn'].includes(app.status) && (
                    <button
                      onClick={() => handleWithdraw(app._id)}
                      disabled={withdrawing === app._id}
                      className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 font-medium flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" />{withdrawing === app._id ? 'Withdrawing...' : 'Withdraw'}
                    </button>
                  )}
                </div>
              </div>

              {/* Timeline Stepper */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  {timelineSteps.map((step, idx) => {
                    const state = getStepState(app.status, step);
                    return (
                      <div key={step} className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                            state === 'completed' ? 'bg-emerald-500' :
                            state === 'current' ? 'bg-indigo-500 ring-4 ring-indigo-100' :
                            'bg-slate-300'
                          }`} />
                          <span className={`text-[10px] mt-1.5 font-medium capitalize ${
                            state === 'completed' ? 'text-emerald-600' :
                            state === 'current' ? 'text-indigo-600' :
                            'text-slate-400'
                          }`}>{step}</span>
                        </div>
                        {idx < timelineSteps.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-1.5 rounded-full ${
                            getStepState(app.status, timelineSteps[idx + 1]) !== 'pending'
                              ? 'bg-emerald-300'
                              : 'bg-slate-200'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <p className="text-xs text-slate-300 mt-3">Applied: {new Date(app.createdAt).toLocaleDateString()}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
          >
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              {confirmModal.action === 'accepted' ? '✅ Accept Offer' : '❌ Decline Offer'}
            </h3>
            <p className="text-sm text-slate-600 mb-1">
              {confirmModal.action === 'accepted'
                ? `Are you sure you want to accept the offer for "${confirmModal.jobTitle}"?`
                : `Are you sure you want to decline the offer for "${confirmModal.jobTitle}"?`}
            </p>
            <p className="text-xs text-slate-400 mb-6">
              {confirmModal.action === 'accepted'
                ? 'You will be marked as placed. You can only hold one accepted offer at a time.'
                : 'Your placement status will be reset if this was your only accepted offer.'}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleOfferResponse}
                className={`px-4 py-2 rounded-xl text-white text-sm font-semibold transition shadow-sm ${
                  confirmModal.action === 'accepted'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {confirmModal.action === 'accepted' ? 'Accept' : 'Decline'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ApplicationTracker;
