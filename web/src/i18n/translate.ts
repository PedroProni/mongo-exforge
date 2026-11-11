import { TranslateFn } from '../types/app.types';

export function interpolate(template: string, values?: Record<string, string | number>): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => (name in values ? String(values[name]) : match));
}

export function createTranslate(messages: Record<string, string>): TranslateFn {
  return (key, values) => interpolate(messages[key] ?? key, values);
}
