import { useCallback, useEffect, useState } from 'react';
import { Counter } from '../types';
import { counterApi } from '../api';

const initialCounter: Counter = { value: 0 };

export function useCounter() {
  const [counter, setCounter] = useState<Counter>(initialCounter);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (action: () => Promise<Counter>) => {
    try {
      setError(null);
      setCounter(await action());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }, []);

  useEffect(() => {
    run(counterApi.get).finally(() => setLoading(false));
  }, [run]);

  return {
    counter,
    loading,
    error,
    increment: () => run(counterApi.increment),
    decrement: () => run(counterApi.decrement),
    reset: () => run(counterApi.reset),
    setValue: (value: number) => run(() => counterApi.setValue(value)),
  };
}
