import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import App from '../App';

// Mock the API calls to prevent network requests during testing
vi.mock('../services/api', () => ({
  familyTreeApi: {
    getAll: vi.fn().mockResolvedValue([]),
  },
  personApi: {
    getAll: vi.fn().mockResolvedValue([]),
  },
}));

describe('App', () => {
  it('renders the main heading', () => {
    render(<App />);
    expect(
      screen.getByText('Family Tree Graph Management System')
    ).toBeDefined();
  });

  it('renders loading state initially', () => {
    render(<App />);
    expect(screen.getByText('Loading...')).toBeDefined();
  });
});
