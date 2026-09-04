import type { TaxonomySkill } from '../types/taxonomy';
import type { StudentSkill } from '../types/studentProfile';

export interface RecommendedSkillItem {
  skill: TaxonomySkill;
  score: number;
  reason: string;
  synergyTag: string;
  domain: string;
}

export interface RecommendationResult {
  primaryFocus: string;
  secondaryFocus?: string;
  focusSummary: string;
  recommendedSkills: RecommendedSkillItem[];
}

type TechDomain =
  | 'frontend'
  | 'backend'
  | 'database'
  | 'cloud_devops'
  | 'dsa_core'
  | 'ai_ml'
  | 'mobile'
  | 'cybersecurity';

interface DomainConfig {
  id: TechDomain;
  label: string;
  keywords: string[];
  companionDomains: TechDomain[];
}

const DOMAINS: DomainConfig[] = [
  {
    id: 'frontend',
    label: 'Frontend Engineering',
    keywords: [
      'react', 'react.js', 'reactjs', 'typescript', 'javascript', 'next.js', 'nextjs',
      'vue', 'vue.js', 'angular', 'tailwind', 'tailwind css', 'redux', 'html', 'css',
      'svelte', 'ui/ux', 'ui / ux', 'web development', 'frontend', 'sass', 'css3', 'html5',
      'vite', 'webpack'
    ],
    companionDomains: ['backend', 'database', 'cloud_devops'],
  },
  {
    id: 'backend',
    label: 'Backend & Systems',
    keywords: [
      'java', 'spring', 'spring boot', 'node.js', 'nodejs', 'python', 'go', 'golang',
      'c#', 'c++', 'c', 'express', 'express.js', 'fastapi', 'django', 'nestjs', 'asp.net',
      'aspnet', 'php', 'laravel', 'ruby', 'rails', 'rest api', 'restapi', 'graphql',
      'microservices', 'backend', 'grpc', 'kafka', 'redis', 'system design'
    ],
    companionDomains: ['database', 'cloud_devops', 'frontend', 'dsa_core'],
  },
  {
    id: 'database',
    label: 'Database & Data Tier',
    keywords: [
      'postgresql', 'postgres', 'mysql', 'mongodb', 'redis', 'sqlite', 'sql',
      'cassandra', 'dynamodb', 'elasticsearch', 'database', 'rdbms', 'nosql', 'mariadb'
    ],
    companionDomains: ['backend', 'cloud_devops'],
  },
  {
    id: 'cloud_devops',
    label: 'Cloud & DevOps',
    keywords: [
      'docker', 'kubernetes', 'aws', 'amazon web services', 'azure', 'gcp', 'google cloud',
      'git', 'github', 'ci/cd', 'cicd', 'linux', 'terraform', 'devops', 'cloud', 'nginx',
      'ansible', 'jenkins', 'cloud computing', 'digitalocean', 'heroku'
    ],
    companionDomains: ['backend', 'database', 'cybersecurity'],
  },
  {
    id: 'dsa_core',
    label: 'CS Fundamentals & Architecture',
    keywords: [
      'data structures', 'algorithms', 'data structures & algorithms', 'dsa', 'oop',
      'object oriented programming', 'system design', 'operating systems', 'computer networks',
      'software engineering', 'computer science fundamentals'
    ],
    companionDomains: ['backend', 'frontend'],
  },
  {
    id: 'ai_ml',
    label: 'AI & Machine Learning',
    keywords: [
      'machine learning', 'deep learning', 'ai', 'artificial intelligence', 'pytorch',
      'tensorflow', 'scikit-learn', 'scikitlearn', 'nlp', 'natural language processing',
      'computer vision', 'data science', 'pandas', 'numpy', 'keras', 'llm', 'matlab'
    ],
    companionDomains: ['backend', 'database'],
  },
  {
    id: 'mobile',
    label: 'Mobile Development',
    keywords: [
      'android', 'ios', 'react native', 'flutter', 'kotlin', 'swift', 'mobile',
      'dart', 'xamarin'
    ],
    companionDomains: ['frontend', 'backend'],
  },
  {
    id: 'cybersecurity',
    label: 'Cybersecurity & Infrastructure',
    keywords: [
      'cybersecurity', 'metasploit', 'nmap', 'ethical hacking', 'network security',
      'cryptography', 'penetration testing', 'security'
    ],
    companionDomains: ['cloud_devops', 'backend'],
  },
];

interface SynergyRule {
  targetSkills: string[];
  boost: number;
  reason: string;
  tag: string;
}

const SPECIFIC_SYNERGIES: Record<string, SynergyRule[]> = {
  'react': [
    { targetSkills: ['next.js', 'nextjs'], boost: 45, reason: 'Leading production SSR framework for React developers', tag: 'React Progression' },
    { targetSkills: ['typescript'], boost: 40, reason: 'Industry requirement for enterprise type-safe React apps', tag: 'Essential Pair' },
    { targetSkills: ['tailwind', 'tailwind css'], boost: 35, reason: 'Modern utility-first styling for fast React development', tag: 'Modern Styling' },
    { targetSkills: ['redux', 'zustand'], boost: 30, reason: 'Complex state management for enterprise React frontends', tag: 'State Architecture' },
    { targetSkills: ['graphql'], boost: 30, reason: 'Declarative data fetching tailored for modern React UIs', tag: 'API Modernization' },
    { targetSkills: ['node.js', 'nodejs'], boost: 28, reason: 'Expands your React expertise into full-stack development', tag: 'Full-Stack Leap' },
  ],
  'typescript': [
    { targetSkills: ['react'], boost: 40, reason: 'Dominant UI library built and maintained with TypeScript', tag: 'Frontend Synergy' },
    { targetSkills: ['next.js', 'nextjs'], boost: 40, reason: 'Fullstack React framework built on top of TypeScript', tag: 'Modern Fullstack' },
    { targetSkills: ['nestjs'], boost: 35, reason: 'Enterprise backend framework built exclusively for TypeScript', tag: 'Type-Safe Backend' },
    { targetSkills: ['node.js', 'nodejs'], boost: 30, reason: 'The runtime foundation for server-side TypeScript', tag: 'Runtime Base' },
  ],
  'node.js': [
    { targetSkills: ['express.js', 'expressjs', 'express'], boost: 40, reason: 'De-facto lightweight routing and middleware framework for Node.js', tag: 'Core Framework' },
    { targetSkills: ['nestjs'], boost: 38, reason: 'Scalable enterprise microservice architecture for Node.js', tag: 'Enterprise Node' },
    { targetSkills: ['typescript'], boost: 35, reason: 'Type safety and maintainability for large Node codebases', tag: 'Type Safety' },
    { targetSkills: ['postgresql', 'mongodb'], boost: 30, reason: 'High-performance storage tier for Node.js backend services', tag: 'Data Persistence' },
    { targetSkills: ['docker'], boost: 28, reason: 'Containerize and package Node.js microservices for deployment', tag: 'Containerization' },
  ],
  'java': [
    { targetSkills: ['spring boot', 'spring'], boost: 45, reason: 'Industry-standard enterprise microservices framework for Java', tag: 'Standard Framework' },
    { targetSkills: ['microservices'], boost: 38, reason: 'Essential distributed system pattern for Java developers', tag: 'Architecture' },
    { targetSkills: ['postgresql', 'mysql'], boost: 32, reason: 'Relational database backing production Java applications', tag: 'Database Tier' },
    { targetSkills: ['redis'], boost: 30, reason: 'Distributed caching to accelerate Java backend throughput', tag: 'High Performance' },
    { targetSkills: ['docker'], boost: 28, reason: 'Containerize Java virtual machine workloads for cloud environments', tag: 'Cloud Packaging' },
    { targetSkills: ['system design'], boost: 28, reason: 'Design scalable distributed systems for Senior SDE interviews', tag: 'SDE Interview' },
  ],
  'spring boot': [
    { targetSkills: ['microservices'], boost: 45, reason: 'Enterprise cloud microservice architecture built on Spring', tag: 'Microservices' },
    { targetSkills: ['redis'], boost: 38, reason: 'Low-latency in-memory cache and session management for Spring', tag: 'Caching' },
    { targetSkills: ['docker'], boost: 35, reason: 'Deploy Spring Boot containers across Kubernetes clusters', tag: 'Cloud Deployment' },
    { targetSkills: ['system design'], boost: 32, reason: 'High-scale distributed systems and resilient service design', tag: 'System Architecture' },
    { targetSkills: ['postgresql'], boost: 28, reason: 'ACID-compliant relational database for Spring Data JPA', tag: 'Data Tier' },
  ],
  'python': [
    { targetSkills: ['fastapi'], boost: 42, reason: 'Blazing fast async REST and GraphQL framework for Python', tag: 'Modern Async API' },
    { targetSkills: ['django'], boost: 35, reason: 'Batteries-included full-stack framework for rapid Python apps', tag: 'Web Framework' },
    { targetSkills: ['machine learning', 'scikit-learn'], boost: 40, reason: 'High-demand AI & data science algorithms built on Python', tag: 'AI Specialization' },
    { targetSkills: ['pytorch'], boost: 36, reason: 'State-of-the-art deep learning and LLM development in Python', tag: 'Deep Learning' },
    { targetSkills: ['data structures & algorithms', 'dsa'], boost: 30, reason: 'Clean interview problem solving and algorithmic analysis', tag: 'SDE Assessment' },
  ],
  'docker': [
    { targetSkills: ['kubernetes'], boost: 48, reason: 'De-facto container orchestration for scaling Docker containers', tag: 'Orchestration' },
    { targetSkills: ['aws', 'cloud'], boost: 38, reason: 'Deploy and manage containerized workloads in the cloud', tag: 'Cloud Infrastructure' },
    { targetSkills: ['ci/cd', 'cicd'], boost: 35, reason: 'Automate build, test, and container push pipelines', tag: 'Pipeline Automation' },
    { targetSkills: ['linux'], boost: 30, reason: 'Foundational kernel and system administration for containers', tag: 'OS Foundation' },
  ],
  'aws': [
    { targetSkills: ['docker', 'kubernetes'], boost: 45, reason: 'Run modern containerized applications across AWS ECS and EKS', tag: 'Cloud Containers' },
    { targetSkills: ['terraform'], boost: 38, reason: 'Automate and version your AWS cloud architecture with code', tag: 'Infrastructure as Code' },
    { targetSkills: ['system design'], boost: 35, reason: 'Architect fault-tolerant, multi-region cloud services', tag: 'Cloud Architecture' },
    { targetSkills: ['ci/cd'], boost: 30, reason: 'Continuous deployment of cloud-native microservices', tag: 'DevOps' },
  ],
  'postgresql': [
    { targetSkills: ['redis'], boost: 40, reason: 'Offload query pressure with sub-millisecond caching', tag: 'Cache Layer' },
    { targetSkills: ['system design'], boost: 35, reason: 'Master sharding, replication, and indexing trade-offs', tag: 'Scalability' },
    { targetSkills: ['mongodb'], boost: 28, reason: 'Expand versatility with document-oriented NoSQL databases', tag: 'Polyglot Storage' },
  ],
  'git': [
    { targetSkills: ['ci/cd'], boost: 35, reason: 'Trigger automated CI/CD builds on every pull request', tag: 'Automation' },
    { targetSkills: ['docker'], boost: 28, reason: 'Standardize environments across team Git workflows', tag: 'Dev Workflow' },
  ],
};

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function findDomainForSkill(skillName: string): TechDomain | null {
  const norm = normalizeName(skillName);
  for (const domain of DOMAINS) {
    for (const kw of domain.keywords) {
      const normKw = normalizeName(kw);
      if (norm === normKw || norm.includes(normKw) || normKw.includes(norm)) {
        return domain.id;
      }
    }
  }
  return null;
}

export function computeSkillRecommendations(
  topSkills: StudentSkill[],
  learningSkills: Array<{ id?: string; skillId?: string; skillName: string }>,
  allSkills: TaxonomySkill[],
  limit = 8
): RecommendationResult {
  // 1. Compile existing skills to exclude
  const existingNormalizedNames = new Set<string>();
  const existingSkillIds = new Set<string>();

  topSkills.forEach(s => {
    if (s.skillName) existingNormalizedNames.add(normalizeName(s.skillName));
    if ((s as any).skillId) existingSkillIds.add((s as any).skillId);
  });

  learningSkills.forEach(s => {
    if (s.skillName) existingNormalizedNames.add(normalizeName(s.skillName));
    if (s.skillId) existingSkillIds.add(s.skillId);
  });

  // 2. Score student's interest in domains based on Top Skills & Learning Skills
  const domainScores: Record<TechDomain, number> = {
    frontend: 0,
    backend: 0,
    database: 0,
    cloud_devops: 0,
    dsa_core: 0,
    ai_ml: 0,
    mobile: 0,
    cybersecurity: 0,
  };

  topSkills.forEach(skill => {
    const domain = findDomainForSkill(skill.skillName);
    if (domain) {
      let weight = 2; // Default INTERMEDIATE
      if (skill.proficiency === 'EXPERT') weight = 4;
      else if (skill.proficiency === 'ADVANCED') weight = 3;
      else if (skill.proficiency === 'BEGINNER') weight = 1.5;
      domainScores[domain] += weight;
    }
  });

  learningSkills.forEach(skill => {
    const domain = findDomainForSkill(skill.skillName);
    if (domain) {
      domainScores[domain] += 2.5; // High signal because student actively enrolled
    }
  });

  // Rank domains by student interest
  const rankedDomains = (Object.keys(domainScores) as TechDomain[])
    .filter(d => domainScores[d] > 0)
    .sort((a, b) => domainScores[b] - domainScores[a]);

  const hasSkills = topSkills.length > 0 || learningSkills.length > 0;
  const primaryDomainId = rankedDomains[0] || 'backend';
  const secondaryDomainId = rankedDomains[1];

  const primaryDomainConfig = DOMAINS.find(d => d.id === primaryDomainId);
  const secondaryDomainConfig = secondaryDomainId ? DOMAINS.find(d => d.id === secondaryDomainId) : null;

  let primaryFocus = primaryDomainConfig ? primaryDomainConfig.label : 'General Software Engineering';
  let focusSummary = 'Curated skills matching your active technologies and career trajectories';

  if (hasSkills) {
    if (domainScores.frontend >= 3 && domainScores.backend >= 3) {
      primaryFocus = 'Full-Stack Architecture & Cloud';
      focusSummary = 'Tailored for engineers combining modern web frontends with robust backend microservices';
    } else if (rankedDomains[0] === 'frontend') {
      primaryFocus = 'Frontend Architecture & Modern Web';
      focusSummary = 'Prioritizing advanced UI frameworks, styling ecosystems, and complementary full-stack capabilities';
    } else if (rankedDomains[0] === 'backend') {
      primaryFocus = 'Backend Systems & Microservices';
      focusSummary = 'Prioritizing high-throughput distributed systems, caching tiers, and cloud orchestration';
    } else if (rankedDomains[0] === 'cloud_devops') {
      primaryFocus = 'Cloud Architecture & DevOps';
      focusSummary = 'Prioritizing container orchestration, automated delivery pipelines, and cloud systems';
    } else if (rankedDomains[0] === 'ai_ml') {
      primaryFocus = 'AI Engineering & Machine Learning';
      focusSummary = 'Prioritizing neural networks, model training frameworks, and data pipelines';
    }
  } else {
    primaryFocus = 'Core Software Engineering';
    focusSummary = 'Essential foundational technologies to accelerate your technical interview and platform readiness';
  }

  // 3. Filter Candidate Skills: exclude already owned/enrolled skills
  const candidates = allSkills.filter(skill => {
    if (existingSkillIds.has(skill.id)) return false;
    const norm = normalizeName(skill.name);
    if (existingNormalizedNames.has(norm)) return false;
    return true;
  });

  // 4. Score Candidate Skills
  const scoredSkills: RecommendedSkillItem[] = [];

  for (const candidate of candidates) {
    const candidateNorm = normalizeName(candidate.name);
    const candidateDomain = findDomainForSkill(candidate.name) ||
      (candidate.category ? findDomainForSkill(typeof candidate.category === 'string' ? candidate.category : '') : null) ||
      'backend';

    let totalScore = 0;
    let matchReason = '';
    let synergyTag = 'Recommended';

    // A. Domain Relevance Score
    if (hasSkills) {
      if (candidateDomain === primaryDomainId) {
        // High priority: student is most interested in this domain!
        totalScore += 50;
        matchReason = `Matches your core focus in ${primaryDomainConfig?.label || 'this area'}`;
        synergyTag = 'Core Path';
      } else if (secondaryDomainId && candidateDomain === secondaryDomainId) {
        // Secondary priority
        totalScore += 35;
        matchReason = `Complements your ${secondaryDomainConfig?.label || 'secondary stack'}`;
        synergyTag = 'Complementary';
      } else if (primaryDomainConfig?.companionDomains.includes(candidateDomain)) {
        // Natural companion domain (e.g. Frontend -> Backend, or Backend -> Cloud)
        totalScore += 25;
        matchReason = `Natural next milestone for your engineering stack`;
        synergyTag = 'Expansion';
      } else {
        totalScore += 10;
        matchReason = `Expands your technical versatility across the engineering matrix`;
        synergyTag = 'New Domain';
      }
    } else {
      // Fallback for students with 0 skills: prioritize DSA, Python, Git, React, Java
      if (['datastructuresalgorithms', 'dsa', 'python', 'git', 'react', 'java', 'sql', 'postgresql'].includes(candidateNorm)) {
        totalScore += 80;
        matchReason = 'Essential software engineering foundation recommended for all developers';
        synergyTag = 'Foundational';
      } else {
        totalScore += 15;
        matchReason = 'High-demand industry technology';
        synergyTag = 'Skill Path';
      }
    }

    // B. Direct Companion Synergies with Student's Specific Top Skills
    if (hasSkills) {
      for (const studentSkill of topSkills) {
        const studentNorm = normalizeName(studentSkill.skillName);
        const rules = SPECIFIC_SYNERGIES[studentNorm];
        if (rules) {
          for (const rule of rules) {
            const matchesTarget = rule.targetSkills.some(t => {
              const targetNorm = normalizeName(t);
              return candidateNorm === targetNorm || candidateNorm.includes(targetNorm) || targetNorm.includes(candidateNorm);
            });
            if (matchesTarget) {
              totalScore += rule.boost;
              matchReason = `${rule.reason} (based on your ${studentSkill.skillName} skill)`;
              synergyTag = rule.tag;
            }
          }
        }
      }
    }

    // C. General System Design & DSA Bonus (Critical for every SDE interview)
    if (['systemdesign', 'datastructuresalgorithms', 'dsa', 'oop'].includes(candidateNorm)) {
      totalScore += 15;
      if (!matchReason.includes('interview')) {
        matchReason = `${matchReason} & critical for SDE coding assessments`;
      }
    }

    scoredSkills.push({
      skill: candidate,
      score: totalScore,
      reason: matchReason,
      synergyTag,
      domain: candidateDomain,
    });
  }

  // 5. Sort by score descending and return top candidates
  scoredSkills.sort((a, b) => b.score - a.score);

  return {
    primaryFocus,
    secondaryFocus: secondaryDomainConfig?.label,
    focusSummary,
    recommendedSkills: scoredSkills.slice(0, limit),
  };
}
