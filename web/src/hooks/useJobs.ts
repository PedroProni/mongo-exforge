import { useCallback, useEffect, useState } from 'react';
import { jobApi } from '../api/endpoints';
import { ACTIVE_JOB_STATUSES, JOB_POLL_INTERVAL_MS, JOBS_PAGE_SIZE } from '../constants/app.constants';
import { Job, Page } from '../types/api.types';

export function useJobs(page: number) {
  const [data, setData] = useState<Page<Job> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await jobApi.list(page, JOBS_PAGE_SIZE));
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  const hasActive = data?.items.some(job => (ACTIVE_JOB_STATUSES as readonly string[]).includes(job.status)) ?? false;

  useEffect(() => {
    if (!hasActive) return undefined;
    const timer = window.setInterval(() => void load(), JOB_POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [hasActive, load]);

  return { data, error, reload: load };
}
