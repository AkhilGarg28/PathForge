import { useContext } from 'react';
import { RoadmapGenerationContext } from '../context/roadmapGenerationContextDef.js';

export function useRoadmapGeneration() {
  const context = useContext(RoadmapGenerationContext);
  if (!context) {
    throw new Error(
      'useRoadmapGeneration must be used within a <RoadmapGenerationProvider>',
    );
  }
  return context;
}
