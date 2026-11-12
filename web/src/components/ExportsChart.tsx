import { CHART_HEIGHT, CHART_PADDING, CHART_WIDTH } from '../constants/app.constants';
import { useI18n } from '../i18n/I18nProvider';
import { buildBars } from '../lib/chart';
import { DashboardSeriesPoint } from '../types/api.types';

export function ExportsChart({ series }: { series: DashboardSeriesPoint[] }) {
  const { t } = useI18n();
  const bars = buildBars(series);
  const total = series.reduce((sum, point) => sum + point.count, 0);
  const first = series[0]?.date;
  const last = series[series.length - 1]?.date;
  return (
    <figure className='chart'>
      <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} role='img' aria-label={t('dashboard.chartLabel', { count: total })} preserveAspectRatio='none'>
        <line className='chart-axis' x1={CHART_PADDING} x2={CHART_WIDTH - CHART_PADDING} y1={CHART_HEIGHT - CHART_PADDING} y2={CHART_HEIGHT - CHART_PADDING} />
        {bars.map(bar => (
          <rect
            key={bar.date}
            className={bar.count === 0 ? 'chart-bar chart-bar-empty' : 'chart-bar'}
            x={bar.x}
            y={bar.count === 0 ? CHART_HEIGHT - CHART_PADDING - 1 : bar.y}
            width={bar.width}
            height={bar.count === 0 ? 1 : bar.height}
            rx='2'
          >
            <title>{`${bar.date}: ${bar.count}`}</title>
          </rect>
        ))}
      </svg>
      <figcaption className='chart-caption mono'>
        <span>{first}</span>
        <span>{last}</span>
      </figcaption>
    </figure>
  );
}
