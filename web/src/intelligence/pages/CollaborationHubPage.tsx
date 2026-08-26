import { useState, useEffect } from 'react';
import { intelligenceApi } from '../services/intelligenceApi';
import type { CollaborationProgram } from '../types/intelligence';
import styles from './Intelligence.module.css';

const PROGRAM_TYPES = [
  { value: 'MENTORSHIP', label: '🎓 Mentorship' },
  { value: 'WORKSHOP', label: '🔬 Workshop' },
  { value: 'GUEST_LECTURE', label: '🎤 Guest Lecture' },
  { value: 'LIVE_PROJECT', label: '💻 Live Project' },
  { value: 'INTERNSHIP', label: '🏢 Internship' },
  { value: 'HACKATHON', label: '⚡ Hackathon' },
  { value: 'INNOVATION_CHALLENGE', label: '🚀 Innovation Challenge' },
  { value: 'FDP', label: '📚 Faculty Development' },
];

export function CollaborationHubPage() {
  const [programs, setPrograms] = useState<CollaborationProgram[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    Promise.all([
      intelligenceApi.getPublishedPrograms().catch(() => []),
      intelligenceApi.getMyRegistrations().catch(() => []),
    ]).then(([p, r]) => { setPrograms(p); setRegistrations(r); }).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'ALL' ? programs : programs.filter(p => p.programType === filter);
  const registeredIds = new Set(registrations.map(r => r.programId));

  const handleRegister = async (programId: string) => {
    await intelligenceApi.registerForProgram(programId);
    const r = await intelligenceApi.getMyRegistrations();
    setRegistrations(r);
  };

  if (loading) return <div className={styles.container}><div className={styles.empty}>Loading collaboration hub...</div></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Academia–Industry Hub</h1>
        <p className={styles.subtitle}>Discover workshops, mentorships, projects, and programs</p>
      </div>

      <div className={styles.filterRow}>
        <button className={`${styles.filterBtn} ${filter === 'ALL' ? styles.filterActive : ''}`} onClick={() => setFilter('ALL')}>All</button>
        {PROGRAM_TYPES.map(pt => (
          <button key={pt.value} className={`${styles.filterBtn} ${filter === pt.value ? styles.filterActive : ''}`} onClick={() => setFilter(pt.value)}>
            {pt.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>No programs available right now.</div>
      ) : (
        <div className={styles.programGrid}>
          {filtered.map(p => (
            <div className={styles.programCard} key={p.id}>
              <div className={styles.programType}>{PROGRAM_TYPES.find(t => t.value === p.programType)?.label || p.programType}</div>
              <div className={styles.programTitle}>{p.title}</div>
              {p.topic && <div className={styles.programTopic}>Topic: {p.topic}</div>}
              <div className={styles.programMeta}>
                {p.startDate && <span>📅 {new Date(p.startDate).toLocaleDateString()}</span>}
                {p.location && <span>📍 {p.location}</span>}
                {p.maxParticipants && <span>👥 {p.currentParticipants}/{p.maxParticipants}</span>}
              </div>
              <div className={styles.programHost}>Hosted by {p.hostType}</div>
              {p.certificateProvided && <span className={styles.certBadge}>🎓 Certificate</span>}
              <button
                className={`${styles.registerBtn} ${registeredIds.has(p.id) ? styles.registeredBtn : ''}`}
                onClick={() => !registeredIds.has(p.id) && handleRegister(p.id)}
                disabled={registeredIds.has(p.id) || (p.maxParticipants != null && p.currentParticipants >= p.maxParticipants)}
              >
                {registeredIds.has(p.id) ? '✓ Registered' : 'Register'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
