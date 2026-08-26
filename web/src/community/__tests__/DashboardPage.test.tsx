import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../test/test-utils';
import { DashboardPage } from '../pages/DashboardPage';
import { communityApi } from '../services/communityApi';
import { mockDashboard } from '../../test/mocks/handlers';

vi.mock('../services/communityApi', () => ({
  communityApi: {
    getDashboard: vi.fn(),
  },
}));

describe('DashboardPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows loading state', () => {
    (communityApi.getDashboard as any).mockReturnValue(new Promise(() => {}));
    render(<DashboardPage />);
    expect(screen.getByText('Loading your dashboard...')).toBeInTheDocument();
  });

  it('renders dashboard title', async () => {
    (communityApi.getDashboard as any).mockResolvedValue(mockDashboard);
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Your Dashboard')).toBeInTheDocument();
    });
  });

  it('shows reputation stats', async () => {
    (communityApi.getDashboard as any).mockResolvedValue(mockDashboard);
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Reputation')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
    });
  });

  it('shows top skills section', async () => {
    (communityApi.getDashboard as any).mockResolvedValue(mockDashboard);
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Your Top Skills')).toBeInTheDocument();
    });
  });

  it('shows skill gaps section', async () => {
    (communityApi.getDashboard as any).mockResolvedValue(mockDashboard);
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Skill Gaps to Address')).toBeInTheDocument();
    });
  });

  it('shows recommended opportunities', async () => {
    (communityApi.getDashboard as any).mockResolvedValue(mockDashboard);
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Recommended Opportunities')).toBeInTheDocument();
    });
  });

  it('shows unread notification badge', async () => {
    (communityApi.getDashboard as any).mockResolvedValue({ ...mockDashboard, unreadNotifications: 5 });
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('5 unread')).toBeInTheDocument();
    });
  });

  it('handles empty dashboard gracefully', async () => {
    (communityApi.getDashboard as any).mockResolvedValue({
      unreadNotifications: 0,
      topSkills: [],
      skillGaps: [],
      recommendedOpportunities: [],
      recentDiscussions: [],
      recentPosts: [],
      careerProgress: [],
    });
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Your Dashboard')).toBeInTheDocument();
    });
  });
});
