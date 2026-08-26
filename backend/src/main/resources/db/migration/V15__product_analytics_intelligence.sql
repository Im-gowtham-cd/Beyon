-- V15: Advanced Product Analytics, Skill Engine, Career Roadmap, Requirements, Collaboration

-- Product analytics events
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_role VARCHAR(30),
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    page VARCHAR(500),
    session_id VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_role ON analytics_events(user_role);

-- Analytics aggregation snapshots (daily)
CREATE TABLE IF NOT EXISTS analytics_daily_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_date DATE NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC NOT NULL,
    dimensions JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(snapshot_date, metric_name, dimensions)
);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_date ON analytics_daily_snapshots(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_metric ON analytics_daily_snapshots(metric_name);

-- Skill recommendations
CREATE TABLE IF NOT EXISTS skill_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id UUID,
    skill_name VARCHAR(200) NOT NULL,
    recommendation_type VARCHAR(30) NOT NULL,
    score NUMERIC(5,2) NOT NULL DEFAULT 0,
    reason TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_skill_recommendations_student ON skill_recommendations(student_id);
CREATE INDEX IF NOT EXISTS idx_skill_recommendations_status ON skill_recommendations(status);

-- Career roadmap with states
CREATE TABLE IF NOT EXISTS career_roadmap_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    career_path_id UUID NOT NULL,
    skill_name VARCHAR(200) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    state VARCHAR(20) NOT NULL DEFAULT 'LOCKED',
    progress NUMERIC(5,2) NOT NULL DEFAULT 0,
    required_coins INTEGER DEFAULT 0,
    unlocked_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_career_roadmap_student ON career_roadmap_items(student_id);
CREATE INDEX IF NOT EXISTS idx_career_roadmap_path ON career_roadmap_items(career_path_id);
CREATE INDEX IF NOT EXISTS idx_career_roadmap_state ON career_roadmap_items(state);

-- Structured company requirements
CREATE TABLE IF NOT EXISTS company_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL,
    company_id UUID NOT NULL,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    required_skills JSONB NOT NULL DEFAULT '[]',
    preferred_skills JSONB NOT NULL DEFAULT '[]',
    min_cgpa NUMERIC(4,2),
    min_experience_years INTEGER DEFAULT 0,
    department_filter JSONB,
    graduation_year_filter JSONB,
    assessment_id UUID,
    coin_cost INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_company_requirements_opportunity ON company_requirements(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_company_requirements_company ON company_requirements(company_id);

-- Company/Institution community posts
CREATE TABLE IF NOT EXISTS entity_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL,
    entity_type VARCHAR(30) NOT NULL,
    post_type VARCHAR(30) NOT NULL,
    title VARCHAR(300),
    content TEXT NOT NULL,
    action_url VARCHAR(500),
    like_count INTEGER NOT NULL DEFAULT 0,
    comment_count INTEGER NOT NULL DEFAULT 0,
    visibility VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_entity_posts_entity ON entity_posts(entity_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_entity_posts_type ON entity_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_entity_posts_created ON entity_posts(created_at DESC);

-- Student recommendation feedback
CREATE TABLE IF NOT EXISTS recommendation_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommendation_id UUID NOT NULL REFERENCES skill_recommendations(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id),
    helpful BOOLEAN NOT NULL,
    feedback_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
