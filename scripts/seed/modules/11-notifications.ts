import { doltBatch, esc, doltQuery } from "../engine/dolt.js";
import { studentUserIds } from "./04-users.js";
import { SeededRandom } from "../utils/faker.js";
import type { SeedConfig } from "../config.js";

async function ensureStudentIds(): Promise<void> {
  if (studentUserIds.length === 0) {
    const srows = doltQuery("SELECT id FROM users WHERE role='STUDENT' AND email LIKE '%beyon.test'");
    for (const r of srows) studentUserIds.push(r.id);
  }
}

const NOTIFICATION_TEMPLATES = [
  { type: "RECRUITMENT", title: "New Opportunity Available", message: "A new job opportunity matching your profile has been posted. Apply now!" },
  { type: "ASSESSMENT", title: "Assessment Invitation", message: "You have been invited to take a company assessment. Click to start." },
  { type: "APPLICATION", title: "Application Status Updated", message: "Your application status has been updated. Check your application dashboard." },
  { type: "COIN", title: "Coins Earned!", message: "Congratulations! You earned 50 Beyon coins for completing today's challenge." },
  { type: "ACHIEVEMENT", title: "Achievement Unlocked", message: "You've unlocked the '7-Day Streak' achievement. Keep it up!" },
  { type: "CHALLENGE", title: "Daily Challenge Available", message: "Today's daily challenge is live. Solve it to earn coins and XP!" },
  { type: "SYSTEM", title: "Profile Completion Reminder", message: "Complete your profile to increase visibility to recruiters." },
  { type: "ASSESSMENT", title: "Assessment Result Ready", message: "Your assessment result is now available. View your score." },
  { type: "RECRUITMENT", title: "Shortlisted!", message: "Great news! You have been shortlisted for the next round." },
  { type: "APPLICATION", title: "Application Received", message: "Your application has been received. We will review it soon." },
];

export async function seedNotifications(cfg: SeedConfig): Promise<void> {
  console.log("\n🔔 Seeding notifications...");

  await ensureStudentIds();

  const rng = new SeededRandom(cfg.seed + 7000);
  const stmts: string[] = [];
  let count = 0;

  for (const userId of studentUserIds) {
    const notifCount = rng.int(3, Math.min(20, cfg.counts.notifications / studentUserIds.length + 5));
    for (let i = 0; i < notifCount && count < cfg.counts.notifications; i++) {
      const tmpl = rng.pick(NOTIFICATION_TEMPLATES);
      const isRead = rng.bool(0.6);
      const id = `beyon-notif-${count}`;
      stmts.push(
        `INSERT IGNORE INTO notifications
          (id, user_id, title, message, notification_type, is_read, channel, created_at)
         VALUES (
           ${esc(id)}, ${esc(userId)}, ${esc(tmpl.title)}, ${esc(tmpl.message)},
           ${esc(tmpl.type)}, ${isRead ? 1 : 0}, 'IN_APP', NOW()
         );`
      );
      count++;
    }
  }

  doltBatch(stmts, 200);
  console.log(`  ✅ ${count} notifications`);
}
