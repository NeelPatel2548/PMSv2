import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import api from '../../services/api';

const ChangePassword = () => {
  const { user, checkAuth, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if user doesn't need to change password
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    } else if (!authLoading && user && !user.mustChangePassword) {
      // User doesn't need to change password — redirect to their dashboard
      const dashboardMap = {
        student: '/student/dashboard',
        company: '/company/dashboard',
        admin: '/admin/dashboard'
      };
      navigate(dashboardMap[user.role] || '/', { replace: true });
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await api.put('/auth/change-password', { newPassword });
      const role = res.data?.data?.role;

      // Refresh auth context
      await checkAuth();

      // Redirect to appropriate dashboard
      const dashboardMap = {
        student: '/student/dashboard',
        company: '/company/dashboard',
        admin: '/admin/dashboard'
      };
      navigate(dashboardMap[role] || '/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  // Show nothing while checking auth
  if (authLoading) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row">
      {/* Left panel — geometric (same style as Login) */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: '#1a1a2e' }}
      >
        {/* Bauhaus geometric shapes */}
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full border-4" style={{
          backgroundColor: 'rgba(230, 57, 70, 0.3)',
          borderColor: 'rgba(255,255,255,0.15)'
        }} />
        <div className="absolute bottom-20 right-10 w-24 h-24 border-4" style={{
          backgroundColor: 'rgba(244, 208, 63, 0.3)',
          borderColor: 'rgba(255,255,255,0.15)'
        }} />
        <div className="absolute top-1/3 right-1/4 w-0 h-0" style={{
          borderLeft: '40px solid transparent',
          borderRight: '40px solid transparent',
          borderBottom: '70px solid rgba(26, 86, 219, 0.3)'
        }} />
        <div className="absolute bottom-10 left-20 w-16 h-16 rounded-full border-4" style={{
          borderColor: 'rgba(255,255,255,0.15)'
        }} />
        {/* Lock icon decoration */}
        <div className="absolute top-16 right-16 w-20 h-20 flex items-center justify-center rounded-full" style={{
          backgroundColor: 'rgba(230, 57, 70, 0.2)',
          border: '3px solid rgba(255,255,255,0.1)'
        }}>
          <Lock className="w-10 h-10" style={{ color: 'rgba(255,255,255,0.2)' }} />
        </div>

        <div className="relative z-10 text-center px-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-5 h-5 rounded-full border-2" style={{
              backgroundColor: '#e63946',
              borderColor: 'rgba(255,255,255,0.3)'
            }} />
            <div className="w-5 h-5 border-2" style={{
              backgroundColor: '#f4d03f',
              borderColor: 'rgba(255,255,255,0.3)'
            }} />
            <div className="w-0 h-0" style={{
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderBottom: '17px solid rgba(255,255,255,0.5)'
            }} />
          </div>
          <h2 className="text-5xl font-black text-white uppercase leading-tight mb-4">
            Secure<br />Your<br />Account
          </h2>
          <p className="font-medium text-sm uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Set a new permanent password
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12" style={{ backgroundColor: '#fafaf5' }}>
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#e63946' }} />
              <div className="w-4 h-4" style={{ backgroundColor: '#1a56db' }} />
              <div className="w-0 h-0" style={{
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderBottom: '14px solid #f4d03f'
              }} />
            </div>
            <h1 className="text-3xl font-black uppercase" style={{ color: '#1a1a2e' }}>
              Secure Your Account
            </h1>
          </div>

          {/* Shield icon + title */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 flex items-center justify-center" style={{
              backgroundColor: '#e63946',
              border: '2px solid #1a1a2e',
              boxShadow: '3px 3px 0px #1a1a2e'
            }}>
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="hidden lg:block text-2xl font-black uppercase" style={{ color: '#1a1a2e' }}>
                Set Your New Password
              </h1>
            </div>
          </div>

          <p className="font-medium text-sm mb-8" style={{ color: 'rgba(26,26,46,0.5)' }}>
            You logged in with a temporary password. Please set a permanent password now.
          </p>

          {/* Yellow accent bar */}
          <div className="mb-6" style={{
            width: '60px',
            height: '4px',
            backgroundColor: '#f4d03f'
          }} />

          {error && (
            <div className="mb-6 p-4 text-white font-bold text-sm" style={{
              backgroundColor: '#e63946',
              border: '2px solid #1a1a2e'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'rgba(26,26,46,0.6)' }}>
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                  required
                  className="bauhaus-input pr-12"
                  placeholder="Minimum 8 characters"
                  minLength={8}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'rgba(26,26,46,0.4)' }}
                >
                  {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {/* Password strength hint */}
              {newPassword.length > 0 && newPassword.length < 8 && (
                <p className="mt-1 text-xs font-bold" style={{ color: '#e63946' }}>
                  {8 - newPassword.length} more characters needed
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'rgba(26,26,46,0.6)' }}>
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                  required
                  className="bauhaus-input pr-12"
                  placeholder="Re-enter your new password"
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'rgba(26,26,46,0.4)' }}
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {/* Match indicator */}
              {confirmPassword.length > 0 && (
                <p className="mt-1 text-xs font-bold" style={{
                  color: newPassword === confirmPassword ? '#2e7d32' : '#e63946'
                }}>
                  {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || newPassword.length < 8 || newPassword !== confirmPassword}
              className="w-full py-4 font-black uppercase tracking-wider text-sm text-white transition-all disabled:opacity-50"
              style={{
                backgroundColor: '#e63946',
                border: '2px solid #1a1a2e',
                boxShadow: '6px 6px 0px #1a1a2e'
              }}
              onMouseDown={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.transform = 'translate(2px, 2px)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '6px 6px 0px #1a1a2e';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '6px 6px 0px #1a1a2e';
              }}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
