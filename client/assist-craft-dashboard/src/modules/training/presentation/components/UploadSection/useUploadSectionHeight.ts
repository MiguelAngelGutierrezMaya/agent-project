import { useEffect, useRef } from 'react';

/**
 * Custom hook to sync UploadSection height with tables container height
 * Ensures the UploadSection card has the same height as the combined tables
 */
export const useUploadSectionHeight = () => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateHeight = () => {
      const tablesContainer = document.getElementById('tables-container');
      if (tablesContainer && cardRef.current) {
        const tablesHeight = tablesContainer.offsetHeight;
        cardRef.current.style.minHeight = `${tablesHeight}px`;
      }
    };

    /* Update on mount */
    updateHeight();

    /* Use a small delay to ensure DOM is fully rendered */
    const timeoutId = setTimeout(updateHeight, 100);

    /* Update when window resizes */
    window.addEventListener('resize', updateHeight);

    /* Use ResizeObserver to watch for changes in tables container */
    const tablesContainer = document.getElementById('tables-container');
    let resizeObserver: ResizeObserver | null = null;

    if (tablesContainer) {
      resizeObserver = new ResizeObserver(updateHeight);
      resizeObserver.observe(tablesContainer);
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateHeight);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  return cardRef;
};
