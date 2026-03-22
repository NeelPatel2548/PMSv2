import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';
import { LogOut, User, GraduationCap, Building2, Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const pageTitles = {
  '/student/dashboard': 'Dashboard',
  '/student/profile': 'My Profile',
  '/student/jobs': 'Eligible Jobs',
  '/student/applications': 'Applications',
  '/student/interviews': 'Interviews',
  '/company/dashboard': 'Dashboard',
  '/company/profile': 'Company Profile',
  '/company/post-job': 'Post a Job',
  '/company/jobs': 'My Jobs',
  '/admin/dashboard': 'Admin Dashboard',
  '/admin/students': 'Manage Students',
  '/admin/companies': 'Manage Companies',
  '/admin/jobs': 'Manage Jobs',
  '/admin/reports': 'Placement Reports',
};

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'student': return <GraduationCap className="w-4 h-4" />;
      case 'company': return <Building2 className="w-4 h-4" />;
      case 'admin': return <Shield className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getDashboardLink = () => {
    switch (user?.role) {
      case 'student': return '/student/dashboard';
      case 'company': return '/company/dashboard';
      case 'admin': return '/admin/dashboard';
      default: return '/';
    }
  };

  const roleColors = {
    student: 'bg-indigo-100 text-indigo-700',
    company: 'bg-emerald-100 text-emerald-700',
    admin: 'bg-purple-100 text-purple-700',
  };

  const avatarColors = {
    student: 'from-indigo-500 to-purple-600',
    company: 'from-emerald-500 to-teal-600',
    admin: 'from-purple-500 to-violet-600',
  };

  const currentTitle = pageTitles[location.pathname] || '';

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm shadow-slate-200/20">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Page Title */}
          <div className="flex items-center gap-4">
            <Link to={isAuthenticated ? getDashboardLink() : '/'} className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">PMS</span>
            </Link>
            {isAuthenticated && currentTitle && (
              <>
                <div className="hidden sm:block h-6 w-px bg-slate-200" />
                <span className="hidden sm:block text-sm font-medium text-slate-500">{currentTitle}</span>
              </>
            )}
          </div>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <div className="h-6 w-px bg-slate-200" />
                <div className="flex items-center gap-2.5 group cursor-default">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarColors[user?.role] || 'from-slate-400 to-slate-500'} flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-transparent group-hover:ring-indigo-500/50 transition-all duration-300`}>
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-800 leading-tight">{user?.name}</span>
                    <span className={`text-[10px] font-semibold uppercase tracking-wide ${roleColors[user?.role]?.split(' ')[1] || 'text-slate-400'}`}>
                      {user?.role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all"
                  id="logout-btn"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-lg transition-all shadow-md shadow-indigo-500/25"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && <NotificationBell />}
            <button
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5 text-slate-600" /> : <Menu className="w-5 h-5 text-slate-600" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-slate-100 overflow-hidden bg-white"
          >
            <div className="px-4 py-3 space-y-1">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-slate-50 mb-2">
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColors[user?.role] || 'from-slate-400 to-slate-500'} flex items-center justify-center text-white text-sm font-bold`}>
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                      <span className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${roleColors[user?.role] || 'bg-slate-100 text-slate-500'}`}>
                        {user?.role}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={getDashboardLink()}
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="w-full text-left px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-center"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
