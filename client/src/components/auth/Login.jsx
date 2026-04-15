import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

const Login = () => {
  const { login, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

          <p className="mt-6 text-center text-sm text-bauhaus-black/50 font-medium">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-black text-bauhaus-blue hover:text-bauhaus-red transition-colors uppercase">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
