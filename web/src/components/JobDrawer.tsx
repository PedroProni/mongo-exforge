import { useEffect } from 'react';
import { FINISHED_STATUSES } from '../constants/job-actions.constants';
import { useI18n } from '../i18n/I18nProvider';
import { formatBytes, formatDuration, formatNumber } from '../lib/format';
import { jobProgress } from '../lib/progress';
import { sortEntries } from '../lib/sort';
import { JobDrawerProps } from '../types/components.types';
import { CloseIcon } from './icons';
import { ProgressBar } from './ProgressBar';
import { StatusBadge } from './StatusBadge';

export function JobDrawer({ job, onClose, onDownload, onRemove, onRerun, onSaveTemplate }: JobDrawerProps) {
  const { t } = useI18n();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const finished = (FINISHED_STATUSES as readonly string[]).includes(job.status);
  const sorts = sortEntries(job.sort);
  const details: [string, string][] = [
    [t('jobs.format'), job.export_format.toUpperCase()],
    [t('jobs.rows'), formatNumber(job.rows_exported)],
    [t('jobs.fileSize'), job.file_size > 0 ? formatBytes(job.file_size) : '-'],
    [t('jobs.duration'), formatDuration(job.started_at, job.finished_at)],
    [t('jobs.maxRows'), job.max_rows ? formatNumber(job.max_rows) : t('jobs.noLimit')],
    [t('jobs.attemptsLabel'), String(job.attempts)],
    [t('jobs.created'), new Date(job.created_at).toLocaleString()],
  ];

  return (
    <div className='drawer-layer'>
      <button type='button' className='drawer-backdrop' tabIndex={-1} aria-hidden='true' onClick={onClose} />
      <aside className='drawer' role='dialog' aria-modal='true' aria-label={t('jobs.details')} data-testid='job-drawer'>
        <header className='drawer-head'>
          <div>
            <h2>{job.name}</h2>
            <StatusBadge status={job.status} />
          </div>
          <button type='button' className='icon-button' onClick={onClose} aria-label={t('common.close')}>
            <CloseIcon />
          </button>
        </header>
        <ProgressBar value={jobProgress(job)} status={job.status} />
        {job.error && <p className='error-box mono'>{job.error}</p>}
        <dl className='facts'>
          {details.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd className='mono'>{value}</dd>
            </div>
          ))}
        </dl>
        <h3>{t('jobs.filters')}</h3>
        <ul className='chips'>
          {job.query.map((item, index) => (
            <li key={index} className='mono'>
              {item.collection}.{item.field} {t(`operator.${item.operator}`)} {JSON.stringify(item.value)}
            </li>
          ))}
        </ul>
        <h3>{t('jobs.fieldsLabel')}</h3>
        <ul className='chips'>
          {job.fields.length === 0 ? (
            <li>{t('jobs.allFields')}</li>
          ) : (
            job.fields.map(field => (
              <li key={field} className='mono'>
                {field}
              </li>
            ))
          )}
        </ul>
        <h3>{t('jobs.sortLabel')}</h3>
        <ul className='chips'>
          {sorts.length === 0 ? (
            <li>{t('jobs.noSort')}</li>
          ) : (
            sorts.map(item => (
              <li key={item.field} className='mono'>
                {item.field} {t(`sort.${item.direction}`)}
              </li>
            ))
          )}
        </ul>
        <div className='drawer-actions'>
          {job.status === 'completed' && job.file_available && (
            <button type='button' onClick={() => onDownload(job)}>
              {t('jobs.download')}
            </button>
          )}
          {finished && (
            <>
              <button type='button' className='ghost' onClick={() => onRerun(job)}>
                {t('jobs.rerun')}
              </button>
              <button type='button' className='ghost' onClick={() => onSaveTemplate(job)}>
                {t('jobs.saveTemplate')}
              </button>
              <button type='button' className='danger' onClick={() => onRemove(job)}>
                {t('common.delete')}
              </button>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
