import { CollectionInfo, Connection, CreateJobInput, Dashboard, Job, JobListFilter, Page, PreviewInput, PreviewResult, RegisterInput, Template, TokenResponse, User } from '../types/api.types';
import { request } from './client';

function listQuery(page: number, limit: number, filter: JobListFilter): string {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filter.status) params.set('status', filter.status);
  if (filter.q.trim()) params.set('q', filter.q.trim());
  return params.toString();
}

export const authApi = {
  login: (email: string, password: string) => request<TokenResponse>('/user/login', { method: 'POST', body: { email, password }, token: null }),
  register: (input: RegisterInput) => request<TokenResponse>('/user', { method: 'POST', body: input, token: null }),
  me: () => request<User>('/user/me'),
  update: (name: string, surname: string) => request<User>('/user/me', { method: 'PUT', body: { name, surname } }),
  changePassword: (current_password: string, new_password: string) => request<void>('/user/me/password', { method: 'PUT', body: { current_password, new_password } }),
  remove: () => request<void>('/user/me', { method: 'DELETE' }),
};

export const jobApi = {
  list: (page: number, limit: number, filter: JobListFilter) => request<Page<Job>>(`/job?${listQuery(page, limit, filter)}`),
  get: (id: string) => request<Job>(`/job/${id}`),
  create: (input: CreateJobInput) => request<Job>('/job', { method: 'POST', body: input }),
  remove: (id: string) => request<void>(`/job/${id}`, { method: 'DELETE' }),
  rerun: (id: string) => request<Job>(`/job/${id}/rerun`, { method: 'POST', body: {} }),
  saveAsTemplate: (id: string, name: string) => request<Template>(`/job/${id}/template`, { method: 'POST', body: { name } }),
  downloadUrl: (id: string) => request<{ url: string }>(`/job/${id}/download-url`),
};

export const connectionApi = {
  list: () => request<Connection[]>('/connection'),
  create: (name: string, uri: string) => request<Connection>('/connection', { method: 'POST', body: { name, uri } }),
  test: (uri: string) => request<{ ok: boolean; collections: number }>('/connection/test', { method: 'POST', body: { uri } }),
  collections: (id: string) => request<CollectionInfo[]>(`/connection/${id}/collections`),
  collectionsOfUri: (uri: string) => request<CollectionInfo[]>('/mongo/inspect', { method: 'POST', body: { uris: [uri] } }),
  remove: (id: string) => request<void>(`/connection/${id}`, { method: 'DELETE' }),
};

export const dashboardApi = {
  get: () => request<Dashboard>('/dashboard'),
};

export const previewApi = {
  run: (input: PreviewInput) => request<PreviewResult>('/preview', { method: 'POST', body: input }),
};

export const templateApi = {
  list: () => request<Template[]>('/template'),
  create: (input: CreateJobInput) => request<Template>('/template', { method: 'POST', body: input }),
  rename: (id: string, name: string) => request<Template>(`/template/${id}`, { method: 'PATCH', body: { name } }),
  remove: (id: string) => request<void>(`/template/${id}`, { method: 'DELETE' }),
  run: (id: string) => request<Job>(`/template/${id}/run`, { method: 'POST', body: {} }),
};
