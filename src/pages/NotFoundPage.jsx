import { useNavigate, useRouteError } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const error = useRouteError();
  const { t } = useTranslation('common');

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center p-6 text-center transition-colors duration-300 bg-gray-50 dark:bg-[#0B1020]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md space-y-6"
      >
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-500/20">
          <AlertTriangle size={48} />
        </div>

        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-wider font-outfit">404</h1>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('errors.notFound')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {error?.statusText || error?.message || t('errors.generic')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-white bg-white dark:bg-[#1B2235] border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <ArrowLeft size={16} /> {t('actions.back')}
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-transform hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #4F8CFF, #8B5CF6)' }}
          >
            <Home size={16} /> {t('actions.back')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
