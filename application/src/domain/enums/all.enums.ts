export enum ExportFormat {
  CSV = 'csv',
  JSON = 'json',
  XLSX = 'xlsx'
}

export enum ExportStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum QueryOperator {
  EQ = 'eq',
  NE = 'ne',
  GT = 'gt',
  GTE = 'gte',
  LT = 'lt',
  LTE = 'lte',
  IN = 'in',
  NIN = 'nin',
  EXISTS = 'exists',
}

export enum UserTier {
  FREE = 'free',
  PREMIUM = 'premium',
}