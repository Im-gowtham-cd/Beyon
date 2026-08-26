import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';

export function HomePage() {
  const missionCards = [
    {
      icon: 'bx bx-chip',
      title: 'AI-Powered Learning',
      text: 'Adaptive skill pathways tailored dynamically to each candidate using intelligent diagnostics.',
    },
    {
      icon: 'bx bx-brain',
      title: 'Proctored Assessment',
      text: 'Standardized and proctored coding and cognitive assessments with instant analytics.',
    },
    {
      icon: 'bx bx-group',
      title: 'Talent Discovery',
      text: 'Direct recruiter-to-candidate pipeline based on proven, verifiable competency proofs.',
    },
    {
      icon: 'bx bx-trophy',
      title: 'Gamified Practice',
      text: 'Daily challenges, XP milestones, badges, and competitive global leaderboards.',
    },
    {
      icon: 'bx bx-buildings',
      title: 'Institutional Insights',
      text: 'Comprehensive placement analytics, curriculum alignment, and cohort tracking.',
    },
  ];

  const features = [
    {
      icon: 'bx bx-bot',
      title: 'Adaptive AI Engine',
      desc: 'Real-time personalized difficulty adjustment and contextual learning hints.',
    },
    {
      icon: 'bx bx-shield-quarter',
      title: 'Secure Assessment',
      desc: 'Lockdown proctoring, multi-sensor integrity verification and cheat detection.',
    },
    {
      icon: 'bx bx-network-chart',
      title: 'Skill Graph & Roadmap',
      desc: 'Multi-tiered skill taxonomy mapping competencies to industrial job roles.',
    },
    {
      icon: 'bx bx-badge-check',
      title: 'Verified Credentials',
      desc: 'Cryptographically verifiable certificates with public verification portals.',
    },
    {
      icon: 'bx bx-line-chart',
      title: 'Recruitment Analytics',
      desc: 'Automated candidate filtering, drive management, and placement pipeline tracking.',
    },
    {
      icon: 'bx bx-conversation',
      title: 'Collaboration Hub',
      desc: 'Interactive discussions, peer code reviews, and mentorship opportunities.',
    },
  ];

  const objectives = [
    {
      icon: 'bx bx-chip',
      text: 'Establish an AI-driven skill acceleration ecosystem bridging academia and global tech industry requirements.',
    },
    {
      icon: 'bx bx-group',
      text: 'Empower students through automated skill diagnostics, structured mentorship, and daily hands-on practice.',
    },
    {
      icon: 'bx bx-search-alt-2',
      text: 'Facilitate transparent, merit-based candidate discovery for enterprise recruitment with zero friction.',
    },
    {
      icon: 'bx bx-bulb',
      text: 'Reward continuous learning and problem-solving through XP leaderboards, badges, and skill mastery milestones.',
    },
    {
      icon: 'bx bx-buildings',
      text: 'Provide educational institutions with deep visibility into student readiness and placement metrics.',
    },
    {
      icon: 'bx bx-globe',
      text: 'Deliver scalable, verifiable credentials ensuring industry credibility and sustainable career growth.',
    },
  ];

  const stats = [
    { number: '97+', label: 'Skills' },
    { number: '551+', label: 'API Endpoints' },
    { number: '88+', label: 'Platform Pages' },
    { number: '220', label: 'Architecture Phases' },
  ];

  return (
    <div className={styles.homePage}>
      {/* Foam Board Banner */}
      <div className={styles.foamBoard}>
        <span />
        <span />
        <span />
        <span />
        <span />
        <div className={styles.foamBrand}>
          <span className={styles.brandMarkLarge} />
          <h1 className={styles.foamTitle}>BEYON</h1>
        </div>
        <ul>
          <li>Platform for</li>
          <li>High-Impact Learning</li>
          <li>&amp;</li>
          <li>Intelligent Recruitment</li>
          <li>For</li>
          <li>Next-Generation Engineers</li>
          <li>( Beyon AI · CoE )</li>
        </ul>
      </div>

      {/* Slider Content */}
      <div className={styles.slider}>
        {/* Vision */}
        <div className={styles.hero}>
          <span>
            <p className={styles.heroTitle}>Vision &amp; Mission</p>
            <p className={styles.heroText}>
              To empower students, academic institutions, and leading enterprises with an intelligent,
              data-driven ecosystem for verified skill development, assessment, and career matching.
            </p>
          </span>
        </div>

        {/* Mission Cards */}
        <div className={styles.versionDownload}>
          {missionCards.map(card => (
            <div key={card.title} className={styles.versionDownloadContent}>
              <p className={styles.missionIcon}>
                <i className={card.icon} />
              </p>
              <h3 className={styles.cardHeading}>{card.title}</h3>
              <p className={styles.cardDesc}>{card.text}</p>
            </div>
          ))}
        </div>

        {/* Platform Features Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionHeaderTitle}>Platform Capabilities</h2>
          <div className={styles.featuresGrid}>
            {features.map(f => (
              <div key={f.title} className={styles.featureBox}>
                <i className={f.icon} />
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Objectives */}
        <h2 className={styles.versionTitle}>Strategic Objectives</h2>
        <div className={styles.instruction}>
          {objectives.map(obj => (
            <div key={obj.text} className={styles.objectiveCard}>
              <span className={styles.objNum}>
                <i className={obj.icon} />
              </span>
              <p>{obj.text}</p>
            </div>
          ))}
        </div>

        {/* Stats Grid */}
        <div className={styles.statsSection}>
          <div className={styles.statsGrid}>
            {stats.map(s => (
              <div key={s.label} className={styles.statCard}>
                <span className={styles.statNum}>{s.number}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className={styles.ctaBanner}>
          <h2>Ready to Unlock Your Career Potential?</h2>
          <p>
            Join Beyon today to experience AI-powered learning paths, proctored assessments,
            and direct connections to top hiring partners.
          </p>
          <div className={styles.ctaActions}>
            <Link to="/register" className="btn-primary">
              <i className="bx bx-rocket" /> Get Started Free
            </Link>
            <Link to="/student/skills" className="btn-secondary">
              <i className="bx bx-compass" /> Explore Skills
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
