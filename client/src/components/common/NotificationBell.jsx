import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X, Check, Trash2, CheckCheck, Building2, GraduationCap, Settings, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getSocket, connectSocket, disconnectSocket } from '../../services/socket';

/* ─── Toast Component ─── */
const Toast = ({ toast, onDismiss }) => {
  const typeBar = {
    company: 'bg-bauhaus-blue',
    student: 'bg-bauhaus-yellow',
    admin: 'bg-bauhaus-red',
    system: 'bg-bauhaus-black',
  };
  const typeIcon = {
    company: <Building2 className="w-4 h-4 text-bauhaus-blue" />,
    student: <GraduationCap className="w-4 h-4 text-bauhaus-yellow" />,
    admin: <AlertCircle className="w-4 h-4 text-bauhaus-red" />,
    system: <Settings className="w-4 h-4 text-bauhaus-black" />,
  };

  return (
    <div className="flex items-stretch bg-white border-4 border-bauhaus-black shadow-hard-md animate-slide-in mb-2 group overflow-hidden">
      {/* Left color bar */}
      <div className={`w-2 flex-shrink-0 ${typeBar[toast.type] || typeBar.system}`} />
      <div className="flex-1 p-3 flex items-start gap-2">
        <div className="mt-0.5">{typeIcon[toast.type] || typeIcon.system}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-bauhaus-black uppercase tracking-wide line-clamp-2">{toast.message}</p>
          <p className="text-[10px] text-bauhaus-black/50 mt-0.5 uppercase tracking-wider font-bold">just now</p>
        </div>
        <button onClick={onDismiss} className="p-1 text-bauhaus-black/30 hover:text-bauhaus-red transition-colors flex-shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

/* ─── Main Component ─── */
const NotificationBell = () => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const dropdownRef = useRef(null);
  const toastTimers = useRef({});

  /* Fetch notifications */
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        const payload = res.data.data;
        setNotifications(Array.isArray(payload) ? payload : payload?.notifications || []);
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchNotifications]);

  /* Socket.IO real-time */
  useEffect(() => {
    if (!isAuthenticated || !user?._id) return;
    let socket;
    try {
      connectSocket();
      socket = getSocket();
    } catch (err) {
      console.warn('[NotificationBell] Socket connection failed:', err.message);
      return;
    }
    if (!socket) return;

    const handler = (notification) => {
      setNotifications(prev => [notification, ...prev]);
      const toastId = Date.now() + Math.random();
      setToasts(prev => [...prev, { id: toastId, message: notification.message, type: notification.type }]);
      toastTimers.current[toastId] = setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toastId));
        delete toastTimers.current[toastId];
      }, 4000);
    };

    socket.on('notification', handler);
    return () => {
      socket.off('notification', handler);
      Object.values(toastTimers.current).forEach(clearTimeout);
      toastTimers.current = {};
    };
  }, [isAuthenticated, user]);

  /* Click outside to close */
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const dismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    if (toastTimers.current[id]) {
      clearTimeout(toastTimers.current[id]);
      delete toastTimers.current[id];
    }
  };

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch { /* silent */ }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch { /* silent */ }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch { /* silent */ }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  if (!isAuthenticated) return null;

  const typeIcon = {
    company: <Building2 className="w-4 h-4 text-bauhaus-blue" />,
    student: <GraduationCap className="w-4 h-4 text-bauhaus-yellow" />,
    admin: <AlertCircle className="w-4 h-4 text-bauhaus-red" />,
    system: <Settings className="w-4 h-4 text-bauhaus-black" />,
  };

  return (
    <>
      {/* Toast container */}
      <div className="fixed top-20 right-4 z-[100] w-80 space-y-2">
        <style>{`
          @keyframes slide-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
          .animate-slide-in { animation: slide-in 0.3s ease-out; }
        `}</style>
        {toasts.map(t => (
          <Toast key={t.id} toast={t} onDismiss={() => dismissToast(t.id)} />
        ))}
      </div>

      {/* Bell + Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          id="notification-bell"
          onClick={() => setOpen(!open)}
          className="relative p-2 hover:bg-bauhaus-muted transition-colors border-2 border-transparent hover:border-bauhaus-black"
        >
          <Bell className="w-5 h-5 text-bauhaus-black" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-bauhaus-red text-white text-[10px] font-black flex items-center justify-center border-2 border-bauhaus-black">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-[calc(100%+8px)] w-80 max-h-[26rem] bg-white border-4 border-bauhaus-black shadow-hard-lg overflow-hidden z-50 flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b-4 border-bauhaus-black flex items-center justify-between bg-bauhaus-yellow">
              <h3 className="text-sm font-black uppercase tracking-wider text-bauhaus-black">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs font-bold uppercase tracking-wider text-bauhaus-black/60 hover:text-bauhaus-black transition-colors flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all
                </button>
              )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-bauhaus-muted" />
                  <p className="text-sm text-bauhaus-black/40 font-bold uppercase tracking-wider">No notifications</p>
                </div>
              ) : (
                notifications.slice(0, 20).map(n => (
                  <div
                    key={n._id}
                    className={`px-4 py-3 border-b-2 border-bauhaus-muted flex items-start gap-2.5 group transition-colors ${
                      n.isRead ? 'bg-white' : 'bg-bauhaus-yellow/10'
                    }`}
                  >
                    <div className="mt-0.5">{typeIcon[n.type] || typeIcon.system}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${n.isRead ? 'text-bauhaus-black/60' : 'text-bauhaus-black font-bold'}`}>
                        {n.message}
                      </p>
                      <p className="text-[10px] text-bauhaus-black/30 mt-0.5 uppercase font-bold tracking-wider">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      {!n.isRead && (
                        <button onClick={() => markRead(n._id)} className="p-1 hover:bg-bauhaus-muted transition-colors" title="Mark read">
                          <Check className="w-3.5 h-3.5 text-bauhaus-blue" />
                        </button>
                      )}
                      <button onClick={() => deleteNotification(n._id)} className="p-1 hover:bg-bauhaus-muted transition-colors" title="Delete">
                        <Trash2 className="w-3.5 h-3.5 text-bauhaus-red" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationBell;
