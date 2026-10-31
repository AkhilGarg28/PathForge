async function testFlow() {
  const baseUrl = 'http://localhost:5000';

  console.log('--- 1. Testing MERN Track Flow ---');
  // Signup MERN user
  const mernEmail = `mern_tester_${Date.now()}@example.com`;
  const mernSignupRes = await fetch(`${baseUrl}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'MERN Specialist',
      email: mernEmail,
      password: 'Password123!'
    })
  });
  const mernCookie = mernSignupRes.headers.get('set-cookie');
  console.log('MERN User signed up, status:', mernSignupRes.status);

  // Save profile with MERN Developer role
  await fetch(`${baseUrl}/api/onboarding/profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': mernCookie
    },
    body: JSON.stringify({
      targetRole: 'MERN Developer (Full Stack MongoDB, Express, React, Node)',
      educationStatus: 'Computer Science Student',
      technicalLevel: 'Intermediate',
      desiredSkills: ['React', 'Node.js', 'MongoDB']
    })
  });

  // Fetch Diagnostic questions
  const mernDiagRes = await fetch(`${baseUrl}/api/diagnostic/mern-developer`, {
    headers: { 'Cookie': mernCookie }
  });
  const mernDiagData = await mernDiagRes.json();
  const mernQ = mernDiagData.data?.questions || [];
  console.log(`MERN Diagnostic questions returned: ${mernQ.length}`);
  console.log(`MERN Diagnostic Role: ${mernDiagData.data?.roleTitle} (${mernDiagData.data?.roleId})`);
  console.log(`MERN Sample Q1: ${mernQ[0]?.question}`);

  // Fetch Readiness questions
  const mernReadinessRes = await fetch(`${baseUrl}/api/readiness/questions`, {
    headers: { 'Cookie': mernCookie }
  });
  const mernReadinessData = await mernReadinessRes.json();
  const mernRQ = mernReadinessData.data?.questions || [];
  console.log(`MERN Readiness questions returned: ${mernRQ.length}`);
  console.log(`MERN Readiness Skills:`, [...new Set(mernRQ.map(q => q.skill))]);

  // Generate Roadmap
  const mernRoadmapRes = await fetch(`${baseUrl}/api/personalized-roadmap/generate`, {
    method: 'POST',
    headers: { 'Cookie': mernCookie }
  });
  const mernRoadmapData = await mernRoadmapRes.json();
  const mernRoadmap = mernRoadmapData.data?.roadmap;
  console.log(`MERN Roadmap Title: ${mernRoadmap?.phases?.[0]?.title} / Week 1: ${mernRoadmap?.weeks?.[0]?.title}`);

  console.log('\n--- 2. Testing Data Analyst Track Flow ---');
  // Signup DA user
  const daEmail = `da_tester_${Date.now()}@example.com`;
  const daSignupRes = await fetch(`${baseUrl}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Data Analyst Specialist',
      email: daEmail,
      password: 'Password123!'
    })
  });
  const daCookie = daSignupRes.headers.get('set-cookie');
  console.log('DA User signed up, status:', daSignupRes.status);

  // Save profile with Data Analyst role
  await fetch(`${baseUrl}/api/onboarding/profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': daCookie
    },
    body: JSON.stringify({
      targetRole: 'Data Analyst (Python, SQL, Tableau, Power BI, Statistics)',
      educationStatus: 'College Graduate',
      technicalLevel: 'Intermediate',
      desiredSkills: ['Python', 'SQL', 'Tableau', 'Power BI']
    })
  });

  // Fetch Diagnostic questions
  const daDiagRes = await fetch(`${baseUrl}/api/diagnostic/data-analyst`, {
    headers: { 'Cookie': daCookie }
  });
  const daDiagData = await daDiagRes.json();
  const daQ = daDiagData.data?.questions || [];
  console.log(`DA Diagnostic questions returned: ${daQ.length}`);
  console.log(`DA Diagnostic Role: ${daDiagData.data?.roleTitle} (${daDiagData.data?.roleId})`);
  console.log(`DA Sample Q1: ${daQ[0]?.question}`);

  // Fetch Readiness questions
  const daReadinessRes = await fetch(`${baseUrl}/api/readiness/questions`, {
    headers: { 'Cookie': daCookie }
  });
  const daReadinessData = await daReadinessRes.json();
  const daRQ = daReadinessData.data?.questions || [];
  console.log(`DA Readiness questions returned: ${daRQ.length}`);
  console.log(`DA Readiness Skills:`, [...new Set(daRQ.map(q => q.skill))]);

  // Generate Roadmap
  const daRoadmapRes = await fetch(`${baseUrl}/api/personalized-roadmap/generate`, {
    method: 'POST',
    headers: { 'Cookie': daCookie }
  });
  const daRoadmapData = await daRoadmapRes.json();
  const daRoadmap = daRoadmapData.data?.roadmap;
  console.log(`DA Roadmap Title: ${daRoadmap?.phases?.[0]?.title} / Week 1: ${daRoadmap?.weeks?.[0]?.title}`);

  console.log('\n--- VERIFICATION CHECKS ---');
  const mernIsDistinctFromDa = mernQ[0]?.question !== daQ[0]?.question;
  const daHasAnalystQuestions = daRQ.some(q => ['SQL', 'Python', 'Excel', 'Statistics', 'Power BI', 'Tableau', 'Business Analytics'].includes(q.skill));
  const mernHasDeveloperQuestions = mernRQ.some(q => ['JavaScript', 'React', 'Node.js', 'Express.js', 'MongoDB', 'System Design', 'DevOps'].includes(q.skill));
  const roadmapsDiffer = mernRoadmap?.weeks?.[0]?.title !== daRoadmap?.weeks?.[0]?.title;

  console.log('✓ Questions strictly differ between tracks:', mernIsDistinctFromDa);
  console.log('✓ Data Analyst questions contain analytics skills:', daHasAnalystQuestions);
  console.log('✓ MERN questions contain full-stack skills:', mernHasDeveloperQuestions);
  console.log('✓ Roadmaps differ according to program:', roadmapsDiffer);

  if (mernIsDistinctFromDa && daHasAnalystQuestions && mernHasDeveloperQuestions && roadmapsDiffer) {
    console.log('\n🎉 ALL TRACK VARIATION TESTS PASSED 100%!');
  } else {
    console.error('\n❌ Test assertion failed!');
    process.exit(1);
  }
}

testFlow().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
