async function testLogin(email: string, password: string, label: string) {
  try {
    const res = await fetch('http://localhost:8085/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const status = res.status;
    const data: any = await res.json();
    if (res.ok) {
      console.log(`✅ [${label}] Login successful for ${email}: status ${status}, token received: ${!!data.data?.accessToken}, role: ${data.data?.user?.role}`);
      
      // Now test calling auth/me and student/profile using token
      const meRes = await fetch('http://localhost:8085/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${data.data?.accessToken}` }
      });
      console.log(`   /auth/me status: ${meRes.status} (OK: ${meRes.ok})`);

      const profRes = await fetch('http://localhost:8085/api/v1/student/profile', {
        headers: { Authorization: `Bearer ${data.data?.accessToken}` }
      });
      console.log(`   /student/profile status: ${profRes.status} (OK: ${profRes.ok})`);
    } else {
      console.error(`❌ [${label}] Login failed for ${email}: status ${status}, error:`, data.message || data.error);
    }
  } catch (err: any) {
    console.error(`❌ [${label}] Exception for ${email}:`, err.message);
  }
}

async function main() {
  console.log('Testing Authentication & Desktop App compatibility...\n');
  
  // Test 1: Primary student with authentic password
  // (The authentic password matches hash $2b$10$s3855CduR4SV7tOdnQB0BObl.fIaBDOkvW7PJZWvh27Lv5pK3sLYO)
  // Let's test Password@123
  await testLogin('gowthamcd.23cse@kongu.edu', 'Password@123', 'Student with Password@123');
  
  // Test 2: Secondary account
  await testLogin('gowthamcdstudies@gmail.com', 'Password@123', 'Secondary Account with Password@123');
  
  // Test 3: Demo student
  await testLogin('demo.cse048@students.kec-demo.local', 'Password@123', 'Demo Student');
}

main().catch(console.error);
