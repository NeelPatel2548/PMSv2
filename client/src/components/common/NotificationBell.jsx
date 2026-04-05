import { useState, useEffect, useRef } from 'react';
import { Bell, Briefcase, FileText, Calendar, Trophy, Megaphone, Shield, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const typeConfig = {
  job_posted: { icon: Briefcase, color: 'bg-blue-100 text-blue-600', label: 'Job' },
  application: { icon: FileText, color: 'bg-purple-100 text-purple-600', label: 'Application' },
  application_update: { icon: FileText, color: 'bg-purple-100 text-purple-600', label: 'Application' },
  interview_scheduled: { icon: Calendar, color: 'bg-orange-100 text-orange-600', label: 'Interview' },
  interview_reminder: { icon: Calendar, color: 'bg-amber-100 text-amber-600', label: 'Reminder' },
  offer_received: { icon: Trophy, color: 'bg-green-100 text-green-600', label: 'Offer' },
  announcement: { icon: Megaphone, color: 'bg-slate-100 text-slate-600', label: 'Announcement' },
  security: { icon: Shield, color: 'bg-red-100 text-red-600', label: 'Security' },
};

const typeConfig = {
  job_posted: { icon: Briefcase, color: 'bg-blue-100 text-blue-600', label: 'Job' },
  application_update: { icon: FileText, color: 'bg-purple-100 text-purple-600', label: 'Application' },
  interview_scheduled: { icon: Calendar, color: 'bg-orange-100 text-orange-600', label: 'Interview' },
  offer_received: { icon: Trophy, color: 'bg-green-100 text-green-600', label: 'Offer' },
  announcement: { icon: Megaphone, color: 'bg-slate-100 text-slate-600', label: 'Announcement' },
  security: { icon: Shield, color: 'bg-red-100 text-red-600', label: 'Security' },
};

const NotificationBell = () => {
  const { unreadCount, decrementUnread, resetUnread, getSocket } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
<<<<<<< HEAD
=======
  const [toast, setToast] = useState(null);
>>>>>>> main
  const modalRef = useRef(null);
  const navigate = useNavigate();

  // Listen for real-time notifications — show toast
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

<<<<<<< HEAD
=======
    const handleNotification = (notif) => {
      // Show a brief toast
      setToast({ title: notif.title, message: notif.message });
      setTimeout(() => setToast(null), 4000);

      // If panel is open, prepend to list
      if (isOpen) {
        setNotifications(prev => [notif, ...prev]);
      }
    };

    socket.on('notification', handleNotification);
    return () => socket.off('notification', handleNotification);
  }, [getSocket, isOpen]);

>>>>>>> main
  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);
<<<<<<< HEAD

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') setIsOpen(false); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      if (res.data.success) setUnreadCount(res.data.data.count);
    } catch { /* ignore */ }
  };
=======

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') setIsOpen(false); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);
>>>>>>> main

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications?limit=20');
      if (res.data.success) setNotifications(res.data.data.notifications);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const toggleModal = () => {
    if (!isOpen) fetchNotifications();
    setIsOpen(!isOpen);
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
<<<<<<< HEAD
      setUnreadCount(prev => Math.max(0, prev - 1));
=======
      decrementUnread();
>>>>>>> main
    } catch { /* ignore */ }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
<<<<<<< HEAD
      setUnreadCount(0);
=======
      resetUnread();
>>>>>>> main
    } catch { /* ignore */ }
  };

  const handleClick = (notification) => {
    if (!notification.isRead) markAsRead(notification._id);
    if (notification.link) navigate(notification.link);
    setIsOpen(false);
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <>
      {/* Bell Button */}
      <button
        onClick={toggleModal}
        className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors"
        id="notification-bell"
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

<<<<<<< HEAD
      {/* Modal Overlay + Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/30 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed top-16 right-4 w-[380px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-100 flex-shrink-0">
                <h3 className="font-bold text-slate-800 text-lg">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                      Mark all as read
                    </button>
                  )}
                  <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 transition">
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto flex-1">
                {loading ? (
                  <div className="space-y-3 p-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="animate-pulse flex gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-slate-100 rounded w-3/4" />
                          <div className="h-2 bg-slate-100 rounded w-full" />
                          <div className="h-2 bg-slate-50 rounded w-1/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-10 text-center text-slate-400">
                    <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No notifications yet</p>
                    <p className="text-xs mt-1">We'll notify you when something happens</p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const config = typeConfig[n.type] || typeConfig.announcement;
                    const Icon = config.icon;
                    return (
                      <button
                        key={n._id}
                        onClick={() => handleClick(n)}
                        className={`w-full text-left p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 flex items-start gap-3 ${
                          !n.isRead ? 'bg-primary-50/40 border-l-[3px] border-l-primary-500' : 'border-l-[3px] border-l-transparent'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl ${config.color} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-snug ${!n.isRead ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-slate-300 mt-1.5">{getTimeAgo(n.createdAt)}</p>
                        </div>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
=======
      {/* Toast Notification - slides in from top-right */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-[60] bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 max-w-xs"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{toast.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{toast.message}</p>
              </div>
              <button onClick={() => setToast(null)} className="p-0.5 hover:bg-slate-100 rounded-lg">
                <X className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Overlay + Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/30 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed top-16 right-4 w-[380px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-100 flex-shrink-0">
                <h3 className="font-bold text-slate-800 text-lg">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                      Mark all as read
                    </button>
                  )}
                  <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 transition">
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto flex-1">
                {loading ? (
                  <div className="space-y-3 p-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="animate-pulse flex gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-slate-100 rounded w-3/4" />
                          <div className="h-2 bg-slate-100 rounded w-full" />
                          <div className="h-2 bg-slate-50 rounded w-1/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-10 text-center text-slate-400">
                    <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No notifications yet</p>
                    <p className="text-xs mt-1">We'll notify you when something happens</p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const config = typeConfig[n.type] || typeConfig.announcement;
                    const Icon = config.icon;
                    return (
                      <button
                        key={n._id}
                        onClick={() => handleClick(n)}
                        className={`w-full text-left p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 flex items-start gap-3 ${
                          !n.isRead ? 'bg-primary-50/40 border-l-[3px] border-l-primary-500' : 'border-l-[3px] border-l-transparent'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl ${config.color} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-snug ${!n.isRead ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-slate-300 mt-1.5">{getTimeAgo(n.createdAt)}</p>
                        </div>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
>>>>>>> main
    </>
  );
};

export default NotificationBell;
