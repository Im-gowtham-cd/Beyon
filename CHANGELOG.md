# Beyon — Changelog

## v1.2.0 (Current Release)

### Native Mobile Application (`@beyon/mobile`)
- Built native **Android Studio Gradle Project** (`mobile/android`) in Kotlin targeting **Android SDK 34**.
- Implemented Material 3 zero border-radius UI with ViewBinding and 5 navigation fragments:
  - `HomeFragment`: Overview, 7-day streak, XP level, Beyon Coins (⚡), and daily challenges.
  - `PracticeFragment`: Interactive MCQ Arena with domain category filters, instant answers, and technical explanations.
  - `SkillsFragment`: 109-node Verified Skills Taxonomy Matrix viewer.
  - `OpportunitiesFragment`: Job & internship listings with match score ranking and 1-click apply.
  - `ProfileFragment`: Verified credentials and live "⚡ Ping Backend Service" latency test.
- Implemented `BackendTunnel.kt` OkHttp + Coroutines client connecting to host gateway (`http://10.0.2.2:8085/api/v1`).
- Automated 1-command emulator launcher script `run-android.ts` (`bun run dev:mobile`).

### Advanced Real-Time AI Proctoring Engine (`desktop/`)
- Upgraded to normalized **$YC_bC_r$ Biometric Skin Chrominance Filter** ($Y \in [35, 235], C_b \in [75, 130], C_r \in [130, 175]$) with luminance gradient checks to reject background furniture and ambient light.
- Implemented **3.0-second Face Absence Auto-Termination** (`CRITICAL_ABSENCE_AUTO_TERMINATION`).
- Implemented **512-bin Fast Fourier Transform (FFT) Web Audio Acoustic Analyzer** measuring room noise (RMS $>0.035$) and vocal frequency speech bands ($100\text{Hz} - 2500\text{Hz}$).
- Implemented **Sobel Edge Handheld Device Detector** ($|\Delta\text{Lum}| > 50$) flagging smartphone usage in frame.
- Intercepted OS-level window minimize events with immediate auto-restore (<50ms) and focus loss tracking.

### Monorepo & Infrastructure Enhancements
- Configured unified **Bun Workspaces** (`web`, `desktop`, `mobile`, `packages/*`).
- Added parallel development runner `bun run dev:all` orchestrating Web, Spring Boot API, and AI Microservice.
- Integrated **Dolt MySQL** Git-versioned local SQL server (`bun run dev:dolt`) alongside PostgreSQL 17.
- Upgraded to 27 Flyway migrations managing 91+ tables and 60+ composite indexes.

---

## v1.1.0

### Fullscreen Lockdown Desktop Client
- Electron 43 kiosk-mode window with hardware-accelerated rendering and menu bar suppression.
- Secure `window.beyon` IPC bridge exposing system diagnostics, window locking, and auth tokens.
- Automated 8-step exam lifecycle with 10s countdown synchronization and 30s session heartbeats.

---

## v1.0.0-rc.1 (Release Candidate)

### Core Platform & Ecosystems
- Authentication & Authorization with 15-minute stateless JWT tokens, BCrypt hashing, and role guards (`STUDENT`, `COMPANY`, `INSTITUTION`, `ADMIN`).
- Multi-step onboarding for all user roles.
- Student Practice Arena, Question Bank, Coin Economy, and 109 Skills Taxonomy Matrix.
- Institution cohort management, placement drives, and department analytics.
- Company candidate intelligence, recruitment pipeline, assessment builder, and interview scorecards.
- Community social feed, discussion forums, direct messaging, and verified achievement credentials.
