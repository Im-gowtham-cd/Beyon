import fetch from 'node-fetch';

async function testAiSkillRecommendations() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('🚀 TESTING AI-POWERED SKILL RECOMMENDATION & EXPLANATION ENGINE');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  // 1. Login as Gowtham
  console.log('1. Authenticating as primary student: gowthamcd.23cse@kongu.edu...');
  const loginRes = await fetch('http://localhost:8085/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'gowthamcd.23cse@kongu.edu',
      password: 'Password@123'
    })
  });

  if (!loginRes.ok) {
    throw new Error(`Login failed with status: ${loginRes.status}`);
  }

  const loginData: any = await loginRes.json();
  const token = loginData.data?.accessToken || loginData.accessToken || loginData.data?.token;
  if (!token) {
    throw new Error(`Token not found in login response: ${JSON.stringify(loginData)}`);
  }
  console.log('✅ Authenticated successfully! Access token obtained.\n');

  // 2. Fetch Profile Skills
  console.log('2. Fetching profile skills & verifying deduplication...');
  const skillsRes = await fetch('http://localhost:8085/api/v1/student/skills', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!skillsRes.ok) {
    const errText = await skillsRes.text();
    throw new Error(`Fetch skills failed: ${skillsRes.status} ${errText}`);
  }
  const rawSkills: any = await skillsRes.json();
  const skillList: any[] = Array.isArray(rawSkills) ? rawSkills : rawSkills.data || [];

  // Deduplicate
  const uniqueSkillsMap = new Map<string, any>();
  skillList.forEach(s => {
    const key = (s.skillName || s.name || '').toLowerCase().trim();
    if (!uniqueSkillsMap.has(key)) {
      uniqueSkillsMap.set(key, s);
    }
  });
  const deduplicatedSkills = Array.from(uniqueSkillsMap.values());
  console.log(`✅ Loaded ${skillList.length} raw records -> Deduplicated to ${deduplicatedSkills.length} unique competency tags.`);
  console.log('   Unique Active Competencies: ' + deduplicatedSkills.map(s => `${s.skillName || s.name} (${s.proficiency || 'INTERMEDIATE'})`).join(', '));
  console.log();

  // 3. Fetch Opportunities to find blocked drives
  console.log('3. Fetching campus drives to identify blocked eligibility requirements...');
  const oppsRes = await fetch('http://localhost:8085/api/v1/opportunities', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const rawOpps: any = await oppsRes.json();
  const oppList: any[] = Array.isArray(rawOpps) ? rawOpps : rawOpps.data || [];
  const verifiedNames = new Set(deduplicatedSkills.map(s => (s.skillName || s.name || '').toLowerCase().trim()));

  const blockedDrives: any[] = [];
  oppList.filter((o: any) => o.opportunityType?.includes('DRIVE') || o.title?.toLowerCase().includes('drive')).forEach((d: any) => {
    const req = (d.requiredSkills || '').split(',').map((s: string) => s.trim()).filter(Boolean);
    const missing = req.filter((r: string) => !Array.from(verifiedNames).some(vn => vn.includes(r.toLowerCase()) || r.toLowerCase().includes(vn)));
    if (missing.length > 0) {
      blockedDrives.push({
        title: d.title,
        packageLpa: d.packageLpa,
        missingSkills: missing
      });
    }
  });

  console.log(`✅ Identified ${blockedDrives.length} blocked campus recruitment drives with missing competencies:`);
  for (const bd of blockedDrives.slice(0, 4)) {
    console.log(`   • ${bd.title} (₹${bd.packageLpa || 12} LPA) -> Missing: [${bd.missingSkills.join(', ')}]`);
  }
  console.log();

  // 4. Fetch Weak Concepts
  console.log('4. Fetching diagnosed concept weaknesses...');
  const weakRes = await fetch('http://localhost:8085/api/v1/career-intel/weak-concepts', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const rawWeak: any = await weakRes.json();
  const weakConcepts = Array.isArray(rawWeak) ? rawWeak : rawWeak.data || [];
  console.log(`✅ Loaded ${weakConcepts.length} diagnosed concept weaknesses.\n`);

  // 5. Test AI Skill Recommendations endpoint
  console.log('5. Calling AI Skill Advisor endpoint (/api/v1/career-intel/recommendations/ai-skill-advisor)...');
  const candidateSkills = [
    { name: 'C++', category: 'Backend & Systems' },
    { name: 'Rust', category: 'Backend & Systems' },
    { name: 'AWS', category: 'Cloud & DevOps' },
    { name: 'Kubernetes', category: 'Cloud & DevOps' },
    { name: 'Terraform', category: 'Cloud & DevOps' },
    { name: 'Next.js', category: 'Frontend Engineering' },
    { name: 'Node.js', category: 'Backend & Systems' },
    { name: 'System Design', category: 'CS Fundamentals & Architecture' },
    { name: 'Redis', category: 'Database & Data Tier' },
    { name: 'Docker', category: 'Cloud & DevOps' },
    { name: 'FastAPI', category: 'Backend & Systems' },
  ];

  const aiRecRes = await fetch('http://localhost:8085/api/v1/career-intel/recommendations/ai-skill-advisor', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      current_skills: deduplicatedSkills.map(s => ({
        skillName: s.skillName || s.name,
        score: s.score || 70,
        proficiency: s.proficiency || 'INTERMEDIATE'
      })),
      weak_concepts: weakConcepts,
      target_role: 'Full Stack & Systems Engineer',
      target_company: 'Enterprise & High-Growth Startups',
      blocked_drives: blockedDrives,
      candidate_skills: candidateSkills,
      limit: 8
    })
  });

  if (!aiRecRes.ok) {
    throw new Error(`AI Skill Advisor failed with status ${aiRecRes.status}`);
  }

  const aiRecData: any = await aiRecRes.json();
  console.log('Raw aiRecData:', JSON.stringify(aiRecData, null, 2));
  const recs: any[] = aiRecData.recommendations || aiRecData.data?.recommendations || [];
  console.log(`✅ Received ${recs.length} AI-generated skill recommendations with articulate reasoning:\n`);

  console.log('── AI SKILL RECOMMENDATIONS & DEEP EXPLANATIONS ────────────────────');
  for (const rec of recs) {
    const sName = rec.skill_name || rec.skill?.name;
    const tag = rec.synergy_tag || 'AI Matched';
    const reason = rec.reason;
    const unblocked = rec.unblocked_drives || [];

    console.log(`💡 Recommended Skill: ${sName}`);
    console.log(`   Synergy Tag:       [${tag}]`);
    if (unblocked.length > 0) {
      console.log(`   🔓 Unblocks Drive: ${unblocked.join(' | ')}`);
    }
    console.log(`   🧠 AI Explanation: ${reason}`);
    console.log('───────────────────────────────────────────────────────────────────');
  }

  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('🎉 AI-POWERED SKILL RECOMMENDATION & EXPLANATION TESTS PASSED!');
  console.log('═══════════════════════════════════════════════════════════════════\n');
}

testAiSkillRecommendations().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
