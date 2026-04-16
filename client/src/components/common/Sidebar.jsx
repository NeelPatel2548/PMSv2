import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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

  // ── Task 5 fix: logout always goes to landing page ──
  const handleLogout = async () => {
    await logout();
    navigate('/');
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

  const roleBadge = {
    student: 'bg-bauhaus-yellow text-bauhaus-black',
    company: 'bg-bauhaus-blue text-white',
    admin: 'bg-bauhaus-red text-white',
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
              <div className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold uppercase tracking-widest transition-colors duration-200 text-white/60 hover:bg-bauhaus-blue">
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
            <div className={`flex items-center gap-3 px-3 py-2.5 text-sm font-bold uppercase tracking-widest transition-colors duration-200 ${
              isActive
                ? 'bg-bauhaus-red text-white border-l-4 border-bauhaus-yellow'
                : 'text-white/60 hover:bg-bauhaus-blue hover:text-white'
            }`}>
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
    <aside className="hidden lg:flex flex-col w-60 min-h-[calc(100vh-4rem)] bg-bauhaus-black">
      {/* Logo + Role */}
      <div className="p-5 pb-4 border-b-4 border-bauhaus-yellow">
        <div className="flex items-center gap-2.5 mb-4">
          {/* Geometric logo shapes */}
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-bauhaus-red border border-white/20" />
            <div className="w-4 h-4 bg-bauhaus-blue border border-white/20" />
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px] border-b-bauhaus-yellow" />
          </div>
          <span className="text-base font-black text-white uppercase tracking-tight">PMS</span>
          <span className={`ml-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border-2 border-bauhaus-black ${roleBadge[user?.role] || 'bg-white/10 text-white/40'}`}>
            {user?.role}
          </span>
        </div>
        <div className="px-1">
          <p className="text-sm font-bold text-white truncate uppercase">{user?.name}</p>
          <p className="text-xs text-white/40 truncate">{user?.email}</p>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 py-4 space-y-0.5 sidebar-scroll overflow-y-auto">
        <NavItems />
      </nav>

      {/* Logout + Footer */}
      <div className="px-3 pb-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-bold uppercase tracking-widest text-white/40 hover:bg-bauhaus-red hover:text-white transition-colors duration-200"
        >
          <LogOut className="w-[18px] h-[18px]" />
          <span>Logout</span>
        </button>
      </div>
      <div className="p-4 border-t-4 border-bauhaus-yellow">
        <p className="text-[11px] text-white/30 text-center uppercase tracking-widest font-bold">PMS v2.0</p>
      </div>
    </aside>
  );

  /* ───── Mobile Sidebar (Slide-in Drawer) ───── */
  const MobileDrawer = (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-6 left-6 z-50 w-12 h-12 bg-bauhaus-black text-white border-2 border-bauhaus-yellow shadow-hard-sm flex items-center justify-center hover:bg-bauhaus-red transition-colors"
        aria-label="Open sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 z-50 bg-bauhaus-black/80"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <aside
            className="lg:hidden fixed inset-y-0 left-0 z-50 w-[272px] bg-bauhaus-black flex flex-col border-r-4 border-bauhaus-yellow"
          >
            {/* Header */}
            <div className="p-5 pb-4 flex items-center justify-between border-b-4 border-bauhaus-yellow">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded-full bg-bauhaus-red border border-white/20" />
                  <div className="w-4 h-4 bg-bauhaus-blue border border-white/20" />
                  <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px] border-b-bauhaus-yellow" />
                </div>
                <span className="text-base font-black text-white uppercase tracking-tight">PMS</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 hover:bg-bauhaus-red text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User info */}
            <div className="px-5 pb-4 pt-3">
              <p className="text-sm font-bold text-white truncate uppercase">{user?.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-white/40 truncate">{user?.email}</p>
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border-2 border-bauhaus-black ${roleBadge[user?.role] || 'bg-white/10 text-white/40'}`}>
                  {user?.role}
                </span>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto sidebar-scroll">
              <NavItems onItemClick={() => setMobileOpen(false)} />
            </nav>

            {/* Logout */}
            <div className="px-3 pb-2">
              <button
                onClick={() => { handleLogout(); setMobileOpen(false); }}
                className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-bold uppercase tracking-widest text-white/40 hover:bg-bauhaus-red hover:text-white transition-colors duration-200"
              >
                <LogOut className="w-[18px] h-[18px]" />
                <span>Logout</span>
              </button>
            </div>
            <div className="p-4 border-t-4 border-bauhaus-yellow">
              <p className="text-[11px] text-white/30 text-center uppercase tracking-widest font-bold">PMS v2.0</p>
            </div>
          </aside>
        </>
      )}
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
