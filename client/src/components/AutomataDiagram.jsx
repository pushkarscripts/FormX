import React from 'react';

export default function AutomataDiagram({ variant = 'hero', className = '' }) {
  if (variant === 'compact') {
    return (
      <div className={`border-2 border-black bg-white p-3 font-mono text-xs shadow-brutal-sm ${className}`}>
        <div className="flex items-center justify-between border-b border-neutral-200 pb-1.5 mb-2 text-[10px] text-neutral-500 font-bold tracking-wider uppercase">
          <span>Automaton M</span>
          <span className="text-[#00c4d4]">DFA Active</span>
        </div>
        <div className="flex items-center justify-between gap-1 overflow-x-auto py-1">
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-neutral-400">▶</span>
            <div className="w-8 h-8 rounded-full border-2 border-black bg-white flex items-center justify-center font-bold text-xs shadow-[1px_1px_0_#000]">
              q₀
            </div>
          </div>
          <div className="flex flex-col items-center px-1 shrink-0">
            <span className="text-[10px] bg-neutral-100 px-1 border border-black font-bold">[a-z]</span>
            <span className="text-xs">──▶</span>
          </div>
          <div className="w-8 h-8 rounded-full border-2 border-black bg-[#00f0ff] flex items-center justify-center font-bold text-xs shadow-[1px_1px_0_#000] shrink-0">
            q₁
          </div>
          <div className="flex flex-col items-center px-1 shrink-0">
            <span className="text-[10px] bg-neutral-100 px-1 border border-black font-bold">*</span>
            <span className="text-xs">──▶</span>
          </div>
          <div className="w-8 h-8 rounded-full border-2 border-black bg-white p-[2px] flex items-center justify-center shadow-[1px_1px_0_#000] shrink-0">
            <div className="w-full h-full rounded-full border border-black bg-[#00d66c] flex items-center justify-center font-bold text-xs">
              q₂
            </div>
          </div>
        </div>
        <div className="mt-2 text-[10px] text-neutral-600 bg-neutral-50 p-1 border border-black/10">
          δ*(q₀, w) ∈ F ⇔ input accepted
        </div>
      </div>
    );
  }

  if (variant === 'pipeline') {
    const steps = [
      { num: '01', title: 'Regex AST', desc: 'Recursive descent parse tree', symbol: 'R' },
      { num: '02', title: 'ε-NFA', desc: "Thompson's construction", symbol: 'N' },
      { num: '03', title: 'ε-Closure', desc: 'Reachability graph traversal', symbol: 'E' },
      { num: '04', title: 'DFA', desc: 'Powerset / subset construction', symbol: 'D' },
      { num: '05', title: 'Simulation', desc: 'Deterministic string matching', symbol: 'M' }
    ];

    return (
      <div className={`w-full overflow-x-auto ${className}`}>
        <div className="min-w-[650px] grid grid-cols-5 gap-3">
          {steps.map((step, idx) => (
            <div
              key={step.num}
              className={`border-2 border-black p-3 shadow-brutal-sm relative ${
                idx === 4 ? 'bg-[#00f0ff]' : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold bg-black text-white px-1.5 py-0.5">
                  {step.num}
                </span>
                <span className="font-mono text-sm font-black text-neutral-400">
                  {step.symbol}
                </span>
              </div>
              <h4 className="font-bold text-sm tracking-tight text-black">{step.title}</h4>
              <p className="text-xs text-neutral-600 font-mono mt-1 leading-snug">{step.desc}</p>
              {idx < 4 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-black text-white font-mono text-[10px] px-0.5 border border-black">
                  ➔
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Hero variant
  return (
    <div className={`border-2 border-black bg-white p-5 sm:p-6 shadow-brutal-lg ${className}`}>
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between border-b-2 border-black pb-3 mb-5 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full border border-black bg-[#ff3b30]" />
          <span className="w-3 h-3 rounded-full border border-black bg-[#ffe600]" />
          <span className="w-3 h-3 rounded-full border border-black bg-[#00d66c]" />
          <span className="ml-2 font-mono text-xs font-bold uppercase tracking-wider text-black">
            Automaton Schema // L(M) = (a|b)*abb
          </span>
        </div>
        <div className="font-mono text-xs font-bold bg-[#00f0ff] border-2 border-black px-2 py-0.5 shadow-[2px_2px_0_#000]">
          FLAT ENGINE 1.0
        </div>
      </div>

      {/* SVG Diagram Canvas */}
      <div className="relative bg-[#fafaf7] border-2 border-black p-4 sm:p-6 overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 py-4">
          {/* Start indicator & State 0 */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <span className="font-mono text-xs font-bold text-black uppercase">START</span>
              <span className="text-xl font-black text-black">▶</span>
            </div>
            <div className="group relative">
              <div className="w-14 h-14 rounded-full border-2 border-black bg-white flex flex-col items-center justify-center font-mono font-bold shadow-brutal transition-transform hover:scale-105">
                <span className="text-sm font-black">q₀</span>
                <span className="text-[9px] text-neutral-500">START</span>
              </div>
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 font-mono text-[10px] font-bold bg-white border border-black px-1 shadow-[1px_1px_0_#000] whitespace-nowrap">
                ⟲ a, b
              </div>
            </div>
          </div>

          {/* Transition 1 */}
          <div className="flex flex-col items-center justify-center flex-1 max-w-[120px]">
            <span className="font-mono text-xs font-bold bg-[#ffe600] border border-black px-2 py-0.5 shadow-[1px_1px_0_#000]">
              a
            </span>
            <div className="w-full flex items-center">
              <div className="h-0.5 bg-black flex-1" />
              <span className="text-black font-black -ml-1 text-sm">▶</span>
            </div>
            <span className="font-mono text-[9px] text-neutral-500 mt-0.5">δ(q₀, a)</span>
          </div>

          {/* State 1 */}
          <div className="group relative">
            <div className="w-14 h-14 rounded-full border-2 border-black bg-[#00f0ff] flex flex-col items-center justify-center font-mono font-bold shadow-brutal transition-transform hover:scale-105">
              <span className="text-sm font-black text-black">q₁</span>
              <span className="text-[9px] text-black/70">STATE</span>
            </div>
          </div>

          {/* Transition 2 */}
          <div className="flex flex-col items-center justify-center flex-1 max-w-[120px]">
            <span className="font-mono text-xs font-bold bg-[#ffe600] border border-black px-2 py-0.5 shadow-[1px_1px_0_#000]">
              b
            </span>
            <div className="w-full flex items-center">
              <div className="h-0.5 bg-black flex-1" />
              <span className="text-black font-black -ml-1 text-sm">▶</span>
            </div>
            <span className="font-mono text-[9px] text-neutral-500 mt-0.5">δ(q₁, b)</span>
          </div>

          {/* Accept State (q2) */}
          <div className="group relative">
            <div className="w-16 h-16 rounded-full border-2 border-black bg-white p-1 flex items-center justify-center shadow-brutal transition-transform hover:scale-105">
              <div className="w-full h-full rounded-full border-2 border-black bg-[#00d66c] flex flex-col items-center justify-center font-mono font-bold">
                <span className="text-sm font-black text-black">q₂</span>
                <span className="text-[8px] text-black font-extrabold uppercase">ACCEPT</span>
              </div>
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-mono text-[9px] font-bold text-neutral-600 whitespace-nowrap">
              q₂ ∈ F
            </div>
          </div>
        </div>

        {/* Technical Footer Data */}
        <div className="mt-4 pt-3 border-t-2 border-black flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="font-bold text-black">5-TUPLE:</span>
            <code className="bg-white px-2 py-0.5 border border-black text-neutral-800">
              M = (Q, Σ, δ, q₀, F)
            </code>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#00d66c] border border-black" />
            <span className="font-bold uppercase text-[11px] text-neutral-800">
              Zero native RegExp dependency
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
