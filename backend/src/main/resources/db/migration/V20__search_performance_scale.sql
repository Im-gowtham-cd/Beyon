-- Phase 141-150: Scale, Performance, Search, Realtime & Platform Intelligence

-- Phase 143: Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_institution ON student_profiles(institution_id);

CREATE INDEX IF NOT EXISTS idx_questions_skill_status ON questions(skill_id, status);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_student_question_attempts_student ON student_question_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_student_question_attempts_question ON student_question_attempts(question_id);
CREATE INDEX IF NOT EXISTS idx_student_question_attempts_created ON student_question_attempts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_coin_transactions_user ON coin_transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_created ON coin_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_opportunity_applications_student ON opportunity_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_applications_opportunity ON opportunity_applications(opportunity_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_social_posts_author ON social_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_created ON social_posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_assessment_sessions_student ON assessment_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_assessment_sessions_status ON assessment_sessions(status);

CREATE INDEX IF NOT EXISTS idx_daily_challenges_student_date ON daily_challenges(student_id, challenge_date);

CREATE INDEX IF NOT EXISTS idx_skill_levels_student ON skill_levels(student_id);

CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);

-- Phase 144: Global Search Index
CREATE TABLE IF NOT EXISTS search_index (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    keywords TEXT,
    popularity_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(entity_type, entity_id)
);
CREATE INDEX IF NOT EXISTS idx_search_entity ON search_index(entity_type);
CREATE INDEX IF NOT EXISTS idx_search_keywords ON search_index USING GIN(to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(keywords, '')));
CREATE INDEX IF NOT EXISTS idx_search_popularity ON search_index(popularity_score DESC);

-- Phase 146: Real-time Events
CREATE TABLE IF NOT EXISTS realtime_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    payload TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_realtime_user ON realtime_events(user_id, read, created_at DESC);

-- Phase 148: Recommendation Feedback
CREATE TABLE IF NOT EXISTS recommendation_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(100) NOT NULL,
    recommendation_id UUID,
    signal VARCHAR(50) NOT NULL,
    metadata TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rec_signals_user ON recommendation_signals(user_id, recommendation_type);
CREATE INDEX IF NOT EXISTS idx_rec_signals_type ON recommendation_signals(recommendation_type, signal);

-- Phase 149: Data Integrity Checks
CREATE TABLE IF NOT EXISTS integrity_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    check_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    issues_found INTEGER DEFAULT 0,
    details TEXT,
    ran_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
