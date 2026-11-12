import { MATCH_ALL_FIELD } from '../constants/app.constants';
import { INITIAL_DRAFT } from '../constants/job-form.constants';
import { QueryValue, Template } from '../types/api.types';
import { FilterDraft, JobDraft } from '../types/form.types';
import { sortEntries } from './sort';

function valueText(value: QueryValue): string {
  if (Array.isArray(value)) return value.join(', ');
  return value === null ? '' : String(value);
}

export function templateToDraft(template: Template): JobDraft {
  const first = template.query[0];
  const filters: FilterDraft[] = template.query
    .filter(item => !(item.field === MATCH_ALL_FIELD && item.operator === 'ne' && item.value === null))
    .map(item => ({ field: item.field, operator: item.operator, value: valueText(item.value) }));
  const sort = sortEntries(template.sort)[0];
  return {
    ...INITIAL_DRAFT,
    name: template.name,
    export_format: template.export_format,
    source: 'saved',
    connection_id: first?.connection_id ?? '',
    collection: first?.collection ?? '',
    filters,
    fields: template.fields.join(', '),
    sort_field: sort?.field ?? '',
    sort_direction: sort?.direction ?? 'asc',
    max_rows: template.max_rows > 0 ? String(template.max_rows) : '',
  };
}
