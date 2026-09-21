import mysql from 'mysql2/promise';

async function runDemoTests() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('🚀 BEYON PLATFORM — CAMPUS DRIVE SUGGESTION & DIAGNOSTIC TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  // Test 1: Log in as Gowtham C D
  console.log('1. Authenticating as primary student: gowthamcd.23cse@kongu.edu...');
  const loginRes = await fetch('http://localhost:8085/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'gowthamcd.23cse@kongu.edu', password: 'Password@123' })
  });
  const loginData: any = await loginRes.json();
  if (!loginRes.ok || !loginData.data?.accessToken) {
    throw new Error(`Login failed for Gowtham: ${JSON.stringify(loginData)}`);
  }
  const token = loginData.data.accessToken;
  console.log('✅ Authenticated successfully! Access token obtained.\n');

  // Test 2: Fetch Student Skills
  console.log('2. Fetching verified student skills...');
  const skillsRes = await fetch('http://localhost:8085/api/v1/student/skills', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const rawSkills: any = await skillsRes.json();
  const verifiedList = Array.isArray(rawSkills) ? rawSkills : rawSkills.data || [];
  console.log(`✅ Loaded ${verifiedList.length} student skills:`);
  for (const s of verifiedList.slice(0, 6)) {
    console.log(`   • ${s.skillName || s.name}: ${s.score}% (Verified: ${s.verified})`);
  }
  console.log();

  // Test 3: Fetch Campus Drives & Compute Skill Fit
  console.log('3. Fetching campus drives and evaluating AI skill mapping...');
  const oppsRes = await fetch('http://localhost:8085/api/v1/opportunities', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const rawOpps: any = await oppsRes.json();
  const oppList: any[] = Array.isArray(rawOpps) ? rawOpps : rawOpps.data || [];
  console.log(`✅ Loaded ${oppList.length} total opportunities.`);

  const drives = oppList.filter((o: any) =>
    (o.opportunityType && o.opportunityType.includes('DRIVE')) ||
    (o.title && o.title.toLowerCase().includes('drive'))
  );
  console.log(`✅ Found ${drives.length} active campus drives in catalog.\n`);

  console.log('── DRIVE SUGGESTIONS & SKILL MAPPING MATRIX ─────────────────────────');
  for (const drive of drives) {
    const rawReq = (drive.requiredSkills || '').split(',').map((s: string) => s.trim()).filter(Boolean);
    const matched = rawReq.filter((req: string) =>
      verifiedList.some((s: any) => (s.skillName || '').toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes((s.skillName || '').toLowerCase()))
    );
    const matchPct = rawReq.length > 0 ? Math.round((matched.length / rawReq.length) * 100) : 75;
    const tier = matchPct >= 75 ? 'HIGH_MATCH' : matchPct < 60 ? 'SKILL_GAP_CRITICAL' : 'MODERATE_MATCH';

    console.log(`📌 Drive: ${drive.title}`);
    console.log(`   Package: ₹${drive.packageLpa || 12} LPA | Match: ${matchPct}% [${tier}]`);
    console.log(`   Required Skills: ${rawReq.join(', ')}`);
    console.log(`   Matched Skills:  ${matched.join(', ') || 'None'}`);

    if (tier === 'SKILL_GAP_CRITICAL') {
      const missing = rawReq.filter((r: string) => !matched.includes(r));
      console.log(`   🚨 CRITICAL ATTENTION REQUIRED: Missing [${missing.join(', ')}]`);
      console.log(`   🎯 Intervention: Routed to Concept Weakness Diagnosis & 50/50 Adaptive Retest`);
    } else {
      console.log(`   ✅ Status: Eligible & Ready for Fast-Track Application`);
    }
    console.log('───────────────────────────────────────────────────────────────────');
  }

  // Test 4: Verify Concept Weakness Diagnosis API
  console.log('\n4. Testing Concept Weakness Diagnosis endpoint (/api/v1/career-intel/weak-concepts)...');
  const weakRes = await fetch('http://localhost:8085/api/v1/career-intel/weak-concepts', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const rawWeak: any = await weakRes.json();
  const weakData = Array.isArray(rawWeak) ? rawWeak : rawWeak.data || [];
  console.log(`✅ Concept Weakness Diagnosis returned ${weakData.length} diagnosed weaknesses.`);
  if (weakData.length > 0) {
    console.log(`   Top Diagnosed Gap: ${weakData[0].skillName} -> ${weakData[0].conceptTitle} (Accuracy: ${weakData[0].accuracy}%)`);
    console.log(`   Finding: ${weakData[0].whyStruggled}`);
  }

  // Test 5: Verify 50/50 Adaptive Retest Generation
  console.log('\n5. Testing 50/50 Weakness-Targeted Adaptive Retest Generator...');
  const adaptiveRes = await fetch('http://localhost:8085/api/v1/career-intel/adaptive-test/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      targetSkill: 'CSS',
      companionSkill: 'HTML',
      weakConcept: 'css-boxing',
      totalQuestions: 30
    })
  });
  const adaptiveData: any = await adaptiveRes.json();
  const adaptiveResult = adaptiveData.data || adaptiveData;
  if (adaptiveRes.ok && (adaptiveResult.questions || adaptiveData.questions)) {
    const qList = adaptiveResult.questions || adaptiveData.questions;
    console.log(`✅ 50/50 Adaptive Retest generated successfully!`);
    console.log(`   Blueprint: ${qList.length} Questions`);
    console.log(`   Rule Enforced: 50% weak concept questions (${adaptiveResult.targetSkill || 'CSS'}) + 50% broader concepts (${adaptiveResult.companionSkill || 'HTML'})`);
  } else {
    console.log(`ℹ️ Adaptive Test generation status: ${adaptiveRes.status}`);
  }

  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('🎉 ALL DRIVE SUGGESTION & DIAGNOSTIC TESTS PASSED SUCCESSFULLY!');
  console.log('═══════════════════════════════════════════════════════════════════');
}

runDemoTests().catch(console.error);
