-- ============================================================
-- Beyon Consolidated MySQL Schema for Dolt
-- Auto-generated from PostgreSQL migrations V1-V25
-- Converted from PostgreSQL to MySQL-compatible syntax
-- ============================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================================
-- Source: V1__create_identity_tables.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL ,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_VERIFICATION' ,
    email_verified TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMP
);





CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    consumed TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);




CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    consumed TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);




CREATE TABLE IF NOT EXISTS audit_events (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    event_type VARCHAR(40) NOT NULL,
    email VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent VARCHAR(200),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Source: V2__create_profile_tables.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS student_profiles (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL UNIQUE,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20),
    country VARCHAR(100),
    state VARCHAR(100),
    city VARCHAR(100),
    institution VARCHAR(200),
    registration_number VARCHAR(50),
    degree VARCHAR(100),
    department VARCHAR(200),
    academic_year VARCHAR(30),
    cgpa DECIMAL(4,2),
    placement_preference VARCHAR(30) ,
    preferred_job_roles TEXT,
    preferred_industries TEXT,
    preferred_work_type VARCHAR(20) ,
    about_me TEXT,
    resume_url VARCHAR(500),
    profile_photo_url VARCHAR(500),
    completion_pct INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);




CREATE TABLE IF NOT EXISTS student_skills (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    proficiency VARCHAR(20) ,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);



CREATE TABLE IF NOT EXISTS student_certifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(200) NOT NULL,
    issuing_org VARCHAR(200),
    issue_date DATE,
    expiry_date DATE,
    credential_id VARCHAR(100),
    credential_url VARCHAR(500),
    certificate_url VARCHAR(500),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_VERIFICATION' ,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);



CREATE TABLE IF NOT EXISTS student_projects (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    role VARCHAR(100),
    technologies TEXT,
    github_url VARCHAR(500),
    live_url VARCHAR(500),
    image_url VARCHAR(500),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);



CREATE TABLE IF NOT EXISTS student_links (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    platform VARCHAR(50) NOT NULL,
    url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);



CREATE TABLE IF NOT EXISTS institution_profiles (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL UNIQUE,
    institution_name VARCHAR(200) NOT NULL,
    institution_type VARCHAR(50),
    institution_code VARCHAR(50),
    official_email VARCHAR(255),
    phone VARCHAR(20),
    website VARCHAR(500),
    country VARCHAR(100),
    state VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    postal_code VARCHAR(20),
    affiliated_university VARCHAR(200),
    accreditations TEXT,
    accreditation_grade VARCHAR(50),
    established_year INTEGER,
    placement_rate DECIMAL(5,2),
    average_package DECIMAL(12,2),
    highest_package DECIMAL(12,2),
    total_students INTEGER,
    placement_willing_count INTEGER,
    placement_not_willing_count INTEGER,
    verification_doc_url VARCHAR(500),
    logo_url VARCHAR(500),
    completion_pct INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);



CREATE TABLE IF NOT EXISTS institution_placement_history (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    students_placed INTEGER,
    placement_percentage DECIMAL(5,2),
    average_package DECIMAL(12,2),
    highest_package DECIMAL(12,2),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);



CREATE TABLE IF NOT EXISTS institution_representatives (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(200) NOT NULL,
    designation VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    department VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);



CREATE TABLE IF NOT EXISTS company_profiles (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL UNIQUE,
    company_name VARCHAR(200) NOT NULL,
    logo_url VARCHAR(500),
    company_type VARCHAR(50),
    industry VARCHAR(100),
    website VARCHAR(500),
    official_email VARCHAR(255),
    phone VARCHAR(20),
    country VARCHAR(100),
    state VARCHAR(100),
    city VARCHAR(100),
    headquarters VARCHAR(200),
    company_size VARCHAR(30),
    founded_year INTEGER,
    about TEXT,
    linkedin VARCHAR(500),
    verification_doc_url VARCHAR(500),
    completion_pct INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);



CREATE TABLE IF NOT EXISTS company_hiring_preferences (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    hiring_types TEXT,
    preferred_levels TEXT,
    recruitment_regions TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);



CREATE TABLE IF NOT EXISTS company_skills (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);



CREATE TABLE IF NOT EXISTS company_representatives (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(200) NOT NULL,
    designation VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Source: V3__add_profile_status.sql
-- ============================================================

ALTER TABLE users ADD COLUMN profile_status VARCHAR(30) NOT NULL DEFAULT 'INCOMPLETE';

-- ============================================================
-- Source: V4__student_profile_extended.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS skills (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);




INSERT IGNORE INTO skills (name, slug, category, description) VALUES
('Java', 'java', 'PROGRAMMING', 'General-purpose programming language'),
('Python', 'python', 'PROGRAMMING', 'Versatile scripting and programming language'),
('C++', 'cpp', 'PROGRAMMING', 'High-performance systems programming language'),
('C', 'c', 'PROGRAMMING', 'Low-level systems programming language'),
('JavaScript', 'javascript', 'PROGRAMMING', 'Web programming language'),
('TypeScript', 'typescript', 'PROGRAMMING', 'Typed JavaScript superset'),
('Go', 'go', 'PROGRAMMING', 'Concurrent systems programming language'),
('Rust', 'rust', 'PROGRAMMING', 'Safe systems programming language'),
('Kotlin', 'kotlin', 'PROGRAMMING', 'JVM programming language'),
('Swift', 'swift', 'PROGRAMMING', 'iOS/macOS programming language'),
('PHP', 'php', 'PROGRAMMING', 'Web server-side scripting language'),
('Ruby', 'ruby', 'PROGRAMMING', 'Dynamic scripting language'),
('Scala', 'scala', 'PROGRAMMING', 'JVM functional programming language'),
('R', 'r', 'PROGRAMMING', 'Statistical computing language'),
('MATLAB', 'matlab', 'PROGRAMMING', 'Numerical computing environment'),
('HTML', 'html', 'FRONTEND', 'HyperText Markup Language'),
('CSS', 'css', 'FRONTEND', 'Cascading Style Sheets'),
('React', 'react', 'FRONTEND', 'JavaScript UI library'),
('Angular', 'angular', 'FRONTEND', 'TypeScript web framework'),
('Vue.js', 'vuejs', 'FRONTEND', 'Progressive JavaScript framework'),
('Next.js', 'nextjs', 'FRONTEND', 'React full-stack framework'),
('Svelte', 'svelte', 'FRONTEND', 'Compile-time web framework'),
('Tailwind CSS', 'tailwindcss', 'FRONTEND', 'Utility-first CSS framework'),
('Bootstrap', 'bootstrap', 'FRONTEND', 'CSS framework'),
('SASS', 'sass', 'FRONTEND', 'CSS preprocessor'),
('Node.js', 'nodejs', 'BACKEND', 'JavaScript runtime'),
('Express.js', 'expressjs', 'BACKEND', 'Node.js web framework'),
('Spring Boot', 'springboot', 'BACKEND', 'Java microservice framework'),
('Django', 'django', 'BACKEND', 'Python web framework'),
('Flask', 'flask', 'BACKEND', 'Python micro web framework'),
('FastAPI', 'fastapi', 'BACKEND', 'Python async API framework'),
('Ruby on Rails', 'rails', 'BACKEND', 'Ruby web framework'),
('Laravel', 'laravel', 'BACKEND', 'PHP web framework'),
('ASP.NET', 'aspnet', 'BACKEND', 'Microsoft web framework'),
('GraphQL', 'graphql', 'BACKEND', 'API query language'),
('REST API', 'restapi', 'BACKEND', 'RESTful API design'),
('gRPC', 'grpc', 'BACKEND', 'Remote procedure call framework'),
('SQL', 'sql', 'DATABASE', 'Structured Query Language'),
('PostgreSQL', 'postgresql', 'DATABASE', 'Advanced open-source RDBMS'),
('MySQL', 'mysql', 'DATABASE', 'Popular open-source RDBMS'),
('MongoDB', 'mongodb', 'DATABASE', 'Document-oriented NoSQL database'),
('Redis', 'redis', 'DATABASE', 'In-memory key-value store'),
('Elasticsearch', 'elasticsearch', 'DATABASE', 'Search and analytics engine'),
('SQLite', 'sqlite', 'DATABASE', 'Lightweight embedded database'),
('DynamoDB', 'dynamodb', 'DATABASE', 'AWS managed NoSQL'),
('Cassandra', 'cassandra', 'DATABASE', 'Distributed NoSQL database'),
('AWS', 'aws', 'CLOUD', 'Amazon Web Services'),
('Google Cloud', 'gcp', 'CLOUD', 'Google Cloud Platform'),
('Azure', 'azure', 'CLOUD', 'Microsoft cloud platform'),
('DigitalOcean', 'digitalocean', 'CLOUD', 'Cloud infrastructure provider'),
('Heroku', 'heroku', 'CLOUD', 'Cloud application platform'),
('Docker', 'docker', 'DEVOPS', 'Container platform'),
('Kubernetes', 'kubernetes', 'DEVOPS', 'Container orchestration'),
('Jenkins', 'jenkins', 'DEVOPS', 'CI/CD automation server'),
('GitHub Actions', 'githubactions', 'DEVOPS', 'GitHub CI/CD'),
('Terraform', 'terraform', 'DEVOPS', 'Infrastructure as code'),
('Ansible', 'ansible', 'DEVOPS', 'IT automation tool'),
('Prometheus', 'prometheus', 'DEVOPS', 'Monitoring and alerting'),
('Nginx', 'nginx', 'DEVOPS', 'Web server and reverse proxy'),
('TensorFlow', 'tensorflow', 'AI_ML', 'Machine learning framework'),
('PyTorch', 'pytorch', 'AI_ML', 'Deep learning framework'),
('Scikit-learn', 'scikitlearn', 'AI_ML', 'Machine learning library'),
('Pandas', 'pandas', 'DATA', 'Data analysis library'),
('NumPy', 'numpy', 'DATA', 'Numerical computing library'),
('Matplotlib', 'matplotlib', 'DATA', 'Data visualization library'),
('Apache Spark', 'apachespark', 'DATA', 'Big data processing'),
('Hadoop', 'hadoop', 'DATA', 'Distributed data processing'),
('SQL', 'sql', 'DATA', 'Data querying language'),
('Tableau', 'tableau', 'DATA', 'Business intelligence tool'),
('Power BI', 'powerbi', 'DATA', 'Microsoft analytics tool'),
('Kafka', 'kafka', 'DATA', 'Event streaming platform'),
('Nmap', 'nmap', 'CYBERSECURITY', 'Network scanner'),
('Wireshark', 'wireshark', 'CYBERSECURITY', 'Network protocol analyzer'),
('Burp Suite', 'burpsuite', 'CYBERSECURITY', 'Web security testing'),
('Metasploit', 'metasploit', 'CYBERSECURITY', 'Penetration testing framework'),
('Android', 'android', 'MOBILE', 'Android app development'),
('iOS', 'ios', 'MOBILE', 'iOS app development'),
('React Native', 'reactnative', 'MOBILE', 'Cross-platform mobile framework'),
('Flutter', 'flutter', 'MOBILE', 'Cross-platform mobile framework'),
('Figma', 'figma', 'UI_UX', 'Interface design tool'),
('Adobe XD', 'adobexd', 'UI_UX', 'Experience design tool'),
('Sketch', 'sketch', 'UI_UX', 'Design tool for macOS'),
('Git', 'git', 'TOOLS', 'Version control system'),
('VS Code', 'vscode', 'TOOLS', 'Source code editor'),
('Postman', 'postman', 'TOOLS', 'API development tool'),
('Jira', 'jira', 'TOOLS', 'Project management tool'),
('Confluence', 'confluence', 'TOOLS', 'Documentation platform'),
('Linux', 'linux', 'TOOLS', 'Operating system'),
('Vim', 'vim', 'TOOLS', 'Text editor'),
('System Design', 'systemdesign', 'SOFT_SKILLS', 'Software architecture and design'),
('Data Structures', 'datastructures', 'SOFT_SKILLS', 'Computer science fundamentals'),
('Algorithms', 'algorithms', 'SOFT_SKILLS', 'Algorithm design and analysis'),
('Problem Solving', 'problemsolving', 'SOFT_SKILLS', 'Analytical problem solving'),
('Team Leadership', 'teamleadership', 'SOFT_SKILLS', 'Leading and managing teams'),
('Communication', 'communication', 'SOFT_SKILLS', 'Effective communication skills'),
('Agile', 'agile', 'SOFT_SKILLS', 'Agile project methodology'),
('Conflict Resolution', 'conflictresolution', 'SOFT_SKILLS', 'Resolving workplace conflicts'),
('Networking', 'networking', 'SOFT_SKILLS', 'Professional networking');

ALTER TABLE student_profiles ADD COLUMN username VARCHAR(50) UNIQUE;
ALTER TABLE student_profiles ADD COLUMN graduation_year INTEGER;
ALTER TABLE student_profiles ADD COLUMN preferred_locations TEXT;



CREATE TABLE IF NOT EXISTS student_achievements (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    organization VARCHAR(200),
    achievement_date DATE,
    url VARCHAR(500),
    proof_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);



CREATE TABLE IF NOT EXISTS student_learning_skills (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    skill_id VARCHAR(36) NULL,
    skill_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'LEARNING' ,
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);



CREATE TABLE IF NOT EXISTS student_career_preferences (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL UNIQUE,
    preferred_roles TEXT,
    preferred_industries TEXT,
    preferred_work_type VARCHAR(20) ,
    preferred_locations TEXT,
    career_goal TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);



ALTER TABLE student_skills ADD COLUMN source VARCHAR(30) NOT NULL DEFAULT 'SELF_REPORTED' ;
ALTER TABLE student_skills ADD COLUMN verified TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE student_skills ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT NOW();

ALTER TABLE student_projects ADD COLUMN is_featured TINYINT(1) NOT NULL DEFAULT 0;

-- ============================================================
-- Source: V5__skill_taxonomy.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS skill_categories (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);



INSERT IGNORE INTO skill_categories (name, slug, display_order) VALUES
('Programming', 'programming', 1),
('Frontend', 'frontend', 2),
('Backend', 'backend', 3),
('Database', 'database', 4),
('Cloud', 'cloud', 5),
('DevOps', 'devops', 6),
('AI & ML', 'ai_ml', 7),
('Data Science', 'data_science', 8),
('Cybersecurity', 'cybersecurity', 9),
('Mobile', 'mobile', 10),
('UI/UX', 'ui_ux', 11),
('Software Engineering', 'software_engineering', 12),
('Testing', 'testing', 13),
('Tools', 'tools', 14),
('Soft Skills', 'soft_skills', 15);

ALTER TABLE skills ADD COLUMN category_id VARCHAR(36);

UPDATE skills SET category_id = (
    SELECT id FROM skill_categories WHERE lower(name) = lower(skills.category)
    OR slug = lower(replace(skills.category, ' ', '_'))
    OR slug = lower(skills.category)
);

CREATE TABLE IF NOT EXISTS skill_topics (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    skill_id VARCHAR(36) NOT NULL,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(240) NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (skill_id, slug)
);




CREATE TABLE IF NOT EXISTS skill_subtopics (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    topic_id VARCHAR(36) NOT NULL,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(240) NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (topic_id, slug)
);



CREATE TABLE IF NOT EXISTS skill_relationships (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    source_skill_id VARCHAR(36) NOT NULL,
    target_skill_id VARCHAR(36) NOT NULL,
    relationship_type VARCHAR(20) NOT NULL ,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (source_skill_id, target_skill_id, relationship_type)
);




CREATE TABLE IF NOT EXISTS topic_relationships (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    source_topic_id VARCHAR(36) NOT NULL,
    target_topic_id VARCHAR(36) NOT NULL,
    relationship_type VARCHAR(20) NOT NULL ,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (source_topic_id, target_topic_id, relationship_type)
);



CREATE TABLE IF NOT EXISTS student_learning_topics (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    topic_id VARCHAR(36) NOT NULL,
    subtopic_id VARCHAR(36) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'LEARNING' ,
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, topic_id)
);




CREATE TABLE IF NOT EXISTS student_skill_progress (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    skill_id VARCHAR(36) NOT NULL,
    topic_id VARCHAR(36) NULL,
    subtopic_id VARCHAR(36) NULL,
    progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    learning_stage VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED' ,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);




-- Seed Java taxonomy

-- Seed SQL taxonomy

-- Seed React taxonomy

-- Seed Python taxonomy

-- Seed Docker taxonomy

-- Seed Spring Boot taxonomy

-- Seed Node.js taxonomy

-- Seed skill relationships
INSERT IGNORE INTO skill_relationships (source_skill_id, target_skill_id, relationship_type)
SELECT s1.id, s2.id, 'PREREQUISITE'
FROM skills s1, skills s2
WHERE s1.slug = 'javascript' AND s2.slug = 'react'
;

INSERT IGNORE INTO skill_relationships (source_skill_id, target_skill_id, relationship_type)
SELECT s1.id, s2.id, 'PREREQUISITE'
FROM skills s1, skills s2
WHERE s1.slug = 'javascript' AND s2.slug = 'nodejs'
;

INSERT IGNORE INTO skill_relationships (source_skill_id, target_skill_id, relationship_type)
SELECT s1.id, s2.id, 'PREREQUISITE'
FROM skills s1, skills s2
WHERE s1.slug = 'java' AND s2.slug = 'springboot'
;

INSERT IGNORE INTO skill_relationships (source_skill_id, target_skill_id, relationship_type)
SELECT s1.id, s2.id, 'PREREQUISITE'
FROM skills s1, skills s2
WHERE s1.slug = 'java' AND s2.slug = 'kotlin'
;

INSERT IGNORE INTO skill_relationships (source_skill_id, target_skill_id, relationship_type)
SELECT s1.id, s2.id, 'RELATED'
FROM skills s1, skills s2
WHERE s1.slug = 'react' AND s2.slug = 'vuejs'
;

INSERT IGNORE INTO skill_relationships (source_skill_id, target_skill_id, relationship_type)
SELECT s1.id, s2.id, 'RELATED'
FROM skills s1, skills s2
WHERE s1.slug = 'django' AND s2.slug = 'flask'
;

INSERT IGNORE INTO skill_relationships (source_skill_id, target_skill_id, relationship_type)
SELECT s1.id, s2.id, 'RELATED'
FROM skills s1, skills s2
WHERE s1.slug = 'postgresql' AND s2.slug = 'mysql'
;

INSERT IGNORE INTO skill_relationships (source_skill_id, target_skill_id, relationship_type)
SELECT s1.id, s2.id, 'PREREQUISITE'
FROM skills s1, skills s2
WHERE s1.slug = 'html' AND s2.slug = 'react'
;

INSERT IGNORE INTO skill_relationships (source_skill_id, target_skill_id, relationship_type)
SELECT s1.id, s2.id, 'PREREQUISITE'
FROM skills s1, skills s2
WHERE s1.slug = 'css' AND s2.slug = 'react'
;

-- ============================================================
-- Source: V6__question_bank.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS questions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    skill_id VARCHAR(36) NULL,
    topic_id VARCHAR(36) NULL,
    subtopic_id VARCHAR(36) NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    question_type VARCHAR(30) NOT NULL ,
    difficulty VARCHAR(10) NOT NULL ,
    evaluation_method VARCHAR(20) NOT NULL DEFAULT 'EXACT_MATCH' ,
    expected_output TEXT,
    code_template TEXT,
    solution TEXT,
    explanation TEXT,
    time_limit_seconds INTEGER,
    memory_limit_mb INTEGER,
    tags TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' ,
    version INTEGER NOT NULL DEFAULT 1,
    created_by VARCHAR(36),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);







CREATE TABLE IF NOT EXISTS question_options (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    question_id VARCHAR(36) NOT NULL,
    option_text TEXT NOT NULL,
    is_correct TINYINT(1) NOT NULL DEFAULT 0,
    display_order INTEGER NOT NULL DEFAULT 0,
    explanation TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);



CREATE TABLE IF NOT EXISTS question_test_cases (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    question_id VARCHAR(36) NOT NULL,
    input_data TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_sample TINYINT(1) NOT NULL DEFAULT 0,
    display_order INTEGER NOT NULL DEFAULT 0,
    hidden TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);



CREATE TABLE IF NOT EXISTS student_question_attempts (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    question_id VARCHAR(36) NOT NULL,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    user_answer TEXT,
    is_correct TINYINT(1),
    time_spent_seconds INTEGER,
    score DECIMAL(5,2),
    feedback TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED' ,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);





CREATE TABLE IF NOT EXISTS student_practice_stats (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL UNIQUE,
    total_attempted INTEGER NOT NULL DEFAULT 0,
    total_solved INTEGER NOT NULL DEFAULT 0,
    easy_solved INTEGER NOT NULL DEFAULT 0,
    medium_solved INTEGER NOT NULL DEFAULT 0,
    hard_solved INTEGER NOT NULL DEFAULT 0,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_practice_date DATE,
    total_time_seconds BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_topic_progress (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    topic_id VARCHAR(36) NOT NULL,
    questions_attempted INTEGER NOT NULL DEFAULT 0,
    questions_solved INTEGER NOT NULL DEFAULT 0,
    accuracy DECIMAL(5,2) DEFAULT 0,
    last_attempt_at TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, topic_id)
);



CREATE TABLE IF NOT EXISTS daily_challenges (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    challenge_date DATE NOT NULL,
    question_id VARCHAR(36) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' ,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    time_spent_seconds INTEGER,
    is_correct TINYINT(1),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, challenge_date)
);




CREATE TABLE IF NOT EXISTS coin_wallets (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL UNIQUE,
    balance BIGINT NOT NULL DEFAULT 0,
    total_earned BIGINT NOT NULL DEFAULT 0,
    total_spent BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coin_transactions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    amount BIGINT NOT NULL,
    type VARCHAR(20) NOT NULL ,
    reason VARCHAR(100) NOT NULL,
    reference_type VARCHAR(50),
    reference_id VARCHAR(36),
    balance_after BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);




CREATE TABLE IF NOT EXISTS coin_rules (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    action VARCHAR(100) NOT NULL UNIQUE,
    coins_amount BIGINT NOT NULL,
    description TEXT,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    daily_limit INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT IGNORE INTO coin_rules (action, coins_amount, description, daily_limit) VALUES
('DAILY_CHALLENGE_COMPLETED', 20, 'Complete the daily challenge', 1),
('QUESTION_SOLVED_EASY', 5, 'Solve an easy question', 50),
('QUESTION_SOLVED_MEDIUM', 10, 'Solve a medium question', 30),
('QUESTION_SOLVED_HARD', 25, 'Solve a hard question', 15),
('TOPIC_COMPLETED', 50, 'Complete all topics in a skill', NULL),
('7_DAY_STREAK', 100, 'Maintain a 7-day practice streak', NULL),
('30_DAY_STREAK', 500, 'Maintain a 30-day practice streak', NULL),
('WEEKEND_TEST_COMPLETED', 100, 'Complete a weekend test', 1),
('CERTIFICATION_ADDED', 30, 'Add a verified certification', NULL),
('FIRST_SOLVE', 10, 'Solve your first question', NULL),
('COMPANY_ASSESSMENT_APPLICATION', -500, 'Apply to a company assessment', NULL);

CREATE TABLE IF NOT EXISTS student_streaks (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL UNIQUE,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_activity_date DATE,
    streak_freezes_used INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_achievements_gamification (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    achievement_key VARCHAR(100) NOT NULL,
    achievement_name VARCHAR(200) NOT NULL,
    description TEXT,
    badge_icon VARCHAR(10),
    earned_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, achievement_key)
);



CREATE TABLE IF NOT EXISTS leaderboards (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    board_type VARCHAR(50) NOT NULL,
    board_scope VARCHAR(100),
    score BIGINT NOT NULL DEFAULT 0,
    rank_position INTEGER,
    period VARCHAR(20) NOT NULL ,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, board_type, board_scope, period)
);



CREATE TABLE IF NOT EXISTS tests (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    test_type VARCHAR(30) NOT NULL ,
    duration_minutes INTEGER NOT NULL,
    difficulty VARCHAR(10) ,
    total_questions INTEGER NOT NULL DEFAULT 0,
    passing_score DECIMAL(5,2),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' ,
    created_by VARCHAR(36),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS test_questions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    test_id VARCHAR(36) NOT NULL,
    question_id VARCHAR(36) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    marks INTEGER NOT NULL DEFAULT 1,
    UNIQUE (test_id, question_id)
);



CREATE TABLE IF NOT EXISTS test_attempts (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    test_id VARCHAR(36) NOT NULL,
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    submitted_at TIMESTAMP,
    score DECIMAL(8,2),
    total_marks DECIMAL(8,2),
    accuracy DECIMAL(5,2),
    time_spent_seconds INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS' ,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);




CREATE TABLE IF NOT EXISTS learning_programs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    program_type VARCHAR(30) NOT NULL ,
    provider VARCHAR(200),
    skill_id VARCHAR(36),
    topic_id VARCHAR(36),
    difficulty VARCHAR(10),
    duration_hours INTEGER,
    cost DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'INR',
    url VARCHAR(500),
    is_free TINYINT(1) NOT NULL DEFAULT 1,
    rating DECIMAL(3,2),
    enrolled_count INTEGER DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);




CREATE TABLE IF NOT EXISTS company_opportunities (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_user_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    opportunity_type VARCHAR(30) NOT NULL ,
    location VARCHAR(200),
    is_remote TINYINT(1) DEFAULT 0,
    min_cgpa DECIMAL(4,2),
    eligible_departments TEXT,
    eligible_graduation_years TEXT,
    required_skills TEXT,
    preferred_skills TEXT,
    min_beyon_coins INTEGER DEFAULT 0,
    assessment_id VARCHAR(36),
    application_count INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' ,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);




CREATE TABLE IF NOT EXISTS opportunity_assessments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    opportunity_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    total_questions INTEGER NOT NULL DEFAULT 0,
    coin_cost INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' ,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS opportunity_applications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    opportunity_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' ,
    coins_spent INTEGER DEFAULT 0,
    assessment_score DECIMAL(8,2),
    applied_at TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (opportunity_id, student_id)
);




CREATE TABLE IF NOT EXISTS student_saved_questions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    question_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, question_id)
);

-- ============================================================
-- Source: V7__institution_recruitment.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS institution_roles (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    institution_user_id VARCHAR(36) NOT NULL,
    role_type VARCHAR(50) NOT NULL ,
    department VARCHAR(200),
    permissions TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (institution_user_id, role_type)
);



CREATE TABLE IF NOT EXISTS institution_students (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    institution_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    department VARCHAR(200),
    batch VARCHAR(20),
    admission_year INTEGER,
    graduation_year INTEGER,
    placement_status VARCHAR(30) NOT NULL DEFAULT 'UNPLACED' ,
    verified TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (institution_id, student_id)
);





CREATE TABLE IF NOT EXISTS student_academic_records (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    institution_id VARCHAR(36),
    semester INTEGER,
    academic_year VARCHAR(20),
    cgpa DECIMAL(4,2),
    total_credits INTEGER,
    department VARCHAR(200),
    graduation_year INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);



CREATE TABLE IF NOT EXISTS placement_records (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    institution_id VARCHAR(36),
    company_name VARCHAR(200) NOT NULL,
    company_tier VARCHAR(20) ,
    role_title VARCHAR(200),
    package_lpa DECIMAL(8,2),
    placement_date DATE,
    placement_type VARCHAR(30) ,
    status VARCHAR(30) NOT NULL DEFAULT 'OFFERED' ,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);




CREATE TABLE IF NOT EXISTS institution_rating_snapshots (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    institution_id VARCHAR(36) NOT NULL,
    overall_rating DECIMAL(3,2),
    academic_score DECIMAL(3,2),
    placement_score DECIMAL(3,2),
    salary_score DECIMAL(3,2),
    industry_score DECIMAL(3,2),
    skill_score DECIMAL(3,2),
    total_students INTEGER,
    students_placed INTEGER,
    placement_percentage DECIMAL(5,2),
    average_package DECIMAL(8,2),
    highest_package DECIMAL(8,2),
    tier1_count INTEGER DEFAULT 0,
    tier2_count INTEGER DEFAULT 0,
    companies_visited INTEGER DEFAULT 0,
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);




CREATE TABLE IF NOT EXISTS company_targeting_rules (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_user_id VARCHAR(36) NOT NULL,
    opportunity_id VARCHAR(36),
    target_institution_ids TEXT,
    target_min_rating DECIMAL(3,2),
    target_departments TEXT,
    target_batches TEXT,
    target_graduation_years TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);



CREATE TABLE IF NOT EXISTS placement_drives (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    opportunity_id VARCHAR(36) NOT NULL,
    institution_id VARCHAR(36) NOT NULL,
    company_user_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' ,
    eligible_student_count INTEGER DEFAULT 0,
    applied_count INTEGER DEFAULT 0,
    assessed_count INTEGER DEFAULT 0,
    shortlisted_count INTEGER DEFAULT 0,
    interviewed_count INTEGER DEFAULT 0,
    selected_count INTEGER DEFAULT 0,
    drive_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);





CREATE TABLE IF NOT EXISTS follows (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    follower_id VARCHAR(36) NOT NULL,
    following_id VARCHAR(36) NOT NULL,
    follow_type VARCHAR(30) NOT NULL ,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (follower_id, following_id, follow_type)
);




CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    reference_type VARCHAR(50),
    reference_id VARCHAR(36),
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    channel VARCHAR(20) NOT NULL DEFAULT 'IN_APP' ,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);





CREATE TABLE IF NOT EXISTS recruitment_applications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    opportunity_id VARCHAR(36) NOT NULL,
    drive_id VARCHAR(36),
    institution_id VARCHAR(36),
    status VARCHAR(30) NOT NULL DEFAULT 'ELIGIBLE' ,
    assessment_score DECIMAL(8,2),
    interview_score DECIMAL(8,2),
    notes TEXT,
    coins_spent INTEGER DEFAULT 0,
    applied_at TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (opportunity_id, student_id)
);






CREATE TABLE IF NOT EXISTS recruitment_status_history (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    application_id VARCHAR(36) NOT NULL,
    from_status VARCHAR(30),
    to_status VARCHAR(30) NOT NULL,
    changed_by VARCHAR(36),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Source: V8__assessment_system.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS assessment_policies (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_user_id VARCHAR(36) NOT NULL,
    opportunity_id VARCHAR(36),
    name VARCHAR(200) NOT NULL,
    max_warnings_before_flag INTEGER NOT NULL DEFAULT 3,
    max_warnings_before_terminate INTEGER NOT NULL DEFAULT 5,
    critical_violation_terminate TINYINT(1) NOT NULL DEFAULT 1,
    allow_camera_toggle TINYINT(1) NOT NULL DEFAULT 0,
    allow_fullscreen_exit TINYINT(1) NOT NULL DEFAULT 0,
    max_fullscreen_exits INTEGER NOT NULL DEFAULT 3,
    max_session_interruptions INTEGER NOT NULL DEFAULT 2,
    time_extension_allowed TINYINT(1) NOT NULL DEFAULT 0,
    auto_submit_on_expire TINYINT(1) NOT NULL DEFAULT 1,
    record_screen TINYINT(1) NOT NULL DEFAULT 1,
    record_camera TINYINT(1) NOT NULL DEFAULT 1,
    record_audio TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);



CREATE TABLE IF NOT EXISTS assessment_sessions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    application_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    opportunity_id VARCHAR(36) NOT NULL,
    policy_id VARCHAR(36),
    session_token VARCHAR(256) NOT NULL UNIQUE,
    launch_token VARCHAR(256),
    launch_token_used TINYINT(1) NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'CREATED' ,
    device_fingerprint VARCHAR(512),
    device_info JSON,
    ip_address VARCHAR(45),
    total_questions INTEGER NOT NULL DEFAULT 0,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    started_at TIMESTAMP,
    submitted_at TIMESTAMP,
    completed_at TIMESTAMP,
    expires_at TIMESTAMP,
    last_heartbeat_at TIMESTAMP,
    last_autosave_at TIMESTAMP,
    connection_lost_count INTEGER NOT NULL DEFAULT 0,
    fullscreen_exit_count INTEGER NOT NULL DEFAULT 0,
    window_focus_lost_count INTEGER NOT NULL DEFAULT 0,
    warning_count INTEGER NOT NULL DEFAULT 0,
    critical_event_count INTEGER NOT NULL DEFAULT 0,
    score DECIMAL(8,2),
    accuracy DECIMAL(5,2),
    questions_attempted INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    time_used_seconds INTEGER DEFAULT 0,
    skill_performance JSON,
    topic_performance JSON,
    proctoring_summary JSON,
    integrity_status VARCHAR(30) DEFAULT 'CLEAN' ,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (application_id)
);







CREATE TABLE IF NOT EXISTS assessment_answers (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    session_id VARCHAR(36) NOT NULL,
    question_id VARCHAR(36) NOT NULL,
    selected_option_id VARCHAR(36),
    answer_text TEXT,
    code_answer TEXT,
    time_spent_seconds INTEGER DEFAULT 0,
    is_correct TINYINT(1),
    marks_awarded DECIMAL(8,2) DEFAULT 0,
    marked_for_review TINYINT(1) NOT NULL DEFAULT 0,
    answered_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (session_id, question_id)
);



CREATE TABLE IF NOT EXISTS assessment_question_order (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    session_id VARCHAR(36) NOT NULL,
    question_id VARCHAR(36) NOT NULL,
    sort_order INTEGER NOT NULL,
    UNIQUE (session_id, question_id)
);



CREATE TABLE IF NOT EXISTS proctoring_events (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    session_id VARCHAR(36) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL ,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    metadata JSON,
    confidence DECIMAL(3,2),
    screenshot_url VARCHAR(500),
    timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);






CREATE TABLE IF NOT EXISTS audit_events (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    session_id VARCHAR(36) NULL,
    user_id VARCHAR(36) NULL,
    event_type VARCHAR(50) NOT NULL,
    action VARCHAR(200) NOT NULL,
    details JSON,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);






CREATE TABLE IF NOT EXISTS identity_verifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    session_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' ,
    camera_capture_url VARCHAR(500),
    face_detected TINYINT(1),
    face_count INTEGER DEFAULT 0,
    liveness_score DECIMAL(3,2),
    verification_method VARCHAR(30) DEFAULT 'FACE_MATCH',
    verified_at TIMESTAMP,
    metadata JSON,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);



CREATE TABLE IF NOT EXISTS system_check_results (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    session_id VARCHAR(36) NOT NULL,
    check_type VARCHAR(30) NOT NULL ,
    status VARCHAR(20) NOT NULL ,
    details JSON,
    checked_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Source: V9_1__seed_career_paths.sql
-- ============================================================

INSERT IGNORE INTO career_paths (name, slug, description, category, required_skills, optional_skills, typical_education, salary_range, growth_outlook) VALUES
('Backend Developer', 'backend-developer', 'Build scalable server-side applications, APIs, and microservices. Work with databases, caching, and cloud infrastructure.', 'Engineering', '["Java","SQL","Spring Boot","REST APIs","Docker","Redis","Git"]', '["Kubernetes","MongoDB","Kafka","GraphQL"]', 'B.Tech Computer Science or equivalent', '₹6-18 LPA', 'High — 25% YoY growth'),
('Frontend Developer', 'frontend-developer', 'Create responsive, performant web interfaces. Master modern frameworks, state management, and design systems.', 'Engineering', '["JavaScript","TypeScript","React","CSS","HTML","Git","Responsive Design"]', '["Next.js","Tailwind CSS","Redux","Testing"]', 'B.Tech Computer Science or equivalent', '₹5-16 LPA', 'High — 22% YoY growth'),
('Full Stack Developer', 'full-stack-developer', 'End-to-end web development spanning frontend UI, backend APIs, databases, and deployment.', 'Engineering', '["JavaScript","TypeScript","React","Node.js","SQL","Git","REST APIs"]', '["Next.js","Docker","PostgreSQL","Redis"]', 'B.Tech Computer Science or equivalent', '₹7-20 LPA', 'Very High — 28% YoY growth'),
('Data Scientist', 'data-scientist', 'Extract insights from complex data using statistics, machine learning, and programming.', 'Data & Analytics', '["Python","SQL","Machine Learning","Statistics","Pandas","NumPy","Data Visualization"]', '["TensorFlow","PySpark","Hadoop","Deep Learning"]', 'B.Tech/MTech with specialization in Data Science or Statistics', '₹8-25 LPA', 'Very High — 35% YoY growth'),
('AI Engineer', 'ai-engineer', 'Build and deploy AI/ML models, design intelligent systems, and work with large language models.', 'Data & Analytics', '["Python","Machine Learning","Deep Learning","TensorFlow","NLP","Computer Vision"]', '["PyTorch","LLMs","MLOps","Kubernetes"]', 'B.Tech/MTech in CS or AI specialization', '₹10-30 LPA', 'Extremely High — 40% YoY growth'),
('DevOps Engineer', 'devOps-engineer', 'Bridge development and operations with CI/CD, infrastructure automation, and cloud platform expertise.', 'Infrastructure', '["Linux","Docker","Kubernetes","CI/CD","AWS","Terraform","Git"]', '["Ansible","Prometheus","Jenkins","Azure"]', 'B.Tech Computer Science or equivalent', '₹7-22 LPA', 'High — 25% YoY growth'),
('Cloud Engineer', 'cloud-engineer', 'Design, build, and manage cloud infrastructure and services on major cloud platforms.', 'Infrastructure', '["AWS","Azure","Terraform","Docker","Kubernetes","Linux","Networking"]', '["GCP","Serverless","Cost Optimization","Security"]', 'B.Tech with Cloud Computing specialization', '₹8-24 LPA', 'High — 23% YoY growth'),
('Cybersecurity Engineer', 'cybersecurity-engineer', 'Protect systems and networks from cyber threats. Design security architecture and conduct audits.', 'Security', '["Network Security","Cryptography","Penetration Testing","SIEM","Linux","Python"]', '["Cloud Security","Compliance","Incident Response","Forensics"]', 'B.Tech CS or Cybersecurity specialization', '₹6-20 LPA', 'High — 25% YoY growth')
;

INSERT IGNORE INTO career_path_skills (career_path_id, skill_id, required, proficiency_level, sort_order)
SELECT cp.id, s.id, 1, 'INTERMEDIATE', ROW_NUMBER() OVER (ORDER BY s.name)
FROM career_paths cp
CROSS JOIN skills s
WHERE cp.slug = 'backend-developer' AND s.name IN ('Java', 'SQL', 'Docker', 'Redis')
;

INSERT IGNORE INTO career_path_skills (career_path_id, skill_id, required, proficiency_level, sort_order)
SELECT cp.id, s.id, 1, 'INTERMEDIATE', ROW_NUMBER() OVER (ORDER BY s.name)
FROM career_paths cp
CROSS JOIN skills s
WHERE cp.slug = 'frontend-developer' AND s.name IN ('React', 'CSS')
;

INSERT IGNORE INTO career_path_skills (career_path_id, skill_id, required, proficiency_level, sort_order)
SELECT cp.id, s.id, 1, 'INTERMEDIATE', ROW_NUMBER() OVER (ORDER BY s.name)
FROM career_paths cp
CROSS JOIN skills s
WHERE cp.slug = 'full-stack-developer' AND s.name IN ('React', 'Java', 'SQL')
;

INSERT IGNORE INTO career_path_skills (career_path_id, skill_id, required, proficiency_level, sort_order)
SELECT cp.id, s.id, 1, 'INTERMEDIATE', ROW_NUMBER() OVER (ORDER BY s.name)
FROM career_paths cp
CROSS JOIN skills s
WHERE cp.slug = 'data-scientist' AND s.name IN ('Python', 'SQL', 'Machine Learning')
;

INSERT IGNORE INTO career_path_skills (career_path_id, skill_id, required, proficiency_level, sort_order)
SELECT cp.id, s.id, 1, 'INTERMEDIATE', ROW_NUMBER() OVER (ORDER BY s.name)
FROM career_paths cp
CROSS JOIN skills s
WHERE cp.slug = 'ai-engineer' AND s.name IN ('Python', 'Machine Learning')
;

INSERT IGNORE INTO career_path_skills (career_path_id, skill_id, required, proficiency_level, sort_order)
SELECT cp.id, s.id, 1, 'INTERMEDIATE', ROW_NUMBER() OVER (ORDER BY s.name)
FROM career_paths cp
CROSS JOIN skills s
WHERE cp.slug = 'devops-engineer' AND s.name IN ('Docker', 'SQL')
;

-- ============================================================
-- Source: V9__recruitment_intelligence.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS assessment_skill_scores (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    session_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    skill_id VARCHAR(36) NOT NULL,
    topic VARCHAR(200),
    score DECIMAL(5,2) NOT NULL DEFAULT 0,
    accuracy DECIMAL(5,2) NOT NULL DEFAULT 0,
    questions_attempted INTEGER NOT NULL DEFAULT 0,
    questions_correct INTEGER NOT NULL DEFAULT 0,
    time_spent_seconds INTEGER NOT NULL DEFAULT 0,
    difficulty_avg DECIMAL(3,2),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (session_id, skill_id, topic)
);





CREATE TABLE IF NOT EXISTS student_skill_intelligence (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    skill_id VARCHAR(36) NOT NULL,
    proficiency_level VARCHAR(30) NOT NULL DEFAULT 'BEGINNER' ,
    confidence_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    evidence_count INTEGER NOT NULL DEFAULT 0,
    total_questions_solved INTEGER NOT NULL DEFAULT 0,
    accuracy DECIMAL(5,2) NOT NULL DEFAULT 0,
    assessment_count INTEGER NOT NULL DEFAULT 0,
    certification_count INTEGER NOT NULL DEFAULT 0,
    project_count INTEGER NOT NULL DEFAULT 0,
    practice_count INTEGER NOT NULL DEFAULT 0,
    improvement_trend VARCHAR(20) DEFAULT 'STABLE' ,
    last_assessed_at TIMESTAMP,
    verified TINYINT(1) NOT NULL DEFAULT 0,
    evidence_summary JSON,
    score_history JSON,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, skill_id)
);





CREATE TABLE IF NOT EXISTS career_paths (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(100),
    required_skills JSON NOT NULL DEFAULT '[]',
    optional_skills JSON DEFAULT '[]',
    typical_education VARCHAR(200),
    salary_range VARCHAR(100),
    growth_outlook VARCHAR(100),
    active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);




CREATE TABLE IF NOT EXISTS career_path_skills (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    career_path_id VARCHAR(36) NOT NULL,
    skill_id VARCHAR(36) NOT NULL,
    required TINYINT(1) NOT NULL DEFAULT 1,
    proficiency_level VARCHAR(30) NOT NULL DEFAULT 'INTERMEDIATE',
    sort_order INTEGER NOT NULL DEFAULT 0,
    prerequisites TEXT,
    UNIQUE (career_path_id, skill_id)
);



CREATE TABLE IF NOT EXISTS student_career_progress (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    career_path_id VARCHAR(36) NOT NULL,
    target_level VARCHAR(30) NOT NULL DEFAULT 'INTERMEDIATE',
    readiness_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    skills_acquired INTEGER NOT NULL DEFAULT 0,
    skills_total INTEGER NOT NULL DEFAULT 0,
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, career_path_id)
);



CREATE TABLE IF NOT EXISTS matching_scores (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    opportunity_id VARCHAR(36) NOT NULL,
    total_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    skill_score DECIMAL(5,2) DEFAULT 0,
    academic_score DECIMAL(5,2) DEFAULT 0,
    assessment_score DECIMAL(5,2) DEFAULT 0,
    experience_score DECIMAL(5,2) DEFAULT 0,
    match_factors JSON,
    matched_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, opportunity_id)
);





CREATE TABLE IF NOT EXISTS skill_gaps (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    career_path_id VARCHAR(36),
    opportunity_id VARCHAR(36),
    required_skill_id VARCHAR(36) NOT NULL,
    current_level VARCHAR(30) NOT NULL DEFAULT 'NONE',
    required_level VARCHAR(30) NOT NULL,
    gap_severity VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' ,
    recommendation TEXT,
    estimated_effort_hours INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, required_skill_id, career_path_id)
);



CREATE TABLE IF NOT EXISTS interview_rounds (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    opportunity_id VARCHAR(36) NOT NULL,
    name VARCHAR(200) NOT NULL,
    round_type VARCHAR(50) NOT NULL ,
    sort_order INTEGER NOT NULL DEFAULT 0,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    max_score DECIMAL(5,2) NOT NULL DEFAULT 100,
    description TEXT,
    is eliminative TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);



CREATE TABLE IF NOT EXISTS interview_schedules (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    application_id VARCHAR(36) NOT NULL,
    round_id VARCHAR(36) NOT NULL,
    interviewer_id VARCHAR(36),
    scheduled_at TIMESTAMP,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    location VARCHAR(500),
    meeting_link VARCHAR(500),
    status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED' ,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);





CREATE TABLE IF NOT EXISTS interview_scorecards (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    schedule_id VARCHAR(36) NOT NULL,
    interviewer_id VARCHAR(36) NOT NULL,
    scores JSON NOT NULL DEFAULT '{}',
    overall_score DECIMAL(5,2),
    recommendation VARCHAR(30) ,
    strengths TEXT,
    weaknesses TEXT,
    notes TEXT,
    submitted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);



CREATE TABLE IF NOT EXISTS institution_analytics_snapshots (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    institution_id VARCHAR(36) NOT NULL,
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_students INTEGER DEFAULT 0,
    placement_seeking INTEGER DEFAULT 0,
    placed INTEGER DEFAULT 0,
    placement_rate DECIMAL(5,2) DEFAULT 0,
    average_package DECIMAL(8,2) DEFAULT 0,
    highest_package DECIMAL(8,2) DEFAULT 0,
    tier1_count INTEGER DEFAULT 0,
    tier2_count INTEGER DEFAULT 0,
    companies_visited INTEGER DEFAULT 0,
    department_stats JSON,
    skill_demand JSON,
    assessment_performance JSON,
    salary_distribution JSON,
    placement_trend JSON,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (institution_id, snapshot_date)
);



CREATE TABLE IF NOT EXISTS company_analytics_snapshots (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_user_id VARCHAR(36) NOT NULL,
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_applications INTEGER DEFAULT 0,
    total_assessments INTEGER DEFAULT 0,
    total_shortlisted INTEGER DEFAULT 0,
    total_interviews INTEGER DEFAULT 0,
    total_selected INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    avg_assessment_score DECIMAL(5,2) DEFAULT 0,
    avg_time_to_hire_days INTEGER DEFAULT 0,
    institution_performance JSON,
    skill_distribution JSON,
    funnel_data JSON,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (company_user_id, snapshot_date)
);



CREATE TABLE IF NOT EXISTS collaboration_programs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    host_user_id VARCHAR(36) NOT NULL,
    host_type VARCHAR(30) NOT NULL ,
    program_type VARCHAR(50) NOT NULL ,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    topic VARCHAR(200),
    target_skills JSON DEFAULT '[]',
    target_audience VARCHAR(30) ,
    target_institution_ids TEXT,
    target_departments TEXT,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    max_participants INTEGER,
    current_participants INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' ,
    location VARCHAR(500),
    meeting_link VARCHAR(500),
    prerequisites TEXT,
    certificate_provided TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);





CREATE TABLE IF NOT EXISTS collaboration_registrations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    program_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'REGISTERED' ,
    feedback TEXT,
    rating DECIMAL(2,1),
    certificate_url VARCHAR(500),
    registered_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,
    UNIQUE (program_id, user_id)
);




CREATE TABLE IF NOT EXISTS student_portfolio_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    item_type VARCHAR(50) NOT NULL ,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    organization VARCHAR(200),
    issued_date DATE,
    credential_url VARCHAR(500),
    verified TINYINT(1) NOT NULL DEFAULT 0,
    verified_by VARCHAR(36),
    metadata JSON,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Source: V10__social_community_platform.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS social_posts (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    author_id VARCHAR(36) NOT NULL,
    author_type VARCHAR(30) NOT NULL ,
    post_type VARCHAR(30) NOT NULL DEFAULT 'TEXT' ,
    title VARCHAR(300),
    content TEXT NOT NULL,
    media_urls JSON DEFAULT '[]',
    reference_type VARCHAR(50),
    reference_id VARCHAR(36),
    like_count INTEGER NOT NULL DEFAULT 0,
    comment_count INTEGER NOT NULL DEFAULT 0,
    share_count INTEGER NOT NULL DEFAULT 0,
    visibility VARCHAR(20) NOT NULL DEFAULT 'PUBLIC' ,
    is_pinned TINYINT(1) NOT NULL DEFAULT 0,
    tags JSON DEFAULT '[]',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);






CREATE TABLE IF NOT EXISTS social_comments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    post_id VARCHAR(36) NOT NULL,
    author_id VARCHAR(36) NOT NULL,
    parent_comment_id VARCHAR(36),
    content TEXT NOT NULL,
    like_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);




CREATE TABLE IF NOT EXISTS social_likes (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    target_type VARCHAR(30) NOT NULL ,
    target_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, target_type, target_id)
);



CREATE TABLE IF NOT EXISTS discussion_categories (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(10),
    color VARCHAR(7),
    parent_category_id VARCHAR(36),
    thread_count INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS discussion_threads (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    category_id VARCHAR(36) NOT NULL,
    author_id VARCHAR(36) NOT NULL,
    title VARCHAR(300) NOT NULL,
    content TEXT NOT NULL,
    tags JSON DEFAULT '[]',
    reply_count INTEGER NOT NULL DEFAULT 0,
    view_count INTEGER NOT NULL DEFAULT 0,
    like_count INTEGER NOT NULL DEFAULT 0,
    is_pinned TINYINT(1) NOT NULL DEFAULT 0,
    is_locked TINYINT(1) NOT NULL DEFAULT 0,
    solved TINYINT(1) NOT NULL DEFAULT 0,
    last_reply_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);





CREATE TABLE IF NOT EXISTS discussion_replies (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    thread_id VARCHAR(36) NOT NULL,
    author_id VARCHAR(36) NOT NULL,
    parent_reply_id VARCHAR(36),
    content TEXT NOT NULL,
    like_count INTEGER NOT NULL DEFAULT 0,
    is_accepted_answer TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);




CREATE TABLE IF NOT EXISTS verified_achievements (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    achievement_type VARCHAR(50) NOT NULL ,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    issuing_organization VARCHAR(200),
    issue_date DATE,
    expiry_date DATE,
    credential_id VARCHAR(200),
    credential_url VARCHAR(500),
    verification_status VARCHAR(30) NOT NULL DEFAULT 'PENDING' ,
    verified_by VARCHAR(36),
    verified_at TIMESTAMP,
    evidence_urls JSON DEFAULT '[]',
    metadata JSON,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);





CREATE TABLE IF NOT EXISTS message_conversations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    conversation_type VARCHAR(20) NOT NULL DEFAULT 'DIRECT' ,
    title VARCHAR(200),
    last_message_at TIMESTAMP,
    last_message_preview VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS message_participants (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    conversation_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    unread_count INTEGER NOT NULL DEFAULT 0,
    last_read_at TIMESTAMP,
    joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (conversation_id, user_id)
);




CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    conversation_id VARCHAR(36) NOT NULL,
    sender_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(20) NOT NULL DEFAULT 'TEXT' ,
    attachment_url VARCHAR(500),
    is_edited TINYINT(1) NOT NULL DEFAULT 0,
    is_deleted TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);





CREATE TABLE IF NOT EXISTS notification_preferences (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    in_app_enabled TINYINT(1) NOT NULL DEFAULT 1,
    email_enabled TINYINT(1) NOT NULL DEFAULT 0,
    push_enabled TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, notification_type)
);



CREATE TABLE IF NOT EXISTS content_resources (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    author_id VARCHAR(36) NOT NULL,
    resource_type VARCHAR(30) NOT NULL ,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    skill_ids TEXT,
    difficulty VARCHAR(20) ,
    is_free TINYINT(1) NOT NULL DEFAULT 1,
    view_count INTEGER NOT NULL DEFAULT 0,
    bookmark_count INTEGER NOT NULL DEFAULT 0,
    rating DECIMAL(2,1),
    tags JSON DEFAULT '[]',
    status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED' ,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);





CREATE TABLE IF NOT EXISTS content_bookmarks (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    resource_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, resource_id)
);

CREATE TABLE IF NOT EXISTS admin_audit_log (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    admin_id VARCHAR(36) NOT NULL,
    action VARCHAR(200) NOT NULL,
    target_type VARCHAR(50),
    target_id VARCHAR(36),
    details JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);




CREATE TABLE IF NOT EXISTS platform_metrics (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_type VARCHAR(20) NOT NULL DEFAULT 'COUNTER' ,
    tags JSON,
    recorded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Source: V11__reputation_social_enhancements.sql
-- ============================================================

-- V11: Reputation, Social Enhancements, Project Verification, Smart Notifications

-- Follow counts cache on users (read from follows table, but cached for performance)
ALTER TABLE users ADD COLUMN follower_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN following_count INTEGER NOT NULL DEFAULT 0;

-- Discussion reputation tracking
CREATE TABLE IF NOT EXISTS reputation_events (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    points INTEGER NOT NULL,
    reference_type VARCHAR(50),
    reference_id VARCHAR(36),
    created_at TIMESTAMP NOT NULL DEFAULT now()
);


-- User reputation summary
CREATE TABLE IF NOT EXISTS user_reputation (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL UNIQUE,
    total_reputation INTEGER NOT NULL DEFAULT 0,
    answers_count INTEGER NOT NULL DEFAULT 0,
    accepted_answers INTEGER NOT NULL DEFAULT 0,
    upvotes_received INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Project verification workflow
CREATE TABLE IF NOT EXISTS project_verifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    project_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    verification_type VARCHAR(50) NOT NULL,
    evidence_url VARCHAR(500),
    verifier_id VARCHAR(36),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    verified_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);



-- Company/Institution verification
CREATE TABLE IF NOT EXISTS entity_verifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    entity_id VARCHAR(36) NOT NULL,
    entity_type VARCHAR(30) NOT NULL,
    verification_type VARCHAR(50) NOT NULL,
    document_url VARCHAR(500),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    verified_by VARCHAR(36),
    verified_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);


-- Smart notification priorities and delivery tracking
CREATE TABLE IF NOT EXISTS smart_notifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    priority VARCHAR(10) NOT NULL DEFAULT 'NORMAL',
    title VARCHAR(300) NOT NULL,
    body TEXT,
    action_url VARCHAR(500),
    reference_type VARCHAR(50),
    reference_id VARCHAR(36),
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    delivery_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);


-- Enhanced social post types
ALTER TABLE social_posts ADD COLUMN image_url VARCHAR(500);
ALTER TABLE social_posts ADD COLUMN link_url VARCHAR(500);

-- Discussion categories seed data
INSERT IGNORE INTO discussion_categories (id, name, slug, description, icon, sort_order, created_at)
SELECT UUID(), cat.name, cat.slug, cat.description, cat.icon, cat.sort_order, now()
FROM (VALUES
    ('Programming', 'programming', 'General programming discussions', '💻', 1),
    ('DSA', 'dsa', 'Data Structures & Algorithms', '🧮', 2),
    ('Java', 'java', 'Java programming language', '☕', 3),
    ('Web Development', 'web-dev', 'Frontend & Backend web development', '🌐', 4),
    ('AI/ML', 'ai-ml', 'Artificial Intelligence & Machine Learning', '🤖', 5),
    ('Placements', 'placements', 'Campus placement preparation', '🎯', 6),
    ('Internships', 'internships', 'Internship opportunities & experience', '💼', 7),
    ('Career', 'career', 'Career guidance & advice', '🚀', 8),
    ('Projects', 'projects', 'Project showcase & help', '🛠️', 9),
    ('General', 'general', 'General discussion', '💬', 10)
) AS cat(name, slug, description, icon, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM discussion_categories LIMIT 1);

-- ============================================================
-- Source: V12__database_optimization.sql
-- ============================================================

-- V12: Database Optimization — Indexes, Composite Indexes, Constraints

-- Performance indexes for hot-path queries





































































































-- Background job tracking
CREATE TABLE IF NOT EXISTS background_jobs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    job_type VARCHAR(50) NOT NULL,
    payload JSON,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    priority INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    retry_count INTEGER NOT NULL DEFAULT 0,
    result JSON,
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    next_retry_at TIMESTAMP
);



-- Audit log for security tracking
CREATE TABLE IF NOT EXISTS security_audit_log (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(36),
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSON,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);





-- Privacy and consent records
CREATE TABLE IF NOT EXISTS user_privacy_settings (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL UNIQUE,
    profile_visibility VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    portfolio_visibility VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    company_visibility VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    institution_visibility VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    assessment_data_sharing TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS consent_records (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    consent_type VARCHAR(50) NOT NULL,
    granted TINYINT(1) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);


-- File/document management
CREATE TABLE IF NOT EXISTS file_documents (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    original_name VARCHAR(300) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100),
    file_size BIGINT NOT NULL DEFAULT 0,
    is_public TINYINT(1) NOT NULL DEFAULT 0,
    metadata JSON,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- ============================================================
-- Source: V13__seed_staging_data.sql
-- ============================================================

-- V13: Seed Data for Staging Environment
-- Test accounts and demo data for beta testing

-- Test Users (passwords are bcrypt hashed 'password123')
INSERT IGNORE INTO users (id, email, password_hash, role, status, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'student@beyon.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'STUDENT', 'ACTIVE', NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'institution@beyon.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'INSTITUTION', 'ACTIVE', NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', 'company@beyon.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'COMPANY', 'ACTIVE', NOW(), NOW()),
  ('44444444-4444-4444-4444-444444444444', 'admin@beyon.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', 'ACTIVE', NOW(), NOW()),
  ('55555555-5555-5555-5555-555555555555', 'student2@beyon.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'STUDENT', 'ACTIVE', NOW(), NOW())
;

-- Test Student Profiles
INSERT IGNORE INTO student_profiles (id, user_id, username, degree, department, institution, graduation_year, placement_status, created_at, updated_at)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'teststudent', 'B.Tech', 'Computer Science', 'Test University', 2026, 'SEEKING', NOW(), NOW()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '55555555-5555-5555-5555-555555555555', 'teststudent2', 'B.Tech', 'Information Technology', 'Test University', 2026, 'SEEKING', NOW(), NOW())
;

-- Test Institution Profiles
INSERT IGNORE INTO institution_profiles (id, user_id, institution_name, institution_type, location, website, accreditation, student_count, established_year, created_at, updated_at)
VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'Test University', 'DEEMED', 'Chennai, India', 'https://testuniversity.edu', 'NAAC A+', 5000, 1990, NOW(), NOW())
;

-- Test Company Profiles
INSERT IGNORE INTO company_profiles (id, user_id, company_name, industry, website, logo_url, description, founded_year, headquarters, company_size, created_at, updated_at)
VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', 'Test Corp', 'Technology', 'https://testcorp.com', NULL, 'A leading technology company for testing', 2010, 'Bangalore, India', '1000-5000', NOW(), NOW())
;

-- Test Coin Wallets
INSERT IGNORE INTO coin_wallets (id, student_id, balance, total_earned, total_spent, created_at, updated_at)
VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 2500, 2500, 0, NOW(), NOW()),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '55555555-5555-5555-5555-555555555555', 1000, 1000, 0, NOW(), NOW())
;

-- Test Discussion Categories (only if not already seeded)
INSERT IGNORE INTO discussion_categories (id, name, slug, description, icon, sort_order, created_at)
SELECT UUID(), cat.name, cat.slug, cat.description, cat.icon, cat.sort_order, NOW()
FROM (VALUES
  ('Programming', 'programming', 'General programming discussions', '💻', 1),
  ('DSA', 'dsa', 'Data Structures & Algorithms', '🧮', 2),
  ('Java', 'java', 'Java programming language', '☕', 3),
  ('Web Development', 'web-dev', 'Frontend & Backend web development', '🌐', 4),
  ('AI/ML', 'ai-ml', 'Artificial Intelligence & Machine Learning', '🤖', 5),
  ('Placements', 'placements', 'Campus placement preparation', '🎯', 6),
  ('Internships', 'internships', 'Internship opportunities & experience', '💼', 7),
  ('Career', 'career', 'Career guidance & advice', '🚀', 8),
  ('Projects', 'projects', 'Project showcase & help', '🛠️', 9),
  ('General', 'general', 'General discussion', '💬', 10)
) AS cat(name, slug, description, icon, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM discussion_categories WHERE slug = cat.slug);

-- ============================================================
-- Source: V14__feedback_stabilization.sql
-- ============================================================

-- V14: Production Feedback & Stabilization System

-- Enhanced feedback reports table
CREATE TABLE IF NOT EXISTS feedback_reports (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    report_number INT AUTO_INCREMENT,
    user_id VARCHAR(36) NOT NULL,
    user_role VARCHAR(30) NOT NULL,
    report_type VARCHAR(30) NOT NULL,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    user_priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    system_severity VARCHAR(10) NOT NULL DEFAULT 'S2',
    status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    assigned_to VARCHAR(36),
    application_version VARCHAR(20),
    page VARCHAR(500),
    browser_info VARCHAR(200),
    os_info VARCHAR(200),
    screen_size VARCHAR(30),
    request_id VARCHAR(100),
    desktop_app_version VARCHAR(20),
    assessment_session_id VARCHAR(36),
    metadata JSON,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    resolved_at TIMESTAMP
);









-- Feedback attachments
CREATE TABLE IF NOT EXISTS feedback_attachments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    report_id VARCHAR(36) NOT NULL,
    file_name VARCHAR(300) NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT NOT NULL DEFAULT 0,
    storage_path VARCHAR(500) NOT NULL,
    uploaded_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);


-- Feedback status history (never overwrite)
CREATE TABLE IF NOT EXISTS feedback_status_history (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    report_id VARCHAR(36) NOT NULL,
    old_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    changed_by VARCHAR(36) NOT NULL,
    note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);


-- Feedback internal notes (admin only)
CREATE TABLE IF NOT EXISTS feedback_internal_notes (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    report_id VARCHAR(36) NOT NULL,
    author_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);


-- Feedback user comments (add info to own report)
CREATE TABLE IF NOT EXISTS feedback_user_comments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    report_id VARCHAR(36) NOT NULL,
    author_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);


-- Report links (duplicate/related)
CREATE TABLE IF NOT EXISTS feedback_report_links (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    source_report_id VARCHAR(36) NOT NULL,
    target_report_id VARCHAR(36) NOT NULL,
    link_type VARCHAR(30) NOT NULL,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Drop old user_feedback table if it exists
DROP TABLE IF EXISTS user_feedback;

-- ============================================================
-- Source: V15__product_analytics_intelligence.sql
-- ============================================================

-- V15: Advanced Product Analytics, Skill Engine, Career Roadmap, Requirements, Collaboration

-- Product analytics events
CREATE TABLE IF NOT EXISTS analytics_events (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NULL,
    user_role VARCHAR(30),
    event_type VARCHAR(50) NOT NULL,
    event_data JSON,
    page VARCHAR(500),
    session_id VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT now()
);





-- Analytics aggregation snapshots (daily)
CREATE TABLE IF NOT EXISTS analytics_daily_snapshots (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    snapshot_date DATE NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC NOT NULL,
    dimensions JSON,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE(snapshot_date, metric_name, dimensions)
);



-- Skill recommendations
CREATE TABLE IF NOT EXISTS skill_recommendations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    skill_id VARCHAR(36),
    skill_name VARCHAR(200) NOT NULL,
    recommendation_type VARCHAR(30) NOT NULL,
    score NUMERIC(5,2) NOT NULL DEFAULT 0,
    reason TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    completed_at TIMESTAMP
);



-- Career roadmap with states
CREATE TABLE IF NOT EXISTS career_roadmap_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    career_path_id VARCHAR(36) NOT NULL,
    skill_name VARCHAR(200) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    state VARCHAR(20) NOT NULL DEFAULT 'LOCKED',
    progress NUMERIC(5,2) NOT NULL DEFAULT 0,
    required_coins INTEGER DEFAULT 0,
    unlocked_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);




-- Structured company requirements
CREATE TABLE IF NOT EXISTS company_requirements (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    opportunity_id VARCHAR(36) NOT NULL,
    company_id VARCHAR(36) NOT NULL,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    required_skills JSON NOT NULL DEFAULT '[]',
    preferred_skills JSON NOT NULL DEFAULT '[]',
    min_cgpa NUMERIC(4,2),
    min_experience_years INTEGER DEFAULT 0,
    department_filter JSON,
    graduation_year_filter JSON,
    assessment_id VARCHAR(36),
    coin_cost INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);



-- Company/Institution community posts
CREATE TABLE IF NOT EXISTS entity_posts (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    entity_id VARCHAR(36) NOT NULL,
    entity_type VARCHAR(30) NOT NULL,
    post_type VARCHAR(30) NOT NULL,
    title VARCHAR(300),
    content TEXT NOT NULL,
    action_url VARCHAR(500),
    like_count INTEGER NOT NULL DEFAULT 0,
    comment_count INTEGER NOT NULL DEFAULT 0,
    visibility VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    created_at TIMESTAMP NOT NULL DEFAULT now()
);




-- Student recommendation feedback
CREATE TABLE IF NOT EXISTS recommendation_feedback (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    recommendation_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    helpful TINYINT(1) NOT NULL,
    feedback_text TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- ============================================================
-- Source: V16__advanced_assessment_recruitment.sql
-- ============================================================

-- V16: Advanced Assessment, Recruitment & Career Intelligence

-- Assessment configurations (flexible builder)
CREATE TABLE IF NOT EXISTS assessment_configurations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id VARCHAR(36) NOT NULL,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    total_questions INTEGER NOT NULL DEFAULT 0,
    passing_score NUMERIC(5,2) NOT NULL DEFAULT 60,
    negative_marking TINYINT(1) NOT NULL DEFAULT 0,
    negative_marks NUMERIC(3,2) DEFAULT 0,
    randomize_questions TINYINT(1) NOT NULL DEFAULT 1,
    randomize_options TINYINT(1) NOT NULL DEFAULT 0,
    section_wise_time TINYINT(1) NOT NULL DEFAULT 0,
    attempt_limit INTEGER NOT NULL DEFAULT 1,
    coin_cost INTEGER NOT NULL DEFAULT 0,
    adaptive_enabled TINYINT(1) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);



-- Assessment sections
CREATE TABLE IF NOT EXISTS assessment_sections (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    assessment_id VARCHAR(36) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    question_count INTEGER NOT NULL DEFAULT 0,
    time_limit_minutes INTEGER,
    section_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);


-- Enhanced question bank
CREATE TABLE IF NOT EXISTS question_bank (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    creator_id VARCHAR(36) NOT NULL,
    creator_role VARCHAR(30) NOT NULL,
    topic_id VARCHAR(36),
    skill_id VARCHAR(36),
    question_type VARCHAR(30) NOT NULL,
    difficulty VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    question_text TEXT NOT NULL,
    options JSON,
    correct_answer TEXT,
    explanation TEXT,
    expected_time_seconds INTEGER DEFAULT 60,
    score NUMERIC(5,2) NOT NULL DEFAULT 1,
    tags JSON DEFAULT '[]',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);







-- Assessment-section-question mapping
CREATE TABLE IF NOT EXISTS assessment_section_questions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    section_id VARCHAR(36) NOT NULL,
    question_id VARCHAR(36) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    score_override NUMERIC(5,2)
);

-- Enhanced assessment sessions with adaptive state
ALTER TABLE assessment_sessions ADD COLUMN assessment_config_id VARCHAR(36);
ALTER TABLE assessment_sessions ADD COLUMN current_difficulty VARCHAR(20) DEFAULT 'MEDIUM';
ALTER TABLE assessment_sessions ADD COLUMN adaptive_state JSON;

-- Enhanced assessment answers with skill scoring
ALTER TABLE assessment_answers ADD COLUMN skill_scores JSON;
ALTER TABLE assessment_answers ADD COLUMN section_id VARCHAR(36);
ALTER TABLE assessment_answers ADD COLUMN time_taken_seconds INTEGER DEFAULT 0;

-- Assessment results
CREATE TABLE IF NOT EXISTS assessment_results (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    session_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    overall_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    max_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    accuracy NUMERIC(5,2) NOT NULL DEFAULT 0,
    percentile NUMERIC(5,2),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    section_scores JSON,
    skill_scores JSON,
    time_taken_seconds INTEGER DEFAULT 0,
    questions_attempted INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);



-- Recruitment pipeline stages
CREATE TABLE IF NOT EXISTS recruitment_pipelines (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    opportunity_id VARCHAR(36) NOT NULL,
    company_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    current_stage VARCHAR(30) NOT NULL DEFAULT 'APPLIED',
    assessment_result_id VARCHAR(36),
    interview_round INTEGER DEFAULT 0,
    overall_score NUMERIC(5,2),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);




-- Interview management
CREATE TABLE IF NOT EXISTS interview_sessions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    pipeline_id VARCHAR(36) NOT NULL,
    round_number INTEGER NOT NULL,
    round_type VARCHAR(30) NOT NULL,
    interviewer_id VARCHAR(36),
    scheduled_at TIMESTAMP,
    duration_minutes INTEGER DEFAULT 60,
    mode VARCHAR(20) DEFAULT 'ONLINE',
    meeting_link VARCHAR(500),
    instructions TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    created_at TIMESTAMP NOT NULL DEFAULT now()
);


-- Interview scorecards
CREATE TABLE IF NOT EXISTS interview_scorecards (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    interview_id VARCHAR(36) NOT NULL,
    interviewer_id VARCHAR(36) NOT NULL,
    technical_skills NUMERIC(3,1),
    communication NUMERIC(3,1),
    problem_solving NUMERIC(3,1),
    domain_knowledge NUMERIC(3,1),
    overall_rating NUMERIC(3,1),
    recommendation VARCHAR(20),
    comments TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);


-- Offer & placement tracking
CREATE TABLE IF NOT EXISTS placement_offers (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    pipeline_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    company_id VARCHAR(36) NOT NULL,
    job_role VARCHAR(200) NOT NULL,
    package_amount NUMERIC(12,2),
    package_currency VARCHAR(10) DEFAULT 'INR',
    company_tier VARCHAR(10),
    offer_status VARCHAR(20) NOT NULL DEFAULT 'GENERATED',
    offer_date TIMESTAMP,
    acceptance_date TIMESTAMP,
    joining_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- ============================================================
-- Source: V17__advanced_learning_gamification.sql
-- ============================================================

-- V17: Advanced Learning, Gamification & Student Growth (Phases 111-120)
-- Skill XP & Level System (Phase 112)
CREATE TABLE IF NOT EXISTS skill_xp_transactions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    skill_id VARCHAR(36) NOT NULL,
    amount INTEGER NOT NULL,
    source VARCHAR(50) NOT NULL ,
    source_id VARCHAR(36),
    description VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, skill_id, source, source_id)
);





CREATE TABLE IF NOT EXISTS skill_levels (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    skill_id VARCHAR(36) NOT NULL,
    total_xp INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    level_name VARCHAR(30) NOT NULL DEFAULT 'BEGINNER' ,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, skill_id)
);




-- XP configuration: thresholds for each level
CREATE TABLE IF NOT EXISTS skill_xp_config (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    level INTEGER NOT NULL UNIQUE,
    level_name VARCHAR(30) NOT NULL,
    min_xp INTEGER NOT NULL,
    max_xp INTEGER NOT NULL
);

INSERT IGNORE INTO skill_xp_config (level, level_name, min_xp, max_xp) VALUES
(1, 'BEGINNER', 0, 499),
(2, 'INTERMEDIATE', 500, 1499),
(3, 'ADVANCED', 1500, 3999),
(4, 'EXPERT', 4000, 7999),
(5, 'INDUSTRY_READY', 8000, 99999);

-- Enhanced daily challenges (Phase 111)
ALTER TABLE daily_challenges ADD COLUMN challenge_type VARCHAR(50) DEFAULT 'MCQ' ;
ALTER TABLE daily_challenges ADD COLUMN topic VARCHAR(200);
ALTER TABLE daily_challenges ADD COLUMN difficulty VARCHAR(20) DEFAULT 'MEDIUM' ;
ALTER TABLE daily_challenges ADD COLUMN xp_reward INTEGER DEFAULT 25;
ALTER TABLE daily_challenges ADD COLUMN completed_at TIMESTAMP;
ALTER TABLE daily_challenges ADD COLUMN time_taken_seconds INTEGER;

-- Streak freeze system (Phase 113)
ALTER TABLE student_streaks ADD COLUMN freeze_count INTEGER NOT NULL DEFAULT 3;
ALTER TABLE student_streaks ADD COLUMN freezes_used INTEGER NOT NULL DEFAULT 0;
ALTER TABLE student_streaks ADD COLUMN last_active_date DATE;

CREATE TABLE IF NOT EXISTS streak_freeze_log (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    freeze_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, freeze_date)
);

-- Enhanced achievements with rarity (Phase 114)
ALTER TABLE student_achievements_gamification ADD COLUMN rarity VARCHAR(20) DEFAULT 'COMMON' ;
ALTER TABLE student_achievements_gamification ADD COLUMN category VARCHAR(50) DEFAULT 'LEARNING' ;
ALTER TABLE student_achievements_gamification ADD COLUMN badge_icon VARCHAR(20);
ALTER TABLE student_achievements_gamification ADD COLUMN unlocked_at TIMESTAMP DEFAULT NOW();

-- Weekly tests (Phase 115)
CREATE TABLE IF NOT EXISTS weekly_tests (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    week_number INTEGER NOT NULL,
    year INTEGER NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    total_questions INTEGER NOT NULL DEFAULT 40,
    passing_score INTEGER NOT NULL DEFAULT 40,
    coin_reward INTEGER NOT NULL DEFAULT 100,
    xp_reward INTEGER NOT NULL DEFAULT 200,
    status VARCHAR(20) NOT NULL DEFAULT 'UPCOMING' ,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (week_number, year)
);

CREATE TABLE IF NOT EXISTS weekly_test_sections (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    weekly_test_id VARCHAR(36) NOT NULL,
    section_name VARCHAR(100) NOT NULL,
    section_type VARCHAR(50) NOT NULL ,
    question_count INTEGER NOT NULL DEFAULT 10,
    time_minutes INTEGER NOT NULL DEFAULT 15,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS weekly_test_attempts (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    weekly_test_id VARCHAR(36) NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    time_taken_seconds INTEGER,
    percentile DECIMAL(5,2),
    xp_earned INTEGER NOT NULL DEFAULT 0,
    coins_earned INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS' ,
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,
    UNIQUE (student_id, weekly_test_id)
);




-- Learning program enrollments & modules (Phase 116)
CREATE TABLE IF NOT EXISTS learning_program_modules (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    program_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    module_type VARCHAR(50) NOT NULL ,
    duration_minutes INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS learning_program_enrollments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    program_id VARCHAR(36) NOT NULL,
    progress_percent INTEGER NOT NULL DEFAULT 0,
    modules_completed INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ENROLLED' ,
    enrolled_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,
    UNIQUE (student_id, program_id)
);

CREATE TABLE IF NOT EXISTS learning_program_module_progress (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    enrollment_id VARCHAR(36) NOT NULL,
    module_id VARCHAR(36) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED' ,
    completed_at TIMESTAMP,
    UNIQUE (enrollment_id, module_id)
);



-- Student certificates with verification (Phase 117)
CREATE TABLE IF NOT EXISTS student_certificates (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    program_id VARCHAR(36) NOT NULL,
    certificate_id VARCHAR(30) NOT NULL UNIQUE,
    student_name VARCHAR(200) NOT NULL,
    program_name VARCHAR(200) NOT NULL,
    issuer_name VARCHAR(200),
    skills_covered TEXT,
    score INTEGER,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    verification_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);




-- Growth score (Phase 120)
CREATE TABLE IF NOT EXISTS student_growth_scores (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    overall_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    skills_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    consistency_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    assessment_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    certification_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    project_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    career_ready_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    career_readiness VARCHAR(30) NOT NULL DEFAULT 'NOT_READY' ,
    computed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (student_id)
);



-- Personalized feed (Phase 119)
CREATE TABLE IF NOT EXISTS personalized_feed_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    item_type VARCHAR(50) NOT NULL ,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    action_url VARCHAR(500),
    action_label VARCHAR(100),
    metadata JSON,
    relevance_score DECIMAL(5,4) NOT NULL DEFAULT 0,
    dismissed TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Source: V18__community_mentorship_collaboration.sql
-- ============================================================

-- Phase 121-130: Community, Mentorship, Institution & Industry Collaboration

-- Phase 121: Enhanced Community Posts
ALTER TABLE social_posts ADD COLUMN post_type VARCHAR(50) DEFAULT 'DISCUSSION';
ALTER TABLE social_posts ADD COLUMN tags TEXT;
ALTER TABLE social_posts ADD COLUMN is_pinned TINYINT(1) DEFAULT 0;
ALTER TABLE social_posts ADD COLUMN is_featured TINYINT(1) DEFAULT 0;
ALTER TABLE social_posts ADD COLUMN edit_count INTEGER DEFAULT 0;
ALTER TABLE social_posts ADD COLUMN last_edited_at TIMESTAMP;

-- Phase 122: Social Graph (Following)
CREATE TABLE IF NOT EXISTS user_follows (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    follower_id VARCHAR(36) NOT NULL,
    following_id VARCHAR(36) NOT NULL,
    follow_type VARCHAR(50) NOT NULL DEFAULT 'STUDENT',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);



CREATE TABLE IF NOT EXISTS topic_follows (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    skill_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, skill_id)
);

-- Phase 125: Mentorship System
CREATE TABLE IF NOT EXISTS mentor_profiles (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL UNIQUE,
    company_name VARCHAR(255),
    job_title VARCHAR(255),
    experience_years INTEGER DEFAULT 0,
    bio TEXT,
    expertise_skills TEXT,
    topics TEXT,
    availability VARCHAR(50) DEFAULT 'AVAILABLE',
    max_mentees INTEGER DEFAULT 5,
    current_mentees INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mentorship_requests (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    mentor_id VARCHAR(36) NOT NULL,
    message TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'REQUESTED',
    requested_at TIMESTAMP NOT NULL DEFAULT NOW(),
    accepted_at TIMESTAMP,
    completed_at TIMESTAMP,
    UNIQUE(student_id, mentor_id)
);



CREATE TABLE IF NOT EXISTS mentorship_sessions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    request_id VARCHAR(36) NOT NULL,
    topic VARCHAR(255),
    scheduled_at TIMESTAMP,
    duration_minutes INTEGER DEFAULT 30,
    meeting_link VARCHAR(500),
    notes TEXT,
    status VARCHAR(50) DEFAULT 'SCHEDULED',
    student_rating INTEGER,
    mentor_feedback TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Phase 126: Events & Workshops
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    organizer_id VARCHAR(36) NOT NULL,
    organizer_type VARCHAR(50) NOT NULL DEFAULT 'INSTITUTION',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(100) NOT NULL,
    speaker_name VARCHAR(255),
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    capacity INTEGER,
    registered_count INTEGER DEFAULT 0,
    is_online TINYINT(1) DEFAULT 1,
    location VARCHAR(500),
    meeting_link VARCHAR(500),
    eligibility_skills TEXT,
    coin_reward INTEGER DEFAULT 0,
    xp_reward INTEGER DEFAULT 0,
    certificate_provided TINYINT(1) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'DRAFT',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);



CREATE TABLE IF NOT EXISTS event_registrations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    event_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    status VARCHAR(50) DEFAULT 'REGISTERED',
    registered_at TIMESTAMP NOT NULL DEFAULT NOW(),
    attended_at TIMESTAMP,
    completed_at TIMESTAMP,
    UNIQUE(event_id, student_id)
);

-- Phase 127: Industry Challenges & Hackathons
CREATE TABLE IF NOT EXISTS industry_challenges (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    organizer_id VARCHAR(36) NOT NULL,
    organizer_type VARCHAR(50) NOT NULL DEFAULT 'COMPANY',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    problem_statement TEXT,
    required_skills TEXT,
    difficulty VARCHAR(50) DEFAULT 'MEDIUM',
    rules TEXT,
    deadline TIMESTAMP,
    min_team_size INTEGER DEFAULT 1,
    max_team_size INTEGER DEFAULT 1,
    coin_reward INTEGER DEFAULT 0,
    xp_reward INTEGER DEFAULT 0,
    badge_name VARCHAR(255),
    certificate_provided TINYINT(1) DEFAULT 0,
    opportunity_id VARCHAR(36),
    status VARCHAR(50) DEFAULT 'DRAFT',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS challenge_participations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    challenge_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    team_name VARCHAR(255),
    team_members TEXT,
    submission_url VARCHAR(500),
    submission_docs TEXT,
    submission_demo VARCHAR(500),
    submission_presentation VARCHAR(500),
    technical_score INTEGER,
    innovation_score INTEGER,
    problem_solving_score INTEGER,
    design_score INTEGER,
    documentation_score INTEGER,
    total_score INTEGER,
    rank_position INTEGER,
    status VARCHAR(50) DEFAULT 'PARTICIPATING',
    registered_at TIMESTAMP NOT NULL DEFAULT NOW(),
    submitted_at TIMESTAMP,
    evaluated_at TIMESTAMP,
    UNIQUE(challenge_id, student_id)
);

-- Phase 128: Live Industry Projects
CREATE TABLE IF NOT EXISTS industry_projects (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    required_skills TEXT,
    difficulty VARCHAR(50) DEFAULT 'MEDIUM',
    duration_weeks INTEGER DEFAULT 4,
    max_participants INTEGER DEFAULT 10,
    current_participants INTEGER DEFAULT 0,
    mentor_id VARCHAR(36),
    coin_reward INTEGER DEFAULT 0,
    xp_reward INTEGER DEFAULT 0,
    certificate_provided TINYINT(1) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'DRAFT',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_milestones (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    project_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    due_days INTEGER,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_applications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    project_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    cover_letter TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    applied_at TIMESTAMP NOT NULL DEFAULT NOW(),
    selected_at TIMESTAMP,
    completed_at TIMESTAMP,
    UNIQUE(project_id, student_id)
);

CREATE TABLE IF NOT EXISTS project_task_progress (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    project_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    milestone_id VARCHAR(36),
    task_description TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    submission_url VARCHAR(500),
    feedback TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Phase 129: Research & Consultancy
CREATE TABLE IF NOT EXISTS research_proposals (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    proposer_id VARCHAR(36) NOT NULL,
    proposer_type VARCHAR(50) NOT NULL DEFAULT 'INSTITUTION',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    domain VARCHAR(255),
    required_skills TEXT,
    expected_outcome TEXT,
    duration_weeks INTEGER,
    budget_amount DECIMAL(12,2),
    max_participants INTEGER DEFAULT 5,
    documents TEXT,
    status VARCHAR(50) DEFAULT 'DRAFT',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS research_participants (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    proposal_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    role VARCHAR(50) DEFAULT 'RESEARCHER',
    status VARCHAR(50) DEFAULT 'PENDING',
    joined_at TIMESTAMP,
    UNIQUE(proposal_id, user_id)
);

-- Phase 130: Ecosystem Dashboard (analytics table)
CREATE TABLE IF NOT EXISTS ecosystem_metrics (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    metric_type VARCHAR(100) NOT NULL,
    metric_value BIGINT DEFAULT 0,
    dimension VARCHAR(255),
    recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(metric_type, dimension, recorded_date)
);

-- ============================================================
-- Source: V19__platform_trust_security.sql
-- ============================================================

-- Phase 131-140: Platform Trust, Security, Governance & Production Hardening

-- Phase 131: Centralized Permissions
CREATE TABLE IF NOT EXISTS permissions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS role_permissions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    role VARCHAR(50) NOT NULL,
    permission_id VARCHAR(36) NOT NULL,
    UNIQUE(role, permission_id)
);


-- Phase 132: Session Management
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    refresh_token_hash VARCHAR(255),
    device_info VARCHAR(500),
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_active TINYINT(1) DEFAULT 1,
    last_accessed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);




-- Phase 133: MFA
CREATE TABLE IF NOT EXISTS user_mfa_settings (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL UNIQUE,
    mfa_enabled TINYINT(1) DEFAULT 0,
    mfa_method VARCHAR(50),
    totp_secret VARCHAR(255),
    backup_codes TEXT,
    email_otp_enabled TINYINT(1) DEFAULT 0,
    last_verified_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mfa_verification_codes (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    code VARCHAR(10) NOT NULL,
    purpose VARCHAR(50) NOT NULL,
    used TINYINT(1) DEFAULT 0,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);


-- Phase 134: Enhanced Audit Log (extend existing security_audit_log)
ALTER TABLE security_audit_log ADD COLUMN previous_state TEXT;
ALTER TABLE security_audit_log ADD COLUMN new_state TEXT;
ALTER TABLE security_audit_log ADD COLUMN resource_owner_id VARCHAR(36);
ALTER TABLE security_audit_log ADD COLUMN correlation_id VARCHAR(100);

-- Phase 135: Privacy Consent Enhancements
ALTER TABLE user_privacy_settings ADD COLUMN search_indexing TINYINT(1) DEFAULT 1;
ALTER TABLE user_privacy_settings ADD COLUMN data_sharing_analytics TINYINT(1) DEFAULT 0;
ALTER TABLE user_privacy_settings ADD COLUMN marketing_consent TINYINT(1) DEFAULT 0;

-- Phase 136: Document Management Enhancements
ALTER TABLE file_documents ADD COLUMN version INTEGER DEFAULT 1;
ALTER TABLE file_documents ADD COLUMN verified TINYINT(1) DEFAULT 0;
ALTER TABLE file_documents ADD COLUMN verified_by VARCHAR(36);
ALTER TABLE file_documents ADD COLUMN verified_at TIMESTAMP;
ALTER TABLE file_documents ADD COLUMN access_level VARCHAR(50) DEFAULT 'PRIVATE';

-- Phase 137: Content Moderation
CREATE TABLE IF NOT EXISTS content_reports (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    reporter_id VARCHAR(36) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id VARCHAR(36) NOT NULL,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    reviewed_by VARCHAR(36),
    review_action VARCHAR(50),
    review_notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMP
);



CREATE TABLE IF NOT EXISTS moderation_actions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    moderator_id VARCHAR(36) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id VARCHAR(36) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    reason TEXT,
    duration_days INTEGER,
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Phase 138: Fraud Prevention
CREATE TABLE IF NOT EXISTS fraud_signals (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    signal_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) DEFAULT 'LOW',
    description TEXT,
    evidence TEXT,
    status VARCHAR(50) DEFAULT 'DETECTED',
    resolved_by VARCHAR(36),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMP
);



CREATE TABLE IF NOT EXISTS coin_transaction_ledger (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    amount INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    reference_type VARCHAR(50),
    reference_id VARCHAR(36),
    description TEXT,
    status VARCHAR(50) DEFAULT 'COMPLETED',
    verified TINYINT(1) DEFAULT 0,
    ip_address VARCHAR(45),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);



-- Phase 139: Correlation IDs for request tracing
ALTER TABLE security_audit_log ADD COLUMN correlation_id VARCHAR(100);

-- ============================================================
-- Source: V20__search_performance_scale.sql
-- ============================================================

-- Phase 141-150: Scale, Performance, Search, Realtime & Platform Intelligence

-- Phase 143: Performance Indexes



































-- Phase 144: Global Search Index
CREATE TABLE IF NOT EXISTS search_index (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(36) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    keywords TEXT,
    popularity_score INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(entity_type, entity_id)
);




-- Phase 146: Real-time Events
CREATE TABLE IF NOT EXISTS realtime_events (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload TEXT NOT NULL,
    read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);


-- Phase 148: Recommendation Feedback
CREATE TABLE IF NOT EXISTS recommendation_signals (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    recommendation_type VARCHAR(100) NOT NULL,
    recommendation_id VARCHAR(36),
    signal VARCHAR(50) NOT NULL,
    metadata TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);



-- Phase 149: Data Integrity Checks
CREATE TABLE IF NOT EXISTS integrity_checks (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    check_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    issues_found INTEGER DEFAULT 0,
    details TEXT,
    ran_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Source: V21__ai_career_intelligence.sql
-- ============================================================

-- V21: AI Career Intelligence, Skill Graph, Personalized Challenges, Adaptive Learning (Phase 151-160)

-- 1. Unified Skill Taxonomy (Phase 151)
CREATE TABLE IF NOT EXISTS skill_taxonomy_nodes (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    parent_id VARCHAR(36),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    level VARCHAR(20) NOT NULL DEFAULT 'CATEGORY',
    sort_order INTEGER NOT NULL DEFAULT 0,
    icon VARCHAR(50),
    industry_demand VARCHAR(20) DEFAULT 'MEDIUM',
    avg_salary_range VARCHAR(100),
    growth_outlook VARCHAR(100),
    active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);




-- Link existing skills to taxonomy
CREATE TABLE IF NOT EXISTS skill_taxonomy_links (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    skill_id VARCHAR(36) NOT NULL,
    taxonomy_node_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(skill_id, taxonomy_node_id)
);



-- Prerequisites between taxonomy nodes
CREATE TABLE IF NOT EXISTS skill_prerequisites (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    skill_node_id VARCHAR(36) NOT NULL,
    prerequisite_node_id VARCHAR(36) NOT NULL,
    required_level VARCHAR(20) DEFAULT 'INTERMEDIATE',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(skill_node_id, prerequisite_node_id)
);

-- 2. Student Skill Graph (Phase 152)
CREATE TABLE IF NOT EXISTS student_skill_graph (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    skill_id VARCHAR(36) NOT NULL,
    proficiency_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
    level VARCHAR(30) NOT NULL DEFAULT 'BEGINNER',
    confidence NUMERIC(5,2) NOT NULL DEFAULT 0,
    evidence_count INTEGER NOT NULL DEFAULT 0,
    sources JSON NOT NULL DEFAULT '[]',
    improvement_trend VARCHAR(20) NOT NULL DEFAULT 'STABLE',
    last_assessed_at TIMESTAMP WITH TIME ZONE,
    verified TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, skill_id)
);




-- 3. Personalized Daily Challenge Engine (Phase 155)
CREATE TABLE IF NOT EXISTS personalized_challenge_config (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL UNIQUE,
    target_career_path_id VARCHAR(36),
    difficulty_weight NUMERIC(3,2) NOT NULL DEFAULT 0.3,
    gap_weight NUMERIC(3,2) NOT NULL DEFAULT 0.4,
    streak_weight NUMERIC(3,2) NOT NULL DEFAULT 0.15,
    variety_weight NUMERIC(3,2) NOT NULL DEFAULT 0.15,
    preferred_topics JSON NOT NULL DEFAULT '[]',
    avoid_topics JSON NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS challenge_selection_log (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    question_id VARCHAR(36) NOT NULL,
    skill_id VARCHAR(36),
    selection_reason VARCHAR(100),
    difficulty_score NUMERIC(5,2),
    gap_score NUMERIC(5,2),
    streak_relevance NUMERIC(3,2),
    selected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);



-- 4. Adaptive Learning Path (Phase 156)
CREATE TABLE IF NOT EXISTS adaptive_learning_paths (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    career_path_id VARCHAR(36) NOT NULL,
    current_step_index INTEGER NOT NULL DEFAULT 0,
    overall_progress NUMERIC(5,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS adaptive_learning_steps (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    path_id VARCHAR(36) NOT NULL,
    step_order INTEGER NOT NULL,
    skill_id VARCHAR(36),
    skill_name VARCHAR(200) NOT NULL,
    concept VARCHAR(500),
    prerequisites JSON NOT NULL DEFAULT '[]',
    learning_resources JSON NOT NULL DEFAULT '[]',
    practice_question_ids JSON NOT NULL DEFAULT '[]',
    assessment_id VARCHAR(36),
    project_suggestion TEXT,
    state VARCHAR(20) NOT NULL DEFAULT 'LOCKED',
    progress NUMERIC(5,2) NOT NULL DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);


-- 5. AI Career Advisor Chat (Phase 157)
CREATE TABLE IF NOT EXISTS advisor_chat_sessions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    title VARCHAR(300) DEFAULT 'Career Advice',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    context_snapshot JSON,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS advisor_chat_messages (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    session_id VARCHAR(36) NOT NULL,
    role VARCHAR(10) NOT NULL,
    content TEXT NOT NULL,
    data_references JSON,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);


-- 6. AI Portfolio Intelligence (Phase 158)
CREATE TABLE IF NOT EXISTS portfolio_analysis (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    overall_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    completeness NUMERIC(5,2) NOT NULL DEFAULT 0,
    skill_coverage NUMERIC(5,2) NOT NULL DEFAULT 0,
    project_strength NUMERIC(5,2) NOT NULL DEFAULT 0,
    certification_strength NUMERIC(5,2) NOT NULL DEFAULT 0,
    recommendations JSON NOT NULL DEFAULT '[]',
    missing_items JSON NOT NULL DEFAULT '[]',
    analyzed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);


-- 7. Opportunity Match Enhancement (Phase 159)
CREATE TABLE IF NOT EXISTS opportunity_match_detail (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    opportunity_id VARCHAR(36) NOT NULL,
    overall_match NUMERIC(5,2) NOT NULL DEFAULT 0,
    skill_match NUMERIC(5,2) NOT NULL DEFAULT 0,
    eligibility_met TINYINT(1) NOT NULL DEFAULT 0,
    experience_met TINYINT(1) NOT NULL DEFAULT 0,
    certification_met TINYINT(1) NOT NULL DEFAULT 0,
    coin_requirement_met TINYINT(1) NOT NULL DEFAULT 0,
    match_factors JSON NOT NULL DEFAULT '[]',
    strength_items JSON NOT NULL DEFAULT '[]',
    gap_items JSON NOT NULL DEFAULT '[]',
    calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, opportunity_id)
);

-- ============================================================
-- Source: V22__recruitment_intelligence.sql
-- ============================================================

-- V22: Recruitment Intelligence, Placement Automation & Company Hiring (Phase 161-170)

-- 1. Enhanced Recruitment Drives (Phase 161)
CREATE TABLE IF NOT EXISTS recruitment_drives (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_user_id VARCHAR(36) NOT NULL,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    job_role VARCHAR(200) NOT NULL,
    required_skills TEXT,
    preferred_skills TEXT,
    min_cgpa NUMERIC(4,2),
    eligible_departments TEXT,
    eligible_graduation_years TEXT,
    salary_range VARCHAR(100),
    location VARCHAR(200),
    work_mode VARCHAR(30) DEFAULT 'ONSITE',
    application_deadline TIMESTAMP WITH TIME ZONE,
    assessment_id VARCHAR(36),
    max_candidates INTEGER DEFAULT 0,
    coin_cost INTEGER DEFAULT 100,
    targeting_mode VARCHAR(30) DEFAULT 'PUBLIC',
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);



-- 2. Institution Targeting (Phase 162)
CREATE TABLE IF NOT EXISTS drive_institution_targets (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    drive_id VARCHAR(36) NOT NULL,
    institution_id VARCHAR(36) NOT NULL,
    departments TEXT,
    min_graduation_year INTEGER,
    max_graduation_year INTEGER,
    min_cgpa NUMERIC(4,2),
    placement_willing_only TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(drive_id, institution_id)
);


-- 3. Placement Registration (Phase 163)
CREATE TABLE IF NOT EXISTS placement_registrations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL UNIQUE,
    institution_id VARCHAR(36),
    placement_preference VARCHAR(20) NOT NULL DEFAULT 'UNDECIDED',
    preferred_roles TEXT,
    preferred_locations TEXT,
    preferred_work_mode VARCHAR(30),
    min_expected_package NUMERIC(12,2),
    registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);




-- 4. Candidate Shortlist (Phase 168)
CREATE TABLE IF NOT EXISTS candidate_shortlists (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    drive_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    pipeline_id VARCHAR(36),
    overall_score NUMERIC(5,2),
    assessment_score NUMERIC(5,2),
    skill_match_score NUMERIC(5,2),
    rank_in_drive INTEGER,
    status VARCHAR(30) NOT NULL DEFAULT 'SHORTLISTED',
    shortlisted_by VARCHAR(36),
    shortlisted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);




-- 5. Enhanced Interview Scheduling (Phase 169)
CREATE TABLE IF NOT EXISTS recruitment_interviews (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    drive_id VARCHAR(36) NOT NULL,
    pipeline_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    interviewer_id VARCHAR(36),
    interview_type VARCHAR(50) NOT NULL,
    round_number INTEGER NOT NULL DEFAULT 1,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER DEFAULT 60,
    meeting_link VARCHAR(500),
    location VARCHAR(300),
    status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    feedback TEXT,
    score NUMERIC(5,2),
    recommendation VARCHAR(30),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);




-- 6. Placement Records (Phase 170)
CREATE TABLE IF NOT EXISTS placement_records (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    company_user_id VARCHAR(36) NOT NULL,
    institution_id VARCHAR(36),
    drive_id VARCHAR(36),
    pipeline_id VARCHAR(36),
    job_role VARCHAR(200) NOT NULL,
    ctc_amount NUMERIC(12,2),
    ctc_currency VARCHAR(10) DEFAULT 'INR',
    company_tier VARCHAR(10),
    placement_type VARCHAR(30) DEFAULT 'FULL_TIME',
    placement_year INTEGER NOT NULL,
    joining_date DATE,
    offer_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(30) NOT NULL DEFAULT 'OFFERED',
    verified TINYINT(1) NOT NULL DEFAULT 0,
    verified_by VARCHAR(36),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);






-- 7. Institution Placement Analytics (Phase 170)
CREATE TABLE IF NOT EXISTS institution_placement_stats (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    institution_id VARCHAR(36) NOT NULL,
    academic_year INTEGER NOT NULL,
    total_students INTEGER NOT NULL DEFAULT 0,
    placement_willing INTEGER NOT NULL DEFAULT 0,
    eligible INTEGER NOT NULL DEFAULT 0,
    applied INTEGER NOT NULL DEFAULT 0,
    assessed INTEGER NOT NULL DEFAULT 0,
    shortlisted INTEGER NOT NULL DEFAULT 0,
    interviewed INTEGER NOT NULL DEFAULT 0,
    placed INTEGER NOT NULL DEFAULT 0,
    placement_rate NUMERIC(5,2) DEFAULT 0,
    average_package NUMERIC(12,2) DEFAULT 0,
    highest_package NUMERIC(12,2) DEFAULT 0,
    companies_visited INTEGER DEFAULT 0,
    department_stats JSON DEFAULT '{}',
    skill_demand JSON DEFAULT '{}',
    company_tier_distribution JSON DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(institution_id, academic_year)
);

-- ============================================================
-- Source: V23__placement_intelligence_ecosystem.sql
-- ============================================================

-- V23: Placement Intelligence, Verification, Alumni & Career Outcomes (Phase 171-180)

-- 1. Placement Verification (Phase 171)
CREATE TABLE IF NOT EXISTS placement_verifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    placement_record_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    company_user_id VARCHAR(36) NOT NULL,
    institution_id VARCHAR(36),
    verification_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    verified_by VARCHAR(36),
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_source VARCHAR(50),
    verification_document_url VARCHAR(500),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);



-- 2. Institution Rating (Phase 172)
CREATE TABLE IF NOT EXISTS institution_ratings (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    institution_id VARCHAR(36) NOT NULL UNIQUE,
    academic_score NUMERIC(3,2) NOT NULL DEFAULT 0,
    placement_score NUMERIC(3,2) NOT NULL DEFAULT 0,
    salary_score NUMERIC(3,2) NOT NULL DEFAULT 0,
    industry_score NUMERIC(3,2) NOT NULL DEFAULT 0,
    skill_score NUMERIC(3,2) NOT NULL DEFAULT 0,
    overall_rating NUMERIC(3,2) NOT NULL DEFAULT 0,
    calculation_version INTEGER NOT NULL DEFAULT 1,
    last_calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 3. Company Tier Profile (Phase 173)
CREATE TABLE IF NOT EXISTS company_tier_profiles (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_user_id VARCHAR(36) NOT NULL UNIQUE,
    tier VARCHAR(20) NOT NULL DEFAULT 'STARTUP',
    average_package NUMERIC(12,2),
    hiring_count INTEGER NOT NULL DEFAULT 0,
    student_rating NUMERIC(3,2) DEFAULT 0,
    assessment_rating NUMERIC(3,2) DEFAULT 0,
    active_opportunities INTEGER NOT NULL DEFAULT 0,
    compensation_score NUMERIC(3,2) DEFAULT 0,
    reputation_score NUMERIC(3,2) DEFAULT 0,
    retention_score NUMERIC(3,2) DEFAULT 0,
    calculation_version INTEGER NOT NULL DEFAULT 1,
    last_calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);


-- 4. Interview Feedback Intelligence (Phase 176)
CREATE TABLE IF NOT EXISTS interview_feedback_intelligence (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    interview_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    interviewer_id VARCHAR(36) NOT NULL,
    technical_knowledge INTEGER DEFAULT 0,
    problem_solving INTEGER DEFAULT 0,
    communication INTEGER DEFAULT 0,
    teamwork INTEGER DEFAULT 0,
    leadership INTEGER DEFAULT 0,
    domain_knowledge INTEGER DEFAULT 0,
    confidence INTEGER DEFAULT 0,
    overall_rating INTEGER DEFAULT 0,
    strengths TEXT,
    weaknesses TEXT,
    feedback TEXT,
    recommended_improvements TEXT,
    is_candidate_visible TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);



-- 5. Career Outcomes (Phase 177)
CREATE TABLE IF NOT EXISTS career_outcomes (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    outcome_type VARCHAR(30) NOT NULL,
    company_name VARCHAR(200),
    role VARCHAR(200),
    institution VARCHAR(200),
    description TEXT,
    start_date DATE,
    end_date DATE,
    is_current TINYINT(1) NOT NULL DEFAULT 1,
    verified TINYINT(1) NOT NULL DEFAULT 0,
    verified_by VARCHAR(36),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);



-- 6. Alumni Network (Phase 178)
CREATE TABLE IF NOT EXISTS alumni_profiles (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL UNIQUE,
    institution_id VARCHAR(36),
    graduation_year INTEGER NOT NULL,
    current_company VARCHAR(200),
    current_role VARCHAR(200),
    industry VARCHAR(100),
    experience_years INTEGER DEFAULT 0,
    skills TEXT,
    achievements TEXT,
    bio TEXT,
    is_mentoring TINYINT(1) NOT NULL DEFAULT 0,
    mentor_availability VARCHAR(30) DEFAULT 'UNAVAILABLE',
    public_profile TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);




-- 7. Alumni Connections (mentorship requests, follows)
CREATE TABLE IF NOT EXISTS alumni_connections (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    alumni_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    connection_type VARCHAR(30) NOT NULL DEFAULT 'FOLLOW',
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(alumni_id, student_id, connection_type)
);



-- 8. Referral System (Phase 179)
CREATE TABLE IF NOT EXISTS opportunity_referrals (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    referrer_id VARCHAR(36) NOT NULL,
    opportunity_type VARCHAR(30) NOT NULL,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    company_name VARCHAR(200),
    application_url VARCHAR(500),
    required_skills TEXT,
    location VARCHAR(200),
    work_mode VARCHAR(30),
    salary_range VARCHAR(100),
    referral_limit INTEGER DEFAULT 0,
    referral_count INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);



CREATE TABLE IF NOT EXISTS referral_clicks (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    referral_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    applied TINYINT(1) NOT NULL DEFAULT 0,
    UNIQUE(referral_id, student_id)
);

-- 9. Placement Readiness Score (Phase 175)
CREATE TABLE IF NOT EXISTS placement_readiness_scores (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL UNIQUE,
    overall_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    skills_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    assessments_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    projects_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    certifications_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    interview_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    practice_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    recommendations JSON NOT NULL DEFAULT '[]',
    calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Source: V24__certification_portfolio_identity.sql
-- ============================================================

-- V24: Certification, Verification, Portfolio & Professional Identity (Phase 181-190)

-- 1. Enhanced Certificates (Phase 181)
CREATE TABLE IF NOT EXISTS beyon_certificates (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    certificate_number VARCHAR(50) NOT NULL UNIQUE,
    certificate_type VARCHAR(50) NOT NULL,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    skill_name VARCHAR(200),
    program_id VARCHAR(36),
    assessment_id VARCHAR(36),
    challenge_id VARCHAR(36),
    issuer_id VARCHAR(36),
    issuer_name VARCHAR(200) NOT NULL,
    issuer_type VARCHAR(30) NOT NULL DEFAULT 'BEYON',
    score INTEGER,
    skills_covered TEXT,
    issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    verification_url VARCHAR(500),
    qr_data TEXT,
    verification_status VARCHAR(30) NOT NULL DEFAULT 'VERIFIED',
    metadata JSON DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);




-- 2. Skill Endorsements (Phase 184)
CREATE TABLE IF NOT EXISTS skill_endorsements (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    skill_id VARCHAR(36) NOT NULL,
    endorser_id VARCHAR(36) NOT NULL,
    endorser_name VARCHAR(200),
    endorser_type VARCHAR(50) NOT NULL,
    endorsement_level VARCHAR(30) NOT NULL DEFAULT 'ENDORSED',
    evidence_url VARCHAR(500),
    evidence_description TEXT,
    valid_until TIMESTAMP WITH TIME ZONE,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);




-- 3. Professional Profile (Phase 185)
CREATE TABLE IF NOT EXISTS professional_profiles (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL UNIQUE,
    headline VARCHAR(300),
    about TEXT,
    location VARCHAR(200),
    website_url VARCHAR(500),
    github_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    resume_url VARCHAR(500),
    visibility VARCHAR(30) NOT NULL DEFAULT 'PUBLIC',
    profile_views INTEGER NOT NULL DEFAULT 0,
    last_viewed_at TIMESTAMP WITH TIME ZONE,
    metadata JSON DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);



-- 4. Portfolio Items Enhanced (Phase 186)
CREATE TABLE IF NOT EXISTS portfolio_projects (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    role VARCHAR(200),
    skills_used TEXT,
    github_url VARCHAR(500),
    live_demo_url VARCHAR(500),
    image_url VARCHAR(500),
    verification_status VARCHAR(30) NOT NULL DEFAULT 'UNVERIFIED',
    verified_by VARCHAR(36),
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_source VARCHAR(50),
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_featured TINYINT(1) NOT NULL DEFAULT 0,
    metadata JSON DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);



-- 5. Portfolio Verification (Phase 187)
CREATE TABLE IF NOT EXISTS portfolio_verifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    project_id VARCHAR(36) NOT NULL,
    verifier_id VARCHAR(36) NOT NULL,
    verifier_type VARCHAR(50) NOT NULL,
    verification_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    evidence_url VARCHAR(500),
    evidence_description TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);


-- 6. Resume Templates (Phase 189)
CREATE TABLE IF NOT EXISTS resume_templates (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    template_data JSON NOT NULL DEFAULT '{}',
    is_default TINYINT(1) NOT NULL DEFAULT 0,
    active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 7. Generated Resumes (Phase 189)
CREATE TABLE IF NOT EXISTS generated_resumes (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    template_id VARCHAR(36),
    title VARCHAR(300),
    sections JSON NOT NULL DEFAULT '[]',
    file_url VARCHAR(500),
    generation_status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    ai_suggestions JSON,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Source: V25__community_teams_evaluation_admin.sql
-- ============================================================

-- V25: Community Teams, Project Evaluation, Admin Dashboard & Reporting (Phase 191-220)

-- 1. Project Teams (Phase 201)
CREATE TABLE IF NOT EXISTS project_teams (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    project_id VARCHAR(36) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    leader_id VARCHAR(36) NOT NULL,
    max_members INTEGER NOT NULL DEFAULT 4,
    current_members INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(30) NOT NULL DEFAULT 'FORMING',
    looking_for TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);



CREATE TABLE IF NOT EXISTS team_members (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    team_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    role VARCHAR(100),
    skills_brought TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(team_id, student_id)
);



-- 2. Project Evaluations (Phase 202)
CREATE TABLE IF NOT EXISTS project_evaluations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    project_id VARCHAR(36) NOT NULL,
    team_id VARCHAR(36),
    evaluator_id VARCHAR(36) NOT NULL,
    evaluator_type VARCHAR(50) NOT NULL,
    technical_quality INTEGER DEFAULT 0,
    innovation INTEGER DEFAULT 0,
    code_quality INTEGER DEFAULT 0,
    documentation INTEGER DEFAULT 0,
    presentation INTEGER DEFAULT 0,
    problem_solving INTEGER DEFAULT 0,
    teamwork INTEGER DEFAULT 0,
    overall_score NUMERIC(5,2) DEFAULT 0,
    strengths TEXT,
    improvements TEXT,
    feedback TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);



-- 3. Admin Dashboard Stats (Phase 209)
CREATE TABLE IF NOT EXISTS platform_daily_stats (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    stat_date DATE NOT NULL UNIQUE,
    total_users INTEGER NOT NULL DEFAULT 0,
    new_registrations INTEGER NOT NULL DEFAULT 0,
    active_users INTEGER NOT NULL DEFAULT 0,
    total_assessments INTEGER NOT NULL DEFAULT 0,
    total_applications INTEGER NOT NULL DEFAULT 0,
    total_placements INTEGER NOT NULL DEFAULT 0,
    total_coins_earned NUMERIC(15,2) DEFAULT 0,
    total_coins_spent NUMERIC(15,2) DEFAULT 0,
    active_companies INTEGER NOT NULL DEFAULT 0,
    active_institutions INTEGER NOT NULL DEFAULT 0,
    new_posts INTEGER NOT NULL DEFAULT 0,
    new_feedback_reports INTEGER NOT NULL DEFAULT 0,
    resolved_feedback_reports INTEGER NOT NULL DEFAULT 0,
    metadata JSON DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 4. Platform Reports (Phase 215)
CREATE TABLE IF NOT EXISTS platform_reports (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    title VARCHAR(300) NOT NULL,
    parameters JSON NOT NULL DEFAULT '{}',
    file_url VARCHAR(500),
    generation_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    format VARCHAR(10) NOT NULL DEFAULT 'PDF',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);
