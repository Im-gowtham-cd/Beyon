-- V13: Seed Data for Staging Environment
-- Test accounts and demo data for beta testing

-- Test Users (passwords are bcrypt hashed 'password123')
INSERT INTO users (id, email, password_hash, role, status, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'student@beyon.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'STUDENT', 'ACTIVE', NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'institution@beyon.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'INSTITUTION', 'ACTIVE', NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', 'company@beyon.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'COMPANY', 'ACTIVE', NOW(), NOW()),
  ('44444444-4444-4444-4444-444444444444', 'admin@beyon.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', 'ACTIVE', NOW(), NOW()),
  ('55555555-5555-5555-5555-555555555555', 'student2@beyon.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'STUDENT', 'ACTIVE', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Test Student Profiles
INSERT INTO student_profiles (id, user_id, username, degree, department, institution, graduation_year, placement_status, created_at, updated_at)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'teststudent', 'B.Tech', 'Computer Science', 'Test University', 2026, 'SEEKING', NOW(), NOW()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '55555555-5555-5555-5555-555555555555', 'teststudent2', 'B.Tech', 'Information Technology', 'Test University', 2026, 'SEEKING', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Test Institution Profiles
INSERT INTO institution_profiles (id, user_id, institution_name, institution_type, location, website, accreditation, student_count, established_year, created_at, updated_at)
VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'Test University', 'DEEMED', 'Chennai, India', 'https://testuniversity.edu', 'NAAC A+', 5000, 1990, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Test Company Profiles
INSERT INTO company_profiles (id, user_id, company_name, industry, website, logo_url, description, founded_year, headquarters, company_size, created_at, updated_at)
VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', 'Test Corp', 'Technology', 'https://testcorp.com', NULL, 'A leading technology company for testing', 2010, 'Bangalore, India', '1000-5000', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Test Coin Wallets
INSERT INTO coin_wallets (id, student_id, balance, total_earned, total_spent, created_at, updated_at)
VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 2500, 2500, 0, NOW(), NOW()),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '55555555-5555-5555-5555-555555555555', 1000, 1000, 0, NOW(), NOW())
ON CONFLICT (student_id) DO NOTHING;

-- Test Discussion Categories (only if not already seeded)
INSERT INTO discussion_categories (id, name, slug, description, icon, sort_order, created_at)
SELECT gen_random_uuid(), cat.name, cat.slug, cat.description, cat.icon, cat.sort_order, NOW()
FROM (VALUES
  ('Programming', 'programming', 'General programming discussions', '💻', 1),
  ('DSA', 'dsa', 'Data Structures & Algorithms', '🧮', 2),
  ('Java', 'java', 'Java programming language', '☕', 3),
  ('Web Development', 'web-dev', 'Frontend & Backend web development', '🌐', 4),
  ('AI/ML', 'ai-ml', 'Artificial Intelligence & Machine Learning', '🤖', 5),
  ('Placements', 'placements', 'Campus placement preparation', '🎯', 6),
  ('Internships', 'internships', 'Internship opportunities & experience', '💼', 7),
  ('Career', 'career', 'Career guidance & advice', '🚀', 8),
  ('Projects', 'projects', 'Project showcase & help', '🛠️', 9),
  ('General', 'general', 'General discussion', '💬', 10)
) AS cat(name, slug, description, icon, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM discussion_categories WHERE slug = cat.slug);
