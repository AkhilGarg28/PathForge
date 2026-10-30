import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout.jsx';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { Input } from '../components/Input.jsx';
import { Spinner } from '../components/Spinner.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../services/api.js';

export function OnboardingPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [educationStatus, setEducationStatus] = useState('Computer Science Student');
  const [targetRole, setTargetRole] = useState('MERN Developer');
  const [technicalLevel, setTechnicalLevel] = useState('Intermediate');
  const [desiredSkills, setDesiredSkills] = useState('React, Node.js, System Design, MongoDB, TypeScript');
  const [dailyTime, setDailyTime] = useState('2 hours');
  const [timeline, setTimeline] = useState('3 months');

  // Resume & GitHub State
  const [resumeText, setResumeText] = useState(
    'Software developer with 1 year experience building web applications. Highly proficient in JavaScript, React, and Node.js. Built a social media app with authentication, REST APIs, and MongoDB database.'
  );
  const [githubUrl, setGithubUrl] = useState('https://github.com/developer');
  const [repoUrls, setRepoUrls] = useState('https://github.com/developer/portfolio, https://github.com/developer/mern-app');

  // Analysis Results
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [githubAnalysis, setGithubAnalysis] = useState(null);
  const [skillMatrix, setSkillMatrix] = useState([]);

  // Step 1: Save Student Profile
  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const skillsArray = desiredSkills.split(',').map((s) => s.trim()).filter(Boolean);
      await api.saveProfile({
        educationStatus,
        targetRole,
        technicalLevel,
        desiredSkills: skillsArray,
        dailyTime,
        timeline
      });
      showToast('Profile information saved successfully', 'success');
      setStep(2);
    } catch (err) {
      showToast(err.message || 'Failed to save profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Analyze Resume & GitHub with AI
  const handleStep2Analyze = async () => {
    if (!resumeText.trim() && !githubUrl.trim()) {
      showToast('Please provide resume details or GitHub URL to analyze', 'error');
      return;
    }

    setLoading(true);
    try {
      // 1. Run Resume Analysis
      let rResult = null;
      if (resumeText.trim()) {
        const rRes = await api.analyzeResume({ resumeText });
        rResult = rRes.data;
        setResumeAnalysis(rResult);
      }

      // 2. Run GitHub Analysis
      let gResult = null;
      if (githubUrl.trim()) {
        const rUrls = repoUrls.split(',').map((u) => u.trim()).filter(Boolean);
        const gRes = await api.analyzeGitHub({ githubUrl, repoUrls: rUrls });
        gResult = gRes.data;
        setGithubAnalysis(gResult);
      }

      // 3. Fetch synthesized Skill Matrix
      const matrixRes = await api.getSkillMatrix();
      if (matrixRes.data?.skills) {
        setSkillMatrix(matrixRes.data.skills);
      }

      showToast('AI analysis completed! Initial Skill Matrix generated.', 'success');
      setStep(3);
    } catch (err) {
      showToast(err.message || 'AI analysis failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={{ maxWidth: '840px', margin: '0 auto', padding: 'var(--space-6) var(--space-4)' }}>
        {/* Progress Header */}
        <div style={{ marginBottom: 'var(--space-6)', textAlign: 'center' }}>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--color-primary)'
            }}
          >
            Personalized Onboarding • Step {step} of 3
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '8px 0' }}>
            {step === 1 && 'Define Your Learning Goals & Background'}
            {step === 2 && 'Upload Resume & Link GitHub for AI Analysis'}
            {step === 3 && 'Initial Skill Matrix & Baseline Profile'}
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '580px', margin: '0 auto' }}>
            {step === 1 && 'Every curriculum in PathForge is bespoke. Tell us your target career and availability.'}
            {step === 2 && 'Our AI extracts claimed competencies, inspects code repositories, and identifies missing skills.'}
            {step === 3 && 'Here is your initial skill calibration. Next, verify your claims with the AI Readiness Test.'}
          </p>
        </div>

        {/* Step 1: Goals & Background */}
        {step === 1 && (
          <Card>
            <form onSubmit={handleStep1Submit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                  Current Education or Professional Status
                </label>
                <select
                  value={educationStatus}
                  onChange={(e) => setEducationStatus(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg-base)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  <option value="Computer Science Student">Computer Science Student</option>
                  <option value="Coding Bootcamp Student / Graduate">Coding Bootcamp Student / Graduate</option>
                  <option value="Self-Taught Developer">Self-Taught Developer</option>
                  <option value="Junior Software Engineer">Junior Software Engineer</option>
                  <option value="Mid-Level Engineer Career Switcher">Career Switcher</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                  Target Career / Job Role
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg-base)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  <option value="MERN Developer">MERN Developer (Full Stack MongoDB, Express, React, Node)</option>
                  <option value="Full Stack Engineer">Full Stack Software Engineer</option>
                  <option value="Frontend Engineer">Frontend Engineer (React & TypeScript)</option>
                  <option value="Backend Engineer">Backend Engineer (Node.js & Microservices)</option>
                  <option value="Data Analyst">Data Analyst (Python, SQL & BI)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                    Current Technical Level
                  </label>
                  <select
                    value={technicalLevel}
                    onChange={(e) => setTechnicalLevel(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-bg-base)',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    <option value="Beginner">Beginner (Basic programming knowledge)</option>
                    <option value="Intermediate">Intermediate (Built a few small projects)</option>
                    <option value="Advanced">Advanced (Working with complex systems)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                    Daily Available Learning Time
                  </label>
                  <select
                    value={dailyTime}
                    onChange={(e) => setDailyTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-bg-base)',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    <option value="1 hour">1 hour / day</option>
                    <option value="2 hours">2 hours / day</option>
                    <option value="3-4 hours">3-4 hours / day</option>
                    <option value="Full time (6+ hours)">Full time (6+ hours / day)</option>
                  </select>
                </div>
              </div>

              <Input
                label="Skills You Want to Master (Comma-separated)"
                value={desiredSkills}
                onChange={(e) => setDesiredSkills(e.target.value)}
                placeholder="e.g. React, Node.js, Microservices, Redis"
                required
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? <Spinner size="sm" /> : 'Continue to Resume & GitHub'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Step 2: Resume & GitHub Upload */}
        {step === 2 && (
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                  Paste Resume Content (or summary of experience & projects)
                </label>
                <textarea
                  rows={6}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume text here: education, technical skills, projects, and work experience..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg-base)',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'inherit',
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                    resize: 'vertical'
                  }}
                />
              </div>

              <Input
                label="GitHub Profile URL (Optional but recommended)"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/your-username"
              />

              <Input
                label="Key GitHub Repository URLs (Comma-separated)"
                value={repoUrls}
                onChange={(e) => setRepoUrls(e.target.value)}
                placeholder="https://github.com/user/project-1, https://github.com/user/project-2"
              />

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 'var(--space-2)',
                  borderTop: '1px solid var(--color-border)',
                  paddingTop: 'var(--space-4)'
                }}
              >
                <Button variant="ghost" onClick={() => setStep(1)} disabled={loading}>
                  Back
                </Button>
                <Button variant="primary" onClick={handleStep2Analyze} disabled={loading}>
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Spinner size="sm" /> Running AI Analysis...
                    </span>
                  ) : (
                    'Run AI Analysis & Generate Skill Matrix'
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 3: Verified Skill Matrix & Assessment Prompt */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* AI Analysis Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
              {resumeAnalysis && (
                <Card>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 8px', color: 'var(--color-primary)' }}>
                    📄 Resume Extracted Insights
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                    {resumeAnalysis.summary}
                  </p>
                  {resumeAnalysis.missingSkillsForTarget?.length > 0 && (
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-warning, #f59e0b)' }}>
                        Identified Gaps for {targetRole}:
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                        {resumeAnalysis.missingSkillsForTarget.map((gap, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: '0.75rem',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(245, 158, 11, 0.1)',
                              color: '#f59e0b',
                              fontWeight: 600
                            }}
                          >
                            + {gap}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              )}

              {githubAnalysis && (
                <Card>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 8px', color: 'var(--color-success)' }}>
                    🐙 GitHub Evidence Summary
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                    Verified Username: <strong>@{githubAnalysis.username}</strong>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                    Detected Tech: {githubAnalysis.languages?.slice(0, 5).join(', ')}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    Repo Quality Score: <strong>{githubAnalysis.codeQualityScore}/100</strong>
                  </div>
                </Card>
              )}
            </div>

            {/* Skill Matrix Table */}
            <Card>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
                Initial Skill Matrix
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
                This matrix combines what you claimed in your resume with tangible code evidence discovered in your repositories.
              </p>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                      <th style={{ padding: '10px 12px' }}>Skill</th>
                      <th style={{ padding: '10px 12px' }}>Resume Claim</th>
                      <th style={{ padding: '10px 12px' }}>GitHub Evidence</th>
                      <th style={{ padding: '10px 12px' }}>Verified Baseline</th>
                      <th style={{ padding: '10px 12px' }}>Proficiency Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skillMatrix.length > 0 ? (
                      skillMatrix.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                          <td style={{ padding: '10px 12px', fontWeight: 600 }}>{item.skill}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                backgroundColor: 'var(--color-primary-subtle)',
                                color: 'var(--color-primary)',
                                fontWeight: 500
                              }}
                            >
                              {item.resumeClaim || 'Intermediate'}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', color: 'var(--color-text-secondary)' }}>
                            {item.githubEvidence || 'Demonstrated'}
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                color: '#16a34a',
                                fontWeight: 600
                              }}
                            >
                              {item.verifiedLevel || 'Intermediate'}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div
                                style={{
                                  flex: 1,
                                  height: '8px',
                                  borderRadius: '9999px',
                                  backgroundColor: 'var(--color-border)',
                                  overflow: 'hidden'
                                }}
                              >
                                <div
                                  style={{
                                    height: '100%',
                                    width: `${item.proficiencyScore || 60}%`,
                                    backgroundColor: 'var(--color-primary)',
                                    borderRadius: '9999px'
                                  }}
                                />
                              </div>
                              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                                {item.proficiencyScore || 60}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                          Initializing matrix...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Action Banner */}
              <div
                style={{
                  marginTop: 'var(--space-6)',
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-primary-subtle)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 'var(--space-3)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '1rem' }}>
                    Next Step: AI Readiness Assessment (Phase 2)
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    Take a short, adaptive multi-skill assessment to verify your claims and calibrate your 12-week roadmap.
                  </div>
                </div>
                <Button variant="primary" size="lg" onClick={() => navigate('/readiness')}>
                  Start AI Readiness Test →
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default OnboardingPage;
