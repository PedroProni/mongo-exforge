import { TOKEN_STORAGE_KEY } from '../constants/app.constants';
import { ApiErrorBody, RequestOptions } from '../types/app.types';
import { ApiError } from './api-error';

const API_URL = import.meta.env.VITE_API_URL ?? '';

function readMessage(body: ApiErrorBody | null, fallback: string): string {
  if (!body?.message) return fallback;
  return Array.isArray(body.message) ? body.message.join(', ') : body.message;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = options.token === undefined ? localStorage.getItem(TOKEN_STORAGE_KEY) : options.token;
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: { ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  if (response.status === 204) return undefined as T;
  const body = (await response.json().catch(() => null)) as (ApiErrorBody & T) | null;
  if (!response.ok) throw new ApiError(response.status, readMessage(body, response.statusText));
  return body as T;
}
