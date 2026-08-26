CREATE TABLE assessment_skill_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id),
    topic VARCHAR(200),
    score DECIMAL(5,2) NOT NULL DEFAULT 0,
    accuracy DECIMAL(5,2) NOT NULL DEFAULT 0,
    questions_attempted INTEGER NOT NULL DEFAULT 0,
    questions_correct INTEGER NOT NULL DEFAULT 0,
    time_spent_seconds INTEGER NOT NULL DEFAULT 0,
    difficulty_avg DECIMAL(3,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (session_id, skill_id, topic)
);

CREATE INDEX idx_assessment_skill_scores_student ON assessment_skill_scores (student_id);
CREATE INDEX idx_assessment_skill_scores_session ON assessment_skill_scores (session_id);
CREATE INDEX idx_assessment_skill_scores_skill ON assessment_skill_scores (skill_id);

CREATE TABLE student_skill_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id),
    proficiency_level VARCHAR(30) NOT NULL DEFAULT 'BEGINNER' CHECK (proficiency_level IN ('BEGINNER','ELEMENTARY','INTERMEDIATE','ADVANCED','EXPERT')),
    confidence_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    evidence_count INTEGER NOT NULL DEFAULT 0,
    total_questions_solved INTEGER NOT NULL DEFAULT 0,
    accuracy DECIMAL(5,2) NOT NULL DEFAULT 0,
    assessment_count INTEGER NOT NULL DEFAULT 0,
    certification_count INTEGER NOT NULL DEFAULT 0,
    project_count INTEGER NOT NULL DEFAULT 0,
    practice_count INTEGER NOT NULL DEFAULT 0,
    improvement_trend VARCHAR(20) DEFAULT 'STABLE' CHECK (improvement_trend IN ('IMPROVING','STABLE','DECLINING')),
    last_assessed_at TIMESTAMPTZ,
    verified BOOLEAN NOT NULL DEFAULT false,
    evidence_summary JSONB,
    score_history JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, skill_id)
);

CREATE INDEX idx_student_skill_intelligence_student ON student_skill_intelligence (student_id);
CREATE INDEX idx_student_skill_intelligence_skill ON student_skill_intelligence (skill_id);
CREATE INDEX idx_student_skill_intelligence_proficiency ON student_skill_intelligence (proficiency_level);

CREATE TABLE career_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(100),
    required_skills JSONB NOT NULL DEFAULT '[]',
    optional_skills JSONB DEFAULT '[]',
    typical_education VARCHAR(200),
    salary_range VARCHAR(100),
    growth_outlook VARCHAR(100),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_career_paths_slug ON career_paths (slug);
CREATE INDEX idx_career_paths_category ON career_paths (category);

CREATE TABLE career_path_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    career_path_id UUID NOT NULL REFERENCES career_paths(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id),
    required BOOLEAN NOT NULL DEFAULT true,
    proficiency_level VARCHAR(30) NOT NULL DEFAULT 'INTERMEDIATE',
    sort_order INTEGER NOT NULL DEFAULT 0,
    prerequisites UUID[],
    UNIQUE (career_path_id, skill_id)
);

CREATE INDEX idx_career_path_skills_path ON career_path_skills (career_path_id);

CREATE TABLE student_career_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    career_path_id UUID NOT NULL REFERENCES career_paths(id),
    target_level VARCHAR(30) NOT NULL DEFAULT 'INTERMEDIATE',
    readiness_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    skills_acquired INTEGER NOT NULL DEFAULT 0,
    skills_total INTEGER NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, career_path_id)
);

CREATE INDEX idx_student_career_progress_student ON student_career_progress (student_id);

CREATE TABLE matching_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    opportunity_id UUID NOT NULL REFERENCES company_opportunities(id),
    total_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    skill_score DECIMAL(5,2) DEFAULT 0,
    academic_score DECIMAL(5,2) DEFAULT 0,
    assessment_score DECIMAL(5,2) DEFAULT 0,
    experience_score DECIMAL(5,2) DEFAULT 0,
    match_factors JSONB,
    matched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, opportunity_id)
);

CREATE INDEX idx_matching_scores_student ON matching_scores (student_id);
CREATE INDEX idx_matching_scores_opportunity ON matching_scores (opportunity_id);
CREATE INDEX idx_matching_scores_total ON matching_scores (total_score DESC);

CREATE TABLE skill_gaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    career_path_id UUID REFERENCES career_paths(id),
    opportunity_id UUID REFERENCES company_opportunities(id),
    required_skill_id UUID NOT NULL REFERENCES skills(id),
    current_level VARCHAR(30) NOT NULL DEFAULT 'NONE',
    required_level VARCHAR(30) NOT NULL,
    gap_severity VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (gap_severity IN ('NONE','LOW','MEDIUM','HIGH','CRITICAL')),
    recommendation TEXT,
    estimated_effort_hours INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, required_skill_id, career_path_id)
);

CREATE INDEX idx_skill_gaps_student ON skill_gaps (student_id);

CREATE TABLE interview_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES company_opportunities(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    round_type VARCHAR(50) NOT NULL CHECK (round_type IN ('TECHNICAL','HR','GROUP_DISCUSSION','CASE_STUDY','CODING','PRESENTATION','F2F')),
    sort_order INTEGER NOT NULL DEFAULT 0,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    max_score DECIMAL(5,2) NOT NULL DEFAULT 100,
    description TEXT,
    is eliminative BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_interview_rounds_opportunity ON interview_rounds (opportunity_id);

CREATE TABLE interview_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES recruitment_applications(id) ON DELETE CASCADE,
    round_id UUID NOT NULL REFERENCES interview_rounds(id),
    interviewer_id UUID REFERENCES users(id),
    scheduled_at TIMESTAMPTZ,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    location VARCHAR(500),
    meeting_link VARCHAR(500),
    status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED','NO_SHOW')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_interview_schedules_application ON interview_schedules (application_id);
CREATE INDEX idx_interview_schedules_interviewer ON interview_schedules (interviewer_id);
CREATE INDEX idx_interview_schedules_status ON interview_schedules (status);

CREATE TABLE interview_scorecards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES interview_schedules(id) ON DELETE CASCADE,
    interviewer_id UUID NOT NULL REFERENCES users(id),
    scores JSONB NOT NULL DEFAULT '{}',
    overall_score DECIMAL(5,2),
    recommendation VARCHAR(30) CHECK (recommendation IN ('STRONG_HIRE','HIRE','MAYBE','NO_HIRE','STRONG_NO_HIRE')),
    strengths TEXT,
    weaknesses TEXT,
    notes TEXT,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_interview_scorecards_schedule ON interview_scorecards (schedule_id);

CREATE TABLE institution_analytics_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
    department_stats JSONB,
    skill_demand JSONB,
    assessment_performance JSONB,
    salary_distribution JSONB,
    placement_trend JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (institution_id, snapshot_date)
);

CREATE INDEX idx_institution_analytics_institution ON institution_analytics_snapshots (institution_id);

CREATE TABLE company_analytics_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_applications INTEGER DEFAULT 0,
    total_assessments INTEGER DEFAULT 0,
    total_shortlisted INTEGER DEFAULT 0,
    total_interviews INTEGER DEFAULT 0,
    total_selected INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    avg_assessment_score DECIMAL(5,2) DEFAULT 0,
    avg_time_to_hire_days INTEGER DEFAULT 0,
    institution_performance JSONB,
    skill_distribution JSONB,
    funnel_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (company_user_id, snapshot_date)
);

CREATE INDEX idx_company_analytics_company ON company_analytics_snapshots (company_user_id);

CREATE TABLE collaboration_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    host_type VARCHAR(30) NOT NULL CHECK (host_type IN ('COMPANY','INSTITUTION')),
    program_type VARCHAR(50) NOT NULL CHECK (program_type IN ('MENTORSHIP','WORKSHOP','GUEST_LECTURE','LIVE_PROJECT','INTERNSHIP','RESEARCH_PROJECT','CONSULTANCY','FDP','INDUSTRIAL_TRAINING','INNOVATION_CHALLENGE','HACKATHON')),
    title VARCHAR(300) NOT NULL,
    description TEXT,
    topic VARCHAR(200),
    target_skills JSONB DEFAULT '[]',
    target_audience VARCHAR(30) CHECK (target_audience IN ('STUDENTS','INSTITUTIONS','BOTH')),
    target_institution_ids UUID[],
    target_departments TEXT,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    max_participants INTEGER,
    current_participants INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','OPEN','IN_PROGRESS','COMPLETED','CANCELLED')),
    location VARCHAR(500),
    meeting_link VARCHAR(500),
    prerequisites TEXT,
    certificate_provided BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_collaboration_programs_host ON collaboration_programs (host_user_id);
CREATE INDEX idx_collaboration_programs_type ON collaboration_programs (program_type);
CREATE INDEX idx_collaboration_programs_status ON collaboration_programs (status);

CREATE TABLE collaboration_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES collaboration_programs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL DEFAULT 'REGISTERED' CHECK (status IN ('REGISTERED','CONFIRMED','PARTICIPATED','COMPLETED','CANCELLED')),
    feedback TEXT,
    rating DECIMAL(2,1),
    certificate_url VARCHAR(500),
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    UNIQUE (program_id, user_id)
);

CREATE INDEX idx_collaboration_registrations_program ON collaboration_registrations (program_id);
CREATE INDEX idx_collaboration_registrations_user ON collaboration_registrations (user_id);

CREATE TABLE student_portfolio_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL CHECK (item_type IN ('CERTIFICATION','PROJECT','ACHIEVEMENT','COLLABORATION','INTERNSHIP','RESEARCH','MENTORSHIP','WORKSHOP')),
    title VARCHAR(300) NOT NULL,
    description TEXT,
    organization VARCHAR(200),
    issued_date DATE,
    credential_url VARCHAR(500),
    verified BOOLEAN NOT NULL DEFAULT false,
    verified_by UUID REFERENCES users(id),
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_student_portfolio_items_student ON student_portfolio_items (student_id);
CREATE INDEX idx_student_portfolio_items_type ON student_portfolio_items (item_type);
