import { useState } from 'react';
import { JobDrawer } from '../components/JobDrawer';
import { ProgressBar } from '../components/ProgressBar';
import { StatusBadge } from '../components/StatusBadge';
import { JOB_STATUSES, JOBS_PAGE_SIZE, SEARCH_DEBOUNCE_MS } from '../constants/app.constants';
import { useDebounced } from '../hooks/useDebounced';
import { useJobActions } from '../hooks/useJobActions';
import { useJobs } from '../hooks/useJobs';
import { useI18n } from '../i18n/I18nProvider';
import { formatBytes, formatNumber } from '../lib/format';
import { jobProgress } from '../lib/progress';
import { JobStatusFilter } from '../types/api.types';

export function JobsPage() {
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<JobStatusFilter>('');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const q = useDebounced(search, SEARCH_DEBOUNCE_MS);
  const { data, error, reload } = useJobs(page, { status, q });
  const actions = useJobActions(reload);

  const selected = data?.items.find(job => job.id === selectedId) ?? null;
  const pages = data ? Math.max(1, Math.ceil(data.total / JOBS_PAGE_SIZE)) : 1;
  const filtered = status !== '' || q.trim() !== '';

  return (
    <div className='page'>
      <header className='page-head'>
        <h1>{t('jobs.title')}</h1>
      </header>
      <div className='toolbar'>
        <input
          type='search'
          className='grow'
          aria-label={t('jobs.search')}
          placeholder={t('jobs.search')}
          value={search}
          onChange={event => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <div className='segmented' role='group' aria-label={t('jobs.statusFilter')}>
          {(['', ...JOB_STATUSES] as JobStatusFilter[]).map(option => (
            <button
              key={option || 'all'}
              type='button'
              className={status === option ? 'segment segment-on' : 'segment'}
              aria-pressed={status === option}
              onClick={() => {
                setStatus(option);
                setPage(1);
              }}
            >
              {option === '' ? t('jobs.all') : t(`jobs.status.${option}`)}
            </button>
          ))}
        </div>
      </div>
      {error && <p className='error'>{error}</p>}
      {!data && !error && <p>{t('common.loading')}</p>}
      {data && data.items.length === 0 && <p className='card muted'>{filtered ? t('jobs.noMatches') : t('common.empty')}</p>}
      {data && data.items.length > 0 && (
        <ul className='job-list'>
          {data.items.map(job => (
            <li key={job.id}>
              <button type='button' className='job-row' onClick={() => setSelectedId(job.id)} data-testid='job-row'>
                <span className='job-main'>
                  <strong>{job.name}</strong>
                  <span className='muted mono'>
                    {job.export_format.toUpperCase()} · {formatNumber(job.rows_exported)} {t('jobs.rows').toLowerCase()}
                    {job.file_size > 0 ? ` · ${formatBytes(job.file_size)}` : ''}
                  </span>
                </span>
                <span className='job-progress'>
                  <ProgressBar value={jobProgress(job)} status={job.status} />
                </span>
                <StatusBadge status={job.status} />
                <span className='muted job-date'>{new Date(job.created_at).toLocaleString()}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className='pager'>
        <button type='button' className='ghost' disabled={page <= 1} onClick={() => setPage(page - 1)}>
          {t('common.previous')}
        </button>
        <span className='mono'>{t('jobs.page', { page, pages })}</span>
        <button type='button' className='ghost' disabled={page >= pages} onClick={() => setPage(page + 1)}>
          {t('common.next')}
        </button>
      </div>
      {selected && (
        <JobDrawer
          job={selected}
          onClose={() => setSelectedId(null)}
          onDownload={job => void actions.download(job)}
          onRemove={job => void actions.remove(job).then(removed => removed && setSelectedId(null))}
          onRerun={job => void actions.rerun(job)}
          onSaveTemplate={job => void actions.saveAsTemplate(job)}
        />
      )}
    </div>
  );
}
