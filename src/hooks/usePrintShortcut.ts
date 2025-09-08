import { useEffect, useRef } from 'react';

/**
 * Custom hook for handling print keyboard shortcut (Ctrl+P or Cmd+P)
 * @param callback - Function to execute when the shortcut is pressed
 */
export const usePrintShortcut = (callback: () => void) => {
  // Use ref to store the latest version of the callback
  const callbackRef = useRef(callback);

  // Update the ref whenever the callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key == 'p') {
        e.preventDefault();
        callbackRef.current();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // Empty dependency array - event listener is set up once
};
