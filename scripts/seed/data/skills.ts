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

  { key: "SKILL_JAVA", name: "Java", categoryKey: "CAT_PROG", slug: "java" },
  { key: "SKILL_PYTHON", name: "Python", categoryKey: "CAT_PROG", slug: "python" },
  { key: "SKILL_C", name: "C", categoryKey: "CAT_PROG", slug: "c" },
  { key: "SKILL_CPP", name: "C++", categoryKey: "CAT_PROG", slug: "cpp" },
  { key: "SKILL_JS", name: "JavaScript", categoryKey: "CAT_PROG", slug: "javascript" },
  { key: "SKILL_TS", name: "TypeScript", categoryKey: "CAT_PROG", slug: "typescript" },
  { key: "SKILL_GO", name: "Go", categoryKey: "CAT_PROG", slug: "go" },
  { key: "SKILL_RUST", name: "Rust", categoryKey: "CAT_PROG", slug: "rust" },

  { key: "SKILL_REACT", name: "React", categoryKey: "CAT_FRONTEND", slug: "react" },
  { key: "SKILL_VUE", name: "Vue.js", categoryKey: "CAT_FRONTEND", slug: "vuejs" },
  { key: "SKILL_ANGULAR", name: "Angular", categoryKey: "CAT_FRONTEND", slug: "angular" },
  { key: "SKILL_NEXTJS", name: "Next.js", categoryKey: "CAT_FRONTEND", slug: "nextjs" },
  { key: "SKILL_HTML", name: "HTML", categoryKey: "CAT_FRONTEND", slug: "html" },
  { key: "SKILL_CSS", name: "CSS", categoryKey: "CAT_FRONTEND", slug: "css" },

  { key: "SKILL_SPRING", name: "Spring Boot", categoryKey: "CAT_BACKEND", slug: "spring-boot" },
  { key: "SKILL_NODE", name: "Node.js", categoryKey: "CAT_BACKEND", slug: "nodejs" },
  { key: "SKILL_EXPRESS", name: "Express.js", categoryKey: "CAT_BACKEND", slug: "expressjs" },
  { key: "SKILL_NESTJS", name: "NestJS", categoryKey: "CAT_BACKEND", slug: "nestjs" },
  { key: "SKILL_DJANGO", name: "Django", categoryKey: "CAT_BACKEND", slug: "django" },
  { key: "SKILL_FASTAPI", name: "FastAPI", categoryKey: "CAT_BACKEND", slug: "fastapi" },

  { key: "SKILL_SQL", name: "SQL", categoryKey: "CAT_SQL", slug: "sql" },
  { key: "SKILL_POSTGRES", name: "PostgreSQL", categoryKey: "CAT_DATABASE", slug: "postgresql" },
  { key: "SKILL_MYSQL", name: "MySQL", categoryKey: "CAT_DATABASE", slug: "mysql" },
  { key: "SKILL_MONGO", name: "MongoDB", categoryKey: "CAT_DATABASE", slug: "mongodb" },
  { key: "SKILL_REDIS", name: "Redis", categoryKey: "CAT_DATABASE", slug: "redis" },

  { key: "SKILL_AWS", name: "AWS", categoryKey: "CAT_CLOUD", slug: "aws" },
  { key: "SKILL_AZURE", name: "Azure", categoryKey: "CAT_CLOUD", slug: "azure" },
  { key: "SKILL_GCP", name: "GCP", categoryKey: "CAT_CLOUD", slug: "gcp" },

  { key: "SKILL_DOCKER", name: "Docker", categoryKey: "CAT_DEVOPS", slug: "docker" },
  { key: "SKILL_K8S", name: "Kubernetes", categoryKey: "CAT_DEVOPS", slug: "kubernetes" },
  { key: "SKILL_TERRAFORM", name: "Terraform", categoryKey: "CAT_DEVOPS", slug: "terraform" },
  { key: "SKILL_GIT", name: "Git", categoryKey: "CAT_TOOLS", slug: "git" },
  { key: "SKILL_LINUX", name: "Linux", categoryKey: "CAT_TOOLS", slug: "linux" },

  { key: "SKILL_ML", name: "Machine Learning", categoryKey: "CAT_AIML", slug: "machine-learning" },
  { key: "SKILL_DL", name: "Deep Learning", categoryKey: "CAT_AIML", slug: "deep-learning" },
  { key: "SKILL_NLP", name: "NLP", categoryKey: "CAT_AIML", slug: "nlp" },
  { key: "SKILL_CV", name: "Computer Vision", categoryKey: "CAT_AIML", slug: "computer-vision" },

  { key: "SKILL_DSA", name: "DSA", categoryKey: "CAT_DSA", slug: "dsa" },
  { key: "SKILL_SYSDESIGN", name: "System Design", categoryKey: "CAT_SYSDESIGN", slug: "system-design" },
  { key: "SKILL_OS", name: "Operating Systems", categoryKey: "CAT_CS", slug: "operating-systems" },
  { key: "SKILL_CN", name: "Computer Networks", categoryKey: "CAT_CS", slug: "computer-networks" },
  { key: "SKILL_DBMS", name: "DBMS", categoryKey: "CAT_CS", slug: "dbms" },
  { key: "SKILL_OOP", name: "OOP", categoryKey: "CAT_CS", slug: "oop" },

  { key: "SKILL_CYBER", name: "Cybersecurity", categoryKey: "CAT_SECURITY", slug: "cybersecurity" },

  { key: "SKILL_ANDROID", name: "Android", categoryKey: "CAT_MOBILE", slug: "android" },
  { key: "SKILL_FLUTTER", name: "Flutter", categoryKey: "CAT_MOBILE", slug: "flutter" },

  { key: "SKILL_TESTING", name: "Software Testing", categoryKey: "CAT_TESTING", slug: "software-testing" },
];

export const SKILL_TOPICS: SkillTopic[] = [
  // ── Java Topics (Fine-Grained for Deterministic Gap Engine) ──
  { key: "TOPIC_JAVA_SYNTAX", name: "Syntax & Basics", skillKey: "SKILL_JAVA" },
  { key: "TOPIC_JAVA_OOP", name: "OOP Concepts (Inheritance, Polymorphism)", skillKey: "SKILL_JAVA" },
  { key: "TOPIC_JAVA_COLLECTIONS", name: "Collections Framework Overview", skillKey: "SKILL_JAVA" },
  { key: "TOPIC_JAVA_HASHMAP", name: "HashMap & Hash Collision Handling", skillKey: "SKILL_JAVA" },
  { key: "TOPIC_JAVA_SET_LIST", name: "List, Set & Queue Implementations", skillKey: "SKILL_JAVA" },
  { key: "TOPIC_JAVA_COMPARABLE", name: "Comparable vs Comparator Ordering", skillKey: "SKILL_JAVA" },
  { key: "TOPIC_JAVA_STREAMS", name: "Streams, Lambdas & Functional Interfaces", skillKey: "SKILL_JAVA" },
  { key: "TOPIC_JAVA_CONCURRENCY", name: "Concurrency, Threads & ExecutorService", skillKey: "SKILL_JAVA" },
  { key: "TOPIC_JAVA_EXCEPTIONS", name: "Exception Handling & Resource Management", skillKey: "SKILL_JAVA" },
  { key: "TOPIC_JAVA_GENERICS", name: "Generics & Type Erasure", skillKey: "SKILL_JAVA" },
  { key: "TOPIC_JAVA_JVM", name: "JVM Architecture, Memory & Garbage Collection", skillKey: "SKILL_JAVA" },

  // ── Python Topics ──
  { key: "TOPIC_PYTHON_BASICS", name: "Python Basics & Data Structures", skillKey: "SKILL_PYTHON" },
  { key: "TOPIC_PYTHON_OOP", name: "OOP & Magic Methods in Python", skillKey: "SKILL_PYTHON" },
  { key: "TOPIC_PYTHON_DECORATORS", name: "Decorators, Generators & Context Managers", skillKey: "SKILL_PYTHON" },
  { key: "TOPIC_PYTHON_ASYNC", name: "Asyncio & Async Programming", skillKey: "SKILL_PYTHON" },

  // ── DSA Topics ──
  { key: "TOPIC_DSA_ARRAYS", name: "Arrays & Two Pointers", skillKey: "SKILL_DSA" },
  { key: "TOPIC_DSA_STRINGS", name: "String Manipulation & Sliding Window", skillKey: "SKILL_DSA" },
  { key: "TOPIC_DSA_LINKED_LIST", name: "Singly & Doubly Linked Lists", skillKey: "SKILL_DSA" },
  { key: "TOPIC_DSA_STACK_QUEUE", name: "Stacks, Monotonic Queues & Deques", skillKey: "SKILL_DSA" },
  { key: "TOPIC_DSA_TREES", name: "Binary Trees & Binary Search Trees (BST)", skillKey: "SKILL_DSA" },
  { key: "TOPIC_DSA_GRAPHS", name: "Graphs (BFS, DFS, Dijkstra, TopoSort)", skillKey: "SKILL_DSA" },
  { key: "TOPIC_DSA_SORTING", name: "Sorting & Divide-and-Conquer", skillKey: "SKILL_DSA" },
  { key: "TOPIC_DSA_SEARCHING", name: "Binary Search & Search Spaces", skillKey: "SKILL_DSA" },
  { key: "TOPIC_DSA_DP", name: "Dynamic Programming (1D, 2D, Knapsack)", skillKey: "SKILL_DSA" },

  // ── SQL & Database Topics ──
  { key: "TOPIC_SQL_SELECT", name: "SELECT, WHERE & Filtering", skillKey: "SKILL_SQL" },
  { key: "TOPIC_SQL_JOINS", name: "INNER, LEFT, RIGHT, FULL OUTER JOINs", skillKey: "SKILL_SQL" },
  { key: "TOPIC_SQL_AGGREGATION", name: "Aggregation, GROUP BY & HAVING", skillKey: "SKILL_SQL" },
  { key: "TOPIC_SQL_SUBQUERIES", name: "Subqueries & Common Table Expressions (CTEs)", skillKey: "SKILL_SQL" },
  { key: "TOPIC_SQL_WINDOW", name: "Window Functions (ROW_NUMBER, RANK, DENSE_RANK)", skillKey: "SKILL_SQL" },
  { key: "TOPIC_SQL_INDEXES", name: "B-Tree Indexes & Query Execution Plans", skillKey: "SKILL_SQL" },
  { key: "TOPIC_SQL_TRANSACTIONS", name: "ACID Properties & Transaction Isolation", skillKey: "SKILL_SQL" },

  // ── System Design Topics ──
  { key: "TOPIC_SD_SCALABILITY", name: "Horizontal vs Vertical Scaling & Load Balancing", skillKey: "SKILL_SYSDESIGN" },
  { key: "TOPIC_SD_CACHING", name: "Caching Strategies (Write-Through, LRU, Redis)", skillKey: "SKILL_SYSDESIGN" },
  { key: "TOPIC_SD_MICROSERVICES", name: "Microservice Architecture & Event-Driven Systems", skillKey: "SKILL_SYSDESIGN" },
  { key: "TOPIC_SD_DB_SHARDING", name: "Database Sharding & Replication", skillKey: "SKILL_SYSDESIGN" },

  // ── Backend & Frameworks ──
  { key: "TOPIC_SPRING_REST", name: "Spring Boot RESTful APIs & Controller Advice", skillKey: "SKILL_SPRING" },
  { key: "TOPIC_SPRING_JPA", name: "Spring Data JPA, Hibernate & N+1 Queries", skillKey: "SKILL_SPRING" },
  { key: "TOPIC_SPRING_SECURITY", name: "Spring Security, JWT & RBAC Filters", skillKey: "SKILL_SPRING" },
  { key: "TOPIC_NODE_EVENTLOOP", name: "Node.js Event Loop & Non-blocking I/O", skillKey: "SKILL_NODE" },
  { key: "TOPIC_FASTAPI_ASYNC", name: "FastAPI, Pydantic & Dependency Injection", skillKey: "SKILL_FASTAPI" },

  // ── Frontend & Web ──
  { key: "TOPIC_HTML_SEMANTICS", name: "HTML5 Semantic Elements & Accessibility", skillKey: "SKILL_HTML" },
  { key: "TOPIC_CSS_LAYOUTS", name: "CSS Flexbox, Grid, Responsive Design & BEM", skillKey: "SKILL_CSS" },
  { key: "TOPIC_JS_ASYNC", name: "JavaScript Event Loop, Promises & Closures", skillKey: "SKILL_JS" },
  { key: "TOPIC_TS_TYPES", name: "TypeScript Generics, Utility Types & Type Guards", skillKey: "SKILL_TS" },
  { key: "TOPIC_REACT_HOOKS", name: "React Hooks (useState, useEffect, useMemo, useCallback)", skillKey: "SKILL_REACT" },
  { key: "TOPIC_REACT_STATE", name: "React State Management & Context API", skillKey: "SKILL_REACT" },
  { key: "TOPIC_REACT_PERF", name: "React Performance Optimization & Memoization", skillKey: "SKILL_REACT" },

  // ── Cloud, DevOps & Databases ──
  { key: "TOPIC_REDIS_CACHE", name: "Redis In-Memory Key-Value & Eviction Policies", skillKey: "SKILL_REDIS" },
  { key: "TOPIC_DOCKER_CONTAINERS", name: "Docker Containerization & Multi-stage Builds", skillKey: "SKILL_DOCKER" },
  { key: "TOPIC_K8S_ORCHESTRATION", name: "Kubernetes Pods, Deployments & Services", skillKey: "SKILL_K8S" },
  { key: "TOPIC_AWS_SERVICES", name: "AWS Cloud (S3, SQS, EC2, IAM, Lambda)", skillKey: "SKILL_AWS" },

  // ── AI/ML Topics ──
  { key: "TOPIC_ML_REGRESSION", name: "Supervised Learning (Regression & Classification)", skillKey: "SKILL_ML" },
  { key: "TOPIC_ML_EVALUATION", name: "Model Evaluation (Precision, Recall, F1, ROC-AUC)", skillKey: "SKILL_ML" },
  { key: "TOPIC_DL_CNN_RNN", name: "Deep Neural Networks (CNN, RNN, Transformers)", skillKey: "SKILL_DL" },
  { key: "TOPIC_NLP_LLM", name: "NLP, Tokenization & Large Language Models", skillKey: "SKILL_NLP" },

  // ── Engineering Domain Specific Topics (ECE, EEE, Mech, Civil, Chem, Food, Auto) ──
  { key: "TOPIC_ECE_EMBEDDED", name: "Microcontrollers, ARM Architecture & RTOS", skillKey: "SKILL_C" },
  { key: "TOPIC_ECE_VLSI", name: "Digital Logic Design & Verilog / FPGA", skillKey: "SKILL_CPP" },
  { key: "TOPIC_EEE_POWER_EV", name: "Power Electronics, Inverters & EV Battery Drives", skillKey: "SKILL_C" },
  { key: "TOPIC_MECH_CAD_ROBOTICS", name: "CAD/CAM Modeling, FEA & Industrial Robotics", skillKey: "SKILL_PYTHON" },
  { key: "TOPIC_CIVIL_STRUCTURES", name: "Structural Analysis & Reinforced Concrete Design", skillKey: "SKILL_PYTHON" },
  { key: "TOPIC_CHEM_PROCESS", name: "Chemical Process Control & Transport Phenomena", skillKey: "SKILL_PYTHON" },
  { key: "TOPIC_FOOD_PROCESSING", name: "Food Processing Technology & Quality HACCP", skillKey: "SKILL_PYTHON" },
  { key: "TOPIC_AUTO_POWERTRAIN", name: "Automotive Powertrain & Electronic Control Units", skillKey: "SKILL_C" },
];


