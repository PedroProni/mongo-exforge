import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { templateApi } from '../api/endpoints';
import { useToast } from '../components/ToastProvider';
import { useI18n } from '../i18n/I18nProvider';
import { sortEntries } from '../lib/sort';
import { Template } from '../types/api.types';

export function TemplatesPage() {
  const { t } = useI18n();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [items, setItems] = useState<Template[] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');

  const load = useCallback(async () => setItems(await templateApi.list()), []);
  useEffect(() => {
    void load().catch(() => setItems([]));
  }, [load]);

  const fail = (caught: unknown) => notify(caught instanceof Error ? caught.message : t('common.error'), 'error');

  const run = async (item: Template) => {
    try {
      await templateApi.run(item.id);
      notify(t('templates.started'));
      navigate('/exports');
    } catch (caught) {
      fail(caught);
    }
  };

  const rename = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingId) return;
    try {
      await templateApi.rename(editingId, draftName.trim());
      setEditingId(null);
      notify(t('templates.renamed'));
      await load();
    } catch (caught) {
      fail(caught);
    }
  };

  const remove = async (item: Template) => {
    if (!window.confirm(t('common.confirmDelete'))) return;
    try {
      await templateApi.remove(item.id);
      await load();
    } catch (caught) {
      fail(caught);
    }
  };

  return (
    <div className='page'>
      <header className='page-head'>
        <div>
          <h1>{t('templates.title')}</h1>
          <p className='muted'>{t('templates.subtitle')}</p>
        </div>
      </header>
      {items === null && <p>{t('common.loading')}</p>}
      {items !== null && items.length === 0 && <p className='card muted'>{t('templates.empty')}</p>}
      {items !== null && items.length > 0 && (
        <ul className='template-grid'>
          {items.map(item => {
            const sort = sortEntries(item.sort)[0];
            return (
              <li key={item.id} className='card template' data-testid='template-card'>
                {editingId === item.id ? (
                  <form onSubmit={rename} className='row'>
                    <input required autoFocus aria-label={t('templates.name')} value={draftName} onChange={event => setDraftName(event.target.value)} />
                    <button type='submit'>{t('common.save')}</button>
                    <button type='button' className='ghost' onClick={() => setEditingId(null)}>
                      {t('common.cancel')}
                    </button>
                  </form>
                ) : (
                  <h2>{item.name}</h2>
                )}
                <p className='muted mono'>
                  {item.query[0]?.collection} · {item.export_format.toUpperCase()}
                </p>
                <ul className='chips'>
                  {item.query.map((query, index) => (
                    <li key={index} className='mono'>
                      {query.field} {t(`operator.${query.operator}`)} {JSON.stringify(query.value)}
                    </li>
                  ))}
                  {item.fields.length > 0 && <li className='mono'>{item.fields.join(', ')}</li>}
                  {sort && (
                    <li className='mono'>
                      {sort.field} {t(`sort.${sort.direction}`)}
                    </li>
                  )}
                </ul>
                <div className='drawer-actions'>
                  <button type='button' onClick={() => void run(item)}>
                    {t('templates.run')}
                  </button>
                  <button type='button' className='ghost' onClick={() => navigate('/new', { state: { template: item } })}>
                    {t('templates.edit')}
                  </button>
                  <button
                    type='button'
                    className='ghost'
                    onClick={() => {
                      setEditingId(item.id);
                      setDraftName(item.name);
                    }}
                  >
                    {t('templates.rename')}
                  </button>
                  <button type='button' className='danger' onClick={() => void remove(item)}>
                    {t('common.delete')}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
