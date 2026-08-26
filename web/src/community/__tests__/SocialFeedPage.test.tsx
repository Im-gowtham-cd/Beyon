import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../test/test-utils';
import { SocialFeedPage } from '../pages/SocialFeedPage';
import { communityApi } from '../services/communityApi';
import { mockPost } from '../../test/mocks/handlers';

vi.mock('../services/communityApi', () => ({
  communityApi: {
    getFeed: vi.fn(),
    createPost: vi.fn(),
    toggleLike: vi.fn(),
    getComments: vi.fn(),
    addComment: vi.fn(),
  },
}));

describe('SocialFeedPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    (communityApi.getFeed as any).mockReturnValue(new Promise(() => {}));
    render(<SocialFeedPage />);
    expect(screen.getByText('Loading feed...')).toBeInTheDocument();
  });

  it('renders posts after loading', async () => {
    (communityApi.getFeed as any).mockResolvedValue([mockPost]);
    render(<SocialFeedPage />);
    await waitFor(() => {
      expect(screen.getByText('Hello community!')).toBeInTheDocument();
    });
  });

  it('shows empty state when no posts', async () => {
    (communityApi.getFeed as any).mockResolvedValue([]);
    render(<SocialFeedPage />);
    await waitFor(() => {
      expect(screen.getByText('Community Feed')).toBeInTheDocument();
    });
  });

  it('renders compose area', async () => {
    (communityApi.getFeed as any).mockResolvedValue([]);
    render(<SocialFeedPage />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Share something with the community...')).toBeInTheDocument();
    });
  });

  it('shows like count on posts', async () => {
    (communityApi.getFeed as any).mockResolvedValue([{ ...mockPost, likeCount: 42 }]);
    render(<SocialFeedPage />);
    await waitFor(() => {
      expect(screen.getByText('♡ 42')).toBeInTheDocument();
    });
  });
});
