import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { opportunityApi } from '../services/practiceApi';
import { studentProfileApi } from '../../student/services/studentProfileApi';
import { intelligenceApi } from '../../intelligence/services/intelligenceApi';
import { AdaptiveTestModal } from '../../student/components/AdaptiveTestModal';
import type { CompanyOpportunity, OpportunityApplication } from '../types/practice';
import type { StudentSkill } from '../../student/types/studentProfile';
import {
  Check,
  MapPin,
  GraduationCap,
  ArrowRight,
  Search,
  AlertCircle,
  X,
  ShieldCheck,
  Briefcase,
  Sparkles,
  AlertTriangle,
  Target,
  CheckCircle2,
  XCircle,
  BrainCircuit,
  Award,
  Zap,
} from 'lucide-react';
import styles from './PracticePages.module.css';

interface SkillMatchResult {
  matchPercentage: number;
  matchedSkillsCount: number;
  totalSkillsCount: number;
  suitabilityTier: 'HIGH_MATCH' | 'MODERATE_MATCH' | 'SKILL_GAP_CRITICAL';
  technicalSkills: { name: string; isMatched: boolean; score?: number }[];
  softSkills: { name: string; isMatched: boolean; score?: number }[];
  missingCriticalSkills: string[];
}

const SOFT_SKILL_KEYWORDS = [
  'problem solving', 'team collaboration', 'verbal communication',
  'client articulation', 'quantitative aptitude', 'analytical thinking',
  'critical thinking', 'systems thinking', 'low-level debugging',
  'analytical reasoning', 'communication', 'leadership', 'aptitude'
];

function isSoftSkill(skillName: string): boolean {
  const lower = skillName.toLowerCase().trim();
  return SOFT_SKILL_KEYWORDS.some(k => lower.includes(k));
}

function normalizeSkillName(s: string): string {
  return s.trim().replace(/^SKILL_/, '').replace(/_/g, ' ').toLowerCase();
}

export function OpportunitiesPage() {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState<CompanyOpportunity[]>([]);
  const [myApplications, setMyApplications] = useState<OpportunityApplication[]>([]);
  const [studentSkills, setStudentSkills] = useState<StudentSkill[]>([]);
  const [weakConcepts, setWeakConcepts] = useState<any[]>([]);
  const [selectedOpp, setSelectedOpp] = useState<CompanyOpportunity | null>(null);
  const [eligibility, setEligibility] = useState<{ eligible: boolean; reasons: string[]; coinBalance: number; requiredCoins: number } | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'ALL' | 'RECOMMENDED' | 'DRIVES' | 'CRITICAL_ATTENTION' | 'INTERNSHIPS' | 'FULL_TIME' | 'MY_APPS'>('ALL');
  const [filterQuery, setFilterQuery] = useState('');

  // 50/50 Adaptive Retest Modal State
  const [isRetestModalOpen, setIsRetestModalOpen] = useState(false);
  const [adaptiveTestData, setAdaptiveTestData] = useState<any>(null);
  const [adaptiveTestLoading, setAdaptiveTestLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [opps, apps, sSkills, weak] = await Promise.all([
          opportunityApi.getOpportunities(),
          opportunityApi.getMyApplications().catch(() => []),
          studentProfileApi.getSkills().catch(() => []),
          intelligenceApi.getWeakConcepts().catch(() => []),
        ]);
        setOpportunities(opps || []);
        setMyApplications(apps || []);
        setStudentSkills(sSkills || []);
        setWeakConcepts(weak || []);
      } catch (err) {
        console.error('Failed to load opportunities:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const computeMatch = useMemo(() => {
    return (opp: CompanyOpportunity): SkillMatchResult => {
      if (!opp.requiredSkills) {
        return {
          matchPercentage: 75,
          matchedSkillsCount: 0,
          totalSkillsCount: 0,
          suitabilityTier: 'MODERATE_MATCH',
          technicalSkills: [],
          softSkills: [],
          missingCriticalSkills: [],
        };
      }

      const rawSkills = opp.requiredSkills.split(',').map(s => s.trim()).filter(Boolean);
      const studentSkillMap = new Map<string, StudentSkill>();
      studentSkills.forEach(s => {
        studentSkillMap.set(normalizeSkillName(s.skillName), s);
      });

      const technicalSkills: { name: string; isMatched: boolean; score?: number }[] = [];
      const softSkills: { name: string; isMatched: boolean; score?: number }[] = [];
      const missingCriticalSkills: string[] = [];

      let totalPoints = 0;
      let earnedPoints = 0;

      for (const req of rawSkills) {
        const norm = normalizeSkillName(req);
        const soft = isSoftSkill(req);

        // Check if student has skill
        const matched = studentSkillMap.get(norm) ||
          Array.from(studentSkillMap.entries()).find(([k]) => k.includes(norm) || norm.includes(k))?.[1];

        // Also check if student has high aptitude/problem solving verified
        const isMatched = Boolean(
          matched && (matched.verified || (matched.score != null && Number(matched.score) >= 50))
        ) || (soft && studentSkills.length >= 4); // Soft skill proxy if student has diverse skill profile

        const score = matched?.score != null ? Number(matched.score) : isMatched ? 80 : 0;
        const weight = soft ? 1 : 2; // Tech skills weighted double
        totalPoints += weight;

        if (isMatched) {
          earnedPoints += weight * (score / 100);
        } else {
          missingCriticalSkills.push(req.replace(/^SKILL_/, '').replace(/_/g, ' '));
        }

        if (soft) {
          softSkills.push({ name: req.replace(/^SKILL_/, '').replace(/_/g, ' '), isMatched, score });
        } else {
          technicalSkills.push({ name: req.replace(/^SKILL_/, '').replace(/_/g, ' '), isMatched, score });
        }
      }

      const pct = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 70;
      let suitabilityTier: 'HIGH_MATCH' | 'MODERATE_MATCH' | 'SKILL_GAP_CRITICAL' = 'MODERATE_MATCH';

      if (pct >= 75) {
        suitabilityTier = 'HIGH_MATCH';
      } else if (pct < 60 || missingCriticalSkills.length >= 2) {
        suitabilityTier = 'SKILL_GAP_CRITICAL';
      }

      const matchedSkillsCount = technicalSkills.filter(s => s.isMatched).length + softSkills.filter(s => s.isMatched).length;
      const totalSkillsCount = Math.max(1, technicalSkills.length + softSkills.length);

      return {
        matchPercentage: pct,
        matchedSkillsCount,
        totalSkillsCount,
        suitabilityTier,
        technicalSkills,
        softSkills,
        missingCriticalSkills,
      };
    };
  }, [studentSkills]);

  async function openDetails(opp: CompanyOpportunity) {
    setSelectedOpp(opp);
    setApplySuccess(null);
    setApplyError(null);
    setEligibility(null);
    setCheckingEligibility(true);
    try {
      const res = await opportunityApi.checkEligibility(opp.id);
      setEligibility(res);
    } catch {

    } finally {
      setCheckingEligibility(false);
    }
  }

  async function handleApply(oppId: string) {
    setApplying(true);
    setApplySuccess(null);
    setApplyError(null);
    try {
      const app = await opportunityApi.apply(oppId);
      setApplySuccess('Application submitted successfully!');
      setMyApplications(prev => [app, ...prev]);
    } catch (err: any) {
      setApplyError(err?.message || 'Failed to submit application. Please verify your coin balance and CGPA.');
    } finally {
      setApplying(false);
    }
  }

  const handleLaunchAdaptiveRetest = async (skillName: string, weakConceptKey?: string, companionSkillName?: string) => {
    setAdaptiveTestLoading(true);
    try {
      const matchingWeak = weakConcepts.find((w: any) =>
        w.skillName?.toLowerCase() === skillName.toLowerCase() ||
        w.conceptName?.toLowerCase().includes(skillName.toLowerCase())
      );
      const targetConcept = weakConceptKey || matchingWeak?.conceptName || 'core-fundamentals';
      const data = await intelligenceApi.generateAdaptiveTest(
        skillName || 'CSS',
        companionSkillName || 'HTML',
        targetConcept,
        30
      );
      setAdaptiveTestData(data);
      setIsRetestModalOpen(true);
    } catch (err) {
      console.error('Failed to generate adaptive test:', err);
    } finally {
      setAdaptiveTestLoading(false);
    }
  };

  const isApplied = (oppId: string) => myApplications.some(a => a.opportunityId === oppId);

  const filteredOpps = opportunities.filter(o => {
    const matchesSearch = !filterQuery ||
      o.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      (o.location && o.location.toLowerCase().includes(filterQuery.toLowerCase())) ||
      (o.requiredSkills && o.requiredSkills.toLowerCase().includes(filterQuery.toLowerCase()));

    if (!matchesSearch) return false;
    const match = computeMatch(o);

    if (tab === 'ALL') return true;
    if (tab === 'RECOMMENDED') return match.suitabilityTier === 'HIGH_MATCH' || match.matchPercentage >= 70;
    if (tab === 'CRITICAL_ATTENTION') return match.suitabilityTier === 'SKILL_GAP_CRITICAL';
    if (tab === 'DRIVES') return o.title.toLowerCase().includes('drive') || o.opportunityType === 'CAMPUS_DRIVE';
    if (tab === 'INTERNSHIPS') return o.opportunityType === 'INTERNSHIP';
    if (tab === 'FULL_TIME') return o.opportunityType === 'FULL_TIME';
    if (tab === 'MY_APPS') return isApplied(o.id);
    return true;
  });

  const totalDrives = opportunities.filter(o => o.title.toLowerCase().includes('drive') || o.opportunityType === 'CAMPUS_DRIVE').length;
  const totalRecommended = opportunities.filter(o => computeMatch(o).suitabilityTier === 'HIGH_MATCH').length;
  const totalCritical = opportunities.filter(o => computeMatch(o).suitabilityTier === 'SKILL_GAP_CRITICAL').length;
  const totalOpen = opportunities.length;

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link to="/student/home">Workspace</Link> &gt; <span>Opportunities &amp; Drives</span>
      </div>

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Campus Drives &amp; Opportunities</h1>
          <p style={{ color: '#64748b', fontSize: '0.86rem', margin: '4px 0 0', fontWeight: 400 }}>
            AI-powered skill matching, campus hiring drives, fast-track internships, and diagnostic gap remediation
          </p>
        </div>
      </div>

      {/* Stats and Match Overview */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Active Postings</span>
          <span className={styles.statValue}>{totalOpen}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Campus Drives</span>
          <span className={styles.statValue} style={{ color: '#1c2d81' }}>{totalDrives}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Top AI Matches</span>
          <span className={styles.statValue} style={{ color: '#15803d' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={16} /> {totalRecommended}
            </span>
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Critical Skill Gaps</span>
          <span className={styles.statValue} style={{ color: '#b91c1c' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <AlertTriangle size={16} /> {totalCritical}
            </span>
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', margin: '8px 0 16px' }}>
        <div className={styles.filters}>
          {(
            [
              { id: 'ALL', label: 'All Openings' },
              { id: 'RECOMMENDED', label: `Recommended (${totalRecommended})`, icon: Sparkles },
              { id: 'DRIVES', label: `Campus Drives (${totalDrives})` },
              { id: 'CRITICAL_ATTENTION', label: `Skill Gaps / Attention (${totalCritical})`, icon: AlertTriangle },
              { id: 'INTERNSHIPS', label: 'Internships' },
              { id: 'FULL_TIME', label: 'Full-Time' },
              { id: 'MY_APPS', label: `My Applications (${myApplications.length})` },
            ] as Array<{ id: string; label: string; icon?: any }>
          ).map(t => {
            const IconComponent = t.icon;
            return (
              <button
                key={t.id}
                className={`${styles.filterChip} ${tab === t.id ? styles.filterActive : ''}`}
                onClick={() => setTab(t.id as any)}
                style={t.id === 'CRITICAL_ATTENTION' && tab === 'CRITICAL_ATTENTION' ? { background: '#991b1b', borderColor: '#991b1b' } : {}}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  {IconComponent && <IconComponent size={13} />}
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by title, skill, city..."
            value={filterQuery}
            onChange={e => setFilterQuery(e.target.value)}
            style={{
              padding: '8px 16px 8px 34px',
              borderRadius: '0px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '0.85rem',
              minWidth: '240px',
              fontFamily: 'inherit',
              outline: 'none',
              fontWeight: 400,
            }}
          />
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          {[1, 2, 3, 4].map(i => <div key={i} className={styles.skeleton} style={{ height: 120, borderRadius: '0px' }} />)}
        </div>
      ) : filteredOpps.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No matching opportunities found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '18px', width: '100%' }}>
          {filteredOpps.map(opp => {
            const applied = isApplied(opp.id);
            const match = computeMatch(opp);

            return (
              <div
                key={opp.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderTop: match.suitabilityTier === 'HIGH_MATCH'
                    ? '4px solid #15803d'
                    : match.suitabilityTier === 'SKILL_GAP_CRITICAL'
                    ? '4px solid #dc2626'
                    : '4px solid #1c2d81',
                  borderRadius: '0px',
                  padding: '22px',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
                onClick={() => openDetails(opp)}
              >
                <div>
                  {/* Top Match & Type Badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {match.suitabilityTier === 'HIGH_MATCH' && (
                        <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '3px 8px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Sparkles size={12} /> {match.matchedSkillsCount}/{match.totalSkillsCount} Skills Match
                        </span>
                      )}
                      {match.suitabilityTier === 'MODERATE_MATCH' && (
                        <span style={{ fontSize: '0.72rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '3px 8px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Zap size={12} /> {match.matchedSkillsCount}/{match.totalSkillsCount} Skills Match
                        </span>
                      )}
                      {match.suitabilityTier === 'SKILL_GAP_CRITICAL' && (
                        <span style={{ fontSize: '0.72rem', background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', padding: '3px 8px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <AlertTriangle size={12} /> {match.matchedSkillsCount}/{match.totalSkillsCount} Skills (Gap Detected)
                        </span>
                      )}
                    </div>

                    {applied ? (
                      <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '3px 8px', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={12} /> Applied
                      </span>
                    ) : opp.opportunityType === 'CAMPUS_DRIVE' ? (
                      <span style={{ fontSize: '0.72rem', background: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4', padding: '3px 8px', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldCheck size={12} /> Campus Drive
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.72rem', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '3px 8px', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {opp.opportunityType.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.35 }}>
                    {opp.title}
                  </h3>

                  {/* Compensation & Criteria */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', margin: '12px 0 10px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#15803d', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Briefcase size={13} style={{ color: '#16a34a' }} /> ₹{opp.packageLpa || 12} LPA
                    </span>
                    {opp.location && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#475569', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} style={{ color: '#0284c7' }} /> {opp.location}
                      </span>
                    )}
                    {opp.minCgpa && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#475569', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <GraduationCap size={13} style={{ color: '#1c2d81' }} /> Min CGPA: {opp.minCgpa}
                      </span>
                    )}
                  </div>

                  {/* Required Skills Mapping Pills */}
                  {opp.requiredSkills && (
                    <div style={{ marginTop: '10px' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Required Skills Mapping:
                      </div>
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        {match.technicalSkills.map((s, idx) => (
                          <span
                            key={`tech-${idx}`}
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              padding: '2px 7px',
                              background: s.isMatched ? '#f0fdf4' : '#fef2f2',
                              border: `1px solid ${s.isMatched ? '#bbf7d0' : '#fecaca'}`,
                              color: s.isMatched ? '#166534' : '#991b1b',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}
                          >
                            {s.isMatched ? <Check size={10} color="#16a34a" /> : <X size={10} color="#dc2626" />}
                            {s.name}
                          </span>
                        ))}
                        {match.softSkills.map((s, idx) => (
                          <span
                            key={`soft-${idx}`}
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              padding: '2px 7px',
                              background: s.isMatched ? '#eff6ff' : '#fffbeb',
                              border: `1px solid ${s.isMatched ? '#bfdbfe' : '#fde68a'}`,
                              color: s.isMatched ? '#1e40af' : '#92400e',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}
                          >
                            {s.isMatched ? <Check size={10} color="#2563eb" /> : <AlertCircle size={10} color="#d97706" />}
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Critical Attention Required Callout on Card if Gap Detected */}
                  {match.suitabilityTier === 'SKILL_GAP_CRITICAL' && (
                    <div style={{
                      marginTop: '12px',
                      padding: '8px 12px',
                      background: '#fef2f2',
                      borderLeft: '3px solid #dc2626',
                      fontSize: '0.76rem',
                      color: '#991b1b',
                      lineHeight: 1.4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px'
                    }}>
                      <span>
                        <strong>Critical Attention Required:</strong> Missing {match.missingCriticalSkills.slice(0, 2).join(', ')}.
                      </span>
                      <span style={{ fontWeight: 700, textDecoration: 'underline' }}>
                        Train Weakness
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    style={{
                      height: '36px',
                      width: '100%',
                      background: applied ? '#f8fafc' : match.suitabilityTier === 'SKILL_GAP_CRITICAL' ? '#991b1b' : '#1c2d81',
                      color: applied ? '#475569' : '#ffffff',
                      border: `1px solid ${applied ? '#cbd5e1' : match.suitabilityTier === 'SKILL_GAP_CRITICAL' ? '#991b1b' : '#1c2d81'}`,
                      padding: '0 16px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      borderRadius: '0px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onClick={(e) => { e.stopPropagation(); openDetails(opp); }}
                  >
                    {applied ? (
                      <span>View Application Status</span>
                    ) : match.suitabilityTier === 'SKILL_GAP_CRITICAL' ? (
                      <>
                        <AlertTriangle size={14} />
                        <span>Diagnose Gap &amp; View Details</span>
                      </>
                    ) : (
                      <>
                        <span>View Details &amp; Apply</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Drive Details & Diagnostic Modal */}
      {selectedOpp && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }} onClick={() => setSelectedOpp(null)}>
          <div style={{
            background: '#ffffff',
            borderRadius: '0px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            position: 'relative',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className={styles.typeBadge} style={{ fontWeight: 600, textTransform: 'uppercase' }}>
                    {selectedOpp.opportunityType.replace('_', ' ')}
                  </span>
                  {selectedOpp.opportunityType === 'CAMPUS_DRIVE' && (
                    <span style={{ fontSize: '0.72rem', background: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4', padding: '2px 8px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <ShieldCheck size={12} /> Verified by Placement Cell
                    </span>
                  )}
                  {(() => {
                    const match = computeMatch(selectedOpp);
                    return (
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        background: match.suitabilityTier === 'HIGH_MATCH' ? '#dcfce7' : match.suitabilityTier === 'SKILL_GAP_CRITICAL' ? '#fee2e2' : '#eff6ff',
                        color: match.suitabilityTier === 'HIGH_MATCH' ? '#15803d' : match.suitabilityTier === 'SKILL_GAP_CRITICAL' ? '#991b1b' : '#1d4ed8',
                        border: `1px solid ${match.suitabilityTier === 'HIGH_MATCH' ? '#bbf7d0' : match.suitabilityTier === 'SKILL_GAP_CRITICAL' ? '#fecaca' : '#bfdbfe'}`
                      }}>
                        Skill Match: {match.matchPercentage}%
                      </span>
                    );
                  })()}
                </div>
                <h2 style={{ fontFamily: 'var(--font-heading, Montserrat)', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '8px 0 0' }}>
                  {selectedOpp.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOpp(null)}
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            {selectedOpp.description && (
              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, margin: 0, fontWeight: 400 }}>
                {selectedOpp.description}
              </p>
            )}

            {/* Criteria Overview */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Drive Specifications &amp; Criteria
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.82rem', color: '#334155' }}>
                <div><strong>Package (CTC):</strong> ₹{selectedOpp.packageLpa || 12} LPA</div>
                <div><strong>Location:</strong> {selectedOpp.location || 'Flexible'} {((selectedOpp as any).isRemote || selectedOpp.remote) ? '(Remote)' : ''}</div>
                <div><strong>Min CGPA:</strong> {selectedOpp.minCgpa || 'No Cutoff'}</div>
                <div><strong>Departments:</strong> {(selectedOpp as any).eligibleDepartments || 'All Engineering'}</div>
                <div><strong>Batch:</strong> {(selectedOpp as any).eligibleGraduationYears || 'Open'}</div>
                <div><strong>Coins Cost:</strong> {selectedOpp.minBeyonCoins > 0 ? `${selectedOpp.minBeyonCoins} Coins` : 'Free'}</div>
              </div>
            </div>

            {/* Comprehensive Skills Mapping Matrix */}
            {(() => {
              const match = computeMatch(selectedOpp);
              return (
                <div style={{ border: '1px solid #e2e8f0', padding: '16px', background: '#ffffff' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Detailed Skills Mapping &amp; Fit Analysis</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: match.suitabilityTier === 'HIGH_MATCH' ? '#15803d' : '#991b1b', background: match.suitabilityTier === 'HIGH_MATCH' ? '#f0fdf4' : '#fef2f2', border: `1px solid ${match.suitabilityTier === 'HIGH_MATCH' ? '#bbf7d0' : '#fecaca'}`, padding: '3px 8px' }}>
                      Skills Match: {match.matchedSkillsCount}/{match.totalSkillsCount} Skills
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    {/* Technical Skills Column */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px' }}>
                      <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <BrainCircuit size={13} color="#1c2d81" /> Technical Skills
                      </div>
                      {match.technicalSkills.length === 0 ? (
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>General Engineering</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {match.technicalSkills.map((s, idx) => (
                            <div key={`modal-tech-${idx}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#334155' }}>
                                {s.isMatched ? <CheckCircle2 size={13} color="#16a34a" /> : <XCircle size={13} color="#dc2626" />}
                                {s.name}
                              </span>
                              <span style={{ fontWeight: 600, color: s.isMatched ? '#16a34a' : '#dc2626' }}>
                                {s.isMatched ? `${s.score || 80}% Verified` : 'Missing / Unverified'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Soft Skills Column */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px' }}>
                      <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Award size={13} color="#2563eb" /> Soft Skills &amp; Aptitude
                      </div>
                      {match.softSkills.length === 0 ? (
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Standard Behavioral Profile</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {match.softSkills.map((s, idx) => (
                            <div key={`modal-soft-${idx}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#334155' }}>
                                {s.isMatched ? <CheckCircle2 size={13} color="#2563eb" /> : <AlertTriangle size={13} color="#d97706" />}
                                {s.name}
                              </span>
                              <span style={{ fontWeight: 600, color: s.isMatched ? '#2563eb' : '#d97706' }}>
                                {s.isMatched ? 'Proficient' : 'Needs Practice'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* CRITICAL ATTENTION REQUIRED / CONCEPT WEAKNESS INTERVENTION */}
            {(() => {
              const match = computeMatch(selectedOpp);
              const isBlocked = match.suitabilityTier === 'SKILL_GAP_CRITICAL' || (eligibility && !eligibility.eligible);

              if (!isBlocked) return null;

              return (
                <div style={{
                  padding: '16px',
                  background: '#fef2f2',
                  border: '1.5px solid #f87171',
                  borderRadius: '0px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#991b1b', fontWeight: 800, fontSize: '0.92rem', marginBottom: '6px' }}>
                    <AlertTriangle size={18} />
                    <span>Skill Gap Detected · Critical Attention Required</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#7f1d1d', margin: '0 0 12px', lineHeight: 1.5 }}>
                    You currently do not meet the minimum skill benchmark for this campus drive. Missing or underperforming skills: <strong>{match.missingCriticalSkills.join(', ') || 'Core Technical Foundations'}</strong>. Train your diagnosed concept weaknesses with a 50/50 targeted adaptive retest to unblock eligibility.
                  </p>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => {
                        setSelectedOpp(null);
                        navigate('/student/skills?section=weakness');
                      }}
                      style={{
                        background: '#991b1b',
                        color: '#ffffff',
                        border: 'none',
                        padding: '8px 16px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Target size={14} /> Train in Concept Weakness Diagnosis
                    </button>

                    <button
                      onClick={() => {
                        const targetSkill = match.missingCriticalSkills[0] || 'CSS';
                        handleLaunchAdaptiveRetest(targetSkill, 'css-boxing', 'HTML');
                      }}
                      disabled={adaptiveTestLoading}
                      style={{
                        background: '#ffffff',
                        color: '#991b1b',
                        border: '1px solid #f87171',
                        padding: '8px 16px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Sparkles size={14} /> {adaptiveTestLoading ? 'Generating Blueprint...' : 'Launch 50/50 Adaptive Retest'}
                    </button>
                  </div>
                </div>
              );
            })()}

            {checkingEligibility ? (
              <div style={{ fontSize: '0.84rem', color: '#64748b', textAlign: 'center', padding: '12px' }}>
                Verifying academic &amp; coin eligibility...
              </div>
            ) : eligibility && (
              <div style={{
                padding: '12px 16px',
                background: eligibility.eligible ? '#f0fdf4' : '#fffbeb',
                border: `1px solid ${eligibility.eligible ? '#bbf7d0' : '#fde68a'}`,
                borderRadius: '0px',
                fontSize: '0.84rem',
              }}>
                <div style={{ fontWeight: 600, color: eligibility.eligible ? '#15803d' : '#b45309', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  {eligibility.eligible ? <Check size={16} /> : <AlertCircle size={16} />}
                  {eligibility.eligible ? 'Academic & Coin Criteria Met' : 'Institutional Eligibility Breakdown:'}
                </div>
                {!eligibility.eligible && eligibility.reasons && eligibility.reasons.length > 0 && (
                  <ul style={{ margin: '4px 0 0', paddingLeft: '20px', color: '#92400e', fontSize: '0.8rem' }}>
                    {eligibility.reasons.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                )}
              </div>
            )}

            {applySuccess && (
              <div style={{ padding: '12px 16px', background: '#dcfce7', border: '1px solid #bbf7d0', color: '#15803d', fontSize: '0.85rem', fontWeight: 600 }}>
                {applySuccess}
              </div>
            )}

            {applyError && (
              <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.85rem' }}>
                {applyError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button
                className={styles.filterChip}
                onClick={() => setSelectedOpp(null)}
                style={{ borderRadius: '0px' }}
              >
                Close
              </button>
              {(() => {
                const myApp = myApplications.find(a => a.opportunityId === selectedOpp.id);
                if (myApp) {
                  const hasAssessed = myApp.status === 'ASSESSED' || myApp.assessmentScore != null;
                  if (hasAssessed) {
                    return (
                      <button
                        style={{
                          background: '#f0fdf4',
                          border: '1.5px solid #16a34a',
                          color: '#15803d',
                          padding: '8px 16px',
                          borderRadius: '0px',
                          fontWeight: 700,
                          fontSize: '0.84rem',
                          cursor: 'default',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                        disabled
                      >
                        <Check size={14} /> Assessment Completed ({myApp.assessmentScore || 0}% Score)
                      </button>
                    );
                  }
                  return (
                    <button
                      style={{
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        color: '#15803d',
                        padding: '8px 16px',
                        borderRadius: '0px',
                        fontWeight: 600,
                        fontSize: '0.84rem',
                        cursor: 'default',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      disabled
                    >
                      <Check size={14} /> Applied · Ready for Assessment
                    </button>
                  );
                }
                const match = computeMatch(selectedOpp);
                const hasCriticalGap = match.suitabilityTier === 'SKILL_GAP_CRITICAL';

                return (
                  <button
                    className={styles.submitBtn}
                    style={{
                      margin: 0,
                      borderRadius: '0px',
                      background: hasCriticalGap ? '#991b1b' : '#1c2d81'
                    }}
                    onClick={() => handleApply(selectedOpp.id)}
                    disabled={applying || Boolean(eligibility && !eligibility.eligible)}
                  >
                    {applying ? 'Submitting Application...' : hasCriticalGap ? 'Apply With Skill Deficiency Warning' : 'Confirm & Apply'}
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* 50/50 Adaptive Retest Modal */}
      {isRetestModalOpen && (
        <AdaptiveTestModal
          isOpen={isRetestModalOpen}
          loading={adaptiveTestLoading}
          testData={adaptiveTestData}
          onClose={() => {
            setIsRetestModalOpen(false);
            setAdaptiveTestData(null);
          }}
          onTestCompleted={async () => {
            setIsRetestModalOpen(false);
            setAdaptiveTestData(null);
            // Refresh student skills after completing test
            try {
              const sSkills = await studentProfileApi.getSkills();
              setStudentSkills(sSkills || []);
            } catch {}
          }}
        />
      )}
    </div>
  );
}
