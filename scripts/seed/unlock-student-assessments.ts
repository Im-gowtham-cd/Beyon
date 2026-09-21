import mysql from 'mysql2/promise';
import crypto from 'crypto';

async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'beyon'
  });

  const [users]: any = await conn.query('SELECT id, email FROM users WHERE email = "gowthamcd.23cse@kongu.edu"');
  const user = users[0];
  console.log('Gowtham User ID:', user.id);

  // 1. Get all skills and topics
  const [skills]: any = await conn.query('SELECT id, name, slug FROM skills');
  console.log(`Found ${skills.length} taxonomy skills.`);

  const [topics]: any = await conn.query('SELECT id, skill_id, name, slug FROM skill_topics');
  console.log(`Found ${topics.length} taxonomy topics.`);

  // 2. Mark topics for verified skills (Java, React, TypeScript, Spring Boot, Python, HTML, CSS, PostgreSQL) as COMPLETED
  const targetSkillSlugs = ['java', 'spring-boot', 'react', 'typescript', 'python', 'html', 'css', 'postgresql', 'javascript'];
  const targetSkills = skills.filter((s: any) => targetSkillSlugs.includes(s.slug) || targetSkillSlugs.includes(s.name.toLowerCase()));
  const targetSkillIds = new Set(targetSkills.map((s: any) => s.id));

  let insertedTopics = 0;
  for (const t of topics) {
    if (targetSkillIds.has(t.skill_id)) {
      const [existing]: any = await conn.query(
        'SELECT id FROM student_learning_topics WHERE student_id = ? AND topic_id = ?',
        [user.id, t.id]
      );
      if (existing.length === 0) {
        await conn.query(
          'INSERT INTO student_learning_topics (id, student_id, topic_id, status, started_at, updated_at) VALUES (?, ?, ?, "COMPLETED", NOW(), NOW())',
          [crypto.randomUUID(), user.id, t.id]
        );
        insertedTopics++;
      } else {
        await conn.query(
          'UPDATE student_learning_topics SET status = "COMPLETED", updated_at = NOW() WHERE student_id = ? AND topic_id = ?',
          [user.id, t.id]
        );
      }
    }
  }
  console.log(`Successfully synced/marked ${insertedTopics} learning topics as COMPLETED for Gowtham.`);

  // Also sync for demo students
  const [demoStudents]: any = await conn.query('SELECT id, email FROM users WHERE role = "STUDENT"');
  for (const s of demoStudents) {
    for (const t of topics) {
      if (targetSkillIds.has(t.skill_id)) {
        const [existing]: any = await conn.query(
          'SELECT id FROM student_learning_topics WHERE student_id = ? AND topic_id = ?',
          [s.id, t.id]
        );
        if (existing.length === 0) {
          await conn.query(
            'INSERT INTO student_learning_topics (id, student_id, topic_id, status, started_at, updated_at) VALUES (?, ?, ?, "COMPLETED", NOW(), NOW())',
            [crypto.randomUUID(), s.id, t.id]
          );
        }
      }
    }
  }
  console.log(`Synced learning topics across ${demoStudents.length} student accounts.`);

  await conn.end();
  console.log('Done!');
}

main().catch(console.error);
