# Beyon — Seed Data Dictionary

This document details the data structure, foreign key relationships, and entity definitions used across the Beyon test data seeding system.

---

## 1. Core Entities & Sources of Truth

| Entity | Primary Store | Description |
|---|---|---|
| **Users / Identities** | Appwrite + Dolt `users` | User credentials, roles, email verification status |
| **Student Profiles** | Dolt `student_profiles` | Academic background, CGPA, graduation year, placement preference |
| **Institution Profiles** | Dolt `institution_profiles` | University/College accreditation, tier, stats |
| **Company Profiles** | Dolt `company_profiles` | Hiring tier, industry, headquarters, size |
| **Skill Taxonomy** | Dolt `skills`, `skill_categories`, `skill_topics` | Categories, skills, and subtopics |
| **Questions & Options** | Dolt `questions`, `question_options` | MCQ, SQL, coding problems |
| **Assessments / Tests** | Dolt `tests`, `test_questions` | Pre-employment and skill tests |
| **Opportunities & Drives** | Dolt `company_opportunities`, `placement_drives` | Jobs, internships, campus recruitment |
| **Applications** | Dolt `opportunity_applications` | Candidate applications and pipeline statuses |
| **Coin Ledger** | Dolt `coin_wallets`, `coin_transactions` | Double-entry ledger of coin earnings/spendings |
| **Notifications** | Dolt `notifications` | In-app alerts for recruitment, exams, coins |
| **Follows** | Dolt `follows` | Follow graph between students, companies, institutions |

---

## 2. Referential Key Conventions

| Key Prefix | Entity | Example |
|---|---|---|
| `beyon-cat-` | Skill Category | `beyon-cat-cat_prog` |
| `beyon-skill-` | Skill | `beyon-skill-skill_java` |
| `beyon-topic-` | Skill Topic | `beyon-topic-topic_java_oop` |
| `beyon-inst-` | Institution | `beyon-inst-user-inst_0001` |
| `beyon-comp-` | Company | `beyon-comp-user-comp_0001` |
| `beyon-student-` | Fixed Student | `beyon-student-strong-0001` |
| `beyon-gen-student-` | Generated Student | `beyon-gen-student-0001` |
| `beyon-q-` | Question | `beyon-q-mcq-SKILL_JAVA-0` |
| `beyon-test-` | Test / Assessment | `beyon-test-java-backend-001` |
| `beyon-opty-` | Job / Internship | `beyon-opty-0` |
| `beyon-app-` | Application | `beyon-app-0` |
| `beyon-ctx-` | Coin Transaction | `beyon-ctx-earn-student_0001-0` |
