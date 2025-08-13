import React from 'react';
import { render, screen } from '@testing-library/react';
import { Header } from '../../components/Header';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
  }),
}));

// Mock useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    logout: jest.fn(),
  }),
}));

describe('Header Component', () => {
  it('renders navigation links', () => {
    render(<Header />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('API Docs')).toBeInTheDocument();
  });

  it('renders theme toggle button', () => {
    render(<Header />);
    
    const themeButton = screen.getByRole('button', { name: /switch to dark mode/i });
    expect(themeButton).toBeInTheDocument();
  });
});
