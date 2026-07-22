import { useTranslation } from 'react-i18next';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export default function ThemeToggle() {
  const { t } = useTranslation('common');
  const { resolvedTheme, setTheme } = useTheme();

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex items-center justify-center w-9 h-9 rounded-lg border transition-all duration-200
        text-muted-foreground hover:text-foreground
        border-border hover:bg-muted/50 hover:scale-105
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
      title={isDark ? t('topbar.switchToLight') : t('topbar.switchToDark')}
      aria-label={isDark ? t('topbar.switchToLight') : t('topbar.switchToDark')}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
