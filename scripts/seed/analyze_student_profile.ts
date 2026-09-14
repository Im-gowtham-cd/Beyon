import mysql from 'mysql2/promise';

async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'beyon'
  });
  const studentId = '1853170b-89ad-41ec-b73d-14109608e84c';

  // 1. Overall stats
  const [totalAttempts] = await conn.query(
    'SELECT count(*) as total, sum(case when is_correct=1 then 1 else 0 end) as correct, round(avg(time_spent_seconds), 1) as avgTime FROM student_question_attempts WHERE student_id = ?',
    [studentId]
  );
  console.log('Overall Attempts Summary:');
  console.log(JSON.stringify(totalAttempts, null, 2));

  // 2. Skill breakdown
  const [skillBreakdown] = await conn.query(
    'SELECT s.name as skillName, s.category, count(a.id) as attempts, sum(case when a.is_correct=1 then 1 else 0 end) as correct, round(sum(case when a.is_correct=1 then 100.0 else 0.0 end)/count(a.id), 1) as accuracy, round(avg(a.time_spent_seconds), 1) as avgSeconds FROM student_question_attempts a JOIN questions q ON q.id = a.question_id JOIN skills s ON s.id = q.skill_id WHERE a.student_id = ? GROUP BY s.name, s.category ORDER BY accuracy ASC',
    [studentId]
  );
  console.log('Skill Breakdown:');
  console.log(JSON.stringify(skillBreakdown, null, 2));

  // 3. Difficulty breakdown
  const [diffBreakdown] = await conn.query(
    'SELECT q.difficulty, count(a.id) as attempts, sum(case when a.is_correct=1 then 1 else 0 end) as correct, round(sum(case when a.is_correct=1 then 100.0 else 0.0 end)/count(a.id), 1) as accuracy FROM student_question_attempts a JOIN questions q ON q.id = a.question_id WHERE a.student_id = ? GROUP BY q.difficulty ORDER BY accuracy ASC',
    [studentId]
  );
  console.log('Difficulty Breakdown:');
  console.log(JSON.stringify(diffBreakdown, null, 2));

  // 4. CSS specific questions
  const [cssQ] = await conn.query(
    'SELECT q.title, q.tags, a.is_correct, a.time_spent_seconds, a.created_at FROM student_question_attempts a JOIN questions q ON q.id = a.question_id JOIN skills s ON s.id = q.skill_id WHERE a.student_id = ? AND s.name = "CSS" ORDER BY a.created_at DESC LIMIT 15',
    [studentId]
  );
  console.log('Recent CSS Questions:');
  console.log(JSON.stringify(cssQ, null, 2));

  // 5. Registered profile skills
  const [profileSkills] = await conn.query(
    'SELECT skill_name, category, proficiency, score, questions_tested, questions_correct, verified, source, last_assessed_at FROM student_skills WHERE user_id = ?',
    [studentId]
  );
  console.log('Registered Profile Skills:');
  console.log(JSON.stringify(profileSkills, null, 2));

  // 6. Daily Challenges
  const [dailyChallenges] = await conn.query(
    'SELECT challenge_date, difficulty, xp_reward, status, is_correct, time_spent_seconds FROM daily_challenges WHERE student_id = ?',
    [studentId]
  );
  console.log('Daily Challenges:');
  console.log(JSON.stringify(dailyChallenges, null, 2));

  await conn.end();
}

main().catch(console.error);
