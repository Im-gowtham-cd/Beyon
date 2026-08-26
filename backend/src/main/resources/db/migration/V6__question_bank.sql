CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id UUID REFERENCES skills(id) ON DELETE SET NULL,
    topic_id UUID REFERENCES skill_topics(id) ON DELETE SET NULL,
    subtopic_id UUID REFERENCES skill_subtopics(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    question_type VARCHAR(30) NOT NULL CHECK (question_type IN ('MCQ','MULTIPLE_SELECT','TRUE_FALSE','SHORT_ANSWER','CODING','SQL','DEBUGGING','OUTPUT_PREDICTION')),
    difficulty VARCHAR(10) NOT NULL CHECK (difficulty IN ('EASY','MEDIUM','HARD')),
    evaluation_method VARCHAR(20) NOT NULL DEFAULT 'EXACT_MATCH' CHECK (evaluation_method IN ('EXACT_MATCH','FUZZY_MATCH','KEYWORD','MANUAL','CODE_EXECUTION','SQL_EXECUTION')),
    expected_output TEXT,
    code_template TEXT,
    solution TEXT,
    explanation TEXT,
    time_limit_seconds INTEGER,
    memory_limit_mb INTEGER,
    tags TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
    version INTEGER NOT NULL DEFAULT 1,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_questions_skill ON questions (skill_id);
CREATE INDEX idx_questions_topic ON questions (topic_id);
CREATE INDEX idx_questions_type ON questions (question_type);
CREATE INDEX idx_questions_difficulty ON questions (difficulty);
CREATE INDEX idx_questions_status ON questions (status);

CREATE TABLE question_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    explanation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_question_options_question ON question_options (question_id);

CREATE TABLE question_test_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    input_data TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_sample BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    hidden BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_question_test_cases_question ON question_test_cases (question_id);

CREATE TABLE student_question_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    user_answer TEXT,
    is_correct BOOLEAN,
    time_spent_seconds INTEGER,
    score DECIMAL(5,2),
    feedback TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED','EVALUATED','MANUAL_REVIEW')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_student_question_attempts_student ON student_question_attempts (student_id);
CREATE INDEX idx_student_question_attempts_question ON student_question_attempts (question_id);
CREATE INDEX idx_student_question_attempts_created ON student_question_attempts (created_at DESC);

CREATE TABLE student_practice_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    total_attempted INTEGER NOT NULL DEFAULT 0,
    total_solved INTEGER NOT NULL DEFAULT 0,
    easy_solved INTEGER NOT NULL DEFAULT 0,
    medium_solved INTEGER NOT NULL DEFAULT 0,
    hard_solved INTEGER NOT NULL DEFAULT 0,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_practice_date DATE,
    total_time_seconds BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student_topic_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES skill_topics(id) ON DELETE CASCADE,
    questions_attempted INTEGER NOT NULL DEFAULT 0,
    questions_solved INTEGER NOT NULL DEFAULT 0,
    accuracy DECIMAL(5,2) DEFAULT 0,
    last_attempt_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, topic_id)
);

CREATE INDEX idx_student_topic_progress_student ON student_topic_progress (student_id);

CREATE TABLE daily_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenge_date DATE NOT NULL,
    question_id UUID NOT NULL REFERENCES questions(id),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','IN_PROGRESS','COMPLETED','EXPIRED','MISSED')),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    time_spent_seconds INTEGER,
    is_correct BOOLEAN,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, challenge_date)
);

CREATE INDEX idx_daily_challenges_student ON daily_challenges (student_id);
CREATE INDEX idx_daily_challenges_date ON daily_challenges (challenge_date);

CREATE TABLE coin_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    balance BIGINT NOT NULL DEFAULT 0,
    total_earned BIGINT NOT NULL DEFAULT 0,
    total_spent BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE coin_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount BIGINT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('EARNED','SPENT')),
    reason VARCHAR(100) NOT NULL,
    reference_type VARCHAR(50),
    reference_id UUID,
    balance_after BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coin_transactions_student ON coin_transactions (student_id);
CREATE INDEX idx_coin_transactions_created ON coin_transactions (created_at DESC);

CREATE TABLE coin_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(100) NOT NULL UNIQUE,
    coins_amount BIGINT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    daily_limit INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO coin_rules (action, coins_amount, description, daily_limit) VALUES
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

CREATE TABLE student_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_activity_date DATE,
    streak_freezes_used INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student_achievements_gamification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_key VARCHAR(100) NOT NULL,
    achievement_name VARCHAR(200) NOT NULL,
    description TEXT,
    badge_icon VARCHAR(10),
    earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, achievement_key)
);

CREATE INDEX idx_student_achievements_gamification_student ON student_achievements_gamification (student_id);

CREATE TABLE leaderboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    board_type VARCHAR(50) NOT NULL,
    board_scope VARCHAR(100),
    score BIGINT NOT NULL DEFAULT 0,
    rank_position INTEGER,
    period VARCHAR(20) NOT NULL CHECK (period IN ('WEEKLY','MONTHLY','ALL_TIME')),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, board_type, board_scope, period)
);

CREATE INDEX idx_leaderboards_board ON leaderboards (board_type, board_scope, period, score DESC);

CREATE TABLE tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    test_type VARCHAR(30) NOT NULL CHECK (test_type IN ('WEEKLY','WEEKEND','SKILL','TOPIC','MOCK_PLACEMENT')),
    duration_minutes INTEGER NOT NULL,
    difficulty VARCHAR(10) CHECK (difficulty IN ('EASY','MEDIUM','HARD')),
    total_questions INTEGER NOT NULL DEFAULT 0,
    passing_score DECIMAL(5,2),
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','ACTIVE','COMPLETED','ARCHIVED')),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE test_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    display_order INTEGER NOT NULL DEFAULT 0,
    marks INTEGER NOT NULL DEFAULT 1,
    UNIQUE (test_id, question_id)
);

CREATE INDEX idx_test_questions_test ON test_questions (test_id);

CREATE TABLE test_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    score DECIMAL(8,2),
    total_marks DECIMAL(8,2),
    accuracy DECIMAL(5,2),
    time_spent_seconds INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS','SUBMITTED','EVALUATED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_test_attempts_student ON test_attempts (student_id);
CREATE INDEX idx_test_attempts_test ON test_attempts (test_id);

CREATE TABLE learning_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    program_type VARCHAR(30) NOT NULL CHECK (program_type IN ('CERTIFICATION','COURSE','WORKSHOP','TRAINING','FDP','BOOTCAMP','MENTORSHIP')),
    provider VARCHAR(200),
    skill_id UUID REFERENCES skills(id),
    topic_id UUID REFERENCES skill_topics(id),
    difficulty VARCHAR(10),
    duration_hours INTEGER,
    cost DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'INR',
    url VARCHAR(500),
    is_free BOOLEAN NOT NULL DEFAULT true,
    rating DECIMAL(3,2),
    enrolled_count INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_learning_programs_skill ON learning_programs (skill_id);
CREATE INDEX idx_learning_programs_type ON learning_programs (program_type);

CREATE TABLE company_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    opportunity_type VARCHAR(30) NOT NULL CHECK (opportunity_type IN ('INTERNSHIP','FULL_TIME','CONTRACT','PART_TIME')),
    location VARCHAR(200),
    is_remote BOOLEAN DEFAULT false,
    min_cgpa DECIMAL(4,2),
    eligible_departments TEXT,
    eligible_graduation_years TEXT,
    required_skills TEXT,
    preferred_skills TEXT,
    min_beyon_coins INTEGER DEFAULT 0,
    assessment_id UUID,
    application_count INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','CLOSED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_company_opportunities_company ON company_opportunities (company_user_id);
CREATE INDEX idx_company_opportunities_status ON company_opportunities (status);

CREATE TABLE opportunity_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES company_opportunities(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    total_questions INTEGER NOT NULL DEFAULT 0,
    coin_cost INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','ACTIVE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE opportunity_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES company_opportunities(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','ELIGIBLE','NOT_ELIGIBLE','APPLIED','ASSESSMENT_PASSED','ASSESSMENT_FAILED','REJECTED','HIRED')),
    coins_spent INTEGER DEFAULT 0,
    assessment_score DECIMAL(8,2),
    applied_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (opportunity_id, student_id)
);

CREATE INDEX idx_opportunity_applications_student ON opportunity_applications (student_id);
CREATE INDEX idx_opportunity_applications_opportunity ON opportunity_applications (opportunity_id);

CREATE TABLE student_saved_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, question_id)
);

CREATE INDEX idx_student_saved_questions_student ON student_saved_questions (student_id);
