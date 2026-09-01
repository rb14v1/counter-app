import { useLocalStorage } from '../hooks/useLocalStorage';
import { CounterCard } from '../components/CounterCard';
import { Header } from '../components/Header';

export function Dashboard() {
  const { counter, increment, decrement, reset, setValue } = useLocalStorage();

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
          <CounterCard
            counter={counter}
            onIncrement={increment}
            onDecrement={decrement}
            onReset={reset}
            onSetValue={setValue}
          />
          <div className="mt-6 text-center text-xs text-gray-400">
            Value is saved to <span className="font-mono bg-gray-100 px-1 rounded">localStorage</span> automatically.
          </div>
        </div>
      </main>
    </div>
  );
}