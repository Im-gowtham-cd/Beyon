import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../practice/pages/CreateQuestionPage.module.css';

export function CreateOpportunityPage() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    opportunityType: 'CAMPUS_DRIVE',
    location: 'Chennai / Bangalore',
    remote: false,
    minCgpa: 8.0,
    eligibleDepartments: 'CSE, IT, ECE, AI & DS',
    eligibleGraduationYears: '2026, 2027',
    requiredSkills: 'Java, Spring Boot, SQL, REST APIs',
    preferredSkills: 'Docker, AWS, Microservices',
    minBeyonCoins: 100,
    status: 'PUBLISHED',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Job / Placement drive title is required.');
      return;
    }

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
        body: JSON.stringify(form),
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
            <i className="bx bx-check" />
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
              <i className="bx bx-plus" /> Post Another Drive
            </button>
            <Link to="/company/opportunities" className={styles.btnSecondary}>
              <i className="bx bx-list-ul" /> View All Postings
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
            <i className="bx bx-arrow-back" /> Back to Drives
          </Link>
          <h1 className={styles.pageTitle}>Post New Campus Placement Drive / Job</h1>
          <p className={styles.pageSubtitle}>
            Configure eligibility criteria, minimum academic CGPA, and required competency matrix for candidates
          </p>
        </div>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <i className="bx bx-error-circle" />
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
            <i className="bx bx-paper-plane" />
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
