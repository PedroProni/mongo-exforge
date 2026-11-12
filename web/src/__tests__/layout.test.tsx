// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Layout } from '../components/Layout';
import { ToastProvider } from '../components/ToastProvider';
import { I18nProvider } from '../i18n/I18nProvider';
import { ThemeProvider } from '../theme/ThemeProvider';
import { installMemoryStorage } from './helpers/storage';

vi.mock('../auth/AuthProvider', () => ({ useAuth: () => ({ user: { id: 'u', name: 'A', surname: 'B', email: 'a@b.c', created_at: '' }, signOut: vi.fn() }) }));

function mount() {
  return render(
    <ThemeProvider>
      <I18nProvider>
        <ToastProvider>
          <MemoryRouter initialEntries={['/']}>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<p>home</p>} />
                <Route path='templates' element={<p>templates page</p>} />
              </Route>
            </Routes>
          </MemoryRouter>
        </ToastProvider>
      </I18nProvider>
    </ThemeProvider>,
  );
}

describe('Layout', () => {
  beforeEach(() => {
    installMemoryStorage();
  });
  afterEach(cleanup);

  it('renders the sidebar navigation in English and Portuguese', () => {
    mount();
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Templates' })).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Language'), { target: { value: 'pt' } });
    expect(screen.getByRole('link', { name: 'Painel' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Modelos' })).toBeTruthy();
  });

  it('opens the drawer on mobile and closes it after navigating', () => {
    const { container } = mount();
    const toggle = screen.getByTestId('menu-toggle');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(toggle);
    expect(container.querySelector('.shell-open')).not.toBeNull();
    expect(screen.getByTestId('menu-toggle').getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(screen.getByRole('link', { name: 'Templates' }));
    expect(screen.getByText('templates page')).toBeTruthy();
    expect(container.querySelector('.shell-open')).toBeNull();
  });
});
