import { Link } from 'react-router-dom';
import { ExportsChart } from '../components/ExportsChart';
import { ProgressBar } from '../components/ProgressBar';
import { StatusBadge } from '../components/StatusBadge';
import { EXPORT_FORMATS } from '../constants/app.constants';
import { useDashboard } from '../hooks/useDashboard';
import { useI18n } from '../i18n/I18nProvider';
import { formatNumber, formatPercent } from '../lib/format';
import { jobProgress } from '../lib/progress';

export function DashboardPage() {
  const { t } = useI18n();
  const { data, error } = useDashboard();

  if (error) return <p className='error'>{error}</p>;
  if (!data) return <p>{t('common.loading')}</p>;

  const { totals } = data;
  const maxFormat = Math.max(1, ...EXPORT_FORMATS.map(format => data.by_format[format] ?? 0));
  const stats: [string, string][] = [
    [t('dashboard.exports'), formatNumber(totals.exports)],
    [t('dashboard.rows'), formatNumber(totals.rows_exported)],
    [t('dashboard.successRate'), formatPercent(totals.success_rate)],
    [t('dashboard.active'), formatNumber(totals.active)],
  ];

  return (
    <div className='page'>
      <header className='page-head'>
        <div>
          <h1>{t('dashboard.title')}</h1>
          <p className='muted'>{t('dashboard.window', { days: data.window_days })}</p>
        </div>
        <Link className='button' to='/new'>
          {t('nav.new')}
        </Link>
      </header>
      <div className='stat-grid'>
        {stats.map(([label, value]) => (
          <div className='card stat' key={label}>
            <span className='stat-label'>{label}</span>
            <strong className='stat-value mono'>{value}</strong>
          </div>
        ))}
      </div>
      <div className='split'>
        <section className='card'>
          <h2>{t('dashboard.overTime')}</h2>
          <ExportsChart series={data.series} />
        </section>
        <section className='card'>
          <h2>{t('dashboard.byFormat')}</h2>
          <ul className='bars'>
            {EXPORT_FORMATS.map(format => {
              const count = data.by_format[format] ?? 0;
              return (
                <li key={format}>
                  <span className='mono'>{format.toUpperCase()}</span>
                  <div className='bar-track'>
                    <span style={{ width: `${(count / maxFormat) * 100}%` }} />
                  </div>
                  <span className='mono'>{formatNumber(count)}</span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
      <section className='card'>
        <div className='card-head'>
          <h2>{t('dashboard.recent')}</h2>
          <Link to='/exports'>{t('dashboard.viewAll')}</Link>
        </div>
        {data.recent.length === 0 ? (
          <p className='muted'>{t('common.empty')}</p>
        ) : (
          <ul className='activity'>
            {data.recent.map(job => (
              <li key={job.id}>
                <div className='activity-main'>
                  <strong>{job.name}</strong>
                  <span className='muted mono'>
                    {job.export_format.toUpperCase()} · {formatNumber(job.rows_exported)} {t('jobs.rows').toLowerCase()}
                  </span>
                </div>
                <div className='activity-progress'>
                  <ProgressBar value={jobProgress(job)} status={job.status} />
                </div>
                <StatusBadge status={job.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
