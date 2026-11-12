import { useI18n } from '../i18n/I18nProvider';
import { useTheme } from '../theme/ThemeProvider';
import { MoonIcon, SunIcon } from './icons';

export function ThemeToggle() {
  const { t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const label = theme === 'dark' ? t('theme.toLight') : t('theme.toDark');
  return (
    <button type='button' className='icon-button' onClick={toggleTheme} aria-label={label} title={label} data-testid='theme-toggle'>
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
