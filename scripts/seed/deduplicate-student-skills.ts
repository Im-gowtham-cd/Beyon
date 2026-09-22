import mysql from 'mysql2/promise';

async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'beyon'
  });

  console.log('Connected to Dolt DB. Deduplicating student_skills records...');

  // Get all users with duplicate skills
  const [dupeGroups]: any = await conn.query(`
    SELECT user_id, LOWER(skill_name) as skill_clean
    FROM student_skills
    GROUP BY user_id, LOWER(skill_name)
    HAVING COUNT(*) > 1
  `);

  console.log(`Found ${dupeGroups.length} duplicate skill groups.`);

  for (const group of dupeGroups) {
    const [rows]: any = await conn.query(
      `SELECT * FROM student_skills WHERE user_id = ? AND LOWER(skill_name) = ? ORDER BY verified DESC, score DESC, questions_tested DESC`,
      [group.user_id, group.skill_clean]
    );

    if (rows.length <= 1) continue;

    const primary = rows[0];
    const secondaryList = rows.slice(1);

    // Merge best values
    let bestScore = Number(primary.score || 0);
    let bestVerified = primary.verified === 1 || primary.verified === true;
    let bestTested = primary.questions_tested || 0;
    let bestCorrect = primary.questions_correct || 0;
    let bestProficiency = primary.proficiency || 'INTERMEDIATE';
    let bestCategory = primary.category || 'Technical';
    let canonicalName = primary.skill_name;

    for (const sec of secondaryList) {
      const sScore = Number(sec.score || 0);
      if (sScore > bestScore) bestScore = sScore;
      if (sec.verified === 1 || sec.verified === true) bestVerified = true;
      if ((sec.questions_tested || 0) > bestTested) {
        bestTested = sec.questions_tested;
      }
      if ((sec.questions_correct || 0) > bestCorrect) {
        bestCorrect = sec.questions_correct;
      }
      if (sec.proficiency === 'ADVANCED' || (sec.proficiency === 'INTERMEDIATE' && bestProficiency === 'BEGINNER')) {
        bestProficiency = sec.proficiency;
      }
      if (sec.category && (!bestCategory || bestCategory === 'Technical')) {
        bestCategory = sec.category;
      }
      // Delete the secondary duplicate row
      await conn.query('DELETE FROM student_skills WHERE id = ?', [sec.id]);
    }

    // Recalculate questions_correct based on bestScore and bestTested if tested was 0
    if (bestTested === 0) {
      bestTested = 10;
      bestCorrect = Math.round((bestScore / 100) * 10);
    } else if (bestCorrect === 0 && bestScore > 0) {
      bestCorrect = Math.round((bestScore / 100) * bestTested);
    }

    // Update the single canonical record
    await conn.query(`
      UPDATE student_skills
      SET skill_name = ?,
          category = ?,
          score = ?,
          verified = ?,
          proficiency = ?,
          questions_tested = ?,
          questions_correct = ?,
          source = 'ASSESSMENT_VERIFIED',
          updated_at = NOW()
      WHERE id = ?
    `, [canonicalName, bestCategory, bestScore, bestVerified ? 1 : 0, bestProficiency, bestTested, bestCorrect, primary.id]);

    console.log(`Merged ${canonicalName} for user ${group.user_id}: Score=${bestScore}%, Verified=${bestVerified}, Questions=${bestCorrect}/${bestTested}`);
  }

  // Verify Gowtham's cleaned records
  const [users]: any = await conn.query('SELECT id FROM users WHERE email = "gowthamcd.23cse@kongu.edu"');
  const user = users[0];
  const [finalSkills]: any = await conn.query('SELECT id, skill_name, category, score, verified, proficiency, questions_tested, questions_correct FROM student_skills WHERE user_id = ? ORDER BY skill_name', [user.id]);
  console.log(`\nFinal unique skills for Gowtham (${finalSkills.length} total):`);
  console.table(finalSkills);

  await conn.end();
  console.log('Deduplication complete!');
}

main().catch(console.error);
