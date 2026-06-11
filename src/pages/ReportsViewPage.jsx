import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, FileSpreadsheet, BarChart2, BookOpen, Clock, CheckCircle2, AlertCircle, FileArchive, X, Settings2 } from 'lucide-react';

const INITIAL_REPORTS = [
  { id: 1, name: 'May 2026 - IoT Trend Analysis', type: 'PDF', size: '2.4 MB', date: '2026-05-28', status: 'ready' },
  { id: 2, name: 'My Citation Growth Q1', type: 'CSV', size: '850 KB', date: '2026-05-15', status: 'ready' },
];

export default function ReportsViewPage() {
  const { t } = useTranslation('reports');
  const { t: tCommon } = useTranslation('common');
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [customForm, setCustomForm] = useState({
    name: 'My Custom Report',
    format: 'PDF',
    dateRange: '30days',
    includeCitations: true,
    includeAbstracts: false
  });

  const role = sessionStorage.getItem('userRole') || 'academic';

  const handleGenerateReport = (reportName, type) => {
    setShowModal(false);
    setIsGenerating(true);

    setTimeout(() => {
      const newReport = {
        id: Date.now(),
        name: reportName,
        type: type,
        size: `${(Math.random() * 3 + 1).toFixed(1)} MB`,
        date: new Date().toISOString().split('T')[0],
        status: 'ready'
      };

      setReports([newReport, ...reports]);
      setIsGenerating(false);
    }, 2000);
  };

  const handleDownload = (id) => {
    setDownloadingId(id);
    setTimeout(() => setDownloadingId(null), 1500);
  };

  return (
    <div className="w-full h-full min-h-screen p-8 space-y-6 overflow-y-auto relative bg-gray-50 dark:bg-[#0B1020] transition-colors duration-300">

      {/* HEADER */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">{t('heading.title')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('heading.subtitle')}</p>
        </div>
        <button
          disabled={isGenerating}
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 shadow-md shadow-blue-500/20 bg-gradient-to-r from-blue-500 to-purple-600"
        >
          {isGenerating ? <Clock size={16} className="animate-spin" /> : <Settings2 size={16} />}
          {isGenerating ? tCommon('actions.generating') : t('button.customReport')}
        </button>
      </div>

      {/* QUICK TEMPLATES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <motion.div whileHover={{ y: -4 }} className="p-5 rounded-xl border relative overflow-hidden group bg-white dark:bg-[#1B2235] border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none transition-colors">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-colors bg-blue-50 dark:bg-blue-500/10 text-blue-500 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white">
            <BarChart2 size={20} />
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{t('templates.trendAnalysis.name')}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{t('templates.trendAnalysis.description')}</p>
          <button onClick={() => handleGenerateReport(t('templates.trendAnalysis.name'), 'PDF')} className="text-xs font-semibold text-blue-600 dark:text-[#4F8CFF] hover:text-blue-800 dark:hover:text-white transition-colors">{t('templates.trendAnalysis.quickPdf')}</button>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="p-5 rounded-xl border relative overflow-hidden group bg-white dark:bg-[#1B2235] border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none transition-colors">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-colors bg-purple-50 dark:bg-purple-500/10 text-purple-500 dark:text-purple-400 group-hover:bg-purple-500 group-hover:text-white">
            <BookOpen size={20} />
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{t('templates.readingList.name')}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{t('templates.readingList.description')}</p>
          <button onClick={() => handleGenerateReport(t('templates.readingList.name'), 'CSV')} className="text-xs font-semibold text-purple-600 dark:text-[#8B5CF6] hover:text-purple-800 dark:hover:text-white transition-colors">{t('templates.readingList.quickCsv')}</button>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="p-5 rounded-xl border relative overflow-hidden group bg-white dark:bg-[#1B2235] border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none transition-colors">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-colors bg-teal-50 dark:bg-teal-500/10 text-teal-500 dark:text-teal-400 group-hover:bg-teal-500 group-hover:text-white">
            <FileText size={20} />
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
            {role === 'researcher' ? t('templates.authorImpact.name') : t('templates.courseworkRefs.name')}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
            {role === 'researcher' ? t('templates.authorImpact.description') : t('templates.courseworkRefs.description')}
          </p>
          <button onClick={() => handleGenerateReport(t('templates.detailedMetrics'), 'PDF')} className="text-xs font-semibold text-teal-600 dark:text-[#00D1B2] hover:text-teal-800 dark:hover:text-white transition-colors">{t('templates.authorImpact.quickPdf')}</button>
        </motion.div>
      </div>

      {/* REPORT HISTORY TABLE */}
      <div className="rounded-xl border overflow-hidden mt-8 bg-white dark:bg-[#1B2235] border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none transition-colors">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-white/5">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">{t('history.title')}</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">{t('history.showing')}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-transparent">
                {[
                  t('history.columns.reportName'),
                  t('history.columns.type'),
                  t('history.columns.dateGenerated'),
                  t('history.columns.size'),
                  t('history.columns.status'),
                  t('history.columns.action'),
                ].map((h) => (
                  <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {report.type === 'PDF' && <FileText size={16} className="text-red-500 dark:text-red-400" />}
                      {report.type === 'CSV' && <FileSpreadsheet size={16} className="text-emerald-500 dark:text-green-400" />}
                      {report.type === 'ZIP' && <FileArchive size={16} className="text-amber-500 dark:text-yellow-400" />}
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{report.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300">{report.type}</span>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-500 dark:text-gray-400">{report.date}</td>
                  <td className="px-5 py-4 text-xs text-gray-500 dark:text-gray-400 font-mono">{report.size}</td>
                  <td className="px-5 py-4">
                    {report.status === 'ready' ? (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-400/10 w-fit px-2.5 py-1 rounded-md"><CheckCircle2 size={12} /> {tCommon('status.ready')}</span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-400/10 w-fit px-2.5 py-1 rounded-md"><AlertCircle size={12} /> {tCommon('status.expired')}</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleDownload(report.id)}
                      disabled={report.status === 'expired' || downloadingId === report.id}
                      className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-white bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-gray-100 dark:disabled:hover:bg-white/10 w-[110px] justify-center"
                    >
                      {downloadingId === report.id ? <><Clock size={14} className="animate-spin" /> {tCommon('actions.downloading')}</> : <><Download size={14} /> {tCommon('actions.download')}</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: CUSTOMIZE REPORT */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="fixed inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm z-40" />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-[#131A2A] border border-gray-200 dark:border-white/10 rounded-2xl p-6 z-50 shadow-2xl transition-colors"
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('modal.title')}</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><X size={20} /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-900 dark:text-white block mb-1.5">{t('modal.reportName')}</label>
                  <input type="text" value={customForm.name} onChange={(e) => setCustomForm({...customForm, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1B2235] text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 dark:focus:border-[#4F8CFF] transition-colors" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-900 dark:text-white block mb-1.5">{t('modal.format')}</label>
                    <select value={customForm.format} onChange={(e) => setCustomForm({...customForm, format: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1B2235] text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 dark:focus:border-[#4F8CFF] appearance-none transition-colors">
                      <option value="PDF">{t('modal.formatOptions.pdf')}</option>
                      <option value="CSV">{t('modal.formatOptions.csv')}</option>
                      <option value="ZIP">{t('modal.formatOptions.zip')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-900 dark:text-white block mb-1.5">{t('modal.dateRange')}</label>
                    <select value={customForm.dateRange} onChange={(e) => setCustomForm({...customForm, dateRange: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1B2235] text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 dark:focus:border-[#4F8CFF] appearance-none transition-colors">
                      <option value="30days">{t('modal.dateOptions.30days')}</option>
                      <option value="6months">{t('modal.dateOptions.6months')}</option>
                      <option value="1year">{t('modal.dateOptions.1year')}</option>
                      <option value="all">{t('modal.dateOptions.all')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-900 dark:text-white block mb-2 mt-2">{t('modal.includeDataColumns')}</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" checked={customForm.includeCitations} onChange={(e) => setCustomForm({...customForm, includeCitations: e.target.checked})} className="w-4 h-4 rounded border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-[#1B2235] accent-blue-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{t('modal.citationCounts')}</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" checked={customForm.includeAbstracts} onChange={(e) => setCustomForm({...customForm, includeAbstracts: e.target.checked})} className="w-4 h-4 rounded border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-[#1B2235] accent-blue-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{t('modal.fullAbstracts')}</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-gray-200 dark:border-white/10 flex justify-end gap-3 transition-colors">
                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">{tCommon('actions.cancel')}</button>
                <button
                  onClick={() => handleGenerateReport(customForm.name, customForm.format)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity bg-gradient-to-r from-blue-500 to-purple-600 shadow-md shadow-blue-500/20"
                >
                  {tCommon('actions.generate')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
