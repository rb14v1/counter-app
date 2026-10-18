import { useCounter } from '../hooks/useCounter';
import { CounterCard } from '../components/CounterCard';
import { Header } from '../components/Header';

export function Dashboard() {
  const { counter, loading, error, increment, decrement, reset, setValue } = useCounter();

  return (
    <div className="min-h-screen bg-v1-cream flex flex-col">
      <Header title="Counter Dashboard" />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-v1-dark mb-1">Your Counter</h2>
            <p className="text-gray-500 text-sm">
              Use the controls below to increment, decrement, reset, or set a custom value. Changes are persisted automatically.
            </p>
          </div>
          {error && (
            <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {loading && <p className="mb-4 text-center text-sm text-gray-500">Loading counter...</p>}
          <CounterCard
            counter={counter}
            onIncrement={increment}
            onDecrement={decrement}
            onReset={reset}
            onSetValue={setValue}
          />
          <div className="mt-6 text-center text-xs text-gray-400">
            Value is saved to <span className="font-mono bg-gray-100 px-1 rounded">MySQL</span> automatically.
          </div>
        </div>
      </main>
    </div>
  );
}