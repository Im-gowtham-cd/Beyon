CREATE TABLE student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20),
    country VARCHAR(100),
    state VARCHAR(100),
    city VARCHAR(100),
    institution VARCHAR(200),
    registration_number VARCHAR(50),
    degree VARCHAR(100),
    department VARCHAR(200),
    academic_year VARCHAR(30),
    cgpa DECIMAL(4,2),
    placement_preference VARCHAR(30) CHECK (placement_preference IN ('PLACEMENT_WILLING', 'PLACEMENT_NOT_WILLING')),
    preferred_job_roles TEXT,
    preferred_industries TEXT,
    preferred_work_type VARCHAR(20) CHECK (preferred_work_type IN ('ON_SITE', 'HYBRID', 'REMOTE', 'ANY')),
    about_me TEXT,
    resume_url VARCHAR(500),
    profile_photo_url VARCHAR(500),
    completion_pct INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_student_profiles_user_id ON student_profiles (user_id);
CREATE INDEX idx_student_profiles_institution ON student_profiles (institution);

CREATE TABLE student_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    proficiency VARCHAR(20) CHECK (proficiency IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_student_skills_user_id ON student_skills (user_id);

CREATE TABLE student_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    issuing_org VARCHAR(200),
    issue_date DATE,
    expiry_date DATE,
    credential_id VARCHAR(100),
    credential_url VARCHAR(500),
    certificate_url VARCHAR(500),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_VERIFICATION' CHECK (status IN ('PENDING_VERIFICATION', 'VERIFIED', 'REJECTED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_student_certs_user_id ON student_certifications (user_id);

CREATE TABLE student_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    role VARCHAR(100),
    technologies TEXT,
    github_url VARCHAR(500),
    live_url VARCHAR(500),
    image_url VARCHAR(500),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_student_projects_user_id ON student_projects (user_id);

CREATE TABLE student_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    url VARCHAR(500) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_student_links_user_id ON student_links (user_id);

CREATE TABLE institution_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    institution_name VARCHAR(200) NOT NULL,
    institution_type VARCHAR(50),
    institution_code VARCHAR(50),
    official_email VARCHAR(255),
    phone VARCHAR(20),
    website VARCHAR(500),
    country VARCHAR(100),
    state VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    postal_code VARCHAR(20),
    affiliated_university VARCHAR(200),
    accreditations TEXT,
    accreditation_grade VARCHAR(50),
    established_year INTEGER,
    placement_rate DECIMAL(5,2),
    average_package DECIMAL(12,2),
    highest_package DECIMAL(12,2),
    total_students INTEGER,
    placement_willing_count INTEGER,
    placement_not_willing_count INTEGER,
    verification_doc_url VARCHAR(500),
    logo_url VARCHAR(500),
    completion_pct INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_institution_profiles_user_id ON institution_profiles (user_id);

CREATE TABLE institution_placement_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    academic_year VARCHAR(20) NOT NULL,
    students_placed INTEGER,
    placement_percentage DECIMAL(5,2),
    average_package DECIMAL(12,2),
    highest_package DECIMAL(12,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inst_placement_history_user_id ON institution_placement_history (user_id);

CREATE TABLE institution_representatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    designation VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    department VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inst_representatives_user_id ON institution_representatives (user_id);

CREATE TABLE company_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(200) NOT NULL,
    logo_url VARCHAR(500),
    company_type VARCHAR(50),
    industry VARCHAR(100),
    website VARCHAR(500),
    official_email VARCHAR(255),
    phone VARCHAR(20),
    country VARCHAR(100),
    state VARCHAR(100),
    city VARCHAR(100),
    headquarters VARCHAR(200),
    company_size VARCHAR(30),
    founded_year INTEGER,
    about TEXT,
    linkedin VARCHAR(500),
    verification_doc_url VARCHAR(500),
    completion_pct INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_company_profiles_user_id ON company_profiles (user_id);

CREATE TABLE company_hiring_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hiring_types TEXT,
    preferred_levels TEXT,
    recruitment_regions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_company_hiring_prefs_user_id ON company_hiring_preferences (user_id);

CREATE TABLE company_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_company_skills_user_id ON company_skills (user_id);

CREATE TABLE company_representatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    designation VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_company_representatives_user_id ON company_representatives (user_id);
