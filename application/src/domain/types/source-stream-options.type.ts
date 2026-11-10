import { JobSort } from '@domain/types/job-sort.type';
import { SourceGroup } from '@domain/types/source-group.type';

export type SourceStreamOptions = {
  groups: SourceGroup[];
  fields: string[];
  sort: JobSort;
};
