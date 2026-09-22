async function testAll() {
  const accounts = [
    { email: 'gowthamcd.23cse@kongu.edu', pw: 'Password@123' },
    { email: 'gowthamcdstudies@gmail.com', pw: 'Password@123' },
    { email: 'konguengineeringcollege@kongu.edu', pw: 'Password@123' },
    { email: 'principal.test@kongu.edu', pw: 'Password@123' },
    { email: 'principal@kongu.edu', pw: 'Password@123' },
    { email: 'coord.test@kongu.edu', pw: 'Password@123' },
    { email: 'incharge.cse@kongu.edu', pw: 'Password@123' },
    { email: 'cse.fac1@faculty.kec-demo.local', pw: 'Password@123' },
    { email: 'it.fac1@faculty.kec-demo.local', pw: 'Password@123' },
    { email: 'aids.fac1@faculty.kec-demo.local', pw: 'Password@123' },
    { email: 'recruiter@infosys.com', pw: 'Password@123' },
    { email: 'gotm@grito.in', pw: 'Password@123' },
    { email: 'recruitment@www.zoho.com', pw: 'Password@123' },
    { email: 'recruitment@www.mrcooper.com', pw: 'Password@123' },
    { email: 'recruitment@www.solitontech.com', pw: 'Password@123' },
    { email: 'recruitment@www.presidio.com', pw: 'Password@123' },
    { email: 'demo.cse001@students.kec-demo.local', pw: 'Password@123' },
    { email: 'superadmin@beyon.io', pw: 'Superadmin@2026' },
    { email: 'verifier@beyon.io', pw: 'Verifier@2026' },
    { email: 'skillcontent@beyon.io', pw: 'Skillcontent@2026' },
    { email: 'questionsetter@beyon.io', pw: 'Questionsetter@2026' },
    { email: 'supportadmin@beyon.io', pw: 'Supportadmin@2026' },
    { email: 'analytics@beyon.io', pw: 'Analytics@2026' }
  ];

  let passed = 0;
  for (const acc of accounts) {
    const res = await fetch('http://localhost:8085/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: acc.email, password: acc.pw })
    });
    const d: any = await res.json();
    if (res.ok && d.success) {
      passed++;
      console.log(`✅ [OK] ${acc.email} (${acc.pw})`);
    } else {
      console.log(`❌ [FAIL] ${acc.email} -> status ${res.status}: ${JSON.stringify(d)}`);
    }
  }
  console.log(`\nResults: ${passed} / ${accounts.length} passed!`);
}

testAll();
