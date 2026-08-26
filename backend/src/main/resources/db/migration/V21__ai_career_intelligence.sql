-- V21: AI Career Intelligence, Skill Graph, Personalized Challenges, Adaptive Learning (Phase 151-160)

-- 1. Unified Skill Taxonomy (Phase 151)
CREATE TABLE IF NOT EXISTS skill_taxonomy_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES skill_taxonomy_nodes(id),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    level VARCHAR(20) NOT NULL DEFAULT 'CATEGORY',
    sort_order INTEGER NOT NULL DEFAULT 0,
    icon VARCHAR(50),
    industry_demand VARCHAR(20) DEFAULT 'MEDIUM',
    avg_salary_range VARCHAR(100),
    growth_outlook VARCHAR(100),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tax_parent ON skill_taxonomy_nodes(parent_id);
CREATE INDEX IF NOT EXISTS idx_tax_slug ON skill_taxonomy_nodes(slug);
CREATE INDEX IF NOT EXISTS idx_tax_active ON skill_taxonomy_nodes(active);

-- Link existing skills to taxonomy
CREATE TABLE IF NOT EXISTS skill_taxonomy_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id UUID NOT NULL,
    taxonomy_node_id UUID NOT NULL REFERENCES skill_taxonomy_nodes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(skill_id, taxonomy_node_id)
);
CREATE INDEX IF NOT EXISTS idx_tax_link_skill ON skill_taxonomy_links(skill_id);
CREATE INDEX IF NOT EXISTS idx_tax_link_node ON skill_taxonomy_links(taxonomy_node_id);

-- Prerequisites between taxonomy nodes
CREATE TABLE IF NOT EXISTS skill_prerequisites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_node_id UUID NOT NULL REFERENCES skill_taxonomy_nodes(id) ON DELETE CASCADE,
    prerequisite_node_id UUID NOT NULL REFERENCES skill_taxonomy_nodes(id) ON DELETE CASCADE,
    required_level VARCHAR(20) DEFAULT 'INTERMEDIATE',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(skill_node_id, prerequisite_node_id)
);

-- 2. Student Skill Graph (Phase 152)
CREATE TABLE IF NOT EXISTS student_skill_graph (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    skill_id UUID NOT NULL,
    proficiency_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
    level VARCHAR(30) NOT NULL DEFAULT 'BEGINNER',
    confidence NUMERIC(5,2) NOT NULL DEFAULT 0,
    evidence_count INTEGER NOT NULL DEFAULT 0,
    sources JSONB NOT NULL DEFAULT '[]',
    improvement_trend VARCHAR(20) NOT NULL DEFAULT 'STABLE',
    last_assessed_at TIMESTAMP WITH TIME ZONE,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, skill_id)
);
CREATE INDEX IF NOT EXISTS idx_ssg_student ON student_skill_graph(student_id);
CREATE INDEX IF NOT EXISTS idx_ssg_skill ON student_skill_graph(skill_id);
CREATE INDEX IF NOT EXISTS idx_ssg_level ON student_skill_graph(level);

-- 3. Personalized Daily Challenge Engine (Phase 155)
CREATE TABLE IF NOT EXISTS personalized_challenge_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL UNIQUE,
    target_career_path_id UUID,
    difficulty_weight NUMERIC(3,2) NOT NULL DEFAULT 0.3,
    gap_weight NUMERIC(3,2) NOT NULL DEFAULT 0.4,
    streak_weight NUMERIC(3,2) NOT NULL DEFAULT 0.15,
    variety_weight NUMERIC(3,2) NOT NULL DEFAULT 0.15,
    preferred_topics JSONB NOT NULL DEFAULT '[]',
    avoid_topics JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS challenge_selection_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    question_id UUID NOT NULL,
    skill_id UUID,
    selection_reason VARCHAR(100),
    difficulty_score NUMERIC(5,2),
    gap_score NUMERIC(5,2),
    streak_relevance NUMERIC(3,2),
    selected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_csl_student ON challenge_selection_log(student_id);
CREATE INDEX IF NOT EXISTS idx_csl_skill ON challenge_selection_log(skill_id);

-- 4. Adaptive Learning Path (Phase 156)
CREATE TABLE IF NOT EXISTS adaptive_learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    career_path_id UUID NOT NULL,
    current_step_index INTEGER NOT NULL DEFAULT 0,
    overall_progress NUMERIC(5,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_alp_student ON adaptive_learning_paths(student_id);

CREATE TABLE IF NOT EXISTS adaptive_learning_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path_id UUID NOT NULL REFERENCES adaptive_learning_paths(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    skill_id UUID,
    skill_name VARCHAR(200) NOT NULL,
    concept VARCHAR(500),
    prerequisites JSONB NOT NULL DEFAULT '[]',
    learning_resources JSONB NOT NULL DEFAULT '[]',
    practice_question_ids JSONB NOT NULL DEFAULT '[]',
    assessment_id UUID,
    project_suggestion TEXT,
    state VARCHAR(20) NOT NULL DEFAULT 'LOCKED',
    progress NUMERIC(5,2) NOT NULL DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_als_path ON adaptive_learning_steps(path_id);

-- 5. AI Career Advisor Chat (Phase 157)
CREATE TABLE IF NOT EXISTS advisor_chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    title VARCHAR(300) DEFAULT 'Career Advice',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    context_snapshot JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_acs_student ON advisor_chat_sessions(student_id);

CREATE TABLE IF NOT EXISTS advisor_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES advisor_chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(10) NOT NULL,
    content TEXT NOT NULL,
    data_references JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_acm_session ON advisor_chat_messages(session_id);

-- 6. AI Portfolio Intelligence (Phase 158)
CREATE TABLE IF NOT EXISTS portfolio_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    overall_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    completeness NUMERIC(5,2) NOT NULL DEFAULT 0,
    skill_coverage NUMERIC(5,2) NOT NULL DEFAULT 0,
    project_strength NUMERIC(5,2) NOT NULL DEFAULT 0,
    certification_strength NUMERIC(5,2) NOT NULL DEFAULT 0,
    recommendations JSONB NOT NULL DEFAULT '[]',
    missing_items JSONB NOT NULL DEFAULT '[]',
    analyzed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pa_student ON portfolio_analysis(student_id);

-- 7. Opportunity Match Enhancement (Phase 159)
CREATE TABLE IF NOT EXISTS opportunity_match_detail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    opportunity_id UUID NOT NULL,
    overall_match NUMERIC(5,2) NOT NULL DEFAULT 0,
    skill_match NUMERIC(5,2) NOT NULL DEFAULT 0,
    eligibility_met BOOLEAN NOT NULL DEFAULT FALSE,
    experience_met BOOLEAN NOT NULL DEFAULT FALSE,
    certification_met BOOLEAN NOT NULL DEFAULT FALSE,
    coin_requirement_met BOOLEAN NOT NULL DEFAULT FALSE,
    match_factors JSONB NOT NULL DEFAULT '[]',
    strength_items JSONB NOT NULL DEFAULT '[]',
    gap_items JSONB NOT NULL DEFAULT '[]',
    calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, opportunity_id)
);
CREATE INDEX IF NOT EXISTS idx_omd_student ON opportunity_match_detail(student_id);
CREATE INDEX IF NOT EXISTS idx_omd_opportunity ON opportunity_match_detail(opportunity_id);
