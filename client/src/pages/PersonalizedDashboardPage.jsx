import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout.jsx';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { Spinner } from '../components/Spinner.jsx';
import { ProgressBar } from '../components/ProgressBar.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../services/api.js';
import { AITutorDrawer } from '../components/AITutorDrawer.jsx';
import { TopicGuideModal } from '../components/TopicGuideModal.jsx';

export function PersonalizedDashboardPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('roadmap'); // 'roadmap' | 'tasks' | 'skills' | 'quizzes' | 'analytics'
  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [expandedWeek, setExpandedWeek] = useState(1);

  // Topic Guide Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [topicGuide, setTopicGuide] = useState(null);
  const [guideLoading, setGuideLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [rRes, aRes] = await Promise.allSettled([
        api.getPersonalizedRoadmap(),
        api.getAnalyticsOverview()
      ]);

      if (rRes.status === 'fulfilled' && rRes.value.data?.roadmap) {
        setRoadmap(rRes.value.data.roadmap);
        setExpandedWeek(rRes.value.data.roadmap.currentWeekNumber || 1);
      }
      if (aRes.status === 'fulfilled' && aRes.value.data) {
        setAnalytics(aRes.value.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (weekNumber, dayIndex) => {
    try {
      await api.toggleDailyTask({ weekNumber, dayIndex });
      // Optimistically update local roadmap task state
      setRoadmap((prev) => {
        if (!prev) return prev;
        const updatedWeeks = prev.weeks.map((w) => {
          if (w.weekNumber === weekNumber) {
            const updatedTasks = [...w.dailyTasks];
            if (updatedTasks[dayIndex]) {
              updatedTasks[dayIndex] = {
                ...updatedTasks[dayIndex],
                isCompleted: !updatedTasks[dayIndex].isCompleted
              };
            }
            return { ...w, dailyTasks: updatedTasks };
          }
          return w;
        });
        return { ...prev, weeks: updatedWeeks };
      });
      showToast('Task updated!', 'success');
    } catch (err) {
      showToast('Failed to update task', 'error');
    }
  };

  const handleOpenTopicGuide = async (topicTitle, skill) => {
    setModalOpen(true);
    setGuideLoading(true);
    try {
      const res = await api.getTopicGuide({ topicTitle, skill });
      if (res.data?.guide) {
        setTopicGuide(res.data.guide);
      }
    } catch (err) {
      showToast('Failed to load deep-dive topic guide', 'error');
      setModalOpen(false);
    } finally {
      setGuideLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <Spinner size="lg" />
          <p style={{ marginTop: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>
            Loading your personalized learning curriculum...
          </p>
        </div>
      </Layout>
    );
  }

  // Fallback if no personalized roadmap exists yet
  if (!roadmap) {
    return (
      <Layout>
        <div style={{ maxWidth: '640px', margin: 'var(--space-10) auto', textAlign: 'center' }}>
          <Card>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>
              Welcome to Your Learning Journey!
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
              You have not generated your personalized 12-week roadmap yet. Start with our intelligent onboarding to extract your skills and build a tailored learning path.
            </p>
            <Button variant="primary" size="lg" onClick={() => navigate('/onboarding')}>
              Start Personalized Onboarding →
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  const currentWeekData = roadmap.weeks?.find((w) => w.weekNumber === (roadmap.currentWeekNumber || 1)) || roadmap.weeks?.[0];
  const activeTopic = currentWeekData?.dailyTasks?.[0]?.topic || '';

  return (
    <Layout>
      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: 'var(--space-6) var(--space-4)' }}>
        {/* Top Overview Banner */}
        <div
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-6)',
            marginBottom: 'var(--space-6)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-4)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--color-primary-subtle)',
                  color: 'var(--color-primary)'
                }}
              >
                Target: {roadmap.targetRole || 'Software Engineer'}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  color: '#10b981'
                }}
              >
                Roadmap v{roadmap.version || 1} (Adaptive)
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '4px 0' }}>
              {roadmap.title || '12-Week Master Curriculum'}
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              Active on <strong>Week {roadmap.currentWeekNumber || 1}</strong> of {roadmap.totalWeeks || 12} •{' '}
              {roadmap.progressPercent || 0}% Completed
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Button
              variant="primary"
              onClick={() => navigate(`/weekly-quiz/${roadmap.currentWeekNumber || 1}`)}
              style={{ backgroundColor: 'var(--color-primary)', fontWeight: 600 }}
            >
              Take Week {roadmap.currentWeekNumber || 1} Quiz 📝
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '1px solid var(--color-border)',
            marginBottom: 'var(--space-6)',
            overflowX: 'auto',
            paddingBottom: '2px'
          }}
        >
          {[
            { id: 'roadmap', label: '🗺️ My Roadmap' },
            { id: 'tasks', label: '✅ Today\'s Tasks' },
            { id: 'skills', label: '📊 My Skills Matrix' },
            { id: 'quizzes', label: '📝 Weekly Quizzes' },
            { id: 'analytics', label: '📈 Progress & Analytics' }
          ].map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--color-bg-surface)' : 'transparent',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: MY ROADMAP (12-Week Multi-Phase View) */}
        {activeTab === 'roadmap' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {roadmap.weeks?.map((w) => {
              const isExpanded = expandedWeek === w.weekNumber;
              const isCurrent = (roadmap.currentWeekNumber || 1) === w.weekNumber;
              const completedTasksCount = w.dailyTasks?.filter((t) => t.isCompleted).length || 0;
              const totalTasksCount = w.dailyTasks?.length || 7;

              return (
                <Card key={w.weekNumber}>
                  {/* Week Header */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      padding: '4px 0'
                    }}
                    onClick={() => setExpandedWeek(isExpanded ? null : w.weekNumber)}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: isCurrent ? 'var(--color-primary)' : 'var(--color-bg-base)',
                            color: isCurrent ? '#ffffff' : 'var(--color-text-secondary)',
                            border: isCurrent ? 'none' : '1px solid var(--color-border)'
                          }}
                        >
                          WEEK {w.weekNumber}
                        </span>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                          {w.title}
                        </h3>
                        {w.isRemedial && (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              color: '#dc2626',
                              fontWeight: 700
                            }}
                          >
                            REMEDIAL INSERT
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        Focus: {w.focusSkills?.join(', ')} • {completedTasksCount}/{totalTasksCount} tasks complete
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                        {Math.round((completedTasksCount / totalTasksCount) * 100)}%
                      </span>
                      <span style={{ fontSize: '1.2rem', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                        ▼
                      </span>
                    </div>
                  </div>

                  {/* Expanded Daily Tasks List */}
                  {isExpanded && (
                    <div style={{ marginTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        {w.dailyTasks?.map((task, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              justifyContent: 'space-between',
                              gap: '12px',
                              padding: '12px',
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: task.isCompleted ? 'rgba(34, 197, 94, 0.04)' : 'var(--color-bg-base)',
                              border: task.isCompleted ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid var(--color-border)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                              <input
                                type="checkbox"
                                checked={task.isCompleted}
                                onChange={() => handleToggleTask(w.weekNumber, idx)}
                                style={{ marginTop: '4px', width: '18px', height: '18px', cursor: 'pointer' }}
                              />
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                                    Day {task.dayNumber}:
                                  </span>
                                  <strong style={{ fontSize: '0.95rem', textDecoration: task.isCompleted ? 'line-through' : 'none' }}>
                                    {task.title}
                                  </strong>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '4px 0 6px' }}>
                                  {task.explanation}
                                </p>
                                {task.practicalExercise && (
                                  <div
                                    style={{
                                      fontSize: '0.8rem',
                                      padding: '6px 10px',
                                      backgroundColor: 'var(--color-bg-surface)',
                                      borderRadius: '4px',
                                      color: 'var(--color-primary)',
                                      fontWeight: 500
                                    }}
                                  >
                                    💡 <strong>Exercise:</strong> {task.practicalExercise}
                                  </div>
                                )}
                              </div>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenTopicGuide(task.topic || task.title, w.focusSkills?.[0] || 'Software Engineering')}
                              style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}
                            >
                              📖 Study Guide
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* Week Assessment Link */}
                      <div style={{ textAlign: 'right', marginTop: 'var(--space-3)' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/weekly-quiz/${w.weekNumber}`)}
                        >
                          Take Week {w.weekNumber} Quiz →
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* TAB 2: TODAY'S TASKS */}
        {activeTab === 'tasks' && (
          <Card>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
              Active Learning Tasks • Week {roadmap.currentWeekNumber || 1}
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--space-4)' }}>
              Complete each daily micro-lesson and interactive coding exercise to stay on track.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {currentWeekData?.dailyTasks?.map((task, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    padding: '14px',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: task.isCompleted ? 'rgba(34, 197, 94, 0.05)' : 'var(--color-bg-base)',
                    border: task.isCompleted ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid var(--color-border)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <input
                      type="checkbox"
                      checked={task.isCompleted}
                      onChange={() => handleToggleTask(roadmap.currentWeekNumber || 1, idx)}
                      style={{ marginTop: '4px', width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                          DAY {task.dayNumber}
                        </span>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, textDecoration: task.isCompleted ? 'line-through' : 'none' }}>
                          {task.title}
                        </h3>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: '6px 0' }}>
                        {task.explanation}
                      </p>
                      {task.practicalExercise && (
                        <div
                          style={{
                            fontSize: '0.8rem',
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--color-bg-surface)',
                            color: 'var(--color-primary)',
                            display: 'inline-block'
                          }}
                        >
                          💻 {task.practicalExercise}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenTopicGuide(task.topic || task.title, currentWeekData?.focusSkills?.[0] || 'Software Engineering')}
                  >
                    Deep Dive
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* TAB 3: MY SKILLS MATRIX */}
        {activeTab === 'skills' && (
          <Card>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
              Verified Skill Matrix & Proficiency Levels
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--space-4)' }}>
              Track your authentic competency progression across resume claims, GitHub repository evidence, and adaptive quiz evaluations.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {(analytics?.skillMatrix?.length > 0 ? analytics.skillMatrix : [
                { skill: 'JavaScript', resumeClaim: 'Advanced', githubEvidence: 'Intermediate', verifiedLevel: 'Intermediate', proficiencyScore: 75 },
                { skill: 'React', resumeClaim: 'Intermediate', githubEvidence: 'Intermediate', verifiedLevel: 'Intermediate', proficiencyScore: 80 },
                { skill: 'Node.js', resumeClaim: 'Intermediate', githubEvidence: 'Beginner', verifiedLevel: 'Beginner', proficiencyScore: 55 },
                { skill: 'System Design', resumeClaim: 'Beginner', githubEvidence: 'None', verifiedLevel: 'Beginner', proficiencyScore: 40 }
              ]).map((s, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg-base)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '0.95rem' }}>{s.skill}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        Claim: {s.resumeClaim} • Evidence: {s.githubEvidence}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        color: '#16a34a'
                      }}
                    >
                      {s.verifiedLevel} ({s.proficiencyScore}%)
                    </span>
                  </div>

                  <div
                    style={{
                      width: '100%',
                      height: '8px',
                      borderRadius: '9999px',
                      backgroundColor: 'var(--color-border)',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${s.proficiencyScore}%`,
                        backgroundColor: s.proficiencyScore >= 70 ? 'var(--color-success)' : 'var(--color-primary)',
                        borderRadius: '9999px',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* TAB 4: WEEKLY QUIZZES */}
        {activeTab === 'quizzes' && (
          <Card>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
              Adaptive Weekly Assessment History
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--space-4)' }}>
              Weekly quizzes dynamically calibrate the pace and difficulty of upcoming modules.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {roadmap.weeks?.map((w) => {
                const quizTrend = analytics?.quizTrends?.find((q) => q.weekNumber === w.weekNumber);
                const hasTaken = Boolean(quizTrend);

                return (
                  <div
                    key={w.weekNumber}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-bg-base)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                          Week {w.weekNumber} Assessment: {w.title}
                        </span>
                        {hasTaken && (
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: quizTrend.score >= 70 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: quizTrend.score >= 70 ? '#16a34a' : '#dc2626'
                            }}
                          >
                            Score: {quizTrend.score}%
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        Difficulty: {w.difficulty || 'Intermediate'} • Focus: {w.focusSkills?.join(', ')}
                      </div>
                    </div>

                    <Button
                      variant={hasTaken ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => navigate(`/weekly-quiz/${w.weekNumber}`)}
                    >
                      {hasTaken ? 'Review / Retake' : 'Take Quiz'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* TAB 5: PROGRESS & ANALYTICS */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
              <Card>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  INITIAL READINESS
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-text-primary)', margin: '8px 0' }}>
                  {analytics?.initialScore || 45}%
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  Evaluated from diagnostic & onboarding
                </div>
              </Card>

              <Card>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  CURRENT READINESS
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-success)', margin: '8px 0' }}>
                  {analytics?.currentReadinessScore || 78}%
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  Progression across completed quizzes
                </div>
              </Card>

              <Card>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  TASK CONSISTENCY
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-primary)', margin: '8px 0' }}>
                  {analytics?.completedTasks || 0} / {analytics?.totalTasks || 40}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  {analytics?.completionPercent || 0}% overall daily task completion
                </div>
              </Card>
            </div>

            {/* Strengths & Weaknesses Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
              <Card>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-success)', marginBottom: '8px' }}>
                  Verified Strengths
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(analytics?.strongTopics?.length > 0 ? analytics.strongTopics : ['React Hooks', 'JSX Components', 'Async/Await']).map((t, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        color: '#16a34a',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}
                    >
                      ✓ {t}
                    </span>
                  ))}
                </div>
              </Card>

              <Card>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f59e0b', marginBottom: '8px' }}>
                  Targeted Weak Areas
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(analytics?.weakTopics?.length > 0 ? analytics.weakTopics : ['Microtask timing', 'Database indexing']).map((t, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        color: '#f59e0b',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}
                    >
                      ⚡ {t}
                    </span>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Floating AI Mentor Chat Drawer */}
        <AITutorDrawer
          activeTopic={activeTopic}
          activeWeek={roadmap.currentWeekNumber || 1}
          skill={currentWeekData?.focusSkills?.[0] || 'Software Engineering'}
        />

        {/* Deep Dive Study Guide Modal */}
        <TopicGuideModal
          guide={topicGuide}
          loading={guideLoading}
          onClose={() => setModalOpen(false)}
        />
      </div>
    </Layout>
  );
}

export default PersonalizedDashboardPage;
