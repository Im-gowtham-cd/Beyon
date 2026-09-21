async function testAssessment() {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  const res = await fetch('https://localhost:5173/src/assessment/pages/AssessmentPage.tsx');
  console.log('AssessmentPage.tsx status:', res.status, 'MIME:', res.headers.get('content-type'));
}

testAssessment().catch(console.error);
