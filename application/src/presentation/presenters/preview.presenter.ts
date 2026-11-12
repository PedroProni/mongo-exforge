import { PREVIEW_MAX_STRING_LENGTH, PREVIEW_ROW_LIMIT } from '@domain/constants/preview.constant';
import { PreviewResult } from '@domain/types/preview-result.type';
import { PreviewResponse } from '@shared/responses/preview-response.type';

export class PreviewPresenter {
  static toResponse(result: PreviewResult): PreviewResponse {
    const rows = result.rows.map(row => PreviewPresenter.sanitize(row));
    const columns = new Set<string>();
    rows.forEach(row => Object.keys(row).forEach(key => columns.add(key)));
    return { rows, columns: Array.from(columns), row_limit: PREVIEW_ROW_LIMIT, estimated_total: result.estimated_total, estimate_capped: result.estimate_capped };
  }

  private static sanitize(row: Record<string, unknown>): Record<string, unknown> {
    const replacer = (_key: string, value: unknown): unknown => {
      if (typeof value === 'bigint') return value.toString();
      if (typeof value === 'string' && value.length > PREVIEW_MAX_STRING_LENGTH) return `${value.slice(0, PREVIEW_MAX_STRING_LENGTH)}...`;
      return value;
    };
    return JSON.parse(JSON.stringify(row, replacer)) as Record<string, unknown>;
  }
}
