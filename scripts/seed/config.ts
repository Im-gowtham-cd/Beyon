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
    skipAppwrite: boolean; // for offline testing
  };
  appwrite: {
    endpoint: string;
    projectId: string;
    apiKey: string;
  };
}

export function loadConfig(overrides: Partial<SeedConfig["counts"]> = {}): SeedConfig {
  // Read Appwrite config from backend application.yml via env vars
  const appwriteEndpoint =
    process.env.APPWRITE_ENDPOINT || "https://sgp.cloud.appwrite.io/v1";
  const appwriteProjectId =
    process.env.APPWRITE_PROJECT_ID || "6a8f0bbf00106d9d9dc0";
  const appwriteDatabaseId =
    process.env.APPWRITE_DATABASE_ID || "6a8f0bbf00106d9d9dc0";
  const appwriteApiKey = process.env.APPWRITE_API_KEY || "";

  return {
    seed: 20260826,
    environment:
      process.env.SPRING_PROFILES_ACTIVE ||
      process.env.NODE_ENV ||
      "development",
    counts: {
      students: overrides.students ?? 50,
      institutions: overrides.institutions ?? 25,
      companies: overrides.companies ?? 30,
      questions: overrides.questions ?? 300,
      assessments: overrides.assessments ?? 10,
      jobs: overrides.jobs ?? 30,
      applications: overrides.applications ?? 200,
      notifications: overrides.notifications ?? 500,
      posts: overrides.posts ?? 50,
    },
    options: {
      createAssessments: true,
      createRecruitment: true,
      createCommunity: true,
      skipAppwrite: !appwriteApiKey || process.env.SKIP_APPWRITE === "true",
    },
    appwrite: {
      endpoint: appwriteEndpoint,
      projectId: appwriteProjectId,
      apiKey: appwriteApiKey,
    },
  };
}
