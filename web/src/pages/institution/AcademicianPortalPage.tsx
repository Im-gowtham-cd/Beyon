import { useState } from 'react';
import {
  Search,
  Building2,
  Calendar,
  MapPin,
  BookOpen,
  CheckCircle2,
  Clock,
  Send,
  X,
  FileText,
  Filter,
  Check,
} from 'lucide-react';

export type OpportunityPillar = 'ALL' | 'FDP' | 'SABBATICAL' | 'CONSULTANCY' | 'RESEARCH_GRANT';

export interface AcademicOpportunity {
  id: string;
  title: string;
  pillar: 'FDP' | 'SABBATICAL' | 'CONSULTANCY' | 'RESEARCH_GRANT';
  sponsor: string;
  department: string;
  stipendOrGrant: string;
  duration: string;
  mode: 'VIRTUAL' | 'HYBRID' | 'ON_SITE';
  location: string;
  eligibility: string;
  deadline: string;
  description: string;
  focusSkills: string[];
  seatsOrPositions: number;
}

export interface FacultyApplication {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  sponsor: string;
  pillar: string;
  facultyName: string;
  designation: string;
  department: string;
  proposalSummary: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'ACTIVE';
  appliedDate: string;
}

const INITIAL_OPPORTUNITIES: AcademicOpportunity[] = [
  {
    id: 'opp-fdp-1',
    title: 'Advanced AI & Large Language Model Architecture for Higher Education Curriculum',
    pillar: 'FDP',
    sponsor: 'Google Cloud Higher Education',
    department: 'Computer Science & IT',
    stipendOrGrant: 'Fully Sponsored + Rs. 25,000 Resource Grant',
    duration: '2 Weeks (Intensive)',
    mode: 'HYBRID',
    location: 'Bangalore & Virtual',
    eligibility: 'Assistant / Associate Professors in CS, IT, or Data Science',
    deadline: '2026-10-15',
    description: 'Designed to equip engineering academicians with hands-on foundational model training, fine-tuning methodologies (LoRA/QLoRA), and prompt engineering to modernize college syllabus and research pedagogy.',
    focusSkills: ['Deep Learning', 'PyTorch', 'Large Language Models', 'Generative AI', 'Curriculum Design'],
    seatsOrPositions: 40,
  },
  {
    id: 'opp-sab-1',
    title: 'Cloud Systems & Distributed Fault-Tolerant Infrastructure Corporate Sabbatical',
    pillar: 'SABBATICAL',
    sponsor: 'Amazon Web Services (AWS)',
    department: 'Computer Science & IT',
    stipendOrGrant: 'Rs. 1,20,000 / month Fellowship',
    duration: '3 Months (Full-Time Sabbatical)',
    mode: 'ON_SITE',
    location: 'Hyderabad Campus',
    eligibility: 'Faculty with 4+ years teaching Distributed Systems, OS, or Cloud Computing',
    deadline: '2026-10-30',
    description: 'Immerse in AWS production service teams to study hyperscale Kubernetes orchestration, multi-region database replication, and zero-trust IAM architectures. Gain direct industry practice to bring back to university lecture halls.',
    focusSkills: ['Distributed Systems', 'Kubernetes', 'AWS Architecture', 'Microservices', 'Site Reliability'],
    seatsOrPositions: 8,
  },
  {
    id: 'opp-con-1',
    title: 'Structural Health Monitoring & IoT Sensor Analytics for Industrial Bridges',
    pillar: 'CONSULTANCY',
    sponsor: 'L&T Heavy Engineering & Infrastructure',
    department: 'Civil & Infrastructure',
    stipendOrGrant: 'Rs. 4,50,000 Project Honorarium',
    duration: '4 Months (Part-Time Consultancy)',
    mode: 'HYBRID',
    location: 'Mumbai & Site Visits',
    eligibility: 'Civil / Mechanical Faculty with specialization in Structural Analysis or IoT',
    deadline: '2026-11-05',
    description: 'L&T invites university professors to consult on real-time vibration signature analysis, strain gauge telemetry, and predictive maintenance algorithms for pre-stressed concrete infrastructure.',
    focusSkills: ['Structural Dynamics', 'Predictive Maintenance', 'IoT Sensor Arrays', 'Finite Element Analysis'],
    seatsOrPositions: 3,
  },
  {
    id: 'opp-res-1',
    title: 'High-Efficiency Battery Management Algorithms for Electric Vehicles (EV)',
    pillar: 'RESEARCH_GRANT',
    sponsor: 'Tata Motors Corporate Technology Center',
    department: 'Electronics & Communication',
    stipendOrGrant: 'Rs. 12,00,000 Joint Research Grant',
    duration: '12 Months Collaborative Research',
    mode: 'HYBRID',
    location: 'Pune Tech Center & University Lab',
    eligibility: 'PhD Holders in Electrical, Electronics, or Energy Engineering',
    deadline: '2026-11-20',
    description: 'Joint academia-industry sponsored research grant to develop State-of-Charge (SoC) and State-of-Health (SoH) predictive neural network models under extreme thermal variations for commercial EV fleets.',
    focusSkills: ['Battery Management Systems', 'Neural Networks', 'Embedded C', 'MATLAB/Simulink', 'Power Electronics'],
    seatsOrPositions: 2,
  },
  {
    id: 'opp-fdp-2',
    title: 'Semiconductor VLSI Physical Design & Tapeout Workflows',
    pillar: 'FDP',
    sponsor: 'Qualcomm India',
    department: 'Electronics & Communication',
    stipendOrGrant: 'Fully Sponsored + Certified Tool Licenses',
    duration: '3 Weeks',
    mode: 'VIRTUAL',
    location: 'Online Live Labs',
    eligibility: 'Faculty teaching Digital Electronics, VLSI, or Microprocessors',
    deadline: '2026-10-25',
    description: 'Industry-grade exposure to RTL synthesis, static timing analysis (STA), clock tree synthesis, and DRC/LVS physical verification using standard EDA tooling.',
    focusSkills: ['VLSI Design', 'Verilog', 'RTL Synthesis', 'EDA Tools', 'Static Timing Analysis'],
    seatsOrPositions: 50,
  },
  {
    id: 'opp-con-2',
    title: 'Enterprise Supply Chain Network Optimization & ESG Carbon Accounting',
    pillar: 'CONSULTANCY',
    sponsor: 'Mahindra & Mahindra Logistics',
    department: 'Management & Analytics',
    stipendOrGrant: 'Rs. 3,20,000 Consultancy Honorarium',
    duration: '3 Months',
    mode: 'HYBRID',
    location: 'Chennai & Remote',
    eligibility: 'Business School / Industrial Engineering Faculty with Operations research focus',
    deadline: '2026-11-10',
    description: 'Evaluate multi-echelon freight routing models to minimize greenhouse gas emissions while preserving on-time delivery SLAs across 400 national hubs.',
    focusSkills: ['Operations Research', 'Supply Chain Analytics', 'ESG Frameworks', 'Linear Programming'],
    seatsOrPositions: 4,
  },
];

export function AcademicianPortalPage() {
  const [opportunities] = useState<AcademicOpportunity[]>(INITIAL_OPPORTUNITIES);
  const [activePillar, setActivePillar] = useState<OpportunityPillar>('ALL');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'EXPLORE' | 'MY_APPLICATIONS'>('EXPLORE');

  // Application Modal state
  const [selectedOpp, setSelectedOpp] = useState<AcademicOpportunity | null>(null);
  const [facultyName, setFacultyName] = useState('Dr. S. Ramanathan');
  const [designation, setDesignation] = useState('Associate Professor');
  const [facultyDept, setFacultyDept] = useState('Computer Science & Engineering');
  const [proposalSummary, setProposalSummary] = useState('');
  const [scholarLink, setScholarLink] = useState('https://scholar.google.com/citations?user=sample');
  const [hasNocEndorsement, setHasNocEndorsement] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Applications tracking list
  const [myApplications, setMyApplications] = useState<FacultyApplication[]>([
    {
      id: 'app-sample-1',
      opportunityId: 'opp-fdp-1',
      opportunityTitle: 'Advanced AI & Large Language Model Architecture for Higher Education Curriculum',
      sponsor: 'Google Cloud Higher Education',
      pillar: 'FDP',
      facultyName: 'Dr. S. Ramanathan',
      designation: 'Associate Professor',
      department: 'Computer Science & Engineering',
      proposalSummary: 'Plan to introduce prompt engineering and SLM fine-tuning in our 6th-semester elective on Applied Artificial Intelligence.',
      status: 'UNDER_REVIEW',
      appliedDate: '2026-09-08',
    },
  ]);

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesPillar = activePillar === 'ALL' || opp.pillar === activePillar;
    const matchesDept = selectedDept === 'ALL' || opp.department === selectedDept;
    const matchesSearch =
      !searchQuery.trim() ||
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.sponsor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.focusSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesPillar && matchesDept && matchesSearch;
  });

  const handleOpenApplyModal = (opp: AcademicOpportunity) => {
    setSelectedOpp(opp);
    setProposalSummary('');
  };

  const handleCloseModal = () => {
    setSelectedOpp(null);
    setProposalSummary('');
  };

  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpp || !proposalSummary.trim()) return;

    setSubmitting(true);
    setTimeout(() => {
      const newApp: FacultyApplication = {
        id: `app-${Date.now()}`,
        opportunityId: selectedOpp.id,
        opportunityTitle: selectedOpp.title,
        sponsor: selectedOpp.sponsor,
        pillar: selectedOpp.pillar,
        facultyName,
        designation,
        department: facultyDept,
        proposalSummary,
        status: 'SUBMITTED',
        appliedDate: new Date().toISOString().split('T')[0],
      };

      setMyApplications((prev) => [newApp, ...prev]);
      setSubmitting(false);
      setSelectedOpp(null);
      setToastMessage(`Proposal successfully submitted to ${selectedOpp.sponsor}! Track progress in My Applications.`);
      setTimeout(() => setToastMessage(null), 5000);
    }, 600);
  };

  const getPillarBadge = (pillar: string) => {
    switch (pillar) {
      case 'FDP':
        return { label: 'Faculty Development Program', bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' };
      case 'SABBATICAL':
        return { label: 'Industrial Sabbatical & Training', bg: '#fef3c7', text: '#92400e', border: '#fde68a' };
      case 'CONSULTANCY':
        return { label: 'Corporate Consultancy', bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' };
      case 'RESEARCH_GRANT':
        return { label: 'Collaborative Research Grant', bg: '#faf5ff', text: '#6b21a8', border: '#e9d5ff' };
      default:
        return { label: pillar, bg: '#f1f5f9', text: '#334155', border: '#cbd5e1' };
    }
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto', fontFamily: "'ClashDisplay', 'Clash Display', sans-serif" }}>
      {/* Page Header */}
      <div style={{ marginBottom: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ background: '#fed601', color: '#1c2d81', padding: '3px 10px', fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Academia-Industry Collaboration Hub
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Faculty Empowerment &amp; Research</span>
            </div>
            <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 900, color: '#1c2d81', letterSpacing: '-0.02em' }}>
              Academician Industry Portal
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: '#475569', maxWidth: '850px', lineHeight: 1.5 }}>
              Bridge the academia-industry divide through sponsored Faculty Development Programs (FDPs), corporate industrial sabbaticals, commercial consultancy projects, and collaborative research grants with enterprise partners.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('EXPLORE')}
              style={{
                padding: '9px 18px',
                background: activeTab === 'EXPLORE' ? '#1c2d81' : '#ffffff',
                color: activeTab === 'EXPLORE' ? '#fed601' : '#1c2d81',
                border: '1.5px solid #1c2d81',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease',
              }}
            >
              <BookOpen size={16} />
              <span>Explore Programs ({opportunities.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('MY_APPLICATIONS')}
              style={{
                padding: '9px 18px',
                background: activeTab === 'MY_APPLICATIONS' ? '#1c2d81' : '#ffffff',
                color: activeTab === 'MY_APPLICATIONS' ? '#fed601' : '#1c2d81',
                border: '1.5px solid #1c2d81',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease',
              }}
            >
              <FileText size={16} />
              <span>My Proposals &amp; Applications ({myApplications.length})</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '20px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderLeft: '4px solid #2563eb', padding: '14px 18px' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Faculty FDPs</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1c2d81', marginTop: '4px' }}>2 Active FDPs</div>
            <div style={{ fontSize: '0.74rem', color: '#2563eb', fontWeight: 700, marginTop: '2px' }}>Google &amp; Qualcomm Sponsored</div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderLeft: '4px solid #d97706', padding: '14px 18px' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Industrial Sabbaticals</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1c2d81', marginTop: '4px' }}>1 Corporate Immersion</div>
            <div style={{ fontSize: '0.74rem', color: '#d97706', fontWeight: 700, marginTop: '2px' }}>AWS Cloud Infrastructure (Hyderabad)</div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderLeft: '4px solid #16a34a', padding: '14px 18px' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Industry Consultancy</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1c2d81', marginTop: '4px' }}>2 Paid Consultancies</div>
            <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 700, marginTop: '2px' }}>L&amp;T &amp; Mahindra Logistics</div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderLeft: '4px solid #9333ea', padding: '14px 18px' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Collaborative Grants</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1c2d81', marginTop: '4px' }}>Rs. 12 Lakhs Fund</div>
            <div style={{ fontSize: '0.74rem', color: '#9333ea', fontWeight: 700, marginTop: '2px' }}>Tata Motors Electric Vehicle Labs</div>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div style={{ marginBottom: '20px', padding: '12px 18px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} color="#16a34a" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Tab View */}
      {activeTab === 'EXPLORE' ? (
        <>
          {/* Filter Bar */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '16px 20px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Pillar Selector Tabs */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(
                [
                  { key: 'ALL', label: 'All Opportunities' },
                  { key: 'FDP', label: 'Faculty Development (FDP)' },
                  { key: 'SABBATICAL', label: 'Corporate Sabbaticals' },
                  { key: 'CONSULTANCY', label: 'Consultancy Projects' },
                  { key: 'RESEARCH_GRANT', label: 'Joint Research Grants' },
                ] as { key: OpportunityPillar; label: string }[]
              ).map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setActivePillar(p.key)}
                  style={{
                    padding: '7px 14px',
                    fontSize: '0.82rem',
                    fontWeight: activePillar === p.key ? 800 : 600,
                    background: activePillar === p.key ? '#1c2d81' : '#f8fafc',
                    color: activePillar === p.key ? '#ffffff' : '#334155',
                    border: activePillar === p.key ? '1px solid #1c2d81' : '1px solid #cbd5e1',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Search & Department Filters */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '6px 12px' }}>
                <Search size={14} color="#64748b" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search programs, sponsors, skills..."
                  style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.82rem', fontWeight: 600, minWidth: '220px', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Filter size={14} color="#64748b" />
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  style={{ padding: '7px 12px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '0.82rem', fontWeight: 700, color: '#1c2d81', fontFamily: 'inherit' }}
                >
                  <option value="ALL">All Disciplines</option>
                  <option value="Computer Science & IT">Computer Science &amp; IT</option>
                  <option value="Electronics & Communication">Electronics &amp; Communication</option>
                  <option value="Civil & Infrastructure">Civil &amp; Infrastructure</option>
                  <option value="Management & Analytics">Management &amp; Analytics</option>
                </select>
              </div>
            </div>
          </div>

          {/* Opportunities Grid */}
          {filteredOpportunities.length === 0 ? (
            <div style={{ background: '#ffffff', border: '1px dashed #cbd5e1', padding: '48px 24px', textAlign: 'center', color: '#64748b' }}>
              <BookOpen size={36} color="#94a3b8" style={{ marginBottom: '10px' }} />
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1c2d81' }}>No matching academic programs found</h3>
              <p style={{ margin: '6px 0 0', fontSize: '0.84rem' }}>Try clearing your search query or selecting a different discipline filter.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
              {filteredOpportunities.map((opp) => {
                const badge = getPillarBadge(opp.pillar);
                const isApplied = myApplications.some((a) => a.opportunityId === opp.id);

                return (
                  <div
                    key={opp.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      padding: '20px',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    }}
                  >
                    <div>
                      {/* Badge and Sponsor */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, background: badge.bg, color: badge.text, border: `1px solid ${badge.border}`, padding: '3px 8px', textTransform: 'uppercase' }}>
                          {badge.label}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> Deadline: {opp.deadline}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 style={{ margin: '0 0 8px', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.35 }}>
                        {opp.title}
                      </h3>

                      {/* Sponsor & Location */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '0.82rem', color: '#475569', marginBottom: '12px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 700, color: '#1c2d81' }}>
                          <Building2 size={14} /> {opp.sponsor}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <MapPin size={14} color="#64748b" /> {opp.location} ({opp.mode})
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <Calendar size={14} color="#64748b" /> {opp.duration}
                        </span>
                      </div>

                      {/* Description */}
                      <p style={{ margin: '0 0 14px', fontSize: '0.84rem', color: '#334155', lineHeight: 1.5 }}>
                        {opp.description}
                      </p>

                      {/* Highlights / Stipend */}
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 14px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Financial Grant / Honorarium</div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#15803d', marginTop: '2px' }}>{opp.stipendOrGrant}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Capacity</div>
                          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1c2d81', marginTop: '2px' }}>{opp.seatsOrPositions} Positions</div>
                        </div>
                      </div>

                      {/* Skills Chips */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                        {opp.focusSkills.map((skill, idx) => (
                          <span key={idx} style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #dbeafe', padding: '2px 7px', fontSize: '0.72rem', fontWeight: 700 }}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                        Eligible: <strong>{opp.eligibility}</strong>
                      </span>

                      {isApplied ? (
                        <button
                          type="button"
                          disabled
                          style={{
                            padding: '8px 16px',
                            background: '#dcfce7',
                            color: '#15803d',
                            border: '1px solid #86efac',
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'default',
                          }}
                        >
                          <Check size={14} /> Proposal Submitted
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenApplyModal(opp)}
                          style={{
                            padding: '8px 18px',
                            background: '#1c2d81',
                            color: '#fed601',
                            border: 'none',
                            fontSize: '0.82rem',
                            fontWeight: 900,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                          }}
                        >
                          <span>Apply / Submit Proposal</span>
                          <Send size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* My Applications Tab */
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#1c2d81' }}>
              My Submitted Academic Proposals &amp; Sabbatical Requests
            </h2>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>
              {myApplications.length} Total Submissions
            </span>
          </div>

          {myApplications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <FileText size={36} color="#94a3b8" style={{ marginBottom: '10px' }} />
              <p style={{ fontWeight: 700, margin: 0 }}>You have not submitted any academic proposals yet.</p>
              <button
                type="button"
                onClick={() => setActiveTab('EXPLORE')}
                style={{ marginTop: '12px', padding: '8px 16px', background: '#1c2d81', color: '#fed601', border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: '0.82rem' }}
              >
                Browse FDPs &amp; Sabbaticals
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {myApplications.map((app) => (
                <div key={app.id} style={{ border: '1px solid #e2e8f0', padding: '16px 20px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#e0e7ff', color: '#1e40af', padding: '2px 8px', textTransform: 'uppercase' }}>
                        {app.pillar}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Applied on {app.appliedDate}</span>
                    </div>
                    <h3 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                      {app.opportunityTitle}
                    </h3>
                    <div style={{ fontSize: '0.82rem', color: '#1c2d81', fontWeight: 700, marginBottom: '8px' }}>
                      Partner Enterprise: {app.sponsor}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.45 }}>
                      <strong>Statement of Intent:</strong> {app.proposalSummary}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <span
                      style={{
                        padding: '4px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        background: app.status === 'ACCEPTED' ? '#dcfce7' : app.status === 'UNDER_REVIEW' ? '#fef3c7' : '#e0e7ff',
                        color: app.status === 'ACCEPTED' ? '#166534' : app.status === 'UNDER_REVIEW' ? '#92400e' : '#1e40af',
                        border: `1px solid ${app.status === 'ACCEPTED' ? '#bbf7d0' : app.status === 'UNDER_REVIEW' ? '#fde68a' : '#bfdbfe'}`,
                      }}
                    >
                      {app.status === 'UNDER_REVIEW' ? 'Under Review by Sponsor' : app.status}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Submitted as: {app.facultyName} ({app.designation})</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Proposal Submission Modal */}
      {selectedOpp && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              border: '2px solid #1c2d81',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            {/* Modal Header */}
            <div style={{ background: '#1c2d81', color: '#ffffff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #fed601' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#fed601', textTransform: 'uppercase' }}>Academic Proposal Submission</span>
                <h3 style={{ margin: '2px 0 0', fontSize: '1.05rem', fontWeight: 900, color: '#ffffff' }}>
                  {selectedOpp.title}
                </h3>
              </div>
              <button type="button" onClick={handleCloseModal} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitProposal} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span>Sponsor: <strong>{selectedOpp.sponsor}</strong></span>
                <span>Grant / Honorarium: <strong style={{ color: '#15803d' }}>{selectedOpp.stipendOrGrant}</strong></span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Faculty Name &amp; Title
                  </label>
                  <input
                    type="text"
                    value={facultyName}
                    onChange={(e) => setFacultyName(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Designation
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Academic Department &amp; Institution
                </label>
                <input
                  type="text"
                  value={facultyDept}
                  onChange={(e) => setFacultyDept(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Research Profile / Google Scholar / ORCID URL
                </label>
                <input
                  type="url"
                  value={scholarLink}
                  onChange={(e) => setScholarLink(e.target.value)}
                  placeholder="https://scholar.google.com/citations?user=..."
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontWeight: 600, color: '#0f172a', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Statement of Intent / Research Alignment (Why are you the right candidate?)
                </label>
                <textarea
                  rows={4}
                  value={proposalSummary}
                  onChange={(e) => setProposalSummary(e.target.value)}
                  placeholder="Describe your research background, specific relevance to the problem statement, and how this collaboration benefits student curriculum or research output..."
                  required
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontFamily: 'inherit', boxSizing: 'border-box', lineHeight: 1.5 }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px 12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <input
                  type="checkbox"
                  id="noc-check"
                  checked={hasNocEndorsement}
                  onChange={(e) => setHasNocEndorsement(e.target.checked)}
                  style={{ marginTop: '3px' }}
                />
                <label htmlFor="noc-check" style={{ fontSize: '0.78rem', color: '#334155', cursor: 'pointer', lineHeight: 1.4 }}>
                  I confirm that my institution / department head has been notified of this application and will provide an official No Objection Certificate (NOC) upon formal selection.
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{ padding: '8px 16px', background: '#ffffff', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontWeight: 700, color: '#475569', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !hasNocEndorsement}
                  style={{
                    padding: '8px 22px',
                    background: submitting || !hasNocEndorsement ? '#94a3b8' : '#1c2d81',
                    color: '#fed601',
                    border: 'none',
                    fontSize: '0.84rem',
                    fontWeight: 900,
                    cursor: submitting || !hasNocEndorsement ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {submitting ? 'Submitting Proposal...' : 'Submit Academic Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
