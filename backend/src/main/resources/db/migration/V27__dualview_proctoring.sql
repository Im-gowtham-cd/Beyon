-- V27__dualview_proctoring.sql
-- DualView AI Proctoring: New tables for dual-camera proctoring system

-- 1. Proctoring sessions (linked 1:1 to assessment_sessions)
CREATE TABLE IF NOT EXISTS proctoring_sessions (
    id                  VARCHAR(36) NOT NULL PRIMARY KEY,
    assessment_session_id VARCHAR(36) NOT NULL UNIQUE,
    candidate_id        VARCHAR(36) NOT NULL,
    opportunity_id      VARCHAR(36),
    status              VARCHAR(30) NOT NULL DEFAULT 'INITIALIZING',
    -- INITIALIZING | SETUP | PAIRING | CALIBRATING | ACTIVE | COMPLETED | ABORTED
    mobile_paired       TINYINT(1) NOT NULL DEFAULT 0,
    mobile_device_id    VARCHAR(36),
    laptop_camera_health VARCHAR(20) NOT NULL DEFAULT 'UNKNOWN',
    mobile_camera_health VARCHAR(20) NOT NULL DEFAULT 'UNKNOWN',
    laptop_mic_health   VARCHAR(20) NOT NULL DEFAULT 'UNKNOWN',
    mobile_mic_health   VARCHAR(20) NOT NULL DEFAULT 'UNKNOWN',
    risk_score          INT NOT NULL DEFAULT 0,
    risk_level          VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    -- NORMAL | LOW_CONCERN | SUSPICIOUS | HIGH_RISK | CRITICAL
    review_required     TINYINT(1) NOT NULL DEFAULT 0,
    reviewer_decision   VARCHAR(30),
    -- NULL | APPROVED | REVIEW_REQUIRED | VIOLATION_CONFIRMED | DISMISSED
    reviewer_id         VARCHAR(36),
    reviewed_at         DATETIME(6),
    review_notes        TEXT,
    consent_given       TINYINT(1) NOT NULL DEFAULT 0,
    consent_at          DATETIME(6),
    started_at          DATETIME(6),
    completed_at        DATETIME(6),
    created_at          DATETIME(6) NOT NULL DEFAULT NOW(6),
    updated_at          DATETIME(6) NOT NULL DEFAULT NOW(6),
    INDEX idx_ps_candidate (candidate_id),
    INDEX idx_ps_session (assessment_session_id),
    INDEX idx_ps_risk_level (risk_level),
    INDEX idx_ps_review (review_required)
);

-- 2. Proctoring devices (laptop + mobile per session)
CREATE TABLE IF NOT EXISTS proctoring_devices (
    id                        VARCHAR(36) NOT NULL PRIMARY KEY,
    proctoring_session_id     VARCHAR(36) NOT NULL,
    device_type               VARCHAR(20) NOT NULL,        -- LAPTOP | MOBILE
    pairing_token             VARCHAR(256),
    pairing_token_expires_at  DATETIME(6),
    pairing_token_used        TINYINT(1) NOT NULL DEFAULT 0,
    device_fingerprint        VARCHAR(512),
    user_agent                VARCHAR(512),
    connected_at              DATETIME(6),
    disconnected_at           DATETIME(6),
    reconnect_count           INT NOT NULL DEFAULT 0,
    camera_active             TINYINT(1) NOT NULL DEFAULT 0,
    mic_active                TINYINT(1) NOT NULL DEFAULT 0,
    last_heartbeat_at         DATETIME(6),
    created_at                DATETIME(6) NOT NULL DEFAULT NOW(6),
    INDEX idx_pd_session (proctoring_session_id),
    INDEX idx_pd_token (pairing_token)
);

-- 3. Proctoring incidents (multi-signal correlated only)
CREATE TABLE IF NOT EXISTS proctoring_incidents (
    id                    VARCHAR(36) NOT NULL PRIMARY KEY,
    proctoring_session_id VARCHAR(36) NOT NULL,
    incident_type         VARCHAR(60) NOT NULL,
    -- POSSIBLE_EXTERNAL_ASSISTANCE | POSSIBLE_QUESTION_CAPTURE |
    -- POSSIBLE_DEVICE_ASSISTANCE | MULTIPLE_PERSONS_DETECTED |
    -- CAMERA_TAMPERING | AUDIO_CONVERSATION | SUSTAINED_GAZE_DEVIATION |
    -- PHONE_DETECTED | CAMERA_UNAVAILABLE | MOBILE_DISCONNECTED
    severity              VARCHAR(20) NOT NULL,            -- LOW | MEDIUM | HIGH | CRITICAL
    confidence            DECIMAL(4,3) NOT NULL DEFAULT 0.000,
    risk_contribution     INT NOT NULL DEFAULT 0,
    question_id           VARCHAR(36),
    sources               VARCHAR(200),                   -- CSV: LAPTOP_CAMERA,MOBILE_CAMERA,...
    signal_count          INT NOT NULL DEFAULT 1,
    started_at            DATETIME(6) NOT NULL,
    ended_at              DATETIME(6),
    reviewer_action       VARCHAR(30),
    -- NULL | DISMISSED | VIOLATION_CONFIRMED | ACKNOWLEDGED
    reviewer_id           VARCHAR(36),
    reviewed_at           DATETIME(6),
    review_notes          TEXT,
    created_at            DATETIME(6) NOT NULL DEFAULT NOW(6),
    INDEX idx_pi_session (proctoring_session_id),
    INDEX idx_pi_type (incident_type),
    INDEX idx_pi_severity (severity),
    INDEX idx_pi_question (question_id)
);

-- 4. Proctoring evidence (frames/audio linked to incidents)
CREATE TABLE IF NOT EXISTS proctoring_evidence (
    id                VARCHAR(36) NOT NULL PRIMARY KEY,
    incident_id       VARCHAR(36) NOT NULL,
    evidence_type     VARCHAR(30) NOT NULL,               -- FRAME_CAPTURE | AUDIO_CLIP | EVENT_LOG
    device_source     VARCHAR(20) NOT NULL,               -- LAPTOP | MOBILE
    storage_path      VARCHAR(500),
    storage_url       VARCHAR(500),
    captured_at       DATETIME(6) NOT NULL,
    window_before_ms  INT NOT NULL DEFAULT 10000,
    window_after_ms   INT NOT NULL DEFAULT 10000,
    access_expires_at DATETIME(6),
    file_size_bytes   BIGINT,
    created_at        DATETIME(6) NOT NULL DEFAULT NOW(6),
    INDEX idx_pe_incident (incident_id),
    INDEX idx_pe_device (device_source)
);

-- 5. Risk score history (append-only for audit + decay)
CREATE TABLE IF NOT EXISTS proctoring_risk_scores (
    id                    VARCHAR(36) NOT NULL PRIMARY KEY,
    proctoring_session_id VARCHAR(36) NOT NULL,
    score                 INT NOT NULL DEFAULT 0,
    level                 VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    delta                 INT NOT NULL DEFAULT 0,
    contributing_event    VARCHAR(60),
    recorded_at           DATETIME(6) NOT NULL DEFAULT NOW(6),
    INDEX idx_prs_session (proctoring_session_id),
    INDEX idx_prs_recorded (recorded_at)
);

-- 6. Configurable proctoring policy per opportunity
CREATE TABLE IF NOT EXISTS proctoring_policy_config (
    id                      VARCHAR(36) NOT NULL PRIMARY KEY,
    opportunity_id          VARCHAR(36) UNIQUE,
    company_user_id         VARCHAR(36) NOT NULL,
    risk_weights            TEXT NOT NULL DEFAULT '{}',
    threshold_low_concern   INT NOT NULL DEFAULT 31,
    threshold_suspicious    INT NOT NULL DEFAULT 51,
    threshold_high_risk     INT NOT NULL DEFAULT 71,
    threshold_critical      INT NOT NULL DEFAULT 86,
    mobile_required         TINYINT(1) NOT NULL DEFAULT 1,
    mobile_grace_seconds    INT NOT NULL DEFAULT 30,
    evidence_window_seconds INT NOT NULL DEFAULT 10,
    auto_fail_enabled       TINYINT(1) NOT NULL DEFAULT 0,
    created_at              DATETIME(6) NOT NULL DEFAULT NOW(6),
    updated_at              DATETIME(6) NOT NULL DEFAULT NOW(6),
    INDEX idx_ppc_company (company_user_id),
    INDEX idx_ppc_opportunity (opportunity_id)
);
