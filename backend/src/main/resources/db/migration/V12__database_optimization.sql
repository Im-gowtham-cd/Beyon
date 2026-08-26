-- V12: Database Optimization — Indexes, Composite Indexes, Constraints

-- Performance indexes for hot-path queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_institution ON student_profiles(institution);

CREATE INDEX IF NOT EXISTS idx_student_skills_user ON student_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_student_skills_skill ON student_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_student_skills_proficiency ON student_skills(proficiency_level);

CREATE INDEX IF NOT EXISTS idx_question_attempts_user ON student_question_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_question_attempts_question ON student_question_attempts(question_id);
CREATE INDEX IF NOT EXISTS idx_question_attempts_created ON student_question_attempts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_coin_transactions_user ON coin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_type ON coin_transactions(type);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_created ON coin_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON daily_challenges(challenge_date);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_skill ON daily_challenges(skill_id);

CREATE INDEX IF NOT EXISTS idx_opportunity_applications_user ON opportunity_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_applications_opportunity ON opportunity_applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_applications_status ON opportunity_applications(status);

CREATE INDEX IF NOT EXISTS idx_company_opportunities_company ON company_opportunities(company_id);
CREATE INDEX IF NOT EXISTS idx_company_opportunities_status ON company_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_company_opportunities_deadline ON company_opportunities(application_deadline);

CREATE INDEX IF NOT EXISTS idx_assessment_sessions_student ON assessment_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_assessment_sessions_opportunity ON assessment_sessions(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_assessment_sessions_status ON assessment_sessions(status);
CREATE INDEX IF NOT EXISTS idx_assessment_sessions_created ON assessment_sessions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_assessment_answers_session ON assessment_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_assessment_answers_question ON assessment_answers(question_id);

CREATE INDEX IF NOT EXISTS idx_proctoring_events_session ON proctoring_events(session_id);
CREATE INDEX IF NOT EXISTS idx_proctoring_events_type ON proctoring_events(event_type);
CREATE INDEX IF NOT EXISTS idx_proctoring_events_created ON proctoring_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON following_id);
CREATE INDEX IF NOT EXISTS idx_follows_pair ON follows(follower_id, following_id);

CREATE INDEX IF NOT EXISTS idx_social_posts_author ON social_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_type ON social_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_social_posts_visibility ON social_posts(visibility);
CREATE INDEX IF NOT EXISTS idx_social_posts_created ON social_posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_social_comments_post ON social_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_social_likes_target ON social_likes(target_type, target_id);

CREATE INDEX IF NOT EXISTS idx_discussion_threads_category ON discussion_threads(category_id);
CREATE INDEX IF NOT EXISTS idx_discussion_threads_author ON discussion_threads(author_id);
CREATE INDEX IF NOT EXISTS idx_discussion_threads_solved ON discussion_threads(solved);
CREATE INDEX IF NOT EXISTS idx_discussion_threads_created ON discussion_threads(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_discussion_replies_thread ON discussion_replies(thread_id);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_skill_intelligence_student ON student_skill_intelligence(student_id);
CREATE INDEX IF NOT EXISTS idx_skill_intelligence_skill ON student_skill_intelligence(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_intelligence_confidence ON student_skill_intelligence(confidence_score DESC);

CREATE INDEX IF NOT EXISTS idx_matching_scores_student ON matching_scores(student_id);
CREATE INDEX IF NOT EXISTS idx_matching_scores_opportunity ON matching_scores(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_matching_scores_total ON matching_scores(total_score DESC);

CREATE INDEX IF NOT EXISTS idx_skill_gaps_student ON skill_gaps(student_id);
CREATE INDEX IF NOT EXISTS idx_skill_gaps_career ON skill_gaps(career_path_id);

CREATE INDEX IF NOT EXISTS idx_career_progress_student ON student_career_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_career_progress_career ON student_career_progress(career_path_id);

CREATE INDEX IF NOT EXISTS idx_interview_schedules_application ON interview_schedules(application_id);
CREATE INDEX IF NOT EXISTS idx_interview_schedules_status ON interview_schedules(status);

CREATE INDEX IF NOT EXISTS idx_collaboration_programs_host ON collaboration_programs(host_user_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_programs_type ON collaboration_programs(program_type);
CREATE INDEX IF NOT EXISTS idx_collaboration_registrations_program ON collaboration_registrations(program_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_registrations_student ON collaboration_registrations(student_id);

CREATE INDEX IF NOT EXISTS idx_placement_records_student ON placement_records(student_id);
CREATE INDEX IF NOT EXISTS idx_placement_records_institution ON placement_records(institution_id);

CREATE INDEX IF NOT EXISTS idx_institution_ratings_institution ON institution_rating_snapshots(institution_id);

CREATE INDEX IF NOT EXISTS idx_placement_drives_institution ON placement_drives(institution_id);
CREATE INDEX IF NOT EXISTS idx_placement_drives_company ON placement_drives(company_id);

-- Background job tracking
CREATE TABLE IF NOT EXISTS background_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_type VARCHAR(50) NOT NULL,
    payload JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    priority INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    retry_count INTEGER NOT NULL DEFAULT 0,
    result JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    next_retry_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_background_jobs_status ON background_jobs(status, priority DESC, created_at);
CREATE INDEX IF NOT EXISTS idx_background_jobs_type ON background_jobs(job_type);

-- Audit log for security tracking
CREATE TABLE IF NOT EXISTS security_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON security_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON security_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON security_audit_log(resource_type, resource_id);

-- Privacy and consent records
CREATE TABLE IF NOT EXISTS user_privacy_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    profile_visibility VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    portfolio_visibility VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    company_visibility VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    institution_visibility VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    assessment_data_sharing BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    consent_type VARCHAR(50) NOT NULL,
    granted BOOLEAN NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_consent_user ON consent_records(user_id, consent_type);

-- File/document management
CREATE TABLE IF NOT EXISTS file_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_type VARCHAR(50) NOT NULL,
    original_name VARCHAR(300) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100),
    file_size BIGINT NOT NULL DEFAULT 0,
    is_public BOOLEAN NOT NULL DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_file_documents_user ON file_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_file_documents_type ON file_documents(file_type);
