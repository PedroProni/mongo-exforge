import { QueryOperator } from '@domain/enums/query-operator.enum';

export const OPERATOR_KEYS: Record<QueryOperator, string> = {
  [QueryOperator.EQ]: '$eq',
  [QueryOperator.NE]: '$ne',
  [QueryOperator.GT]: '$gt',
  [QueryOperator.GTE]: '$gte',
  [QueryOperator.LT]: '$lt',
  [QueryOperator.LTE]: '$lte',
  [QueryOperator.IN]: '$in',
  [QueryOperator.NIN]: '$nin',
};
