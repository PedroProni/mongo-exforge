import { CollectionInfo, Connection, CreateJobInput, Job, Page, RegisterInput, TokenResponse, User } from '../types/api.types';
import { request } from './client';

export const authApi = {
  login: (email: string, password: string) => request<TokenResponse>('/user/login', { method: 'POST', body: { email, password }, token: null }),
  register: (input: RegisterInput) => request<TokenResponse>('/user', { method: 'POST', body: input, token: null }),
  me: () => request<User>('/user/me'),
  update: (name: string, surname: string) => request<User>('/user/me', { method: 'PUT', body: { name, surname } }),
  changePassword: (current_password: string, new_password: string) => request<void>('/user/me/password', { method: 'PUT', body: { current_password, new_password } }),
  remove: () => request<void>('/user/me', { method: 'DELETE' }),
};

export const jobApi = {
  list: (page: number, limit: number) => request<Page<Job>>(`/job?page=${page}&limit=${limit}`),
  get: (id: string) => request<Job>(`/job/${id}`),
  create: (input: CreateJobInput) => request<Job>('/job', { method: 'POST', body: input }),
  remove: (id: string) => request<void>(`/job/${id}`, { method: 'DELETE' }),
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
