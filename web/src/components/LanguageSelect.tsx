import { LANGUAGES } from '../constants/app.constants';
import { useI18n } from '../i18n/I18nProvider';
import { Language } from '../types/app.types';

export function LanguageSelect() {
  const { t, language, setLanguage } = useI18n();
  return (
    <select className='compact' aria-label={t('nav.language')} value={language} onChange={event => setLanguage(event.target.value as Language)}>
      {LANGUAGES.map(code => (
        <option key={code} value={code}>
          {code.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
