export interface Counter {
  value: number;
}

export interface CounterCardProps {
  counter: Counter;
  onIncrement: () => void;
  onDecrement: () => void;
  onReset: () => void;
  onSetValue: (value: number) => void;
}

export interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  className?: string;
}

export interface CardProps {
  title?: string;
  children: import('react').ReactNode;
  className?: string;
}

export interface HeaderProps {
  title: string;
}