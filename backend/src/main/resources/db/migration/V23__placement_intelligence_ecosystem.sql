-- V23: Placement Intelligence, Verification, Alumni & Career Outcomes (Phase 171-180)

-- 1. Placement Verification (Phase 171)
CREATE TABLE IF NOT EXISTS placement_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placement_record_id UUID NOT NULL,
    student_id UUID NOT NULL,
    company_user_id UUID NOT NULL,
    institution_id UUID,
    verification_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    verified_by UUID,
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_source VARCHAR(50),
    verification_document_url VARCHAR(500),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pv_student ON placement_verifications(student_id);
CREATE INDEX IF NOT EXISTS idx_pv_record ON placement_verifications(placement_record_id);

-- 2. Institution Rating (Phase 172)
CREATE TABLE IF NOT EXISTS institution_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL UNIQUE,
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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_user_id UUID NOT NULL UNIQUE,
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
CREATE INDEX IF NOT EXISTS idx_ct_tier ON company_tier_profiles(tier);

-- 4. Interview Feedback Intelligence (Phase 176)
CREATE TABLE IF NOT EXISTS interview_feedback_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID NOT NULL,
    student_id UUID NOT NULL,
    interviewer_id UUID NOT NULL,
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
    is_candidate_visible BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS iffi_student ON interview_feedback_intelligence(student_id);
CREATE INDEX IF NOT EXISTS iffi_interview ON interview_feedback_intelligence(interview_id);

-- 5. Career Outcomes (Phase 177)
CREATE TABLE IF NOT EXISTS career_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    outcome_type VARCHAR(30) NOT NULL,
    company_name VARCHAR(200),
    role VARCHAR(200),
    institution VARCHAR(200),
    description TEXT,
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN NOT NULL DEFAULT TRUE,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS co_student ON career_outcomes(student_id);
CREATE INDEX IF NOT EXISTS co_type ON career_outcomes(outcome_type);

-- 6. Alumni Network (Phase 178)
CREATE TABLE IF NOT EXISTS alumni_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    institution_id UUID,
    graduation_year INTEGER NOT NULL,
    current_company VARCHAR(200),
    current_role VARCHAR(200),
    industry VARCHAR(100),
    experience_years INTEGER DEFAULT 0,
    skills TEXT,
    achievements TEXT,
    bio TEXT,
    is_mentoring BOOLEAN NOT NULL DEFAULT FALSE,
    mentor_availability VARCHAR(30) DEFAULT 'UNAVAILABLE',
    public_profile BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ap_user ON alumni_profiles(user_id);
CREATE INDEX IF NOT EXISTS ap_institution ON alumni_profiles(institution_id);
CREATE INDEX IF NOT EXISTS ap_graduation ON alumni_profiles(graduation_year);

-- 7. Alumni Connections (mentorship requests, follows)
CREATE TABLE IF NOT EXISTS alumni_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alumni_id UUID NOT NULL REFERENCES alumni_profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    connection_type VARCHAR(30) NOT NULL DEFAULT 'FOLLOW',
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(alumni_id, student_id, connection_type)
);
CREATE INDEX IF NOT EXISTS ac_alumni ON alumni_connections(alumni_id);
CREATE INDEX IF NOT EXISTS ac_student ON alumni_connections(student_id);

-- 8. Referral System (Phase 179)
CREATE TABLE IF NOT EXISTS opportunity_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL,
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
CREATE INDEX IF NOT EXISTS or_referrer ON opportunity_referrals(referrer_id);
CREATE INDEX IF NOT EXISTS or_status ON opportunity_referrals(status);

CREATE TABLE IF NOT EXISTS referral_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID NOT NULL REFERENCES opportunity_referrals(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    applied BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE(referral_id, student_id)
);

-- 9. Placement Readiness Score (Phase 175)
CREATE TABLE IF NOT EXISTS placement_readiness_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL UNIQUE,
    overall_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    skills_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    assessments_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    projects_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    certifications_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    interview_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    practice_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    recommendations JSONB NOT NULL DEFAULT '[]',
    calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS prs_student ON placement_readiness_scores(student_id);
