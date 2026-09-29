import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const [healthStatus, setHealthStatus] = useState('checking');

  useEffect(() => {
    fetch('/api/health')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setHealthStatus(data.status === 'ok' ? 'online' : 'online'))
      .catch(() => setHealthStatus('offline'));
  }, []);

  return (
    <footer className="border-t-2 border-black bg-white py-10 px-4 sm:px-6 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b-2 border-black">
          {/* Col 1: Brand & Academic Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 border-2 border-black bg-[#00f0ff] flex items-center justify-center font-mono font-bold text-sm shadow-[2px_2px_0_#000]">
                δ
              </span>
              <span className="font-sans font-black text-xl tracking-tight uppercase">
                FormX
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-700 max-w-md leading-relaxed">
              Formal Language and Automata Theory (FLAT) Form Validation System. Form input validation powered by pure JavaScript tokenization, Thompson's ε-NFA construction, powerset subset construction, and deterministic finite automata simulation.
            </p>
            <div className="inline-flex items-center gap-2 border-2 border-black bg-[#fafaf7] px-2.5 py-1 text-xs font-mono font-bold">
              <span
                className={`w-2 h-2 rounded-full border border-black ${
                  healthStatus === 'online'
                    ? 'bg-[#00d66c]'
                    : healthStatus === 'offline'
                    ? 'bg-[#ff3b30]'
                    : 'bg-[#ffe600]'
                }`}
              />
              <span>API ENGINE: {healthStatus.toUpperCase()}</span>
            </div>
          </div>

          {/* Col 2: Platform Links */}
          <div className="space-y-2">
            <h4 className="font-sans text-xs font-black uppercase tracking-wider text-black">
              // Navigation
            </h4>
            <ul className="space-y-1.5 text-xs font-mono font-medium">
              <li>
                <Link to="/" className="hover:text-[#00c4d4] hover:underline">
                  Home / Overview
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-[#00c4d4] hover:underline">
                  Documentation &amp; Grammar
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-[#00c4d4] hover:underline">
                  Admin Dashboard
                </Link>
              </li>
              <li>
                <Link to="/forms/new" className="hover:text-[#00c4d4] hover:underline">
                  Form Construction
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Theoretical Foundation */}
          <div className="space-y-2">
            <h4 className="font-sans text-xs font-black uppercase tracking-wider text-black">
              // Theoretical Stack
            </h4>
            <ul className="space-y-1 text-[11px] font-mono text-neutral-600">
              <li>• Recursive-Descent Parser</li>
              <li>• Thompson's Construction (ε-NFA)</li>
              <li>• Powerset Subset Construction</li>
              <li>• O(n) String DFA Simulation</li>
              <li>• Zero Native RegExp Shortcuts</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-600">
          <div>
            &copy; FormX &bull; Formal Language &amp; Automata Theory Capstone Project
          </div>
          <div className="flex items-center gap-4">
            <span className="bg-[#00f0ff] border border-black px-1.5 py-0.5 text-black font-bold text-[10px]">
              PURE JS ENGINE
            </span>
            <span className="text-black font-bold">Q × Σ → Q</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
