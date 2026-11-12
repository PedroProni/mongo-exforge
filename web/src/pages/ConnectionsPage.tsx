import { FormEvent, useCallback, useEffect, useState } from 'react';
import { connectionApi } from '../api/endpoints';
import { useToast } from '../components/ToastProvider';
import { useI18n } from '../i18n/I18nProvider';
import { Connection } from '../types/api.types';

export function ConnectionsPage() {
  const { t } = useI18n();
  const { notify } = useToast();
  const [items, setItems] = useState<Connection[] | null>(null);
  const [name, setName] = useState('');
  const [uri, setUri] = useState('');

  const load = useCallback(async () => setItems(await connectionApi.list()), []);
  useEffect(() => {
    void load();
  }, [load]);

  const fail = (caught: unknown) => notify(caught instanceof Error ? caught.message : t('common.error'), 'error');

  const test = async () => {
    try {
      const result = await connectionApi.test(uri);
      notify(t('connections.testOk', { count: result.collections }));
    } catch (caught) {
      fail(caught);
    }
  };

  const add = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await connectionApi.create(name, uri);
      setName('');
      setUri('');
      notify(t('connections.saved'));
      await load();
    } catch (caught) {
      fail(caught);
    }
  };

  const remove = async (item: Connection) => {
    if (!window.confirm(t('common.confirmDelete'))) return;
    try {
      await connectionApi.remove(item.id);
      await load();
    } catch (caught) {
      fail(caught);
    }
  };

  return (
    <div className='page'>
      <header className='page-head'>
        <h1>{t('connections.title')}</h1>
      </header>
      <section className='card'>
        <form onSubmit={add} className='stack'>
          <label>
            {t('connections.name')}
            <input required value={name} onChange={event => setName(event.target.value)} />
          </label>
          <label>
            {t('connections.uri')}
            <input required value={uri} onChange={event => setUri(event.target.value)} autoComplete='off' />
          </label>
          <div className='row'>
            <button type='button' disabled={!uri} onClick={() => void test()}>
              {t('connections.test')}
            </button>
            <button type='submit'>{t('connections.add')}</button>
          </div>
        </form>
        {items === null ? (
          <p>{t('common.loading')}</p>
        ) : items.length === 0 ? (
          <p>{t('common.empty')}</p>
        ) : (
          <ul className='list'>
            {items.map(item => (
              <li key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <div className='small mono'>{item.uri_masked}</div>
                </div>
                <button type='button' className='danger' onClick={() => void remove(item)}>
                  {t('common.delete')}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
