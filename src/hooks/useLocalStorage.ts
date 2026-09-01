import { useState, useEffect } from 'react';
import { Counter } from '../types';

const STORAGE_KEY = 'app_counter';

const defaultCounter: Counter = { value: 0 };

export function useLocalStorage() {
  const [counter, setCounter] = useState<Counter>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as Counter;
      }
    } catch {
      // ignore
    }
    return defaultCounter;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(counter));
    } catch {
      // ignore
    }
  }, [counter]);

  function increment() {
    setCounter((prev) => ({ value: prev.value + 1 }));
  }

  function decrement() {
    setCounter((prev) => ({ value: prev.value - 1 }));
  }

  function reset() {
    setCounter({ value: 0 });
  }

  function setValue(value: number) {
    setCounter({ value });
  }

  return {
    counter,
    increment,
    decrement,
    reset,
    setValue,
  };
}