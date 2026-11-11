import { FormEvent, useState } from 'react';
import { authApi } from '../api/endpoints';
import { useAuth } from '../auth/AuthProvider';
import { useToast } from '../components/ToastProvider';
import { MIN_PASSWORD_LENGTH } from '../constants/app.constants';
import { useI18n } from '../i18n/I18nProvider';

export function LoginPage() {
  const { t } = useI18n();
  const { signIn } = useAuth();
  const { notify } = useToast();
  const [registering, setRegistering] = useState(false);
  const [form, setForm] = useState({ name: '', surname: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const response = registering ? await authApi.register(form) : await authApi.login(form.email, form.password);
      await signIn(response.token);
    } catch (caught) {
      notify(caught instanceof Error ? caught.message : t('common.error'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const bind = (field: keyof typeof form) => ({ value: form[field], onChange: (event: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [field]: event.target.value }) });

  return (
    <div className='auth-card'>
      <h1>{t('app.title')}</h1>
      <p>{t('app.tagline')}</p>
      <form onSubmit={submit}>
        {registering && (
          <>
            <label>
              {t('auth.name')}
              <input required {...bind('name')} />
            </label>
            <label>
              {t('auth.surname')}
              <input required {...bind('surname')} />
            </label>
          </>
        )}
        <label>
          {t('auth.email')}
          <input type='email' required autoComplete='email' {...bind('email')} />
        </label>
        <label>
          {t('auth.password')}
          <input type='password' required minLength={registering ? MIN_PASSWORD_LENGTH : 1} autoComplete={registering ? 'new-password' : 'current-password'} {...bind('password')} />
        </label>
        <button type='submit' disabled={busy}>
          {registering ? t('auth.register') : t('auth.login')}
        </button>
      </form>
      <button type='button' className='link' onClick={() => setRegistering(!registering)}>
        {registering ? t('auth.toLogin') : t('auth.toRegister')}
      </button>
    </div>
  );
}
