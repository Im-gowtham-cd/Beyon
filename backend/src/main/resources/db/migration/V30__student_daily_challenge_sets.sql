CREATE TABLE IF NOT EXISTS student_daily_challenge_sets (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL,
    session_date DATE NOT NULL,
    set_type VARCHAR(20) NOT NULL,
    questions_json JSON NOT NULL,
    results_json JSON NULL,
    is_completed TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_student_date_type (student_id, session_date, set_type)
);
