import { registerDecorator, ValidationOptions } from 'class-validator';
import { MAX_SORT_KEYS } from '@domain/constants/query-validation.constant';
import { SortDirection } from '@domain/enums/sort-direction.enum';
import { isFieldPath } from '@shared/validators/is-field-path.validator';

export function isSortMap(value: unknown): boolean {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const entries = Object.entries(value);
  return entries.length <= MAX_SORT_KEYS && entries.every(([key, direction]) => isFieldPath(key) && (direction === SortDirection.ASC || direction === SortDirection.DESC));
}

export function IsSortMap(options?: ValidationOptions) {
  return (target: object, property: string): void => {
    registerDecorator({
      name: 'isSortMap',
      target: target.constructor,
      propertyName: property,
      options: { message: `sort must map up to ${MAX_SORT_KEYS} field paths to "asc" or "desc"`, ...options },
      validator: { validate: isSortMap },
    });
  };
}
