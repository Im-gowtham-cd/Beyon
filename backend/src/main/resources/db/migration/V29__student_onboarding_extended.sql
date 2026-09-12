-- ============================================================
-- V29: Student Onboarding Extended with AICTE Verification & S3 Document Storage
-- ============================================================

CREATE TABLE IF NOT EXISTS aicte_institutions (
    id VARCHAR(36) PRIMARY KEY,
    aicte_id VARCHAR(50) NOT NULL UNIQUE,
    institute_name VARCHAR(500) NOT NULL,
    region VARCHAR(100),
    state VARCHAR(100),
    district VARCHAR(100),
    city VARCHAR(100),
    user_group VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_aicte_institutions_aicte_id ON aicte_institutions(aicte_id);
CREATE INDEX idx_aicte_institutions_name ON aicte_institutions(institute_name);

ALTER TABLE student_profiles ADD COLUMN first_name VARCHAR(100);
ALTER TABLE student_profiles ADD COLUMN middle_name VARCHAR(100);
ALTER TABLE student_profiles ADD COLUMN last_name VARCHAR(100);
ALTER TABLE student_profiles ADD COLUMN aicte_code VARCHAR(50);
ALTER TABLE student_profiles ADD COLUMN student_id_card_url VARCHAR(500);
ALTER TABLE student_profiles ADD COLUMN education_10th TEXT;
ALTER TABLE student_profiles ADD COLUMN education_12th TEXT;
ALTER TABLE student_profiles ADD COLUMN education_diploma TEXT;
ALTER TABLE student_profiles ADD COLUMN internship_experience TEXT;
ALTER TABLE student_profiles ADD COLUMN verification_status VARCHAR(30) DEFAULT 'PENDING';
