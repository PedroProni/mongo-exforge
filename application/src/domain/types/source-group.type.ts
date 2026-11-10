import { QueryProps } from '@domain/types/query-props.type';

export type SourceGroup = {
  uri: string;
  collection: string;
  filters: QueryProps[];
};
