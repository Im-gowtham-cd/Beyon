-- V11: Reputation, Social Enhancements, Project Verification, Smart Notifications

-- Follow counts cache on users (read from follows table, but cached for performance)
ALTER TABLE users ADD COLUMN IF NOT EXISTS follower_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS following_count INTEGER NOT NULL DEFAULT 0;

-- Discussion reputation tracking
CREATE TABLE IF NOT EXISTS reputation_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    points INTEGER NOT NULL,
    reference_type VARCHAR(50),
    reference_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reputation_user ON reputation_events(user_id);

-- User reputation summary
CREATE TABLE IF NOT EXISTS user_reputation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    total_reputation INTEGER NOT NULL DEFAULT 0,
    answers_count INTEGER NOT NULL DEFAULT 0,
    accepted_answers INTEGER NOT NULL DEFAULT 0,
    upvotes_received INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Project verification workflow
CREATE TABLE IF NOT EXISTS project_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    student_id UUID NOT NULL REFERENCES users(id),
    verification_type VARCHAR(50) NOT NULL,
    evidence_url VARCHAR(500),
    verifier_id UUID,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    verified_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_project_verification_project ON project_verifications(project_id);
CREATE INDEX IF NOT EXISTS idx_project_verification_student ON project_verifications(student_id);

-- Company/Institution verification
CREATE TABLE IF NOT EXISTS entity_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL,
    entity_type VARCHAR(30) NOT NULL,
    verification_type VARCHAR(50) NOT NULL,
    document_url VARCHAR(500),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    verified_by UUID,
    verified_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_entity_verification_entity ON entity_verifications(entity_id, entity_type);

-- Smart notification priorities and delivery tracking
CREATE TABLE IF NOT EXISTS smart_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    priority VARCHAR(10) NOT NULL DEFAULT 'NORMAL',
    title VARCHAR(300) NOT NULL,
    body TEXT,
    action_url VARCHAR(500),
    reference_type VARCHAR(50),
    reference_id UUID,
    is_read BOOLEAN NOT NULL DEFAULT false,
    delivery_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_smart_notification_user ON smart_notifications(user_id, is_read, created_at DESC);

-- Enhanced social post types
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS link_url VARCHAR(500);

-- Discussion categories seed data
INSERT INTO discussion_categories (id, name, slug, description, icon, sort_order, created_at)
SELECT gen_random_uuid(), cat.name, cat.slug, cat.description, cat.icon, cat.sort_order, now()
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
