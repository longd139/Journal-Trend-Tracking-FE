import { useState } from 'react';
import { Bell, MessageSquare, X, ChevronRight, FileText, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'New Citations', desc: 'Paper "IoT Architecture" got 5 new citations.', detail: 'Your paper has been referenced by 5 new articles in IEEE Internet of Things journal.', time: '2m ago', read: false },
  { id: 2, title: 'Trend Alert', desc: 'Embedded C/C++ usage increased by 15%.', detail: 'The demand for Embedded C/C++ in IoT edge computing has seen a significant surge in Q2 2026.', time: '1h ago', read: false },
  { id: 3, title: 'System Notification', desc: 'Monthly system report is ready.', detail: 'Your report "May 2026 Trends" has been compiled and is ready for download.', time: '3h ago', read: true },
  { id: 4, title: 'Security Alert', desc: 'New login detected on your account.', detail: 'A new login from IP 192.168.1.1 was detected. If this wasn\'t you, please change your password.', time: '1d ago', read: true },
];

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [notifs, setNotifs] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifs.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="relative">
      <motion.button 
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)} 
        className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-[#1B2235] border border-gray-200 dark:border-white/5 hover:border-blue-500/50 transition-all shadow-sm dark:shadow-lg"
      >
        <Bell size={18} className="text-gray-500 dark:text-gray-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-blue-600 text-[10px] font-bold text-white rounded-full border-2 border-white dark:border-[#0B1020]">
            {unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && !selectedNotif && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }}
            className="absolute right-0 top-14 w-96 rounded-2xl bg-white dark:bg-[#0B1020]/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm tracking-wide">Notifications</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white"><X size={16} /></button>
            </div>

            {/* Danh sách cuộn được */}
            <div className="max-h-[400px] overflow-y-auto p-2 scrollbar-thin">
              {notifs.map(n => (
                <div key={n.id} onClick={() => { setSelectedNotif(n); markAsRead(n.id); }} className={`p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-white/5 ${!n.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 p-2 rounded-full ${!n.read ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'bg-gray-200 dark:bg-gray-500/10 text-gray-500'}`}>
                      <MessageSquare size={14} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className={`text-xs font-bold ${!n.read ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{n.title}</h4>
                        <span className="text-[10px] text-gray-400">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">{n.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Màn hình chi tiết */}
        {selectedNotif && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="absolute right-0 top-14 w-96 rounded-2xl bg-white dark:bg-[#131A2A] border border-gray-200 dark:border-blue-500/30 shadow-2xl z-50 p-6"
          >
            <button onClick={() => setSelectedNotif(null)} className="text-blue-600 dark:text-blue-400 text-xs font-bold mb-4 flex items-center gap-1 hover:underline">← Back</button>
            <div className="p-4 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 w-fit mb-4"><FileText size={24} /></div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">{selectedNotif.title}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-8">{selectedNotif.detail}</p>
            <button className="w-full py-3 bg-blue-600 rounded-xl text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">View Document</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}