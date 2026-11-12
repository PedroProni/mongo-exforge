import { useCallback, useEffect, useState } from 'react';
import { dashboardApi } from '../api/endpoints';
import { ACTIVE_JOB_STATUSES, JOB_POLL_INTERVAL_MS } from '../constants/app.constants';
import { Dashboard } from '../types/api.types';

export function useDashboard() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await dashboardApi.get());
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const hasActive = data ? data.totals.active > 0 || data.recent.some(job => (ACTIVE_JOB_STATUSES as readonly string[]).includes(job.status)) : false;

  useEffect(() => {
    if (!hasActive) return undefined;
    const timer = window.setInterval(() => void load(), JOB_POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [hasActive, load]);

  return { data, error, reload: load };
}
