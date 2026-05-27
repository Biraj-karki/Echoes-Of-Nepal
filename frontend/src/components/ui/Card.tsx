import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card = ({
  children,
  className = '',
  onClick,
  hoverable = false,
}: CardProps) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-slate-900 
        border border-white/10 
        rounded-2xl 
        p-6 
        shadow-md 
        transition-all 
        duration-300 
        ${hoverable ? 'hover:border-white/20 hover:shadow-xl hover:-translate-y-1 cursor-pointer' : ''} 
        ${className}
      `}
    >
      {children}
    </div>
  );
};
