function UserManagement() {
  const [search, setSearch] = useState('');
  const filtered = USERS_TABLE.filter(
    (u) =>
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="space-y-5">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: '#A0AEC0' }}
          />
          <input
            type="text"
            placeholder="Search users by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2.5 rounded-xl border text-xs outline-none"
            style={{
              background: '#1B2235',
              borderColor: 'rgba(255,255,255,0.09)',
              color: '#E2E8F0',
            }}
          />
        </div>
        <button
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg, #4F8CFF, #8B5CF6)' }}
        >
          <Plus size={13} /> Add User
        </button>
      </div>
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: '#1B2235', borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <table className="w-full">
          <thead>
            <tr
              className="border-b"
              style={{ borderColor: 'rgba(255,255,255,0.04)' }}
            >
              {['User', 'Role', 'Papers', 'Status', 'Last Active', ''].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-semibold"
                    style={{ color: '#6B7280' }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr
                key={u.id}
                className="border-b hover:bg-white/[0.02] transition-colors"
                style={{ borderColor: 'rgba(255,255,255,0.04)' }}
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${FIELD_DATA[i % FIELD_DATA.length].c}, #8B5CF6)`,
                      }}
                    >
                      {u.name.split(' ').slice(-1)[0][0]}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">
                        {u.name}
                      </div>
                      <div className="text-[10px]" style={{ color: '#A0AEC0' }}>
                        {u.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <GlowBadge color="#8B5CF6">{u.role}</GlowBadge>
                </td>
                <td
                  className="px-5 py-3.5 text-xs font-semibold text-white"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {u.papers}
                </td>
                <td className="px-5 py-3.5">
                  <StatusPill status={u.status} />
                </td>
                <td
                  className="px-5 py-3.5 text-xs"
                  style={{
                    color: '#A0AEC0',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {u.last}
                </td>
                <td className="px-5 py-3.5">
                  <button
                    className="hover:text-white transition-colors"
                    style={{ color: '#6B7280' }}
                  >
                    <MoreHorizontal size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
