// ============================================================
// Module 01 — Skill Taxonomy Seeder
// ============================================================

import { doltBatch, doltExec, esc, doltQuery, toUUID } from "../engine/dolt.js";
import { SKILL_CATEGORIES, SKILLS, SKILL_TOPICS } from "../data/skills.js";

// id map: key -> dolt UUID
export const skillCategoryIds: Record<string, string> = {};
export const skillIds: Record<string, string> = {};
export const skillTopicIds: Record<string, string> = {};

export async function seedSkills(): Promise<void> {
  console.log("\n📚 Seeding skill taxonomy...");

  // ─── Categories ───
  const catStmts: string[] = [];
  for (let i = 0; i < SKILL_CATEGORIES.length; i++) {
    const cat = SKILL_CATEGORIES[i];
    const id = toUUID(`beyon-cat-${cat.key.toLowerCase()}`);
    skillCategoryIds[cat.key] = id;
    const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    catStmts.push(
      `INSERT IGNORE INTO skill_categories (id, name, slug, description, display_order, is_active, created_at)
       VALUES (${esc(id)}, ${esc(cat.name)}, ${esc(slug)}, ${esc(`${cat.name} skills and technologies`)}, ${i + 1}, 1, NOW());`
    );
  }
  doltBatch(catStmts);
  console.log(`  ✅ ${catStmts.length} categories`);

  // ─── Skills ───
  const skillStmts: string[] = [];
  for (const sk of SKILLS) {
    const id = toUUID(`beyon-skill-${sk.key.toLowerCase()}`);
    skillIds[sk.key] = id;
    skillStmts.push(
      `INSERT IGNORE INTO skills (id, name, slug, category_id, description, is_active, created_at)
       VALUES (${esc(id)}, ${esc(sk.name)}, ${esc(sk.slug)}, ${esc(skillCategoryIds[sk.categoryKey] ?? null)}, ${esc(`${sk.name} programming and development`)}, 1, NOW());`
    );
  }
  doltBatch(skillStmts);
  console.log(`  ✅ ${skillStmts.length} skills`);

  // ─── Topics ───
  const topicStmts: string[] = [];
  for (let i = 0; i < SKILL_TOPICS.length; i++) {
    const topic = SKILL_TOPICS[i];
    const id = toUUID(`beyon-topic-${topic.key.toLowerCase()}`);
    skillTopicIds[topic.key] = id;
    const skillId = skillIds[topic.skillKey] ?? null;
    const slug = topic.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    topicStmts.push(
      `INSERT IGNORE INTO skill_topics (id, skill_id, name, slug, description, display_order, is_active, created_at, updated_at)
       VALUES (${esc(id)}, ${esc(skillId)}, ${esc(topic.name)}, ${esc(slug)}, ${esc(`${topic.name} — study topic`)}, ${i + 1}, 1, NOW(), NOW());`
    );
  }
  doltBatch(topicStmts);
  console.log(`  ✅ ${topicStmts.length} topics`);

  console.log("  ✅ Skill taxonomy seeded");
}
