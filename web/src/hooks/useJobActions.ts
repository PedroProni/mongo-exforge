import { useNavigate } from 'react-router-dom';
import { jobApi } from '../api/endpoints';
import { useToast } from '../components/ToastProvider';
import { useI18n } from '../i18n/I18nProvider';
import { Job } from '../types/api.types';

export function useJobActions(onChange: () => Promise<void> | void) {
  const { t } = useI18n();
  const { notify } = useToast();
  const navigate = useNavigate();

  const fail = (caught: unknown) => notify(caught instanceof Error ? caught.message : t('common.error'), 'error');

  const download = async (job: Job) => {
    try {
      window.location.assign((await jobApi.downloadUrl(job.id)).url);
    } catch {
      notify(t('jobs.downloadFailed'), 'error');
    }
  };

  const remove = async (job: Job): Promise<boolean> => {
    if (!window.confirm(t('common.confirmDelete'))) return false;
    try {
      await jobApi.remove(job.id);
      await onChange();
      return true;
    } catch (caught) {
      fail(caught);
      return false;
    }
  };

  const rerun = async (job: Job) => {
    try {
      await jobApi.rerun(job.id);
      notify(t('jobs.rerunStarted'));
      await onChange();
      navigate('/exports');
    } catch (caught) {
      fail(caught);
    }
  };

  const saveAsTemplate = async (job: Job) => {
    try {
      await jobApi.saveAsTemplate(job.id, job.name);
      notify(t('templates.saved'));
    } catch (caught) {
      fail(caught);
    }
  };

  return { download, remove, rerun, saveAsTemplate };
}
