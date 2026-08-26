CREATE TABLE assessment_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES company_opportunities(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    max_warnings_before_flag INTEGER NOT NULL DEFAULT 3,
    max_warnings_before_terminate INTEGER NOT NULL DEFAULT 5,
    critical_violation_terminate BOOLEAN NOT NULL DEFAULT true,
    allow_camera_toggle BOOLEAN NOT NULL DEFAULT false,
    allow_fullscreen_exit BOOLEAN NOT NULL DEFAULT false,
    max_fullscreen_exits INTEGER NOT NULL DEFAULT 3,
    max_session_interruptions INTEGER NOT NULL DEFAULT 2,
    time_extension_allowed BOOLEAN NOT NULL DEFAULT false,
    auto_submit_on_expire BOOLEAN NOT NULL DEFAULT true,
    record_screen BOOLEAN NOT NULL DEFAULT true,
    record_camera BOOLEAN NOT NULL DEFAULT true,
    record_audio BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assessment_policies_company ON assessment_policies (company_user_id);

CREATE TABLE assessment_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES recruitment_applications(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    opportunity_id UUID NOT NULL REFERENCES company_opportunities(id),
    policy_id UUID REFERENCES assessment_policies(id),
    session_token VARCHAR(256) NOT NULL UNIQUE,
    launch_token VARCHAR(256),
    launch_token_used BOOLEAN NOT NULL DEFAULT false,
    status VARCHAR(30) NOT NULL DEFAULT 'CREATED' CHECK (status IN ('CREATED','LAUNCHED','VERIFYING','SYSTEM_CHECK','IN_PROGRESS','SUBMITTED','COMPLETED','EXPIRED','TERMINATED')),
    device_fingerprint VARCHAR(512),
    device_info JSONB,
    ip_address VARCHAR(45),
    total_questions INTEGER NOT NULL DEFAULT 0,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    started_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    last_heartbeat_at TIMESTAMPTZ,
    last_autosave_at TIMESTAMPTZ,
    connection_lost_count INTEGER NOT NULL DEFAULT 0,
    fullscreen_exit_count INTEGER NOT NULL DEFAULT 0,
    window_focus_lost_count INTEGER NOT NULL DEFAULT 0,
    warning_count INTEGER NOT NULL DEFAULT 0,
    critical_event_count INTEGER NOT NULL DEFAULT 0,
    score DECIMAL(8,2),
    accuracy DECIMAL(5,2),
    questions_attempted INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    time_used_seconds INTEGER DEFAULT 0,
    skill_performance JSONB,
    topic_performance JSONB,
    proctoring_summary JSONB,
    integrity_status VARCHAR(30) DEFAULT 'CLEAN' CHECK (integrity_status IN ('CLEAN','WARNING','FLAGGED','REVIEW_REQUIRED','COMPROMISED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (application_id)
);

CREATE INDEX idx_assessment_sessions_student ON assessment_sessions (student_id);
CREATE INDEX idx_assessment_sessions_opportunity ON assessment_sessions (opportunity_id);
CREATE INDEX idx_assessment_sessions_token ON assessment_sessions (session_token);
CREATE INDEX idx_assessment_sessions_launch_token ON assessment_sessions (launch_token);
CREATE INDEX idx_assessment_sessions_status ON assessment_sessions (status);

CREATE TABLE assessment_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id),
    selected_option_id UUID,
    answer_text TEXT,
    code_answer TEXT,
    time_spent_seconds INTEGER DEFAULT 0,
    is_correct BOOLEAN,
    marks_awarded DECIMAL(8,2) DEFAULT 0,
    marked_for_review BOOLEAN NOT NULL DEFAULT false,
    answered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (session_id, question_id)
);

CREATE INDEX idx_assessment_answers_session ON assessment_answers (session_id);

CREATE TABLE assessment_question_order (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id),
    sort_order INTEGER NOT NULL,
    UNIQUE (session_id, question_id)
);

CREATE INDEX idx_assessment_question_order_session ON assessment_question_order (session_id);

CREATE TABLE proctoring_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('INFO','WARNING','CRITICAL')),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    metadata JSONB,
    confidence DECIMAL(3,2),
    screenshot_url VARCHAR(500),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_proctoring_events_session ON proctoring_events (session_id);
CREATE INDEX idx_proctoring_events_severity ON proctoring_events (severity);
CREATE INDEX idx_proctoring_events_type ON proctoring_events (event_type);
CREATE INDEX idx_proctoring_events_timestamp ON proctoring_events (timestamp DESC);

CREATE TABLE audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES assessment_sessions(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL,
    action VARCHAR(200) NOT NULL,
    details JSONB,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_events_session ON audit_events (session_id);
CREATE INDEX idx_audit_events_user ON audit_events (user_id);
CREATE INDEX idx_audit_events_type ON audit_events (event_type);
CREATE INDEX idx_audit_events_created ON audit_events (created_at DESC);

CREATE TABLE identity_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','VERIFIED','FAILED','SKIPPED')),
    camera_capture_url VARCHAR(500),
    face_detected BOOLEAN,
    face_count INTEGER DEFAULT 0,
    liveness_score DECIMAL(3,2),
    verification_method VARCHAR(30) DEFAULT 'FACE_MATCH',
    verified_at TIMESTAMPTZ,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_identity_verifications_session ON identity_verifications (session_id);

CREATE TABLE system_check_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    check_type VARCHAR(30) NOT NULL CHECK (check_type IN ('CAMERA','MICROPHONE','SCREEN_CAPTURE','INTERNET','DISPLAY','AUDIO','OS','BROWSER')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('PASS','FAIL','WARNING')),
    details JSONB,
    checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_system_check_results_session ON system_check_results (session_id);
