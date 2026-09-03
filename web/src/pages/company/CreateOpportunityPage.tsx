import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  List,
  AlertCircle,
  Send,
  Check,
  Building2,
  CheckSquare,
  Square,
} from 'lucide-react';
import styles from '../../practice/pages/CreateQuestionPage.module.css';

interface ActiveInstitution {
  id: string;
  name: string;
  code?: string;
  city?: string;
  state?: string;
  grade?: string;
}

export function CreateOpportunityPage() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeInstitutions, setActiveInstitutions] = useState<ActiveInstitution[]>([]);
  const [selectedInstIds, setSelectedInstIds] = useState<string[]>([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    opportunityType: 'CAMPUS_DRIVE',
    location: '',
    remote: false,
    minCgpa: 7.5,
    eligibleDepartments: 'Computer Science, Information Technology, AI & Data Science, Electronics',
    eligibleGraduationYears: '2026, 2027',
    requiredSkills: '',
    preferredSkills: '',
    minBeyonCoins: 0,
    status: 'PUBLISHED',
  });

  useEffect(() => {
    async function loadActiveInstitutions() {
      setLoadingInstitutions(true);
      try {
        const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
        const res = await fetch('/api/v1/opportunities/active-institutions', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.data)) {
            setActiveInstitutions(data.data);
            // Default select all active institutions
            setSelectedInstIds(data.data.map((i: ActiveInstitution) => i.id));
          }
        }
      } catch {
        /* fallback */
      } finally {
        setLoadingInstitutions(false);
      }
    }
    loadActiveInstitutions();
  }, []);

  const toggleInstitution = (id: string) => {
    setSelectedInstIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAllInstitutions = () => {
    if (selectedInstIds.length === activeInstitutions.length) {
      setSelectedInstIds([]);
    } else {
      setSelectedInstIds(activeInstitutions.map((i) => i.id));
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Job / Placement drive title is required.');
      return;
    }

    if (form.opportunityType === 'CAMPUS_DRIVE' && activeInstitutions.length > 0 && selectedInstIds.length === 0) {
      setError('Please select at least one verified partner institution for this campus drive.');
      return;
    }

    const selectedNames = activeInstitutions
      .filter((i) => selectedInstIds.includes(i.id))
      .map((i) => i.name)
      .join(', ');

    const payload = {
      ...form,
      targetInstitutionIds: form.opportunityType === 'CAMPUS_DRIVE' ? selectedInstIds.join(',') : '',
      targetInstitutionNames: form.opportunityType === 'CAMPUS_DRIVE' ? selectedNames : '',
    };

    setSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const res = await fetch('/api/v1/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to create opportunity. Please check backend connection.');
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error publishing placement drive.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>
            <Check size={28} />
          </div>
          <h2 className={styles.successTitle}>Placement Drive Published Successfully</h2>
          <p className={styles.successDesc}>
            Your opportunity is now live and visible to 100+ verified candidates across partner institutions.
          </p>
          <div className={styles.successActions}>
            <button
              className={styles.btnPrimary}
              onClick={() => {
                setSuccess(false);
                setForm({
                  title: '',
                  description: '',
                  opportunityType: 'CAMPUS_DRIVE',
                  location: 'Chennai / Bangalore',
                  remote: false,
                  minCgpa: 8.0,
                  eligibleDepartments: 'CSE, IT, ECE, AI & DS',
                  eligibleGraduationYears: '2026, 2027',
                  requiredSkills: '',
                  preferredSkills: '',
                  minBeyonCoins: 100,
                  status: 'PUBLISHED',
                });
              }}
            >
              <Plus size={15} />
              <span>Post Another Drive</span>
            </button>
            <Link to="/company/opportunities" className={styles.btnSecondary}>
              <List size={15} />
              <span>View All Postings</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <Link to="/company/opportunities" className={styles.backLink}>
            <ArrowLeft size={15} />
            <span>Back to Drives</span>
          </Link>
          <h1 className={styles.pageTitle}>Post New Campus Placement Drive / Job</h1>
          <p className={styles.pageSubtitle}>
            Configure eligibility criteria, minimum academic CGPA, and required competency matrix for candidates
          </p>
        </div>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.formLayout}>
        {/* Core Opportunity Details */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>1. Role &amp; Drive Overview</h3>
          <p className={styles.cardSubtitle}>Specify the job role, posting type, and work arrangement</p>

          <div className={styles.formGrid}>
            <div className={styles.fieldGroup} style={{ gridColumn: '1 / -1' }}>
              <label className={styles.label}>Drive / Role Title *</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. 2026 Batch Campus Recruitment Drive - Software Engineer"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Opportunity Type</label>
              <select
                className={styles.select}
                value={form.opportunityType}
                onChange={(e) => setForm({ ...form, opportunityType: e.target.value })}
              >
                <option value="CAMPUS_DRIVE">Campus Placement Drive</option>
                <option value="FULL_TIME">Full-Time Career Opportunity</option>
                <option value="INTERNSHIP">Industrial Internship</option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Location / Work Base</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. Chennai, Bangalore, Hyderabad"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>

            <div className={styles.fieldGroup} style={{ gridColumn: '1 / -1' }}>
              <label className={styles.label}>Role Description &amp; Scope</label>
              <textarea
                className={styles.textarea}
                placeholder="Describe key responsibilities, technical stack, interview process, and compensation structure..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Campus Drive: Target Verified Partner Institutions */}
        {form.opportunityType === 'CAMPUS_DRIVE' && (
          <div className={styles.card} style={{ borderLeft: '4px solid #1c2d81' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div>
                <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={18} style={{ color: '#1c2d81' }} />
                  <span>Target Verified Partner Institutions *</span>
                </h3>
                <p className={styles.cardSubtitle}>
                  Select verified partner universities and colleges where this campus recruitment drive will be published
                </p>
              </div>
              {activeInstitutions.length > 0 && (
                <button
                  type="button"
                  onClick={toggleAllInstitutions}
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#1c2d81',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    padding: '4px 10px',
                    cursor: 'pointer',
                  }}
                >
                  {selectedInstIds.length === activeInstitutions.length ? 'Deselect All' : 'Select All Active'}
                </button>
              )}
            </div>

            {loadingInstitutions ? (
              <div style={{ padding: '16px', color: '#64748b', fontSize: '0.84rem' }}>
                Loading verified institutions...
              </div>
            ) : activeInstitutions.length === 0 ? (
              <div
                style={{
                  padding: '16px 20px',
                  background: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  color: '#64748b',
                  fontSize: '0.84rem',
                }}
              >
                No verified partner institutions available yet. Campus placement drives can only be targeted to institutions verified and approved by the Super Admin.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px', marginTop: '12px' }}>
                {activeInstitutions.map((inst) => {
                  const isChecked = selectedInstIds.includes(inst.id);
                  return (
                    <div
                      key={inst.id}
                      onClick={() => toggleInstitution(inst.id)}
                      style={{
                        padding: '10px 14px',
                        background: isChecked ? '#f0f4ff' : '#ffffff',
                        border: isChecked ? '1px solid #1c2d81' : '1px solid #e2e8f0',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ color: isChecked ? '#1c2d81' : '#94a3b8', display: 'flex', alignItems: 'center' }}>
                        {isChecked ? <CheckSquare size={18} /> : <Square size={18} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.86rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {inst.name}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                          {inst.city ? `${inst.city}, ${inst.state || ''}` : 'Verified Partner'}
                          {inst.grade ? ` · NAAC ${inst.grade}` : ''}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Candidate Eligibility Criteria */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>2. Academic &amp; Batch Eligibility</h3>
          <p className={styles.cardSubtitle}>Automate candidate filtering by setting academic cutoffs</p>

          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Minimum CGPA Cutoff</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                className={styles.input}
                value={form.minCgpa}
                onChange={(e) => setForm({ ...form, minCgpa: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Beyon Coins Application Cost</label>
              <input
                type="number"
                min="0"
                className={styles.input}
                value={form.minBeyonCoins}
                onChange={(e) => setForm({ ...form, minBeyonCoins: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Eligible Graduation Batches</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. 2026, 2027"
                value={form.eligibleGraduationYears}
                onChange={(e) => setForm({ ...form, eligibleGraduationYears: e.target.value })}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Eligible Departments</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. CSE, IT, ECE, AI & DS"
                value={form.eligibleDepartments}
                onChange={(e) => setForm({ ...form, eligibleDepartments: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Skill Matrix */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>3. Required Technical Skills</h3>
          <p className={styles.cardSubtitle}>Specify skills verified against platform benchmark assessments</p>

          <div className={styles.formGrid}>
            <div className={styles.fieldGroup} style={{ gridColumn: '1 / -1' }}>
              <label className={styles.label}>Required Core Skills (comma separated)</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. Java, Spring Boot, MySQL, Data Structures"
                value={form.requiredSkills}
                onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })}
              />
            </div>

            <div className={styles.fieldGroup} style={{ gridColumn: '1 / -1' }}>
              <label className={styles.label}>Preferred Nice-to-Have Skills (comma separated)</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. AWS, Docker, Kubernetes, GraphQL"
                value={form.preferredSkills}
                onChange={(e) => setForm({ ...form, preferredSkills: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className={styles.formFooter}>
          <button type="submit" className={styles.btnPrimary} disabled={submitting}>
            <Send size={15} />
            <span>{submitting ? 'Publishing Drive...' : 'Publish Campus Drive'}</span>
          </button>
          <Link to="/company/opportunities" className={styles.btnSecondary}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
