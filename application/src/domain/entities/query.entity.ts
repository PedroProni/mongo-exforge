import { QueryOperator } from '@domain/enums/query-operator.enum';
import { QueryProps } from '@domain/types/query-props.type';
import { QueryValue } from '@domain/types/query-value.type';

export class QueryEntity {
  private readonly uri: string;
  private readonly connection_id: string;
  private readonly collection: string;
  private readonly field: string;
  private readonly operator: QueryOperator;
  private readonly value: QueryValue;

  constructor(props: QueryProps) {
    this.uri = props.uri;
    this.connection_id = props.connection_id ?? '';
    this.collection = props.collection;
    this.field = props.field;
    this.operator = props.operator;
    this.value = props.value;
  }

  getUri(): string {
    return this.uri;
  }

  getConnectionId(): string {
    return this.connection_id;
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
    const props: QueryProps = { uri: this.uri, collection: this.collection, field: this.field, operator: this.operator, value: this.value };
    return this.connection_id ? { ...props, connection_id: this.connection_id } : props;
  }
}
