import { CHART_HEIGHT, CHART_PADDING, CHART_WIDTH } from '../constants/app.constants';
import { DashboardSeriesPoint } from '../types/api.types';
import { ChartBar } from '../types/chart.types';

export function buildBars(series: DashboardSeriesPoint[]): ChartBar[] {
  if (series.length === 0) return [];
  const max = Math.max(1, ...series.map(point => point.count));
  const inner = CHART_WIDTH - CHART_PADDING * 2;
  const slot = inner / series.length;
  const width = Math.max(2, slot * 0.7);
  const base = CHART_HEIGHT - CHART_PADDING;
  const usable = CHART_HEIGHT - CHART_PADDING * 2;
  return series.map((point, index) => {
    const height = point.count === 0 ? 0 : Math.max(2, (point.count / max) * usable);
    return { date: point.date, count: point.count, x: CHART_PADDING + index * slot + (slot - width) / 2, y: base - height, width, height };
  });
}
