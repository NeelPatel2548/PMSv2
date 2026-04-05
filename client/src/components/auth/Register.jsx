import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, Eye, EyeOff, User, ArrowRight, GraduationCap, Building2, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'student'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
    if (fieldErrors[e.target.name]) setFieldErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const validateField = (name, value) => {
    let err = '';
    if (name === 'name' && value.length < 2) err = 'Name must be at least 2 characters';
    if (name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) err = 'Please enter a valid email address';
    if (name === 'password' && value && value.length < 6) err = 'Password must be at least 6 characters';
    if (name === 'confirmPassword' && value !== formData.password) err = 'Passwords do not match';
    setFieldErrors(prev => ({ ...prev, [name]: err }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
<<<<<<< HEAD
    // Validate all fields
=======
>>>>>>> main
    const errs = {};
    if (formData.name.length < 2) errs.name = 'Name must be at least 2 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Please enter a valid email address';
    if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setError('');
    try {
      await register(formData.name, formData.email, formData.password, formData.role);
      // On success, navigate to OTP verification with email in state
      navigate('/verify-otp', { state: { email: formData.email, type: 'register' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const inputBase = "w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 outline-none transition text-sm";
  const inputOk = `${inputBase} border-slate-200 focus:ring-primary-500/20 focus:border-primary-500`;
  const inputBad = `${inputBase} border-red-300 focus:ring-red-500/20 focus:border-red-400`;
  const errText = "text-xs text-red-500 mt-1";
=======
  const inputBase = "w-full pl-11 pr-4 py-3 rounded-xl border focus:ring-2 outline-none transition-all text-sm";
  const inputOk = `${inputBase} border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500`;
  const inputBad = `${inputBase} border-red-300 focus:ring-red-500/20 focus:border-red-400`;
  const errText = "text-xs text-red-500 mt-1 font-medium";
  const iconClass = "absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400";

  const roles = [
    { value: 'student', icon: GraduationCap, label: 'Student', desc: 'Apply for jobs' },
    { value: 'company', icon: Building2, label: 'Company', desc: 'Recruit talent' },
  ];
>>>>>>> main

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
<<<<<<< HEAD

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text" name="name" value={formData.name} onChange={handleChange}
                  onBlur={() => validateField('name', formData.name)}
                  required className={fieldErrors.name ? inputBad : inputOk}
                  placeholder="John Doe" id="register-name"
                />
              </div>
              {fieldErrors.name && <p className={errText}>{fieldErrors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email" name="email" value={formData.email} onChange={handleChange}
                  onBlur={() => validateField('email', formData.email)}
                  required className={fieldErrors.email ? inputBad : inputOk}
                  placeholder="you@example.com" id="register-email"
                />
              </div>
              {fieldErrors.email && <p className={errText}>{fieldErrors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
              <select
                name="role" value={formData.role} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition text-sm bg-white"
                id="register-role"
              >
                <option value="student">Student</option>
                <option value="company">Company</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                  onBlur={() => validateField('password', formData.password)}
                  required minLength={6}
                  className={`${fieldErrors.password ? inputBad : inputOk} pr-12`}
                  placeholder="Min. 6 characters" id="register-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {fieldErrors.password && <p className={errText}>{fieldErrors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                  onBlur={() => validateField('confirmPassword', formData.confirmPassword)}
                  required
                  className={fieldErrors.confirmPassword ? inputBad : inputOk}
                  placeholder="Re-enter password" id="register-confirm-password"
                />
              </div>
              {fieldErrors.confirmPassword && <p className={errText}>{fieldErrors.confirmPassword}</p>}
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              id="register-submit"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
              Sign In
            </Link>
          </p>
=======
          <h2 className="text-3xl font-extrabold text-white leading-tight mb-4">
            Start your
            <span className="block bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">placement journey</span>
          </h2>
          <p className="text-slate-400 leading-relaxed">Create your account to discover opportunities, track applications, and connect with top companies.</p>
>>>>>>> main
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-slate-50">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
              <p className="text-slate-500 mt-1.5 text-sm">Join the Placement Management System</p>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100 font-medium">{error}</motion.div>
            )}

            {/* Role Selector */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {roles.map(r => {
                const isSelected = formData.role === r.value;
                return (
                  <button key={r.value} type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: r.value }))}
                    className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/50 shadow-sm shadow-indigo-100'
                        : 'border-slate-200 hover:border-indigo-300 bg-white'
                    }`}>
                    {/* Checkmark */}
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <r.icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <p className={`text-sm font-semibold ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>{r.label}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{r.desc}</p>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className={iconClass} />
                  <input type="text" name="name" value={formData.name} onChange={handleChange}
                    onBlur={() => validateField('name', formData.name)}
                    required className={fieldErrors.name ? inputBad : inputOk}
                    placeholder="John Doe" id="register-name" />
                </div>
                {fieldErrors.name && <p className={errText}>{fieldErrors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className={iconClass} />
                  <input type="email" name="email" value={formData.email} onChange={handleChange}
                    onBlur={() => validateField('email', formData.email)}
                    required className={fieldErrors.email ? inputBad : inputOk}
                    placeholder="you@example.com" id="register-email" />
                </div>
                {fieldErrors.email && <p className={errText}>{fieldErrors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className={iconClass} />
                  <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                    onBlur={() => validateField('password', formData.password)}
                    required minLength={6}
                    className={`${fieldErrors.password ? inputBad : inputOk} !pr-12`}
                    placeholder="Min. 6 characters" id="register-password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                  </button>
                </div>
                {fieldErrors.password && <p className={errText}>{fieldErrors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className={iconClass} />
                  <input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                    onBlur={() => validateField('confirmPassword', formData.confirmPassword)}
                    required className={fieldErrors.confirmPassword ? inputBad : inputOk}
                    placeholder="Re-enter password" id="register-confirm-password" />
                </div>
                {fieldErrors.confirmPassword && <p className={errText}>{fieldErrors.confirmPassword}</p>}
              </div>

              <button type="submit" disabled={loading} id="register-submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5">
                {loading ? 'Creating Account...' : 'Create Account'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">Sign In</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
