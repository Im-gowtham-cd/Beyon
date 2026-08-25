-- V14: Production Feedback & Stabilization System

-- Enhanced feedback reports table
CREATE TABLE IF NOT EXISTS feedback_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_number SERIAL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_role VARCHAR(30) NOT NULL,
    report_type VARCHAR(30) NOT NULL,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    user_priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    system_severity VARCHAR(10) NOT NULL DEFAULT 'S2',
    status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    assigned_to UUID REFERENCES users(id),
    application_version VARCHAR(20),
    page VARCHAR(500),
    browser_info VARCHAR(200),
    os_info VARCHAR(200),
    screen_size VARCHAR(30),
    request_id VARCHAR(100),
    desktop_app_version VARCHAR(20),
    assessment_session_id UUID,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_feedback_reports_user ON feedback_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_reports_status ON feedback_reports(status);
CREATE INDEX IF NOT EXISTS idx_feedback_reports_category ON feedback_reports(category);
CREATE INDEX IF NOT EXISTS idx_feedback_reports_severity ON feedback_reports(system_severity);
CREATE INDEX IF NOT EXISTS idx_feedback_reports_role ON feedback_reports(user_role);
CREATE INDEX IF NOT EXISTS idx_feedback_reports_created ON feedback_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_reports_number ON feedback_reports(report_number);

-- Feedback attachments
CREATE TABLE IF NOT EXISTS feedback_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES feedback_reports(id) ON DELETE CASCADE,
    file_name VARCHAR(300) NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT NOT NULL DEFAULT 0,
    storage_path VARCHAR(500) NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_feedback_attachments_report ON feedback_attachments(report_id);

-- Feedback status history (never overwrite)
CREATE TABLE IF NOT EXISTS feedback_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES feedback_reports(id) ON DELETE CASCADE,
    old_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    changed_by UUID NOT NULL REFERENCES users(id),
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_feedback_status_history_report ON feedback_status_history(report_id);

-- Feedback internal notes (admin only)
CREATE TABLE IF NOT EXISTS feedback_internal_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES feedback_reports(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_feedback_internal_notes_report ON feedback_internal_notes(report_id);

-- Feedback user comments (add info to own report)
CREATE TABLE IF NOT EXISTS feedback_user_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES feedback_reports(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_feedback_user_comments_report ON feedback_user_comments(report_id);

-- Report links (duplicate/related)
CREATE TABLE IF NOT EXISTS feedback_report_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_report_id UUID NOT NULL REFERENCES feedback_reports(id) ON DELETE CASCADE,
    target_report_id UUID NOT NULL REFERENCES feedback_reports(id) ON DELETE CASCADE,
    link_type VARCHAR(30) NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Drop old user_feedback table if it exists
DROP TABLE IF EXISTS user_feedback;
