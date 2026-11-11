import { QueryOperator } from '@domain/enums/query-operator.enum';
import { QueryProps } from '@domain/types/query-props.type';
import { QueryValue } from '@domain/types/query-value.type';

export class QueryEntity {
  private readonly uri: string;
  private readonly collection: string;
  private readonly field: string;
  private readonly operator: QueryOperator;
  private readonly value: QueryValue;

  constructor(props: QueryProps) {
    this.uri = props.uri;
    this.collection = props.collection;
    this.field = props.field;
    this.operator = props.operator;
    this.value = props.value;
  }

  getUri(): string {
    return this.uri;
  }

  getCollection(): string {
    return this.collection;
  }

  getField(): string {
    return this.field;
  }

  getOperator(): QueryOperator {
    return this.operator;
  }

  getValue(): QueryValue {
    return this.value;
  }

  toProps(): QueryProps {
    return { uri: this.uri, collection: this.collection, field: this.field, operator: this.operator, value: this.value };
  }
}
