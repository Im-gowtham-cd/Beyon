import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Timer,
  Clock,
  CheckCircle2,
  Users,
  Flame,
  Layers,
  Play,
  FileCode,
  ShieldCheck,
  TrendingUp,
  X,
  Send,
  BarChart3,
  Calendar,
} from 'lucide-react';
import styles from './WeeklyTestPage.module.css';

interface MockContest {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  status: 'LIVE' | 'UPCOMING' | 'ARCHIVED';
  startTime: string;
  durationMinutes: number;
  totalProblems: number;
  participantsCount: number;
  coinPool: number;
  xpReward: number;
  difficulty: 'MEDIUM' | 'HARD' | 'EXPERT';
  sponsor: string;
  problems: {
    id: string;
    title: string;
    difficulty: string;
    points: number;
    description: string;
    sampleInput: string;
    sampleOutput: string;
  }[];
}

const SAMPLE_CONTESTS: MockContest[] = [
  {
    id: 'contest-w48',
    title: 'Beyon Weekly Contest 48',
    subtitle: 'National Algorithm Marathon & Core Engineering Sprint',
    category: 'Algorithms & Data Structures',
    status: 'LIVE',
    startTime: 'Live Now (Ends in 2h 45m)',
    durationMinutes: 90,
    totalProblems: 4,
    participantsCount: 3840,
    coinPool: 25000,
    xpReward: 1200,
    difficulty: 'HARD',
    sponsor: 'Zoho Corporation & Juspay',
    problems: [
      {
        id: 'p1',
        title: 'Problem A: Minimum Cost to Connect Microservice Cluster',
        difficulty: 'Medium',
        points: 200,
        description: 'You are given an integer n representing nodes in a distributed cloud cluster and an array edges where edges[i] = [u, v, cost]. Determine the minimum cost to make all microservices reachable using Kruskal\'s or Prim\'s algorithm.',
        sampleInput: 'n = 4, edges = [[0,1,1],[1,2,2],[2,3,3],[0,3,4]]',
        sampleOutput: '6',
      },
      {
        id: 'p2',
        title: 'Problem B: Rate Limiter Token Bucket Stream',
        difficulty: 'Medium',
        points: 300,
        description: 'Implement a token bucket rate limiter class with refill rate R tokens/sec and capacity C. Given a stream of timestamps, return whether each request should be processed or 429 rejected.',
        sampleInput: 'Capacity: 10, Rate: 2/s, Requests at t = [1, 2, 2, 2, 5]',
        sampleOutput: '[true, true, true, true, true]',
      },
      {
        id: 'p3',
        title: 'Problem C: Distributed Transaction 2PC Consensus Log',
        difficulty: 'Hard',
        points: 400,
        description: 'Given transaction dependency DAG across partition shards, calculate the maximum throughput commit sequence without deadlock cycles.',
        sampleInput: 'Shards: 3, Tx: [[A, B], [B, C], [C, A]]',
        sampleOutput: 'Deadlock Detected: Cycle [A->B->C->A]',
      },
      {
        id: 'p4',
        title: 'Problem D: Optimal Subarray XOR with Range Updates',
        difficulty: 'Hard',
        points: 500,
        description: 'Perform range bitwise XOR modifications on a segment tree in O(log N) time per query.',
        sampleInput: 'N = 100000, Q = 50000 queries',
        sampleOutput: 'Checksum: 4928174',
      },
    ],
  },
  {
    id: 'contest-bw24',
    title: 'Bi-Weekly System Design & Backend Arena 24',
    subtitle: 'High-Throughput Caching & Fault-Tolerant Microservices',
    category: 'System Design & Cloud',
    status: 'UPCOMING',
    startTime: 'Sunday, 8:00 PM IST',
    durationMinutes: 120,
    totalProblems: 2,
    participantsCount: 2190,
    coinPool: 15000,
    xpReward: 800,
    difficulty: 'HARD',
    sponsor: 'Presidio Cloud Solutions',
    problems: [],
  },
  {
    id: 'contest-ai19',
    title: 'Applied AI & Vector Embeddings Hack Sprint',
    subtitle: 'RAG Retrieval Optimization & Cosine Similarity Pipelines',
    category: 'Applied AI / ML',
    status: 'UPCOMING',
    startTime: 'Next Saturday, 6:00 PM IST',
    durationMinutes: 90,
    totalProblems: 3,
    participantsCount: 1640,
    coinPool: 20000,
    xpReward: 1000,
    difficulty: 'MEDIUM',
    sponsor: 'Beyon Intelligence Labs',
    problems: [],
  },
  {
    id: 'contest-w47',
    title: 'Beyon Weekly Contest 47 (Archived)',
    subtitle: 'Graph Algorithms, Dynamic Programming & SDE Interview Set',
    category: 'Algorithms',
    status: 'ARCHIVED',
    startTime: 'Completed 14 Sept 2026',
    durationMinutes: 90,
    totalProblems: 4,
    participantsCount: 4120,
    coinPool: 25000,
    xpReward: 1200,
    difficulty: 'HARD',
    sponsor: 'Soliton Technologies',
    problems: [],
  },
];

const NATIONAL_LEADERBOARD = [
  { rank: 1, name: 'Arjun Venkatesh', college: 'IIT Madras', score: 1400, time: '38m 12s', rating: 2240, coins: 5000 },
  { rank: 2, name: 'Gowtham C D (You)', college: 'Kongu Engineering College', score: 1400, time: '44m 30s', rating: 1742, coins: 3500 },
  { rank: 3, name: 'Priya Sundaram', college: 'PSG College of Technology', score: 1300, time: '51m 10s', rating: 1980, coins: 2500 },
  { rank: 4, name: 'Karthik Raja', college: 'NIT Trichy', score: 1200, time: '55m 20s', rating: 1890, coins: 1800 },
  { rank: 5, name: 'Sneha Mohan', college: 'BITS Pilani', score: 1100, time: '59m 45s', rating: 1840, coins: 1500 },
  { rank: 6, name: 'Dinesh Kumar', college: 'Kongu Engineering College', score: 1000, time: '64m 10s', rating: 1710, coins: 1200 },
  { rank: 7, name: 'Ananya Sharma', college: 'IIT Delhi', score: 950, time: '67m 05s', rating: 1760, coins: 1000 },
];

export function WeeklyTestPage() {
  const [tab, setTab] = useState<'contests' | 'my-rating' | 'leaderboard' | 'archive'>('contests');
  
  // Contest runner modal state
  const [activeContestModal, setActiveContestModal] = useState<MockContest | null>(null);
  const [selectedProblemIndex, setSelectedProblemIndex] = useState(0);
  const [userCode, setUserCode] = useState(`// Solve the algorithm here
function solve(input) {
  // Return your output
  return output;
}`);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  // Countdown timer state for Sunday 8PM IST
  const [timeLeft, setTimeLeft] = useState({ days: 2, hours: 9, minutes: 34, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLaunchContest = (contest: MockContest) => {
    setActiveContestModal(contest);
    setSelectedProblemIndex(0);
    setSubmittedMessage(null);
  };

  const handleSubmitProblem = () => {
    setSubmittedMessage('✅ Solution Accepted! +300 Points • All 25 Hidden Test Cases Passed • Rank Updated');
    setTimeout(() => {
      // Auto move or keep message
    }, 2500);
  };

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link to="/student/home">Workspace</Link> &gt; <span>Weekly Contests &amp; Benchmark Arena</span>
      </div>

      {/* Hero Banner with Live Sunday Countdown */}
      <div className={styles.heroBanner}>
        <div className={styles.heroHeader}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(254, 214, 1, 0.15)', border: '1px solid rgba(254, 214, 1, 0.4)', padding: '4px 10px', fontSize: '0.74rem', fontWeight: 800, color: '#fed601', textTransform: 'uppercase', marginBottom: '8px' }}>
              <Flame size={14} color="#fed601" /> National Engineering Contest Series
            </div>
            <h1 className={styles.heroTitle}>Weekly Coding &amp; Architecture Contests</h1>
            <p className={styles.heroSubtitle}>
              Compete against top engineering peers nationwide every weekend. Earn verified Beyon contest ratings, unlock Tier-1 placement fast-tracks, and claim up to 🪙 25,000 Beyon Coins weekly.
            </p>
          </div>

          <div className={styles.countdownBox}>
            <div className={styles.countdownLabel}>
              <Timer size={14} /> Next Contest Starts In
            </div>
            <div className={styles.countdownGrid}>
              <div className={styles.countdownUnit}>
                <span className={styles.countdownNumber}>{String(timeLeft.days).padStart(2, '0')}</span>
                <span className={styles.countdownUnitLabel}>Days</span>
              </div>
              <div className={styles.countdownUnit}>
                <span className={styles.countdownNumber}>{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className={styles.countdownUnitLabel}>Hours</span>
              </div>
              <div className={styles.countdownUnit}>
                <span className={styles.countdownNumber}>{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className={styles.countdownUnitLabel}>Mins</span>
              </div>
              <div className={styles.countdownUnit}>
                <span className={styles.countdownNumber}>{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className={styles.countdownUnitLabel}>Secs</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.heroStatsRow}>
          <div className={styles.heroStatItem}>
            <div className={styles.heroStatIcon}>
              <Users size={18} color="#fed601" />
            </div>
            <div>
              <div className={styles.heroStatVal}>3,840+ Coders</div>
              <div className={styles.heroStatDesc}>Registered from 140+ Colleges</div>
            </div>
          </div>
          <div className={styles.heroStatItem}>
            <div className={styles.heroStatIcon}>
              <Trophy size={18} color="#22c55e" />
            </div>
            <div>
              <div className={styles.heroStatVal}>🪙 50,000 Coins</div>
              <div className={styles.heroStatDesc}>Weekly Prize Pool</div>
            </div>
          </div>
          <div className={styles.heroStatItem}>
            <div className={styles.heroStatIcon}>
              <ShieldCheck size={18} color="#38bdf8" />
            </div>
            <div>
              <div className={styles.heroStatVal}>Guardian Tier</div>
              <div className={styles.heroStatDesc}>Your Rating: 1,742 (#2 Rank)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className={styles.tabsBar}>
        <button
          className={`${styles.tabBtn} ${tab === 'contests' ? styles.tabBtnActive : ''}`}
          onClick={() => setTab('contests')}
        >
          <Layers size={16} /> Active &amp; Upcoming Contests (3)
        </button>
        <button
          className={`${styles.tabBtn} ${tab === 'my-rating' ? styles.tabBtnActive : ''}`}
          onClick={() => setTab('my-rating')}
        >
          <TrendingUp size={16} /> My Contest Rating &amp; Badges
        </button>
        <button
          className={`${styles.tabBtn} ${tab === 'leaderboard' ? styles.tabBtnActive : ''}`}
          onClick={() => setTab('leaderboard')}
        >
          <Trophy size={16} /> National Leaderboard
        </button>
        <button
          className={`${styles.tabBtn} ${tab === 'archive' ? styles.tabBtnActive : ''}`}
          onClick={() => setTab('archive')}
        >
          <Calendar size={16} /> Past Contests Archive
        </button>
      </div>

      {/* TAB 1: CONTESTS */}
      {tab === 'contests' && (
        <div className={styles.contestGrid}>
          {SAMPLE_CONTESTS.filter(c => c.status !== 'ARCHIVED').map(contest => {
            const isLive = contest.status === 'LIVE';
            return (
              <div
                key={contest.id}
                className={`${styles.contestCard} ${isLive ? styles.contestCardLive : styles.contestCardUpcoming}`}
              >
                <div>
                  <div className={styles.contestHeader}>
                    <span className={isLive ? styles.contestBadgeLive : styles.contestBadgeUpcoming}>
                      {isLive ? <><Flame size={12} /> Live Active Arena</> : <><Clock size={12} /> Upcoming Contest</>}
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>
                      Sponsored by {contest.sponsor}
                    </span>
                  </div>

                  <h3 className={styles.contestTitle}>{contest.title}</h3>
                  <p className={styles.contestDesc}>{contest.subtitle}</p>
                </div>

                <div className={styles.contestMetaRow}>
                  <span className={styles.contestMetaItem}>
                    <Timer size={13} color="#1c2d81" /> {contest.durationMinutes} Mins
                  </span>
                  <span className={styles.contestMetaItem}>
                    <FileCode size={13} color="#1c2d81" /> {contest.totalProblems} Problems
                  </span>
                  <span className={styles.contestMetaItem}>
                    <Users size={13} color="#1c2d81" /> {contest.participantsCount} Coders
                  </span>
                  <span className={styles.contestMetaItem}>
                    <BarChart3 size={13} color="#dc2626" /> {contest.difficulty}
                  </span>
                </div>

                <div className={styles.contestPrizes}>
                  <span>🏆 Pool: <strong>🪙 {contest.coinPool.toLocaleString()} Coins</strong></span>
                  <span>⚡ <strong>+{contest.xpReward} XP</strong></span>
                </div>

                {isLive ? (
                  <button className={styles.btnSuccess} onClick={() => handleLaunchContest(contest)}>
                    <Play size={16} /> Enter Live Contest Arena
                  </button>
                ) : (
                  <button className={styles.btnPrimary} onClick={() => alert(`Registered for ${contest.title}! We will notify you 15 minutes before start.`)}>
                    <CheckCircle2 size={16} /> Register &amp; Set Reminder
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: MY RATING & SUBMISSIONS */}
      {tab === 'my-rating' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderLeft: '4px solid #1c2d81', padding: '20px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Global Contest Rating</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1c2d81', marginTop: '4px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                1,742
                <span style={{ fontSize: '0.84rem', color: '#15803d', fontWeight: 700 }}>+68 Delta</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#475569' }}>Top 4.2% Nationwide • Guardian Tier</span>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderLeft: '4px solid #15803d', padding: '20px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Contests Participated</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#15803d', marginTop: '4px' }}>12 Contests</div>
              <span style={{ fontSize: '0.75rem', color: '#475569' }}>100% Attendance Streak (8 Weeks)</span>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderLeft: '4px solid #fed601', padding: '20px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Total Coins Earned</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#854d0e', marginTop: '4px' }}>🪙 18,450 Coins</div>
              <span style={{ fontSize: '0.75rem', color: '#475569' }}>Redeemable for placement vouchers</span>
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Recent Contest Submissions History</h3>
            <table className={styles.leaderboardTable}>
              <thead>
                <tr>
                  <th>Contest Name</th>
                  <th>Rank</th>
                  <th>Problems Solved</th>
                  <th>Score</th>
                  <th>Rating Delta</th>
                  <th>Coins Won</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Beyon Weekly Contest 47</strong></td>
                  <td><span className={`${styles.rankBadge} ${styles.rank2}`}>#2</span></td>
                  <td>4 / 4 Solved</td>
                  <td><strong>1400 / 1400</strong></td>
                  <td><span style={{ color: '#15803d', fontWeight: 800 }}>+68 (1674 → 1742)</span></td>
                  <td>🪙 3,500 Coins</td>
                </tr>
                <tr>
                  <td><strong>Bi-Weekly System Design Arena 23</strong></td>
                  <td><span className={`${styles.rankBadge} ${styles.rank1}`}>#1</span></td>
                  <td>2 / 2 Solved</td>
                  <td><strong>1000 / 1000</strong></td>
                  <td><span style={{ color: '#15803d', fontWeight: 800 }}>+82 (1592 → 1674)</span></td>
                  <td>🪙 5,000 Coins</td>
                </tr>
                <tr>
                  <td><strong>Beyon Weekly Contest 46</strong></td>
                  <td><span className={styles.rankBadge}>#8</span></td>
                  <td>3 / 4 Solved</td>
                  <td><strong>900 / 1400</strong></td>
                  <td><span style={{ color: '#15803d', fontWeight: 800 }}>+24 (1568 → 1592)</span></td>
                  <td>🪙 1,200 Coins</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: NATIONAL LEADERBOARD */}
      {tab === 'leaderboard' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                Weekly Contest 48 — Live National Leaderboard
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                Real-time scoring based on accuracy, test cases passed, and execution time penalty
              </p>
            </div>
            <span style={{ fontSize: '0.75rem', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '4px 10px', fontWeight: 700 }}>
              ● Live Syncing (Every 15s)
            </span>
          </div>

          <table className={styles.leaderboardTable}>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Candidate Name</th>
                <th>Institution</th>
                <th>Score</th>
                <th>Finish Time</th>
                <th>Global Rating</th>
                <th>Prize Coins</th>
              </tr>
            </thead>
            <tbody>
              {NATIONAL_LEADERBOARD.map(entry => (
                <tr key={entry.rank} style={entry.rank === 2 ? { background: '#f0fdf4' } : {}}>
                  <td>
                    <span className={`${styles.rankBadge} ${entry.rank === 1 ? styles.rank1 : entry.rank === 2 ? styles.rank2 : entry.rank === 3 ? styles.rank3 : ''}`}>
                      {entry.rank}
                    </span>
                  </td>
                  <td>
                    <strong>{entry.name}</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: '#475569', background: '#f1f5f9', padding: '2px 8px', borderRadius: '2px' }}>
                      {entry.college}
                    </span>
                  </td>
                  <td><strong>{entry.score} pts</strong></td>
                  <td>{entry.time}</td>
                  <td><span style={{ fontWeight: 800, color: '#1c2d81' }}>{entry.rating}</span></td>
                  <td><strong style={{ color: '#854d0e' }}>🪙 {entry.coins.toLocaleString()}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: ARCHIVE */}
      {tab === 'archive' && (
        <div className={styles.contestGrid}>
          {SAMPLE_CONTESTS.filter(c => c.status === 'ARCHIVED').map(contest => (
            <div key={contest.id} className={styles.contestCard} style={{ borderTop: '4px solid #64748b' }}>
              <div>
                <div className={styles.contestHeader}>
                  <span className={styles.contestBadgePast}>
                    ✓ {contest.status}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {contest.startTime}
                  </span>
                </div>
                <h3 className={styles.contestTitle}>{contest.title}</h3>
                <p className={styles.contestDesc}>{contest.subtitle}</p>
              </div>

              <div className={styles.contestMetaRow}>
                <span className={styles.contestMetaItem}>
                  <FileCode size={13} /> {contest.totalProblems} Problems
                </span>
                <span className={styles.contestMetaItem}>
                  <Users size={13} /> {contest.participantsCount} Coders
                </span>
              </div>

              <button className={styles.btnSecondary} onClick={() => alert(`Opening editorial and solution discussions for ${contest.title}`)}>
                📖 View Editorial &amp; Practice Problems
              </button>
            </div>
          ))}
        </div>
      )}

      {/* LIVE CONTEST RUNNER MODAL */}
      {activeContestModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase' }}>● Live Contest Arena Active</span>
                <h2 style={{ margin: '2px 0 0', fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>{activeContestModal.title}</h2>
              </div>
              <button
                onClick={() => setActiveContestModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Problem Navigation Bar */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {activeContestModal.problems.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedProblemIndex(idx); setSubmittedMessage(null); }}
                  style={{
                    padding: '8px 14px',
                    background: selectedProblemIndex === idx ? '#1c2d81' : '#f1f5f9',
                    color: selectedProblemIndex === idx ? '#ffffff' : '#334155',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  {p.title.split(':')[0]} ({p.points} pts)
                </button>
              ))}
            </div>

            {/* Problem Details */}
            {activeContestModal.problems[selectedProblemIndex] && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                      {activeContestModal.problems[selectedProblemIndex].title}
                    </h4>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#fee2e2', color: '#dc2626', padding: '2px 6px' }}>
                      {activeContestModal.problems[selectedProblemIndex].difficulty}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.5 }}>
                    {activeContestModal.problems[selectedProblemIndex].description}
                  </p>
                  
                  <div style={{ marginTop: '14px', fontSize: '0.78rem' }}>
                    <strong>Sample Input:</strong>
                    <pre style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '8px', margin: '4px 0 8px', fontFamily: 'monospace' }}>
                      {activeContestModal.problems[selectedProblemIndex].sampleInput}
                    </pre>
                    <strong>Expected Output:</strong>
                    <pre style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '8px', margin: '4px 0', fontFamily: 'monospace' }}>
                      {activeContestModal.problems[selectedProblemIndex].sampleOutput}
                    </pre>
                  </div>
                </div>

                {/* Code Editor Arena */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#1c2d81' }}>CODE EDITOR (JavaScript / TypeScript / Java / Python / C++)</span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Memory Limit: 256MB • Time: 2.0s</span>
                  </div>
                  <textarea
                    value={userCode}
                    onChange={e => setUserCode(e.target.value)}
                    style={{
                      width: '100%',
                      height: '240px',
                      fontFamily: 'Consolas, Monaco, monospace',
                      fontSize: '0.84rem',
                      background: '#0f172a',
                      color: '#38bdf8',
                      border: '1px solid #334155',
                      padding: '12px',
                      resize: 'none',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />

                  {submittedMessage && (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '10px', fontSize: '0.82rem', fontWeight: 700 }}>
                      {submittedMessage}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => alert('Testing against public sample cases: PASS (0.04s, 12MB)')}
                      style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}
                    >
                      ▶ Run Sample Tests
                    </button>
                    <button
                      onClick={handleSubmitProblem}
                      style={{ padding: '8px 20px', background: '#15803d', color: '#ffffff', border: 'none', fontSize: '0.84rem', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Send size={14} /> Submit Final Solution
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
