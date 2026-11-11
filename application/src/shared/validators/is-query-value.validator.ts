import { registerDecorator, ValidationOptions } from 'class-validator';
import { MAX_IN_VALUES, MAX_STRING_VALUE_LENGTH } from '@domain/constants/query-validation.constant';

function isScalar(value: unknown): boolean {
  if (value === null || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  return typeof value === 'string' && value.length <= MAX_STRING_VALUE_LENGTH;
}

export function isQueryValue(value: unknown): boolean {
  if (Array.isArray(value)) return value.length <= MAX_IN_VALUES && value.every(isScalar);
  return isScalar(value);
}

export function IsQueryValue(options?: ValidationOptions) {
  return (target: object, property: string): void => {
    registerDecorator({
      name: 'isQueryValue',
      target: target.constructor,
      propertyName: property,
      options: { message: 'value must be a string, number, boolean, null or an array of those', ...options },
      validator: { validate: isQueryValue },
    });
  };
}
