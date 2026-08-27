// ============================================================
// Beyon Seed — Appwrite Admin Client
// ============================================================

import type { SeedConfig } from "../config.js";

export interface AppwriteUser {
  $id: string;
  email: string;
  name: string;
}

let _client: any = null;
let _users: any = null;
let _sdk: any = null;

export async function initAppwrite(cfg: SeedConfig): Promise<boolean> {
  if (cfg.options.skipAppwrite) {
    console.log("  ℹ️  Appwrite: SKIPPED (no API key or SKIP_APPWRITE=true)");
    return false;
  }
  try {
    const sdk = await import("node-appwrite");
    _sdk = sdk;
    _client = new sdk.Client()
      .setEndpoint(cfg.appwrite.endpoint)
      .setProject(cfg.appwrite.projectId)
      .setKey(cfg.appwrite.apiKey);
    _users = new sdk.Users(_client);
    // Test connectivity
    await _users.list([], 1);
    console.log("  ✅ Appwrite connected");
    return true;
  } catch (err: any) {
    console.warn(`  ⚠️  Appwrite connection failed: ${err.message}`);
    console.warn("     Seed will continue with Dolt-only mode.");
    _client = null;
    _users = null;
    return false;
  }
}

/**
 * Create an Appwrite user, idempotent (skip if already exists).
 * Returns the Appwrite user ID.
 */
export async function createAppwriteUser(
  id: string,
  email: string,
  password: string,
  name: string
): Promise<string | null> {
  if (!_users) return null;
  try {
    const user = await _users.create(id, email, undefined, password, name);
    return user.$id;
  } catch (err: any) {
    // 409 = user already exists
    if (err?.code === 409 || err?.message?.includes("already")) {
      // Fetch existing
      try {
        const existing = await _users.get(id);
        return existing.$id;
      } catch {
        return id;
      }
    }
    console.warn(`  ⚠️  Appwrite user creation failed for ${email}: ${err.message}`);
    return null;
  }
}

/**
 * Update Appwrite user email verification status.
 */
export async function verifyAppwriteUser(userId: string): Promise<void> {
  if (!_users) return;
  try {
    await _users.updateEmailVerification(userId, true);
  } catch {
    // Non-critical
  }
}

export function isAppwriteConnected(): boolean {
  return _users !== null;
}
