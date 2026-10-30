import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../context/ToastContext.jsx';
import { AuthContext } from '../context/authContextDef.js';
import { RoadmapGenerationProvider } from '../context/RoadmapGenerationContext.jsx';

/**
 * Custom render helper that wraps components with MemoryRouter, ToastProvider,
 * AuthContext (mockable), and RoadmapGenerationProvider.
 */
export function renderWithProviders(
  ui,
  {
    initialEntries = ['/'],
    user = null,
    loading = false,
    authOverrides = {},
    ...renderOptions
  } = {},
) {
  const authValue = {
    user,
    loading,
    login: async () => {},
    signup: async () => {},
    logout: async () => {},
    refreshUser: async () => {},
    checkSession: async () => {},
    ...authOverrides,
  };

  function Wrapper({ children }) {
    return (
      <MemoryRouter initialEntries={initialEntries}>
        <ToastProvider>
          <AuthContext.Provider value={authValue}>
            <RoadmapGenerationProvider>
              {children}
            </RoadmapGenerationProvider>
          </AuthContext.Provider>
        </ToastProvider>
      </MemoryRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}
