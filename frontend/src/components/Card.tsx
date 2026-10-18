import { CardProps } from '../types';

export function Card({ title, children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
      {title && (
        <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b border-gray-100 pb-2">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}