function UserOverview() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Papers Tracked"
          value="2,847"
          change="+18%"
          Icon={FileText}
          accent="#4F8CFF"
        />
        <StatCard
          label="Total Citations"
          value="52.1M"
          change="+35.7%"
          Icon={TrendingUp}
          accent="#8B5CF6"
        />
        <StatCard
          label="Active Topics"
          value="48"
          change="+6%"
          Icon={Hash}
          accent="#00D1B2"
        />
        <StatCard
          label="AI Insights"
          value="127"
          change="+24%"
          Icon={Brain}
          accent="#F59E0B"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div
          className="lg:col-span-2 rounded-xl border p-5"
          style={{
            background: '#1B2235',
            borderColor: 'rgba(255,255,255,0.07)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">
                Publication Trends
              </h3>
              <p className="text-xs mt-0.5" style={{ color: '#A0AEC0' }}>
                Monthly papers by research field — 2024
              </p>
            </div>
            <div
              className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: '#4F8CFF1A', color: '#4F8CFF' }}
            >
              2024
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={PUB_DATA}>
              <defs>
                {[
                  { id: 'oa1', c: '#4F8CFF' },
                  { id: 'oa2', c: '#8B5CF6' },
                  { id: 'oa3', c: '#00D1B2' },
                ].map((g) => (
                  <linearGradient
                    key={g.id}
                    id={g.id}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor={g.c} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={g.c} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
              />
              <XAxis
                dataKey="m"
                tick={{ fill: '#A0AEC0', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#A0AEC0', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={42}
              />
              <Tooltip
                contentStyle={{
                  background: '#0B1020',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  fontSize: 11,
                }}
              />
              <Area
                type="monotone"
                dataKey="ai"
                stroke="#4F8CFF"
                fill="url(#oa1)"
                strokeWidth={2}
                name="AI & ML"
              />
              <Area
                type="monotone"
                dataKey="bio"
                stroke="#8B5CF6"
                fill="url(#oa2)"
                strokeWidth={2}
                name="Biotech"
              />
              <Area
                type="monotone"
                dataKey="cli"
                stroke="#00D1B2"
                fill="url(#oa3)"
                strokeWidth={2}
                name="Climate"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div
          className="rounded-xl border p-5"
          style={{
            background: '#1B2235',
            borderColor: 'rgba(255,255,255,0.07)',
          }}
        >
          <h3 className="text-sm font-bold text-white mb-4">Research Fields</h3>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie
                data={FIELD_DATA}
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={58}
                dataKey="v"
                stroke="none"
                paddingAngle={2}
              >
                {FIELD_DATA.map((f, i) => (
                  <Cell key={i} fill={f.c} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#0B1020',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  fontSize: 11,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {FIELD_DATA.map((f) => (
              <div
                key={f.n}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: f.c }}
                  />
                  <span style={{ color: '#A0AEC0' }}>{f.n}</span>
                </div>
                <span
                  className="font-semibold"
                  style={{
                    color: f.c,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {f.v}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div
        className="rounded-xl border p-5"
        style={{ background: '#1B2235', borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Brain size={15} style={{ color: '#00D1B2' }} />
          <h3 className="text-sm font-bold text-white">
            AI-Powered Research Insights
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {INSIGHTS.map((ins) => (
            <motion.div
              key={ins.topic}
              whileHover={{ y: -3 }}
              className="rounded-lg p-4 cursor-default"
              style={{ background: '#131A2A', border: `1px solid ${ins.c}1A` }}
            >
              <div className="text-xs font-bold text-white mb-1.5">
                {ins.topic}
              </div>
              <div
                className="text-xs leading-relaxed mb-3"
                style={{ color: '#A0AEC0' }}
              >
                {ins.desc}
              </div>
              <div className="flex items-center justify-between">
                <span
                  className="text-xs"
                  style={{
                    color: '#6B7280',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {ins.papers.toLocaleString()}
                </span>
                <span
                  className="text-xs font-bold"
                  style={{
                    color: ins.c,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {ins.growth}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Papers table */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: '#1B2235', borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <div
          className="flex items-center justify-between p-5 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.07)' }}
        >
          <h3 className="text-sm font-bold text-white">
            Trending Research Papers
          </h3>
          <div className="flex gap-2">
            <button
              className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
              style={{ background: '#131A2A', color: '#A0AEC0' }}
            >
              <Filter size={11} /> Filter
            </button>
            <button
              className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
              style={{ background: '#131A2A', color: '#A0AEC0' }}
            >
              <Download size={11} /> Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                className="border-b"
                style={{ borderColor: 'rgba(255,255,255,0.04)' }}
              >
                {[
                  'Title',
                  'Authors',
                  'Year',
                  'Citations',
                  'Field',
                  'Trend',
                ].map((h) => (
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
              {PAPERS.map((p, i) => (
                <tr
                  key={i}
                  className="border-b hover:bg-white/[0.02] transition-colors"
                  style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                >
                  <td className="px-5 py-3.5">
                    <span
                      className="text-xs font-semibold text-white block"
                      style={{ maxWidth: 280 }}
                    >
                      {p.title}
                    </span>
                  </td>
                  <td
                    className="px-5 py-3.5 text-xs whitespace-nowrap"
                    style={{ color: '#A0AEC0' }}
                  >
                    {p.authors}
                  </td>
                  <td
                    className="px-5 py-3.5 text-xs"
                    style={{
                      color: '#A0AEC0',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {p.year}
                  </td>
                  <td
                    className="px-5 py-3.5 text-xs font-semibold text-white"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {p.citations.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <GlowBadge
                      color={
                        FIELD_DATA.find((f) => f.n === p.field)?.c ?? '#4F8CFF'
                      }
                    >
                      {p.field}
                    </GlowBadge>
                  </td>
                  <td
                    className="px-5 py-3.5 text-xs font-semibold"
                    style={{
                      color: '#00D1B2',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {p.trend}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
