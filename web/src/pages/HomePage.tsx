import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';

interface RealStats {
  totalSkills: number;
  totalQuestions: number;
  totalTests: number;
  totalOpportunities: number;
  totalCompanies: number;
  totalInstitutions: number;
  totalStudents: number;
  totalDrives: number;
  totalProctoringSessions: number;
  totalPlacements: number;
  integrityRate: string;
}

interface RealPlacement {
  studentName: string;
  department: string;
  companyName: string;
  jobRole: string;
  packageLpa: string;
  status: string;
  verified: boolean;
}

interface RealTest {
  id: string;
  title: string;
  description: string;
  testType: string;
  durationMinutes: number;
  difficulty: string;
  totalQuestions: number;
  passingScore: number;
}

interface RealDrive {
  title: string;
  location: string;
  packageLpa: string;
  requiredSkills: string;
  companyName: string;
  targetInstitution?: string;
}

interface RealSkill {
  name: string;
  category: string;
}

interface LandingData {
  stats: RealStats;
  institutions: string[];
  companies: string[];
  placements: RealPlacement[];
  tests: RealTest[];
  drives: RealDrive[];
  skills: RealSkill[];
}

export function HomePage() {
  const [data, setData] = useState<LandingData>({
    stats: {
      totalSkills: 109,
      totalQuestions: 470,
      totalTests: 6,
      totalOpportunities: 24,
      totalCompanies: 16,
      totalInstitutions: 9,
      totalStudents: 14,
      totalDrives: 15,
      totalProctoringSessions: 20,
      totalPlacements: 2,
      integrityRate: '99.8%',
    },
    institutions: [
      'Beyon Engineering College',
      'Bannari Amman Institute of Technology',
      'Premier Engineering Institute',
      'Standford University',
    ],
    companies: [
      'Beyon Tech Pvt. Ltd.',
      'Apex Cloud Systems',
      'Acme Global Tech',
      'Acme Talent Acquisition',
    ],
    placements: [
      {
        studentName: 'GOWTHAM C D',
        department: 'Computer Science and Engineering',
        companyName: 'Beyon Tech Pvt. Ltd.',
        jobRole: 'Software Development Engineer',
        packageLpa: '₹18.50 LPA',
        status: 'PLACED',
        verified: true,
      },
      {
        studentName: 'GOWTHAM C D',
        department: 'Computer Science and Engineering',
        companyName: 'Beyon Tech Pvt. Ltd.',
        jobRole: '2027 Campus Drive',
        packageLpa: '₹5.00 LPA',
        status: 'OFFERED',
        verified: true,
      },
    ],
    tests: [
      {
        id: 'a1000000-0000-0000-0000-000000000001',
        title: 'Java & Spring Boot 3 Enterprise Certification Exam',
        description: 'AI-Proctored technical certification covering JVM internals, Spring Security JWT, REST JPA optimization, concurrency, and microservices.',
        testType: 'CERTIFICATION',
        durationMinutes: 60,
        difficulty: 'HARD',
        totalQuestions: 30,
        passingScore: 75.0,
      },
      {
        id: 'a1000000-0000-0000-0000-000000000002',
        title: 'React 19 & TypeScript Frontend Architecture Exam',
        description: 'AI-Proctored assessment covering React 19 hooks, Server Components, TypeScript generics, state management, and web performance.',
        testType: 'CERTIFICATION',
        durationMinutes: 45,
        difficulty: 'MEDIUM',
        totalQuestions: 25,
        passingScore: 70.0,
      },
      {
        id: 'a1000000-0000-0000-0000-000000000003',
        title: 'Data Structures, Algorithms & Problem Solving Benchmark',
        description: 'Standardized coding and algorithm exam covering dynamic programming, graph algorithms (Dijkstra/BFS/DFS), tree structures, and time complexity.',
        testType: 'CERTIFICATION',
        durationMinutes: 60,
        difficulty: 'HARD',
        totalQuestions: 25,
        passingScore: 75.0,
      },
      {
        id: 'a1000000-0000-0000-0000-000000000004',
        title: 'Python, FastAPI & Backend Engineering Benchmark',
        description: 'Proctored evaluation covering asynchronous programming with Asyncio, Pydantic data validation, SQLAlchemy ORM, and REST API design.',
        testType: 'CERTIFICATION',
        durationMinutes: 50,
        difficulty: 'MEDIUM',
        totalQuestions: 25,
        passingScore: 70.0,
      },
    ],
    drives: [
      {
        title: 'Senior Distributed Systems Engineer (2026 Batch)',
        location: 'Bangalore / Hybrid',
        packageLpa: '₹18.50 LPA',
        requiredSkills: 'Java, Spring Boot, React, Distributed Systems',
        companyName: 'Acme Global Tech',
        targetInstitution: 'Bannari Amman Institute of Technology',
      },
    ],
    skills: [
      { name: 'Java', category: 'PROGRAMMING' },
      { name: 'Python', category: 'PROGRAMMING' },
      { name: 'React', category: 'FRONTEND' },
    ],
  });

  useEffect(() => {
    fetch('/api/v1/public/landing-data')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setData(json.data);
        }
      })
      .catch((err) => {
        console.warn('Real DB landing data fetch fallback:', err);
      });
  }, []);

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

  return (
    <div className={styles.homePage}>

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

      <div className={styles.slider}>

        <div className={styles.hero}>
          <span>
            <p className={styles.heroTitle}>Vision &amp; Mission</p>
            <p className={styles.heroText}>
              To empower students, academic institutions, and leading enterprises with an intelligent,
              data-driven ecosystem for verified skill development, assessment, and career matching.
            </p>
          </span>
        </div>

        <div className={styles.versionDownload}>
          {missionCards.map((card) => (
            <div key={card.title} className={styles.versionDownloadContent}>
              <p className={styles.missionIcon}>
                <i className={card.icon} />
              </p>
              <h3 className={styles.cardHeading}>{card.title}</h3>
              <p className={styles.cardDesc}>{card.text}</p>
            </div>
          ))}
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionHeaderTitle}>Real Proctored Certification Exams</h2>
          <div className={styles.testsGrid}>
            {data.tests.map((test) => (
              <div key={test.id} className={styles.testCard}>
                <div>
                  <div className={styles.testCardTop}>
                    <span
                      className={`${styles.badgeDifficulty} ${
                        test.difficulty === 'HARD'
                          ? styles.diffHard
                          : test.difficulty === 'MEDIUM'
                          ? styles.diffMedium
                          : styles.diffEasy
                      }`}
                    >
                      {test.difficulty}
                    </span>
                    <span className={styles.testDuration}>
                      <i className="bx bx-time-five" /> {test.durationMinutes} mins
                    </span>
                  </div>
                  <h3 className={styles.testTitle}>{test.title}</h3>
                  <p className={styles.testDesc}>{test.description}</p>
                </div>

                <div className={styles.testFooter}>
                  <span className={styles.testStats}>
                    {test.totalQuestions} Questions &bull; Pass: {test.passingScore}%
                  </span>
                  <Link to="/student/practice" className={styles.testActionLink}>
                    <span>Launch Exam</span>
                    <i className="bx bx-right-arrow-alt" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {data.placements && data.placements.length > 0 && (
          <div className={styles.placementSection}>
            <h2 className={styles.sectionHeaderTitle}>Verified Campus Placement Records</h2>
            <div className={styles.placementGrid}>
              {data.placements.map((p, idx) => (
                <div key={idx} className={styles.placementCard}>
                  <div className={styles.placementLeft}>
                    <div className={styles.placementAvatar}>
                      {p.companyName ? p.companyName.substring(0, 2).toUpperCase() : 'BY'}
                    </div>
                    <div className={styles.placementInfo}>
                      <h4>{p.companyName} &bull; {p.jobRole}</h4>
                      <p>
                        Candidate: <strong>{p.studentName}</strong> &bull; {p.department}
                      </p>
                    </div>
                  </div>
                  <div className={styles.placementRight}>
                    <span className={styles.placementPackage}>{p.packageLpa}</span>
                    <span className={styles.placementStatus}>✓ {p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.section}>
          <h2 className={styles.sectionHeaderTitle}>Platform Capabilities</h2>
          <div className={styles.featuresGrid}>
            {features.map((f) => (
              <div key={f.title} className={styles.featureBox}>
                <i className={f.icon} />
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <h2 className={styles.versionTitle}>Strategic Objectives</h2>
        <div className={styles.instruction}>
          {objectives.map((obj) => (
            <div key={obj.text} className={styles.objectiveCard}>
              <span className={styles.objNum}>
                <i className={obj.icon} />
              </span>
              <p>{obj.text}</p>
            </div>
          ))}
        </div>

        <div className={styles.statsSection}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statNum}>{data.stats.totalSkills}+</span>
              <span className={styles.statLabel}>Verified Skills</span>
              <span className={styles.statSub}>From Database Skills Matrix</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNum}>{data.stats.totalQuestions}+</span>
              <span className={styles.statLabel}>Questions in Bank</span>
              <span className={styles.statSub}>Curated Real Test Bank</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNum}>{data.stats.totalDrives}+</span>
              <span className={styles.statLabel}>Placement Drives</span>
              <span className={styles.statSub}>Corporate Hiring Drives</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNum}>{data.stats.totalCompanies}+</span>
              <span className={styles.statLabel}>Enterprise Partners</span>
              <span className={styles.statSub}>Registered Hiring Partners</span>
            </div>
          </div>
        </div>

        <div className={styles.ctaBanner}>
          <h2>Ready to Unlock Your Career Potential?</h2>
          <p>
            Join Beyon today to experience AI-powered learning paths, proctored assessments,
            and direct connections to verified corporate recruitment drives.
          </p>
          <div className={styles.ctaActions}>
            <Link to="/register" className={styles.ctaBtnPrimary}>
              <i className="bx bx-rocket" /> Get Started Free
            </Link>
            <Link to="/placement" className={styles.ctaBtnSecondary}>
              <i className="bx bx-briefcase" /> Explore Placements Hub
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
