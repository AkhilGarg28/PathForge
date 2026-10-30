import { useEffect } from 'react';

/**
 * Custom hook to dynamically manage document.title per route for accessibility and tab management.
 * Formats titles as: "<Title> | PathForge" (or default brand title).
 */
export function usePageTitle(title) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title ? `${title} | PathForge` : 'PathForge';
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
}

export default usePageTitle;
