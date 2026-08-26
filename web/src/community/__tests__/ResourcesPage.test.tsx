import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../test/test-utils';
import { ResourcesPage } from '../pages/ResourcesPage';
import { communityApi } from '../services/communityApi';

vi.mock('../services/communityApi', () => ({
  communityApi: {
    getPublishedResources: vi.fn(),
  },
}));

describe('ResourcesPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows loading state', () => {
    (communityApi.getPublishedResources as any).mockReturnValue(new Promise(() => {}));
    render(<ResourcesPage />);
    expect(screen.getByText('Loading resources...')).toBeInTheDocument();
  });

  it('renders page title', async () => {
    (communityApi.getPublishedResources as any).mockResolvedValue([]);
    render(<ResourcesPage />);
    await waitFor(() => {
      expect(screen.getByText('Learning Resources')).toBeInTheDocument();
    });
  });

  it('shows filter buttons', async () => {
    (communityApi.getPublishedResources as any).mockResolvedValue([]);
    render(<ResourcesPage />);
    await waitFor(() => {
      expect(screen.getByText('All')).toBeInTheDocument();
      expect(screen.getByText(/ARTICLE/)).toBeInTheDocument();
    });
  });

  it('renders resource cards', async () => {
    (communityApi.getPublishedResources as any).mockResolvedValue([
      { id: '1', resourceType: 'ARTICLE', title: 'Java Best Practices', description: 'Learn Java', isFree: true, viewCount: 100, tags: '', status: 'PUBLISHED' },
    ]);
    render(<ResourcesPage />);
    await waitFor(() => {
      expect(screen.getByText('Java Best Practices')).toBeInTheDocument();
    });
  });
});
