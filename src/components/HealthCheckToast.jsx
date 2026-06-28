import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, CheckCircle2, XCircle, Server, X } from 'lucide-react';
import { healthAPI } from '../lib/api/health.api';

const POLL_INTERVAL = 3000;
const SUCCESS_DISPLAY_DURATION = 5000;

export default function HealthCheckToast() {
  const [phase, setPhase] = useState('checking'); // 'checking' | 'degraded' | 'ready' | 'error'
  const [statusData, setStatusData] = useState(null);
  const [message, setMessage] = useState('Checking system status…');
  const [detail, setDetail] = useState('');
  const [visible, setVisible] = useState(true);
  const intervalRef = useRef(null);
  const successTimerRef = useRef(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const checkHealth = useCallback(async () => {
    try {
      const res = await healthAPI.check();
      const d = res?.data || res;

      if (!d) {
        setPhase('error');
        setMessage('Unable to parse server response');
        setDetail('');
        return;
      }

      setStatusData(d);

      if (d.status === 'READY') {
        setPhase('ready');
        setMessage('System Ready');
        setDetail('');
        stopPolling();

        // Auto-dismiss after 5 seconds
        successTimerRef.current = setTimeout(() => {
          setVisible(false);
        }, SUCCESS_DISPLAY_DURATION);
      } else {
        // DEGRADED
        setPhase('degraded');
        setMessage('System is starting up');

        // Build detail about which services are down
        const downServices = [];
        if (d.databaseConnected === false) downServices.push('SQL Server');
        if (d.neo4jConnected === false) downServices.push('Neo4j');

        if (downServices.length === 2) {
          setDetail('SQL Server & Neo4j unavailable');
        } else if (downServices.length === 1) {
          setDetail(`${downServices[0]} unavailable`);
        } else {
          setDetail('');
        }
      }
    } catch (err) {
      setPhase('error');
      setMessage('Cannot connect to server');
      setDetail(err.message || 'Backend is unreachable');
    }
  }, [stopPolling]);

  useEffect(() => {
    // Initial check immediately
    checkHealth();

    // Poll every 3 seconds
    intervalRef.current = setInterval(checkHealth, POLL_INTERVAL);

    return () => {
      stopPolling();
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }
    };
  }, [checkHealth, stopPolling]);

  // Don't render anything after the success animation finishes
  if (phase === 'ready' && !visible) return null;

  const isGood = phase === 'ready';
  const isError = phase === 'error';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-6 left-6 z-50"
        >
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-sm max-w-xs cursor-default
              ${isGood
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : isError
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-amber-500/10 border-amber-500/30'
              }`}
            style={{
              background: isGood
                ? '#101010'
                : isError
                  ? '#101010'
                  : '#101010',
              borderColor: isGood
                ? 'rgba(52, 211, 153, 0.3)'
                : isError
                  ? 'rgba(239, 68, 68, 0.3)'
                  : 'rgba(245, 158, 11, 0.3)',
            }}
          >
            {/* Icon */}
            <div className="shrink-0">
              {isGood ? (
                <CheckCircle2 size={18} className="text-emerald-400" />
              ) : isError ? (
                <XCircle size={18} className="text-red-400" />
              ) : (
                <Loader2 size={18} className="text-amber-400 animate-spin" />
              )}
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#E1E0CC] truncate">
                {message}
              </p>
              {detail && (
                <p
                  className={`text-[10px] mt-0.5 truncate ${
                    isError ? 'text-red-400/70' : 'text-amber-400/70'
                  }`}
                >
                  {detail}
                </p>
              )}
              {phase === 'degraded' && statusData?.uptime && (
                <p className="text-[10px] mt-0.5 text-gray-500">
                  Uptime: {statusData.uptime}
                </p>
              )}
            </div>

            {/* Dismiss button (only for error or degraded — user can close) */}
            {(phase === 'error' || phase === 'degraded') && (
              <button
                type="button"
                onClick={() => {
                  stopPolling();
                  setVisible(false);
                }}
                className="shrink-0 p-0.5 rounded text-gray-500 hover:text-gray-300 transition-colors"
                title="Dismiss"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
