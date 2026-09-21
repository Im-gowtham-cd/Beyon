async function testLogin() {
  const testAccounts = [
    { email: 'gowthamcd.23cse@kongu.edu', password: 'Password@123' },
    { email: 'gowthamcdstudies@gmail.com', password: 'Password@123' },
    { email: 'konguengineeringcollege@kongu.edu', password: 'Password@123' },
    { email: 'principal.test@kongu.edu', password: 'Password@123' },
    { email: 'principal@kongu.edu', password: 'Password@123' },
    { email: 'coord.test@kongu.edu', password: 'Password@123' },
    { email: 'incharge.cse@kongu.edu', password: 'Password@123' },
    { email: 'cse.fac1@faculty.kec-demo.local', password: 'Password@123' },
    { email: 'recruiter@infosys.com', password: 'Password@123' },
    { email: 'gotm@grito.in', password: 'Password@123' },
    { email: 'demo.cse001@students.kec-demo.local', password: 'Password@123' },
    { email: 'superadmin@beyon.io', password: 'Superadmin@2026' }
  ];

  for (const acc of testAccounts) {
    try {
      const res = await fetch('http://localhost:8085/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(acc)
      });
      const data: any = await res.json();
      console.log(`[LOGIN TEST] ${acc.email} -> Status: ${res.status}, Success: ${data.success === true ? '✅ YES' : '❌ NO'}`);
    } catch (err: any) {
      console.error(`[LOGIN ERROR] ${acc.email}:`, err.message);
    }
  }
}

testLogin();
