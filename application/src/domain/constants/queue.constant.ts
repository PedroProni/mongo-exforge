export const EXPORT_QUEUE_NAME = 'export-job';
export const EXPORT_JOB_NAME = 'run-export';
export const EXPORT_BACKOFF_DELAY_MS = 5000;
export const EXPORT_KEEP_COMPLETED = { age: 24 * 60 * 60, count: 1000 };
export const EXPORT_KEEP_FAILED = { age: 7 * 24 * 60 * 60, count: 1000 };
export const PROGRESS_FLUSH_ROWS = 1000;
export const BULL_BOARD_PATH = '/bull-board';
