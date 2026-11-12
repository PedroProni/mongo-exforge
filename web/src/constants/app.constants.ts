export const TOKEN_STORAGE_KEY = 'exforge.token';
export const LANGUAGE_STORAGE_KEY = 'exforge.language';
export const JOB_POLL_INTERVAL_MS = 2000;
export const JOBS_PAGE_SIZE = 10;
export const SEARCH_DEBOUNCE_MS = 300;
export const EXPORT_FORMATS = ['csv', 'json', 'xlsx'] as const;
export const QUERY_OPERATORS = ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin'] as const;
export const SORT_DIRECTIONS = ['asc', 'desc'] as const;
export const JOB_STATUSES = ['pending', 'in_progress', 'completed', 'failed', 'expired'] as const;
export const ACTIVE_JOB_STATUSES = ['pending', 'in_progress'] as const;
export const LANGUAGES = ['en', 'pt'] as const;
export const DEFAULT_LANGUAGE = 'en';
export const MIN_PASSWORD_LENGTH = 8;
export const MATCH_ALL_FIELD = '_id';
export const BYTE_UNITS = ['B', 'KB', 'MB', 'GB'] as const;
export const PREVIEW_CELL_MAX_LENGTH = 80;
export const CHART_WIDTH = 640;
export const CHART_HEIGHT = 180;
export const CHART_PADDING = 24;
export const NAV_ITEMS = [
  { to: '/', key: 'nav.dashboard', end: true },
  { to: '/exports', key: 'nav.jobs', end: false },
  { to: '/new', key: 'nav.new', end: false },
  { to: '/templates', key: 'nav.templates', end: false },
  { to: '/connections', key: 'nav.connections', end: false },
  { to: '/account', key: 'nav.account', end: false },
] as const;
