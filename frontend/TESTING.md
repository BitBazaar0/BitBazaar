# BitBazaar Frontend Testing Guide

## Overview

The frontend uses **Vitest** as the testing framework with **React Testing Library** for component testing. Tests are written in TypeScript.

## Running Tests

```bash
# Run tests in watch mode (development)
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

```
src/
├── test/
│   ├── setup.ts           # Global test setup
│   └── utils.tsx          # Test utilities and custom render
├── stores/
│   ├── authStore.test.ts  # Auth store tests
│   └── themeStore.test.ts # Theme store tests
└── components/
    └── EmptyState.test.tsx # Component tests
```

## Writing Tests

### Component Tests

Use the custom `render` function that includes all providers:

```typescript
import { render, screen } from '../test/utils';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Store Tests (Zustand)

Test stores directly using `getState()` and `setState()`:

```typescript
import { useMyStore } from './myStore';

describe('MyStore', () => {
  beforeEach(() => {
    useMyStore.setState({ value: 0 });
  });

  it('should update value', () => {
    useMyStore.getState().setValue(10);
    expect(useMyStore.getState().value).toBe(10);
  });
});
```

### Hook Tests

Use `@testing-library/react` hooks for custom hooks:

```typescript
import { renderHook } from '@testing-library/react';
import { useMyHook } from './useMyHook';

it('should return correct value', () => {
  const { result } = renderHook(() => useMyHook());
  expect(result.current.value).toBe(expectedValue);
});
```

## Test Utilities

### Custom Render

The custom `render` function wraps components with:
- `QueryClientProvider` (React Query)
- `BrowserRouter` (React Router)
- `ThemeProvider` (MUI)

### Mocked Dependencies

The following are mocked in `setup.ts`:
- `window.matchMedia`
- `IntersectionObserver`
- `localStorage`
- `socket.io-client`

## Best Practices

1. **Use semantic queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
2. **Test user behavior**: Test what users see and do, not implementation details
3. **Clean up**: Tests automatically cleanup after each test
4. **Mock external dependencies**: API calls, sockets, etc.
5. **Snapshot testing**: Use sparingly, only for stable UI

## Coverage Goals

- **Components**: 70%+ coverage
- **Stores**: 90%+ coverage
- **Hooks**: 80%+ coverage
- **Utils**: 90%+ coverage

## Common Patterns

### Testing User Interactions

```typescript
import { render, screen } from '../test/utils';
import userEvent from '@testing-library/user-event';

it('should handle click', async () => {
  const user = userEvent.setup();
  render(<Button onClick={mockFn}>Click me</Button>);

  await user.click(screen.getByRole('button'));
  expect(mockFn).toHaveBeenCalled();
});
```

### Testing Forms

```typescript
it('should submit form', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();

  render(<Form onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText('Email'), 'test@example.com');
  await user.click(screen.getByRole('button', { name: /submit/i }));

  expect(onSubmit).toHaveBeenCalledWith({ email: 'test@example.com' });
});
```

### Testing Async Components

```typescript
it('should load data', async () => {
  render(<AsyncComponent />);

  expect(screen.getByText('Loading...')).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

## Debugging Tests

### View test output
```bash
npm run test:ui
```

### Debug specific test
```typescript
import { screen, debug } from '@testing-library/react';

it('should render', () => {
  render(<MyComponent />);
  screen.debug(); // Prints DOM
});
```

## CI/CD Integration

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: npm run test:run

- name: Upload coverage
  run: npm run test:coverage
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
