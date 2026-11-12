import { PREVIEW_CELL_MAX_LENGTH } from '../constants/app.constants';
import { useI18n } from '../i18n/I18nProvider';
import { formatCell, formatNumber } from '../lib/format';
import { PreviewPanelProps } from '../types/components.types';

export function PreviewPanel({ result, loading, selected, disabled, onPreview, onToggleColumn }: PreviewPanelProps) {
  const { t } = useI18n();
  const estimate = result?.estimated_total;
  return (
    <section className='card preview' data-testid='preview-panel'>
      <div className='card-head'>
        <h2>{t('preview.title')}</h2>
        <button type='button' disabled={disabled || loading} onClick={onPreview}>
          {loading ? t('common.loading') : t('preview.run')}
        </button>
      </div>
      {!result && <p className='muted'>{t('preview.hint')}</p>}
      {result && (
        <>
          <p className='muted mono' data-testid='preview-estimate'>
            {estimate === null || estimate === undefined
              ? t('preview.estimateUnknown')
              : result.estimate_capped
                ? t('preview.estimateCapped', { count: formatNumber(estimate) })
                : t('preview.estimate', { count: formatNumber(estimate) })}
            {` · ${t('preview.showing', { count: result.rows.length })}`}
          </p>
          <p className='small muted'>{t('preview.pickColumns')}</p>
          {result.rows.length === 0 ? (
            <p>{t('preview.noRows')}</p>
          ) : (
            <div className='table-wrap'>
              <table className='data-table'>
                <thead>
                  <tr>
                    {result.columns.map(column => {
                      const on = selected.includes(column);
                      return (
                        <th key={column}>
                          <button type='button' className={on ? 'column column-on' : 'column'} aria-pressed={on} onClick={() => onToggleColumn(column)}>
                            {column}
                          </button>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, index) => (
                    <tr key={index}>
                      {result.columns.map(column => (
                        <td key={column} className={`mono${selected.length > 0 && !selected.includes(column) ? ' dim' : ''}`}>
                          {formatCell(row[column], PREVIEW_CELL_MAX_LENGTH)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}
