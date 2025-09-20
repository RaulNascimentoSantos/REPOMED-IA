import { useEffect, useCallback } from 'react';

export const useHotkeys = (keys: string, callback: () => void, dependencies: any[] = []) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const modifiers: string[] = [];
    
    if (event.ctrlKey || event.metaKey) modifiers.push('cmd');
    if (event.altKey) modifiers.push('alt');
    if (event.shiftKey) modifiers.push('shift');
    
    const key = event.key.toLowerCase();
    const combo = [...modifiers, key].join('+');
    
    if (combo === keys.toLowerCase()) {
      event.preventDefault();
      callback();
    }
  }, [keys, callback, ...dependencies]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};