import { useI18n } from '../i18n/I18nProvider';
import { JobStatus } from '../types/api.types';

export function ProgressBar({ value, status }: { value: number | null; status: JobStatus }) {
  const { t } = useI18n();
  const indeterminate = value === null;
  return (
    <div
      className={`progress progress-${status}${indeterminate ? ' progress-indeterminate' : ''}`}
      role='progressbar'
      aria-label={t('jobs.progress')}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminate ? undefined : value}
    >
      <span style={indeterminate ? undefined : { width: `${value}%` }} />
    </div>
  );
}
