import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, MessageSquare, X, ChevronRight, FileText, Check, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { adminAPI } from '../lib/api/admin.api';

const MOCK_NOTIFICATIONS = [
 { id: 1, titleKey: 'newCitations', descKey: 'newCitationsDesc', detailKey: 'newCitationsDetail', timeKey: '2mAgo', read: false },
 { id: 2, titleKey: 'trendAlert', descKey: 'trendAlertDesc', detailKey: 'trendAlertDetail', timeKey: '1hAgo', read: false },
 { id: 3, titleKey: 'systemNotification', descKey: 'systemNotifDesc', detailKey: 'systemNotifDetail', timeKey: '3hAgo', read: true },
 { id: 4, titleKey: 'securityAlert', descKey: 'securityAlertDesc', detailKey: 'securityAlertDetail', timeKey: '1dAgo', read: true },
];

export default function NotificationBell() {
 const { t } = useTranslation('common');
 const [isOpen, setIsOpen] = useState(false);
 const [selectedNotif, setSelectedNotif] = useState(null);
 const [notifs, setNotifs] = useState(MOCK_NOTIFICATIONS);

 const userRole = sessionStorage.getItem('userRole');
 const isAdmin = userRole === 'admin';

 // Fetch sync notifications for admin
 useEffect(() => {
 if (!isAdmin) return;
 const fetchSyncNotifs = async () => {
  try {
  const response = await adminAPI.getSyncNotifications();
  const data = response.data || response;
  if (data && data.message) {
   const syncNotif = {
   id: 'sync-notif',
   title: 'Sync Notification',
   titleKey: null,
   desc: data.message,
   descKey: null,
   detail: JSON.stringify(data, null, 2),
   time: new Date(response.timestamp || Date.now()).toLocaleString(),
   timeKey: null,
   read: false,
   isSync: true,
   };
   setNotifs((prev) => {
   const filtered = prev.filter((n) => n.id !== 'sync-notif');
   return [syncNotif, ...filtered];
   });
  }
  } catch {
  // Silently fail — sync notifications are supplementary
  }
 };
 fetchSyncNotifs();
 const interval = setInterval(fetchSyncNotifs, 60000);
 return () => clearInterval(interval);
 }, [isAdmin]);

 const unreadCount = notifs.filter(n => !n.read).length;

 const markAsRead = (id) => {
 setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
 };

 const renderNotifTitle = (n) => {
 if (n.titleKey) return t(`notifications.${n.titleKey}`, { ns: 'common' });
 return n.title;
 };

 const renderNotifDesc = (n) => {
 if (n.descKey) return t(`notifications.${n.descKey}`, { ns: 'common' });
 return n.desc;
 };

 const renderNotifTime = (n) => {
 if (n.timeKey) return t(`notifications.${n.timeKey}`, { ns: 'common' });
 return n.time;
 };

 const renderNotifDetail = (n) => {
 if (n.detailKey) return t(`notifications.${n.detailKey}`, { ns: 'common' });
 return n.detail;
 };

 return (
 <div className="relative">
  <motion.button
  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
  onClick={() => setIsOpen(!isOpen)}
  className="relative p-2.5 rounded-xl bg-gray-100 bg-[#101010] border border-gray-200 border-[#DEDBC8]/5 hover:border-blue-500/50 transition-all shadow-sm dark:shadow-lg"
  >
  <Bell size={18} className="text-gray-500 text-gray-400" />
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
   className="absolute right-0 top-14 w-96 rounded-2xl bg-white bg-transparent/95 backdrop-blur-xl border border-[#DEDBC8]/10 shadow-2xl z-50 overflow-hidden"
   >
   <div className="px-5 py-4 border-b border-[#DEDBC8]/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
    <h3 className="font-bold text-[#E1E0CC] text-sm tracking-wide">{t('notifications.title')}</h3>
    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white"><X size={16} /></button>
   </div>

   <div className="max-h-[400px] overflow-y-auto p-2 scrollbar-thin">
    {notifs.map(n => (
    <div
     key={n.id}
     onClick={() => { setSelectedNotif(n); markAsRead(n.id); }}
     className={`p-4 rounded-xl hover:bg-white/[0.04] hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-white/5 ${!n.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
    >
     <div className="flex items-start gap-3">
     <div className={`mt-1 p-2 rounded-full ${!n.read
      ? n.isSync ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-blue-500/20 text-[#DEDBC8]'
      : 'bg-gray-200 dark:bg-gray-500/10 text-gray-500'}`}
     >
      {n.isSync ? <RefreshCw size={14} /> : <MessageSquare size={14} />}
     </div>
     <div className="flex-1">
      <div className="flex justify-between items-center mb-1">
      <h4 className={`text-xs font-bold ${!n.read ? 'text-[#E1E0CC]' : 'text-gray-400'}`}>
       {renderNotifTitle(n)}
      </h4>
      <span className="text-[10px] text-gray-400">{renderNotifTime(n)}</span>
      </div>
      <p className="text-[11px] text-gray-500 text-gray-400 leading-relaxed">
      {renderNotifDesc(n)}
      </p>
     </div>
     </div>
    </div>
    ))}
   </div>
   </motion.div>
  )}

  {selectedNotif && (
   <motion.div
   initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
   className="absolute right-0 top-14 w-96 rounded-2xl bg-white bg-[#0A0A0A] border border-gray-200 dark:border-blue-500/30 shadow-2xl z-50 p-6"
   >
   <button onClick={() => setSelectedNotif(null)} className="text-[#DEDBC8] text-xs font-bold mb-4 flex items-center gap-1 hover:underline">{t('notifications.back')}</button>
   <div className={`p-4 rounded-full w-fit mb-4 ${selectedNotif.isSync ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-blue-50 dark:bg-blue-500/10 text-[#DEDBC8]'}`}>
    {selectedNotif.isSync ? <RefreshCw size={24} /> : <FileText size={24} />}
   </div>
   <h2 className="text-base font-bold text-[#E1E0CC] mb-2">{renderNotifTitle(selectedNotif)}</h2>
   <p className="text-xs text-gray-500 text-gray-400 leading-relaxed mb-8 whitespace-pre-wrap font-mono">
    {renderNotifDetail(selectedNotif)}
   </p>
   <button
    onClick={() => setSelectedNotif(null)}
    className="w-full py-3 bg-blue-600 rounded-xl text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
   >
    {t('notifications.back')}
   </button>
   </motion.div>
  )}
  </AnimatePresence>
 </div>
 );
}
