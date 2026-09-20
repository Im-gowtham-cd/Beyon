-- V31: Unified Skill-to-Career Ecosystem Migrations
-- Supporting: Revised Challenges, Deterministic Skill Ranks, Opportunity Match Breakdowns

CREATE TABLE IF NOT EXISTS revised_challenges (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL,
    skill_id VARCHAR(36) NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    topic_id VARCHAR(36) NULL,
    topic_name VARCHAR(100) NULL,
    weakness_score DECIMAL(5,2) DEFAULT 0.00,
    question_id VARCHAR(36) NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    xp_reward INT DEFAULT 50,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_revised_student (student_id),
    INDEX idx_revised_status (status)
);

CREATE TABLE IF NOT EXISTS skill_rank_snapshots (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL,
    skill_id VARCHAR(36) NOT NULL,
    normalized_level INT NOT NULL DEFAULT 1,
    raw_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    global_rank INT NOT NULL DEFAULT 1,
    institution_rank INT NOT NULL DEFAULT 1,
    percentile DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    is_verified TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_student_skill_rank (student_id, skill_id),
    INDEX idx_rank_skill_percentile (skill_id, percentile DESC)
);

CREATE TABLE IF NOT EXISTS opportunity_match_breakdowns (
    id VARCHAR(36) PRIMARY KEY,
    opportunity_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    match_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    matched_skills_json JSON NULL,
    missing_skills_json JSON NULL,
    fit_category VARCHAR(30) NOT NULL DEFAULT 'POTENTIAL_FIT',
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_opp_student_match (opportunity_id, student_id),
    INDEX idx_opp_match_score (opportunity_id, match_percentage DESC)
);
