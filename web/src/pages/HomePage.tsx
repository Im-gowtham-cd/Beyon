import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';

export function HomePage() {
  return (
    <div className={styles.homePage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className="section-label">Centre of Excellence · AI Skill Development</span>
          <h1>Learn, Practice, Prove &amp; Get Hired</h1>
          <p>Beyon is an AI-powered skill development, assessment and recruitment platform connecting students, companies, and educational institutions through intelligent career matching.</p>
          <div className={styles.heroActions}>
            <Link to="/register" className="btn-primary">
              <i className="bx bx-rocket" /> Get Started
            </Link>
            <Link to="/login" className="btn-secondary">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>Platform Features</h2>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <i className="bx bx-chip" />
            <h3>AI-Powered Learning</h3>
            <p>Personalized skill development with intelligent recommendations and adaptive learning paths.</p>
          </div>
          <div className={styles.featureCard}>
            <i className="bx bx-brain" />
            <h3>Skill Assessment</h3>
            <p>Proctored assessments with real-time monitoring and detailed performance analytics.</p>
          </div>
          <div className={styles.featureCard}>
            <i className="bx bx-group" />
            <h3>Career Matching</h3>
            <p>Intelligent candidate discovery connecting talent with opportunities based on verified skills.</p>
          </div>
          <div className={styles.featureCard}>
            <i className="bx bx-trophy" />
            <h3>Gamification</h3>
            <p>Earn coins, XP and badges through practice, challenges and achievement milestones.</p>
          </div>
          <div className={styles.featureCard}>
            <i className="bx bx-certificate" />
            <h3>Certification</h3>
            <p>Industry-verified certificates with QR codes and public credential verification.</p>
          </div>
          <div className={styles.featureCard}>
            <i className="bx bx-buildings" />
            <h3>Institution Portal</h3>
            <p>Track student readiness, placement analytics and industry collaboration metrics.</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>97+</span>
          <span className={styles.statLabel}>Skills</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>551+</span>
          <span className={styles.statLabel}>API Endpoints</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>88+</span>
          <span className={styles.statLabel}>Pages</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>220</span>
          <span className={styles.statLabel}>Phases</span>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <h2>Ready to Start Your Journey?</h2>
        <p>Join Beyon today and unlock your career potential with AI-powered skill development and industry connections.</p>
        <Link to="/register" className="btn-primary">
          <i className="bx bx-rocket" /> Create Account
        </Link>
      </section>
    </div>
  );
}
