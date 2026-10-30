import React from 'react';
import { Card } from './Card.jsx';
import { Button } from './Button.jsx';
import { Spinner } from './Spinner.jsx';

export function TopicGuideModal({ guide, loading, onClose }) {
  if (!guide && !loading) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="topic-guide-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 'var(--space-4)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: 'var(--color-bg-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          padding: 'var(--space-6)'
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <Spinner size="lg" />
            <p style={{ marginTop: 'var(--space-3)', color: 'var(--color-text-muted)' }}>
              Generating comprehensive learning guide...
            </p>
          </div>
        ) : (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 'var(--space-4)',
                borderBottom: '1px solid var(--color-border)',
                paddingBottom: 'var(--space-3)'
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 700,
                    color: 'var(--color-primary)'
                  }}
                >
                  AI Learning Resource • Deep Dive
                </span>
                <h2 id="topic-guide-title" style={{ fontSize: '1.5rem', fontWeight: 700, margin: '4px 0 0' }}>
                  {guide.topicTitle}
                </h2>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close modal">
                ✕
              </Button>
            </div>

            {/* Explanation */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                Conceptual Overview
              </h3>
              <p style={{ lineHeight: 1.6, color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                {guide.easyExplanation}
              </p>
            </div>

            {/* Core Concepts */}
            {guide.coreConcepts?.length > 0 && (
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                  Core Concepts
                </h3>
                <ul style={{ paddingLeft: '20px', margin: 0, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                  {guide.coreConcepts.map((c, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Code Examples */}
            {guide.codeExamples?.length > 0 && (
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                  Practical Code Pattern
                </h3>
                {guide.codeExamples.map((ex, i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: '#0f172a',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-3)',
                      marginBottom: 'var(--space-2)',
                      border: '1px solid #1e293b'
                    }}
                  >
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>
                      {ex.title}
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        color: '#38bdf8',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        overflowX: 'auto',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {ex.code}
                    </pre>
                    {ex.explanation && (
                      <p style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '6px', margin: 0 }}>
                        {ex.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Real World Use Cases & Common Pitfalls */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              {guide.realWorldUseCases?.length > 0 && (
                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-base)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-success)', margin: '0 0 6px' }}>
                    Production Use Cases
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                    {guide.realWorldUseCases.map((u, i) => <li key={i}>{u}</li>)}
                  </ul>
                </div>
              )}
              {guide.commonPitfalls?.length > 0 && (
                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-base)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-danger, #ef4444)', margin: '0 0 6px' }}>
                    Common Pitfalls to Avoid
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                    {guide.commonPitfalls.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </div>
              )}
            </div>

            {/* Official Documentation */}
            {guide.recommendedDocumentation?.length > 0 && (
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                  Recommended Documentation
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {guide.recommendedDocumentation.map((doc, i) => (
                    <a
                      key={i}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        backgroundColor: 'var(--color-primary-subtle)',
                        color: 'var(--color-primary)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.85rem',
                        textDecoration: 'none',
                        fontWeight: 500
                      }}
                    >
                      <span>📖 {doc.title}</span>
                      <span style={{ fontSize: '0.75rem' }}>↗</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div style={{ textAlign: 'right', marginTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)' }}>
              <Button variant="primary" onClick={onClose}>
                Got it, Continue Learning
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TopicGuideModal;
