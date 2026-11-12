// @vitest-environment jsdom
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { connectionApi, dashboardApi, jobApi, previewApi, templateApi } from '../api/endpoints';
import { DashboardPage } from '../pages/DashboardPage';
import { JobsPage } from '../pages/JobsPage';
import { NewJobPage } from '../pages/NewJobPage';
import { TemplatesPage } from '../pages/TemplatesPage';
import { DASHBOARD, FAILED_JOB, JOB, PREVIEW, RUNNING_JOB, TEMPLATE } from './helpers/fixtures';
import { renderApp } from './helpers/render';
import { installMemoryStorage } from './helpers/storage';

vi.mock('../api/endpoints', () => ({
  authApi: {},
  connectionApi: { list: vi.fn(), collections: vi.fn(), collectionsOfUri: vi.fn() },
  dashboardApi: { get: vi.fn() },
  jobApi: { list: vi.fn(), create: vi.fn(), rerun: vi.fn(), remove: vi.fn(), downloadUrl: vi.fn(), saveAsTemplate: vi.fn() },
  previewApi: { run: vi.fn() },
  templateApi: { list: vi.fn(), create: vi.fn(), rename: vi.fn(), remove: vi.fn(), run: vi.fn() },
}));

const page = (items: unknown[]) => ({ items, total: items.length, page: 1, limit: 10 });

beforeEach(() => {
  installMemoryStorage();
  vi.mocked(connectionApi.list).mockResolvedValue([{ id: 'c1', name: 'Main', uri_masked: 'mongodb://***', created_at: '2026-11-10T10:00:00.000Z' }]);
});
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('DashboardPage', () => {
  it('shows totals, formats and recent activity', async () => {
    vi.mocked(dashboardApi.get).mockResolvedValue(DASHBOARD);
    renderApp(<DashboardPage />);
    expect(await screen.findByText('34,500')).toBeTruthy();
    expect(screen.getByText('90%')).toBeTruthy();
    expect(screen.getByText('Last 90 days')).toBeTruthy();
    expect(screen.getByRole('img', { name: /7 in total/ })).toBeTruthy();
    expect(screen.getByText('Adults export')).toBeTruthy();
    expect(screen.getAllByRole('progressbar').length).toBeGreaterThan(0);
  });

  it('shows the error from the api', async () => {
    vi.mocked(dashboardApi.get).mockRejectedValue(new Error('boom'));
    renderApp(<DashboardPage />);
    expect(await screen.findByText('boom')).toBeTruthy();
  });
});

describe('JobsPage', () => {
  it('lists jobs with progress and opens the detail drawer', async () => {
    vi.mocked(jobApi.list).mockResolvedValue(page([JOB, RUNNING_JOB, FAILED_JOB]) as never);
    renderApp(<JobsPage />);
    const rows = await screen.findAllByTestId('job-row');
    expect(rows).toHaveLength(3);
    expect(within(rows[1]).getByRole('progressbar').getAttribute('aria-valuenow')).toBe('50');
    fireEvent.click(rows[2]);
    const drawer = await screen.findByTestId('job-drawer');
    expect(within(drawer).getByText('timeout reading source')).toBeTruthy();
    fireEvent.click(rows[0]);
    const completed = await screen.findByTestId('job-drawer');
    expect(within(completed).getByText('2.0 KB')).toBeTruthy();
    expect(within(completed).getByText('3 s')).toBeTruthy();
    expect(within(completed).getByText('Download')).toBeTruthy();
    expect(within(completed).getByText(/users\.age greater or equal 18/)).toBeTruthy();
  });

  it('filters by status and searches by name through the api', async () => {
    vi.mocked(jobApi.list).mockResolvedValue(page([JOB]) as never);
    renderApp(<JobsPage />);
    await screen.findAllByTestId('job-row');
    fireEvent.click(screen.getByRole('button', { name: 'Failed' }));
    await waitFor(() => expect(jobApi.list).toHaveBeenLastCalledWith(1, 10, { status: 'failed', q: '' }));
    fireEvent.change(screen.getByLabelText('Search by name'), { target: { value: 'adult' } });
    await waitFor(() => expect(jobApi.list).toHaveBeenLastCalledWith(1, 10, { status: 'failed', q: 'adult' }));
  });

  it('runs a finished export again', async () => {
    vi.mocked(jobApi.list).mockResolvedValue(page([JOB]) as never);
    vi.mocked(jobApi.rerun).mockResolvedValue(JOB);
    renderApp(<JobsPage />);
    fireEvent.click((await screen.findAllByTestId('job-row'))[0]);
    fireEvent.click(await screen.findByText('Run again'));
    await waitFor(() => expect(jobApi.rerun).toHaveBeenCalledWith('j1'));
  });

  it('saves a finished export as a template', async () => {
    vi.mocked(jobApi.list).mockResolvedValue(page([JOB]) as never);
    vi.mocked(jobApi.saveAsTemplate).mockResolvedValue(TEMPLATE);
    renderApp(<JobsPage />);
    fireEvent.click((await screen.findAllByTestId('job-row'))[0]);
    fireEvent.click(await screen.findByText('Save as template'));
    await waitFor(() => expect(jobApi.saveAsTemplate).toHaveBeenCalledWith('j1', 'Adults export'));
  });

  it('hides re-run and delete while a job is running', async () => {
    vi.mocked(jobApi.list).mockResolvedValue(page([RUNNING_JOB]) as never);
    renderApp(<JobsPage />);
    fireEvent.click((await screen.findAllByTestId('job-row'))[0]);
    const drawer = await screen.findByTestId('job-drawer');
    expect(within(drawer).queryByText('Run again')).toBeNull();
    expect(within(drawer).queryByText('Delete')).toBeNull();
  });
});

describe('NewJobPage preview', () => {
  it('previews rows, shows the capped estimate and picks columns by clicking', async () => {
    vi.mocked(previewApi.run).mockResolvedValue(PREVIEW);
    renderApp(<NewJobPage />);
    await screen.findByText('Main');
    fireEvent.change(screen.getByLabelText('Connection'), { target: { value: 'c1' } });
    fireEvent.change(screen.getByLabelText('Collection'), { target: { value: 'users' } });
    fireEvent.click(screen.getByText('Preview data'));
    expect(await screen.findByText('Ada')).toBeTruthy();
    expect(screen.getByTestId('preview-estimate').textContent).toContain('More than 250,000 matching rows');
    expect(previewApi.run).toHaveBeenCalledWith({ query: [{ connection_id: 'c1', collection: 'users', field: '_id', operator: 'ne', value: null }] });
    fireEvent.click(screen.getByRole('button', { name: 'age' }));
    expect((screen.getByLabelText(/Fields to include/) as HTMLInputElement).value).toBe('age');
    expect(screen.getByRole('button', { name: 'age' }).getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: 'age' }));
    expect((screen.getByLabelText(/Fields to include/) as HTMLInputElement).value).toBe('');
  });

  it('keeps preview disabled until a source and collection exist', async () => {
    renderApp(<NewJobPage />);
    await screen.findByText('Main');
    expect((screen.getByText('Preview data') as HTMLButtonElement).disabled).toBe(true);
  });

  it('shows the api error when the preview is refused', async () => {
    vi.mocked(previewApi.run).mockRejectedValue(new Error('Too many requests'));
    renderApp(<NewJobPage />);
    await screen.findByText('Main');
    fireEvent.change(screen.getByLabelText('Connection'), { target: { value: 'c1' } });
    fireEvent.change(screen.getByLabelText('Collection'), { target: { value: 'users' } });
    fireEvent.click(screen.getByText('Preview data'));
    expect(await screen.findByText('Too many requests')).toBeTruthy();
  });

  it('saves the current setup as a template', async () => {
    vi.mocked(templateApi.create).mockResolvedValue(TEMPLATE);
    renderApp(<NewJobPage />);
    await screen.findByText('Main');
    fireEvent.change(screen.getByLabelText('Export name'), { target: { value: 'Mine' } });
    fireEvent.change(screen.getByLabelText('Connection'), { target: { value: 'c1' } });
    fireEvent.change(screen.getByLabelText('Collection'), { target: { value: 'users' } });
    fireEvent.click(screen.getByText('Save as template'));
    await waitFor(() => expect(templateApi.create).toHaveBeenCalledTimes(1));
    expect(vi.mocked(templateApi.create).mock.calls[0][0]).toMatchObject({ name: 'Mine', query: [{ connection_id: 'c1', collection: 'users' }] });
  });
});

describe('TemplatesPage', () => {
  it('lists, runs, renames and deletes templates', async () => {
    vi.mocked(templateApi.list).mockResolvedValue([TEMPLATE]);
    vi.mocked(templateApi.run).mockResolvedValue(JOB);
    vi.mocked(templateApi.rename).mockResolvedValue({ ...TEMPLATE, name: 'Renamed' });
    vi.mocked(templateApi.remove).mockResolvedValue(undefined);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderApp(<TemplatesPage />);
    expect(await screen.findByText('Weekly adults')).toBeTruthy();
    fireEvent.click(screen.getByText('Run now'));
    await waitFor(() => expect(templateApi.run).toHaveBeenCalledWith('t1'));
    fireEvent.click(screen.getByText('Rename'));
    fireEvent.change(screen.getByLabelText('Template name'), { target: { value: 'Renamed' } });
    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => expect(templateApi.rename).toHaveBeenCalledWith('t1', 'Renamed'));
    fireEvent.click(screen.getByText('Delete'));
    await waitFor(() => expect(templateApi.remove).toHaveBeenCalledWith('t1'));
  });

  it('shows the empty state', async () => {
    vi.mocked(templateApi.list).mockResolvedValue([]);
    renderApp(<TemplatesPage />);
    expect(await screen.findByText(/No templates yet/)).toBeTruthy();
  });
});
