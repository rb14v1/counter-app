import { useState } from 'react';
import { CounterCardProps } from '../types';
import { Button } from './Button';
import { Card } from './Card';

export function CounterCard({ counter, onIncrement, onDecrement, onReset, onSetValue }: CounterCardProps) {
  const [inputValue, setInputValue] = useState<string>('');
  const [inputError, setInputError] = useState<string>('');

  function handleSetValue() {
    const parsed = parseInt(inputValue, 10);
    if (isNaN(parsed)) {
      setInputError('Please enter a valid integer.');
      return;
    }
    setInputError('');
    onSetValue(parsed);
    setInputValue('');
  }

  return (
    <Card title="Counter" className="max-w-md w-full mx-auto">
      <div className="flex flex-col items-center gap-6">
        {/* Display */}
        <div className="flex items-center justify-center w-40 h-40 rounded-full bg-v1-dark shadow-inner">
          <span className="text-5xl font-bold text-v1-teal tabular-nums">
            {counter.value}
          </span>
        </div>

        {/* Increment / Decrement */}
        <div className="flex gap-4">
          <button
            onClick={onDecrement}
            className="w-14 h-14 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-800 text-3xl font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-v1-teal"
            aria-label="Decrement"
          >
            −
          </button>
          <button
            onClick={onIncrement}
            className="w-14 h-14 rounded-full bg-v1-teal hover:bg-teal-500 text-white text-3xl font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-v1-teal"
            aria-label="Increment"
          >
            +
          </button>
        </div>

        {/* Reset */}
        <Button label="Reset to Zero" onClick={onReset} variant="danger" className="w-full" />

        {/* Set custom value */}
        <div className="w-full border-t border-gray-100 pt-4">
          <label className="block text-sm text-gray-500 mb-1 font-medium">Set a custom value</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setInputError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSetValue()}
              placeholder="Enter number…"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-v1-teal"
            />
            <Button label="Set" onClick={handleSetValue} variant="secondary" />
          </div>
          {inputError && (
            <p className="text-red-500 text-xs mt-1">{inputError}</p>
          )}
        </div>
      </div>
    </Card>
  );
}