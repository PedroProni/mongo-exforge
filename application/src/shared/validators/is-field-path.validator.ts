import { registerDecorator, ValidationOptions } from 'class-validator';
import { FIELD_PATH_PATTERN, FORBIDDEN_SEGMENT } from '@domain/constants/query-validation.constant';

export function isFieldPath(value: unknown): value is string {
  return typeof value === 'string' && FIELD_PATH_PATTERN.test(value) && !value.split('.').includes(FORBIDDEN_SEGMENT);
}

export function IsFieldPath(options?: ValidationOptions) {
  return (target: object, property: string): void => {
    registerDecorator({
      name: 'isFieldPath',
      target: target.constructor,
      propertyName: property,
      options: { message: 'each field must be a plain field path (letters, digits, underscore, dash, dots) and must not start with $', ...options },
      validator: { validate: isFieldPath },
    });
  };
}
