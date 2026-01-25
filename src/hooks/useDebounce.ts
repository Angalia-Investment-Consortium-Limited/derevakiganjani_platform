import { useState, useEffect } from 'react';

/**
 * Custom hook for debouncing a value
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns [debouncedValue, setValue] - The debounced value and setter function
 */
function useDebounce<T = string>(initialValue: T = '' as T, delay: number = 500): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return [debouncedValue, setValue];
}

export default useDebounce;
