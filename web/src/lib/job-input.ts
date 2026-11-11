import { CreateJobInput, QueryOperator, QueryValue } from '../types/api.types';
import { MATCH_ALL_FIELD } from '../constants/app.constants';
import { JobDraft } from '../types/form.types';

export function parseScalar(raw: string): string | number | boolean {
  const text = raw.trim();
  if (text === 'true') return true;
  if (text === 'false') return false;
  if (text !== '' && Number.isFinite(Number(text))) return Number(text);
  return text;
}

export function parseValue(raw: string, operator: QueryOperator): QueryValue {
  if (operator === 'in' || operator === 'nin') return raw.split(',').map(parseScalar);
  return parseScalar(raw);
}

export function splitList(raw: string): string[] {
  return raw
    .split(',')
    .map(item => item.trim())
    .filter(item => item !== '');
}

function sourceOf(draft: JobDraft) {
  return draft.source === 'saved' ? { connection_id: draft.connection_id } : { uri: draft.uri };
}

export function buildJobInput(draft: JobDraft): CreateJobInput {
  const filters = draft.filters.filter(filter => filter.field.trim() !== '');
  const source = sourceOf(draft);
  const query =
    filters.length > 0
      ? filters.map(filter => ({ ...source, collection: draft.collection, field: filter.field.trim(), operator: filter.operator, value: parseValue(filter.value, filter.operator) }))
      : [{ ...source, collection: draft.collection, field: MATCH_ALL_FIELD, operator: 'ne' as QueryOperator, value: null }];
  const fields = splitList(draft.fields);
  const input: CreateJobInput = { name: draft.name, export_format: draft.export_format, query };
  if (fields.length > 0) input.fields = fields;
  if (draft.max_rows.trim() !== '') input.max_rows = Number(draft.max_rows);
  if (draft.sort_field.trim() !== '') input.sort = { [draft.sort_field.trim()]: draft.sort_direction };
  return input;
}
