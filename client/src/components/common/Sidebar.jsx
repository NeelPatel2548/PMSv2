import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, User, Briefcase, FileText, Calendar,
  Building2, PlusCircle, Users, ClipboardList,
  Shield, BarChart3, Megaphone, Settings
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const studentLinks = [
    { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/profile', icon: User, label: 'Profile' },
    { to: '/student/jobs', icon: Briefcase, label: 'Jobs' },
    { to: '/student/applications', icon: FileText, label: 'Applications' },
    { to: '/student/interviews', icon: Calendar, label: 'Interviews' },
  ];

  const companyLinks = [
    { to: '/company/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/company/profile', icon: Building2, label: 'Profile' },
    { to: '/company/post-job', icon: PlusCircle, label: 'Post Job' },
    { to: '/company/jobs', icon: Briefcase, label: 'My Jobs' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/students', icon: Users, label: 'Students' },
    { to: '/admin/companies', icon: Building2, label: 'Companies' },
    { to: '/admin/jobs', icon: Briefcase, label: 'Jobs' },
    { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
  ];

  const links = user?.role === 'student' ? studentLinks
    : user?.role === 'company' ? companyLinks
    : user?.role === 'admin' ? adminLinks
    : [];

  const roleColors = {
    student: 'from-blue-600 to-indigo-600',
    company: 'from-emerald-600 to-teal-600',
    admin: 'from-purple-600 to-violet-600',
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-[calc(100vh-4rem)] bg-white border-r border-slate-200/60">
      {/* Role Badge */}
      <div className="p-4">
        <div className={`bg-gradient-to-r ${roleColors[user?.role] || 'from-slate-600 to-slate-700'} rounded-2xl p-4 text-white`}>
          <p className="text-xs font-medium opacity-80 uppercase tracking-wider">{user?.role} Portal</p>
          <p className="text-lg font-bold mt-1 truncate">{user?.name}</p>
          <p className="text-xs opacity-70 truncate">{user?.email}</p>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className="relative block"
            >
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'text-primary-700 bg-primary-50'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-600 rounded-r-full"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <link.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-600' : ''}`} />
                <span>{link.label}</span>
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100">
        <p className="text-xs text-slate-400 text-center">PMS v1.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;
