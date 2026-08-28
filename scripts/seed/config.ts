// ============================================================
// Beyon Seed System — Configuration & Environment Guard
// ============================================================

import { execSync } from "child_process";
import * as path from "path";
import * as fs from "fs";

// ─── Environment Guard ────────────────────────────────────────
const FORBIDDEN_ENVS = ["production", "prod", "live"];

export function assertNotProduction(forceOverride = false): void {
  const env =
    process.env.SPRING_PROFILES_ACTIVE ||
    process.env.NODE_ENV ||
    process.env.APP_ENV ||
    process.env.ENVIRONMENT ||
    "development";

  const lower = env.toLowerCase().trim();
  if (FORBIDDEN_ENVS.includes(lower)) {
    if (forceOverride) {
      console.warn(
        "\n⚠️  WARNING: --force-production flag detected. Running seed on PRODUCTION is dangerous!\n"
      );
      return;
    }
    console.error(
      `\n❌  ERROR: Seed operations are disabled in production.\n` +
        `   Detected environment: "${env}"\n` +
        `   Use --force-production to override (not recommended).\n`
    );
    process.exit(1);
  }
}

// ─── Paths ────────────────────────────────────────────────────
export const DOLT_DB_DIR = path.resolve(
  path.join(process.cwd(), "..", "..", "beyon")
);
export const DOCS_DIR = path.resolve(
  path.join(process.cwd(), "..", "..", "docs")
);

// ─── Seed Configuration ───────────────────────────────────────
export interface SeedConfig {
  seed: number;          // PRNG seed for determinism
  environment: string;
  counts: {
    students: number;
    institutions: number;
    companies: number;
    questions: number;
    assessments: number;
    jobs: number;
    applications: number;
    notifications: number;
    posts: number;
  };
  options: {
    createAssessments: boolean;
    createRecruitment: boolean;
    createCommunity: boolean;
  };
}

export function loadConfig(overrides: Partial<SeedConfig["counts"]> = {}): SeedConfig {
  return {
    seed: 20260826,
    environment:
      process.env.SPRING_PROFILES_ACTIVE ||
      process.env.NODE_ENV ||
      "development",
    counts: {
      students: overrides.students ?? 110,
      institutions: overrides.institutions ?? 25,
      companies: overrides.companies ?? 30,
      questions: overrides.questions ?? 300,
      assessments: overrides.assessments ?? 15,
      jobs: overrides.jobs ?? 35,
      applications: overrides.applications ?? 300,
      notifications: overrides.notifications ?? 750,
      posts: overrides.posts ?? 60,
    },
    options: {
      createAssessments: true,
      createRecruitment: true,
      createCommunity: true,
    },
  };
}
