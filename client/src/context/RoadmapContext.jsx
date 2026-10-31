import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const RoadmapContext = createContext(null);

export const RoadmapProvider = ({ children }) => {
  const { user } = useAuth();
  const [roadmap, setRoadmap] = useState(null);
  const [dimensionScores, setDimensionScores] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRoadmap = useCallback(async () => {
    if (!user) {
      setRoadmap(null);
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/roadmap');
      if (response.data && response.data.roadmap) {
        setRoadmap(response.data.roadmap);
        return response.data.roadmap;
      }
      setRoadmap(null);
      return null;
    } catch (err) {
      if (err.response?.status === 404) {
        // Expected when user has not generated a roadmap yet
        setRoadmap(null);
        return null;
      }
      const message = err.response?.data?.message || 'Failed to fetch roadmap';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.targetRole) {
      fetchRoadmap();
    } else {
      setRoadmap(null);
    }
  }, [user?.targetRole, fetchRoadmap]);

  const clearRoadmap = () => {
    setRoadmap(null);
    setDimensionScores(null);
  };

  return (
    <RoadmapContext.Provider
      value={{
        roadmap,
        setRoadmap,
        dimensionScores,
        setDimensionScores,
        loading,
        error,
        fetchRoadmap,
        clearRoadmap,
      }}
    >
      {children}
    </RoadmapContext.Provider>
  );
};

export const useRoadmap = () => {
  const context = useContext(RoadmapContext);
  if (!context) {
    throw new Error('useRoadmap must be used within a RoadmapProvider');
  }
  return context;
};
