import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../components/ToastProvider';
import { I18nProvider } from '../../i18n/I18nProvider';
import { ThemeProvider } from '../../theme/ThemeProvider';

export function renderApp(element: ReactElement, route = '/') {
  return render(
    <ThemeProvider>
      <I18nProvider>
        <ToastProvider>
          <MemoryRouter initialEntries={[route]}>{element}</MemoryRouter>
        </ToastProvider>
      </I18nProvider>
    </ThemeProvider>,
  );
}
