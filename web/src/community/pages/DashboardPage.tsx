import { useState, useEffect } from 'react';
import { communityApi } from '../services/communityApi';
import type { DashboardData } from '../types/community';
import styles from './Community.module.css';

const PROFICIENCY_COLORS: Record<string, string> = { EXPERT: '#059669', ADVANCED: '#2563eb', INTERMEDIATE: '#ca8a04', BEGINNER: '#6b7280' };
const SEVERITY_COLORS: Record<string, string> = { HIGH: '#dc2626', MEDIUM: '#ca8a04', LOW: '#059669' };

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    communityApi.getDashboard()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.container}><div className={styles.empty}>Loading your dashboard...</div></div>;
  if (!data) return <div className={styles.container}><div className={styles.empty}>Could not load dashboard</div></div>;

  return (
    <div className={styles.container}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.title}>Your Dashboard</h1>
        {data.unreadNotifications > 0 && (
          <span className={styles.notifBadge}>{data.unreadNotifications} unread</span>
        )}
      </div>

      {data.reputation && (
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{data.reputation.total}</div>
            <div className={styles.statLabel}>Reputation</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{data.reputation.answers}</div>
            <div className={styles.statLabel}>Answers</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{data.reputation.accepted}</div>
            <div className={styles.statLabel}>Accepted</div>
          </div>
        </div>
      )}

      {data.topSkills.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Your Top Skills</h3>
          <div className={styles.skillBars}>
            {data.topSkills.map(s => (
              <div className={styles.skillBarRow} key={s.skillId}>
                <div className={styles.skillBarInfo}>
                  <span className={styles.skillBarName}>{s.skillId.slice(0, 8)}</span>
                  <span className={styles.skillBarScore}>{Math.round(Number(s.confidenceScore) * 100)}%</span>
                </div>
                <div className={styles.skillBarTrack}>
                  <div className={styles.skillBarFill} style={{ width: `${Math.round(Number(s.confidenceScore) * 100)}%`, background: PROFICIENCY_COLORS[s.proficiency] || '#6366f1' }} />
                </div>
                <span className={styles.profBadge} style={{ color: PROFICIENCY_COLORS[s.proficiency] || '#6366f1' }}>{s.proficiency}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.skillGaps.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Skill Gaps to Address</h3>
          <div className={styles.gapList}>
            {data.skillGaps.map(g => (
              <div className={styles.gapCard} key={g.requiredSkillId}>
                <div className={styles.gapSkill}>{g.requiredSkillId.slice(0, 8)}</div>
                <div className={styles.gapLevels}>
                  <span className={styles.gapCurrent}>Current: {g.currentLevel}</span>
                  <span className={styles.gapArrow}>→</span>
                  <span className={styles.gapRequired}>Required: {g.requiredLevel}</span>
                </div>
                <span className={styles.severityBadge} style={{ background: SEVERITY_COLORS[g.severity] || '#6b7280' }}>{g.severity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.careerProgress.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Career Readiness</h3>
          <div className={styles.careerCards}>
            {data.careerProgress.map(cp => (
              <div className={styles.careerCard} key={cp.careerPathId}>
                <div className={styles.careerScore}>{Math.round(Number(cp.readinessScore) * 100)}%</div>
                <div className={styles.careerLabel}>Ready</div>
                <div className={styles.careerSkills}>{cp.skillsAcquired}/{cp.skillsTotal} skills</div>
                <div className={styles.skillBarTrack}>
                  <div className={styles.skillBarFill} style={{ width: `${(cp.skillsAcquired / Math.max(cp.skillsTotal, 1)) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.recommendedOpportunities.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Recommended Opportunities</h3>
          <div className={styles.matchList}>
            {data.recommendedOpportunities.map(m => (
              <div className={styles.matchCard} key={m.opportunityId}>
                <div className={styles.matchScore}>{Math.round(Number(m.totalScore) * 100)}%</div>
                <div className={styles.matchInfo}>
                  <div className={styles.matchTitle}>Opportunity</div>
                  <div className={styles.matchMeta}>Skill match: {Math.round(Number(m.skillScore) * 100)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.recentDiscussions.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Recent Discussions</h3>
          <div className={styles.discussionList}>
            {data.recentDiscussions.map(d => (
              <div className={styles.discussionCard} key={d.id}>
                <div className={styles.discussionTitle}>{d.title}</div>
                <div className={styles.discussionMeta}>
                  {d.replyCount} replies
                  {d.solved && <span className={styles.solvedBadge} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><i className="bx bx-check" /> Solved</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.recentPosts.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Community Highlights</h3>
          <div className={styles.postHighlights}>
            {data.recentPosts.map(p => (
              <div className={styles.postHighlight} key={p.id}>
                <div className={styles.postHighlightContent}>{p.content}</div>
                <div className={styles.postHighlightMeta} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><i className="bx bx-heart" /> {p.likeCount}</span>
                  <span>·</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><i className="bx bx-message-rounded" /> {p.commentCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
