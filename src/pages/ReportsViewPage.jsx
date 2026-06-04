import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Download, FileSpreadsheet, Plus, BarChart2, BookOpen, Clock, CheckCircle2, AlertCircle, FileArchive, X, Settings2 } from 'lucide-react';

// ==========================================
// 1. MOCK DATA
// ==========================================
const INITIAL_REPORTS = [
  { id: 1, name: 'May 2026 - IoT Trend Analysis', type: 'PDF', size: '2.4 MB', date: '2026-05-28', status: 'ready' },
  { id: 2, name: 'My Citation Growth Q1', type: 'CSV', size: '850 KB', date: '2026-05-15', status: 'ready' },
];

export default function ReportsViewPage() {
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  
  // State cho Modal (Popup) cấu hình báo cáo
  const [showModal, setShowModal] = useState(false);
  const [customForm, setCustomForm] = useState({
    name: 'My Custom Report',
    format: 'PDF',
    dateRange: '30days',
    includeCitations: true,
    includeAbstracts: false
  });

  const role = sessionStorage.getItem('userRole') || 'academic';

  // HÀM TẠO BÁO CÁO (Xử lý cả Quick Template lẫn Custom Modal)
  const handleGenerateReport = (reportName, type) => {
    setShowModal(false); // Tắt popup nếu đang mở
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
    <div className="w-full h-full min-h-screen bg-[#0B1020] p-8 space-y-6 overflow-y-auto relative">
      
      {/* HEADER */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-black text-white">Reports & Exports</h2>
          <p className="text-sm text-gray-400 mt-1">Generate, customize, and download your analytical data.</p>
        </div>
        <button 
          disabled={isGenerating}
          onClick={() => setShowModal(true)} // Bấm vào đây để mở Modal thay vì tạo luôn
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
          style={{ background: 'linear-gradient(135deg, #4F8CFF, #8B5CF6)' }}
        >
          {isGenerating ? <Clock size={16} className="animate-spin" /> : <Settings2 size={16} />}
          {isGenerating ? 'Generating...' : 'Custom Report'}
        </button>
      </div>

      {/* QUICK TEMPLATES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <motion.div whileHover={{ y: -4 }} className="p-5 rounded-xl border bg-[#1B2235] border-white/10 relative overflow-hidden group">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
            <BarChart2 size={20} />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">Trend Analysis Summary</h3>
          <p className="text-xs text-gray-400 mb-4 line-clamp-2">Visual charts and stats covering your primary research fields.</p>
          <button onClick={() => handleGenerateReport('Trend Analysis Summary', 'PDF')} className="text-xs font-semibold text-[#4F8CFF] hover:text-white transition-colors">Quick PDF →</button>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="p-5 rounded-xl border bg-[#1B2235] border-white/10 relative overflow-hidden group">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
            <BookOpen size={20} />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">Reading List Export</h3>
          <p className="text-xs text-gray-400 mb-4 line-clamp-2">Export your saved papers with full citations (APA/IEEE format).</p>
          <button onClick={() => handleGenerateReport('Reading List Export', 'CSV')} className="text-xs font-semibold text-[#8B5CF6] hover:text-white transition-colors">Quick CSV →</button>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="p-5 rounded-xl border bg-[#1B2235] border-white/10 relative overflow-hidden group">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-teal-500/10 text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-colors">
            <FileText size={20} />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">
            {role === 'researcher' ? 'Author Impact Report' : 'Coursework References'}
          </h3>
          <p className="text-xs text-gray-400 mb-4 line-clamp-2">
            {role === 'researcher' ? 'Detailed metrics on your H-Index and global citations.' : 'Compile references for your academic thesis or assignments.'}
          </p>
          <button onClick={() => handleGenerateReport('Detailed Metrics Report', 'PDF')} className="text-xs font-semibold text-[#00D1B2] hover:text-white transition-colors">Quick PDF →</button>
        </motion.div>
      </div>

      {/* REPORT HISTORY TABLE */}
      <div className="rounded-xl border overflow-hidden mt-8" style={{ background: '#1B2235', borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <h3 className="text-sm font-bold text-white">Report History</h3>
          <span className="text-xs text-gray-400">Showing last 30 days</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                {['Report Name', 'Type', 'Date Generated', 'Size', 'Status', 'Action'].map((h) => (
                  <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {report.type === 'PDF' && <FileText size={16} className="text-red-400" />}
                      {report.type === 'CSV' && <FileSpreadsheet size={16} className="text-green-400" />}
                      {report.type === 'ZIP' && <FileArchive size={16} className="text-yellow-400" />}
                      <span className="text-sm font-semibold text-white">{report.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-white/5 text-gray-300">{report.type}</span>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-400">{report.date}</td>
                  <td className="px-5 py-4 text-xs text-gray-400 font-mono">{report.size}</td>
                  <td className="px-5 py-4">
                    {report.status === 'ready' ? (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 w-fit px-2.5 py-1 rounded-md"><CheckCircle2 size={12} /> Ready</span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-red-400 bg-red-400/10 w-fit px-2.5 py-1 rounded-md"><AlertCircle size={12} /> Expired</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <button 
                      onClick={() => handleDownload(report.id)}
                      disabled={report.status === 'expired' || downloadingId === report.id}
                      className="flex items-center gap-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-white/10 w-[110px] justify-center"
                    >
                      {downloadingId === report.id ? <><Clock size={14} className="animate-spin" /> Downloading</> : <><Download size={14} /> Download</>}
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#131A2A] border border-white/10 rounded-2xl p-6 z-50 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-bold text-white">Customize Report</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors"><X size={20} /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-white block mb-1.5">Report Name</label>
                  <input type="text" value={customForm.name} onChange={(e) => setCustomForm({...customForm, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#1B2235] text-sm text-white outline-none focus:border-[#4F8CFF]" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-white block mb-1.5">Format</label>
                    <select value={customForm.format} onChange={(e) => setCustomForm({...customForm, format: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#1B2235] text-sm text-white outline-none focus:border-[#4F8CFF] appearance-none">
                      <option value="PDF">PDF Document</option>
                      <option value="CSV">CSV / Excel</option>
                      <option value="ZIP">ZIP Archive</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-white block mb-1.5">Date Range</label>
                    <select value={customForm.dateRange} onChange={(e) => setCustomForm({...customForm, dateRange: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#1B2235] text-sm text-white outline-none focus:border-[#4F8CFF] appearance-none">
                      <option value="30days">Last 30 Days</option>
                      <option value="6months">Last 6 Months</option>
                      <option value="1year">Last 1 Year</option>
                      <option value="all">All Time</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-white block mb-2 mt-2">Include Data Columns</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" checked={customForm.includeCitations} onChange={(e) => setCustomForm({...customForm, includeCitations: e.target.checked})} className="w-4 h-4 rounded border-white/20 bg-[#1B2235] accent-[#4F8CFF]" />
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Citation Counts & Metrics</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" checked={customForm.includeAbstracts} onChange={(e) => setCustomForm({...customForm, includeAbstracts: e.target.checked})} className="w-4 h-4 rounded border-white/20 bg-[#1B2235] accent-[#4F8CFF]" />
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Full Paper Abstracts</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-white/10 flex justify-end gap-3">
                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-300 hover:bg-white/5 transition-colors">Cancel</button>
                <button 
                  onClick={() => handleGenerateReport(customForm.name, customForm.format)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:scale-105 transition-transform"
                  style={{ background: 'linear-gradient(135deg, #4F8CFF, #8B5CF6)' }}
                >
                  Generate Now
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}