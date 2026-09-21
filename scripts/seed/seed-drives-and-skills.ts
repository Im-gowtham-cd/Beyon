import mysql from 'mysql2/promise';
import { randomUUID } from 'crypto';

async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'beyon'
  });

  console.log('Connected to Dolt DB (beyon)...');

  const [recruiterRows]: any = await conn.query("SELECT id FROM users WHERE email IN ('gotm@grito.in', 'recruiter@infosys.com', 'recruitment@www.zoho.com') LIMIT 1");
  const companyUserId = recruiterRows[0]?.id || '87c25bc5-cc90-493a-8c68-5e4e1674ef6f';

  // Delete any non-UUID legacy drives
  await conn.query("DELETE FROM placement_drives WHERE opportunity_id LIKE 'opp-drive-%'");
  await conn.query("DELETE FROM company_opportunities WHERE id LIKE 'opp-drive-%'");

  const sampleDrives = [
    {
      id: 'a1111111-1111-4111-a111-111111111111',
      title: 'Grito Technologies — Full Stack Web Engineering Campus Drive 2026',
      opportunity_type: 'CAMPUS_DRIVE',
      company_user_id: companyUserId,
      description: 'Premier campus recruitment drive for Full Stack Software Engineers. Seeking strong proficiency in Frontend (React, HTML, CSS, JavaScript) and Backend (Java, PostgreSQL) with collaborative problem solving.',
      required_skills: 'HTML,JavaScript,React,PostgreSQL,Java,Problem Solving,Team Collaboration',
      min_cgpa: '7.50',
      min_beyon_coins: 0,
      package_lpa: '14.50',
      location: 'Bengaluru / Hybrid',
      is_remote: 1,
      status: 'PUBLISHED'
    },
    {
      id: 'a2222222-2222-4222-a222-222222222222',
      title: 'Infosys — Specialist Programmer & Digital Specialist Engineer Drive',
      opportunity_type: 'CAMPUS_DRIVE',
      company_user_id: companyUserId,
      description: 'Elite digital engineering campus drive. Open for candidates with strong foundational Java, Python, and SQL capabilities alongside strong Quantitative Aptitude and Analytical Thinking.',
      required_skills: 'Java,Python,SQL,JavaScript,Quantitative Aptitude,Analytical Thinking',
      min_cgpa: '7.00',
      min_beyon_coins: 0,
      package_lpa: '12.00',
      location: 'Chennai / Bengaluru / Mysuru',
      is_remote: 0,
      status: 'PUBLISHED'
    },
    {
      id: 'a3333333-3333-4333-a333-333333333333',
      title: 'Mr. Cooper — FinTech Cloud & Java Microservices Campus Drive',
      opportunity_type: 'CAMPUS_DRIVE',
      company_user_id: companyUserId,
      description: 'High-scale mortgage FinTech recruitment drive. Focuses on Java, Spring Boot microservices, React, and SQL with critical thinking and architectural problem solving.',
      required_skills: 'Java,Spring Boot,React,SQL,Critical Thinking,Problem Solving',
      min_cgpa: '7.50',
      min_beyon_coins: 50,
      package_lpa: '13.50',
      location: 'Chennai',
      is_remote: 0,
      status: 'PUBLISHED'
    },
    {
      id: 'a4444444-4444-4444-a444-444444444444',
      title: 'Zoho Corporation — Core Systems & Distributed Engineering Campus Drive',
      opportunity_type: 'CAMPUS_DRIVE',
      company_user_id: companyUserId,
      description: 'Systems Engineering campus drive for Zoho Core Infra. Requires low-level programming (C++, Rust), Data Structures & Algorithms, Distributed Systems, and Low-Level Debugging.',
      required_skills: 'C++,Rust,DSA,Distributed Systems,Operating Systems,Systems Thinking',
      min_cgpa: '8.00',
      min_beyon_coins: 100,
      package_lpa: '16.00',
      location: 'Chennai / Tenkasi',
      is_remote: 0,
      status: 'PUBLISHED'
    },
    {
      id: 'a5555555-5555-4555-a555-555555555555',
      title: 'Presidio — Cloud Solutions & Enterprise Architecture Campus Drive',
      opportunity_type: 'CAMPUS_DRIVE',
      company_user_id: companyUserId,
      description: 'Global cloud solutions consultancy drive. Demands strong Enterprise Cloud Architecture, Kubernetes, Advanced TypeScript, alongside exceptional Verbal Communication & Client Articulation.',
      required_skills: 'AWS,Terraform,Kubernetes,TypeScript,Verbal Communication,Client Articulation',
      min_cgpa: '7.50',
      min_beyon_coins: 0,
      package_lpa: '15.00',
      location: 'Coimbatore / Bengaluru',
      is_remote: 1,
      status: 'PUBLISHED'
    },
    {
      id: 'a6666666-6666-4666-a666-666666666666',
      title: 'Soliton Technologies — Embedded Systems & Automation Drive',
      opportunity_type: 'CAMPUS_DRIVE',
      company_user_id: companyUserId,
      description: 'Hardware, Embedded & Automated Test Engineering drive. Demands C, C++, Python, Signal Processing, and Analytical Reasoning.',
      required_skills: 'C,C++,Python,Embedded Systems,Signal Processing,Analytical Reasoning',
      min_cgpa: '7.50',
      min_beyon_coins: 0,
      package_lpa: '11.00',
      location: 'Coimbatore / Bengaluru',
      is_remote: 0,
      status: 'PUBLISHED'
    }
  ];

  for (const opp of sampleDrives) {
    const [existing]: any = await conn.query('SELECT id FROM company_opportunities WHERE id = ?', [opp.id]);
    if (existing.length > 0) {
      await conn.query(
        'UPDATE company_opportunities SET title = ?, opportunity_type = ?, description = ?, required_skills = ?, min_cgpa = ?, min_beyon_coins = ?, package_lpa = ?, location = ?, is_remote = ?, status = ? WHERE id = ?',
        [opp.title, opp.opportunity_type, opp.description, opp.required_skills, opp.min_cgpa, opp.min_beyon_coins, opp.package_lpa, opp.location, opp.is_remote, opp.status, opp.id]
      );
      console.log(`Updated drive: ${opp.title}`);
    } else {
      await conn.query(
        'INSERT INTO company_opportunities (id, title, opportunity_type, company_user_id, description, required_skills, min_cgpa, min_beyon_coins, package_lpa, location, is_remote, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [opp.id, opp.title, opp.opportunity_type, opp.company_user_id, opp.description, opp.required_skills, opp.min_cgpa, opp.min_beyon_coins, opp.package_lpa, opp.location, opp.is_remote, opp.status]
      );
      console.log(`Inserted drive: ${opp.title}`);
    }
  }

  // Diagnostic question attempts for Gowtham (`1853170b-89ad-41ec-b73d-14109608e84c`)
  const [userRows]: any = await conn.query("SELECT id FROM users WHERE email = 'gowthamcd.23cse@kongu.edu'");
  if (userRows.length > 0) {
    const gowthamId = userRows[0].id;
    console.log(`Ensuring question attempts for student ${gowthamId}...`);

    const [questions]: any = await conn.query('SELECT q.id, q.title, q.tags, s.name as skill_name FROM questions q JOIN skills s ON s.id = q.skill_id LIMIT 30');
    console.log(`Found ${questions.length} questions in bank.`);

    if (questions.length > 0) {
      for (let i = 0; i < Math.min(questions.length, 12); i++) {
        const q = questions[i];
        const isCorrect = i % 3 === 0 ? 1 : 0;
        const attemptId = randomUUID();
        await conn.query(
          `INSERT INTO student_question_attempts (id, student_id, question_id, is_correct, time_spent_seconds, created_at, user_answer)
           VALUES (?, ?, ?, ?, ?, NOW(), ?)
           ON DUPLICATE KEY UPDATE is_correct = VALUES(is_correct)`,
          [attemptId, gowthamId, q.id, isCorrect, 45, 'A']
        );
      }
      console.log('Seeded diagnostic question attempts for Gowtham.');
    }
  }

  await conn.end();
  console.log('Seeding completed successfully!');
}

main().catch(console.error);
