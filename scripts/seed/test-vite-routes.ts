async function testVite() {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  const res = await fetch('https://localhost:5173/src/student/pages/SkillExplorer.tsx');
  console.log('SkillExplorer.tsx status:', res.status, 'MIME:', res.headers.get('content-type'));
  
  const oppRes = await fetch('https://localhost:5173/src/practice/pages/OpportunitiesPage.tsx');
  console.log('OpportunitiesPage.tsx status:', oppRes.status, 'MIME:', oppRes.headers.get('content-type'));
}

testVite().catch(console.error);
