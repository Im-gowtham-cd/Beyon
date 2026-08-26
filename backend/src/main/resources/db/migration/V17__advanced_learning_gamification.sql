-- V17: Advanced Learning, Gamification & Student Growth (Phases 111-120)
-- Skill XP & Level System (Phase 112)
CREATE TABLE IF NOT EXISTS skill_xp_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id),
    skill_id UUID NOT NULL,
    amount INTEGER NOT NULL,
    source VARCHAR(50) NOT NULL CHECK (source IN ('DAILY_CHALLENGE','PRACTICE','WEEKEND_TEST','CERTIFICATION','PROJECT','ASSESSMENT','LEARNING_PROGRAM')),
    source_id UUID,
    description VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, skill_id, source, source_id)
);

CREATE INDEX IF NOT EXISTS idx_skill_xp_student ON skill_xp_transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_skill_xp_skill ON skill_xp_transactions(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_xp_created ON skill_xp_transactions(created_at);

CREATE TABLE IF NOT EXISTS skill_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id),
    skill_id UUID NOT NULL,
    total_xp INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    level_name VARCHAR(30) NOT NULL DEFAULT 'BEGINNER' CHECK (level_name IN ('BEGINNER','INTERMEDIATE','ADVANCED','EXPERT','INDUSTRY_READY')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_skill_levels_student ON skill_levels(student_id);
CREATE INDEX IF NOT EXISTS idx_skill_levels_level ON skill_levels(level);

-- XP configuration: thresholds for each level
CREATE TABLE IF NOT EXISTS skill_xp_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level INTEGER NOT NULL UNIQUE,
    level_name VARCHAR(30) NOT NULL,
    min_xp INTEGER NOT NULL,
    max_xp INTEGER NOT NULL
);

INSERT INTO skill_xp_config (level, level_name, min_xp, max_xp) VALUES
(1, 'BEGINNER', 0, 499),
(2, 'INTERMEDIATE', 500, 1499),
(3, 'ADVANCED', 1500, 3999),
(4, 'EXPERT', 4000, 7999),
(5, 'INDUSTRY_READY', 8000, 99999);

-- Enhanced daily challenges (Phase 111)
ALTER TABLE daily_challenges ADD COLUMN IF NOT EXISTS challenge_type VARCHAR(50) DEFAULT 'MCQ' CHECK (challenge_type IN ('MCQ','CODING','SQL','APTITUDE','DEBUGGING','OUTPUT_PREDICTION','THEORY','SOFT_SKILLS'));
ALTER TABLE daily_challenges ADD COLUMN IF NOT EXISTS topic VARCHAR(200);
ALTER TABLE daily_challenges ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) DEFAULT 'MEDIUM' CHECK (difficulty IN ('EASY','MEDIUM','HARD','EXPERT'));
ALTER TABLE daily_challenges ADD COLUMN IF NOT EXISTS xp_reward INTEGER DEFAULT 25;
ALTER TABLE daily_challenges ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;
ALTER TABLE daily_challenges ADD COLUMN IF NOT EXISTS time_taken_seconds INTEGER;

-- Streak freeze system (Phase 113)
ALTER TABLE student_streaks ADD COLUMN IF NOT EXISTS freeze_count INTEGER NOT NULL DEFAULT 3;
ALTER TABLE student_streaks ADD COLUMN IF NOT EXISTS freezes_used INTEGER NOT NULL DEFAULT 0;
ALTER TABLE student_streaks ADD COLUMN IF NOT EXISTS last_active_date DATE;

CREATE TABLE IF NOT EXISTS streak_freeze_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id),
    freeze_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, freeze_date)
);

-- Enhanced achievements with rarity (Phase 114)
ALTER TABLE student_achievements_gamification ADD COLUMN IF NOT EXISTS rarity VARCHAR(20) DEFAULT 'COMMON' CHECK (rarity IN ('COMMON','UNCOMMON','RARE','EPIC','LEGENDARY'));
ALTER TABLE student_achievements_gamification ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'LEARNING' CHECK (category IN ('LEARNING','PRACTICE','ASSESSMENT','CAREER','COMMUNITY','CONSISTENCY','PLACEMENT'));
ALTER TABLE student_achievements_gamification ADD COLUMN IF NOT EXISTS badge_icon VARCHAR(20);
ALTER TABLE student_achievements_gamification ADD COLUMN IF NOT EXISTS unlocked_at TIMESTAMP DEFAULT NOW();

-- Weekly tests (Phase 115)
CREATE TABLE IF NOT EXISTS weekly_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    week_number INTEGER NOT NULL,
    year INTEGER NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    total_questions INTEGER NOT NULL DEFAULT 40,
    passing_score INTEGER NOT NULL DEFAULT 40,
    coin_reward INTEGER NOT NULL DEFAULT 100,
    xp_reward INTEGER NOT NULL DEFAULT 200,
    status VARCHAR(20) NOT NULL DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING','ACTIVE','COMPLETED')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (week_number, year)
);

CREATE TABLE IF NOT EXISTS weekly_test_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    weekly_test_id UUID NOT NULL REFERENCES weekly_tests(id),
    section_name VARCHAR(100) NOT NULL,
    section_type VARCHAR(50) NOT NULL CHECK (section_type IN ('APTITUDE','TECHNICAL','CODING','CAREER_SKILLS')),
    question_count INTEGER NOT NULL DEFAULT 10,
    time_minutes INTEGER NOT NULL DEFAULT 15,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS weekly_test_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id),
    weekly_test_id UUID NOT NULL REFERENCES weekly_tests(id),
    score INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    time_taken_seconds INTEGER,
    percentile DECIMAL(5,2),
    xp_earned INTEGER NOT NULL DEFAULT 0,
    coins_earned INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS','COMPLETED')),
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,
    UNIQUE (student_id, weekly_test_id)
);

CREATE INDEX IF NOT EXISTS idx_weekly_test_attempts_student ON weekly_test_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_weekly_test_attempts_test ON weekly_test_attempts(weekly_test_id);

-- Learning program enrollments & modules (Phase 116)
CREATE TABLE IF NOT EXISTS learning_program_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES learning_programs(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    module_type VARCHAR(50) NOT NULL CHECK (module_type IN ('LESSON','PRACTICE','ASSESSMENT','PROJECT','RESOURCE')),
    duration_minutes INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS learning_program_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id),
    program_id UUID NOT NULL REFERENCES learning_programs(id),
    progress_percent INTEGER NOT NULL DEFAULT 0,
    modules_completed INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ENROLLED' CHECK (status IN ('ENROLLED','IN_PROGRESS','COMPLETED')),
    enrolled_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,
    UNIQUE (student_id, program_id)
);

CREATE TABLE IF NOT EXISTS learning_program_module_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL REFERENCES learning_program_enrollments(id),
    module_id UUID NOT NULL REFERENCES learning_program_modules(id),
    status VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED' CHECK (status IN ('NOT_STARTED','IN_PROGRESS','COMPLETED')),
    completed_at TIMESTAMP,
    UNIQUE (enrollment_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_learning_program_enrollments_student ON learning_program_enrollments(student_id);

-- Student certificates with verification (Phase 117)
CREATE TABLE IF NOT EXISTS student_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id),
    program_id UUID NOT NULL REFERENCES learning_programs(id),
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

CREATE INDEX IF NOT EXISTS idx_student_certificates_student ON student_certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_student_certificates_verify ON student_certificates(certificate_id);

-- Growth score (Phase 120)
CREATE TABLE IF NOT EXISTS student_growth_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id),
    overall_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    skills_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    consistency_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    assessment_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    certification_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    project_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    career_ready_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    career_readiness VARCHAR(30) NOT NULL DEFAULT 'NOT_READY' CHECK (career_readiness IN ('NOT_READY','DEVELOPING','ALMOST_READY','INDUSTRY_READY','HIGHLY_COMPETITIVE')),
    computed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (student_id)
);

CREATE INDEX IF NOT EXISTS idx_growth_scores_student ON student_growth_scores(student_id);

-- Personalized feed (Phase 119)
CREATE TABLE IF NOT EXISTS personalized_feed_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id),
    item_type VARCHAR(50) NOT NULL CHECK (item_type IN ('DAILY_CHALLENGE','CONTINUE_LEARNING','SKILL_GAP','RECOMMENDED_COURSE','COMPANY_OPPORTUNITY','WEEKEND_TEST','CERTIFICATION','ACHIEVEMENT','CAREER_TIP')),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    action_url VARCHAR(500),
    action_label VARCHAR(100),
    metadata JSONB,
    relevance_score DECIMAL(5,4) NOT NULL DEFAULT 0,
    dismissed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_personalized_feed_student ON personalized_feed_items(student_id);
CREATE INDEX IF NOT EXISTS idx_personalized_feed_relevance ON personalized_feed_items(student_id, relevance_score DESC);
