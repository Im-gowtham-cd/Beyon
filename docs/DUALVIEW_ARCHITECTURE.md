# BEYON DUALVIEW AI PROCTORING — ARCHITECTURE

## 1. System Overview

The DualView AI Proctoring system integrates two camera streams (laptop + mobile), audio from both devices, AI-powered detection, cross-camera correlation, risk scoring, incident creation, evidence capture, and a recruiter review dashboard — all layered on top of the existing Beyon assessment infrastructure.

## 2. Component Architecture

### 2.1 Existing Infrastructure (REUSE & EXTEND)

| Component | Technology | Location | Status |
|-----------|-----------|----------|--------|
| Assessment Shell | Electron 43 | desktop/ | EXISTS |
| Desktop Renderer | React 19 + TypeScript | desktop/src/renderer/ | EXISTS |
| Camera/Mic Access | Browser getUserMedia | AssessmentApp.tsx | EXISTS |
| Pixel-based CV | Canvas + JS | AssessmentApp.tsx | EXISTS (basic) |
| Proctoring Events | ProctoringEvent entity | assessment/model/ | EXISTS |
| ProctoringController | Spring Boot | assessment/controller/ | EXISTS |
| ProctoringService | Spring Boot | assessment/service/ | EXISTS |
| AssessmentPolicy | Spring Boot | assessment/model/ | EXISTS |
| Assessment Session | Spring Boot | assessment/service/ | EXISTS |
| Redis | Lettuce / StringRedisTemplate | config/RedisConfig.java | EXISTS |
| MongoDB | Spring Data MongoDB | application.yml | CONFIGURED |
| AI Service | FastAPI / Python | ai-service/ | SKELETON |
| Mobile App | React Native | mobile/ | EXISTS (general) |
| Web Frontend | React 19 + Vite | web/ | EXISTS |

### 2.2 New DualView Components (BUILD)

| Component | Technology | Layer | Priority |
|-----------|-----------|-------|----------|
| Mobile Proctoring PWA | React + Vite | Frontend | Phase 1 |
| QR Pairing API | Spring Boot | Backend | Phase 1 |
| Pairing Token Store | Redis | Infrastructure | Phase 1 |
| SSE Real-time | Spring Boot SseEmitter | Backend | Phase 2 |
| Face/Gaze Detector | MediaPipe FaceMesh (WASM) | Desktop | Phase 2 |
| Person/Object Detector | FastAPI + YOLOv8-nano | AI Service | Phase 3 |
| Audio Event Detector | FastAPI + librosa/webrtcvad | AI Service | Phase 4 |
| DualView Correlation Engine | Spring Boot Service | Backend | Phase 5 |
| Risk Scoring Engine | Spring Boot Service | Backend | Phase 5 |
| Proctoring Incident Model | JPA Entity + Dolt | Database | Phase 5 |
| Evidence Storage | Local filesystem | Infrastructure | Phase 6 |
| Recruiter Review Dashboard | React + TypeScript | Web Frontend | Phase 7 |

## 3. Technology Stack

- Desktop: Electron 43, React 19, TypeScript, MediaPipe FaceMesh (WASM in browser)
- Mobile proctoring: React PWA served from web (separate route /proctor)
- AI Service: FastAPI + Python 3.11, YOLOv8-nano, librosa, webrtcvad
- Backend: Spring Boot 3 / Java 21 (extend existing)
- Database business state: Dolt MySQL (extend existing)
- Database telemetry: MongoDB (extend existing)
- Transient state / pairing: Redis via Lettuce (extend existing)
- Real-time: Spring Boot SseEmitter (SSE)
- Evidence storage: Appwrite Storage or local filesystem

## 4. Database Schema Extensions

### 4.1 Dolt SQL — New Tables

proctoring_sessions: proctoring session linked to assessment_session, tracks mobile pairing status, risk score, risk level, review flags
proctoring_devices: laptop + mobile device registration, pairing token lifecycle, heartbeat
proctoring_incidents: multi-signal correlated incidents (NOT individual detections), with type, severity, confidence, risk_contribution, question context, sources
proctoring_evidence: secure frame/audio evidence linked to incidents, with storage URLs and expiring access
proctoring_risk_scores: append-only audit of risk score changes with decay support
proctoring_policy_config: per-opportunity configurable risk weights and thresholds

### 4.2 MongoDB — New Collections

proctor_raw_events: high-volume raw detection events (GAZE_RIGHT, FACE_MISSING, SECOND_PERSON, etc.) with timestamp, confidence, source device, question context
proctor_camera_health: periodic camera health snapshots

## 5. Redis Key Schema

proctor:pair:{token} => JSON{sessionId, candidateId} TTL 300s (single-use pairing token)
proctor:session:{id}:state => JSON{mobileConnected, riskScore, riskLevel} TTL session lifetime
proctor:device:{id}:mobile => JSON{heartbeat, cameraActive, micActive} TTL 90s (renew on heartbeat)
proctor:risk:{id}:events => Redis List of risk contributions TTL 120s (for decay calculation)
proctor:sse:{id}:desktop => "connected" TTL 90s
proctor:sse:{id}:mobile => "connected" TTL 90s

## 6. AI Service Architecture

Extend existing FastAPI skeleton at ai-service/app/main.py:

Endpoints:
- POST /analyze/laptop-frame — base64 JPEG → face presence, head pose, gaze direction events
- POST /analyze/mobile-frame — base64 JPEG → person count, object detection (phone/tablet/laptop/book)
- POST /analyze/audio-chunk — base64 WAV → voice activity, second voice suspected, conversation

Models:
- Face/gaze: MediaPipe FaceMesh (runs in Electron renderer via WASM — no backend roundtrip per frame)
- Person/object: YOLOv8-nano (Python AI service — only mobile frames + sampled laptop frames)
- Audio: webrtcvad + librosa (Python AI service)

Key design: Desktop does per-frame face/gaze locally. Only aggregated events + sampled high-risk frames go to backend.

## 7. Real-Time Communication

SSE (Server-Sent Events) — Spring Boot SseEmitter

Endpoint: GET /api/v1/proctoring/dualview/stream/{procSessionId}?token={jwt}

Events pushed to desktop:
- MOBILE_CONNECTED / MOBILE_DISCONNECTED
- CAMERA_ACTIVE / CAMERA_INACTIVE
- RISK_LEVEL_CHANGED {level, score}
- INCIDENT_CREATED {incidentId, type, severity}
- PROCTORING_WARNING {message}

## 8. Security

- Pairing tokens: short-lived (5 min), single-use, Redis-stored, session-bound
- SSE: JWT required, validated on subscription
- Evidence access: server-side auth check + short-lived signed URLs
- IDOR: existing IdorProtectionFilter + ownership checks on all proctoring APIs
- Evidence encryption: AES-256 for stored frames
- Consent: explicit candidate consent recorded before proctoring starts
- Audit: all reviewer actions persisted to audit_events

## 9. Implementation Phases

Phase 1 — Foundation: DB migration, proctoring session models, pairing API, Redis state
Phase 2 — Desktop Integration: DualView setup flow in AssessmentApp.tsx, SSE client, MediaPipe gaze
Phase 3 — Mobile PWA: Mobile proctoring web app (QR scan, camera/mic, heartbeat)
Phase 4 — AI Service: FastAPI face/gaze, person/object, audio detection
Phase 5 — Correlation Engine: multi-signal correlator + configurable risk scoring
Phase 6 — Incident & Evidence: persistence, evidence capture, storage
Phase 7 — Recruiter Dashboard: web review UI, incident timeline, evidence viewer
Phase 8 — Security & Privacy: consent, retention, audit, access control
Phase 9 — Testing: end-to-end golden scenario, failure scenarios, performance
