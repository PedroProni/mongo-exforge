import { QueryOperator } from '@domain/enums/query-operator.enum';
import { QueryValue } from '@domain/types/query-value.type';

export type QueryInput = {
  uri?: string;
  connection_id?: string;
  collection: string;
  field: string;
  operator: QueryOperator;
  value: QueryValue;
};
