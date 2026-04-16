import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';
import { LogOut, User, GraduationCap, Building2, Shield, Menu, X, Home } from 'lucide-react';
import ErrorBoundary from './ErrorBoundary';
import { useState } from 'react';

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
  '/admin/settings': 'Settings',
};

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // ── Task 5 fix: logout always goes to landing page ──
  const handleLogout = async () => {
    await logout();
    navigate('/');
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

  const roleBadge = {
    student: 'bg-bauhaus-yellow text-bauhaus-black',
    company: 'bg-bauhaus-blue text-white',
    admin: 'bg-bauhaus-red text-white',
  };

  const currentTitle = pageTitles[location.pathname] || '';

  // ── Task 5 fix: "PMS" logo always links to landing page ("/"), NOT to dashboard ──
  // The dashboard link is now a separate explicit button.
  return (
    <nav className="sticky top-0 z-40 bg-bauhaus-white border-b-4 border-bauhaus-black">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Page Title */}
          <div className="flex items-center gap-4">
            {/* ── Task 5 fix: Logo ALWAYS links to "/" (landing page) ── */}
            <Link to="/" className="flex items-center gap-2.5">
              {/* Geometric logo shapes */}
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-bauhaus-red border-2 border-bauhaus-black" />
                <div className="w-4 h-4 bg-bauhaus-blue border-2 border-bauhaus-black" />
                <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px] border-b-bauhaus-yellow" />
              </div>
              <span className="text-lg font-black text-bauhaus-black tracking-tight uppercase">PMS</span>
            </Link>
            {isAuthenticated && currentTitle && (
              <>
                <div className="hidden sm:block h-6 w-1 bg-bauhaus-black" />
                <span className="hidden sm:block text-sm font-bold text-bauhaus-black uppercase tracking-widest">{currentTitle}</span>
              </>
            )}
          </div>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* ── Task 5 fix: Explicit "Home" link to landing page ── */}
                <Link
                  to="/"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-bauhaus-black hover:text-bauhaus-blue hover:bg-bauhaus-blue/10 transition-all uppercase tracking-wider"
                  title="Landing Page"
                >
                  <Home className="w-4 h-4" /> Home
                </Link>
                <ErrorBoundary><NotificationBell /></ErrorBoundary>
                <div className="h-6 w-1 bg-bauhaus-black" />
                <Link to={getDashboardLink()} className="flex items-center gap-2.5 group cursor-pointer hover:opacity-80 transition-opacity" title="Go to Dashboard">
                  <div className="w-8 h-8 bg-bauhaus-black flex items-center justify-center text-white text-xs font-black border-2 border-bauhaus-black">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-bauhaus-black leading-tight uppercase">{user?.name}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${roleBadge[user?.role]?.split(' ')[1] || 'text-bauhaus-black'}`}>
                      {user?.role}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-bauhaus-black hover:text-bauhaus-red hover:bg-bauhaus-red/10 transition-all uppercase tracking-wider"
                  id="logout-btn"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/contact"
                  className="px-4 py-2 text-sm font-bold text-bauhaus-black hover:text-bauhaus-blue transition-colors uppercase tracking-widest"
                >
                  Contact
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-bold text-bauhaus-black hover:text-bauhaus-red transition-colors uppercase tracking-widest"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 text-sm font-bold text-white bg-bauhaus-red border-2 border-bauhaus-black shadow-hard-sm hover:opacity-90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all uppercase tracking-wider"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && <ErrorBoundary><NotificationBell /></ErrorBoundary>}
            <button
              className="p-2 hover:bg-bauhaus-muted transition-colors border-2 border-bauhaus-black"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5 text-bauhaus-black" /> : <Menu className="w-5 h-5 text-bauhaus-black" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t-4 border-bauhaus-black overflow-hidden bg-bauhaus-white">
          <div className="px-4 py-3 space-y-1">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 px-3 py-3 bg-bauhaus-muted mb-2 border-2 border-bauhaus-black">
                  <div className="w-9 h-9 bg-bauhaus-black flex items-center justify-center text-white text-sm font-black">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-bauhaus-black uppercase">{user?.name}</p>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 border-2 border-bauhaus-black ${roleBadge[user?.role] || 'bg-bauhaus-muted text-bauhaus-black'}`}>
                      {user?.role}
                    </span>
                  </div>
                </div>
                {/* ── Task 5 fix: Explicit "PMS Home" link to landing page in mobile nav ── */}
                <Link
                  to="/"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-sm font-bold text-bauhaus-black hover:bg-bauhaus-muted transition-colors uppercase tracking-widest"
                >
                  <Home className="w-4 h-4 inline mr-2" /> PMS Home
                </Link>
                <Link
                  to={getDashboardLink()}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-sm font-bold text-bauhaus-black hover:bg-bauhaus-muted transition-colors uppercase tracking-widest"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="w-full text-left px-3 py-2.5 text-sm font-bold text-bauhaus-red hover:bg-bauhaus-red/10 transition-colors uppercase tracking-widest"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-sm font-bold text-bauhaus-black hover:bg-bauhaus-muted uppercase tracking-widest"
                >
                  Contact Us
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-sm font-bold text-bauhaus-black hover:bg-bauhaus-muted uppercase tracking-widest"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-sm font-bold text-white bg-bauhaus-red border-2 border-bauhaus-black text-center uppercase tracking-wider"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
