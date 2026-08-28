import { useState, useEffect } from 'react';
import { api } from '../../services/api/client';
import styles from './Collaboration.module.css';

interface MentorProfile {
  id: string;
  companyName: string;
  jobTitle: string;
  experienceYears: number;
  bio: string;
  expertiseSkills: string;
  availability: string;
  rating: number;
  totalSessions: number;
}

interface MentorshipRequest {
  id: string;
  mentor: MentorProfile;
  student: { id: string };
  message: string;
  status: string;
  requestedAt: string;
}

export function MentorshipPage() {
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [myRequests, setMyRequests] = useState<MentorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'mentors' | 'my-requests'>('mentors');

  useEffect(() => {
    async function load() {
      try {
        const [m, r] = await Promise.all([
          api.get<MentorProfile[]>('/mentorship/mentors'),
          api.get<MentorshipRequest[]>('/mentorship/my-requests'),
        ]);
        setMentors(m);
        setMyRequests(r);
      } catch { /* */ }
      setLoading(false);
    }
    load();
  }, []);

  async function handleRequest(mentorUserId: string) {
    try {
      await api.post('/mentorship/request/' + mentorUserId, { message: 'I would like to be mentored.' });
      const r = await api.get<MentorshipRequest[]>('/mentorship/my-requests');
      setMyRequests(r);
    } catch { /* */ }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          {[1, 2, 3].map(i => <div key={i} className={styles.skeleton} style={{ height: 100 }} />)}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Mentorship</h1>
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'mentors' ? styles.tabActive : ''}`} onClick={() => setTab('mentors')}>Find Mentors</button>
        <button className={`${styles.tab} ${tab === 'my-requests' ? styles.tabActive : ''}`} onClick={() => setTab('my-requests')}>My Requests ({myRequests.length})</button>
      </div>

      {tab === 'mentors' && (
        mentors.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><i className="bx bx-user-voice" style={{ fontSize: '2.5rem', color: '#1c2d81' }} /></div>
            <h3 className={styles.emptyTitle}>No mentors available</h3>
            <p className={styles.emptyText}>Mentors will appear here once they join the platform.</p>
          </div>
        ) : (
          <div className={styles.cardList}>
            {mentors.map(m => (
              <div key={m.id} className={styles.postCard}>
                <div className={styles.postHeader}>
                  <div>
                    <h3 className={styles.postTitle}>{m.jobTitle || 'Mentor'}</h3>
                    <span className={styles.postMeta}>{m.companyName} · {m.experienceYears}y exp</span>
                  </div>
                  <button className={styles.followBtn} onClick={() => handleRequest(m.id)}>Request</button>
                </div>
                {m.bio && <p className={styles.postContent}>{m.bio}</p>}
                <div className={styles.postMeta}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><i className="bx bx-star" style={{ color: '#f59e0b' }} /> {m.rating}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><i className="bx bx-book-open" /> {m.totalSessions} sessions</span>
                  <span>{m.availability}</span>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'my-requests' && (
        myRequests.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><i className="bx bx-envelope" style={{ fontSize: '2.5rem', color: '#94a3b8' }} /></div>
            <h3 className={styles.emptyTitle}>No mentorship requests</h3>
            <p className={styles.emptyText}>Find a mentor and send a request to get started.</p>
          </div>
        ) : (
          <div className={styles.cardList}>
            {myRequests.map(r => (
              <div key={r.id} className={styles.postCard}>
                <div className={styles.postHeader}>
                  <h3 className={styles.postTitle}>{r.mentor?.jobTitle || 'Mentor'}</h3>
                  <span className={styles.tagBadge}>{r.status}</span>
                </div>
                <span className={styles.postMeta}>Requested: {new Date(r.requestedAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
