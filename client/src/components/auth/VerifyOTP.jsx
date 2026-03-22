import { useState, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, Lock, ArrowRight, GraduationCap } from 'lucide-react';
import api from '../../services/api';

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialEmail = location.state?.email || '';
  const purpose = location.state?.purpose || 'verification';

  const [step, setStep] = useState(purpose === 'reset' && !initialEmail ? 'email' : 'otp');
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef([]);

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) newOtp[i] = pasted[i] || '';
      setOtp(newOtp);
      const focusIdx = Math.min(pasted.length, 5);
      inputRefs.current[focusIdx]?.focus();
    }
  };

  const otpString = otp.join('');

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
        const res = await api.post('/auth/verify-otp', { email, otp: otpString });
        if (res.data.success) {
          const user = res.data.data;
          window.location.href = `/${user.role}/dashboard`;
        }
      } else if (purpose === 'reset') {
        await api.post('/auth/verify-reset-otp', { email, otp: otpString });
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
    if (countdown > 0) return;
    try {
      await api.post('/auth/resend-otp', { email, purpose: purpose === 'reset' ? 'reset' : 'verification' });
      setSuccessMsg('OTP resent.');
      setError('');
      setCountdown(30);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) { clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend');
    }
  };

  const btnClass = "w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5";
  const inputClass = "w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm";
  const iconClass = "absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400";

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
          <div className="text-center mb-8">
            {/* Mail icon in indigo circle */}
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-4">
              {step === 'newPassword'
                ? <Lock className="w-8 h-8 text-indigo-600" />
                : step === 'otp'
                  ? <Mail className="w-8 h-8 text-indigo-600" />
                  : <ShieldCheck className="w-8 h-8 text-indigo-600" />
              }
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {step === 'email' ? 'Forgot Password' : step === 'otp' ? 'Check Your Email' : 'New Password'}
            </h1>
            <p className="text-slate-500 mt-1.5 text-sm">
              {step === 'email' ? 'Enter your email to receive a reset OTP'
                : step === 'otp' ? `Enter the 6-digit code sent to ${email}`
                : 'Set your new password'}
            </p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100 font-medium">{error}</motion.div>
          )}
          {successMsg && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3 rounded-xl bg-emerald-50 text-emerald-600 text-sm border border-emerald-100 font-medium">{successMsg}</motion.div>
          )}

          {step === 'email' && (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className={iconClass} />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    className={inputClass} placeholder="you@example.com" id="forgot-email" />
                </div>
              </div>
              <button type="submit" disabled={loading} className={btnClass}>
                {loading ? 'Sending...' : 'Send OTP'}{!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3 text-center">OTP Code</label>
                <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => inputRefs.current[i] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:scale-105 outline-none transition-all"
                      id={`otp-digit-${i}`}
                    />
                  ))}
                </div>
              </div>
              <button type="submit" disabled={loading || otpString.length < 6} className={btnClass}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <div className="text-center">
                <button type="button" onClick={handleResend} disabled={countdown > 0}
                  className={`text-sm font-semibold transition-colors ${countdown > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-indigo-600 hover:text-indigo-700'}`}>
                  {countdown > 0 ? (
                    <span>Resend in <span className="font-mono tabular-nums text-indigo-600">{countdown}s</span></span>
                  ) : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

          {step === 'newPassword' && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                <div className="relative">
                  <Lock className={iconClass} />
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6}
                    className={inputClass} placeholder="Min. 6 characters" id="reset-new-password" />
                </div>
              </div>
              <button type="submit" disabled={loading} className={btnClass}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">Back to Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOTP;
