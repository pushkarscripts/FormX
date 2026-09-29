import React from 'react';
import { Link } from 'react-router-dom';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  className = '',
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center font-bold uppercase tracking-wider border-2 border-black transition-all select-none';
  
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5',
  }[size] || 'px-4 py-2.5 text-sm gap-2';

  const variantClasses = {
    primary: 'bg-[#00f0ff] text-black shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#00d5e3] hover:shadow-brutal-lg active:translate-x-0.5 active:translate-y-0.5 active:shadow-brutal-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-brutal',
    secondary: 'bg-white text-black shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-neutral-50 hover:shadow-brutal-lg active:translate-x-0.5 active:translate-y-0.5 active:shadow-brutal-sm disabled:cursor-not-allowed disabled:opacity-50',
    dark: 'bg-[#121212] text-white shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-neutral-900 hover:shadow-brutal-cyan active:translate-x-0.5 active:translate-y-0.5 active:shadow-brutal-sm disabled:cursor-not-allowed disabled:opacity-50',
    danger: 'bg-white text-[#ff3b30] shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#ff3b30] hover:text-white hover:shadow-brutal-lg active:translate-x-0.5 active:translate-y-0.5 active:shadow-brutal-sm disabled:cursor-not-allowed disabled:opacity-50',
    dangerSolid: 'bg-[#ff3b30] text-white shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#e02b21] hover:shadow-brutal-lg active:translate-x-0.5 active:translate-y-0.5 active:shadow-brutal-sm disabled:cursor-not-allowed disabled:opacity-50',
    yellow: 'bg-[#ffe600] text-black shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#ffd000] hover:shadow-brutal-lg active:translate-x-0.5 active:translate-y-0.5 active:shadow-brutal-sm disabled:cursor-not-allowed disabled:opacity-50',
    ghost: 'bg-transparent text-black border-transparent hover:border-black hover:bg-neutral-100 active:bg-neutral-200',
    icon: 'bg-white text-black px-2 py-1 shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#00f0ff] hover:shadow-brutal active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-30',
  }[variant] || '';

  const combinedClasses = `${baseClasses} ${sizeClasses} ${variantClasses} ${className}`;

  if (to) {
    return (
      <Link to={to} className={combinedClasses} {...props}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={combinedClasses} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={combinedClasses}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
