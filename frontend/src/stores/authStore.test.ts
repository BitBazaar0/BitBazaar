import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useAuthStore.setState({ user: null, token: null });
    localStorage.clear();
  });

  it('should have initial state with null user and token', () => {
    const { user, token } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(token).toBeNull();
  });

  it('should set auth when setAuth is called', () => {
    const testUser = {
      id: 'user-123',
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
    };
    const testToken = 'test-jwt-token';

    useAuthStore.getState().setAuth(testUser, testToken);

    const { user, token } = useAuthStore.getState();
    expect(user).toEqual(testUser);
    expect(token).toBe(testToken);
  });

  it('should clear auth when logout is called', () => {
    const testUser = {
      id: 'user-123',
      email: 'test@example.com',
      username: 'testuser',
    };
    const testToken = 'test-jwt-token';

    useAuthStore.getState().setAuth(testUser, testToken);
    useAuthStore.getState().logout();

    const { user, token } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(token).toBeNull();
  });

  it('should update user data when updateUser is called', () => {
    const testUser = {
      id: 'user-123',
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'Test',
    };
    const testToken = 'test-jwt-token';

    useAuthStore.getState().setAuth(testUser, testToken);
    useAuthStore.getState().updateUser({
      firstName: 'Updated',
      lastName: 'Name',
      phone: '+123456789',
    });

    const { user } = useAuthStore.getState();
    expect(user?.firstName).toBe('Updated');
    expect(user?.lastName).toBe('Name');
    expect(user?.phone).toBe('+123456789');
    expect(user?.id).toBe('user-123'); // Should preserve existing fields
    expect(user?.email).toBe('test@example.com');
  });

  it('should not update user when user is null', () => {
    useAuthStore.getState().updateUser({
      firstName: 'Test',
    });

    const { user } = useAuthStore.getState();
    expect(user).toBeNull();
  });

  it('should persist auth data to localStorage', () => {
    const testUser = {
      id: 'user-123',
      email: 'test@example.com',
      username: 'testuser',
    };
    const testToken = 'test-jwt-token';

    useAuthStore.getState().setAuth(testUser, testToken);

    // Check that localStorage was called
    expect(localStorage.setItem).toHaveBeenCalled();
  });
});
