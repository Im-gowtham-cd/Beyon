import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../test/test-utils';
import { DiscussionsPage } from '../pages/DiscussionsPage';
import { communityApi } from '../services/communityApi';
import { mockThread } from '../../test/mocks/handlers';

vi.mock('../services/communityApi', () => ({
  communityApi: {
    getThreads: vi.fn(),
    createThread: vi.fn(),
    getReplies: vi.fn(),
    addReply: vi.fn(),
    markSolved: vi.fn(),
  },
}));

describe('DiscussionsPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows loading state', () => {
    (communityApi.getThreads as any).mockReturnValue(new Promise(() => {}));
    render(<DiscussionsPage />);
    expect(screen.getByText('Loading discussions...')).toBeInTheDocument();
  });

  it('renders threads after loading', async () => {
    (communityApi.getThreads as any).mockResolvedValue([mockThread]);
    render(<DiscussionsPage />);
    await waitFor(() => {
      expect(screen.getByText('How to prepare for Java interview?')).toBeInTheDocument();
    });
  });

  it('shows reply count', async () => {
    (communityApi.getThreads as any).mockResolvedValue([mockThread]);
    render(<DiscussionsPage />);
    await waitFor(() => {
      expect(screen.getByText('10 replies · 150 views')).toBeInTheDocument();
    });
  });

  it('shows new thread button', async () => {
    (communityApi.getThreads as any).mockResolvedValue([]);
    render(<DiscussionsPage />);
    await waitFor(() => {
      expect(screen.getByText('+ New Thread')).toBeInTheDocument();
    });
  });
});
