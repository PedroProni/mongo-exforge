import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectionApi, jobApi } from '../api/endpoints';
import { useToast } from '../components/ToastProvider';
import { EMPTY_FILTER, INITIAL_DRAFT } from '../constants/job-form.constants';
import { EXPORT_FORMATS, QUERY_OPERATORS, SORT_DIRECTIONS } from '../constants/app.constants';
import { useI18n } from '../i18n/I18nProvider';
import { buildJobInput } from '../lib/job-input';
import { CollectionInfo, Connection } from '../types/api.types';
import { FilterDraft, JobDraft } from '../types/form.types';

export function NewJobPage() {
  const { t } = useI18n();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<JobDraft>(INITIAL_DRAFT);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [collections, setCollections] = useState<CollectionInfo[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void connectionApi.list().then(setConnections, () => setConnections([]));
  }, []);

  const fail = (caught: unknown) => notify(caught instanceof Error ? caught.message : t('common.error'), 'error');
  const patch = (changes: Partial<JobDraft>) => setDraft(current => ({ ...current, ...changes }));
  const patchFilter = (index: number, changes: Partial<FilterDraft>) => patch({ filters: draft.filters.map((filter, position) => (position === index ? { ...filter, ...changes } : filter)) });

  const loadCollections = async () => {
    try {
      const found = draft.source === 'saved' ? await connectionApi.collections(draft.connection_id) : await connectionApi.collectionsOfUri(draft.uri);
      setCollections(found);
      notify(t('new.collectionsLoaded', { count: found.length }));
    } catch (caught) {
      fail(caught);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      await jobApi.create(buildJobInput(draft));
      notify(t('new.created'));
      navigate('/');
    } catch (caught) {
      fail(caught);
    } finally {
      setBusy(false);
    }
  };

  const sourceReady = draft.source === 'saved' ? draft.connection_id !== '' : draft.uri !== '';
  const known = collections.find(item => item.collection_name === draft.collection);

  return (
    <section>
      <h2>{t('new.title')}</h2>
      <form onSubmit={submit} className="stack">
        <label>
          {t('new.name')}
          <input required value={draft.name} onChange={event => patch({ name: event.target.value })} />
        </label>
        <label>
          {t('new.format')}
          <select value={draft.export_format} onChange={event => patch({ export_format: event.target.value as JobDraft['export_format'] })}>
            {EXPORT_FORMATS.map(format => (
              <option key={format} value={format}>
                {format.toUpperCase()}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('new.source')}
          <select value={draft.source} onChange={event => patch({ source: event.target.value as JobDraft['source'] })}>
            <option value="saved">{t('new.sourceSaved')}</option>
            <option value="uri">{t('new.sourceUri')}</option>
          </select>
        </label>
        {draft.source === 'saved' ? (
          <label>
            {t('new.connection')}
            <select required value={draft.connection_id} onChange={event => patch({ connection_id: event.target.value })}>
              <option value="">{t('new.selectConnection')}</option>
              {connections.map(connection => (
                <option key={connection.id} value={connection.id}>
                  {connection.name}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label>
            {t('new.uri')}
            <input required autoComplete="off" value={draft.uri} onChange={event => patch({ uri: event.target.value })} />
          </label>
        )}
        <div className="row">
          <button type="button" disabled={!sourceReady} onClick={() => void loadCollections()}>
            {t('new.loadCollections')}
          </button>
        </div>
        <label>
          {t('new.collection')}
          <input required list="collection-options" value={draft.collection} onChange={event => patch({ collection: event.target.value })} />
          <datalist id="collection-options">
            {collections.map(item => (
              <option key={item.collection_name} value={item.collection_name} />
            ))}
          </datalist>
        </label>
        {known && <div className="small mono">{known.collection_fields.join(', ')}</div>}
        <h3>{t('new.filters')}</h3>
        {draft.filters.map((filter, index) => (
          <div className="row" key={index}>
            <input aria-label={t('new.field')} placeholder={t('new.field')} value={filter.field} onChange={event => patchFilter(index, { field: event.target.value })} />
            <select aria-label={t('new.operator')} value={filter.operator} onChange={event => patchFilter(index, { operator: event.target.value as FilterDraft['operator'] })}>
              {QUERY_OPERATORS.map(operator => (
                <option key={operator} value={operator}>
                  {t(`operator.${operator}`)}
                </option>
              ))}
            </select>
            <input aria-label={t('new.value')} placeholder={t('new.valueHint')} value={filter.value} onChange={event => patchFilter(index, { value: event.target.value })} />
            <button type="button" className="danger" onClick={() => patch({ filters: draft.filters.filter((_, position) => position !== index) })}>
              {t('new.removeFilter')}
            </button>
          </div>
        ))}
        <div className="row">
          <button type="button" onClick={() => patch({ filters: [...draft.filters, EMPTY_FILTER] })}>
            {t('new.addFilter')}
          </button>
        </div>
        <label>
          {t('new.fields')} ({t('common.optional')})
          <input value={draft.fields} onChange={event => patch({ fields: event.target.value })} />
        </label>
        <div className="row">
          <label>
            {t('new.sort')} ({t('common.optional')})
            <input value={draft.sort_field} onChange={event => patch({ sort_field: event.target.value })} />
          </label>
          <label>
            {t('new.sortDirection')}
            <select value={draft.sort_direction} onChange={event => patch({ sort_direction: event.target.value as JobDraft['sort_direction'] })}>
              {SORT_DIRECTIONS.map(direction => (
                <option key={direction} value={direction}>
                  {t(`sort.${direction}`)}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t('new.maxRows')} ({t('common.optional')})
            <input type="number" min={1} value={draft.max_rows} onChange={event => patch({ max_rows: event.target.value })} />
          </label>
        </div>
        <button type="submit" disabled={busy || !sourceReady}>
          {t('new.submit')}
        </button>
      </form>
    </section>
  );
}
