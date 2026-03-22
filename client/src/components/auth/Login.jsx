import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, GraduationCap, CheckCircle } from 'lucide-react';
import api from '../../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('credentials');
  const [formData, setFormData] = useState({ email: '', password: '', otp: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });

      if (res.data.data?.requiresVerification) {
        navigate('/verify-otp', { state: { email: formData.email, purpose: 'verification' } });
      } else if (res.data.data?.requiresOTP) {
        setStep('otp');
      } else if (res.data.success && res.data.data?.role) {
        window.location.href = `/${res.data.data.role}/dashboard`;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login/verify', {
        email: formData.email,
        otp: formData.otp
      });

      if (res.data.success) {
        const user = res.data.data;
        window.location.href = `/${user.role}/dashboard`;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await api.post('/auth/resend-otp', { email: formData.email, purpose: 'login' });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

  const inputClass = "w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm bg-white";
  const iconClass = "absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400";

  const featureBullets = [
    'Smart job matching by CGPA & skills',
    'Real-time application tracking',
    'Interview scheduling & notifications',
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[480px] bg-slate-900 relative overflow-hidden flex-col justify-center px-14">
        <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-25 bg-indigo-600 -top-32 -right-32" />
        <div className="absolute w-80 h-80 rounded-full blur-3xl opacity-20 bg-purple-600 -bottom-20 -left-20" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">PMS</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white leading-tight mb-4">
            Welcome back to your
            <span className="block bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">placement journey</span>
          </h2>
          <p className="text-slate-400 leading-relaxed mb-8">Sign in to track your applications, discover new opportunities, and manage your placement profile.</p>

          {/* Feature bullets */}
          <div className="space-y-3">
            {featureBullets.map((text, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-sm text-slate-300">{text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-slate-50">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-slate-900">
                {step === 'credentials' ? 'Sign In' : 'Verify OTP'}
              </h1>
              <p className="text-slate-500 mt-1.5 text-sm">
                {step === 'credentials'
                  ? 'Enter your credentials to continue'
                  : `Enter the OTP sent to ${formData.email}`}
              </p>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100 font-medium"
              >{error}</motion.div>
            )}

            {step === 'credentials' ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className={iconClass} />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required
                      className={inputClass} placeholder="you@example.com" id="login-email" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock className={iconClass} />
                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password}
                      onChange={handleChange} required className={`${inputClass} !pr-12`} placeholder="••••••••" id="login-password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <Link to="/verify-otp" state={{ purpose: 'reset' }} className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold">
                    Forgot password?
                  </Link>
                </div>

                <button type="submit" disabled={loading} id="login-submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5">
                  {loading ? 'Signing in...' : 'Sign In'}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOTPVerify} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">OTP Code</label>
                  <input type="text" name="otp" value={formData.otp} onChange={handleChange} required maxLength={6}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-center text-2xl font-bold tracking-[0.5em]"
                    placeholder="000000" id="login-otp" />
                </div>

                <button type="submit" disabled={loading} id="login-otp-submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/25">
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>

                <button type="button" onClick={handleResendOTP}
                  className="w-full py-2 text-sm text-indigo-600 hover:text-indigo-700 font-semibold">
                  Resend OTP
                </button>
              </form>
            )}

            <p className="mt-6 text-center text-sm text-slate-500">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold">Register</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
