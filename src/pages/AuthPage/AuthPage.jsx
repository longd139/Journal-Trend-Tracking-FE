function AuthPage({ mode, navigate }) {
  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'user',
    name: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate(form.role === 'admin' ? 'adminDash' : 'userDash');
    }, 1100);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: '#0B1020' }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full blur-3xl opacity-[0.14]"
          style={{ background: '#4F8CFF' }}
        />
        <div
          className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full blur-3xl opacity-10"
          style={{ background: '#8B5CF6' }}
        />
        {PARTICLES.slice(0, 18).map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.left}%`,
              top: `${p.top}%`,
              background: p.color,
              opacity: 0.18,
            }}
            animate={{ y: [0, -20, 0] }}
            transition={{
              duration: p.dur,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 w-full max-w-md mx-6"
      >
        <div className="flex items-center justify-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4F8CFF, #8B5CF6)' }}
          >
            <Microscope size={18} className="text-white" />
          </div>
          <span
            className="text-lg font-black text-white tracking-widest"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            SCITRACK
          </span>
        </div>

        <div
          className="rounded-2xl border p-8"
          style={{
            background: 'rgba(27,34,53,0.85)',
            borderColor: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(24px)',
          }}
        >
          <h2
            className="text-2xl font-black text-white mb-1"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-sm mb-6" style={{ color: '#A0AEC0' }}>
            {mode === 'login'
              ? 'Sign in to your research dashboard'
              : 'Start your academic intelligence journey'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-xs font-semibold text-white block mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Dr. Sarah Chen"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                  style={{
                    background: '#131A2A',
                    borderColor: 'rgba(255,255,255,0.1)',
                    color: '#E2E8F0',
                  }}
                />
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-white block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#A0AEC0' }}
                />
                <input
                  type="email"
                  placeholder="you@university.edu"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none"
                  style={{
                    background: '#131A2A',
                    borderColor: 'rgba(255,255,255,0.1)',
                    color: '#E2E8F0',
                  }}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-white block mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#A0AEC0' }}
                />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none"
                  style={{
                    background: '#131A2A',
                    borderColor: 'rgba(255,255,255,0.1)',
                    color: '#E2E8F0',
                  }}
                />
              </div>
            </div>

            {/* Role selection */}
            <div>
              <label className="text-xs font-semibold text-white block mb-2">
                Access Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    id: 'user',
                    label: 'Researcher',
                    desc: 'User Dashboard',
                    Icon: BookOpen,
                  },
                  {
                    id: 'admin',
                    label: 'Administrator',
                    desc: 'Admin Console',
                    Icon: Shield,
                  },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, role: r.id }))}
                    className="p-3 rounded-xl border text-left transition-all"
                    style={{
                      background: form.role === r.id ? '#4F8CFF1A' : '#131A2A',
                      borderColor:
                        form.role === r.id
                          ? '#4F8CFF55'
                          : 'rgba(255,255,255,0.08)',
                    }}
                  >
                    <r.Icon
                      size={14}
                      style={{
                        color: form.role === r.id ? '#4F8CFF' : '#A0AEC0',
                      }}
                      className="mb-1.5"
                    />
                    <div
                      className="text-xs font-bold"
                      style={{
                        color: form.role === r.id ? '#4F8CFF' : 'white',
                      }}
                    >
                      {r.label}
                    </div>
                    <div className="text-[10px]" style={{ color: '#A0AEC0' }}>
                      {r.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {mode === 'login' && (
              <div className="flex items-center justify-between text-xs">
                <label
                  className="flex items-center gap-2 cursor-pointer"
                  style={{ color: '#A0AEC0' }}
                >
                  <input type="checkbox" className="rounded" /> Remember me
                </label>
                <button
                  type="button"
                  className="font-semibold"
                  style={{ color: '#4F8CFF' }}
                >
                  Forgot password?
                </button>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #4F8CFF, #8B5CF6)',
                opacity: loading ? 0.8 : 1,
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                </>
              ) : mode === 'login' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </motion.button>
          </form>

          <div
            className="mt-6 pt-5 border-t text-center text-xs"
            style={{ borderColor: 'rgba(255,255,255,0.07)', color: '#A0AEC0' }}
          >
            {mode === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => navigate('register')}
                  className="font-semibold"
                  style={{ color: '#4F8CFF' }}
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => navigate('login')}
                  className="font-semibold"
                  style={{ color: '#4F8CFF' }}
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>

        <button
          onClick={() => navigate('landing')}
          className="mt-5 w-full text-center text-xs transition-colors hover:text-white"
          style={{ color: '#6B7280' }}
        >
          ← Back to landing page
        </button>
      </motion.div>
    </div>
  );
}
