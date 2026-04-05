import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  LayoutDashboard, User, Briefcase, FileText, Calendar,
  Building2, PlusCircle, Users, ClipboardList,
  Shield, BarChart3, Megaphone, Settings, Bell, GraduationCap,
  LogOut, Menu, X, ChevronLeft
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const studentLinks = [
    { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/profile', icon: User, label: 'Profile' },
    { to: '/student/jobs', icon: Briefcase, label: 'Jobs' },
    { to: '/student/applications', icon: FileText, label: 'Applications' },
    { to: '/student/interviews', icon: Calendar, label: 'Interviews' },
    { to: '#notifications', icon: Bell, label: 'Notifications', isNotification: true },
  ];

  const companyLinks = [
    { to: '/company/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/company/profile', icon: Building2, label: 'Profile' },
    { to: '/company/post-job', icon: PlusCircle, label: 'Post Job' },
    { to: '/company/jobs', icon: Briefcase, label: 'My Jobs' },
    { to: '#notifications', icon: Bell, label: 'Notifications', isNotification: true },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/students', icon: Users, label: 'Students' },
    { to: '/admin/companies', icon: Building2, label: 'Companies' },
    { to: '/admin/jobs', icon: Briefcase, label: 'Jobs' },
    { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
    { to: '#notifications', icon: Bell, label: 'Notifications', isNotification: true },
  ];

  const links = user?.role === 'student' ? studentLinks
    : user?.role === 'company' ? companyLinks
    : user?.role === 'admin' ? adminLinks
    : [];

  const rolePills = {
    student: 'bg-indigo-500/20 text-indigo-300 shadow-indigo-500/10',
    company: 'bg-emerald-500/20 text-emerald-300 shadow-emerald-500/10',
    admin: 'bg-red-500/20 text-red-300 shadow-red-500/10',
  };

  const NavItems = ({ onItemClick }) => (
    <>
      {links.map((link) => {
        const isActive = location.pathname === link.to;

        if (link.isNotification) {
          return (
            <button
              key="notifications-sidebar"
              onClick={() => { document.getElementById('notification-bell')?.click(); onItemClick?.(); }}
              className="relative block w-full text-left"
            >
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200">
                <link.icon className="w-[18px] h-[18px] flex-shrink-0" />
                <span>{link.label}</span>
              </div>
            </button>
          );
        }

        return (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onItemClick}
            className="relative block"
          >
            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
            }`}>
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-indigo-400 rounded-r-full shadow-sm shadow-indigo-400/50"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <link.icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
              <span>{link.label}</span>
            </div>
          </NavLink>
        );
      })}
    </>
  );

  /* ───── Desktop Sidebar ───── */
  const DesktopSidebar = (
    <aside className="hidden lg:flex flex-col w-60 min-h-[calc(100vh-4rem)] bg-slate-900">
      {/* Logo + Role */}
      <div className="p-5 pb-4">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-base font-bold text-white tracking-tight">PMS</span>
            <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide shadow-sm ${rolePills[user?.role] || 'bg-slate-700 text-slate-400'}`}>
              {user?.role}
            </span>
          </div>
        </div>
        <div className="px-1">
          <p className="text-sm font-semibold text-slate-200 truncate">{user?.name}</p>
          <p className="text-xs text-slate-500 truncate">{user?.email}</p>
        </div>
      </div>

      <div className="h-px bg-slate-800 mx-4" />

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 sidebar-scroll overflow-y-auto">
        <NavItems />
      </nav>

      {/* Logout + Footer */}
      <div className="px-3 pb-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
        >
          <LogOut className="w-[18px] h-[18px]" />
          <span>Logout</span>
        </button>
      </div>
      <div className="p-4 border-t border-slate-800">
        <p className="text-[11px] text-slate-600 text-center">PMS v2.0 · Placement System</p>
      </div>
    </aside>
  );

  /* ───── Mobile Sidebar (Slide-in Drawer) ───── */
  const MobileDrawer = (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-6 left-6 z-50 w-12 h-12 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-900/50 flex items-center justify-center hover:bg-slate-800 transition-colors"
        aria-label="Open sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-[272px] bg-slate-900 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-5 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-base font-bold text-white tracking-tight">PMS</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User info */}
              <div className="px-5 pb-4">
                <p className="text-sm font-semibold text-slate-200 truncate">{user?.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${rolePills[user?.role] || 'bg-slate-700 text-slate-400'}`}>
                    {user?.role}
                  </span>
                </div>
              </div>

              <div className="h-px bg-slate-800 mx-4" />

              {/* Nav */}
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto sidebar-scroll">
                <NavItems onItemClick={() => setMobileOpen(false)} />
              </nav>

              {/* Logout */}
              <div className="px-3 pb-2">
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
                >
                  <LogOut className="w-[18px] h-[18px]" />
                  <span>Logout</span>
                </button>
              </div>
              <div className="p-4 border-t border-slate-800">
                <p className="text-[11px] text-slate-600 text-center">PMS v2.0 · Placement System</p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );

  return (
    <>
      {DesktopSidebar}
      {MobileDrawer}
    </>
  );
};

export default Sidebar;
