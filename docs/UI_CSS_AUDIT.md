# Beyon — UI & CSS Architecture Audit

**Document Version:** 1.0.0  
**Audit Date:** September 3, 2026  
**Auditor:** Senior UI/UX & Frontend Integration Engineer  
**Scope:** Design System Tokens, CSS Architecture, Component Styling Mismatches, and UI State Deficiencies.

---

## 1. Design System Tokens & Brand Standards

The Beyon design system is codified in [`src/styles/variables.css`](file:///d:/SIH/26044/web/src/styles/variables.css) and [`src/styles/global.css`](file:///d:/SIH/26044/web/src/styles/global.css).

### A. Canonical Design Tokens

```css
:root {
  /* ── Core Brand Palette ── */
  --color-primary: #1c2d81;         /* Deep Corporate Navy */
  --color-primary-rgb: 28, 45, 129;
  --color-primary-dark: #121e5c;
  --color-primary-light: #253cac;
  --color-primary-hover: #16246e;
  --color-primary-subtle: #eff6ff;

  --color-accent: #fed601;          /* High-Voltage Enterprise Gold */
  --color-accent-rgb: 254, 214, 1;
  --color-accent-dark: #b45309;
  --color-accent-light: #fef08a;

  /* ── Background & Surfaces ── */
  --color-background: #f4f6fb;      /* Crisp Light Ice / Slate */
  --color-surface: #ffffff;         /* Pure Optical White */
  --color-surface-2: #f8fafc;
  --color-surface-3: #f1f5f9;

  /* ── Text Contrast Stack ── */
  --text-primary: #020617;          /* High-Contrast Charcoal Navy */
  --text-secondary: #1e293b;
  --text-muted: #334155;

  /* ── Architectural Sharp-Edge Geometry ── */
  --radius-xs: 0px;
  --radius-sm: 0px;
  --radius-md: 0px;
  --radius-lg: 0px;
  --radius-xl: 0px;
  --radius-full: 0px;

  /* ── Typography Stack ── */
  --font-body: 'ClashDisplay', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-heading: 'ClashDisplay', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

---

## 2. Identified CSS Defects & Architecture Smells

### A. Cross-Domain CSS Module Borrowing
Multiple pages lack a dedicated CSS module and instead import styles from unrelated domains:

1. **Borrowing `AssessmentBuilderPage.module.css`:**
   - [`src/pages/institution/InstitutionDrivesPage.tsx`](file:///d:/SIH/26044/web/src/pages/institution/InstitutionDrivesPage.tsx#L9)
   - [`src/pages/institution/InstitutionPlacementsPage.tsx`](file:///d:/SIH/26044/web/src/pages/institution/InstitutionPlacementsPage.tsx#L7)
   - [`src/recruitment/pages/CandidateDiscoveryPage.tsx`](file:///d:/SIH/26044/web/src/recruitment/pages/CandidateDiscoveryPage.tsx#L8)
   - [`src/recruitment/pages/PipelinePage.tsx`](file:///d:/SIH/26044/web/src/recruitment/pages/PipelinePage.tsx#L6)
   - [`src/assessment/pages/CompanyAssessmentsPage.tsx`](file:///d:/SIH/26044/web/src/assessment/pages/CompanyAssessmentsPage.tsx#L5)
   - [`src/intelligence/pages/CandidateIntelligencePage.tsx`](file:///d:/SIH/26044/web/src/intelligence/pages/CandidateIntelligencePage.tsx#L3)
   - [`src/intelligence/pages/InterviewManagementPage.tsx`](file:///d:/SIH/26044/web/src/intelligence/pages/InterviewManagementPage.tsx#L7)
   - [`src/intelligence/pages/CompanyAnalyticsPage.tsx`](file:///d:/SIH/26044/web/src/intelligence/pages/CompanyAnalyticsPage.tsx#L7)
   - [`src/intelligence/pages/InstitutionAnalyticsPage.tsx`](file:///d:/SIH/26044/web/src/intelligence/pages/InstitutionAnalyticsPage.tsx#L7)
   *Consequence:* If `AssessmentBuilderPage.module.css` is edited or refactored, the styling of 9 other mission-critical pages across Recruiter and Institution portals breaks unexpectedly.

2. **Borrowing `Gamification.module.css`:**
   - [`src/intelligence/pages/CertificatePage.tsx`](file:///d:/SIH/26044/web/src/intelligence/pages/CertificatePage.tsx#L4)
   - [`src/intelligence/pages/GrowthIntelligencePage.tsx`](file:///d:/SIH/26044/web/src/intelligence/pages/GrowthIntelligencePage.tsx#L4)
   - [`src/intelligence/pages/LearningProgramsPage.tsx`](file:///d:/SIH/26044/web/src/intelligence/pages/LearningProgramsPage.tsx#L4)
   - [`src/intelligence/pages/PersonalizedFeedPage.tsx`](file:///d:/SIH/26044/web/src/intelligence/pages/PersonalizedFeedPage.tsx#L4)

### B. Hardcoded Inline Hex Styles
Pages borrowing external CSS compensate by applying heavy inline style objects with hardcoded hex codes (`#1c2d81`, `#0f172a`, `#fed601`, `#ffffff`) rather than using CSS variables. This creates visual inconsistency across different screen resolutions and dark mode transitions.

### C. Missing Empty, Loading, and Error States
1. **Empty State Failures:**
   - `CandidateDiscoveryPage.tsx`: When `candidates` is empty, renders an empty `<div>` with zero feedback.
   - `AdminEconomyPage.tsx`: When transaction arrays are empty, renders an empty `<tbody>` with no row placeholder.
   - `ReportsPage.tsx`: Completely hides the reports card when the list is empty.
2. **Double `.data` Unwrapping Crash in Tables:**
   - `InstitutionStudentsPage.tsx` and `InstitutionHome.tsx` access `(res as any)?.data` on already-unwrapped arrays, resulting in `undefined` and forcing tables into a permanent empty state.

---

## 3. Corrective Plan

1. **Fix Client-Side Data Unwrapping:** Eliminate `?.data` accesses in `InstitutionStudentsPage.tsx`, `InstitutionHome.tsx`, and `AdminFeedbackPage.tsx`.
2. **Dedicated CSS Modules:** Create dedicated, clean CSS modules for `PipelinePage`, `CandidateDiscoveryPage`, `InstitutionDrivesPage`, and `InstitutionPlacementsPage`.
3. **Enforce Design Tokens:** Replace all hardcoded inline hex values with CSS variables (`var(--color-primary)`, `var(--color-accent)`, `var(--color-surface)`, `var(--text-primary)`).
4. **Standard Empty State Component:** Implement a unified `<EmptyState icon={...} title="..." description="..." actionLabel="..." onAction={...} />` component across all tables and lists.
