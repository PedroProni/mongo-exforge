import { useState } from 'react';
import { jobApi } from '../api/endpoints';
import { StatusBadge } from '../components/StatusBadge';
import { useToast } from '../components/ToastProvider';
import { JOBS_PAGE_SIZE } from '../constants/app.constants';
import { useJobs } from '../hooks/useJobs';
import { useI18n } from '../i18n/I18nProvider';
import { Job } from '../types/api.types';

export function JobsPage() {
  const { t } = useI18n();
  const { notify } = useToast();
  const [page, setPage] = useState(1);
  const { data, error, reload } = useJobs(page);

  const download = async (job: Job) => {
    try {
      window.location.assign((await jobApi.downloadUrl(job.id)).url);
    } catch {
      notify(t('jobs.downloadFailed'), 'error');
    }
  };

  const remove = async (job: Job) => {
    if (!window.confirm(t('common.confirmDelete'))) return;
    try {
      await jobApi.remove(job.id);
      await reload();
    } catch (caught) {
      notify(caught instanceof Error ? caught.message : t('common.error'), 'error');
    }
  };

  if (error) return <p className='error'>{error}</p>;
  if (!data) return <p>{t('common.loading')}</p>;
  const pages = Math.max(1, Math.ceil(data.total / JOBS_PAGE_SIZE));

  return (
    <section>
      <h2>{t('jobs.title')}</h2>
      {data.items.length === 0 ? (
        <p>{t('common.empty')}</p>
      ) : (
        <div className='table-wrap'>
          <table>
            <thead>
              <tr>
                <th>{t('jobs.name')}</th>
                <th className='col-format'>{t('jobs.format')}</th>
                <th>{t('jobs.status')}</th>
                <th>{t('jobs.rows')}</th>
                <th className='col-created'>{t('jobs.created')}</th>
                <th>{t('jobs.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map(job => (
                <tr key={job.id}>
                  <td>
                    {job.name}
                    {job.error && <div className='error small'>{job.error}</div>}
                    {job.attempts > 1 && <div className='small'>{t('jobs.attempts', { count: job.attempts })}</div>}
                  </td>
                  <td className='col-format'>{job.export_format.toUpperCase()}</td>
                  <td>
                    <StatusBadge status={job.status} />
                  </td>
                  <td>{job.rows_exported}</td>
                  <td className='col-created'>{new Date(job.created_at).toLocaleString()}</td>
                  <td>
                    <div className='actions'>
                      {job.status === 'completed' && job.file_available && (
                        <button type='button' onClick={() => void download(job)}>
                          {t('jobs.download')}
                        </button>
                      )}
                      {job.status !== 'pending' && job.status !== 'in_progress' && (
                        <button type='button' className='danger' onClick={() => void remove(job)}>
                          {t('common.delete')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className='pager'>
        <button type='button' disabled={page <= 1} onClick={() => setPage(page - 1)}>
          {t('common.previous')}
        </button>
        <span>{t('jobs.page', { page, pages })}</span>
        <button type='button' disabled={page >= pages} onClick={() => setPage(page + 1)}>
          {t('common.next')}
        </button>
      </div>
    </section>
  );
}
