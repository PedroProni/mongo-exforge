import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { LANGUAGES } from '../constants/app.constants';
import { useI18n } from '../i18n/I18nProvider';
import { Language } from '../types/app.types';

export function Layout() {
  const { t, language, setLanguage } = useI18n();
  const { signOut } = useAuth();
  return (
    <div className='shell'>
      <header className='topbar'>
        <strong>{t('app.title')}</strong>
        <nav>
          <NavLink to='/'>{t('nav.jobs')}</NavLink>
          <NavLink to='/new'>{t('nav.new')}</NavLink>
          <NavLink to='/connections'>{t('nav.connections')}</NavLink>
          <NavLink to='/account'>{t('nav.account')}</NavLink>
        </nav>
        <div className='topbar-end'>
          <select aria-label={t('nav.language')} value={language} onChange={event => setLanguage(event.target.value as Language)}>
            {LANGUAGES.map(code => (
              <option key={code} value={code}>
                {code.toUpperCase()}
              </option>
            ))}
          </select>
          <button type='button' onClick={signOut}>
            {t('nav.logout')}
          </button>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
