import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Mail, CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { authAPI } from '../features/auth/api';

/**
 * VerifyEmailPage — handles the email verification link.
 * URL: /verify-email?token=xxx
 * Calls GET /api/auth/verify-email?token=xxx
 */
export default function VerifyEmailPage() {
  const { t } = useTranslation('verify');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage(t('page.noToken'));
      return;
    }

    let cancelled = false;

    const verify = async () => {
      try {
        await authAPI.verifyEmail(token);
        if (!cancelled) {
          setStatus('success');
          setMessage(t('page.successMessage'));
        }
      } catch (err) {
        if (!cancelled) {
          setStatus('error');
          const msg =
            err?.response?.data?.message ||
            err?.message ||
            t('page.errorMessage');
          setMessage(msg);
        }
      }
    };

    verify();

    return () => {
      cancelled = true;
    };
  }, [token, t]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-2xl border border-primary/10 bg-card p-8 text-center space-y-5 shadow-xl"
      >
        {/* Icon */}
        <div className="flex justify-center">
          {status === 'loading' && (
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Loader2 size={28} className="animate-spin text-primary" />
            </div>
          )}
          {status === 'success' && (
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 size={28} className="text-emerald-500" />
            </div>
          )}
          {status === 'error' && (
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <XCircle size={28} className="text-red-500" />
            </div>
          )}
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-foreground">
          {status === 'loading' && t('page.verifying')}
          {status === 'success' && t('page.success')}
          {status === 'error' && t('page.error')}
        </h2>

        {/* Message */}
        <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>

        {/* Action buttons */}
        <div className="pt-2 space-y-2">
          {status === 'success' && (
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
            >
              {t('page.goToLogin')}
              <ArrowRight size={14} />
            </Link>
          )}
          {status === 'error' && (
            <>
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
              >
                {t('page.backToLogin')}
                <ArrowRight size={14} />
              </Link>
              <p className="text-[11px] text-muted-foreground">
                {t('page.expiredHint')}
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
