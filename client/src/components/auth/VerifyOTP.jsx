import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, Lock, ArrowRight } from 'lucide-react';
import api from '../../services/api';

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialEmail = location.state?.email || '';
  const purpose = location.state?.purpose || 'verification';

  const [step, setStep] = useState(purpose === 'reset' && !initialEmail ? 'email' : 'otp');
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setStep('otp');
      setSuccessMsg('OTP sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      if (purpose === 'verification') {
        const res = await api.post('/auth/verify-otp', { email, otp });
        if (res.data.success) {
          const user = res.data.data;
          window.location.href = `/${user.role}/dashboard`;
        }
      } else if (purpose === 'reset') {
        await api.post('/auth/verify-reset-otp', { email, otp });
        setStep('newPassword');
        setSuccessMsg('OTP verified. Enter your new password.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { email, newPassword });
      setSuccessMsg('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await api.post('/auth/resend-otp', { email, purpose: purpose === 'reset' ? 'reset' : 'verification' });
      setSuccessMsg('OTP resent.');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">
              {step === 'email' ? 'Forgot Password' : step === 'otp' ? 'Enter OTP' : 'New Password'}
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              {step === 'email' ? 'Enter your email to receive a reset OTP'
                : step === 'otp' ? `Enter the 6-digit code sent to ${email}`
                : 'Set your new password'}
            </p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">{error}</motion.div>
          )}
          {successMsg && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl bg-green-50 text-green-600 text-sm border border-green-100">{successMsg}</motion.div>
          )}

          {step === 'email' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition text-sm"
                    placeholder="you@example.com" id="forgot-email" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold hover:from-violet-600 hover:to-purple-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? 'Sending...' : 'Send OTP'}{!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">OTP Code</label>
                <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength={6}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition text-center text-2xl font-bold tracking-[0.5em]"
                  placeholder="000000" id="verify-otp-input" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold hover:from-violet-600 hover:to-purple-700 transition-all disabled:opacity-60">
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button type="button" onClick={handleResend}
                className="w-full py-2 text-sm text-primary-600 hover:text-primary-700 font-medium">
                Resend OTP
              </button>
            </form>
          )}

          {step === 'newPassword' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition text-sm"
                    placeholder="Min. 6 characters" id="reset-new-password" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold hover:from-violet-600 hover:to-purple-700 transition-all disabled:opacity-60">
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">Back to Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOTP;
