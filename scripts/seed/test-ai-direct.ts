import fetch from 'node-fetch';

async function testDirect() {
  const payload = {
    current_skills: [{ skillName: 'React' }, { skillName: 'Java' }],
    weak_concepts: [{ skillName: 'CSS', conceptTitle: 'Box Model' }],
    target_role: 'Full Stack Engineer',
    candidate_skills: [
      { name: 'C++', category: 'Backend & Systems' },
      { name: 'AWS', category: 'Cloud & DevOps' },
      { name: 'Next.js', category: 'Frontend Engineering' }
    ],
    blocked_drives: [{ title: 'Zoho Corporation', packageLpa: 16, missingSkills: ['C++'] }],
    limit: 5
  };

  console.log('Sending direct request to AI service: http://localhost:8000/api/v1/intelligence/recommendations/ai-skill-advisor');
  try {
    const res = await fetch('http://localhost:8000/api/v1/intelligence/recommendations/ai-skill-advisor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log('Direct status:', res.status);
    const data = await res.json();
    console.log('Direct response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Direct error:', err);
  }
}

testDirect();
