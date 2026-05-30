function AdminOverview() {
  const hourlyData = PUB_DATA.slice(-8).map((d, i) => ({
    h: `${8 + i * 2}:00`,
    req: Math.round((d.ai + d.bio) / 14),
  }));
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Users"
          value="12,847"
          change="+8.4%"
          Icon={Users}
          accent="#4F8CFF"
        />
        <StatCard
          label="API Health"
          value="98.7%"
          change="+0.3%"
          Icon={Server}
          accent="#00D1B2"
        />
        <StatCard
          label="DB Size"
          value="2.4 TB"
          change="+5.1%"
          Icon={Database}
          accent="#8B5CF6"
        />
        <StatCard
          label="System Load"
          value="34%"
          change="-12%"
          Icon={Cpu}
          accent="#F59E0B"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div
          className="rounded-xl border p-5"
          style={{
            background: '#1B2235',
            borderColor: 'rgba(255,255,255,0.07)',
          }}
        >
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Activity size={14} style={{ color: '#00D1B2' }} /> API Status
            Overview
          </h3>
          <div className="space-y-2.5">
            {APIS.map((api) => (
              <div
                key={api.name}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ background: '#131A2A' }}
              >
                <div className="flex items-center gap-3">
                  <StatusPill status={api.status} />
                  <span className="text-sm font-medium text-white">
                    {api.name}
                  </span>
                </div>
                <div
                  className="flex gap-6 text-xs"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  <span style={{ color: '#A0AEC0' }}>{api.lat}</span>
                  <span style={{ color: '#00D1B2' }}>{api.up}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div
          className="rounded-xl border p-5"
          style={{
            background: '#1B2235',
            borderColor: 'rgba(255,255,255,0.07)',
          }}
        >
          <h3 className="text-sm font-bold text-white mb-4">
            Request Volume (24h)
          </h3>
          <ResponsiveContainer width="100%" height={185}>
            <BarChart data={hourlyData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
              />
              <XAxis
                dataKey="h"
                tick={{ fill: '#A0AEC0', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#A0AEC0', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Tooltip
                contentStyle={{
                  background: '#0B1020',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  fontSize: 11,
                }}
              />
              <Bar
                dataKey="req"
                fill="#4F8CFF"
                radius={[3, 3, 0, 0]}
                opacity={0.8}
                name="Requests"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: '#1B2235', borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <div
          className="p-5 border-b flex items-center justify-between"
          style={{ borderColor: 'rgba(255,255,255,0.07)' }}
        >
          <h3 className="text-sm font-bold text-white">Recent User Activity</h3>
        </div>
        {USERS_TABLE.slice(0, 4).map((u, i) => (
          <div
            key={u.id}
            className="flex items-center gap-4 p-4 border-b last:border-b-0 hover:bg-white/[0.02] transition-colors"
            style={{ borderColor: 'rgba(255,255,255,0.04)' }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{
                background: `linear-gradient(135deg, ${FIELD_DATA[i % FIELD_DATA.length].c}, #8B5CF6)`,
              }}
            >
              {u.name.split(' ').slice(-1)[0][0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white">{u.name}</div>
              <div className="text-xs" style={{ color: '#A0AEC0' }}>
                {u.email}
              </div>
            </div>
            <StatusPill status={u.status} />
            <span
              className="text-xs hidden md:block"
              style={{
                color: '#6B7280',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {u.last}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
