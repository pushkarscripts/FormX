import React from 'react';

export default function Card({
  children,
  hoverable = false,
  variant = 'white',
  className = '',
  ...props
}) {
  const baseClasses = 'border-2 border-black p-5 sm:p-6 transition-all';
  
  const variantClasses = {
    white: 'bg-white text-black shadow-brutal',
    dark: 'bg-[#121212] text-white shadow-brutal',
    cyan: 'bg-[#00f0ff] text-black shadow-brutal',
    yellow: 'bg-[#ffe600] text-black shadow-brutal',
    offwhite: 'bg-[#f7f7f4] text-black shadow-brutal',
  }[variant] || 'bg-white text-black shadow-brutal';

  const hoverClasses = hoverable
    ? 'hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-lg'
    : '';

  return (
    <div className={`${baseClasses} ${variantClasses} ${hoverClasses} ${className}`} {...props}>
      {children}
    </div>
  );
}
