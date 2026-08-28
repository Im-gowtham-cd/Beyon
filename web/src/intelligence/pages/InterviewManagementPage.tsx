import { useState } from 'react';
import {
  PlusCircle,
  Video,
  CheckCircle2,
} from 'lucide-react';
import styles from '../../assessment/pages/AssessmentBuilderPage.module.css';

interface InterviewRound {
  id: string;
  name: string;
  roundType: 'TECHNICAL' | 'CODING' | 'SYSTEM_DESIGN' | 'HR';
  durationMinutes: number;
  interviewer: string;
  candidateName: string;
  scheduledTime: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'IN_PROGRESS';
  score?: number;
}

export function InterviewManagementPage() {
  const [interviews, setInterviews] = useState<InterviewRound[]>([
    {
      id: 'int-01',
      name: 'Round 1: Core Data Structures & Systems Architecture',
      roundType: 'TECHNICAL',
      durationMinutes: 60,
      interviewer: 'Rajesh (Head of Talent) & Lead Architect',
      candidateName: 'Aravind Swaminathan (PSG Tech)',
      scheduledTime: 'Today, 2:30 PM - 3:30 PM',
      status: 'SCHEDULED',
    },
    {
      id: 'int-02',
      name: 'Round 1: CUDA Kernel Optimization & C++ Live Coding',
      roundType: 'CODING',
      durationMinutes: 75,
      interviewer: 'GPU Systems Engineering Lead',
      candidateName: 'Divya Ramesh (CEG Guindy)',
      scheduledTime: 'Today, 4:00 PM - 5:15 PM',
      status: 'SCHEDULED',
    },
    {
      id: 'int-03',
      name: 'Round 2: Distributed Cloud Architecture & Terraform',
      roundType: 'SYSTEM_DESIGN',
      durationMinutes: 60,
      interviewer: 'Principal Cloud DevOps Architect',
      candidateName: 'Karthik Subramanian (VIT)',
      scheduledTime: 'Tomorrow, 11:00 AM - 12:00 PM',
      status: 'SCHEDULED',
    },
    {
      id: 'int-04',
      name: 'Technical Benchmark & Offensive Security Case Study',
      roundType: 'TECHNICAL',
      durationMinutes: 45,
      interviewer: 'Security Operations Lead',
      candidateName: 'Pooja Narayanan (SSN)',
      scheduledTime: 'Yesterday',
      status: 'COMPLETED',
      score: 92,
    },
  ]);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newInterview, setNewInterview] = useState({
    candidateName: '',
    name: 'Round 1: Technical Benchmark Review',
    roundType: 'TECHNICAL' as const,
    durationMinutes: 60,
    interviewer: 'Senior Technical Lead',
    scheduledTime: 'Tomorrow, 2:00 PM',
  });

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInterview.candidateName) return;

    setInterviews([
      {
        id: `int-${Date.now()}`,
        ...newInterview,
        status: 'SCHEDULED',
      },
      ...interviews,
    ]);
    setShowScheduleModal(false);
    setNewInterview({
      candidateName: '',
      name: 'Round 1: Technical Benchmark Review',
      roundType: 'TECHNICAL',
      durationMinutes: 60,
      interviewer: 'Senior Technical Lead',
      scheduledTime: 'Tomorrow, 2:00 PM',
    });
  };

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
          <span className={styles.statValue} style={{ color: '#0284c7' }}>92.0%</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Interviewer Pool</span>
          <span className={styles.statValue} style={{ color: '#7c3aed' }}>6 Active Evaluators</span>
        </div>
      </div>

      {/* Modal */}
      {showScheduleModal && (
        <form onSubmit={handleSchedule} className={styles.formCard} style={{ marginBottom: '20px' }}>
          <h2 className={styles.sectionHeading}>Schedule Candidate Technical Round</h2>
          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Candidate Name &amp; Institution *</label>
              <input
                className={styles.input}
                placeholder="e.g. Aravind Swaminathan (PSG Tech)"
                value={newInterview.candidateName}
                onChange={(e) => setNewInterview({ ...newInterview, candidateName: e.target.value })}
                required
              />
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
                value={newInterview.scheduledTime}
                onChange={(e) => setNewInterview({ ...newInterview, scheduledTime: e.target.value })}
              />
            </div>
          </div>
          <div className={styles.formFooter}>
            <button type="submit" className={styles.btnPrimary}>
              Confirm &amp; Send Invite
            </button>
            <button type="button" className={styles.btnSecondary} onClick={() => setShowScheduleModal(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Interviews List */}
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
                <span>&middot;</span>
                <span><strong>Time:</strong> {item.scheduledTime}</span>
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
                  onClick={() => alert(`Launching secure interview room for ${item.candidateName}...`)}
                >
                  <Video size={14} />
                  <span>Join Live Room</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
