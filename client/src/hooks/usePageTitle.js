import { useEffect } from 'react';

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title
      ? `${title} | PathForge`
      : 'PathForge | Personalized Employability Roadmaps';
  }, [title]);
}

export default usePageTitle;
