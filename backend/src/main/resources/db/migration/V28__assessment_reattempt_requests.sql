-- V28__assessment_reattempt_requests.sql
-- Assessment Reattempt Request Workflow: Candidate appeals & company approval system

CREATE TABLE IF NOT EXISTS assessment_reattempt_requests (
    id                  VARCHAR(36) NOT NULL PRIMARY KEY,
    student_id          VARCHAR(36) NOT NULL,
    opportunity_id      VARCHAR(36) NOT NULL,
    session_id          VARCHAR(36),
    company_id          VARCHAR(36),
    status              VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    termination_reason  TEXT,
    student_reason      TEXT NOT NULL,
    review_notes        TEXT,
    reviewed_by         VARCHAR(36),
    created_at          DATETIME(6) NOT NULL DEFAULT NOW(6),
    reviewed_at         DATETIME(6),
    INDEX idx_arr_student (student_id),
    INDEX idx_arr_opportunity (opportunity_id),
    INDEX idx_arr_company (company_id),
    INDEX idx_arr_status (status)
);
