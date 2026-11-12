import { JobSort } from '@domain/types/job-sort.type';
import { QueryInput } from '@domain/types/query-input.type';

export type PreviewInput = {
  query: QueryInput[];
  fields: string[];
  sort: JobSort;
};
