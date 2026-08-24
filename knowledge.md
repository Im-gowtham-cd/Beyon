# Beyon — Project Knowledge

## 1. Project Identity

**Application Name:** Beyon

**Purpose:**
Beyon is an AI-powered skill development and recruitment ecosystem connecting students, companies, and educational institutions.

Beyon combines:

* LeetCode-style daily learning
* Skill assessment
* Adaptive challenges
* Beyon Coins
* Skill Score
* Company readiness
* Company-sponsored challenges
* Company recruitment
* Institution-based recruitment
* Independent recruitment
* Proctored desktop assessments
* Verified Skill Passport
* Institution analytics
* Industry-academia collaboration

## 2. Core Philosophy

Beyon's core loop is:

Learn → Practice → Prove → Earn → Qualify → Apply → Assess → Get Hired

The platform should not behave like a normal job portal.

Students should continuously build demonstrable skills before accessing recruitment opportunities.

Core principle:

> Don't just apply for a job. Earn your eligibility for it.

## 3. User Roles

### Student

Students can:

* Create profile
* Select learning goals
* Learn topics
* Solve daily challenges
* Take topic challenges
* Take weekend tests
* Earn Beyon Coins
* Build Skill Score
* Maintain streaks
* Earn badges
* Complete certifications
* Build projects
* Follow companies
* Follow institutions/communities
* Discover jobs/internships
* Apply independently
* Participate in company challenges
* Apply for eligible company assessments
* Take desktop proctored assessments
* Track applications
* Maintain Skill Passport

Students also have a placement preference:

* Campus Placement Willing
* Independent/Off-Campus Focused
* Not Currently Seeking

A student who is not willing for institutional placement must still be allowed to independently search and apply for opportunities.

### Company

Companies can:

* Create verified company profile
* Follow institutions
* Follow relevant talent communities
* Publish jobs
* Publish internships
* Publish apprenticeships
* Publish live projects
* Publish company-sponsored challenges
* Create recruitment assessments
* Define skill requirements
* Define eligibility criteria
* Define Beyon Coin application cost
* Target specific institutions
* Discover candidates
* View candidate skill profiles
* Shortlist candidates
* Review assessment results
* Review proctoring evidence
* Manage recruitment pipeline

### Institution

Institutions can:

* Manage students
* Maintain student placement preference
* Monitor student skills
* Monitor challenges and learning
* Receive company recruitment requests
* Follow companies
* Recommend opportunities
* Monitor applications
* Monitor placement outcomes
* View skill-gap analytics
* View industry-demand analytics
* View institution performance score

### Admin

Admin can:

* Manage users
* Verify companies
* Verify institutions
* Manage skills
* Manage categories
* Manage platform rules
* Manage challenge moderation
* Monitor assessments
* Monitor suspicious activity
* Manage rewards
* Manage platform configuration

## 4. Recruitment Model

Beyon has two recruitment channels.

### Institution Recruitment

Company → Institution → Eligible Students → Assessment → Shortlisting → Hiring

Companies can target specific institutions.

### Independent Recruitment

Company → Beyon → Skill Matching → Eligible Student → Assessment → Hiring

Students who do not participate in institutional placement can still independently discover and apply for jobs.

## 5. Student Skill System

Every student has a dynamic Skill Profile.

Example:

Java: 87
SQL: 76
React: 68
Spring Boot: 62
Docker: 45

Skill Score is derived from evidence such as:

* Daily challenges
* Topic challenges
* Weekend tests
* Company challenges
* Company assessments
* Certifications
* Projects
* Verified achievements

Skill Score represents capability and must be separate from Beyon Coins.

## 6. Beyon Coin System

Beyon Coins are earned through meaningful learning activity.

Examples:

* Daily challenge → coins
* Topic challenge → coins
* Weekend test → coins
* Certification → coins
* Project completion → coins
* Company challenge → coins
* Learning streak → bonus coins

Students must NOT purchase Beyon Coins using real money.

Coins represent learning effort and achievement.

Companies define the Beyon Coin application cost for their recruitment assessments.

Example:

Company A → 50 coins
Company B → 100 coins
Company C → 150 coins

A student must have enough coins to apply.

When the application is successfully submitted, the required coins are deducted.

## 7. Skill Score vs Beyon Coins

These are different systems.

### Beyon Coins

Used to unlock/apply for recruitment opportunities.

### Skill Score

Represents actual demonstrated capability.

Spending coins must never decrease Skill Score.

## 8. Eligibility Engine

A student can apply for a company opportunity only when all configured requirements are satisfied.

Possible requirements:

* Required skills
* Minimum skill score
* Minimum CGPA
* Degree
* Department
* Graduation year
* Experience
* Certifications
* Institution targeting
* Placement eligibility
* Beyon Coin balance
* Other company-defined criteria

Eligibility must be deterministic and explainable.

The system should show:

* Eligible requirements
* Failed requirements
* Missing skills
* Required score
* Current score
* Required coins
* Available coins

## 9. Company Readiness

Each company can define a target skill profile.

Example:

Java: 80
SQL: 70
Spring Boot: 65
Docker: 50

Beyon calculates the student's company-readiness percentage.

Example:

XYZ Ready: 82%

The student can see:

* Satisfied skills
* Weak skills
* Missing skills
* Recommended challenges
* Recommended learning

## 10. Adaptive Daily Challenge Engine

Daily challenges should not be identical for everyone.

The engine considers:

* Current learning topic
* Previously learned topics
* Weak skills
* Previous mistakes
* Difficulty
* Recent performance
* Skill goals
* Company readiness goals

The system should prioritize weak areas while maintaining revision of strong areas.

## 11. Streak System

Students receive rewards for meaningful continuous learning.

Example:

7-day streak → bonus
30-day streak → larger bonus
100-day streak → special achievement

A streak must require meaningful activity.

## 12. Company-Sponsored Challenges

Companies can publish skill challenges before recruitment.

Example:

XYZ Java Challenge

Possible rewards:

* Beyon Coins
* Company badge
* Assessment invitation
* Fast-track recruitment consideration

This allows companies to discover talent before formal recruitment.

## 13. Skill Verification

Skills have verification levels:

1. Self Claimed
2. Challenge Verified
3. Assessment Verified
4. Certification Verified
5. Company Verified

Higher verification means stronger evidence.

## 14. Beyon Skill Passport

Every student has a digital Skill Passport containing:

* Profile
* Skills
* Skill Scores
* Verification levels
* Challenges
* Certifications
* Projects
* Company challenges
* Assessments
* Internships
* Achievements
* Placement history

The passport should be shareable with recruiters.

## 15. Follow System

Students can follow:

* Companies
* Institutions
* Communities

Institutions can follow companies.

Companies can follow institutions.

Following affects personalized feeds and notifications.

## 16. Notification Rules

A student should receive targeted company recruitment notifications when configured conditions are satisfied.

Example:

Student follows XYZ
AND
Java >= required level
AND
SQL >= required level
AND
Coins >= required amount
AND
other eligibility conditions satisfied

→ Send recruitment notification.

If the student is not eligible, do not send a misleading recruitment notification.

Eligible opportunities should still be discoverable through search where appropriate.

## 17. Personalized Feed

Feed can contain:

* Daily challenges
* Company challenges
* Recruitment opportunities
* Internships
* Certifications
* Workshops
* Skill recommendations
* Company updates
* Institution announcements

Feed must be personalized according to student interests, skills, follows and eligibility.

## 18. Company Recruitment Assessment

A company can create an assessment containing:

* MCQs
* Coding questions
* SQL questions
* Aptitude
* Technical questions
* Company-specific questions

Assessment configuration:

* Duration
* Sections
* Marks
* Negative marking
* Difficulty
* Attempt rules
* Eligibility
* Coin cost
* Proctoring level

## 19. Desktop Assessment Application

The main Beyon platform is a web application.

Recruitment assessments are performed through a dedicated desktop application.

Technology:

Electron + React + TypeScript

The desktop assessment application should support:

* Secure exam mode
* Fullscreen/kiosk behavior
* Webcam
* Microphone
* Screen monitoring
* Application/tab switching detection
* Copy/paste restrictions
* Multiple-monitor detection
* Identity verification
* Suspicious activity detection
* Exam timer
* Question navigation
* Coding editor
* Submission
* Offline-safe temporary state where appropriate

Proctoring events should generate evidence/flags.

AI must not automatically accuse a student of cheating.

Suspicious events should be reviewable by authorized company/institution personnel.

## 20. Institution Performance Score

Institution performance is calculated from configurable measurable factors.

Possible factors:

* Academic performance
* Placement rate
* Company quality
* Average salary
* Highest salary
* Industry partnerships
* Student skill performance
* Internship participation
* Recruitment outcomes

Company classification may use configurable tiers such as:

* Tier 1
* Tier 2
* Tier 3

The exact scoring formula must be configurable rather than hardcoded.

## 21. Institution Recruitment

Companies can select institutions while creating recruitment.

Example:

XYZ → Select Institution A, B, C

Each institution receives the opportunity.

Institution administrators can see:

* Requirements
* Eligible students
* Applications
* Assessment participation
* Shortlists
* Selection outcomes

## 22. Independent Job Search

Students can independently search for:

* Jobs
* Internships
* Apprenticeships
* Projects

Search can use:

* Skills
* Role
* Location
* Remote/On-site
* Salary
* Experience
* Company
* Eligibility

Matching should prioritize demonstrated skills.

## 23. AI Features

AI should be used where it provides measurable value.

Possible AI functionality:

* Skill extraction
* Resume parsing
* Adaptive challenge recommendation
* Skill-gap analysis
* Company readiness prediction
* Opportunity matching
* Learning recommendations
* Natural-language job search
* Proctoring anomaly detection
* Assessment analysis

AI output must not override deterministic eligibility rules.

## 24. Data Architecture

### Structured Data → Supabase PostgreSQL

Use PostgreSQL for:

* Users
* Roles
* Companies
* Institutions
* Student profiles
* Skills
* Skill scores
* Company requirements
* Applications
* Recruitment
* Assessments
* Follows
* Coins
* Placements
* Certifications
* Transactions

### Flexible / High-volume Data → MongoDB

Use MongoDB for:

* Question bank
* Challenge content
* Question versions
* Submission metadata
* Activity logs
* Proctoring events
* AI analysis results
* Assessment event logs

### Cache → Upstash Redis

Use Redis for:

* Frequently accessed data
* Leaderboards
* Session-related temporary data
* Eligibility cache
* Rate limiting
* Notification queues where appropriate

### File Storage → Supabase Storage

Use for:

* Resumes
* Certificates
* Documents
* Profile media
* Assessment-related files where appropriate

## 25. Scaling Philosophy

Do not introduce unnecessary microservices or DevOps complexity.

Start with a modular Spring Boot backend.

Separate modules logically:

* Identity
* Student
* Skills
* Challenges
* Coins
* Recruitment
* Assessment
* Notifications
* Institution
* Company
* AI integration

Scale individual components only when required.

## 26. Technology Stack

### Web

React
Vite
TypeScript
Pure CSS
Accessible component primitives where useful

### Backend

Java
Spring Boot
REST APIs
WebSocket where required

### Databases

Supabase PostgreSQL
MongoDB Atlas

### Cache

Upstash Redis

### Storage

Supabase Storage

### AI

Python
FastAPI
Scikit-learn
XGBoost
Ollama/open-source models

### Desktop Assessment

Electron
React
TypeScript

### Testing

JUnit
Mockito
Playwright
Vitest

### API Documentation

OpenAPI
Swagger

## 27. Core Architecture

Web:

React → Spring Boot → PostgreSQL / MongoDB / Redis / Storage

AI:

Spring Boot → FastAPI → ML/LLM services

Assessment:

Beyon Web → Assessment Session → Electron Desktop App → Assessment API → Evaluation → Proctoring Report

## 28. Important Product Rules

1. Never allow students to purchase Beyon Coins.
2. Coins represent learning effort.
3. Coins and Skill Score must remain separate.
4. Spending coins must not reduce Skill Score.
5. Eligibility rules must be explainable.
6. Students not willing for campus placement can still independently apply.
7. Companies can target institutions.
8. Students and companies can follow each other where permitted.
9. Recruitment notifications must respect eligibility conditions.
10. Proctoring should produce evidence, not automatic accusations.
11. Institution scoring must use configurable formulas.
12. Company tiers must be configurable.
13. AI recommendations must not override hard eligibility rules.
14. Security and privacy are required for student and assessment data.
15. Every important action should have an audit trail.
16. Do not build unnecessary microservices initially.
17. Build modularly so future scaling is possible.
18. Every phase must preserve functionality from previous phases.
19. Never replace an existing working feature with a simplified mock.
20. Never implement fake functionality and present it as complete.

## 29. Product Goal

Beyon should create a continuous bridge:

Industry Demand
→ Skill Requirements
→ Student Learning
→ Daily Practice
→ Skill Verification
→ Beyon Coins
→ Eligibility
→ Company Assessment
→ Proctored Evaluation
→ Recruitment
→ Placement Outcome
→ Institution Analytics

The platform's primary differentiator is the connection between **continuous skill development and real recruitment access**.
