import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthProvider';
import { Layout } from './components/Layout';
import { useI18n } from './i18n/I18nProvider';
import { AccountPage } from './pages/AccountPage';
import { ConnectionsPage } from './pages/ConnectionsPage';
import { JobsPage } from './pages/JobsPage';
import { LoginPage } from './pages/LoginPage';
import { NewJobPage } from './pages/NewJobPage';

export function App() {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  if (loading) return <p className='center'>{t('common.loading')}</p>;
  if (!user) return <LoginPage />;
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<JobsPage />} />
          <Route path='new' element={<NewJobPage />} />
          <Route path='connections' element={<ConnectionsPage />} />
          <Route path='account' element={<AccountPage />} />
          <Route path='*' element={<Navigate to='/' replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
