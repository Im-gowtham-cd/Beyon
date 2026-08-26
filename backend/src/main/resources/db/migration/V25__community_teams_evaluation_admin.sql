-- V25: Community Teams, Project Evaluation, Admin Dashboard & Reporting (Phase 191-220)

-- 1. Project Teams (Phase 201)
CREATE TABLE IF NOT EXISTS project_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    leader_id UUID NOT NULL,
    max_members INTEGER NOT NULL DEFAULT 4,
    current_members INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(30) NOT NULL DEFAULT 'FORMING',
    looking_for TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS pt_project ON project_teams(project_id);
CREATE INDEX IF NOT EXISTS pt_leader ON project_teams(leader_id);

CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES project_teams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    role VARCHAR(100),
    skills_brought TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(team_id, student_id)
);
CREATE INDEX IF NOT EXISTS tm_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS tm_student ON team_members(student_id);

-- 2. Project Evaluations (Phase 202)
CREATE TABLE IF NOT EXISTS project_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    team_id UUID,
    evaluator_id UUID NOT NULL,
    evaluator_type VARCHAR(50) NOT NULL,
    technical_quality INTEGER DEFAULT 0,
    innovation INTEGER DEFAULT 0,
    code_quality INTEGER DEFAULT 0,
    documentation INTEGER DEFAULT 0,
    presentation INTEGER DEFAULT 0,
    problem_solving INTEGER DEFAULT 0,
    teamwork INTEGER DEFAULT 0,
    overall_score NUMERIC(5,2) DEFAULT 0,
    strengths TEXT,
    improvements TEXT,
    feedback TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS pe_project ON project_evaluations(project_id);
CREATE INDEX IF NOT EXISTS pe_team ON project_evaluations(team_id);

-- 3. Admin Dashboard Stats (Phase 209)
CREATE TABLE IF NOT EXISTS platform_daily_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stat_date DATE NOT NULL UNIQUE,
    total_users INTEGER NOT NULL DEFAULT 0,
    new_registrations INTEGER NOT NULL DEFAULT 0,
    active_users INTEGER NOT NULL DEFAULT 0,
    total_assessments INTEGER NOT NULL DEFAULT 0,
    total_applications INTEGER NOT NULL DEFAULT 0,
    total_placements INTEGER NOT NULL DEFAULT 0,
    total_coins_earned NUMERIC(15,2) DEFAULT 0,
    total_coins_spent NUMERIC(15,2) DEFAULT 0,
    active_companies INTEGER NOT NULL DEFAULT 0,
    active_institutions INTEGER NOT NULL DEFAULT 0,
    new_posts INTEGER NOT NULL DEFAULT 0,
    new_feedback_reports INTEGER NOT NULL DEFAULT 0,
    resolved_feedback_reports INTEGER NOT NULL DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 4. Platform Reports (Phase 215)
CREATE TABLE IF NOT EXISTS platform_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    title VARCHAR(300) NOT NULL,
    parameters JSONB NOT NULL DEFAULT '{}',
    file_url VARCHAR(500),
    generation_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    format VARCHAR(10) NOT NULL DEFAULT 'PDF',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX IF NOT EXISTS pr_user ON platform_reports(user_id);
CREATE INDEX IF NOT EXISTS pr_type ON platform_reports(report_type);
