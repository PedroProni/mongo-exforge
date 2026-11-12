import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { NAV_ITEMS } from '../constants/app.constants';
import { useI18n } from '../i18n/I18nProvider';
import { CloseIcon, MenuIcon } from './icons';
import { LanguageSelect } from './LanguageSelect';
import { ThemeToggle } from './ThemeToggle';

export function Layout() {
  const { t } = useI18n();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <div className={`shell${open ? ' shell-open' : ''}`}>
      <header className='mobilebar'>
        <button
          type='button'
          className='icon-button'
          aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
          aria-expanded={open}
          aria-controls='sidebar'
          onClick={() => setOpen(!open)}
          data-testid='menu-toggle'
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
        <span className='brand'>{t('app.title')}</span>
        <ThemeToggle />
      </header>
      <aside id='sidebar' className='sidebar'>
        <div className='brand brand-desktop'>{t('app.title')}</div>
        <nav aria-label={t('nav.main')}>
          {NAV_ITEMS.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {t(item.key)}
            </NavLink>
          ))}
        </nav>
        <div className='sidebar-foot'>
          {user && <div className='who mono'>{user.email}</div>}
          <div className='sidebar-tools'>
            <ThemeToggle />
            <LanguageSelect />
          </div>
          <button type='button' className='ghost' onClick={signOut}>
            {t('nav.logout')}
          </button>
        </div>
      </aside>
      <button type='button' className='backdrop' tabIndex={-1} aria-hidden='true' onClick={() => setOpen(false)} />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
