CREATE TABLE skill_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_skill_categories_slug ON skill_categories (slug);

INSERT INTO skill_categories (name, slug, display_order) VALUES
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

ALTER TABLE skills ADD COLUMN category_id UUID REFERENCES skill_categories(id);

UPDATE skills SET category_id = (
    SELECT id FROM skill_categories WHERE lower(name) = lower(skills.category)
    OR slug = lower(replace(skills.category, ' ', '_'))
    OR slug = lower(skills.category)
);

CREATE TABLE skill_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(240) NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (skill_id, slug)
);

CREATE INDEX idx_skill_topics_skill_id ON skill_topics (skill_id);
CREATE INDEX idx_skill_topics_slug ON skill_topics (slug);

CREATE TABLE skill_subtopics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL REFERENCES skill_topics(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(240) NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (topic_id, slug)
);

CREATE INDEX idx_skill_subtopics_topic_id ON skill_subtopics (topic_id);

CREATE TABLE skill_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    target_skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    relationship_type VARCHAR(20) NOT NULL CHECK (relationship_type IN ('PREREQUISITE', 'RELATED', 'NEXT_STEP')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (source_skill_id, target_skill_id, relationship_type)
);

CREATE INDEX idx_skill_relationships_source ON skill_relationships (source_skill_id);
CREATE INDEX idx_skill_relationships_target ON skill_relationships (target_skill_id);

CREATE TABLE topic_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_topic_id UUID NOT NULL REFERENCES skill_topics(id) ON DELETE CASCADE,
    target_topic_id UUID NOT NULL REFERENCES skill_topics(id) ON DELETE CASCADE,
    relationship_type VARCHAR(20) NOT NULL CHECK (relationship_type IN ('PREREQUISITE', 'RELATED', 'NEXT_STEP')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (source_topic_id, target_topic_id, relationship_type)
);

CREATE INDEX idx_topic_relationships_source ON topic_relationships (source_topic_id);

CREATE TABLE student_learning_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES skill_topics(id) ON DELETE CASCADE,
    subtopic_id UUID REFERENCES skill_subtopics(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'LEARNING' CHECK (status IN ('NOT_STARTED', 'LEARNING', 'PRACTICING', 'ASSESSMENT_READY', 'MASTERED')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, topic_id)
);

CREATE INDEX idx_student_learning_topics_student ON student_learning_topics (student_id);
CREATE INDEX idx_student_learning_topics_topic ON student_learning_topics (topic_id);

CREATE TABLE student_skill_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES skill_topics(id) ON DELETE SET NULL,
    subtopic_id UUID REFERENCES skill_subtopics(id) ON DELETE SET NULL,
    progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    learning_stage VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED' CHECK (learning_stage IN ('NOT_STARTED', 'LEARNING', 'PRACTICING', 'ASSESSMENT_READY', 'MASTERED')),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_student_skill_progress_student ON student_skill_progress (student_id);
CREATE INDEX idx_student_skill_progress_skill ON student_skill_progress (skill_id);

-- Seed Java taxonomy
DO $$
DECLARE
    java_id UUID;
    basics_id UUID;
    oop_id UUID;
    collections_id UUID;
    exc_id UUID;
    mt_id UUID;
BEGIN
    SELECT id INTO java_id FROM skills WHERE slug = 'java';
    IF java_id IS NULL THEN RETURN; END IF;

    INSERT INTO skill_topics (skill_id, name, slug, display_order) VALUES
    (java_id, 'Basics', 'basics', 1),
    (java_id, 'OOP', 'oop', 2),
    (java_id, 'Collections', 'collections', 3),
    (java_id, 'Exception Handling', 'exception-handling', 4),
    (java_id, 'Multithreading', 'multithreading', 5)
    ON CONFLICT (skill_id, slug) DO NOTHING;

    SELECT id INTO basics_id FROM skill_topics WHERE skill_id = java_id AND slug = 'basics';
    SELECT id INTO oop_id FROM skill_topics WHERE skill_id = java_id AND slug = 'oop';
    SELECT id INTO collections_id FROM skill_topics WHERE skill_id = java_id AND slug = 'collections';
    SELECT id INTO exc_id FROM skill_topics WHERE skill_id = java_id AND slug = 'exception-handling';
    SELECT id INTO mt_id FROM skill_topics WHERE skill_id = java_id AND slug = 'multithreading';

    INSERT INTO skill_subtopics (topic_id, name, slug, display_order) VALUES
    (basics_id, 'Variables', 'variables', 1),
    (basics_id, 'Data Types', 'data-types', 2),
    (basics_id, 'Operators', 'operators', 3),
    (basics_id, 'Control Flow', 'control-flow', 4),
    (basics_id, 'Methods', 'methods', 5),
    (oop_id, 'Classes', 'classes', 1),
    (oop_id, 'Objects', 'objects', 2),
    (oop_id, 'Encapsulation', 'encapsulation', 3),
    (oop_id, 'Inheritance', 'inheritance', 4),
    (oop_id, 'Abstraction', 'abstraction', 5),
    (oop_id, 'Polymorphism', 'polymorphism', 6),
    (collections_id, 'List', 'list', 1),
    (collections_id, 'Set', 'set', 2),
    (collections_id, 'Map', 'map', 3),
    (collections_id, 'Queue', 'queue', 4),
    (exc_id, 'Try Catch', 'try-catch', 1),
    (exc_id, 'Checked Exceptions', 'checked-exceptions', 2),
    (exc_id, 'Custom Exceptions', 'custom-exceptions', 3),
    (mt_id, 'Threads', 'threads', 1),
    (mt_id, 'Synchronization', 'synchronization', 2),
    (mt_id, 'Executors', 'executors', 3)
    ON CONFLICT (topic_id, slug) DO NOTHING;

    INSERT INTO topic_relationships (source_topic_id, target_topic_id, relationship_type) VALUES
    (basics_id, oop_id, 'NEXT_STEP'),
    (oop_id, collections_id, 'NEXT_STEP'),
    (collections_id, exc_id, 'NEXT_STEP'),
    (exc_id, mt_id, 'NEXT_STEP')
    ON CONFLICT DO NOTHING;
END $$;

-- Seed SQL taxonomy
DO $$
DECLARE
    sql_id UUID;
    sql_basics_id UUID;
    sql_agg_id UUID;
    sql_joins_id UUID;
    sql_sub_id UUID;
    sql_win_id UUID;
BEGIN
    SELECT id INTO sql_id FROM skills WHERE slug = 'sql';
    IF sql_id IS NULL THEN RETURN; END IF;

    INSERT INTO skill_topics (skill_id, name, slug, display_order) VALUES
    (sql_id, 'Basics', 'basics', 1),
    (sql_id, 'Aggregation', 'aggregation', 2),
    (sql_id, 'Joins', 'joins', 3),
    (sql_id, 'Subqueries', 'subqueries', 4),
    (sql_id, 'Window Functions', 'window-functions', 5)
    ON CONFLICT (skill_id, slug) DO NOTHING;

    SELECT id INTO sql_basics_id FROM skill_topics WHERE skill_id = sql_id AND slug = 'basics';
    SELECT id INTO sql_agg_id FROM skill_topics WHERE skill_id = sql_id AND slug = 'aggregation';
    SELECT id INTO sql_joins_id FROM skill_topics WHERE skill_id = sql_id AND slug = 'joins';
    SELECT id INTO sql_sub_id FROM skill_topics WHERE skill_id = sql_id AND slug = 'subqueries';
    SELECT id INTO sql_win_id FROM skill_topics WHERE skill_id = sql_id AND slug = 'window-functions';

    INSERT INTO skill_subtopics (topic_id, name, slug, display_order) VALUES
    (sql_basics_id, 'SELECT', 'select', 1),
    (sql_basics_id, 'WHERE', 'where', 2),
    (sql_basics_id, 'ORDER BY', 'order-by', 3),
    (sql_agg_id, 'GROUP BY', 'group-by', 1),
    (sql_agg_id, 'HAVING', 'having', 2),
    (sql_agg_id, 'Aggregate Functions', 'aggregate-functions', 3),
    (sql_joins_id, 'INNER JOIN', 'inner-join', 1),
    (sql_joins_id, 'LEFT JOIN', 'left-join', 2),
    (sql_joins_id, 'RIGHT JOIN', 'right-join', 3),
    (sql_joins_id, 'FULL JOIN', 'full-join', 4),
    (sql_sub_id, 'Correlated Subqueries', 'correlated-subqueries', 1),
    (sql_sub_id, 'IN Subqueries', 'in-subqueries', 2),
    (sql_win_id, 'ROW_NUMBER', 'row-number', 1),
    (sql_win_id, 'RANK', 'rank', 2),
    (sql_win_id, 'LAG/LEAD', 'lag-lead', 3)
    ON CONFLICT (topic_id, slug) DO NOTHING;

    INSERT INTO topic_relationships (source_topic_id, target_topic_id, relationship_type) VALUES
    (sql_basics_id, sql_agg_id, 'NEXT_STEP'),
    (sql_agg_id, sql_joins_id, 'NEXT_STEP'),
    (sql_joins_id, sql_sub_id, 'NEXT_STEP'),
    (sql_sub_id, sql_win_id, 'NEXT_STEP')
    ON CONFLICT DO NOTHING;
END $$;

-- Seed React taxonomy
DO $$
DECLARE
    react_id UUID;
    r_basics_id UUID;
    r_hooks_id UUID;
    r_state_id UUID;
    r_routing_id UUID;
BEGIN
    SELECT id INTO react_id FROM skills WHERE slug = 'react';
    IF react_id IS NULL THEN RETURN; END IF;

    INSERT INTO skill_topics (skill_id, name, slug, display_order) VALUES
    (react_id, 'Basics', 'basics', 1),
    (react_id, 'Hooks', 'hooks', 2),
    (react_id, 'State Management', 'state-management', 3),
    (react_id, 'Routing', 'routing', 4)
    ON CONFLICT (skill_id, slug) DO NOTHING;

    SELECT id INTO r_basics_id FROM skill_topics WHERE skill_id = react_id AND slug = 'basics';
    SELECT id INTO r_hooks_id FROM skill_topics WHERE skill_id = react_id AND slug = 'hooks';
    SELECT id INTO r_state_id FROM skill_topics WHERE skill_id = react_id AND slug = 'state-management';
    SELECT id INTO r_routing_id FROM skill_topics WHERE skill_id = react_id AND slug = 'routing';

    INSERT INTO skill_subtopics (topic_id, name, slug, display_order) VALUES
    (r_basics_id, 'JSX', 'jsx', 1),
    (r_basics_id, 'Components', 'components', 2),
    (r_basics_id, 'Props', 'props', 3),
    (r_basics_id, 'Events', 'events', 4),
    (r_hooks_id, 'useState', 'use-state', 1),
    (r_hooks_id, 'useEffect', 'use-effect', 2),
    (r_hooks_id, 'useContext', 'use-context', 3),
    (r_hooks_id, 'useReducer', 'use-reducer', 4),
    (r_hooks_id, 'Custom Hooks', 'custom-hooks', 5),
    (r_state_id, 'Context API', 'context-api', 1),
    (r_state_id, 'Redux', 'redux', 2),
    (r_state_id, 'Zustand', 'zustand', 3),
    (r_routing_id, 'React Router', 'react-router', 1),
    (r_routing_id, 'Nested Routes', 'nested-routes', 2),
    (r_routing_id, 'Route Guards', 'route-guards', 3)
    ON CONFLICT (topic_id, slug) DO NOTHING;

    INSERT INTO topic_relationships (source_topic_id, target_topic_id, relationship_type) VALUES
    (r_basics_id, r_hooks_id, 'NEXT_STEP'),
    (r_hooks_id, r_state_id, 'NEXT_STEP'),
    (r_state_id, r_routing_id, 'NEXT_STEP')
    ON CONFLICT DO NOTHING;
END $$;

-- Seed Python taxonomy
DO $$
DECLARE
    py_id UUID;
    py_basics_id UUID;
    py_oop_id UUID;
    py_data_id UUID;
BEGIN
    SELECT id INTO py_id FROM skills WHERE slug = 'python';
    IF py_id IS NULL THEN RETURN; END IF;

    INSERT INTO skill_topics (skill_id, name, slug, display_order) VALUES
    (py_id, 'Basics', 'basics', 1),
    (py_id, 'OOP', 'oop', 2),
    (py_id, 'Data Handling', 'data-handling', 3)
    ON CONFLICT (skill_id, slug) DO NOTHING;

    SELECT id INTO py_basics_id FROM skill_topics WHERE skill_id = py_id AND slug = 'basics';
    SELECT id INTO py_oop_id FROM skill_topics WHERE skill_id = py_id AND slug = 'oop';
    SELECT id INTO py_data_id FROM skill_topics WHERE skill_id = py_id AND slug = 'data-handling';

    INSERT INTO skill_subtopics (topic_id, name, slug, display_order) VALUES
    (py_basics_id, 'Variables', 'variables', 1),
    (py_basics_id, 'Functions', 'functions', 2),
    (py_basics_id, 'List Comprehensions', 'list-comprehensions', 3),
    (py_basics_id, 'File I/O', 'file-io', 4),
    (py_oop_id, 'Classes', 'classes', 1),
    (py_oop_id, 'Inheritance', 'inheritance', 2),
    (py_oop_id, 'Decorators', 'decorators', 3),
    (py_data_id, 'Pandas', 'pandas', 1),
    (py_data_id, 'NumPy', 'numpy', 2),
    (py_data_id, 'DataFrames', 'dataframes', 3)
    ON CONFLICT (topic_id, slug) DO NOTHING;

    INSERT INTO topic_relationships (source_topic_id, target_topic_id, relationship_type) VALUES
    (py_basics_id, py_oop_id, 'NEXT_STEP'),
    (py_oop_id, py_data_id, 'NEXT_STEP')
    ON CONFLICT DO NOTHING;
END $$;

-- Seed Docker taxonomy
DO $$
DECLARE
    docker_id UUID;
    d_basics_id UUID;
    d_compose_id UUID;
BEGIN
    SELECT id INTO docker_id FROM skills WHERE slug = 'docker';
    IF docker_id IS NULL THEN RETURN; END IF;

    INSERT INTO skill_topics (skill_id, name, slug, display_order) VALUES
    (docker_id, 'Basics', 'basics', 1),
    (docker_id, 'Docker Compose', 'docker-compose', 2),
    (docker_id, 'Networking', 'networking', 3),
    (docker_id, 'Volumes', 'volumes', 4)
    ON CONFLICT (skill_id, slug) DO NOTHING;

    SELECT id INTO d_basics_id FROM skill_topics WHERE skill_id = docker_id AND slug = 'basics';
    SELECT id INTO d_compose_id FROM skill_topics WHERE skill_id = docker_id AND slug = 'docker-compose';

    INSERT INTO skill_subtopics (topic_id, name, slug, display_order) VALUES
    (d_basics_id, 'Dockerfile', 'dockerfile', 1),
    (d_basics_id, 'Images', 'images', 2),
    (d_basics_id, 'Containers', 'containers', 3),
    (d_basics_id, 'Docker CLI', 'docker-cli', 4),
    (d_compose_id, 'Services', 'services', 1),
    (d_compose_id, 'Configuration', 'configuration', 2),
    (d_compose_id, 'Multi-container', 'multi-container', 3)
    ON CONFLICT (topic_id, slug) DO NOTHING;

    INSERT INTO topic_relationships (source_topic_id, target_topic_id, relationship_type) VALUES
    (d_basics_id, d_compose_id, 'NEXT_STEP')
    ON CONFLICT DO NOTHING;
END $$;

-- Seed Spring Boot taxonomy
DO $$
DECLARE
    sb_id UUID;
    sb_basics_id UUID;
    sb_data_id UUID;
    sb_sec_id UUID;
BEGIN
    SELECT id INTO sb_id FROM skills WHERE slug = 'springboot';
    IF sb_id IS NULL THEN RETURN; END IF;

    INSERT INTO skill_topics (skill_id, name, slug, display_order) VALUES
    (sb_id, 'Basics', 'basics', 1),
    (sb_id, 'REST APIs', 'rest-apis', 2),
    (sb_id, 'Data Access', 'data-access', 3),
    (sb_id, 'Security', 'security', 4),
    (sb_id, 'Testing', 'testing', 5)
    ON CONFLICT (skill_id, slug) DO NOTHING;

    SELECT id INTO sb_basics_id FROM skill_topics WHERE skill_id = sb_id AND slug = 'basics';
    SELECT id INTO sb_data_id FROM skill_topics WHERE skill_id = sb_id AND slug = 'data-access';
    SELECT id INTO sb_sec_id FROM skill_topics WHERE skill_id = sb_id AND slug = 'security';

    INSERT INTO skill_subtopics (topic_id, name, slug, display_order) VALUES
    (sb_basics_id, 'Application Properties', 'application-properties', 1),
    (sb_basics_id, 'Dependency Injection', 'dependency-injection', 2),
    (sb_basics_id, 'Spring Boot Starter', 'spring-boot-starter', 3),
    (sb_data_id, 'JPA', 'jpa', 1),
    (sb_data_id, 'Hibernate', 'hibernate', 2),
    (sb_data_id, 'Flyway', 'flyway', 3),
    (sb_sec_id, 'Spring Security', 'spring-security', 1),
    (sb_sec_id, 'JWT', 'jwt', 2),
    (sb_sec_id, 'OAuth2', 'oauth2', 3)
    ON CONFLICT (topic_id, slug) DO NOTHING;

    INSERT INTO topic_relationships (source_topic_id, target_topic_id, relationship_type) VALUES
    (sb_basics_id, sb_data_id, 'NEXT_STEP'),
    (sb_data_id, sb_sec_id, 'NEXT_STEP')
    ON CONFLICT DO NOTHING;
END $$;

-- Seed Node.js taxonomy
DO $$
DECLARE
    node_id UUID;
    n_basics_id UUID;
    n_express_id UUID;
BEGIN
    SELECT id INTO node_id FROM skills WHERE slug = 'nodejs';
    IF node_id IS NULL THEN RETURN; END IF;

    INSERT INTO skill_topics (skill_id, name, slug, display_order) VALUES
    (node_id, 'Basics', 'basics', 1),
    (node_id, 'Express.js', 'expressjs', 2),
    (node_id, 'File System', 'file-system', 3),
    (node_id, 'Streams', 'streams', 4)
    ON CONFLICT (skill_id, slug) DO NOTHING;

    SELECT id INTO n_basics_id FROM skill_topics WHERE skill_id = node_id AND slug = 'basics';
    SELECT id INTO n_express_id FROM skill_topics WHERE skill_id = node_id AND slug = 'expressjs';

    INSERT INTO skill_subtopics (topic_id, name, slug, display_order) VALUES
    (n_basics_id, 'Modules', 'modules', 1),
    (n_basics_id, 'Event Loop', 'event-loop', 2),
    (n_basics_id, 'npm', 'npm', 3),
    (n_express_id, 'Routing', 'routing', 1),
    (n_express_id, 'Middleware', 'middleware', 2),
    (n_express_id, 'Error Handling', 'error-handling', 3)
    ON CONFLICT (topic_id, slug) DO NOTHING;

    INSERT INTO topic_relationships (source_topic_id, target_topic_id, relationship_type) VALUES
    (n_basics_id, n_express_id, 'NEXT_STEP')
    ON CONFLICT DO NOTHING;
END $$;

-- Seed skill relationships
INSERT INTO skill_relationships (source_skill_id, target_skill_id, relationship_type)
SELECT s1.id, s2.id, 'PREREQUISITE'
FROM skills s1, skills s2
WHERE s1.slug = 'javascript' AND s2.slug = 'react'
ON CONFLICT DO NOTHING;

INSERT INTO skill_relationships (source_skill_id, target_skill_id, relationship_type)
SELECT s1.id, s2.id, 'PREREQUISITE'
FROM skills s1, skills s2
WHERE s1.slug = 'javascript' AND s2.slug = 'nodejs'
ON CONFLICT DO NOTHING;

INSERT INTO skill_relationships (source_skill_id, target_skill_id, relationship_type)
SELECT s1.id, s2.id, 'PREREQUISITE'
FROM skills s1, skills s2
WHERE s1.slug = 'java' AND s2.slug = 'springboot'
ON CONFLICT DO NOTHING;

INSERT INTO skill_relationships (source_skill_id, target_skill_id, relationship_type)
SELECT s1.id, s2.id, 'PREREQUISITE'
FROM skills s1, skills s2
WHERE s1.slug = 'java' AND s2.slug = 'kotlin'
ON CONFLICT DO NOTHING;

INSERT INTO skill_relationships (source_skill_id, target_skill_id, relationship_type)
SELECT s1.id, s2.id, 'RELATED'
FROM skills s1, skills s2
WHERE s1.slug = 'react' AND s2.slug = 'vuejs'
ON CONFLICT DO NOTHING;

INSERT INTO skill_relationships (source_skill_id, target_skill_id, relationship_type)
SELECT s1.id, s2.id, 'RELATED'
FROM skills s1, skills s2
WHERE s1.slug = 'django' AND s2.slug = 'flask'
ON CONFLICT DO NOTHING;

INSERT INTO skill_relationships (source_skill_id, target_skill_id, relationship_type)
SELECT s1.id, s2.id, 'RELATED'
FROM skills s1, skills s2
WHERE s1.slug = 'postgresql' AND s2.slug = 'mysql'
ON CONFLICT DO NOTHING;

INSERT INTO skill_relationships (source_skill_id, target_skill_id, relationship_type)
SELECT s1.id, s2.id, 'PREREQUISITE'
FROM skills s1, skills s2
WHERE s1.slug = 'html' AND s2.slug = 'react'
ON CONFLICT DO NOTHING;

INSERT INTO skill_relationships (source_skill_id, target_skill_id, relationship_type)
SELECT s1.id, s2.id, 'PREREQUISITE'
FROM skills s1, skills s2
WHERE s1.slug = 'css' AND s2.slug = 'react'
ON CONFLICT DO NOTHING;
