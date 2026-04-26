import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, ArrowRight, X, Mail, ShieldCheck, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../../services/api';

const Login = () => {
  const { login, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ── Forgot Password Modal State ──
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState('email'); // 'email' | 'verify' | 'result'
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotPassword, setForgotPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotResult, setForgotResult] = useState(null); // { type: 'success' | 'temp', message }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await login(formData.email, formData.password);
      const payload = res?.data;

      // Student/Company login — OTP required
      if (payload?.requiresOTP) {
        navigate('/verify-otp', {
          state: { email: formData.email, type: 'login', purpose: 'login' }
        });
        return;
      }

      // Unverified account edge case
      if (payload?.requiresVerification) {
        navigate('/verify-otp', {
          state: { email: payload.email || formData.email, type: 'register', purpose: 'verification' }
        });
        return;
      }

      // Direct login success (admin or bypass mode) — JWT cookie already set
      await checkAuth();
      const role = payload?.role;

      // Check if user must change password
      if (payload?.mustChangePassword) {
        navigate('/change-password');
        return;
      }

      if (role === 'student') navigate('/student/dashboard');
      else if (role === 'company') navigate('/company/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot Password Handlers ──

  const openForgotModal = () => {
    setShowForgotModal(true);
    setForgotStep('email');
    setForgotEmail('');
    setForgotPassword('');
    setForgotError('');
    setForgotResult(null);
    setShowForgotPassword(false);
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotStep('email');
    setForgotEmail('');
    setForgotPassword('');
    setForgotError('');
    setForgotResult(null);
    setShowForgotPassword(false);
  };

  // Step 1: Check email
  const handleForgotEmailSubmit = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError('');
    try {
      await api.post('/auth/forgot-password-check', { email: forgotEmail });
      setForgotStep('verify');
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to check email');
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 2A: Verify current password
  const handleVerifyPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError('');
    try {
      const res = await api.post('/auth/forgot-password-verify-current', {
        email: forgotEmail,
        currentPassword: forgotPassword
      });
      const data = res.data?.data;

      if (data?.passwordCorrect) {
        setForgotResult({
          type: 'success',
          message: 'Password verified! Your account is still secure. No changes made.'
        });
      } else {
        setForgotResult({
          type: 'temp',
          message: 'A temporary password has been sent to your email. Use it to log in.'
        });
      }
      setForgotStep('result');
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Verification failed');
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 2B: Skip verification, send temp password
  const handleSendTempPassword = async () => {
    setForgotLoading(true);
    setForgotError('');
    try {
      await api.post('/auth/forgot-password-send-temp', { email: forgotEmail });
      setForgotResult({
        type: 'temp',
        message: 'A temporary password has been sent to your email. Use it to log in.'
      });
      setForgotStep('result');
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to send temporary password');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row">
      {/* Left panel — geometric */}
      <div className="hidden lg:flex flex-1 bg-bauhaus-blue items-center justify-center relative overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-bauhaus-red/30 border-4 border-white/20" />
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-bauhaus-yellow/30 border-4 border-white/20" />
        <div className="absolute top-1/3 right-1/4 w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-b-[70px] border-b-white/10" />
        <div className="absolute bottom-10 left-20 w-16 h-16 border-4 border-white/20 rounded-full" />
        <div className="relative z-10 text-center px-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-5 h-5 rounded-full bg-bauhaus-red border-2 border-white/30" />
            <div className="w-5 h-5 bg-bauhaus-yellow border-2 border-white/30" />
            <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[17px] border-b-white/50" />
          </div>
          <h2 className="text-5xl font-black text-white uppercase leading-tight mb-4">Welcome<br />Back</h2>
          <p className="text-white/50 font-medium text-sm uppercase tracking-widest">Sign in to continue your placement journey</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-bauhaus-white">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-4 rounded-full bg-bauhaus-red" />
              <div className="w-4 h-4 bg-bauhaus-blue" />
              <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px] border-b-bauhaus-yellow" />
            </div>
            <h1 className="text-3xl font-black uppercase text-bauhaus-black">Welcome Back</h1>
          </div>

          <h1 className="hidden lg:block text-3xl font-black uppercase text-bauhaus-black mb-2">Sign In</h1>
          <p className="text-bauhaus-black/50 font-medium text-sm uppercase tracking-widest mb-8">Enter your credentials to continue</p>

          {error && (
            <div className="mb-6 p-4 bg-bauhaus-red text-white border-2 border-bauhaus-black font-bold text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-bauhaus-black/60 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="bauhaus-input"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-bauhaus-black/60 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="bauhaus-input pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-bauhaus-black/40 hover:text-bauhaus-black transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-bauhaus-red text-white font-black border-2 border-bauhaus-black shadow-hard-md hover:opacity-90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all uppercase tracking-wider text-sm disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Forgot Password link */}
          <button
            type="button"
            onClick={openForgotModal}
            className="mt-4 w-full text-center text-sm font-bold text-bauhaus-blue hover:text-bauhaus-red transition-colors uppercase tracking-wider cursor-pointer bg-transparent border-none"
          >
            Forgot Password?
          </button>

          <p className="mt-4 text-center text-sm text-bauhaus-black/50 font-medium">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-black text-bauhaus-blue hover:text-bauhaus-red transition-colors uppercase">Register</Link>
          </p>
        </div>
      </div>

      {/* ── Forgot Password Modal ── */}
      {showForgotModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(26, 26, 46, 0.6)' }}
          onClick={(e) => e.target === e.currentTarget && closeForgotModal()}
        >
          <div
            className="relative w-full max-w-md mx-4"
            style={{
              backgroundColor: '#fafaf5',
              border: '4px solid #1a1a2e',
              boxShadow: '8px 8px 0px #1a1a2e',
              animation: 'forgotModalIn 0.2s ease-out'
            }}
          >
            {/* Modal header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ backgroundColor: '#1a1a2e' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#e63946' }} />
                <div className="w-3 h-3" style={{ backgroundColor: '#f4d03f' }} />
                <div className="w-0 h-0" style={{
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderBottom: '10px solid #fafaf5'
                }} />
              </div>
              <button
                onClick={closeForgotModal}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Red accent strip */}
            <div style={{ backgroundColor: '#e63946', height: '4px' }} />

            {/* Modal body */}
            <div className="p-6">

              {/* ── Step 1: Email Input ── */}
              {forgotStep === 'email' && (
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="w-6 h-6" style={{ color: '#1a56db' }} />
                    <h3 className="text-xl font-black uppercase tracking-wide" style={{ color: '#1a1a2e' }}>
                      Forgot Password
                    </h3>
                  </div>
                  <p className="text-sm font-medium mb-6" style={{ color: 'rgba(26,26,46,0.5)' }}>
                    Enter your registered email address to get started.
                  </p>

                  {forgotError && (
                    <div className="mb-4 p-3 text-white font-bold text-sm" style={{
                      backgroundColor: '#e63946',
                      border: '2px solid #1a1a2e'
                    }}>
                      {forgotError}
                    </div>
                  )}

                  <form onSubmit={handleForgotEmailSubmit}>
                    <label className="block text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'rgba(26,26,46,0.6)' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => { setForgotEmail(e.target.value); setForgotError(''); }}
                      required
                      className="bauhaus-input mb-5"
                      placeholder="your@email.com"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full py-3 font-black uppercase tracking-wider text-sm text-white transition-all disabled:opacity-50"
                      style={{
                        backgroundColor: '#e63946',
                        border: '2px solid #1a1a2e',
                        boxShadow: '4px 4px 0px #1a1a2e'
                      }}
                      onMouseDown={(e) => {
                        e.currentTarget.style.transform = 'translate(2px, 2px)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      onMouseUp={(e) => {
                        e.currentTarget.style.transform = '';
                        e.currentTarget.style.boxShadow = '4px 4px 0px #1a1a2e';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = '';
                        e.currentTarget.style.boxShadow = '4px 4px 0px #1a1a2e';
                      }}
                    >
                      {forgotLoading ? 'Checking...' : 'Continue'}
                    </button>
                  </form>
                </div>
              )}

              {/* ── Step 2: Verify Identity ── */}
              {forgotStep === 'verify' && (
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <ShieldCheck className="w-6 h-6" style={{ color: '#1a56db' }} />
                    <h3 className="text-xl font-black uppercase tracking-wide" style={{ color: '#1a1a2e' }}>
                      Verify Your Identity
                    </h3>
                  </div>
                  <p className="text-sm font-medium mb-5" style={{ color: 'rgba(26,26,46,0.5)' }}>
                    Enter your current password to confirm it&apos;s you. You get <strong style={{ color: '#e63946' }}>ONE</strong> attempt.
                  </p>

                  {forgotError && (
                    <div className="mb-4 p-3 text-white font-bold text-sm" style={{
                      backgroundColor: '#e63946',
                      border: '2px solid #1a1a2e'
                    }}>
                      {forgotError}
                    </div>
                  )}

                  <form onSubmit={handleVerifyPassword}>
                    <label className="block text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'rgba(26,26,46,0.6)' }}>
                      Current Password
                    </label>
                    <div className="relative mb-3">
                      <input
                        type={showForgotPassword ? 'text' : 'password'}
                        value={forgotPassword}
                        onChange={(e) => { setForgotPassword(e.target.value); setForgotError(''); }}
                        required
                        className="bauhaus-input pr-12"
                        placeholder="Enter your current password"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(!showForgotPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                        style={{ color: 'rgba(26,26,46,0.4)' }}
                      >
                        {showForgotPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    {/* Warning notice */}
                    <div className="flex items-start gap-2 mb-5 p-3" style={{
                      backgroundColor: '#f4d03f',
                      border: '2px solid #1a1a2e'
                    }}>
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#1a1a2e' }} />
                      <p className="text-xs font-bold" style={{ color: '#1a1a2e' }}>
                        If password is wrong, we&apos;ll email you a temporary password
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full py-3 font-black uppercase tracking-wider text-sm text-white transition-all disabled:opacity-50 mb-3"
                      style={{
                        backgroundColor: '#e63946',
                        border: '2px solid #1a1a2e',
                        boxShadow: '4px 4px 0px #1a1a2e'
                      }}
                      onMouseDown={(e) => {
                        e.currentTarget.style.transform = 'translate(2px, 2px)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      onMouseUp={(e) => {
                        e.currentTarget.style.transform = '';
                        e.currentTarget.style.boxShadow = '4px 4px 0px #1a1a2e';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = '';
                        e.currentTarget.style.boxShadow = '4px 4px 0px #1a1a2e';
                      }}
                    >
                      {forgotLoading ? 'Verifying...' : 'Verify Password'}
                    </button>
                  </form>

                  {/* Secondary: send temp password instead */}
                  <button
                    type="button"
                    onClick={handleSendTempPassword}
                    disabled={forgotLoading}
                    className="w-full py-3 font-black uppercase tracking-wider text-sm transition-all disabled:opacity-50"
                    style={{
                      backgroundColor: '#fafaf5',
                      color: '#1a1a2e',
                      border: '2px solid #1a1a2e',
                      boxShadow: '4px 4px 0px #1a1a2e'
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.transform = 'translate(2px, 2px)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = '';
                      e.currentTarget.style.boxShadow = '4px 4px 0px #1a1a2e';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = '';
                      e.currentTarget.style.boxShadow = '4px 4px 0px #1a1a2e';
                    }}
                  >
                    Send New Password Instead
                  </button>
                </div>
              )}

              {/* ── Step 3: Result Screen ── */}
              {forgotStep === 'result' && forgotResult && (
                <div className="text-center py-4">
                  {forgotResult.type === 'success' ? (
                    <>
                      <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{
                          backgroundColor: '#e8f5e9',
                          border: '3px solid #1a1a2e'
                        }}>
                          <CheckCircle className="w-8 h-8" style={{ color: '#2e7d32' }} />
                        </div>
                      </div>
                      <h3 className="text-xl font-black uppercase tracking-wide mb-3" style={{ color: '#1a1a2e' }}>
                        Password Correct!
                      </h3>
                      <p className="text-sm font-medium mb-6" style={{ color: 'rgba(26,26,46,0.6)' }}>
                        {forgotResult.message}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 flex items-center justify-center" style={{
                          backgroundColor: '#fff3e0',
                          border: '3px solid #1a1a2e'
                        }}>
                          <Mail className="w-8 h-8" style={{ color: '#e65100' }} />
                        </div>
                      </div>
                      <h3 className="text-xl font-black uppercase tracking-wide mb-3" style={{ color: '#1a1a2e' }}>
                        Check Your Email!
                      </h3>
                      <p className="text-sm font-medium mb-2" style={{ color: 'rgba(26,26,46,0.6)' }}>
                        {forgotResult.message}
                      </p>
                      <p className="text-xs font-bold uppercase tracking-wider mb-6" style={{ color: '#e63946' }}>
                        Sent to: {forgotEmail}
                      </p>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={closeForgotModal}
                    className="w-full py-3 font-black uppercase tracking-wider text-sm text-white transition-all"
                    style={{
                      backgroundColor: '#1a1a2e',
                      border: '2px solid #1a1a2e',
                      boxShadow: '4px 4px 0px #e63946'
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.transform = 'translate(2px, 2px)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = '';
                      e.currentTarget.style.boxShadow = '4px 4px 0px #e63946';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = '';
                      e.currentTarget.style.boxShadow = '4px 4px 0px #e63946';
                    }}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal entrance animation */}
      <style>{`
        @keyframes forgotModalIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
