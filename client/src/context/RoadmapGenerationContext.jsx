import { useState, useCallback } from 'react';
import * as api from '../services/api.js';
import { RoadmapGenerationContext } from './roadmapGenerationContextDef.js';

export function RoadmapGenerationProvider({ children }) {
  const [generationState, setGenerationState] = useState('idle'); // 'idle' | 'generating' | 'success' | 'error'
  const [payload, setPayload] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const startGeneration = useCallback(async ({ roleId, answers }) => {
    const submissionPayload = { roleId, answers };
    setPayload(submissionPayload);
    setGenerationState('generating');
    setError(null);

    try {
      const data = await api.submitDiagnostic(submissionPayload);
      setResult(data);
      setGenerationState('success');
      return data;
    } catch (err) {
      setError(err);
      setGenerationState('error');
      throw err;
    }
  }, []);

  const retryGeneration = useCallback(async () => {
    if (!payload) return;
    setGenerationState('generating');
    setError(null);

    try {
      const data = await api.submitDiagnostic(payload);
      setResult(data);
      setGenerationState('success');
      return data;
    } catch (err) {
      setError(err);
      setGenerationState('error');
      throw err;
    }
  }, [payload]);

  const resetGeneration = useCallback(() => {
    setGenerationState('idle');
    setPayload(null);
    setResult(null);
    setError(null);
  }, []);

  const value = {
    generationState,
    payload,
    result,
    error,
    startGeneration,
    retryGeneration,
    resetGeneration,
  };

  return (
    <RoadmapGenerationContext.Provider value={value}>
      {children}
    </RoadmapGenerationContext.Provider>
  );
}
