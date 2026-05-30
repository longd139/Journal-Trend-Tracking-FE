function DatabaseView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Size"
          value="2.4 TB"
          change="+5.1%"
          Icon={Database}
          accent="#8B5CF6"
        />
        <StatCard
          label="Total Records"
          value="471M"
          change="+3.8%"
          Icon={Hash}
          accent="#4F8CFF"
        />
        <StatCard
          label="Queries / sec"
          value="18.4K"
          change="+12%"
          Icon={Zap}
          accent="#00D1B2"
        />
        <StatCard
          label="Cache Hit Rate"
          value="94.2%"
          change="+1.8%"
          Icon={Cpu}
          accent="#F59E0B"
        />
      </div>
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: '#1B2235', borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <div
          className="p-5 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.07)' }}
        >
          <h3 className="text-sm font-bold text-white">Database Tables</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr
              className="border-b"
              style={{ borderColor: 'rgba(255,255,255,0.04)' }}
            >
              {['Table', 'Rows', 'Size', 'Growth', 'Status'].map((h) => (
                <th
                  key={h}
                  className="text-left px-5 py-3 text-xs font-semibold"
                  style={{ color: '#6B7280' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DB_TABLES.map((t) => (
              <tr
                key={t.name}
                className="border-b hover:bg-white/[0.02] transition-colors"
                style={{ borderColor: 'rgba(255,255,255,0.04)' }}
              >
                <td
                  className="px-5 py-3.5 text-xs font-semibold"
                  style={{
                    color: '#4F8CFF',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {t.name}
                </td>
                <td
                  className="px-5 py-3.5 text-xs text-white"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {t.rows}
                </td>
                <td
                  className="px-5 py-3.5 text-xs text-white"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {t.size}
                </td>
                <td
                  className="px-5 py-3.5 text-xs font-semibold"
                  style={{
                    color: '#00D1B2',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {t.growth}
                </td>
                <td className="px-5 py-3.5">
                  <StatusPill status={t.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
