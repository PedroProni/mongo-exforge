import { FilterDraft, JobDraft } from '../types/form.types';

export const EMPTY_FILTER: FilterDraft = { field: '', operator: 'eq', value: '' };
export const INITIAL_DRAFT: JobDraft = {
  name: '',
  export_format: 'csv',
  source: 'saved',
  connection_id: '',
  uri: '',
  collection: '',
  filters: [],
  fields: '',
  sort_field: '',
  sort_direction: 'asc',
  max_rows: '',
};
