-- Phase 131-140: Platform Trust, Security, Governance & Production Hardening

-- Phase 131: Centralized Permissions
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role VARCHAR(50) NOT NULL,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE(role, permission_id)
);
CREATE INDEX idx_role_permissions_role ON role_permissions(role);

-- Phase 132: Session Management
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    refresh_token_hash VARCHAR(255),
    device_info VARCHAR(500),
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(token_hash);
CREATE INDEX idx_sessions_active ON user_sessions(is_active);

-- Phase 133: MFA
CREATE TABLE IF NOT EXISTS user_mfa_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_method VARCHAR(50),
    totp_secret VARCHAR(255),
    backup_codes TEXT,
    email_otp_enabled BOOLEAN DEFAULT FALSE,
    last_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mfa_verification_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(10) NOT NULL,
    purpose VARCHAR(50) NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_mfa_codes_user ON mfa_verification_codes(user_id, purpose);

-- Phase 134: Enhanced Audit Log (extend existing security_audit_log)
ALTER TABLE security_audit_log ADD COLUMN IF NOT EXISTS previous_state TEXT;
ALTER TABLE security_audit_log ADD COLUMN IF NOT EXISTS new_state TEXT;
ALTER TABLE security_audit_log ADD COLUMN IF NOT EXISTS resource_owner_id UUID;
ALTER TABLE security_audit_log ADD COLUMN IF NOT EXISTS correlation_id VARCHAR(100);

-- Phase 135: Privacy Consent Enhancements
ALTER TABLE user_privacy_settings ADD COLUMN IF NOT EXISTS search_indexing BOOLEAN DEFAULT TRUE;
ALTER TABLE user_privacy_settings ADD COLUMN IF NOT EXISTS data_sharing_analytics BOOLEAN DEFAULT FALSE;
ALTER TABLE user_privacy_settings ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT FALSE;

-- Phase 136: Document Management Enhancements
ALTER TABLE file_documents ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE file_documents ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;
ALTER TABLE file_documents ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES users(id);
ALTER TABLE file_documents ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE file_documents ADD COLUMN IF NOT EXISTS access_level VARCHAR(50) DEFAULT 'PRIVATE';

-- Phase 137: Content Moderation
CREATE TABLE IF NOT EXISTS content_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(50) NOT NULL,
    target_id UUID NOT NULL,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    reviewed_by UUID REFERENCES users(id),
    review_action VARCHAR(50),
    review_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);
CREATE INDEX idx_content_reports_status ON content_reports(status);
CREATE INDEX idx_content_reports_target ON content_reports(target_type, target_id);

CREATE TABLE IF NOT EXISTS moderation_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    moderator_id UUID NOT NULL REFERENCES users(id),
    target_type VARCHAR(50) NOT NULL,
    target_id UUID NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    reason TEXT,
    duration_days INTEGER,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Phase 138: Fraud Prevention
CREATE TABLE IF NOT EXISTS fraud_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    signal_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) DEFAULT 'LOW',
    description TEXT,
    evidence TEXT,
    status VARCHAR(50) DEFAULT 'DETECTED',
    resolved_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);
CREATE INDEX idx_fraud_signals_user ON fraud_signals(user_id);
CREATE INDEX idx_fraud_signals_status ON fraud_signals(status);

CREATE TABLE IF NOT EXISTS coin_transaction_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    reference_type VARCHAR(50),
    reference_id UUID,
    description TEXT,
    status VARCHAR(50) DEFAULT 'COMPLETED',
    verified BOOLEAN DEFAULT FALSE,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_coin_ledger_user ON coin_transaction_ledger(user_id);
CREATE INDEX idx_coin_ledger_reference ON coin_transaction_ledger(reference_type, reference_id);

-- Phase 139: Correlation IDs for request tracing
ALTER TABLE security_audit_log ADD COLUMN IF NOT EXISTS correlation_id VARCHAR(100);
