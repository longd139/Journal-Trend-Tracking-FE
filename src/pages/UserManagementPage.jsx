import { useState } from 'react';
import { Search, Plus, MoreHorizontal } from 'lucide-react';

// ==========================================
// 1. COMPONENTS
// ==========================================
const GlowBadge = ({ color, children }) => (
  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border" style={{ background: `${color}10`, color: color, borderColor: `${color}25`, textShadow: `0 0 10px ${color}40` }}>
    {children}
  </span>
);

const StatusPill = ({ status }) => {
  const colors = {
    active: { bg: '#00D1B21A', text: '#00D1B2' },
    offline: { bg: '#6B72801A', text: '#A0AEC0' },
    suspended: { bg: '#EF44441A', text: '#EF4444' },
  };
  const c = colors[status.toLowerCase()] || colors.active;
  
  return (
    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" style={{ background: c.bg, color: c.text }}>
      {status}
    </span>
  );
};

// ==========================================
// 2. DỮ LIỆU GIẢ (Mock Data)
// ==========================================
const FIELD_DATA = [
  { n: 'AI & ML', v: 45, c: '#4F8CFF' },
  { n: 'Biotech', v: 30, c: '#8B5CF6' },
  { n: 'Climate', v: 25, c: '#00D1B2' }
];

const USERS_TABLE = [
  { id: 1, name: 'Sarah Chen', email: 'sarah.c@mit.edu', role: 'Researcher', papers: 142, status: 'Active', last: '2 mins ago' },
  { id: 2, name: 'Michael Ross', email: 'm.ross@stanford.edu', role: 'Professor', papers: 89, status: 'Active', last: '1 hour ago' },
  { id: 3, name: 'Elena Gilbert', email: 'elena.g@harvard.edu', role: 'Student', papers: 12, status: 'Offline', last: '2 days ago' },
  { id: 4, name: 'David Kim', email: 'dkim@berkeley.edu', role: 'Researcher', papers: 56, status: 'Suspended', last: '1 week ago' },
];

// ==========================================
// 3. GIAO DIỆN CHÍNH (Đã thêm export default)
// ==========================================
export default function UserManagement() {
  const [search, setSearch] = useState('');
  
  const filtered = USERS_TABLE.filter(
    (u) =>
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 p-8">
      {/* Thanh tìm kiếm & Nút Add */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#A0AEC0' }} />
          <input
            type="text"
            placeholder="Search users by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2.5 rounded-xl border text-xs outline-none transition-colors"
            style={{ background: '#1B2235', borderColor: 'rgba(255,255,255,0.09)', color: '#E2E8F0' }}
          />
        </div>
        <button
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 hover:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #4F8CFF, #8B5CF6)' }}
        >
          <Plus size={13} /> Add User
        </button>
      </div>

      {/* Bảng Danh sách User */}
      <div className="rounded-xl border overflow-hidden" style={{ background: '#1B2235', borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                {['User', 'Role', 'Papers', 'Status', 'Last Active', ''].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold" style={{ color: '#6B7280' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id} className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                  {/* Cột User */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: `linear-gradient(135deg, ${FIELD_DATA[i % FIELD_DATA.length].c}, #8B5CF6)` }}
                      >
                        {u.name.split(' ').slice(-1)[0][0]}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{u.name}</div>
                        <div className="text-[10px]" style={{ color: '#A0AEC0' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  {/* Cột Role */}
                  <td className="px-5 py-3.5">
                    <GlowBadge color="#8B5CF6">{u.role}</GlowBadge>
                  </td>
                  {/* Cột Papers */}
                  <td className="px-5 py-3.5 text-xs font-semibold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {u.papers}
                  </td>
                  {/* Cột Status */}
                  <td className="px-5 py-3.5">
                    <StatusPill status={u.status} />
                  </td>
                  {/* Cột Last Active */}
                  <td className="px-5 py-3.5 text-xs" style={{ color: '#A0AEC0', fontFamily: "'JetBrains Mono', monospace" }}>
                    {u.last}
                  </td>
                  {/* Cột Thao tác */}
                  <td className="px-5 py-3.5 text-right">
                    <button className="p-1 hover:text-white transition-colors rounded hover:bg-white/5" style={{ color: '#6B7280' }}>
                      <MoreHorizontal size={15} />
                    </button>
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