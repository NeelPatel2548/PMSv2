import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOTP, loginVerify, user } = useAuth();

  // Read email and type from navigation state
  const email = location.state?.email || '';
  const type = location.state?.type || 'register';
  const purpose = location.state?.purpose || 'verification';

  // Determine initial step
  const getInitialStep = () => {
    if (purpose === 'reset' && !email) return 'email';
    return 'otp';
  };

  const [step, setStep] = useState(getInitialStep());
  const [resetEmail, setResetEmail] = useState(email);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef([]);

  // If no email and not a reset flow, redirect back to register
  useEffect(() => {
    if (!email && purpose !== 'reset') {
      navigate('/register', { replace: true });
    }
  }, [email, purpose, navigate]);

  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (user) {
      if (user.role === 'student') navigate('/student/dashboard', { replace: true });
      else if (user.role === 'company') navigate('/company/dashboard', { replace: true });
      else if (user.role === 'admin') navigate('/admin/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
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
  const activeEmail = email || resetEmail;

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email: resetEmail });
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
    if (loading) return;
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      if (purpose === 'reset') {
        await api.post('/auth/verify-reset-otp', { email: activeEmail, otp: otpString });
        setStep('newPassword');
        setSuccessMsg('OTP verified. Enter your new password.');
      } else if (type === 'login') {
        await loginVerify(activeEmail, otpString);
      } else {
        const res = await verifyOTP(activeEmail, otpString);
        setSuccessMsg(res.message || 'Account created successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
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
      await api.post('/auth/reset-password', { email: activeEmail, newPassword });
      setSuccessMsg('Password reset successfully!');
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    try {
      await api.post('/auth/resend-otp', {
        email: activeEmail,
        purpose: purpose === 'reset' ? 'reset' : type === 'login' ? 'login' : 'verification'
      });
      setSuccessMsg('OTP resent.');
      setError('');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
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

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-bauhaus-white">
      <div className="w-full max-w-md">
        <div className="bg-white border-4 border-bauhaus-black shadow-hard-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            {/* Geometric decoration */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-6 h-6 rounded-full bg-bauhaus-red border-2 border-bauhaus-black" />
              <div className="w-6 h-6 bg-bauhaus-blue border-2 border-bauhaus-black" />
              <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[21px] border-b-bauhaus-yellow" />
            </div>
            <h1 className="text-2xl font-black text-bauhaus-black uppercase tracking-wider">
              {step === 'email' ? 'Forgot Password' : step === 'otp' ? 'Check Your Email' : 'New Password'}
            </h1>
            <p className="text-bauhaus-black/50 mt-2 text-sm font-bold uppercase tracking-wider">
              {step === 'email' ? 'Enter your email to receive a reset OTP'
                : step === 'otp' ? `6-digit code sent to ${activeEmail}`
                : 'Set your new password'}
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-bauhaus-red text-white text-sm border-2 border-bauhaus-black font-bold">{error}</div>
          )}
          {successMsg && (
            <div className="mb-5 p-3 bg-bauhaus-yellow text-bauhaus-black text-sm border-2 border-bauhaus-black font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              {successMsg}
            </div>
          )}

          {step === 'email' && (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-bauhaus-black/60 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-bauhaus-black/30" />
                  <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required
                    className="bauhaus-input pl-11" placeholder="you@example.com" id="forgot-email" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-4 bg-bauhaus-red text-white font-black border-2 border-bauhaus-black shadow-hard-md hover:opacity-90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all uppercase tracking-wider text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? 'Sending...' : 'Send OTP'}{!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-bauhaus-black/60 mb-3 text-center">OTP Code</label>
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
                      className="w-12 h-14 text-center text-xl font-black border-4 border-bauhaus-black focus:border-bauhaus-blue focus:bg-bauhaus-yellow/20 outline-none transition-all"
                      id={`otp-digit-${i}`}
                    />
                  ))}
                </div>
              </div>
              <button type="submit" disabled={loading || otpString.length < 6}
                className="w-full py-4 bg-bauhaus-blue text-white font-black border-2 border-bauhaus-black shadow-hard-md hover:opacity-90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all uppercase tracking-wider text-sm disabled:opacity-50">
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <div className="text-center">
                <button type="button" onClick={handleResend} disabled={countdown > 0}
                  className={`text-xs font-black uppercase tracking-widest transition-colors ${countdown > 0 ? 'text-bauhaus-black/30 cursor-not-allowed' : 'text-bauhaus-blue hover:text-bauhaus-red'}`}>
                  {countdown > 0 ? (
                    <span>Resend in <span className="font-mono tabular-nums text-bauhaus-red">{countdown}s</span></span>
                  ) : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

          {step === 'newPassword' && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-bauhaus-black/60 mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-bauhaus-black/30" />
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6}
                    className="bauhaus-input pl-11" placeholder="Min. 6 characters" id="reset-new-password" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-4 bg-bauhaus-red text-white font-black border-2 border-bauhaus-black shadow-hard-md hover:opacity-90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all uppercase tracking-wider text-sm disabled:opacity-50">
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-bauhaus-black/50 font-bold">
            <Link to="/login" className="text-bauhaus-blue hover:text-bauhaus-red font-black uppercase tracking-wider transition-colors">Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
