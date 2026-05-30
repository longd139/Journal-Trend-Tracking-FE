function ReportsView() {
  const reports = [
    {
      title: 'Q4 2024 AI Research Landscape Report',
      date: 'Dec 28, 2024',
      type: 'Quarterly',
      size: '2.4 MB',
      status: 'ready',
    },
    {
      title: 'Citation Impact Analysis — NLP & LLMs',
      date: 'Dec 15, 2024',
      type: 'Topic Analysis',
      size: '1.1 MB',
      status: 'ready',
    },
    {
      title: 'Emerging Fields Forecast 2025',
      date: 'Dec 10, 2024',
      type: 'Forecast',
      size: '3.8 MB',
      status: 'ready',
    },
    {
      title: 'Biotechnology Publication Trends',
      date: 'Nov 30, 2024',
      type: 'Field Report',
      size: '1.7 MB',
      status: 'ready',
    },
    {
      title: 'API Data Quality & Availability Audit',
      date: 'Nov 22, 2024',
      type: 'System',
      size: '0.9 MB',
      status: 'ready',
    },
  ];
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: '#A0AEC0' }}>
          {reports.length} reports available
        </p>
        <button
          className="px-4 py-2 rounded-lg text-xs font-bold text-white flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg, #4F8CFF, #8B5CF6)' }}
        >
          <Plus size={13} /> Generate Report
        </button>
      </div>
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: '#1B2235', borderColor: 'rgba(255,255,255,0.07)' }}
      >
        {reports.map((r, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-white/[0.02] transition-colors"
            style={{ borderColor: 'rgba(255,255,255,0.04)' }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: '#4F8CFF1A' }}
              >
                <FileText size={15} style={{ color: '#4F8CFF' }} />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  {r.title}
                </div>
                <div
                  className="text-xs mt-0.5 flex items-center gap-2"
                  style={{ color: '#A0AEC0' }}
                >
                  <span>{r.type}</span>
                  <span>·</span>
                  <span>{r.date}</span>
                  <span>·</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {r.size}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <StatusPill status={r.status} />
              <button
                className="p-2 rounded-lg transition-colors hover:text-white"
                style={{ color: '#A0AEC0' }}
              >
                <Download size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
