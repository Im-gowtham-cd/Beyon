# Beyon — Supabase Database Deletion & Cleanup Guide

## Overview

This document covers all procedures for deleting, resetting, and cleaning up the Beyon Supabase database across development, staging, and production environments.

---

## ⚠️ Warning

> **Deleting database data is irreversible.** Always backup before performing any deletion operation. Never run deletion scripts against production without explicit approval and a verified backup.

---

## Table of Contents

1. [Backup Before Deletion](#1-backup-before-deletion)
2. [Development Reset (Full Wipe)](#2-development-reset-full-wipe)
3. [Staging Reset](#3-staging-reset)
4. [Production Cleanup](#4-production-cleanup)
5. [Drop All Tables](#5-drop-all-tables)
6. [Drop Specific Module Tables](#6-drop-specific-module-tables)
7. [Reset Flyway Migrations](#7-reset-flyway-migrations)
8. [Clear Redis Cache](#8-clear-redis-cache)
9. [Delete User Accounts](#9-delete-user-accounts)
10. [Delete Specific Data](#10-delete-specific-data)
11. [Supabase Dashboard Deletion](#11-supabase-dashboard-deletion)
12. [API-Based Deletion](#12-api-based-deletion)
13. [Complete Project Teardown](#13-complete-project-teardown)
14. [Post-Deletion Verification](#14-post-deletion-verification)

---

## 1. Backup Before Deletion

### Supabase Dashboard Backup

1. Go to **Supabase Dashboard** → **Project** → **Database**
2. Click **Backups**
3. Click **Create a backup**
4. Download the backup file

### pg_dump Backup (Command Line)

```bash
# Set your connection string
export DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.wopozplrzhqjxvimtumz.supabase.co:5432/postgres"

# Full backup
pg_dump "$DATABASE_URL" -F c -b -v -f beyon_backup_$(date +%Y%m%d_%H%M%S).dump

# Schema-only backup
pg_dump "$DATABASE_URL" --schema-only -f beyon_schema_$(date +%Y%m%d).sql

# Data-only backup
pg_dump "$DATABASE_URL" --data-only -f beyon_data_$(date +%Y%m%d).sql
```

### Supabase CLI Backup

```bash
supabase db dump -f beyon_backup.sql
```

---

## 2. Development Reset (Full Wipe)

**Use case:** Reset local/Docker PostgreSQL to clean state.

### Option A: Docker Reset (Recommended for Local)

```bash
# Stop and remove the container
docker stop beyon-postgres
docker rm beyon-postgres

# Remove the volume (all data)
docker volume rm <volume_name>

# Start fresh
docker run -d --name beyon-postgres \
  -e POSTGRES_PASSWORD=beyon123 \
  -e POSTGRES_DB=beyon \
  -p 5432:5432 \
  postgres:17
```

### Option B: Drop and Recreate Database

```bash
# Connect to PostgreSQL
psql -h localhost -U postgres

# Drop and recreate
DROP DATABASE beyon;
CREATE DATABASE beyon;

# Exit
\q
```

### Option C: Truncate All Tables

```bash
psql -h localhost -U postgres -d beyon -c "
DO $$ DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
  END LOOP;
END $$;
"
```

---

## 3. Staging Reset

**Use case:** Reset staging Supabase project before a new deployment cycle.

### Via Supabase Dashboard

1. Go to **Supabase Dashboard** → **Database** → **Backups**
2. Restore to the latest backup before testing
3. Or use SQL Editor to truncate

### Via SQL Editor

```sql
-- Disable triggers temporarily
SET session_replication_role = 'replica';

-- Truncate all tables
DO $$ DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != 'flyway_schema_history') LOOP
    EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
  END LOOP;
END $$;

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Reset flyway
DELETE FROM flyway_schema_history;
```

---

## 4. Production Cleanup

**Use case:** Selective data cleanup in production.

### ⚠️ Never drop tables in production without approval

### Delete Test/Demo Data

```sql
-- Delete test users (by email pattern)
DELETE FROM users WHERE email LIKE '%test%' OR email LIKE '%demo%';

-- Delete old audit logs (older than 90 days)
DELETE FROM audit_events WHERE created_at < NOW() - INTERVAL '90 days';

-- Delete expired sessions
DELETE FROM user_sessions WHERE expires_at < NOW();

-- Delete old notifications (older than 30 days)
DELETE FROM notifications WHERE created_at < NOW() - INTERVAL '30 days';
```

### Clean Up Orphaned Records

```sql
-- Find orphaned records
SELECT sa.id FROM student_achievements sa
LEFT JOIN users u ON sa.user_id = u.id
WHERE u.id IS NULL;

-- Delete orphaned records
DELETE FROM student_achievements sa
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = sa.user_id);
```

---

## 5. Drop All Tables

**Use case:** Complete database reset.

```sql
-- Drop all tables in public schema
DO $$ DECLARE
  r RECORD;
BEGIN
  -- Drop views first
  FOR r IN (SELECT viewname FROM pg_views WHERE schemaname = 'public') LOOP
    EXECUTE 'DROP VIEW IF EXISTS ' || quote_ident(r.viewname) || ' CASCADE';
  END LOOP;

  -- Drop tables
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
  END LOOP;

  -- Drop sequences
  FOR r IN (SELECT sequencename FROM pg_sequences WHERE schemaname = 'public') LOOP
    EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.sequencename) || ' CASCADE';
  END LOOP;

  -- Drop types
  FOR r IN (SELECT typname FROM pg_type WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) LOOP
    EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(r.typname) || ' CASCADE';
  END LOOP;
END $$;

-- Drop all extensions (optional)
-- DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;
-- DROP EXTENSION IF EXISTS "pgcrypto" CASCADE;
```

### Using Supabase CLI

```bash
# Reset database to initial state
supabase db reset
```

---

## 6. Drop Specific Module Tables

### Phase 1-40: Core Beyon Tables

```sql
-- Identity & Auth
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS email_verification_tokens CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Student Profile
DROP TABLE IF EXISTS student_profiles CASCADE;
DROP TABLE IF EXISTS student_skills CASCADE;
DROP TABLE IF EXISTS student_achievements CASCADE;
DROP TABLE IF EXISTS student_certifications CASCADE;
DROP TABLE IF EXISTS student_projects CASCADE;
DROP TABLE IF EXISTS student_links CASCADE;
DROP TABLE IF EXISTS student_learning_skills CASCADE;
DROP TABLE IF EXISTS student_career_preferences CASCADE;

-- Skills & Topics
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS skill_categories CASCADE;
DROP TABLE IF EXISTS topics CASCADE;
DROP TABLE IF EXISTS questions CASCADE;

-- Practice & Coins
DROP TABLE IF EXISTS daily_challenges CASCADE;
DROP TABLE IF EXISTS daily_challenge_attempts CASCADE;
DROP TABLE IF EXISTS practice_sessions CASCADE;
DROP TABLE IF EXISTS coin_transactions CASCADE;
DROP TABLE IF EXISTS coin_balances CASCADE;

-- Assessments
DROP TABLE IF EXISTS assessments CASCADE;
DROP TABLE IF EXISTS assessment_questions CASCADE;
DROP TABLE IF EXISTS assessment_sessions CASCADE;
DROP TABLE IF EXISTS assessment_results CASCADE;
DROP TABLE IF EXISTS assessment_policies CASCADE;

-- Opportunities & Applications
DROP TABLE IF EXISTS opportunities CASCADE;
DROP TABLE IF EXISTS opportunity_applications CASCADE;
DROP TABLE IF EXISTS company_opportunities CASCADE;

-- Notifications
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS notification_preferences CASCADE;
```

### Phase 41-100: Intelligence & Recruitment

```sql
-- Skill Intelligence
DROP TABLE IF EXISTS student_skill_intelligence CASCADE;
DROP TABLE IF EXISTS assessment_skill_scores CASCADE;
DROP TABLE IF EXISTS skill_gaps CASCADE;
DROP TABLE IF EXISTS skill_recommendations CASCADE;

-- Career
DROP TABLE IF EXISTS career_paths CASCADE;
DROP TABLE IF EXISTS career_path_skills CASCADE;
DROP TABLE IF EXISTS career_roadmap_items CASCADE;
DROP TABLE IF EXISTS student_career_progress CASCADE;

-- Matching
DROP TABLE IF EXISTS matching_scores CASCADE;
DROP TABLE IF EXISTS opportunity_match_details CASCADE;

-- Interviews
DROP TABLE IF EXISTS interview_rounds CASCADE;
DROP TABLE IF EXISTS interview_schedules CASCADE;
DROP TABLE IF EXISTS interview_scorecards CASCADE;

-- Analytics
DROP TABLE IF EXISTS institution_analytics_snapshots CASCADE;
DROP TABLE IF EXISTS company_analytics_snapshots CASCADE;

-- Collaboration
DROP TABLE IF EXISTS collaboration_programs CASCADE;
DROP TABLE IF EXISTS collaboration_registrations CASCADE;
```

### Phase 101-160: Community & Platform

```sql
-- Community
DROP TABLE IF EXISTS social_posts CASCADE;
DROP TABLE IF EXISTS social_comments CASCADE;
DROP TABLE IF EXISTS social_likes CASCADE;
DROP TABLE IF EXISTS discussions CASCADE;
DROP TABLE IF EXISTS user_follows CASCADE;
DROP TABLE IF EXISTS topic_follows CASCADE;

-- Mentorship
DROP TABLE IF EXISTS mentor_profiles CASCADE;
DROP TABLE IF EXISTS mentorship_requests CASCADE;
DROP TABLE IF EXISTS mentorship_sessions CASCADE;

-- Events
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS event_registrations CASCADE;

-- Challenges & Projects
DROP TABLE IF EXISTS industry_challenges CASCADE;
DROP TABLE IF EXISTS challenge_participations CASCADE;
DROP TABLE IF EXISTS industry_projects CASCADE;
DROP TABLE IF EXISTS project_applications CASCADE;

-- Research
DROP TABLE IF EXISTS research_proposals CASCADE;
DROP TABLE IF EXISTS research_participants CASCADE;

-- Platform
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS content_reports CASCADE;
DROP TABLE IF EXISTS moderation_actions CASCADE;
DROP TABLE IF EXISTS fraud_signals CASCADE;
DROP TABLE IF EXISTS coin_transaction_ledger CASCADE;
DROP TABLE IF EXISTS search_index CASCADE;
DROP TABLE IF EXISTS realtime_events CASCADE;
DROP TABLE IF EXISTS recommendation_signals CASCADE;
DROP TABLE IF EXISTS integrity_checks CASCADE;
```

### Phase 161-220: Recruitment & Intelligence

```sql
-- Recruitment
DROP TABLE IF EXISTS recruitment_drives CASCADE;
DROP TABLE IF EXISTS drive_institution_targets CASCADE;
DROP TABLE IF EXISTS recruitment_applications CASCADE;
DROP TABLE IF EXISTS recruitment_pipelines CASCADE;
DROP TABLE IF EXISTS recruitment_status_history CASCADE;
DROP TABLE IF EXISTS placement_registrations CASCADE;
DROP TABLE IF EXISTS candidate_shortlists CASCADE;
DROP TABLE IF EXISTS recruitment_interviews CASCADE;
DROP TABLE IF EXISTS placement_records CASCADE;
DROP TABLE IF EXISTS placement_offers CASCADE;
DROP TABLE IF EXISTS institution_placement_stats CASCADE;
DROP TABLE IF EXISTS placement_verifications CASCADE;

-- Placement Intelligence
DROP TABLE IF EXISTS institution_ratings CASCADE;
DROP TABLE IF EXISTS company_tier_profiles CASCADE;
DROP TABLE IF EXISTS interview_feedback_intelligence CASCADE;
DROP TABLE IF EXISTS career_outcomes CASCADE;
DROP TABLE IF EXISTS placement_readiness_scores CASCADE;

-- Alumni & Referrals
DROP TABLE IF EXISTS alumni_profiles CASCADE;
DROP TABLE IF EXISTS alumni_connections CASCADE;
DROP TABLE IF EXISTS opportunity_referrals CASCADE;

-- Certification & Identity
DROP TABLE IF EXISTS beyon_certificates CASCADE;
DROP TABLE IF EXISTS skill_endorsements CASCADE;
DROP TABLE IF EXISTS professional_profiles CASCADE;
DROP TABLE IF EXISTS portfolio_projects CASCADE;
DROP TABLE IF EXISTS portfolio_verifications CASCADE;
DROP TABLE IF EXISTS generated_resumes CASCADE;

-- Career Intelligence
DROP TABLE IF EXISTS skill_taxonomy_nodes CASCADE;
DROP TABLE IF EXISTS skill_taxonomy_links CASCADE;
DROP TABLE IF EXISTS skill_prerequisites CASCADE;
DROP TABLE IF EXISTS student_skill_graph CASCADE;
DROP TABLE IF EXISTS personalized_challenge_config CASCADE;
DROP TABLE IF EXISTS challenge_selection_log CASCADE;
DROP TABLE IF EXISTS adaptive_learning_paths CASCADE;
DROP TABLE IF EXISTS adaptive_learning_steps CASCADE;
DROP TABLE IF EXISTS advisor_chat_sessions CASCADE;
DROP TABLE IF EXISTS advisor_chat_messages CASCADE;
DROP TABLE IF EXISTS portfolio_analysis CASCADE;

-- Teams & Evaluation
DROP TABLE IF EXISTS project_teams CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS project_evaluations CASCADE;

-- Platform Admin
DROP TABLE IF EXISTS platform_daily_stats CASCADE;
DROP TABLE IF EXISTS platform_reports CASCADE;

-- Gamification
DROP TABLE IF EXISTS skill_xp_transactions CASCADE;
DROP TABLE IF EXISTS skill_levels CASCADE;
DROP TABLE IF EXISTS achievement_badges CASCADE;
DROP TABLE IF EXISTS student_achievement_badges CASCADE;
DROP TABLE IF EXISTS student_streaks CASCADE;
DROP TABLE IF EXISTS leaderboards CASCADE;
DROP TABLE IF EXISTS weekly_tests CASCADE;
DROP TABLE IF EXISTS weekly_test_attempts CASCADE;

-- Learning
DROP TABLE IF EXISTS learning_programs CASCADE;
DROP TABLE IF EXISTS learning_program_modules CASCADE;
DROP TABLE IF EXISTS learning_program_enrollments CASCADE;
DROP TABLE IF EXISTS student_certificates CASCADE;
DROP TABLE IF EXISTS growth_scores CASCADE;
DROP TABLE IF EXISTS personalized_feed_items CASCADE;

-- Feedback
DROP TABLE IF EXISTS feedback_reports CASCADE;
DROP TABLE IF EXISTS feedback_attachments CASCADE;
DROP TABLE IF EXISTS feedback_user_comments CASCADE;
DROP TABLE IF EXISTS feedback_internal_notes CASCADE;
DROP TABLE IF EXISTS feedback_status_history CASCADE;

-- Privacy & Audit
DROP TABLE IF EXISTS privacy_settings CASCADE;
DROP TABLE IF EXISTS consent_records CASCADE;
DROP TABLE IF EXISTS audit_events CASCADE;
DROP TABLE IF EXISTS file_documents CASCADE;

-- Reputation
DROP TABLE IF EXISTS reputation_events CASCADE;
DROP TABLE IF EXISTS smart_notifications CASCADE;
DROP TABLE IF EXISTS user_feedback CASCADE;
```

---

## 7. Reset Flyway Migrations

### Option A: Delete Flyway History

```sql
-- Reset flyway schema history
DELETE FROM flyway_schema_history;
```

### Option B: Delete Migration Files

```bash
# Remove all migration files
rm -rf backend/src/main/resources/db/migration/V*.sql

# Recreate V1 migration
# (Copy from version control or backup)
```

### Option C: Skip Flyway on Next Start

```yaml
# application-dev.yml
spring:
  flyway:
    enabled: false
```

---

## 8. Clear Redis Cache

### Upstash Redis (Production)

```bash
# Connect to Upstash
redis-cli --tls -u redis://default:gQAAAAAAAiISAAIgcDEyN2U3YTc4MDQ2Mjk0ZGJiOTVjYWZmMDg0MjcwMzUwMQ@primary-impala-139794.upstash.io:6379

# Flush all keys
FLUSHALL

# Or flush specific patterns
KEYS "feedback:*" | xargs DEL
KEYS "cache:*" | xargs DEL
KEYS "session:*" | xargs DEL
```

### Local Redis

```bash
redis-cli FLUSHALL
```

---

## 9. Delete User Accounts

### Delete Specific User

```sql
-- Delete user and cascade all related data
DELETE FROM users WHERE id = 'user-uuid-here';
```

### Delete All Test Users

```sql
-- Delete users by email pattern
DELETE FROM users WHERE email LIKE '%test%@%' OR email LIKE '%demo%@%';

-- Delete users by role (if test roles exist)
DELETE FROM users WHERE role = 'TEST';
```

### Via Supabase Dashboard

1. Go to **Authentication** → **Users**
2. Select the user
3. Click **Delete user**

---

## 10. Delete Specific Data

### Delete Old Notifications

```sql
DELETE FROM notifications WHERE created_at < NOW() - INTERVAL '30 days';
```

### Delete Expired Sessions

```sql
DELETE FROM user_sessions WHERE expires_at < NOW();
```

### Delete Orphaned Records

```sql
-- Find and delete records referencing non-existent users
DELETE FROM student_profiles WHERE user_id NOT IN (SELECT id FROM users);
DELETE FROM coin_balances WHERE user_id NOT IN (SELECT id FROM users);
DELETE FROM notifications WHERE user_id NOT IN (SELECT id FROM users);
```

### Delete Old Audit Logs

```sql
DELETE FROM audit_events WHERE created_at < NOW() - INTERVAL '90 days';
```

### Delete Specific Assessment Data

```sql
-- Delete assessment results for a specific assessment
DELETE FROM assessment_results WHERE assessment_id = 'assessment-uuid';

-- Delete all assessment data
DELETE FROM assessment_results;
DELETE FROM assessment_sessions;
DELETE FROM assessment_questions;
DELETE FROM assessments;
```

---

## 11. Supabase Dashboard Deletion

### Via Table Editor

1. Go to **Supabase Dashboard** → **Table Editor**
2. Select the table
3. Click **Delete all rows** (trash icon)
4. Confirm deletion

### Via SQL Editor

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run the appropriate SQL from this guide
3. Verify results

### Via Authentication

1. Go to **Authentication** → **Users**
2. Select users to delete
3. Click **Delete**

---

## 12. API-Based Deletion

### Using Supabase Client

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
);

// Delete specific record
const { error } = await supabase
  .from('users')
  .delete()
  .eq('id', 'user-uuid');

// Delete with filter
const { error } = await supabase
  .from('notifications')
  .delete()
  .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
```

### Using REST API

```bash
# Delete via Supabase REST API
curl -X DELETE \
  'https://your-project.supabase.co/rest/v1/users?id=eq.user-uuid' \
  -H 'apikey: your-anon-key' \
  -H 'Authorization: Bearer your-service-role-key'
```

---

## 13. Complete Project Teardown

### Step 1: Backup Everything

```bash
# Backup database
pg_dump "$DATABASE_URL" -F c -f beyon_full_backup.dump

# Backup Redis
redis-cli --tls -u "$REDIS_URL" KEYS "*" | xargs -I {} redis-cli --tls -u "$REDIS_URL" GET {} > redis_backup.txt

# Backup files
# (Download from Supabase Storage if applicable)
```

### Step 2: Drop All Tables

```sql
-- Run the complete drop script from Section 5
```

### Step 3: Clear Redis

```bash
redis-cli --tls -u "$REDIS_URL" FLUSHALL
```

### Step 4: Delete Supabase Project (Nuclear Option)

1. Go to **Supabase Dashboard** → **Project Settings** → **General**
2. Scroll to **Delete Project**
3. Type project name to confirm
4. Click **Delete**

### Step 5: Recreate from Scratch

```bash
# Recreate Supabase project
# Run Flyway migrations
cd backend && ./mvnw flyway:migrate

# Seed data
# (Run seed scripts if available)
```

---

## 14. Post-Deletion Verification

### Verify Tables Are Gone

```sql
-- List all tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Should return empty or only system tables
```

### Verify Redis Is Clear

```bash
redis-cli --tls -u "$REDIS_URL" DBSIZE
# Should return 0
```

### Verify Application Starts

```bash
# Start backend
cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Should start without database errors (migrations will recreate tables)
```

### Verify Frontend Works

```bash
cd web && bun run dev

# Should load without errors
```

---

## Quick Reference Commands

| Task | Command |
|---|---|
| Full local reset | `docker rm beyon-postgres && docker run -d --name beyon-postgres -e POSTGRES_PASSWORD=beyon123 -e POSTGRES_DB=beyon -p 5432:5432 postgres:17` |
| Drop all tables | Run Section 5 SQL |
| Reset flyway | `DELETE FROM flyway_schema_history;` |
| Clear Redis | `FLUSHALL` |
| Backup database | `pg_dump "$DATABASE_URL" -F c -f backup.dump` |
| Delete test users | `DELETE FROM users WHERE email LIKE '%test%';` |
| Delete old notifications | `DELETE FROM notifications WHERE created_at < NOW() - INTERVAL '30 days';` |

---

## Environment-Specific Notes

### Local (Docker)
- Use `docker rm` + `docker run` for quickest reset
- Data is ephemeral by default

### Staging (Supabase)
- Use `supabase db reset` or SQL Editor
- Restore from backup if needed

### Production (Supabase)
- **Never** drop tables without approval
- Use selective deletion only
- Always backup first
- Use `DELETE` with `WHERE` clauses
- Monitor via Supabase Dashboard

---

*Last updated: August 2026*
*Beyon Platform — Database Deletion Guide*
