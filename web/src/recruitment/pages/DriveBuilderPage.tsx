import { useState, useEffect } from 'react';
import { api } from '../../services/api/client';
import styles from './Recruitment.module.css';

export function DriveBuilderPage() {
  const [drives, setDrives] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', jobRole: '', description: '', requiredSkills: '', preferredSkills: '',
    minCgpa: '', salaryRange: '', location: '', workMode: 'ONSITE',
    applicationDeadline: '', coinCost: 100, targetingMode: 'PUBLIC',
    eligibleDepartments: '', eligibleGraduationYears: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/drives/my').then((r: any) => setDrives(Array.isArray(r) ? r : [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const createDrive = async () => {
    const payload: any = { ...form, minCgpa: form.minCgpa ? parseFloat(form.minCgpa) : null };
    await api.post('/drives', payload);
    setShowForm(false);
    setForm({ title: '', jobRole: '', description: '', requiredSkills: '', preferredSkills: '', minCgpa: '', salaryRange: '', location: '', workMode: 'ONSITE', applicationDeadline: '', coinCost: 100, targetingMode: 'PUBLIC', eligibleDepartments: '', eligibleGraduationYears: '' });
    const r: any = await api.get('/drives/my');
    setDrives(Array.isArray(r) ? r : []);
  };

  const publishDrive = async (driveId: string) => {
    await api.post(`/drives/${driveId}/publish`);
    const r: any = await api.get('/drives/my');
    setDrives(Array.isArray(r) ? r : []);
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'ACTIVE': return '#16a34a';
      case 'DRAFT': return '#6b7280';
      case 'PUBLISHED': return '#2563eb';
      case 'CLOSED': return '#dc2626';
      default: return '#6b7280';
    }
  };

  if (loading) return <div className={styles.container}><div className={styles.empty}>Loading drives...</div></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Recruitment Drives</h1>
          <p className={styles.subtitle}>Create and manage your company's recruitment drives</p>
        </div>
        <button className={styles.btnPrimary} onClick={() => setShowForm(true)}>+ New Drive</button>
      </div>

      {showForm && (
        <div className={styles.modal}>
          <h3 className={styles.modalTitle}>Create Recruitment Drive</h3>
          <div className={styles.formGroup}>
            <label className={styles.label}>Title *</label>
            <input className={styles.input} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g., Software Engineer Campus Drive 2026" />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Job Role *</label>
              <input className={styles.input} value={form.jobRole} onChange={e => setForm({ ...form, jobRole: e.target.value })} placeholder="e.g., Backend Developer" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Location</label>
              <input className={styles.input} value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g., Bangalore" />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Description</label>
            <textarea className={styles.textarea} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Required Skills (comma-separated)</label>
              <input className={styles.input} value={form.requiredSkills} onChange={e => setForm({ ...form, requiredSkills: e.target.value })} placeholder="Java, SQL, Spring Boot" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Salary Range</label>
              <input className={styles.input} value={form.salaryRange} onChange={e => setForm({ ...form, salaryRange: e.target.value })} placeholder="e.g., 6-10 LPA" />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Min CGPA</label>
              <input className={styles.input} type="number" step="0.1" value={form.minCgpa} onChange={e => setForm({ ...form, minCgpa: e.target.value })} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Beyon Coin Cost</label>
              <input className={styles.input} type="number" value={form.coinCost} onChange={e => setForm({ ...form, coinCost: parseInt(e.target.value) || 100 })} />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Targeting</label>
              <select className={styles.input} value={form.targetingMode} onChange={e => setForm({ ...form, targetingMode: e.target.value })}>
                <option value="PUBLIC">Public (All Students)</option>
                <option value="INSTITUTION">Institution Targeted</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Work Mode</label>
              <select className={styles.input} value={form.workMode} onChange={e => setForm({ ...form, workMode: e.target.value })}>
                <option value="ONSITE">On-site</option>
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>
          </div>
          <div className={styles.formActions}>
            <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
            <button className={styles.btnPrimary} onClick={createDrive}>Create Drive</button>
          </div>
        </div>
      )}

      {drives.length === 0 ? (
        <div className={styles.empty}>
          <p>No recruitment drives yet. Create your first drive to start hiring!</p>
        </div>
      ) : (
        <div className={styles.driveList}>
          {drives.map(d => (
            <div className={styles.driveCard} key={d.id}>
              <div className={styles.driveHeader}>
                <div>
                  <div className={styles.driveTitle}>{d.title}</div>
                  <div className={styles.driveRole}>{d.jobRole}</div>
                </div>
                <span className={styles.statusBadge} style={{ background: statusColor(d.status) }}>{d.status}</span>
              </div>
              <div className={styles.driveMeta}>
                {d.location && <span>📍 {d.location}</span>}
                {d.salaryRange && <span>💰 {d.salaryRange}</span>}
                <span>🪙 {d.coinCost} coins</span>
                <span>🎯 {d.targetingMode}</span>
              </div>
              {d.requiredSkills && <div className={styles.driveSkills}>{d.requiredSkills}</div>}
              <div className={styles.driveActions}>
                {d.status === 'DRAFT' && (
                  <button className={styles.btnPrimary} onClick={() => publishDrive(d.id)}>Publish</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
