// ============================================================
// Beyon Seed — Static Skills Taxonomy
// ============================================================

export interface SkillCategory {
  key: string;
  name: string;
}

export interface Skill {
  key: string;
  name: string;
  categoryKey: string;
  slug: string;
}

export interface SkillTopic {
  key: string;
  name: string;
  skillKey: string;
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  { key: "CAT_PROG", name: "Programming" },
  { key: "CAT_FRONTEND", name: "Frontend" },
  { key: "CAT_BACKEND", name: "Backend" },
  { key: "CAT_DATABASE", name: "Database" },
  { key: "CAT_CLOUD", name: "Cloud" },
  { key: "CAT_DEVOPS", name: "DevOps" },
  { key: "CAT_AIML", name: "AI / Machine Learning" },
  { key: "CAT_DATA", name: "Data Science" },
  { key: "CAT_SECURITY", name: "Cybersecurity" },
  { key: "CAT_MOBILE", name: "Mobile" },
  { key: "CAT_UIUX", name: "UI / UX" },
  { key: "CAT_TESTING", name: "Testing" },
  { key: "CAT_SYSDESIGN", name: "System Design" },
  { key: "CAT_SOFT", name: "Soft Skills" },
  { key: "CAT_TOOLS", name: "Developer Tools" },
  { key: "CAT_DSA", name: "Data Structures & Algorithms" },
  { key: "CAT_CS", name: "Computer Science Fundamentals" },
  { key: "CAT_SQL", name: "SQL" },
  { key: "CAT_SCRIPTING", name: "Scripting & Automation" },
  { key: "CAT_MISC", name: "Miscellaneous" },
];

export const SKILLS: Skill[] = [
  // Programming
  { key: "SKILL_JAVA", name: "Java", categoryKey: "CAT_PROG", slug: "java" },
  { key: "SKILL_PYTHON", name: "Python", categoryKey: "CAT_PROG", slug: "python" },
  { key: "SKILL_C", name: "C", categoryKey: "CAT_PROG", slug: "c" },
  { key: "SKILL_CPP", name: "C++", categoryKey: "CAT_PROG", slug: "cpp" },
  { key: "SKILL_JS", name: "JavaScript", categoryKey: "CAT_PROG", slug: "javascript" },
  { key: "SKILL_TS", name: "TypeScript", categoryKey: "CAT_PROG", slug: "typescript" },
  { key: "SKILL_GO", name: "Go", categoryKey: "CAT_PROG", slug: "go" },
  { key: "SKILL_RUST", name: "Rust", categoryKey: "CAT_PROG", slug: "rust" },
  // Frontend
  { key: "SKILL_REACT", name: "React", categoryKey: "CAT_FRONTEND", slug: "react" },
  { key: "SKILL_VUE", name: "Vue.js", categoryKey: "CAT_FRONTEND", slug: "vuejs" },
  { key: "SKILL_ANGULAR", name: "Angular", categoryKey: "CAT_FRONTEND", slug: "angular" },
  { key: "SKILL_NEXTJS", name: "Next.js", categoryKey: "CAT_FRONTEND", slug: "nextjs" },
  { key: "SKILL_HTML", name: "HTML", categoryKey: "CAT_FRONTEND", slug: "html" },
  { key: "SKILL_CSS", name: "CSS", categoryKey: "CAT_FRONTEND", slug: "css" },
  // Backend
  { key: "SKILL_SPRING", name: "Spring Boot", categoryKey: "CAT_BACKEND", slug: "spring-boot" },
  { key: "SKILL_NODE", name: "Node.js", categoryKey: "CAT_BACKEND", slug: "nodejs" },
  { key: "SKILL_EXPRESS", name: "Express.js", categoryKey: "CAT_BACKEND", slug: "expressjs" },
  { key: "SKILL_NESTJS", name: "NestJS", categoryKey: "CAT_BACKEND", slug: "nestjs" },
  { key: "SKILL_DJANGO", name: "Django", categoryKey: "CAT_BACKEND", slug: "django" },
  { key: "SKILL_FASTAPI", name: "FastAPI", categoryKey: "CAT_BACKEND", slug: "fastapi" },
  // Database
  { key: "SKILL_SQL", name: "SQL", categoryKey: "CAT_SQL", slug: "sql" },
  { key: "SKILL_POSTGRES", name: "PostgreSQL", categoryKey: "CAT_DATABASE", slug: "postgresql" },
  { key: "SKILL_MYSQL", name: "MySQL", categoryKey: "CAT_DATABASE", slug: "mysql" },
  { key: "SKILL_MONGO", name: "MongoDB", categoryKey: "CAT_DATABASE", slug: "mongodb" },
  { key: "SKILL_REDIS", name: "Redis", categoryKey: "CAT_DATABASE", slug: "redis" },
  // Cloud
  { key: "SKILL_AWS", name: "AWS", categoryKey: "CAT_CLOUD", slug: "aws" },
  { key: "SKILL_AZURE", name: "Azure", categoryKey: "CAT_CLOUD", slug: "azure" },
  { key: "SKILL_GCP", name: "GCP", categoryKey: "CAT_CLOUD", slug: "gcp" },
  // DevOps
  { key: "SKILL_DOCKER", name: "Docker", categoryKey: "CAT_DEVOPS", slug: "docker" },
  { key: "SKILL_K8S", name: "Kubernetes", categoryKey: "CAT_DEVOPS", slug: "kubernetes" },
  { key: "SKILL_TERRAFORM", name: "Terraform", categoryKey: "CAT_DEVOPS", slug: "terraform" },
  { key: "SKILL_GIT", name: "Git", categoryKey: "CAT_TOOLS", slug: "git" },
  { key: "SKILL_LINUX", name: "Linux", categoryKey: "CAT_TOOLS", slug: "linux" },
  // AI/ML
  { key: "SKILL_ML", name: "Machine Learning", categoryKey: "CAT_AIML", slug: "machine-learning" },
  { key: "SKILL_DL", name: "Deep Learning", categoryKey: "CAT_AIML", slug: "deep-learning" },
  { key: "SKILL_NLP", name: "NLP", categoryKey: "CAT_AIML", slug: "nlp" },
  { key: "SKILL_CV", name: "Computer Vision", categoryKey: "CAT_AIML", slug: "computer-vision" },
  // CS Fundamentals
  { key: "SKILL_DSA", name: "DSA", categoryKey: "CAT_DSA", slug: "dsa" },
  { key: "SKILL_SYSDESIGN", name: "System Design", categoryKey: "CAT_SYSDESIGN", slug: "system-design" },
  { key: "SKILL_OS", name: "Operating Systems", categoryKey: "CAT_CS", slug: "operating-systems" },
  { key: "SKILL_CN", name: "Computer Networks", categoryKey: "CAT_CS", slug: "computer-networks" },
  { key: "SKILL_DBMS", name: "DBMS", categoryKey: "CAT_CS", slug: "dbms" },
  { key: "SKILL_OOP", name: "OOP", categoryKey: "CAT_CS", slug: "oop" },
  // Security
  { key: "SKILL_CYBER", name: "Cybersecurity", categoryKey: "CAT_SECURITY", slug: "cybersecurity" },
  // Mobile
  { key: "SKILL_ANDROID", name: "Android", categoryKey: "CAT_MOBILE", slug: "android" },
  { key: "SKILL_FLUTTER", name: "Flutter", categoryKey: "CAT_MOBILE", slug: "flutter" },
  // Testing
  { key: "SKILL_TESTING", name: "Software Testing", categoryKey: "CAT_TESTING", slug: "software-testing" },
];

export const SKILL_TOPICS: SkillTopic[] = [
  // Java
  { key: "TOPIC_JAVA_OOP", name: "OOP Concepts", skillKey: "SKILL_JAVA" },
  { key: "TOPIC_JAVA_COLLECTIONS", name: "Collections Framework", skillKey: "SKILL_JAVA" },
  { key: "TOPIC_JAVA_STREAMS", name: "Streams & Lambdas", skillKey: "SKILL_JAVA" },
  { key: "TOPIC_JAVA_CONCURRENCY", name: "Concurrency & Threads", skillKey: "SKILL_JAVA" },
  { key: "TOPIC_JAVA_EXCEPTIONS", name: "Exception Handling", skillKey: "SKILL_JAVA" },
  // Python
  { key: "TOPIC_PYTHON_BASICS", name: "Python Basics", skillKey: "SKILL_PYTHON" },
  { key: "TOPIC_PYTHON_OOP", name: "OOP in Python", skillKey: "SKILL_PYTHON" },
  { key: "TOPIC_PYTHON_DECORATORS", name: "Decorators & Context Managers", skillKey: "SKILL_PYTHON" },
  // DSA
  { key: "TOPIC_DSA_ARRAYS", name: "Arrays & Strings", skillKey: "SKILL_DSA" },
  { key: "TOPIC_DSA_LINKED_LIST", name: "Linked Lists", skillKey: "SKILL_DSA" },
  { key: "TOPIC_DSA_TREES", name: "Trees & Graphs", skillKey: "SKILL_DSA" },
  { key: "TOPIC_DSA_SORTING", name: "Sorting Algorithms", skillKey: "SKILL_DSA" },
  { key: "TOPIC_DSA_DP", name: "Dynamic Programming", skillKey: "SKILL_DSA" },
  { key: "TOPIC_DSA_STACK_QUEUE", name: "Stacks & Queues", skillKey: "SKILL_DSA" },
  // SQL
  { key: "TOPIC_SQL_SELECT", name: "SELECT & WHERE", skillKey: "SKILL_SQL" },
  { key: "TOPIC_SQL_JOINS", name: "JOINs", skillKey: "SKILL_SQL" },
  { key: "TOPIC_SQL_AGGREGATION", name: "Aggregation & GROUP BY", skillKey: "SKILL_SQL" },
  { key: "TOPIC_SQL_SUBQUERIES", name: "Subqueries & CTEs", skillKey: "SKILL_SQL" },
  { key: "TOPIC_SQL_WINDOW", name: "Window Functions", skillKey: "SKILL_SQL" },
  // System Design
  { key: "TOPIC_SD_SCALABILITY", name: "Scalability", skillKey: "SKILL_SYSDESIGN" },
  { key: "TOPIC_SD_CACHING", name: "Caching", skillKey: "SKILL_SYSDESIGN" },
  { key: "TOPIC_SD_MICROSERVICES", name: "Microservices", skillKey: "SKILL_SYSDESIGN" },
  // Spring Boot
  { key: "TOPIC_SPRING_REST", name: "REST APIs", skillKey: "SKILL_SPRING" },
  { key: "TOPIC_SPRING_JPA", name: "JPA & Hibernate", skillKey: "SKILL_SPRING" },
  { key: "TOPIC_SPRING_SECURITY", name: "Spring Security", skillKey: "SKILL_SPRING" },
  // React
  { key: "TOPIC_REACT_HOOKS", name: "React Hooks", skillKey: "SKILL_REACT" },
  { key: "TOPIC_REACT_STATE", name: "State Management", skillKey: "SKILL_REACT" },
  { key: "TOPIC_REACT_PERF", name: "Performance Optimization", skillKey: "SKILL_REACT" },
];
