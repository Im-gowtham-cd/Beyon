import { useState } from 'react';
import {
  BookOpen,
  Search,
  Sparkles,
  TrendingUp,
  Award,
  Layers,
  Download,
  FileCheck2,
  ChevronRight,
  X,
  ShieldCheck,
  Brain,
  Code2,
  Server,
  Shield,
} from 'lucide-react';
import styles from './InstitutionCurriculumPage.module.css';

interface CurriculumSkill {
  id: string;
  name: string;
  category: string;
  domain: string;
  description: string;
  industryDemand: 'HIGH' | 'VERY_HIGH' | 'MEDIUM' | 'LOW';
  avgSalaryRange: string;
  syllabusMapping: 'CORE_SEMESTER_COURSE' | 'RECOMMENDED_ELECTIVE' | 'INDUSTRY_ADDON' | 'LAB_PROJECT';
  semesterMapped: string;
  assessmentQuestionsCount: number;
  gapStatus: 'ALIGNED' | 'NEEDS_UPGRADE' | 'GAP_DETECTED';
}

export function InstitutionCurriculumPage() {
  const [domain, setDomain] = useState<string>('CSE');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSkill, setSelectedSkill] = useState<CurriculumSkill | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const skillsData: Record<string, CurriculumSkill[]> = {
    CSE: [
      {
        id: 'sk-cse-1',
        name: 'Data Structures & Algorithmic Complexity',
        category: 'Algorithms & Core Computing',
        domain: 'Computer Science & Engineering',
        description: 'Advanced trees, graphs, dynamic programming, topological sort, amortized analysis, and memory optimization in C++ & Java.',
        industryDemand: 'VERY_HIGH',
        avgSalaryRange: '₹14 - 32 LPA',
        syllabusMapping: 'CORE_SEMESTER_COURSE',
        semesterMapped: 'Semester 3 (CS201)',
        assessmentQuestionsCount: 142,
        gapStatus: 'ALIGNED',
      },
      {
        id: 'sk-cse-2',
        name: 'Distributed Systems & Microservices Architecture',
        category: 'System Design & Infrastructure',
        domain: 'Computer Science & Engineering',
        description: 'CAP Theorem, consensus protocols (Raft), message queues (Kafka, RabbitMQ), gRPC communication, and containerized orchestration.',
        industryDemand: 'VERY_HIGH',
        avgSalaryRange: '₹18 - 38 LPA',
        syllabusMapping: 'INDUSTRY_ADDON',
        semesterMapped: 'Recommended 7th Sem Elective',
        assessmentQuestionsCount: 88,
        gapStatus: 'NEEDS_UPGRADE',
      },
      {
        id: 'sk-cse-3',
        name: 'Database Internals, Indexing & Distributed SQL',
        category: 'Data Engineering & Persistence',
        domain: 'Computer Science & Engineering',
        description: 'B+ Tree indexing, query planner optimizations, ACID isolation levels (MVCC), Dolt versioning, and sharded MySQL architecture.',
        industryDemand: 'HIGH',
        avgSalaryRange: '₹12 - 28 LPA',
        syllabusMapping: 'CORE_SEMESTER_COURSE',
        semesterMapped: 'Semester 4 (CS402)',
        assessmentQuestionsCount: 96,
        gapStatus: 'ALIGNED',
      },
      {
        id: 'sk-cse-4',
        name: 'Operating System Kernel & Memory Virtualization',
        category: 'Systems & Runtime',
        domain: 'Computer Science & Engineering',
        description: 'Process scheduling, POSIX threads, virtual memory paging, page replacement algorithms, and deadlock resolution.',
        industryDemand: 'HIGH',
        avgSalaryRange: '₹12 - 24 LPA',
        syllabusMapping: 'CORE_SEMESTER_COURSE',
        semesterMapped: 'Semester 4 (CS401)',
        assessmentQuestionsCount: 74,
        gapStatus: 'ALIGNED',
      },
      {
        id: 'sk-cse-5',
        name: 'Compiler Design & AST Code Generation',
        category: 'Theoretical Computer Science',
        domain: 'Computer Science & Engineering',
        description: 'Lexical analysis, LR parsing, intermediate representations, register allocation, and LLVM toolchain.',
        industryDemand: 'MEDIUM',
        avgSalaryRange: '₹10 - 22 LPA',
        syllabusMapping: 'CORE_SEMESTER_COURSE',
        semesterMapped: 'Semester 6 (CS602)',
        assessmentQuestionsCount: 52,
        gapStatus: 'ALIGNED',
      },
    ],
    AI: [
      {
        id: 'sk-ai-1',
        name: 'Deep Learning & Transformer Architectures (LLMs)',
        category: 'Artificial Intelligence & Neural Nets',
        domain: 'Artificial Intelligence & Data Science',
        description: 'Self-attention mechanisms, multi-head attention, PyTorch distributed training, LoRA fine-tuning, and quantized model deployment.',
        industryDemand: 'VERY_HIGH',
        avgSalaryRange: '₹20 - 45 LPA',
        syllabusMapping: 'RECOMMENDED_ELECTIVE',
        semesterMapped: 'Semester 6 (AI603)',
        assessmentQuestionsCount: 110,
        gapStatus: 'NEEDS_UPGRADE',
      },
      {
        id: 'sk-ai-2',
        name: 'Retrieval-Augmented Generation (RAG) & Vector DBs',
        category: 'Generative AI & Search',
        domain: 'Artificial Intelligence & Data Science',
        description: 'Dense embeddings, HNSW vector indexing (pgvector, Milvus), hybrid semantic search, chunking strategies, and re-ranking pipelines.',
        industryDemand: 'VERY_HIGH',
        avgSalaryRange: '₹18 - 40 LPA',
        syllabusMapping: 'INDUSTRY_ADDON',
        semesterMapped: 'Industry Add-on Module',
        assessmentQuestionsCount: 64,
        gapStatus: 'GAP_DETECTED',
      },
      {
        id: 'sk-ai-3',
        name: 'Computer Vision & Real-Time Object Detection',
        category: 'Vision Intelligence',
        domain: 'Artificial Intelligence & Data Science',
        description: 'CNN architectures, YOLOv8/v10 inference, OpenCV video stream pipelines, image segmentation, and edge AI deployment.',
        industryDemand: 'HIGH',
        avgSalaryRange: '₹14 - 30 LPA',
        syllabusMapping: 'CORE_SEMESTER_COURSE',
        semesterMapped: 'Semester 5 (AI502)',
        assessmentQuestionsCount: 82,
        gapStatus: 'ALIGNED',
      },
      {
        id: 'sk-ai-4',
        name: 'Feature Engineering & Classical Statistical ML',
        category: 'Applied Machine Learning',
        domain: 'Artificial Intelligence & Data Science',
        description: 'Random Forests, XGBoost, PCA dimensionality reduction, cross-validation tuning, and Scikit-Learn pipelines.',
        industryDemand: 'HIGH',
        avgSalaryRange: '₹12 - 25 LPA',
        syllabusMapping: 'CORE_SEMESTER_COURSE',
        semesterMapped: 'Semester 4 (AI401)',
        assessmentQuestionsCount: 95,
        gapStatus: 'ALIGNED',
      },
    ],
    CLOUD: [
      {
        id: 'sk-cld-1',
        name: 'Kubernetes Cluster Administration & GitOps',
        category: 'Cloud Native & Orchestration',
        domain: 'Cloud & DevOps Infrastructure',
        description: 'Kubelet architectures, ingress controllers, Helm charts, ArgoCD automated deployment, and pod autoscaling policies.',
        industryDemand: 'VERY_HIGH',
        avgSalaryRange: '₹16 - 36 LPA',
        syllabusMapping: 'RECOMMENDED_ELECTIVE',
        semesterMapped: 'Semester 7 (IT702)',
        assessmentQuestionsCount: 78,
        gapStatus: 'NEEDS_UPGRADE',
      },
      {
        id: 'sk-cld-2',
        name: 'Infrastructure as Code (Terraform & AWS CDK)',
        category: 'Automated Provisioning',
        domain: 'Cloud & DevOps Infrastructure',
        description: 'Declarative state files, multi-region VPC topologies, IAM security policies, and CI/CD automated cloud runners.',
        industryDemand: 'HIGH',
        avgSalaryRange: '₹14 - 30 LPA',
        syllabusMapping: 'INDUSTRY_ADDON',
        semesterMapped: 'Industry Add-on Module',
        assessmentQuestionsCount: 58,
        gapStatus: 'GAP_DETECTED',
      },
      {
        id: 'sk-cld-3',
        name: 'Cloud Networking, VPC Peering & DNS Routing',
        category: 'Enterprise Cloud',
        domain: 'Cloud & DevOps Infrastructure',
        description: 'Subnet CIDR partitioning, NAT gateways, route tables, load balancer SSL termination, and Cloudflare CDN caching.',
        industryDemand: 'HIGH',
        avgSalaryRange: '₹12 - 26 LPA',
        syllabusMapping: 'CORE_SEMESTER_COURSE',
        semesterMapped: 'Semester 5 (IT504)',
        assessmentQuestionsCount: 67,
        gapStatus: 'ALIGNED',
      },
    ],
    SECURITY: [
      {
        id: 'sk-sec-1',
        name: 'Zero-Trust Authentication & OAuth2 / OpenID Connect',
        category: 'Application Security',
        domain: 'Cyber Security & Cryptography',
        description: 'JWT validation, cryptographic signatures (RS256), PKCE authorization flows, IDOR mitigation, and Spring Security filters.',
        industryDemand: 'VERY_HIGH',
        avgSalaryRange: '₹16 - 35 LPA',
        syllabusMapping: 'CORE_SEMESTER_COURSE',
        semesterMapped: 'Semester 6 (CS604)',
        assessmentQuestionsCount: 84,
        gapStatus: 'ALIGNED',
      },
      {
        id: 'sk-sec-2',
        name: 'Network Penetration Testing & Web Vulnerability Audits',
        category: 'Offensive Security & Red Teaming',
        domain: 'Cyber Security & Cryptography',
        description: 'OWASP Top 10 vulnerabilities, SQL injection prevention, XSS/CSRF exploits, Burp Suite intercepting, and CVE scanning.',
        industryDemand: 'HIGH',
        avgSalaryRange: '₹14 - 32 LPA',
        syllabusMapping: 'RECOMMENDED_ELECTIVE',
        semesterMapped: 'Semester 7 (CS705)',
        assessmentQuestionsCount: 72,
        gapStatus: 'ALIGNED',
      },
    ],
  };

  const currentSkills = skillsData[domain] || skillsData.CSE;

  const filteredSkills = currentSkills.filter((s) => {
    return (
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.semesterMapped.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleExportGapReport = () => {
    setToastMsg('Generating NAAC / AICTE Curriculum Alignment & Skill Gap Report (PDF)...');
    setTimeout(() => {
      setToastMsg('Curriculum Gap Report exported successfully for Academic Council review.');
      setTimeout(() => setToastMsg(null), 4000);
    }, 1500);
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <span className={styles.sectionTag}>
            <BookOpen size={13} />
            <span>Academic Council &amp; Industry Alignment Matrix</span>
          </span>
          <h1 className={styles.title}>Academic Curriculum &amp; Industry Skill Taxonomy</h1>
          <p className={styles.subtitle}>
            Benchmark campus engineering syllabus against top corporate hiring assessments and discover real-time skill demand.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button className={styles.btnSecondary} onClick={() => alert('Syncing live industry taxonomy updates from Dolt DB...')}>
            <Sparkles size={14} style={{ color: '#d97706' }} />
            <span>Sync Industry Taxonomy</span>
          </button>
          <button className={styles.btnPrimary} onClick={handleExportGapReport}>
            <FileCheck2 size={14} />
            <span>Export Syllabus Gap Report</span>
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {toastMsg && (
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#15803d',
            padding: '12px 18px',
            fontSize: '0.84rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ShieldCheck size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 4 Stats Cards */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statCardTop}>
            <span className={styles.statLabel}>Tracked Competencies</span>
            <div className={styles.statIcon} style={{ color: '#1c2d81' }}>
              <Layers size={16} />
            </div>
          </div>
          <span className={styles.statValue} style={{ color: '#1c2d81' }}>
            420 Skills
          </span>
          <span className={styles.statSubtext}>Across 5 engineering disciplines</span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardTop}>
            <span className={styles.statLabel}>High Demand Skills</span>
            <div className={styles.statIcon} style={{ color: '#15803d', background: '#f0fdf4' }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <span className={styles.statValue} style={{ color: '#15803d' }}>
            154 Units
          </span>
          <span className={styles.statSubtext}>Critical hiring demand in Tier-1 firms</span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardTop}>
            <span className={styles.statLabel}>Curriculum Alignment</span>
            <div className={styles.statIcon} style={{ color: '#0284c7', background: '#f0f9ff' }}>
              <Award size={16} />
            </div>
          </div>
          <span className={styles.statValue} style={{ color: '#0284c7' }}>
            88.4% Match
          </span>
          <span className={styles.statSubtext}>AICTE Model Syllabus benchmark</span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardTop}>
            <span className={styles.statLabel}>Avg Industry CTC Anchor</span>
            <div className={styles.statIcon} style={{ color: '#b45309', background: '#fef3c7' }}>
              <Brain size={16} />
            </div>
          </div>
          <span className={styles.statValue} style={{ color: '#b45309' }}>
            ₹18.5 LPA
          </span>
          <span className={styles.statSubtext}>Median package for top aligned skills</span>
        </div>
      </div>

      {/* Domain Selection Tabs */}
      <div className={styles.domainBar}>
        {[
          { key: 'CSE', label: 'Computer Science & Engg', icon: Code2 },
          { key: 'AI', label: 'AI & Data Science', icon: Brain },
          { key: 'CLOUD', label: 'Cloud & DevOps Systems', icon: Server },
          { key: 'SECURITY', label: 'Cyber Security & Cryptography', icon: Shield },
        ].map((d) => {
          const Icon = d.icon;
          return (
            <button
              key={d.key}
              className={`${styles.domainChip} ${domain === d.key ? styles.domainActive : ''}`}
              onClick={() => setDomain(d.key)}
            >
              <Icon size={14} />
              <span>{d.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Skills List + Sidebar Analysis */}
      <div className={styles.layoutGrid}>
        {/* Left Column: Skills Nodes */}
        <div className={styles.skillsCard}>
          <div className={styles.searchHeader}>
            <div className={styles.searchWrapper}>
              <Search size={14} className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search skills, course codes, syllabus mappings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
              Showing {filteredSkills.length} competencies
            </span>
          </div>

          <div className={styles.skillNodesList}>
            {filteredSkills.map((s) => (
              <div key={s.id} className={styles.skillNode} onClick={() => setSelectedSkill(s)}>
                <div className={styles.skillNodeLeft}>
                  <span className={styles.skillCategoryTag}>{s.category}</span>
                  <h3 className={styles.skillName}>{s.name}</h3>
                  <p className={styles.skillDesc}>{s.description}</p>

                  <div className={styles.skillNodeMeta}>
                    <span
                      className={`${styles.demandTag} ${
                        s.industryDemand === 'VERY_HIGH' || s.industryDemand === 'HIGH'
                          ? styles.demandHigh
                          : s.industryDemand === 'MEDIUM'
                          ? styles.demandMedium
                          : styles.demandLow
                      }`}
                    >
                      {s.industryDemand.replace('_', ' ')} DEMAND
                    </span>

                    <span className={styles.salaryPill}>Avg CTC: {s.avgSalaryRange}</span>

                    <span className={styles.syllabusStatusPill}>
                      📚 {s.semesterMapped}
                    </span>

                    <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                      ⚡ {s.assessmentQuestionsCount} Questions Linked
                    </span>
                  </div>
                </div>

                <ChevronRight size={18} style={{ color: '#94a3b8', flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar: Department Syllabus Audit */}
        <div className={styles.sidebarCard}>
          <h3 className={styles.sidebarTitle}>
            <Award size={18} style={{ color: '#1c2d81' }} />
            <span>Syllabus Gap Breakdown</span>
          </h3>

          <div className={styles.gapItem}>
            <div className={styles.gapItemTop}>
              <span>Core Algorithms &amp; DS</span>
              <span className={styles.gapScore}>96% Aligned</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: '96%', background: '#15803d' }} />
            </div>
          </div>

          <div className={styles.gapItem}>
            <div className={styles.gapItemTop}>
              <span>Distributed Systems &amp; Kafka</span>
              <span className={`${styles.gapScore} ${styles.gapScoreWarning}`}>64% (Elective Gap)</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: '64%', background: '#b45309' }} />
            </div>
          </div>

          <div className={styles.gapItem}>
            <div className={styles.gapItemTop}>
              <span>Generative AI &amp; LLM RAG</span>
              <span className={`${styles.gapScore} ${styles.gapScoreWarning}`}>52% (Add-on Gap)</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: '52%', background: '#dc2626' }} />
            </div>
          </div>

          <div className={styles.gapItem}>
            <div className={styles.gapItemTop}>
              <span>Database MVCC &amp; SQL</span>
              <span className={styles.gapScore}>91% Aligned</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: '91%', background: '#15803d' }} />
            </div>
          </div>

          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px', fontSize: '0.78rem', color: '#1e3a8a', lineHeight: 1.5 }}>
            <strong>💡 Placement Office Recommendation:</strong>
            <div style={{ marginTop: '4px' }}>
              Incorporate <em>RAG &amp; Vector Databases</em> as an official 6th-semester micro-credit course to boost Tier-1 corporate shortlist rates by an estimated +22%.
            </div>
          </div>
        </div>
      </div>

      {/* Skill Detail Modal */}
      {selectedSkill && (
        <div className={styles.modalOverlay} onClick={() => setSelectedSkill(null)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.sectionTag}>{selectedSkill.category}</span>
                <h3 className={styles.modalTitle}>{selectedSkill.name}</h3>
              </div>
              <button className={styles.modalClose} onClick={() => setSelectedSkill(null)}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div>
                <h4 style={{ margin: '0 0 6px', fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                  Industry Competency Description
                </h4>
                <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
                  {selectedSkill.description}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '14px', border: '1px solid #e2e8f0' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Industry Demand</span>
                  <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#15803d' }}>
                    {selectedSkill.industryDemand.replace('_', ' ')}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Market CTC Benchmark</span>
                  <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#1c2d81' }}>
                    {selectedSkill.avgSalaryRange}
                  </div>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Academic Mapping</span>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                    {selectedSkill.semesterMapped} ({selectedSkill.syllabusMapping.replace(/_/g, ' ')})
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ margin: '0 0 6px', fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                  Corporate Hiring Test Alignment
                </h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569' }}>
                  This competency is actively tested in <strong>{selectedSkill.assessmentQuestionsCount}</strong> verified technical questions used by enterprise partners including Microsoft, Amazon, Google, and Cisco.
                </p>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnPrimary}
                onClick={() => {
                  alert(`Exporting syllabus alignment recommendations for ${selectedSkill.name}...`);
                }}
              >
                <Download size={14} />
                <span>Export Module Syllabus (PDF)</span>
              </button>
              <button className={styles.btnSecondary} onClick={() => setSelectedSkill(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
