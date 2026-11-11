import { useI18n } from '../i18n/I18nProvider';
import { JobStatus } from '../types/api.types';

export function StatusBadge({ status }: { status: JobStatus }) {
  const { t } = useI18n();
  return <span className={`badge badge-${status}`}>{t(`jobs.status.${status}`)}</span>;
}
