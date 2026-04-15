import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, GraduationCap, Building2 } from 'lucide-react';

const Register = () => {
  const { register, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const selectRole = (role) => {
    setFormData({ ...formData, role });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.role) { setError('Please select a role'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await register(formData.name, formData.email, formData.password, formData.role);
      // In bypass mode, backend creates user directly and sets JWT cookie
      if (res?.data?.role) {
        await checkAuth();
        const role = res.data.role;
        if (role === 'student') navigate('/student/dashboard');
        else if (role === 'company') navigate('/company/dashboard');
        else navigate('/');
      } else {
        // Normal mode: navigate to OTP verification
        navigate('/verify-otp', { state: { email: formData.email } });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row">
      {/* Left panel — geometric */}
      <div className="hidden lg:flex flex-1 bg-bauhaus-red items-center justify-center relative overflow-hidden">
        <div className="absolute top-10 right-10 w-32 h-32 bg-bauhaus-blue/30 border-4 border-white/20" />
        <div className="absolute bottom-20 left-10 w-28 h-28 rounded-full bg-bauhaus-yellow/30 border-4 border-white/20" />
        <div className="absolute bottom-10 right-20 w-20 h-20 border-4 border-white/20" />
        <div className="relative z-10 text-center px-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-5 h-5 rounded-full bg-white/50" />
            <div className="w-5 h-5 bg-bauhaus-yellow border-2 border-white/30" />
            <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[17px] border-b-bauhaus-blue/50" />
          </div>
          <h2 className="text-5xl font-black text-white uppercase leading-tight mb-4">Join<br />The<br />Platform</h2>
          <p className="text-white/50 font-medium text-sm uppercase tracking-widest">Create your account to get started</p>
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
            <h1 className="text-3xl font-black uppercase text-bauhaus-black">Create Account</h1>
          </div>

          <h1 className="hidden lg:block text-3xl font-black uppercase text-bauhaus-black mb-2">Register</h1>
          <p className="text-bauhaus-black/50 font-medium text-sm uppercase tracking-widest mb-6">Choose your role and fill in your details</p>

          {error && (
            <div className="mb-6 p-4 bg-bauhaus-red text-white border-2 border-bauhaus-black font-bold text-sm">
              {error}
            </div>
          )}

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => selectRole('student')}
              className={`p-5 border-4 text-center transition-all ${
                formData.role === 'student'
                  ? 'bg-bauhaus-yellow border-bauhaus-black shadow-hard-md'
                  : 'bg-white border-bauhaus-black hover:bg-bauhaus-muted'
              }`}
            >
              <GraduationCap className={`w-8 h-8 mx-auto mb-2 ${formData.role === 'student' ? 'text-bauhaus-black' : 'text-bauhaus-black/40'}`} />
              <p className="text-sm font-black uppercase tracking-wider text-bauhaus-black">Student</p>
            </button>
            <button
              type="button"
              onClick={() => selectRole('company')}
              className={`p-5 border-4 text-center transition-all ${
                formData.role === 'company'
                  ? 'bg-bauhaus-blue border-bauhaus-black shadow-hard-md text-white'
                  : 'bg-white border-bauhaus-black hover:bg-bauhaus-muted'
              }`}
            >
              <Building2 className={`w-8 h-8 mx-auto mb-2 ${formData.role === 'company' ? 'text-white' : 'text-bauhaus-black/40'}`} />
              <p className={`text-sm font-black uppercase tracking-wider ${formData.role === 'company' ? 'text-white' : 'text-bauhaus-black'}`}>Company</p>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-bauhaus-black/60 mb-2">
                {formData.role === 'company' ? 'Company Name' : 'Full Name'}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="bauhaus-input"
                placeholder={formData.role === 'company' ? 'Company name' : 'Your full name'}
              />
            </div>

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
                  minLength={6}
                  className="bauhaus-input pr-12"
                  placeholder="Min 6 characters"
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
              disabled={loading || !formData.role}
              className="w-full py-4 bg-bauhaus-red text-white font-black border-2 border-bauhaus-black shadow-hard-md hover:opacity-90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all uppercase tracking-wider text-sm disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-bauhaus-black/50 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="font-black text-bauhaus-blue hover:text-bauhaus-red transition-colors uppercase">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
