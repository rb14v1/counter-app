import { ButtonProps } from '../types';

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-v1-teal hover:bg-teal-500 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
};

export function Button({ label, onClick, variant = 'primary', disabled = false, className = '' }: ButtonProps) {
  const base = 'px-4 py-2 rounded-lg font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-v1-teal disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClass = variantClasses[variant];

  return (
    <button
      className={`${base} ${variantClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}