import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Login from '../pages/Login';

// Mock the auth store and api
vi.mock('../store/authStore', () => ({
  useAuthStore: () => ({
    login: vi.fn(),
  }),
}));
vi.mock('../services/api', () => ({
  post: vi.fn().mockResolvedValue({ data: { token: 'fake-token' } }),
  default: {
    post: vi.fn().mockResolvedValue({ data: { token: 'fake-token' } }),
  }
}));

describe('Login Component', () => {
  it('renders login form', () => {
    render(<BrowserRouter><Login /></BrowserRouter>);
    expect(screen.getByRole('heading', { name: /Welcome back/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    render(<BrowserRouter><Login /></BrowserRouter>);
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });
  });
});
