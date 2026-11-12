import { SortDirection } from '../types/api.types';

export function directionOf(value: SortDirection | number): SortDirection {
  return value === 'desc' || (typeof value === 'number' && value < 0) ? 'desc' : 'asc';
}

export function sortEntries(sort: Record<string, SortDirection | number>): { field: string; direction: SortDirection }[] {
  return Object.entries(sort).map(([field, value]) => ({ field, direction: directionOf(value) }));
}
