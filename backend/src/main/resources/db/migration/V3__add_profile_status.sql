ALTER TABLE users ADD COLUMN profile_status VARCHAR(30) NOT NULL DEFAULT 'INCOMPLETE';

CREATE INDEX idx_users_profile_status ON users (profile_status);
