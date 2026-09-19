import { useState } from 'react';
import {
  CheckCircle2,
  Award,
  Calendar,
  Building2,
  UserCheck,
  FileCheck,
  ExternalLink,
  Send,
  Star,
  Download,
  ShieldCheck,
  QrCode,
  Sparkles,
} from 'lucide-react';

interface WeeklyLog {
  weekNumber: number;
  title: string;
  deliverables: string;
  challengesAndSolutions: string;
  prOrCodeLink: string;
  hoursSpent: number;
  submissionDate: string;
  status: 'APPROVED' | 'REVIEW_PENDING' | 'CHANGES_REQUESTED' | 'DRAFT';
  mentorFeedback?: string;
  mentorRating?: number;
}

const SAMPLE_LOGS: WeeklyLog[] = [
  {
    weekNumber: 1,
    title: 'Onboarding, Local Microservices Setup & Security Compliance',
    deliverables: 'Configured local development cluster using Docker Compose, completed SOC2 security training, and ran integration test suites across backend endpoints.',
    challengesAndSolutions: 'Encountered local port conflicts between Postgres and Redis. Resolved by parameterizing environment variable mappings.',
    prOrCodeLink: 'https://github.com/company/repo/pull/104',
    hoursSpent: 40,
    submissionDate: '2026-06-08',
    status: 'APPROVED',
    mentorFeedback: 'Prompt onboarding. Well-documented local setup instructions added to the team wiki.',
    mentorRating: 5,
  },
  {
    weekNumber: 2,
    title: 'Spring Cloud Gateway Route Filters & JWT Verification Hook',
    deliverables: 'Implemented non-blocking reactive gateway filter to validate RS256 JWT public keys and forward user tenant identity headers downstream.',
    challengesAndSolutions: 'JWK cache invalidation caused high latency on cold starts. Added Spring Caffeine local cache with 15-minute TTL.',
    prOrCodeLink: 'https://github.com/company/repo/pull/118',
    hoursSpent: 42,
    submissionDate: '2026-06-15',
    status: 'APPROVED',
    mentorFeedback: 'Clean reactive code. Good job measuring p99 latency before and after caching.',
    mentorRating: 5,
  },
  {
    weekNumber: 3,
    title: 'Distributed Event Streaming with AWS SQS & Dead-Letter Queues',
    deliverables: 'Provisioned consumer listeners with exponential backoff retry policies and automated dead-letter routing for malformed JSON payloads.',
    challengesAndSolutions: 'Handling poisoned message loops during network timeouts. Added max-receive-count threshold of 3 before DLQ triage.',
    prOrCodeLink: 'https://github.com/company/repo/pull/135',
    hoursSpent: 38,
    submissionDate: '2026-06-22',
    status: 'APPROVED',
    mentorFeedback: 'Robust error handling. Excellent test coverage for DLQ redrive policies.',
    mentorRating: 4,
  },
  {
    weekNumber: 4,
    title: 'Mid-Term Architecture Review & Redis Multi-Region Caching',
    deliverables: 'Presented mid-term architecture progress to engineering directors. Benchmarked Redis clustered cache invalidation under 5,000 req/sec load.',
    challengesAndSolutions: 'Cache stampede risk under spike traffic. Implemented probabilistic early expiration (XFetch algorithm).',
    prOrCodeLink: 'https://github.com/company/repo/pull/152',
    hoursSpent: 44,
    submissionDate: '2026-06-29',
    status: 'APPROVED',
    mentorFeedback: 'Mid-term presentation was clear and technically rigorous. Engineering director was impressed with cache stampede mitigation.',
    mentorRating: 5,
  },
  {
    weekNumber: 5,
    title: 'Database Schema Sharding & Query Optimization',
    deliverables: 'Optimized composite index queries on PostgreSQL candidate table, reducing p95 latency from 320ms to 24ms.',
    challengesAndSolutions: 'Sequential scans on historical audit tables. Introduced BRIN indexes on timestamp columns.',
    prOrCodeLink: 'https://github.com/company/repo/pull/168',
    hoursSpent: 41,
    submissionDate: '2026-07-06',
    status: 'APPROVED',
    mentorFeedback: 'Significant query latency improvements in production staging.',
    mentorRating: 5,
  },
  {
    weekNumber: 6,
    title: 'CI/CD Automated Integration Testing Pipeline via GitHub Actions',
    deliverables: 'Built parallel test matrix runner reducing workflow execution time from 22 minutes to 6 minutes.',
    challengesAndSolutions: 'Docker test containers flakiness. Configured health check probes and volume mount caching.',
    prOrCodeLink: 'https://github.com/company/repo/pull/189',
    hoursSpent: 39,
    submissionDate: '2026-07-13',
    status: 'APPROVED',
    mentorFeedback: 'Massive engineering velocity win for the entire team.',
    mentorRating: 5,
  },
  {
    weekNumber: 7,
    title: 'React TypeScript Analytics Dashboard Frontend Implementation',
    deliverables: 'Built responsive cohort breakdown charts with SVG data visualization, dark/light theme tokens, and accessible WCAG keyboard controls.',
    challengesAndSolutions: 'Virtual rendering of 10,000 log rows. Integrated DOM virtualizer for 60fps scrolling.',
    prOrCodeLink: 'https://github.com/company/repo/pull/210',
    hoursSpent: 40,
    submissionDate: '2026-07-20',
    status: 'APPROVED',
    mentorFeedback: 'Clean component decomposition and accessible UX.',
    mentorRating: 5,
  },
  {
    weekNumber: 8,
    title: 'Full End-to-End Load Testing & Production Deployment Verification',
    deliverables: 'Conducted Locust distributed load testing up to 8,000 concurrent virtual users. Authored deployment runbook and rollback plan.',
    challengesAndSolutions: 'Connection pool starvation on DB read replicas. Tuned HikariCP connection timeout and maximum pool size.',
    prOrCodeLink: 'https://github.com/company/repo/pull/234',
    hoursSpent: 45,
    submissionDate: '2026-07-27',
    status: 'APPROVED',
    mentorFeedback: 'Intern demonstrated production-ready engineering ownership.',
    mentorRating: 5,
  },
];

export function InternshipTrackingPage() {
  const [selectedWeek, setSelectedWeek] = useState<number>(8);
  const [logs, setLogs] = useState<WeeklyLog[]>(SAMPLE_LOGS);
  const [activeTab, setActiveTab] = useState<'LOGBOOK' | 'EVALUATION' | 'CERTIFICATE'>('LOGBOOK');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New log form state
  const [newDeliverables, setNewDeliverables] = useState('');
  const [newChallenges, setNewChallenges] = useState('');
  const [newPrLink, setNewPrLink] = useState('');
  const [newHours, setNewHours] = useState(40);

  const activeLog = logs.find((l) => l.weekNumber === selectedWeek);

  const handleSaveWeekLog = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedLogs = logs.map((l) => {
      if (l.weekNumber === selectedWeek) {
        return {
          ...l,
          deliverables: newDeliverables || l.deliverables,
          challengesAndSolutions: newChallenges || l.challengesAndSolutions,
          prOrCodeLink: newPrLink || l.prOrCodeLink,
          hoursSpent: newHours,
          status: 'REVIEW_PENDING' as const,
          submissionDate: new Date().toISOString().split('T')[0],
        };
      }
      return l;
    });

    setLogs(updatedLogs);
    setToastMessage(`Week ${selectedWeek} milestone submitted to mentor for review.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAddToPortfolio = () => {
    setToastMessage('Internship Completion Certificate added to your Digital Portfolio!');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const totalHoursLogged = logs.reduce((acc, l) => acc + l.hoursSpent, 0);
  const averageRating = (logs.reduce((acc, l) => acc + (l.mentorRating || 0), 0) / logs.length).toFixed(1);

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto', fontFamily: "'ClashDisplay', 'Clash Display', sans-serif" }}>
      {/* Page Header */}
      <div style={{ marginBottom: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', padding: '3px 10px', fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Active Industrial Internship
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Supervised Academic &amp; Industry Track</span>
            </div>
            <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 900, color: '#1c2d81', letterSpacing: '-0.02em' }}>
              Internship Progress Logbook &amp; Certification
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: '#475569', maxWidth: '850px', lineHeight: 1.5 }}>
              Track weekly deliverables, document technical milestones, receive periodic mentor evaluations, and earn verified industry completion certificates directly tied to your academic records.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('LOGBOOK')}
              style={{
                padding: '9px 18px',
                background: activeTab === 'LOGBOOK' ? '#1c2d81' : '#ffffff',
                color: activeTab === 'LOGBOOK' ? '#fed601' : '#1c2d81',
                border: '1.5px solid #1c2d81',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <FileCheck size={16} />
              <span>Weekly Logbook (8/12 Weeks)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('EVALUATION')}
              style={{
                padding: '9px 18px',
                background: activeTab === 'EVALUATION' ? '#1c2d81' : '#ffffff',
                color: activeTab === 'EVALUATION' ? '#fed601' : '#1c2d81',
                border: '1.5px solid #1c2d81',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Star size={16} />
              <span>Mentor Evaluation</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('CERTIFICATE')}
              style={{
                padding: '9px 18px',
                background: activeTab === 'CERTIFICATE' ? '#1c2d81' : '#ffffff',
                color: activeTab === 'CERTIFICATE' ? '#fed601' : '#1c2d81',
                border: '1.5px solid #1c2d81',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Award size={16} />
              <span>Completion Certificate</span>
            </button>
          </div>
        </div>

        {/* Internship Overview Banner */}
        <div style={{ marginTop: '20px', background: '#ffffff', border: '1px solid #e2e8f0', borderLeft: '5px solid #1c2d81', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Position &amp; Enterprise</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1c2d81', marginTop: '3px' }}>
              Full Stack Cloud Platform Engineering Intern
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.82rem', color: '#475569', marginTop: '6px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 700, color: '#0f172a' }}>
                <Building2 size={14} color="#1c2d81" /> Atlassian Cloud Systems
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <UserCheck size={14} color="#16a34a" /> Mentor: Arjun Srinivasan (Principal Architect)
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <Calendar size={14} color="#64748b" /> June 2026 – August 2026
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Stipend</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#15803d', marginTop: '2px' }}>Rs. 45,000 / month</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Hours Logged</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1c2d81', marginTop: '2px' }}>{totalHoursLogged} hrs</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Mentor Rating</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ca8a04', marginTop: '2px' }}>{averageRating} / 5.0</div>
            </div>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div style={{ marginBottom: '20px', padding: '12px 18px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} color="#16a34a" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TAB 1: Weekly Logbook */}
      {activeTab === 'LOGBOOK' && (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', alignItems: 'start' }}>
          {/* Week Selector Column */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '12px' }}>
            <div style={{ padding: '8px 12px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>
              Internship Weeks (1–12)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((week) => {
                const logItem = logs.find((l) => l.weekNumber === week);
                const isSelected = selectedWeek === week;
                const isCompleted = logItem?.status === 'APPROVED';

                return (
                  <button
                    key={week}
                    type="button"
                    onClick={() => setSelectedWeek(week)}
                    style={{
                      padding: '10px 14px',
                      textAlign: 'left',
                      background: isSelected ? '#eff6ff' : '#ffffff',
                      border: isSelected ? '1.5px solid #1c2d81' : '1px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontFamily: 'inherit',
                      transition: 'all 0.1s ease',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: isSelected ? 800 : 700, color: isSelected ? '#1c2d81' : '#0f172a' }}>
                        Week {week}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                        {week <= 8 ? `${logItem?.hoursSpent || 40} hrs logged` : 'Upcoming milestone'}
                      </div>
                    </div>

                    {isCompleted ? (
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#dcfce7', color: '#166534', padding: '2px 6px' }}>
                        Approved
                      </span>
                    ) : week <= 8 ? (
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#fef3c7', color: '#92400e', padding: '2px 6px' }}>
                        Review
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#94a3b8' }}>Pending</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Week Detail & Submission View */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '18px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase' }}>Milestone Progress</span>
                <h2 style={{ margin: '2px 0 0', fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
                  Week {selectedWeek}: {activeLog?.title || 'Deliverables & Code Submissions'}
                </h2>
              </div>

              {activeLog && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      padding: '4px 12px',
                      fontSize: '0.76rem',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      background: activeLog.status === 'APPROVED' ? '#dcfce7' : '#fef3c7',
                      color: activeLog.status === 'APPROVED' ? '#166534' : '#92400e',
                      border: `1px solid ${activeLog.status === 'APPROVED' ? '#bbf7d0' : '#fde68a'}`,
                    }}
                  >
                    Status: {activeLog.status}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Submitted {activeLog.submissionDate}</span>
                </div>
              )}
            </div>

            {activeLog ? (
              <div>
                {/* Deliverables */}
                <div style={{ marginBottom: '18px' }}>
                  <h3 style={{ margin: '0 0 6px', fontSize: '0.86rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase' }}>
                    1. Key Deliverables &amp; Engineering Contributions
                  </h3>
                  <p style={{ margin: 0, padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.86rem', color: '#334155', lineHeight: 1.55 }}>
                    {activeLog.deliverables}
                  </p>
                </div>

                {/* Challenges and Solutions */}
                <div style={{ marginBottom: '18px' }}>
                  <h3 style={{ margin: '0 0 6px', fontSize: '0.86rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase' }}>
                    2. Technical Challenges Encountered &amp; Fixes Applied
                  </h3>
                  <p style={{ margin: 0, padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.86rem', color: '#334155', lineHeight: 1.55 }}>
                    {activeLog.challengesAndSolutions}
                  </p>
                </div>

                {/* Code Links & Hours */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px', marginBottom: '24px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 6px', fontSize: '0.86rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase' }}>
                      3. Pull Request / Code Evidence Link
                    </h3>
                    <div style={{ padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: '#2563eb' }}>{activeLog.prOrCodeLink}</span>
                      <a href={activeLog.prOrCodeLink} target="_blank" rel="noopener noreferrer" style={{ color: '#1c2d81', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 700 }}>
                        <span>Open PR</span> <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>

                  <div>
                    <h3 style={{ margin: '0 0 6px', fontSize: '0.86rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase' }}>
                      4. Hours Contributed
                    </h3>
                    <div style={{ padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
                      {activeLog.hoursSpent} Hours (Full-Time Track)
                    </div>
                  </div>
                </div>

                {/* Mentor Evaluation Section */}
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px 20px', borderLeft: '4px solid #16a34a' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#166534', textTransform: 'uppercase' }}>
                      Mentor Feedback &amp; Verification
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} size={15} fill={i < (activeLog.mentorRating || 0) ? '#eab308' : '#e2e8f0'} color={i < (activeLog.mentorRating || 0) ? '#eab308' : '#cbd5e1'} />
                      ))}
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#166534', marginLeft: '6px' }}>
                        {activeLog.mentorRating}.0 / 5.0
                      </span>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#14532d', lineHeight: 1.5 }}>
                    "{activeLog.mentorFeedback}"
                  </p>
                  <div style={{ marginTop: '8px', fontSize: '0.74rem', color: '#15803d', fontWeight: 700 }}>
                    Verified by: Arjun Srinivasan (Industry Mentor, Atlassian Cloud Systems)
                  </div>
                </div>
              </div>
            ) : (
              /* Upcoming week submission form */
              <form onSubmit={handleSaveWeekLog}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase', marginBottom: '6px' }}>
                    1. Deliverables Completed in Week {selectedWeek}
                  </label>
                  <textarea
                    rows={3}
                    value={newDeliverables}
                    onChange={(e) => setNewDeliverables(e.target.value)}
                    placeholder="Document feature tickets closed, architectural spikes, and endpoints built..."
                    required
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase', marginBottom: '6px' }}>
                    2. Engineering Challenges Faced &amp; Resolutions
                  </label>
                  <textarea
                    rows={3}
                    value={newChallenges}
                    onChange={(e) => setNewChallenges(e.target.value)}
                    placeholder="Describe bugs diagnosed, latency profiling, and root-cause solutions..."
                    required
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase', marginBottom: '6px' }}>
                      3. Pull Request / Code Evidence Link
                    </label>
                    <input
                      type="url"
                      value={newPrLink}
                      onChange={(e) => setNewPrLink(e.target.value)}
                      placeholder="https://github.com/company/repo/pull/..."
                      required
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase', marginBottom: '6px' }}>
                      4. Hours Contributed
                    </label>
                    <input
                      type="number"
                      value={newHours}
                      onChange={(e) => setNewHours(parseInt(e.target.value) || 0)}
                      min={1}
                      max={60}
                      required
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    padding: '9px 24px',
                    background: '#1c2d81',
                    color: '#fed601',
                    border: 'none',
                    fontWeight: 900,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Send size={15} />
                  <span>Submit Week {selectedWeek} Milestone for Mentor Review</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Performance Evaluation */}
      {activeTab === 'EVALUATION' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ margin: '0 0 6px', fontSize: '1.25rem', fontWeight: 900, color: '#1c2d81' }}>
              Final Comprehensive Internship Competency Assessment
            </h2>
            <p style={{ margin: 0, fontSize: '0.86rem', color: '#475569' }}>
              Evaluated across 5 core industry dimensions by Atlassian Cloud Systems mentor team.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {[
              { dim: 'Technical Execution & Architecture', rating: 5, notes: 'Consistently wrote clean, idiomatic Java and TypeScript code with comprehensive unit and integration test suites.' },
              { dim: 'Problem Solving & Algorithmic Design', rating: 5, notes: 'Demonstrated proactive diagnostics on cache stampede issues and query latency optimization.' },
              { dim: 'Agile & Team Collaboration', rating: 5, notes: 'Actively participated in sprint planning, paired with senior staff engineers, and submitted well-documented PRs.' },
              { dim: 'System Reliability & Security Awareness', rating: 4, notes: 'Diligent adherence to zero-trust authorization policies and Docker vulnerability mitigation.' },
              { dim: 'Communication & Documentation', rating: 5, notes: 'Created pristine architecture diagrams and runbooks for the entire engineering organization.' },
            ].map((evalItem, idx) => (
              <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#1c2d81' }}>{evalItem.dim}</span>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {Array.from({ length: 5 }, (_, s) => (
                      <Star key={s} size={13} fill={s < evalItem.rating ? '#eab308' : '#e2e8f0'} color={s < evalItem.rating ? '#eab308' : '#cbd5e1'} />
                    ))}
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#334155', lineHeight: 1.45 }}>{evalItem.notes}</p>
              </div>
            ))}
          </div>

          {/* Recommendation & PPO Status */}
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '18px 24px', borderLeft: '5px solid #16a34a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 900, color: '#166534', textTransform: 'uppercase' }}>Pre-Placement Offer (PPO) Recommendation</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#14532d', marginTop: '2px' }}>
                Recommended for Full-Time Conversion (Software Engineer I)
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#15803d' }}>
                "Candidate has performed at a mid-level engineer standard throughout the 12-week tenure." — Engineering Hiring Committee
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('CERTIFICATE')}
              style={{
                padding: '9px 20px',
                background: '#166534',
                color: '#ffffff',
                border: 'none',
                fontWeight: 900,
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Award size={15} />
              <span>View Verified Certificate</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: Completion Certificate */}
      {activeTab === 'CERTIFICATE' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '32px', textAlign: 'center' }}>
          {/* Certificate Card Preview */}
          <div
            style={{
              maxWidth: '780px',
              margin: '0 auto',
              border: '8px double #1c2d81',
              padding: '40px 48px',
              background: '#fdfbf7',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.12)',
              position: 'relative',
            }}
          >
            {/* Top Certificate Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={28} color="#1c2d81" />
                <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#1c2d81', letterSpacing: '0.05em' }}>BEYON ACCREDITATION</span>
              </div>
              <span style={{ fontSize: '0.74rem', fontFamily: 'monospace', color: '#64748b' }}>CERT ID: BYN-INT-2026-8942</span>
            </div>

            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>
              Certificate of Industrial Internship Completion
            </div>

            <h2 style={{ margin: '0 0 12px', fontSize: '1.8rem', fontWeight: 900, color: '#1c2d81' }}>
              Siddharth Mehta
            </h2>

            <p style={{ margin: '0 auto 20px', fontSize: '0.9rem', color: '#334155', maxWidth: '620px', lineHeight: 1.6 }}>
              has successfully completed a 12-week rigorous Industrial Internship in <strong>Full Stack Cloud Platform Engineering</strong> at <strong>Atlassian Cloud Systems</strong> from June 1, 2026 to August 21, 2026, receiving an overall performance rating of <strong>4.9 / 5.0 (Distinction)</strong>.
            </p>

            {/* Credited Skills */}
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
              {['Distributed Systems', 'Spring Boot 3', 'Kubernetes', 'AWS SQS/DLQ', 'PostgreSQL Sharding', 'React TypeScript'].map((sk, idx) => (
                <span key={idx} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#1c2d81', padding: '3px 9px', fontSize: '0.72rem', fontWeight: 800 }}>
                  {sk}
                </span>
              ))}
            </div>

            {/* Signatures */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 900, color: '#1c2d81' }}>Arjun Srinivasan</div>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Principal Architect, Atlassian</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1px solid #cbd5e1', padding: '6px 12px' }}>
                <QrCode size={24} color="#1c2d81" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.64rem', fontWeight: 800, color: '#1c2d81' }}>CRYPTOGRAPHICALLY VERIFIED</div>
                  <div style={{ fontSize: '0.62rem', color: '#16a34a' }}>Valid on Beyon Network</div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 900, color: '#1c2d81' }}>Dr. S. Ramanathan</div>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Dean of Academics, SRM University</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '14px' }}>
            <button
              type="button"
              onClick={handleAddToPortfolio}
              style={{
                padding: '10px 24px',
                background: '#1c2d81',
                color: '#fed601',
                border: 'none',
                fontWeight: 900,
                fontSize: '0.86rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Sparkles size={16} />
              <span>Add to Digital Portfolio &amp; Share Profile</span>
            </button>

            <button
              type="button"
              onClick={() => setToastMessage('Downloading official accredited certificate PDF...')}
              style={{
                padding: '10px 24px',
                background: '#ffffff',
                color: '#1c2d81',
                border: '1.5px solid #1c2d81',
                fontWeight: 800,
                fontSize: '0.86rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Download size={16} />
              <span>Download Official PDF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
