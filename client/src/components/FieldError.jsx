import React from 'react';

export default function FieldError({ children, className = '' }) {
  if (!children) return null;
  return (
    <div
      className={`mt-2 flex items-start gap-2 border-2 border-black bg-[#ff3b30] px-3 py-2 text-xs sm:text-sm font-mono font-bold text-white shadow-brutal-sm ${className}`}
      role="alert"
    >
      <span className="inline-flex items-center justify-center bg-black text-white w-4 h-4 text-xs font-black shrink-0 mt-0.5 select-none">
        !
      </span>
      <span className="flex-1 leading-snug">{children}</span>
    </div>
  );
}
