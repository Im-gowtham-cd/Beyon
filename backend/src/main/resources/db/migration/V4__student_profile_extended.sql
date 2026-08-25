CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_skills_category ON skills (category);
CREATE INDEX idx_skills_slug ON skills (slug);
CREATE INDEX idx_skills_name_lower ON skills (lower(name));

INSERT INTO skills (name, slug, category, description) VALUES
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

CREATE INDEX idx_student_profiles_username ON student_profiles (username);

CREATE TABLE student_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    organization VARCHAR(200),
    achievement_date DATE,
    url VARCHAR(500),
    proof_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_student_achievements_user_id ON student_achievements (user_id);

CREATE TABLE student_learning_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE SET NULL,
    skill_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'LEARNING' CHECK (status IN ('LEARNING', 'ACTIVE')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_student_learning_user_id ON student_learning_skills (user_id);

CREATE TABLE student_career_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    preferred_roles TEXT,
    preferred_industries TEXT,
    preferred_work_type VARCHAR(20) CHECK (preferred_work_type IN ('REMOTE', 'HYBRID', 'ONSITE', 'ANY')),
    preferred_locations TEXT,
    career_goal TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_student_career_prefs_user_id ON student_career_preferences (user_id);

ALTER TABLE student_skills ADD COLUMN source VARCHAR(30) NOT NULL DEFAULT 'SELF_REPORTED' CHECK (source IN ('SELF_REPORTED', 'ASSESSMENT', 'CERTIFICATION', 'PROJECT', 'INSTITUTION', 'COMPANY', 'SYSTEM'));
ALTER TABLE student_skills ADD COLUMN verified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE student_skills ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE student_projects ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT false;
