import React, { useEffect, useState, useCallback } from 'react';
import { Bell, Settings, LogOut, X, Check } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import { fetchNotifications, deleteNotification, markNotificationAsRead } from '../services/api';

interface Props {
  closeSidebar: () => void;
}

interface Notification {
  notification_id: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

const MobileTopActions: React.FC<Props> = ({ closeSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const load = useCallback(async () => {
    try {
      const res = await fetchNotifications();
      setNotifications(res || []);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  }, []);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    closeSidebar();
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.notification_id === id ? { ...n, is_read: true } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.notification_id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <button
          onClick={() => { setOpen(!open); closeSidebar(); }}
          className="p-2 rounded-md text-white hover:bg-[#004d5c]"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 mt-2 w-72 bg-white border rounded-lg shadow-lg text-sm z-50">
            <div className="p-3 border-b flex justify-between items-center">
              <div className="font-semibold text-gray-800">Notifications</div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-56 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-3 text-center text-gray-500">No notifications</div>
              ) : (
                notifications.map((n) => (
                  <div key={n.notification_id} className={`p-3 border-b last:border-b-0 flex items-start justify-between ${n.is_read ? 'bg-gray-50' : 'bg-white'}`}>
                    <div className="flex-1 pr-2">
                      <div className={`text-xs ${n.is_read ? 'text-gray-500' : 'text-gray-800 font-medium'}`}>{n.message}</div>
                      <div className="text-[11px] text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                    </div>
                    <div className="flex flex-col items-center gap-1 ml-2">
                      {!n.is_read && (
                        <button onClick={() => handleMarkAsRead(n.notification_id)} className="p-1 text-gray-400 hover:text-green-600 rounded">
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(n.notification_id)} className="p-1 text-gray-400 hover:text-red-500 rounded">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <button onClick={() => { navigate('/account'); closeSidebar(); }} className="p-2 rounded-md text-white hover:bg-[#004d5c]" aria-label="Account">
        <Settings className="w-5 h-5" />
      </button>

      <button onClick={handleLogout} className="p-2 rounded-md text-white hover:bg-[#004d5c]" aria-label="Logout">
        <LogOut className="w-5 h-5" />
      </button>
    </div>
  );
};

export default MobileTopActions;
