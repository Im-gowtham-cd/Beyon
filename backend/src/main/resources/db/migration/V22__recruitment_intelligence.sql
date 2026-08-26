-- V22: Recruitment Intelligence, Placement Automation & Company Hiring (Phase 161-170)

-- 1. Enhanced Recruitment Drives (Phase 161)
CREATE TABLE IF NOT EXISTS recruitment_drives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_user_id UUID NOT NULL,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    job_role VARCHAR(200) NOT NULL,
    required_skills TEXT,
    preferred_skills TEXT,
    min_cgpa NUMERIC(4,2),
    eligible_departments TEXT,
    eligible_graduation_years TEXT,
    salary_range VARCHAR(100),
    location VARCHAR(200),
    work_mode VARCHAR(30) DEFAULT 'ONSITE',
    application_deadline TIMESTAMP WITH TIME ZONE,
    assessment_id UUID,
    max_candidates INTEGER DEFAULT 0,
    coin_cost INTEGER DEFAULT 100,
    targeting_mode VARCHAR(30) DEFAULT 'PUBLIC',
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rd_company ON recruitment_drives(company_user_id);
CREATE INDEX IF NOT EXISTS idx_rd_status ON recruitment_drives(status);

-- 2. Institution Targeting (Phase 162)
CREATE TABLE IF NOT EXISTS drive_institution_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drive_id UUID NOT NULL REFERENCES recruitment_drives(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL,
    departments TEXT,
    min_graduation_year INTEGER,
    max_graduation_year INTEGER,
    min_cgpa NUMERIC(4,2),
    placement_willing_only BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(drive_id, institution_id)
);
CREATE INDEX IF NOT EXISTS idx_dit_drive ON drive_institution_targets(drive_id);

-- 3. Placement Registration (Phase 163)
CREATE TABLE IF NOT EXISTS placement_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL UNIQUE,
    institution_id UUID,
    placement_preference VARCHAR(20) NOT NULL DEFAULT 'UNDECIDED',
    preferred_roles TEXT,
    preferred_locations TEXT,
    preferred_work_mode VARCHAR(30),
    min_expected_package NUMERIC(12,2),
    registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pr_student ON placement_registrations(student_id);
CREATE INDEX IF NOT EXISTS idx_pr_institution ON placement_registrations(institution_id);
CREATE INDEX IF NOT EXISTS idx_pr_preference ON placement_registrations(placement_preference);

-- 4. Candidate Shortlist (Phase 168)
CREATE TABLE IF NOT EXISTS candidate_shortlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drive_id UUID NOT NULL REFERENCES recruitment_drives(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    pipeline_id UUID,
    overall_score NUMERIC(5,2),
    assessment_score NUMERIC(5,2),
    skill_match_score NUMERIC(5,2),
    rank_in_drive INTEGER,
    status VARCHAR(30) NOT NULL DEFAULT 'SHORTLISTED',
    shortlisted_by UUID,
    shortlisted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cs_drive ON candidate_shortlists(drive_id);
CREATE INDEX IF NOT EXISTS idx_cs_student ON candidate_shortlists(student_id);
CREATE INDEX IF NOT EXISTS idx_cs_rank ON candidate_shortlists(rank_in_drive);

-- 5. Enhanced Interview Scheduling (Phase 169)
CREATE TABLE IF NOT EXISTS recruitment_interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drive_id UUID NOT NULL REFERENCES recruitment_drives(id) ON DELETE CASCADE,
    pipeline_id UUID NOT NULL,
    student_id UUID NOT NULL,
    interviewer_id UUID,
    interview_type VARCHAR(50) NOT NULL,
    round_number INTEGER NOT NULL DEFAULT 1,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER DEFAULT 60,
    meeting_link VARCHAR(500),
    location VARCHAR(300),
    status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    feedback TEXT,
    score NUMERIC(5,2),
    recommendation VARCHAR(30),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ri_drive ON recruitment_interviews(drive_id);
CREATE INDEX IF NOT EXISTS idx_ri_student ON recruitment_interviews(student_id);
CREATE INDEX IF NOT EXISTS idx_ri_pipeline ON recruitment_interviews(pipeline_id);

-- 6. Placement Records (Phase 170)
CREATE TABLE IF NOT EXISTS placement_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    company_user_id UUID NOT NULL,
    institution_id UUID,
    drive_id UUID,
    pipeline_id UUID,
    job_role VARCHAR(200) NOT NULL,
    ctc_amount NUMERIC(12,2),
    ctc_currency VARCHAR(10) DEFAULT 'INR',
    company_tier VARCHAR(10),
    placement_type VARCHAR(30) DEFAULT 'FULL_TIME',
    placement_year INTEGER NOT NULL,
    joining_date DATE,
    offer_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(30) NOT NULL DEFAULT 'OFFERED',
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_by UUID,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pr2_student ON placement_records(student_id);
CREATE INDEX IF NOT EXISTS idx_pr2_company ON placement_records(company_user_id);
CREATE INDEX IF NOT EXISTS idx_pr2_institution ON placement_records(institution_id);
CREATE INDEX IF NOT EXISTS idx_pr2_year ON placement_records(placement_year);
CREATE INDEX IF NOT EXISTS idx_pr2_status ON placement_records(status);

-- 7. Institution Placement Analytics (Phase 170)
CREATE TABLE IF NOT EXISTS institution_placement_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL,
    academic_year INTEGER NOT NULL,
    total_students INTEGER NOT NULL DEFAULT 0,
    placement_willing INTEGER NOT NULL DEFAULT 0,
    eligible INTEGER NOT NULL DEFAULT 0,
    applied INTEGER NOT NULL DEFAULT 0,
    assessed INTEGER NOT NULL DEFAULT 0,
    shortlisted INTEGER NOT NULL DEFAULT 0,
    interviewed INTEGER NOT NULL DEFAULT 0,
    placed INTEGER NOT NULL DEFAULT 0,
    placement_rate NUMERIC(5,2) DEFAULT 0,
    average_package NUMERIC(12,2) DEFAULT 0,
    highest_package NUMERIC(12,2) DEFAULT 0,
    companies_visited INTEGER DEFAULT 0,
    department_stats JSONB DEFAULT '{}',
    skill_demand JSONB DEFAULT '{}',
    company_tier_distribution JSONB DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(institution_id, academic_year)
);
