-- V16: Advanced Assessment, Recruitment & Career Intelligence

-- Assessment configurations (flexible builder)
CREATE TABLE IF NOT EXISTS assessment_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    total_questions INTEGER NOT NULL DEFAULT 0,
    passing_score NUMERIC(5,2) NOT NULL DEFAULT 60,
    negative_marking BOOLEAN NOT NULL DEFAULT false,
    negative_marks NUMERIC(3,2) DEFAULT 0,
    randomize_questions BOOLEAN NOT NULL DEFAULT true,
    randomize_options BOOLEAN NOT NULL DEFAULT false,
    section_wise_time BOOLEAN NOT NULL DEFAULT false,
    attempt_limit INTEGER NOT NULL DEFAULT 1,
    coin_cost INTEGER NOT NULL DEFAULT 0,
    adaptive_enabled BOOLEAN NOT NULL DEFAULT false,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_assessment_config_company ON assessment_configurations(company_id);
CREATE INDEX IF NOT EXISTS idx_assessment_config_status ON assessment_configurations(status);

-- Assessment sections
CREATE TABLE IF NOT EXISTS assessment_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessment_configurations(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    question_count INTEGER NOT NULL DEFAULT 0,
    time_limit_minutes INTEGER,
    section_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_assessment_sections_assessment ON assessment_sections(assessment_id);

-- Enhanced question bank
CREATE TABLE IF NOT EXISTS question_bank (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL,
    creator_role VARCHAR(30) NOT NULL,
    topic_id UUID,
    skill_id UUID,
    question_type VARCHAR(30) NOT NULL,
    difficulty VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    question_text TEXT NOT NULL,
    options JSONB,
    correct_answer TEXT,
    explanation TEXT,
    expected_time_seconds INTEGER DEFAULT 60,
    score NUMERIC(5,2) NOT NULL DEFAULT 1,
    tags JSONB DEFAULT '[]',
    is_active BOOLEAN NOT NULL DEFAULT true,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_question_bank_creator ON question_bank(creator_id);
CREATE INDEX IF NOT EXISTS idx_question_bank_type ON question_bank(question_type);
CREATE INDEX IF NOT EXISTS idx_question_bank_difficulty ON question_bank(difficulty);
CREATE INDEX IF NOT EXISTS idx_question_bank_skill ON question_bank(skill_id);
CREATE INDEX IF NOT EXISTS idx_question_bank_topic ON question_bank(topic_id);
CREATE INDEX IF NOT EXISTS idx_question_bank_active ON question_bank(is_active);

-- Assessment-section-question mapping
CREATE TABLE IF NOT EXISTS assessment_section_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES assessment_sections(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES question_bank(id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    score_override NUMERIC(5,2)
);

-- Enhanced assessment sessions with adaptive state
ALTER TABLE assessment_sessions ADD COLUMN IF NOT EXISTS assessment_config_id UUID;
ALTER TABLE assessment_sessions ADD COLUMN IF NOT EXISTS current_difficulty VARCHAR(20) DEFAULT 'MEDIUM';
ALTER TABLE assessment_sessions ADD COLUMN IF NOT EXISTS adaptive_state JSONB;

-- Enhanced assessment answers with skill scoring
ALTER TABLE assessment_answers ADD COLUMN IF NOT EXISTS skill_scores JSONB;
ALTER TABLE assessment_answers ADD COLUMN IF NOT EXISTS section_id UUID;
ALTER TABLE assessment_answers ADD COLUMN IF NOT EXISTS time_taken_seconds INTEGER DEFAULT 0;

-- Assessment results
CREATE TABLE IF NOT EXISTS assessment_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    overall_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    max_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    accuracy NUMERIC(5,2) NOT NULL DEFAULT 0,
    percentile NUMERIC(5,2),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    section_scores JSONB,
    skill_scores JSONB,
    time_taken_seconds INTEGER DEFAULT 0,
    questions_attempted INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_assessment_results_session ON assessment_results(session_id);
CREATE INDEX IF NOT EXISTS idx_assessment_results_student ON assessment_results(student_id);

-- Recruitment pipeline stages
CREATE TABLE IF NOT EXISTS recruitment_pipelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL,
    company_id UUID NOT NULL,
    student_id UUID NOT NULL,
    current_stage VARCHAR(30) NOT NULL DEFAULT 'APPLIED',
    assessment_result_id UUID,
    interview_round INTEGER DEFAULT 0,
    overall_score NUMERIC(5,2),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_recruitment_pipelines_opportunity ON recruitment_pipelines(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_recruitment_pipelines_student ON recruitment_pipelines(student_id);
CREATE INDEX IF NOT EXISTS idx_recruitment_pipelines_stage ON recruitment_pipelines(current_stage);

-- Interview management
CREATE TABLE IF NOT EXISTS interview_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_id UUID NOT NULL REFERENCES recruitment_pipelines(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    round_type VARCHAR(30) NOT NULL,
    interviewer_id UUID,
    scheduled_at TIMESTAMPTZ,
    duration_minutes INTEGER DEFAULT 60,
    mode VARCHAR(20) DEFAULT 'ONLINE',
    meeting_link VARCHAR(500),
    instructions TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_pipeline ON interview_sessions(pipeline_id);

-- Interview scorecards
CREATE TABLE IF NOT EXISTS interview_scorecards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
    interviewer_id UUID NOT NULL,
    technical_skills NUMERIC(3,1),
    communication NUMERIC(3,1),
    problem_solving NUMERIC(3,1),
    domain_knowledge NUMERIC(3,1),
    overall_rating NUMERIC(3,1),
    recommendation VARCHAR(20),
    comments TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_interview_scorecards_interview ON interview_scorecards(interview_id);

-- Offer & placement tracking
CREATE TABLE IF NOT EXISTS placement_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_id UUID NOT NULL REFERENCES recruitment_pipelines(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    company_id UUID NOT NULL,
    job_role VARCHAR(200) NOT NULL,
    package_amount NUMERIC(12,2),
    package_currency VARCHAR(10) DEFAULT 'INR',
    company_tier VARCHAR(10),
    offer_status VARCHAR(20) NOT NULL DEFAULT 'GENERATED',
    offer_date TIMESTAMPTZ,
    acceptance_date TIMESTAMPTZ,
    joining_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_placement_offers_student ON placement_offers(student_id);
CREATE INDEX IF NOT EXISTS idx_placement_offers_company ON placement_offers(company_id);
CREATE INDEX IF NOT EXISTS idx_placement_offers_status ON placement_offers(offer_status);
