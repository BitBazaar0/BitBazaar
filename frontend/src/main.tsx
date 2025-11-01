import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from './theme/theme';
import { useThemeStore } from './stores/themeStore';
import App from './App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

// Wrapper component to use theme store
const ThemedApp = () => {
  const mode = useThemeStore((state) => state.mode);
  const theme = getTheme(mode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemedApp />
  </React.StrictMode>
);
