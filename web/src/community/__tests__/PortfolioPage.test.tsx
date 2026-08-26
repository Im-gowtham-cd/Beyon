import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../test/test-utils';
import { PortfolioPage } from '../pages/PortfolioPage';
import { communityApi } from '../services/communityApi';

vi.mock('../services/communityApi', () => ({
  communityApi: {
    getMyAchievements: vi.fn(),
    submitAchievement: vi.fn(),
  },
}));

describe('PortfolioPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows loading state', () => {
    (communityApi.getMyAchievements as any).mockReturnValue(new Promise(() => {}));
    render(<PortfolioPage />);
    expect(screen.getByText('Loading portfolio...')).toBeInTheDocument();
  });

  it('renders empty state', async () => {
    (communityApi.getMyAchievements as any).mockResolvedValue([]);
    render(<PortfolioPage />);
    await waitFor(() => {
      expect(screen.getByText('My Portfolio')).toBeInTheDocument();
    });
  });

  it('shows achievement count in subtitle', async () => {
    (communityApi.getMyAchievements as any).mockResolvedValue([
      { id: '1', verificationStatus: 'VERIFIED', title: 'AWS Cert', achievementType: 'CERTIFICATION' },
      { id: '2', verificationStatus: 'PENDING', title: 'Hackathon', achievementType: 'HACKATHON' },
    ]);
    render(<PortfolioPage />);
    await waitFor(() => {
      expect(screen.getByText(/1 verified/)).toBeInTheDocument();
    });
  });

  it('shows submit button', async () => {
    (communityApi.getMyAchievements as any).mockResolvedValue([]);
    render(<PortfolioPage />);
    await waitFor(() => {
      expect(screen.getByText('+ Add Achievement')).toBeInTheDocument();
    });
  });
});
