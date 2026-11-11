import { FormEvent, useState } from 'react';
import { authApi } from '../api/endpoints';
import { useAuth } from '../auth/AuthProvider';
import { useToast } from '../components/ToastProvider';
import { MIN_PASSWORD_LENGTH } from '../constants/app.constants';
import { useI18n } from '../i18n/I18nProvider';

export function AccountPage() {
  const { t } = useI18n();
  const { user, refresh, signOut } = useAuth();
  const { notify } = useToast();
  const [name, setName] = useState(user?.name ?? '');
  const [surname, setSurname] = useState(user?.surname ?? '');
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');

  const run = async (action: () => Promise<void>, okMessage?: string) => {
    try {
      await action();
      if (okMessage) notify(okMessage);
    } catch (caught) {
      notify(caught instanceof Error ? caught.message : t('common.error'), 'error');
    }
  };

  const saveProfile = (event: FormEvent) => {
    event.preventDefault();
    void run(async () => {
      await authApi.update(name, surname);
      await refresh();
    }, t('account.profileSaved'));
  };

  const savePassword = (event: FormEvent) => {
    event.preventDefault();
    void run(async () => {
      await authApi.changePassword(current, next);
      setCurrent('');
      setNext('');
    }, t('account.passwordSaved'));
  };

  const removeAccount = () => {
    if (!window.confirm(t('account.confirmDelete'))) return;
    void run(async () => {
      await authApi.remove();
      signOut();
    });
  };

  return (
    <section>
      <h2>{t('account.title')}</h2>
      <form onSubmit={saveProfile} className="stack">
        <h3>{t('account.profile')}</h3>
        <label>
          {t('auth.name')}
          <input required value={name} onChange={event => setName(event.target.value)} />
        </label>
        <label>
          {t('auth.surname')}
          <input required value={surname} onChange={event => setSurname(event.target.value)} />
        </label>
        <button type="submit">{t('common.save')}</button>
      </form>
      <form onSubmit={savePassword} className="stack">
        <h3>{t('account.password')}</h3>
        <label>
          {t('account.currentPassword')}
          <input type="password" required autoComplete="current-password" value={current} onChange={event => setCurrent(event.target.value)} />
        </label>
        <label>
          {t('account.newPassword')}
          <input type="password" required minLength={MIN_PASSWORD_LENGTH} autoComplete="new-password" value={next} onChange={event => setNext(event.target.value)} />
        </label>
        <button type="submit">{t('common.save')}</button>
      </form>
      <div className="stack">
        <h3>{t('account.danger')}</h3>
        <p>{t('account.dangerText')}</p>
        <button type="button" className="danger" onClick={removeAccount}>
          {t('common.delete')}
        </button>
      </div>
    </section>
  );
}
