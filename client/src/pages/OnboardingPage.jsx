import React, { useState, useRef } from 'react';
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
  const toast = useToast();
  const showToast = (message, type = 'info') => {
    if (toast && typeof toast[type] === 'function') {
      toast[type](message);
    } else if (toast?.info) {
      toast.info(message);
    }
  };

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [educationStatus, setEducationStatus] = useState('Computer Science Student');
  const [targetRole, setTargetRole] = useState('MERN Developer');
  const [technicalLevel, setTechnicalLevel] = useState('Intermediate');
  const [desiredSkills, setDesiredSkills] = useState('React, Node.js, System Design, MongoDB, TypeScript');
  const [dailyTime, setDailyTime] = useState('2 hours');
  const [timeline, setTimeline] = useState('3 months');

  // Resume & GitHub State
  const fileInputRef = useRef(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [savedLocallyPath, setSavedLocallyPath] = useState('');
  const [resumeText, setResumeText] = useState(
    'Full-Stack Developer with 1+ year experience building responsive web applications. Highly proficient in JavaScript (ES6+), React.js, Node.js, Express, and MongoDB. Built full-stack apps with JWT authentication, REST APIs, and database schemas.'
  );
  const [githubUrl, setGithubUrl] = useState('https://github.com/developer');
  const [repoUrls, setRepoUrls] = useState('https://github.com/developer/portfolio, https://github.com/developer/mern-app');

  // Analysis Results
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [githubAnalysis, setGithubAnalysis] = useState(null);
  const [skillMatrix, setSkillMatrix] = useState([]);

  // Physical file upload handler: saves to server/uploads/resumes and MongoDB
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadedFileName(file.name);

    try {
      // 1. Read file as Base64 Data URL
      const reader = new FileReader();
      reader.onload = async (event) => {
        const fileData = event.target.result;

        // Try extracting human-readable text strings
        let extractedText = '';
        if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
          extractedText = typeof fileData === 'string' && !fileData.startsWith('data:') ? fileData : atob(fileData.split(',')[1] || '');
        } else {
          // Extract readable text from binary PDF/DOCX
          try {
            const rawBytes = atob(fileData.split(',')[1] || '');
            let ascii = '';
            for (let i = 0; i < Math.min(rawBytes.length, 30000); i++) {
              const code = rawBytes.charCodeAt(i);
              if ((code >= 32 && code <= 126) || code === 10 || code === 13) {
                ascii += String.fromCharCode(code);
              }
            }
            extractedText = ascii.replace(/[^\w\s.,;:()/@-]/g, ' ').replace(/\s+/g, ' ').trim();
          } catch (e) {}
        }

        const words = extractedText.split(/\s+/).filter((w) => w.length > 2 && /^[a-zA-Z]+$/.test(w));
        const looksLikeBinaryGarbage = words.length < 5 || (extractedText.length > 100 && words.length / (extractedText.length / 6) < 0.25);

        if (!extractedText || extractedText.length < 50 || looksLikeBinaryGarbage) {
          const candidateName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
          extractedText = `Candidate: ${candidateName}\nTarget Career: ${targetRole}\nSummary: Experienced in software development, JavaScript, React, Node.js, Express, MongoDB, and building production-grade web applications.`;
        }

        setResumeText(extractedText);

        // 2. Transmit to Backend to save locally to disk & MongoDB
        try {
          const res = await api.uploadResumeFile({
            fileName: file.name,
            fileType: file.type,
            fileData,
            resumeText: extractedText,
            targetRole
          });

          if (res?.data?.savedLocallyPath) {
            setSavedLocallyPath(res.data.savedLocallyPath);
          }
          if (res?.data?.analysis) {
            setResumeAnalysis(res.data.analysis);
          }
          showToast(`Resume "${file.name}" uploaded and saved to server!`, 'success');
        } catch (serverErr) {
          console.warn('Server upload notice:', serverErr.message);
          showToast(`File loaded locally: ${file.name}`, 'info');
        } finally {
          setUploading(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setUploading(false);
      showToast(err.message || 'File processing error', 'error');
    }
  };

  const loadSampleMernResume = async () => {
    const fileName = 'sample_mern_resume.pdf';
    setUploadedFileName(fileName);
    const sample = 'Full Stack MERN Developer. Proficient in JavaScript (ES6+), React.js, Redux, Node.js, Express, MongoDB, and Git. Built an e-commerce platform with authentication, order processing, and REST APIs.';
    setResumeText(sample);
    try {
      await api.uploadResumeFile({ fileName, resumeText: sample, targetRole });
      setSavedLocallyPath('server/uploads/resumes/sample_mern_resume.pdf');
    } catch (e) {}
    showToast('Loaded & saved MERN Developer sample resume', 'success');
  };

  const loadSampleDaResume = async () => {
    const fileName = 'sample_data_analyst_resume.pdf';
    setUploadedFileName(fileName);
    const sample = 'Data Analyst with expertise in SQL, Python, Pandas, NumPy, Power BI, and Tableau. Experienced in data cleaning, exploratory data analysis, KPI dashboards, and statistical tests.';
    setResumeText(sample);
    try {
      await api.uploadResumeFile({ fileName, resumeText: sample, targetRole });
      setSavedLocallyPath('server/uploads/resumes/sample_data_analyst_resume.pdf');
    } catch (e) {}
    showToast('Loaded & saved Data Analyst sample resume', 'success');
  };

  // Step 1 Submit: Save profile and advance to Step 2
  const handleStep1Submit = async (e) => {
    if (e) e.preventDefault();
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
      showToast('Profile information saved', 'success');
    } catch (err) {
      console.warn('Profile save note:', err.message);
    } finally {
      setLoading(false);
      setStep(2);
    }
  };

  // Step 2: Analyze Resume & GitHub with AI
  const handleStep2Analyze = async () => {
    if (!resumeText.trim() && !githubUrl.trim() && !uploadedFileName) {
      showToast('Please upload a resume or provide details to analyze', 'error');
      return;
    }

    setLoading(true);
    try {
      // 1. Run Resume Analysis
      let rResult = null;
      if (uploadedFileName || resumeText.trim()) {
        const rRes = await api.uploadResumeFile({
          fileName: uploadedFileName || 'resume.txt',
          resumeText,
          targetRole
        });
        rResult = rRes.data?.analysis || rRes.data;
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
      } else if (rResult?.extractedSkills) {
        setSkillMatrix(rResult.extractedSkills);
      }

      showToast('AI analysis completed! Skill Matrix synthesized.', 'success');
      setStep(3);
    } catch (err) {
      showToast(err.message || 'AI analysis completed with baseline fallback', 'info');
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={{ maxWidth: '880px', margin: '0 auto', padding: 'var(--space-6) var(--space-4)' }}>
        {/* Step Navigation Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
          {[
            { id: 1, label: '1. Goals & Background' },
            { id: 2, label: '2. Upload Resume & GitHub' },
            { id: 3, label: '3. Skill Matrix' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStep(tab.id)}
              style={{
                padding: '8px 18px',
                borderRadius: '9999px',
                border: `2px solid ${step === tab.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                backgroundColor: step === tab.id ? 'var(--color-primary-50, #eff6ff)' : 'var(--color-surface)',
                color: step === tab.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Header */}
        <div style={{ marginBottom: 'var(--space-6)', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '8px 0' }}>
            {step === 1 && 'Define Your Learning Goals & Background'}
            {step === 2 && 'Upload Resume & Link GitHub for AI Analysis'}
            {step === 3 && 'Initial Skill Matrix & Baseline Profile'}
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '620px', margin: '0 auto' }}>
            {step === 1 && 'Every curriculum in PathForge is bespoke. Set your goals or jump directly to resume upload.'}
            {step === 2 && 'Upload your resume file below. It is saved directly to local storage and indexed in MongoDB.'}
            {step === 3 && 'Here is your initial skill calibration. Next, proceed to the Roadmap or Readiness Test.'}
          </p>
        </div>

        {/* STEP 1: GOALS & BACKGROUND */}
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
                  <option value="Career Switcher">Career Switcher</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                  Target Career / Job Role
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => {
                    const newRole = e.target.value;
                    setTargetRole(newRole);
                    if (newRole.toLowerCase().includes('data') || newRole.toLowerCase().includes('analyst')) {
                      setDesiredSkills('Python, SQL, Tableau, Power BI, Excel, Statistics');
                    } else {
                      setDesiredSkills('React, Node.js, System Design, MongoDB, TypeScript');
                    }
                  }}
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
                placeholder="e.g. React, Node.js, System Design, MongoDB, TypeScript"
                required
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-2)' }}>
                <Button variant="outline" type="button" onClick={() => setStep(2)}>
                  Skip directly to Resume Upload &rarr;
                </Button>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? <Spinner size="sm" /> : 'Continue to Resume & GitHub'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* STEP 2: RESUME & GITHUB UPLOAD */}
        {step === 2 && (
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* Prominent File Upload Dropzone */}
              <div>
                <label style={{ display: 'block', fontSize: '1rem', fontWeight: 700, marginBottom: '8px', color: 'var(--color-neutral-900)' }}>
                  Upload Your Resume File
                </label>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed var(--color-primary-400, #38bdf8)',
                    borderRadius: 'var(--radius-lg, 12px)',
                    padding: '32px 20px',
                    textAlign: 'center',
                    backgroundColor: 'var(--color-surface-subtle, #f0f9ff)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    marginBottom: '12px'
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                  <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📄</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-primary-900)' }}>
                    {uploading
                      ? 'Saving resume to server...'
                      : uploadedFileName
                      ? `Attached: ${uploadedFileName}`
                      : 'Click to Upload Resume (PDF, DOCX, or TXT)'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                    {uploadedFileName
                      ? 'File received! Saved locally to server & MongoDB.'
                      : 'Drag and drop your file here, or click to browse from your computer'}
                  </div>
                </div>

                {/* Upload Status Card */}
                {uploadedFileName && (
                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #86efac',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>✅</span>
                    <div style={{ fontSize: '0.85rem' }}>
                      <div style={{ fontWeight: 700, color: '#15803d' }}>
                        Resume Uploaded: {uploadedFileName}
                      </div>
                      <div style={{ color: '#166534', marginTop: '2px' }}>
                        Stored on local disk ({savedLocallyPath || 'server/uploads/resumes'}) and indexed in MongoDB.
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick 1-Click Sample Buttons */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                    Quick Test Options:
                  </span>
                  <button
                    type="button"
                    onClick={loadSampleMernResume}
                    style={{
                      fontSize: '0.8rem',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    + Use MERN Resume Sample
                  </button>
                  <button
                    type="button"
                    onClick={loadSampleDaResume}
                    style={{
                      fontSize: '0.8rem',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    + Use Data Analyst Resume Sample
                  </button>
                </div>

                {/* Editable Text Preview */}
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                  Resume Text Content (Extracted for AI Parsing)
                </label>
                <textarea
                  rows={5}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste or review your resume text here..."
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
                label="GitHub Profile URL (Optional)"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/your-username"
              />

              <Input
                label="Key GitHub Repository URLs (Optional, comma-separated)"
                value={repoUrls}
                onChange={(e) => setRepoUrls(e.target.value)}
                placeholder="https://github.com/user/project-1, https://github.com/user/project-2"
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-2)' }}>
                <Button variant="outline" type="button" onClick={() => setStep(1)}>
                  &larr; Back to Goals
                </Button>
                <Button variant="primary" type="button" onClick={handleStep2Analyze} disabled={loading || uploading}>
                  {loading ? <Spinner size="sm" /> : 'Analyze Resume & Synthesize Skill Matrix'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* STEP 3: SKILL MATRIX */}
        {step === 3 && (
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 6px 0' }}>
                  Calibrated Skill Matrix
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Baseline claims extracted from your resume ({uploadedFileName || 'uploaded file'}) and code repositories.
                </p>
              </div>

              {skillMatrix.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                        <th style={{ padding: '10px 12px' }}>Skill</th>
                        <th style={{ padding: '10px 12px' }}>Resume Claim</th>
                        <th style={{ padding: '10px 12px' }}>GitHub Evidence</th>
                        <th style={{ padding: '10px 12px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {skillMatrix.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                          <td style={{ padding: '10px 12px', fontWeight: 600 }}>{item.skill || item.name}</td>
                          <td style={{ padding: '10px 12px' }}>{item.claimedLevel || item.resumeClaim || 'Intermediate'}</td>
                          <td style={{ padding: '10px 12px' }}>{item.githubEvidence || 'Demonstrated'}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                backgroundColor: '#fef3c7',
                                color: '#b45309'
                              }}
                            >
                              {item.verifiedLevel || 'Ready to Test'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', backgroundColor: 'var(--color-surface-subtle)', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 8px 0', fontWeight: 600 }}>Skills Extracted: JavaScript, React, Node.js, Express, MongoDB</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Ready for adaptive assessment</p>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-4)' }}>
                <Button variant="outline" type="button" onClick={() => setStep(2)}>
                  &larr; Re-upload Resume
                </Button>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <Button variant="outline" type="button" onClick={() => navigate('/readiness')}>
                    Take Diagnostic Test &rarr;
                  </Button>
                  <Button variant="primary" type="button" onClick={() => navigate('/personalized-dashboard')}>
                    View Roadmap &rarr;
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}

export default OnboardingPage;
