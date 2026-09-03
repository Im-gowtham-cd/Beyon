import { useState, useEffect } from 'react';
import {
  PlusCircle,
  Video,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import styles from '../../assessment/pages/AssessmentBuilderPage.module.css';

interface InterviewRound {
  id: string;
  name: string;
  roundType: 'TECHNICAL' | 'CODING' | 'SYSTEM_DESIGN' | 'HR';
  durationMinutes: number;
  interviewer?: string;
  candidateName: string;
  scheduledTime: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'IN_PROGRESS';
  score?: number;
  meetingLink?: string;
}

export function InterviewManagementPage() {
  const [interviews, setInterviews] = useState<InterviewRound[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const [newInterview, setNewInterview] = useState({
    candidateName: '',
    applicationId: '',
    name: 'Round 1: Technical Benchmark Review',
    roundType: 'TECHNICAL' as const,
    durationMinutes: 60,
    interviewer: 'Senior Technical Lead',
    scheduledTime: '',
    meetingLink: '',
  });

  useEffect(() => {
    async function loadInterviews() {
      try {
        const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

        const [intRes, appRes] = await Promise.all([
          fetch('/api/v1/interviews', { headers }).catch(() => null),
          fetch('/api/v1/recruitment/applications', { headers }).catch(() => null),
        ]);

        if (intRes && intRes.ok) {
          const json = await intRes.json();
          const items = Array.isArray(json) ? json : json?.data || [];
          if (items.length > 0) {
            setInterviews(items.map((i: any, idx: number) => ({
              id: i.id || `int-${idx}`,
              name: i.roundName || i.name || 'Round 1: Technical Evaluation',
              roundType: i.roundType || 'TECHNICAL',
              durationMinutes: i.durationMinutes || 60,
              interviewer: i.interviewer || 'Technical Evaluator',
              candidateName: i.candidateName || 'Candidate',
              scheduledTime: i.scheduledAt || 'Scheduled',
              status: i.status || 'SCHEDULED',
              score: i.score,
              meetingLink: i.meetingLink,
            })));
          } else {
            setInterviews([]);
          }
        }

        if (appRes && appRes.ok) {
          const appJson = await appRes.json();
          const appItems = Array.isArray(appJson) ? appJson : appJson?.data || [];
          if (appItems.length > 0) {
            setApplicants(appItems);
            setNewInterview(prev => ({
              ...prev,
              applicationId: appItems[0].id,
              candidateName: appItems[0].studentName || appItems[0].name || 'Candidate',
            }));
          }
        }
      } catch {
        setInterviews([]);
      } finally {
        setLoading(false);
      }
    }
    loadInterviews();
  }, []);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInterview.candidateName) return;

    const created: InterviewRound = {
      id: `int-${Date.now()}`,
      ...newInterview,
      status: 'SCHEDULED',
    };

    setInterviews([created, ...interviews]);
    setShowScheduleModal(false);

    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      await fetch('/api/v1/interviews/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          applicationId: newInterview.applicationId || undefined,
          roundId: undefined,
          durationMinutes: newInterview.durationMinutes,
          meetingLink: newInterview.meetingLink,
          notes: newInterview.name,
        }),
      });
    } catch {
      /* handled */
    }
  };

  const validScores = interviews.filter((i) => i.score !== undefined && i.score !== null);
  const avgScore =
    validScores.length > 0
      ? (validScores.reduce((sum, i) => sum + Number(i.score), 0) / validScores.length).toFixed(1) + '%'
      : '0.0%';

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Corporate Interview Management &amp; Scheduling</h1>
          <p className={styles.subtitle}>
            Schedule live video technical interviews, assign engineering evaluators, and record candidate scorecards
          </p>
        </div>
        <button className={styles.btnPrimary} onClick={() => setShowScheduleModal(true)}>
          <PlusCircle size={15} />
          <span>Schedule New Interview</span>
        </button>
      </div>

      {/* 4 Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Scheduled Interviews</span>
          <span className={styles.statValue} style={{ color: '#1c2d81' }}>
            {interviews.filter((i) => i.status === 'SCHEDULED').length}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Completed Rounds</span>
          <span className={styles.statValue} style={{ color: '#15803d' }}>
            {interviews.filter((i) => i.status === 'COMPLETED').length}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Avg Technical Score</span>
          <span className={styles.statValue} style={{ color: '#0284c7' }}>{avgScore}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Interviewer Pool</span>
          <span className={styles.statValue} style={{ color: '#7c3aed' }}>
            {interviews.length > 0 ? `${interviews.length} Active` : '0 Evaluators'}
          </span>
        </div>
      </div>

      {/* Modal */}
      {showScheduleModal && (
        <form onSubmit={handleSchedule} className={styles.formCard} style={{ marginBottom: '20px' }}>
          <h2 className={styles.sectionHeading}>Schedule Candidate Technical Round</h2>
          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Candidate Name *</label>
              {applicants.length > 0 ? (
                <select
                  className={styles.select}
                  value={newInterview.applicationId}
                  onChange={(e) => {
                    const sel = applicants.find((a) => a.id === e.target.value);
                    setNewInterview({
                      ...newInterview,
                      applicationId: e.target.value,
                      candidateName: sel ? sel.studentName || sel.name : e.target.value,
                    });
                  }}
                >
                  {applicants.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.studentName || a.name} - {a.opportunityTitle || a.role} ({a.institutionName || a.college})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className={styles.input}
                  placeholder="e.g. Candidate Name (Institution)"
                  value={newInterview.candidateName}
                  onChange={(e) => setNewInterview({ ...newInterview, candidateName: e.target.value })}
                  required
                />
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Round Title</label>
              <input
                className={styles.input}
                value={newInterview.name}
                onChange={(e) => setNewInterview({ ...newInterview, name: e.target.value })}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Round Format</label>
              <select
                className={styles.select}
                value={newInterview.roundType}
                onChange={(e) => setNewInterview({ ...newInterview, roundType: e.target.value as any })}
              >
                <option value="TECHNICAL">Live Technical Interview</option>
                <option value="CODING">Live Coding &amp; Algorithms</option>
                <option value="SYSTEM_DESIGN">System Design &amp; Architecture</option>
                <option value="HR">HR &amp; Cultural Fit</option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Date &amp; Time Window</label>
              <input
                className={styles.input}
                placeholder="e.g. Tomorrow, 2:00 PM - 3:00 PM"
                value={newInterview.scheduledTime}
                onChange={(e) => setNewInterview({ ...newInterview, scheduledTime: e.target.value })}
              />
            </div>

            <div className={styles.fieldGroup} style={{ gridColumn: '1 / -1' }}>
              <label className={styles.label}>Meeting / Video Room Link</label>
              <input
                className={styles.input}
                placeholder="https://meet.google.com/xyz or live room URL"
                value={newInterview.meetingLink}
                onChange={(e) => setNewInterview({ ...newInterview, meetingLink: e.target.value })}
              />
            </div>
          </div>

          <div className={styles.formFooter}>
            <button type="submit" className={styles.btnPrimary}>
              Confirm &amp; Schedule
            </button>
            <button type="button" className={styles.btnSecondary} onClick={() => setShowScheduleModal(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Interviews List */}
      {loading ? (
        <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
          Loading scheduled interviews...
        </div>
      ) : interviews.length === 0 ? (
        <div
          style={{
            padding: '48px 24px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            color: '#64748b',
          }}
        >
          <Calendar size={36} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b', marginBottom: '4px' }}>
            No scheduled interviews yet
          </div>
          <div style={{ fontSize: '0.84rem', maxWidth: '440px', margin: '0 auto 16px' }}>
            When you schedule technical evaluation rounds with shortlisted candidates, they will appear here with live room links and scorecard tracking.
          </div>
          <button className={styles.btnPrimary} onClick={() => setShowScheduleModal(true)}>
            <PlusCircle size={15} />
            <span>Schedule First Interview</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {interviews.map((item) => (
            <div
              key={item.id}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderLeft: item.status === 'COMPLETED' ? '4px solid #15803d' : '4px solid #1c2d81',
                borderRadius: '0px',
                padding: '18px 22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.98rem', color: '#0f172a' }}>
                    {item.name}
                  </span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      background: item.status === 'COMPLETED' ? '#dcfce7' : '#eff6ff',
                      color: item.status === 'COMPLETED' ? '#15803d' : '#1d4ed8',
                    }}
                  >
                    {item.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <span><strong>Candidate:</strong> {item.candidateName}</span>
                  <span>&middot;</span>
                  <span><strong>Evaluator:</strong> {item.interviewer}</span>
                  {item.scheduledTime && (
                    <>
                      <span>&middot;</span>
                      <span><strong>Time:</strong> {item.scheduledTime}</span>
                    </>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {item.status === 'COMPLETED' ? (
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#15803d', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={15} /> Evaluated: {item.score}%
                  </span>
                ) : (
                  <button
                    style={{
                      height: '36px',
                      background: '#1c2d81',
                      color: '#ffffff',
                      border: '1px solid #1c2d81',
                      padding: '0 16px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                    onClick={() => {
                      if (item.meetingLink) {
                        window.open(item.meetingLink, '_blank');
                      } else {
                        alert(`Launching interview room for ${item.candidateName}...`);
                      }
                    }}
                  >
                    <Video size={14} />
                    <span>Join Live Room</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
