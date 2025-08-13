import { QueryOperator } from '@domain/enums/all.enums';

export class QueryEntity {
  private field: string;
  private operator: QueryOperator;
  private value: any;

  constructor(props: { field: string; operator: QueryOperator; value: any }) {
    this.field = props.field;
    this.operator = props.operator;
    this.value = props.value;
  }

  // Getters
  public getField(): string {
    return this.field;
  }

  public getOperator(): QueryOperator {
    return this.operator;
  }

  public getValue(): any {
    return this.value;
  }
}
