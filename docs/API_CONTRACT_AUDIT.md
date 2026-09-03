# Beyon — API Contract & DTO Audit

**Document Version:** 1.0.0  
**Audit Date:** September 3, 2026  
**Auditor:** Senior Backend Integration & API Architect  
**Scope:** Frontend API Clients, Spring Boot Controller Mappings, Request/Response DTO Alignment, and Network Contract Bugs.

---

## 1. Route Collisions in Backend Controllers

> [!CRITICAL]
> **Duplicate Route Collision on `/api/v1/evaluation`:**
> 1. [`com.beyon.assessment.controller.EvaluationController`](file:///d:/SIH/26044/backend/src/main/java/com/beyon/assessment/controller/EvaluationController.java#L13):
>    - `@RequestMapping("/api/v1/evaluation")`
>    - Declares `POST /evaluate`, `GET /session/{sessionId}`, `GET /student/{studentId}`.
> 2. [`com.beyon.intelligence.controller.EvaluationController`](file:///d:/SIH/26044/backend/src/main/java/com/beyon/intelligence/controller/EvaluationController.java#L11):
>    - `@RequestMapping("/api/v1/evaluation")`
>    - Declares `POST /session/{sessionId}/evaluate`, `POST /skill-intelligence/update`.
>
> **Impact:** Ambiguous Spring MVC handler mapping leading to routing conflicts and unpredictable HTTP 404/500 responses depending on bean registration order.
> **Fix:** Re-map `com.beyon.intelligence.controller.EvaluationController` to `@RequestMapping("/api/v1/intelligence/evaluation")`.

---

## 2. Missing & Broken Endpoints (Frontend 404s)

| Frontend Calling File | API Call Made | Backend Controller & Route Status | Failure Mode | Resolution |
|---|---|---|---|---|
| [`CandidateDiscoveryPage.tsx:33`](file:///d:/SIH/26044/web/src/recruitment/pages/CandidateDiscoveryPage.tsx#L33) | `fetch('/api/v1/recruitment/applications')` | **DOES NOT EXIST**. Backend routes are `/api/v1/recruitment/opportunity/{id}/applications` and `/api/v1/candidates/drive/{id}/shortlist`. | HTTP 404 Not Found. Sets `candidates = []`. | Add `GET /api/v1/recruitment/applications` in `RecruitmentController` or bind to candidate discovery service. |
| [`AssessmentBuilderPage.tsx:99`](file:///d:/SIH/26044/web/src/assessment/pages/AssessmentBuilderPage.tsx#L99) | `api.get('/assessment-builder/assessments')` | Controller exists at `/api/v1/assessment-builder/assessments`, but requires authentication and returns `[]` when no assessments exist. | HTTP 200 with empty array triggers mock fallback. | Ensure assessment configurations are seeded or created via company opportunities. |
| [`AssessmentPage.tsx:115`](file:///d:/SIH/26044/web/src/assessment/pages/AssessmentPage.tsx#L115) | `beyon://launch?token={test.id}` | Custom protocol `beyon://` is **never registered** in Electron `main.ts`. | Browser prompts "No application found" or silently fails. | Register `app.setAsDefaultProtocolClient('beyon')` in Electron and pass valid session launch token. |

---

## 3. The Double `.data` Response Unwrapping Bug

### Root Cause
In [`web/src/services/api/client.ts:33-34`](file:///d:/SIH/26044/web/src/services/api/client.ts#L33-L34):
```typescript
const json = await response.json();
return json.data !== undefined ? json.data : json;
```
The client wrapper automatically unwraps the Spring Boot `ApiResponse<T>`:
```json
{
  "success": true,
  "data": [ { "id": "..." } ],
  "timestamp": "..."
}
```
The caller receives the unwrapped array `[ { "id": "..." } ]`.

### Defective Call Sites
Multiple components mistakenly treat the returned promise as an Axios-like object and call `.data`:
1. **`InstitutionStudentsPage.tsx` (L51-52):**
   ```typescript
   setPendingStudents((pendingRes as any)?.data || []); // Evaluates to undefined -> []
   setAllStudents((allRes as any)?.data || []);          // Evaluates to undefined -> []
   ```
2. **`InstitutionHome.tsx` (L51-54):**
   ```typescript
   setStudents((studentsRes as any)?.data || []);        // Evaluates to undefined -> []
   setPendingStudents((pendingRes as any)?.data || []);  // Evaluates to undefined -> []
   setDrives((drivesRes as any)?.data || []);            // Evaluates to undefined -> []
   ```
3. **`AdminFeedbackPage.tsx` (L30):**
   ```typescript
   setReports(res.data || []);                           // Evaluates to undefined -> []
   ```
**Consequence:** Tables in these pages are **permanently empty `[]`** even though the backend returns rich valid data.

---

## 4. Assessment Submission Contract Mismatch

### Desktop Client Payload vs Backend Expectation
* **Desktop Client (`AssessmentApp.tsx:742`):**
  Sends `POST /api/v1/assessment/session/{sessionId}/submit` with payload:
  ```json
  {
    "answers": {
      "q-1": { "optionId": "opt-a", "marked": false },
      "q-2": { "optionId": "opt-c", "marked": false }
    }
  }
  ```
* **Backend Controller (`AssessmentController.java:130`):**
  ```java
  @PostMapping("/session/{sessionId}/submit")
  public ResponseEntity<?> submitAssessment(@PathVariable UUID sessionId)
  ```
  The backend accepts **no request body**. It reads strictly from `assessment_answers` in the database. Because the Desktop app only stored answers in component state and never called `POST /session/{sessionId}/answer`, the database table contains 0 rows.
* **Resolution:**
  Update `AssessmentController.submitAssessment` to optionally accept an answers payload in the request body and save them before calculating score, or update the desktop client to autosave each answer via `POST /session/{sessionId}/answer`.
