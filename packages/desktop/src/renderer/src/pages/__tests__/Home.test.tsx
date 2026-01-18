import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Home from '../Home';

// Mock the API service
vi.mock('../../services/api', () => ({
  checkHealth: vi.fn(),
}));

import { checkHealth } from '../../services/api';

describe('Home', () => {
  const mockGetVersions = vi.fn();

  beforeEach(() => {
    // Mock window.api by assigning directly
    (window as any).api = {
      getVersions: mockGetVersions,
    };
    mockGetVersions.mockReturnValue({
      electron: '28.1.0',
      chrome: '120.0.0',
      node: '18.18.0',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete (window as any).api;
  });

  describe('version display', () => {
    it('displays Electron version', async () => {
      vi.mocked(checkHealth).mockResolvedValue({ status: 'ok' });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText(/electron.*28\.1\.0/i)).toBeInTheDocument();
      });
    });

    it('displays Chrome version', async () => {
      vi.mocked(checkHealth).mockResolvedValue({ status: 'ok' });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText(/chrome.*120\.0\.0/i)).toBeInTheDocument();
      });
    });

    it('displays Node.js version', async () => {
      vi.mocked(checkHealth).mockResolvedValue({ status: 'ok' });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText(/node.*18\.18\.0/i)).toBeInTheDocument();
      });
    });
  });

  describe('health check', () => {
    it('shows loading state initially', () => {
      vi.mocked(checkHealth).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<Home />);

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('shows success state when health check passes', async () => {
      vi.mocked(checkHealth).mockResolvedValue({ status: 'ok' });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText(/connected/i)).toBeInTheDocument();
      });
    });

    it('shows error state when health check fails', async () => {
      vi.mocked(checkHealth).mockRejectedValue(new Error('Network error'));

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText(/error|disconnected|failed/i)).toBeInTheDocument();
      });
    });
  });
});
