CREATE TABLE institution_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_type VARCHAR(50) NOT NULL CHECK (role_type IN ('ADMIN','PLACEMENT_OFFICER','DEPARTMENT_COORDINATOR','FACULTY')),
    department VARCHAR(200),
    permissions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (institution_user_id, role_type)
);

CREATE INDEX idx_institution_roles_user ON institution_roles (institution_user_id);

CREATE TABLE institution_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    department VARCHAR(200),
    batch VARCHAR(20),
    admission_year INTEGER,
    graduation_year INTEGER,
    placement_status VARCHAR(30) NOT NULL DEFAULT 'UNPLACED' CHECK (placement_status IN ('UNPLACED','PLACEMENT_SEEKING','PLACED','GRADUATED')),
    verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (institution_id, student_id)
);

CREATE INDEX idx_institution_students_institution ON institution_students (institution_id);
CREATE INDEX idx_institution_students_student ON institution_students (student_id);
CREATE INDEX idx_institution_students_status ON institution_students (placement_status);

CREATE TABLE student_academic_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES users(id),
    semester INTEGER,
    academic_year VARCHAR(20),
    cgpa DECIMAL(4,2),
    total_credits INTEGER,
    department VARCHAR(200),
    graduation_year INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_student_academic_records_student ON student_academic_records (student_id);

CREATE TABLE placement_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES users(id),
    company_name VARCHAR(200) NOT NULL,
    company_tier VARCHAR(20) CHECK (company_tier IN ('TIER_1','TIER_2','TIER_3','OTHER')),
    role_title VARCHAR(200),
    package_lpa DECIMAL(8,2),
    placement_date DATE,
    placement_type VARCHAR(30) CHECK (placement_type IN ('FULL_TIME','INTERNSHIP','PPO')),
    status VARCHAR(30) NOT NULL DEFAULT 'OFFERED' CHECK (status IN ('OFFERED','ACCEPTED','REJECTED','JOINING')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_placement_records_student ON placement_records (student_id);
CREATE INDEX idx_placement_records_institution ON placement_records (institution_id);

CREATE TABLE institution_rating_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    overall_rating DECIMAL(3,2),
    academic_score DECIMAL(3,2),
    placement_score DECIMAL(3,2),
    salary_score DECIMAL(3,2),
    industry_score DECIMAL(3,2),
    skill_score DECIMAL(3,2),
    total_students INTEGER,
    students_placed INTEGER,
    placement_percentage DECIMAL(5,2),
    average_package DECIMAL(8,2),
    highest_package DECIMAL(8,2),
    tier1_count INTEGER DEFAULT 0,
    tier2_count INTEGER DEFAULT 0,
    companies_visited INTEGER DEFAULT 0,
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_institution_rating_institution ON institution_rating_snapshots (institution_id);
CREATE INDEX idx_institution_rating_date ON institution_rating_snapshots (snapshot_date DESC);

CREATE TABLE company_targeting_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES company_opportunities(id) ON DELETE CASCADE,
    target_institution_ids TEXT,
    target_min_rating DECIMAL(3,2),
    target_departments TEXT,
    target_batches TEXT,
    target_graduation_years TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_company_targeting_company ON company_targeting_rules (company_user_id);

CREATE TABLE placement_drives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES company_opportunities(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('DRAFT','PENDING','APPROVED','OPEN','ASSESSMENT','INTERVIEW','COMPLETED','CANCELLED')),
    eligible_student_count INTEGER DEFAULT 0,
    applied_count INTEGER DEFAULT 0,
    assessed_count INTEGER DEFAULT 0,
    shortlisted_count INTEGER DEFAULT 0,
    interviewed_count INTEGER DEFAULT 0,
    selected_count INTEGER DEFAULT 0,
    drive_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_placement_drives_institution ON placement_drives (institution_id);
CREATE INDEX idx_placement_drives_company ON placement_drives (company_user_id);
CREATE INDEX idx_placement_drives_status ON placement_drives (status);

CREATE TABLE follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    follow_type VARCHAR(30) NOT NULL CHECK (follow_type IN ('STUDENT_COMPANY','STUDENT_INSTITUTION','INSTITUTION_COMPANY','COMPANY_INSTITUTION','COMPANY_STUDENT')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (follower_id, following_id, follow_type)
);

CREATE INDEX idx_follows_follower ON follows (follower_id);
CREATE INDEX idx_follows_following ON follows (following_id);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    reference_type VARCHAR(50),
    reference_id UUID,
    is_read BOOLEAN NOT NULL DEFAULT false,
    channel VARCHAR(20) NOT NULL DEFAULT 'IN_APP' CHECK (channel IN ('IN_APP','EMAIL','PUSH','SMS')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications (user_id);
CREATE INDEX idx_notifications_unread ON notifications (user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created ON notifications (created_at DESC);

CREATE TABLE recruitment_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    opportunity_id UUID NOT NULL REFERENCES company_opportunities(id) ON DELETE CASCADE,
    drive_id UUID REFERENCES placement_drives(id),
    institution_id UUID REFERENCES users(id),
    status VARCHAR(30) NOT NULL DEFAULT 'ELIGIBLE' CHECK (status IN ('ELIGIBLE','APPLIED','ASSESSMENT_PENDING','ASSESSMENT_STARTED','ASSESSMENT_COMPLETED','SHORTLISTED','INTERVIEW','SELECTED','REJECTED','WITHDRAWN')),
    assessment_score DECIMAL(8,2),
    interview_score DECIMAL(8,2),
    notes TEXT,
    coins_spent INTEGER DEFAULT 0,
    applied_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (opportunity_id, student_id)
);

CREATE INDEX idx_recruitment_applications_student ON recruitment_applications (student_id);
CREATE INDEX idx_recruitment_applications_opportunity ON recruitment_applications (opportunity_id);
CREATE INDEX idx_recruitment_applications_drive ON recruitment_applications (drive_id);
CREATE INDEX idx_recruitment_applications_status ON recruitment_applications (status);

CREATE TABLE recruitment_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES recruitment_applications(id) ON DELETE CASCADE,
    from_status VARCHAR(30),
    to_status VARCHAR(30) NOT NULL,
    changed_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_recruitment_status_history_app ON recruitment_status_history (application_id);
