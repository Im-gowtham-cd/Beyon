import type { TaxonomySkill } from '../types/taxonomy';
import type { StudentSkill } from '../types/studentProfile';

export interface RecommendedSkillItem {
  skill: TaxonomySkill;
  score: number;
  reason: string;
  synergyTag: string;
  domain: string;
  companyMatch?: string;
  roleRelevance?: string;
  unblockedDrives?: string[];
}

export interface RecommendationOptions {
  targetJobRole?: string;
  targetCompany?: string;
  assessmentScores?: Record<string, number>;
  blockedDrives?: Array<{ title: string; packageLpa?: number; missingSkills?: string[] | string }>;
  weakConcepts?: Array<{ skillName: string; conceptTitle?: string; whyStruggled?: string }>;
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

/**
 * Robust skill equality and bounded token matching.
 * Never matches short tokens (<= 3 chars like 'c', 'r', 'go', 'cpp', 'sql', 'php', 'aws')
 * as arbitrary substrings of other words!
 */
export function isSkillMatch(candidateNorm: string, target: string): boolean {
  const targetNorm = normalizeName(target);
  if (candidateNorm === targetNorm) return true;
  // Strict exact match for short identifiers
  if (candidateNorm.length <= 3 || targetNorm.length <= 3) {
    return candidateNorm === targetNorm;
  }
  // Allow compound prefix matches (e.g. 'tailwindcss' starting with 'tailwind')
  return candidateNorm.startsWith(targetNorm) || targetNorm.startsWith(candidateNorm);
}

function findDomainForSkill(skillName: string): TechDomain | null {
  const norm = normalizeName(skillName);
  for (const domain of DOMAINS) {
    for (const kw of domain.keywords) {
      if (isSkillMatch(norm, kw)) {
        return domain.id;
      }
    }
  }
  return null;
}

export interface RecommendationOptions {
  targetJobRole?: string;
  targetCompany?: string;
  assessmentScores?: Record<string, number>;
}

export const COMPANY_TECH_STACKS: Record<string, { label: string; skills: string[]; reason: string }> = {
  'amazon': {
    label: 'Amazon',
    skills: ['system design', 'aws', 'docker', 'kubernetes', 'dynamodb', 'microservices', 'java'],
    reason: 'Core technology stack evaluated in Amazon Full-Stack & SDE hiring rounds'
  },
  'google': {
    label: 'Google',
    skills: ['go', 'kubernetes', 'distributed systems', 'system design', 'python', 'data structures & algorithms'],
    reason: 'High-scale infrastructure and systems stack prioritized by Google'
  },
  'microsoft': {
    label: 'Microsoft',
    skills: ['typescript', 'next.js', 'azure', 'c#', 'microservices', 'react'],
    reason: 'Enterprise cloud and TypeScript ecosystem standard at Microsoft'
  },
  'infosys': {
    label: 'Infosys',
    skills: ['spring boot', 'java', 'react', 'postgresql', 'microservices', 'docker'],
    reason: 'Industry enterprise digital transformation stack required at Infosys'
  },
  'tcs': {
    label: 'TCS',
    skills: ['java', 'spring boot', 'angular', 'sql', 'devops'],
    reason: 'Core enterprise delivery and backend stack across TCS client architectures'
  },
  'startup': {
    label: 'High-Growth Startups',
    skills: ['next.js', 'tailwind css', 'fastapi', 'redis', 'docker', 'postgresql'],
    reason: 'Rapid shipping, high-performance modern web stack across tech startups'
  }
};

export const JOB_ROLE_TARGETS: Record<string, { label: string; skills: string[]; reason: string }> = {
  'Full Stack Developer': {
    label: 'Full Stack Developer',
    skills: ['next.js', 'system design', 'docker', 'redis', 'microservices', 'postgresql', 'tailwind css'],
    reason: 'Critical competency to bridge frontend experiences with resilient backend microservices'
  },
  'Frontend Developer': {
    label: 'Frontend Developer',
    skills: ['next.js', 'tailwind css', 'typescript', 'redux', 'ui/ux', 'web performance'],
    reason: 'Essential modern frontend framework and design system skill'
  },
  'Backend Developer': {
    label: 'Backend Developer',
    skills: ['system design', 'microservices', 'redis', 'docker', 'kubernetes', 'kafka', 'postgresql'],
    reason: 'High-concurrency microservice and distributed caching architectural requirement'
  },
  'Cloud DevOps Engineer': {
    label: 'Cloud DevOps Engineer',
    skills: ['docker', 'kubernetes', 'aws', 'terraform', 'ci/cd', 'linux'],
    reason: 'Production cloud provisioning and automated delivery pipeline competency'
  },
  'AI & Data Science': {
    label: 'AI & Data Science',
    skills: ['python', 'machine learning', 'deep learning', 'pytorch', 'fastapi', 'sql'],
    reason: 'Core machine learning modeling and data pipeline engineering requirement'
  }
};

export function computeSkillRecommendations(
  topSkills: StudentSkill[],
  learningSkills: Array<{ id?: string; skillId?: string; skillName: string }>,
  allSkills: TaxonomySkill[],
  limit = 8,
  additionalExcludedNames?: Set<string>,
  additionalExcludedIds?: Set<string>,
  options?: RecommendationOptions
): RecommendationResult {

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

  if (additionalExcludedNames) {
    additionalExcludedNames.forEach(n => existingNormalizedNames.add(normalizeName(n)));
  }

  if (additionalExcludedIds) {
    additionalExcludedIds.forEach(id => existingSkillIds.add(id));
  }

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
      let weight = 2;
      if (skill.proficiency === 'EXPERT') weight = 4;
      else if (skill.proficiency === 'ADVANCED') weight = 3;
      else if (skill.proficiency === 'BEGINNER') weight = 1.5;
      domainScores[domain] += weight;
    }
  });

  learningSkills.forEach(skill => {
    const domain = findDomainForSkill(skill.skillName);
    if (domain) {
      domainScores[domain] += 2.5;
    }
  });

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

  if (options?.targetJobRole) {
    primaryFocus = `${options.targetJobRole} Target Track`;
    focusSummary = `Tailored for ${options.targetJobRole} competencies across enterprise hiring rubrics`;
  } else if (hasSkills) {
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

  const candidates = allSkills.filter(skill => {
    if (existingSkillIds.has(skill.id)) return false;
    const norm = normalizeName(skill.name);
    if (existingNormalizedNames.has(norm)) return false;
    return true;
  });

  const scoredSkills: RecommendedSkillItem[] = [];

  for (const candidate of candidates) {
    const candidateNorm = normalizeName(candidate.name);
    const candidateDomain = findDomainForSkill(candidate.name) ||
      (candidate.category ? findDomainForSkill(typeof candidate.category === 'string' ? candidate.category : '') : null) ||
      'backend';

    let totalScore = 0;
    let matchReason = '';
    let synergyTag = 'Recommended';
    let companyMatch: string | undefined;
    let roleRelevance: string | undefined;

    if (hasSkills) {
      if (candidateDomain === primaryDomainId) {
        totalScore += 50;
        matchReason = `Matches your core focus in ${primaryDomainConfig?.label || 'this area'}`;
        synergyTag = 'Core Path';
      } else if (secondaryDomainId && candidateDomain === secondaryDomainId) {
        totalScore += 35;
        matchReason = `Complements your ${secondaryDomainConfig?.label || 'secondary stack'}`;
        synergyTag = 'Complementary';
      } else if (primaryDomainConfig?.companionDomains.includes(candidateDomain)) {
        totalScore += 25;
        matchReason = `Natural next milestone for your engineering stack`;
        synergyTag = 'Expansion';
      } else {
        totalScore += 10;
        matchReason = `Expands your technical versatility across the engineering matrix`;
        synergyTag = 'New Domain';
      }
    } else {
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

    // 1. Blocked Campus Recruitment Drives Unblocking (Highest Priority Placement Factor)
    const unblockedDrives: string[] = [];
    if (options?.blockedDrives && options.blockedDrives.length > 0) {
      for (const drive of options.blockedDrives) {
        const dTitle = drive.title || 'Campus Drive';
        const dPkg = drive.packageLpa ? ` (₹${drive.packageLpa} LPA)` : '';
        const rawMissing = drive.missingSkills || [];
        const missingList = Array.isArray(rawMissing)
          ? rawMissing
          : typeof rawMissing === 'string'
          ? (rawMissing as string).split(',').map(s => s.trim())
          : [];

        const matchesMissing = missingList.some(m => isSkillMatch(candidateNorm, normalizeName(m)));
        if (matchesMissing) {
          const driveLabel = `${dTitle}${dPkg}`;
          if (!unblockedDrives.includes(driveLabel)) {
            unblockedDrives.push(driveLabel);
          }
        }
      }

      if (unblockedDrives.length > 0) {
        totalScore += 70;
        synergyTag = 'Drive Unblocker';
        matchReason = `Directly unlocks eligibility for ${unblockedDrives.slice(0, 2).join(' & ')} by closing mandatory hiring requirements.`;
      }
    }

    // 2. Skill synergy rules with clean specific reasoning
    if (hasSkills) {
      for (const studentSkill of topSkills) {
        const studentNorm = normalizeName(studentSkill.skillName);
        const rules = SPECIFIC_SYNERGIES[studentNorm];
        if (rules) {
          for (const rule of rules) {
            const matchesTarget = rule.targetSkills.some(t => isSkillMatch(candidateNorm, t));
            if (matchesTarget) {
              totalScore += rule.boost;
              if (unblockedDrives.length === 0) {
                matchReason = `${rule.reason} (leveraging your ${studentSkill.skillName} foundation)`;
                synergyTag = rule.tag;
              }
            }
          }
        }
      }
    }

    // 3. Diagnosed Concept Weakness Remediation
    if (options?.weakConcepts && options.weakConcepts.length > 0) {
      for (const weak of options.weakConcepts) {
        const weakNorm = normalizeName(weak.skillName);
        if (isSkillMatch(candidateNorm, weakNorm)) {
          totalScore += 35;
          if (unblockedDrives.length === 0) {
            matchReason = `Bridges diagnosed concept deficits in ${weak.skillName} (${weak.conceptTitle || 'fundamentals'}) through hands-on practice.`;
            synergyTag = 'Remediation Catalyst';
          }
        }
      }
    }

    // 4. Company technology alignment
    if (options?.targetCompany) {
      const companyKey = options.targetCompany.toLowerCase().trim();
      const companyConfig = COMPANY_TECH_STACKS[companyKey];
      if (companyConfig) {
        const matchesCompany = companyConfig.skills.some(t => isSkillMatch(candidateNorm, t));
        if (matchesCompany) {
          totalScore += 45;
          companyMatch = companyConfig.label;
          if (unblockedDrives.length === 0) {
            matchReason = `${companyConfig.reason}; strategically aligns with ${companyConfig.label} hiring rounds`;
            synergyTag = `${companyConfig.label} Stack`;
          }
        }
      }
    }

    // 5. Job role target alignment
    if (options?.targetJobRole) {
      const roleConfig = JOB_ROLE_TARGETS[options.targetJobRole];
      if (roleConfig) {
        const matchesRole = roleConfig.skills.some(t => isSkillMatch(candidateNorm, t));
        if (matchesRole) {
          totalScore += 40;
          roleRelevance = roleConfig.label;
          if (unblockedDrives.length === 0 && !companyMatch) {
            matchReason = `${roleConfig.reason} for ${roleConfig.label} positions`;
            synergyTag = 'Role Priority';
          }
        }
      }
    }

    if (['systemdesign', 'datastructuresalgorithms', 'dsa', 'oop'].includes(candidateNorm)) {
      totalScore += 15;
      if (!matchReason.includes('interview') && unblockedDrives.length === 0) {
        matchReason = `${matchReason} & critical for SDE Tier-1 technical interviews`;
      }
    }

    scoredSkills.push({
      skill: candidate,
      score: totalScore,
      reason: matchReason,
      synergyTag,
      domain: candidateDomain,
      companyMatch,
      roleRelevance,
      unblockedDrives: unblockedDrives.length > 0 ? unblockedDrives : undefined
    });
  }

  scoredSkills.sort((a, b) => b.score - a.score);

  return {
    primaryFocus,
    secondaryFocus: secondaryDomainConfig?.label,
    focusSummary,
    recommendedSkills: scoredSkills.slice(0, limit),
  };
}


