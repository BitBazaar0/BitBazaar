import { describe, it, expect, beforeEach } from 'vitest';
import { useThemeStore } from './themeStore';

describe('ThemeStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useThemeStore.setState({ mode: 'dark' });
    localStorage.clear();
  });

  it('should have initial state with dark mode', () => {
    const { mode } = useThemeStore.getState();
    expect(mode).toBe('dark');
  });

  it('should toggle theme from dark to light', () => {
    useThemeStore.setState({ mode: 'dark' });
    useThemeStore.getState().toggleMode();

    const { mode } = useThemeStore.getState();
    expect(mode).toBe('light');
  });

  it('should toggle theme from light to dark', () => {
    useThemeStore.setState({ mode: 'light' });
    useThemeStore.getState().toggleMode();

    const { mode } = useThemeStore.getState();
    expect(mode).toBe('dark');
  });

  it('should set theme mode directly', () => {
    useThemeStore.getState().setMode('light');
    expect(useThemeStore.getState().mode).toBe('light');

    useThemeStore.getState().setMode('dark');
    expect(useThemeStore.getState().mode).toBe('dark');
  });

  it('should persist theme preference to localStorage', () => {
    useThemeStore.getState().setMode('light');

    // Check that localStorage was called
    expect(localStorage.setItem).toHaveBeenCalled();
  });
});
