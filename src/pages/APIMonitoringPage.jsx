function APIMonitoring() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Avg Uptime"
          value="98.7%"
          change="+0.3%"
          Icon={CheckCircle}
          accent="#00D1B2"
        />
        <StatCard
          label="Requests / day"
          value="429.4K"
          change="+11%"
          Icon={Activity}
          accent="#4F8CFF"
        />
        <StatCard
          label="Avg Latency"
          value="1.0ms"
          change="-8%"
          Icon={Zap}
          accent="#8B5CF6"
        />
        <StatCard
          label="Error Rate"
          value="0.03%"
          change="-15%"
          Icon={AlertCircle}
          accent="#F59E0B"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {APIS.map((api) => (
          <div
            key={api.name}
            className="rounded-xl border p-5"
            style={{
              background: '#1B2235',
              borderColor: 'rgba(255,255,255,0.07)',
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">{api.name}</h3>
                <p className="text-xs mt-0.5" style={{ color: '#A0AEC0' }}>
                  {api.req} requests today
                </p>
              </div>
              <StatusPill status={api.status} />
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { l: 'Uptime', v: `${api.up}%`, c: '#00D1B2' },
                { l: 'Latency', v: api.lat, c: '#4F8CFF' },
                { l: 'Requests', v: api.req, c: '#8B5CF6' },
              ].map((s) => (
                <div
                  key={s.l}
                  className="rounded-lg p-3 text-center"
                  style={{ background: '#131A2A' }}
                >
                  <div
                    className="text-base font-black"
                    style={{ color: s.c, fontFamily: "'Outfit', sans-serif" }}
                  >
                    {s.v}
                  </div>
                  <div
                    className="text-[10px] mt-0.5"
                    style={{ color: '#A0AEC0' }}
                  >
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div
                className="flex justify-between text-[10px] mb-1.5"
                style={{ color: '#A0AEC0' }}
              >
                <span>Uptime</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {api.up}%
                </span>
              </div>
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: '#131A2A' }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${api.up}%`,
                    background: api.status === 'ok' ? '#00D1B2' : '#F59E0B',
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
