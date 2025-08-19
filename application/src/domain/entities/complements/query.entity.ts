import { QueryOperator } from '@domain/enums/all.enums';

export class QueryEntity {
  private uri: string;
  private collection: string;
  private field: string;
  private operator: QueryOperator;
  private value: any;

  constructor(props: { uri: string; collection: string; field: string; operator: QueryOperator; value: any }) {
    this.uri = props.uri;
    this.collection = props.collection;
    this.field = props.field;
    this.operator = props.operator;
    this.value = props.value;
  }

  // Getters
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

  getValue(): any {
    return this.value;
  }
}
