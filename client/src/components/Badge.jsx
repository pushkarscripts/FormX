import React from 'react';

export default function Badge({
  children,
  variant = 'cyan',
  dot = false,
  className = '',
  ...props
}) {
  const baseClasses = 'inline-flex items-center gap-1.5 border-2 border-black px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider shadow-brutal-sm select-none';

  const variantClasses = {
    cyan: 'bg-[#00f0ff] text-black',
    green: 'bg-[#00d66c] text-black',
    yellow: 'bg-[#ffe600] text-black',
    red: 'bg-[#ff3b30] text-white',
    dark: 'bg-[#121212] text-white',
    gray: 'bg-neutral-200 text-neutral-800',
    white: 'bg-white text-black',
  }[variant] || 'bg-[#00f0ff] text-black';

  const dotColorClasses = {
    cyan: 'bg-black',
    green: 'bg-black',
    yellow: 'bg-black',
    red: 'bg-white',
    dark: 'bg-[#00f0ff]',
    gray: 'bg-neutral-700',
    white: 'bg-black',
  }[variant] || 'bg-black';

  return (
    <span className={`${baseClasses} ${variantClasses} ${className}`} {...props}>
      {dot && <span className={`inline-block w-2 h-2 rounded-full border border-black ${dotColorClasses}`} />}
      {children}
    </span>
  );
}
