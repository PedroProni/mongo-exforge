import { LANGUAGES } from '../constants/app.constants';

export type Language = (typeof LANGUAGES)[number];
export type Messages = Record<string, string>;
export type TranslateFn = (key: string, values?: Record<string, string | number>) => string;
export type ApiErrorBody = { message?: string | string[]; statusCode?: number };
export type RequestOptions = { method?: string; body?: unknown; token?: string | null };
