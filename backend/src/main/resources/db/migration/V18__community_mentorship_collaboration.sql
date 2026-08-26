-- Phase 121-130: Community, Mentorship, Institution & Industry Collaboration

-- Phase 121: Enhanced Community Posts
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS post_type VARCHAR(50) DEFAULT 'DISCUSSION';
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS tags TEXT;
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS edit_count INTEGER DEFAULT 0;
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMPTZ;

-- Phase 122: Social Graph (Following)
CREATE TABLE IF NOT EXISTS user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    follow_type VARCHAR(50) NOT NULL DEFAULT 'STUDENT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);
CREATE INDEX idx_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_follows_following ON user_follows(following_id);

CREATE TABLE IF NOT EXISTS topic_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, skill_id)
);

-- Phase 125: Mentorship System
CREATE TABLE IF NOT EXISTS mentor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    company_name VARCHAR(255),
    job_title VARCHAR(255),
    experience_years INTEGER DEFAULT 0,
    bio TEXT,
    expertise_skills TEXT,
    topics TEXT,
    availability VARCHAR(50) DEFAULT 'AVAILABLE',
    max_mentees INTEGER DEFAULT 5,
    current_mentees INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mentorship_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mentor_id UUID NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,
    message TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'REQUESTED',
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    UNIQUE(student_id, mentor_id)
);
CREATE INDEX idx_mentorship_student ON mentorship_requests(student_id);
CREATE INDEX idx_mentorship_mentor ON mentorship_requests(mentor_id);

CREATE TABLE IF NOT EXISTS mentorship_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES mentorship_requests(id) ON DELETE CASCADE,
    topic VARCHAR(255),
    scheduled_at TIMESTAMPTZ,
    duration_minutes INTEGER DEFAULT 30,
    meeting_link VARCHAR(500),
    notes TEXT,
    status VARCHAR(50) DEFAULT 'SCHEDULED',
    student_rating INTEGER,
    mentor_feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Phase 126: Events & Workshops
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organizer_type VARCHAR(50) NOT NULL DEFAULT 'INSTITUTION',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(100) NOT NULL,
    speaker_name VARCHAR(255),
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    capacity INTEGER,
    registered_count INTEGER DEFAULT 0,
    is_online BOOLEAN DEFAULT TRUE,
    location VARCHAR(500),
    meeting_link VARCHAR(500),
    eligibility_skills TEXT,
    coin_reward INTEGER DEFAULT 0,
    xp_reward INTEGER DEFAULT 0,
    certificate_provided BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_date ON events(event_date);

CREATE TABLE IF NOT EXISTS event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'REGISTERED',
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    attended_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    UNIQUE(event_id, student_id)
);

-- Phase 127: Industry Challenges & Hackathons
CREATE TABLE IF NOT EXISTS industry_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organizer_type VARCHAR(50) NOT NULL DEFAULT 'COMPANY',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    problem_statement TEXT,
    required_skills TEXT,
    difficulty VARCHAR(50) DEFAULT 'MEDIUM',
    rules TEXT,
    deadline TIMESTAMPTZ,
    min_team_size INTEGER DEFAULT 1,
    max_team_size INTEGER DEFAULT 1,
    coin_reward INTEGER DEFAULT 0,
    xp_reward INTEGER DEFAULT 0,
    badge_name VARCHAR(255),
    certificate_provided BOOLEAN DEFAULT FALSE,
    opportunity_id UUID,
    status VARCHAR(50) DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS challenge_participations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES industry_challenges(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_name VARCHAR(255),
    team_members TEXT,
    submission_url VARCHAR(500),
    submission_docs TEXT,
    submission_demo VARCHAR(500),
    submission_presentation VARCHAR(500),
    technical_score INTEGER,
    innovation_score INTEGER,
    problem_solving_score INTEGER,
    design_score INTEGER,
    documentation_score INTEGER,
    total_score INTEGER,
    rank_position INTEGER,
    status VARCHAR(50) DEFAULT 'PARTICIPATING',
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    evaluated_at TIMESTAMPTZ,
    UNIQUE(challenge_id, student_id)
);

-- Phase 128: Live Industry Projects
CREATE TABLE IF NOT EXISTS industry_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    required_skills TEXT,
    difficulty VARCHAR(50) DEFAULT 'MEDIUM',
    duration_weeks INTEGER DEFAULT 4,
    max_participants INTEGER DEFAULT 10,
    current_participants INTEGER DEFAULT 0,
    mentor_id UUID REFERENCES users(id),
    coin_reward INTEGER DEFAULT 0,
    xp_reward INTEGER DEFAULT 0,
    certificate_provided BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES industry_projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    due_days INTEGER,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES industry_projects(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cover_letter TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    selected_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    UNIQUE(project_id, student_id)
);

CREATE TABLE IF NOT EXISTS project_task_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES industry_projects(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES project_milestones(id),
    task_description TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    submission_url VARCHAR(500),
    feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Phase 129: Research & Consultancy
CREATE TABLE IF NOT EXISTS research_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    proposer_type VARCHAR(50) NOT NULL DEFAULT 'INSTITUTION',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    domain VARCHAR(255),
    required_skills TEXT,
    expected_outcome TEXT,
    duration_weeks INTEGER,
    budget_amount DECIMAL(12,2),
    max_participants INTEGER DEFAULT 5,
    documents TEXT,
    status VARCHAR(50) DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS research_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID NOT NULL REFERENCES research_proposals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'RESEARCHER',
    status VARCHAR(50) DEFAULT 'PENDING',
    joined_at TIMESTAMPTZ,
    UNIQUE(proposal_id, user_id)
);

-- Phase 130: Ecosystem Dashboard (analytics table)
CREATE TABLE IF NOT EXISTS ecosystem_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_type VARCHAR(100) NOT NULL,
    metric_value BIGINT DEFAULT 0,
    dimension VARCHAR(255),
    recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(metric_type, dimension, recorded_date)
);
CREATE INDEX idx_ecosystem_date ON ecosystem_metrics(recorded_date);
