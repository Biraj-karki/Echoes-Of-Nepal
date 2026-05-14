import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input = ({
  label,
  error,
  helperText,
  fullWidth = true,
  className = '',
  ...props
}: InputProps) => {
  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="text-xs font-semibold text-slate-400 ml-1">
          {label}
        </label>
      )}
      <input
        className={`
          bg-slate-800 
          border 
          rounded-xl 
          px-4 
          py-2.5 
          text-sm 
          text-white 
          placeholder:text-slate-500 
          transition-all 
          duration-200 
          focus:outline-none 
          focus:ring-2 
          focus:ring-blue-500/20 
          ${error ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-blue-500/50'} 
          ${className}
        `}
        {...props}
      />
      {error ? (
        <span className="text-[10px] text-red-400 ml-1">{error}</span>
      ) : helperText ? (
        <span className="text-[10px] text-slate-500 ml-1">{helperText}</span>
      ) : null}
    </div>
  );
};
