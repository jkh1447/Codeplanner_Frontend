import React from 'react';

interface SpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 28, color = '#64748b', className = '' }) => (
  <svg
    className={`animate-spin ${className}`}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    style={{ display: 'inline-block' }}
  >
    {/* 연한 전체 원 */}
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke={color}
      strokeWidth="4"
      className="opacity-20"
    />
    {/* 진한 원호(arc) */}
    <path
      d="M12 2a10 10 0 1 1-7.07 2.93"
      stroke={color}
      strokeWidth="4"
      strokeLinecap="round"
      className="opacity-90"
    />
  </svg>
);

export default Spinner;
