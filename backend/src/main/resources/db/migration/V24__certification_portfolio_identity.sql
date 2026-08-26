-- V24: Certification, Verification, Portfolio & Professional Identity (Phase 181-190)

-- 1. Enhanced Certificates (Phase 181)
CREATE TABLE IF NOT EXISTS beyon_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    certificate_number VARCHAR(50) NOT NULL UNIQUE,
    certificate_type VARCHAR(50) NOT NULL,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    skill_name VARCHAR(200),
    program_id UUID,
    assessment_id UUID,
    challenge_id UUID,
    issuer_id UUID,
    issuer_name VARCHAR(200) NOT NULL,
    issuer_type VARCHAR(30) NOT NULL DEFAULT 'BEYON',
    score INTEGER,
    skills_covered TEXT,
    issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    verification_url VARCHAR(500),
    qr_data TEXT,
    verification_status VARCHAR(30) NOT NULL DEFAULT 'VERIFIED',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS bc_student ON beyon_certificates(student_id);
CREATE INDEX IF NOT EXISTS bc_number ON beyon_certificates(certificate_number);
CREATE INDEX IF NOT EXISTS bc_type ON beyon_certificates(certificate_type);

-- 2. Skill Endorsements (Phase 184)
CREATE TABLE IF NOT EXISTS skill_endorsements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    skill_id UUID NOT NULL,
    endorser_id UUID NOT NULL,
    endorser_name VARCHAR(200),
    endorser_type VARCHAR(50) NOT NULL,
    endorsement_level VARCHAR(30) NOT NULL DEFAULT 'ENDORSED',
    evidence_url VARCHAR(500),
    evidence_description TEXT,
    valid_until TIMESTAMP WITH TIME ZONE,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS se_student ON skill_endorsements(student_id);
CREATE INDEX IF NOT EXISTS se_skill ON skill_endorsements(skill_id);
CREATE INDEX IF NOT EXISTS se_endorser ON skill_endorsements(endorser_id);

-- 3. Professional Profile (Phase 185)
CREATE TABLE IF NOT EXISTS professional_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    headline VARCHAR(300),
    about TEXT,
    location VARCHAR(200),
    website_url VARCHAR(500),
    github_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    resume_url VARCHAR(500),
    visibility VARCHAR(30) NOT NULL DEFAULT 'PUBLIC',
    profile_views INTEGER NOT NULL DEFAULT 0,
    last_viewed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS pp_user ON professional_profiles(user_id);
CREATE INDEX IF NOT EXISTS pp_visibility ON professional_profiles(visibility);

-- 4. Portfolio Items Enhanced (Phase 186)
CREATE TABLE IF NOT EXISTS portfolio_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    role VARCHAR(200),
    skills_used TEXT,
    github_url VARCHAR(500),
    live_demo_url VARCHAR(500),
    image_url VARCHAR(500),
    verification_status VARCHAR(30) NOT NULL DEFAULT 'UNVERIFIED',
    verified_by UUID,
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_source VARCHAR(50),
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS pp2_student ON portfolio_projects(student_id);
CREATE INDEX IF NOT EXISTS pp2_featured ON portfolio_projects(is_featured);

-- 5. Portfolio Verification (Phase 187)
CREATE TABLE IF NOT EXISTS portfolio_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES portfolio_projects(id) ON DELETE CASCADE,
    verifier_id UUID NOT NULL,
    verifier_type VARCHAR(50) NOT NULL,
    verification_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    evidence_url VARCHAR(500),
    evidence_description TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS pv_project ON portfolio_verifications(project_id);

-- 6. Resume Templates (Phase 189)
CREATE TABLE IF NOT EXISTS resume_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    template_data JSONB NOT NULL DEFAULT '{}',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 7. Generated Resumes (Phase 189)
CREATE TABLE IF NOT EXISTS generated_resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    template_id UUID,
    title VARCHAR(300),
    sections JSONB NOT NULL DEFAULT '[]',
    file_url VARCHAR(500),
    generation_status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    ai_suggestions JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS gr_student ON generated_resumes(student_id);
